import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the user
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;
    const email = claimsData.claims.email;

    if (!email?.endsWith("@iimb.ac.in")) {
      return new Response(JSON.stringify({ error: "Only @iimb.ac.in emails allowed" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service role client for DB operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Rate limit: check if a code was sent in the last 60 seconds
    const { data: recentCode } = await supabaseAdmin
      .from("verification_codes")
      .select("created_at")
      .eq("user_id", userId)
      .gte("created_at", new Date(Date.now() - 60_000).toISOString())
      .maybeSingle();

    if (recentCode) {
      return new Response(
        JSON.stringify({ error: "Please wait before requesting another code" }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate 6-digit code
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // Delete old codes for this user, insert new one
    await supabaseAdmin
      .from("verification_codes")
      .delete()
      .eq("user_id", userId);

    await supabaseAdmin
      .from("verification_codes")
      .insert({ user_id: userId, email, code, expires_at: expiresAt });

    // Send via Resend
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Digi Mitra <noreply@iimbdigimitra.org>",
        to: [email],
        subject: "Your Digi Mitra verification code",
        html: `
          <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333; margin-bottom: 8px;">Verify your email</h2>
            <p style="color: #666; font-size: 14px;">Enter this code in Digi Mitra to verify your @iimb.ac.in email:</p>
            <div style="background: #f4f4f5; border-radius: 8px; padding: 16px; text-align: center; margin: 16px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #111;">${code}</span>
            </div>
            <p style="color: #999; font-size: 12px;">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
          </div>
        `,
      }),
    });

    if (!emailRes.ok) {
      const errBody = await emailRes.text();
      console.error("Resend error:", errBody);
      // Fallback: return code directly so the UI can show it
      return new Response(JSON.stringify({ success: true, fallback: true, code }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await emailRes.text(); // consume body

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-verification-code error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
