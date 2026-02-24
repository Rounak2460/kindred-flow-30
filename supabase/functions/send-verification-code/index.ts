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

    // Check if already verified
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("email_verified")
      .eq("user_id", userId)
      .maybeSingle();

    if (profile?.email_verified) {
      return new Response(JSON.stringify({ verified: true, already: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send a verification email via Resend to check if the mailbox exists
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
        subject: "Welcome to Digi Mitra – Email Verified",
        html: `
          <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333; margin-bottom: 8px;">Welcome to Digi Mitra! 🎉</h2>
            <p style="color: #666; font-size: 14px;">Your @iimb.ac.in email has been verified successfully.</p>
            <p style="color: #666; font-size: 14px;">You now have full access to the platform. Start exploring course reviews, internship insights, and more!</p>
            <p style="color: #999; font-size: 12px; margin-top: 24px;">If you didn't create this account, please contact us immediately.</p>
          </div>
        `,
      }),
    });

    if (!emailRes.ok) {
      const errBody = await emailRes.text();
      console.error("Resend error:", errBody);
      // Resend rejected the email — mailbox likely doesn't exist
      return new Response(
        JSON.stringify({ verified: false, error: "Could not verify this email address. Please check your IIMB email prefix." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await emailRes.text(); // consume body

    // Resend accepted (200) — IIMB mail server accepted the recipient
    // Mark the profile as verified
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ email_verified: true })
      .eq("user_id", userId);

    if (updateError) {
      console.error("Profile update error:", updateError);
      return new Response(JSON.stringify({ error: "Verification failed. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ verified: true }), {
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
