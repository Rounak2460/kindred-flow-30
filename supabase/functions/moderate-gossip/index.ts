import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GOSSIP_MODERATION_PROMPT = `You are a strict AI content moderator for Gossip Central, an anonymous discussion space for IIM Bangalore students. This section requires EXTRA-STRINGENT moderation based on IIMB media policy and civil decency standards.

APPROVE content that is:
- General campus observations without identifying anyone
- Lighthearted, anonymous campus gossip that doesn't target individuals
- Opinions about campus culture, events, or policies (without naming people)
- Humor and memes that are not offensive or identifying

REJECT content that contains ANY of the following (STRICT - reject even borderline cases):
- ANY identifying information about individuals — including first names with contextual clues, nicknames, batch+section combos that narrow down identity, physical descriptions, or role descriptions specific enough to identify someone
- Unverified rumors about faculty, staff, administration, or specific students
- Content that could constitute defamation under Indian law (Section 499 IPC)
- Hate speech or content targeting protected characteristics (caste, religion, gender, sexuality, disability, regional origin)
- Sharing of private conversations, screenshots, DMs, or confidential institutional information
- Content that could damage IIMB's institutional reputation with false or unverified claims
- Sexually explicit content, sexual harassment, or objectification
- Bullying, harassment, threats, or intimidation
- Personal attacks even if the target is not named but identifiable
- Content promoting illegal activities, substance abuse, or academic dishonesty
- Doxxing or attempts to reveal anonymous users' identities
- Excessive profanity used aggressively
- Trolling or deliberately inflammatory content

IMPORTANT: When in doubt, REJECT. The threshold for approval is HIGH. If your confidence is below 0.7, REJECT the content. Protecting individual privacy and institutional integrity takes priority over free expression in this anonymous space.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content_type, content_id, body } = await req.json();

    if (!content_type || !content_id || !body) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: GOSSIP_MODERATION_PROMPT },
            {
              role: "user",
              content: `Review this anonymous gossip ${content_type} and respond with a moderation decision.\n\n${body}`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "moderate_content",
                description: "Return the moderation decision for the gossip content",
                parameters: {
                  type: "object",
                  properties: {
                    approved: { type: "boolean", description: "Whether the content is approved" },
                    reason: { type: "string", description: "Brief reason for the decision" },
                    confidence: { type: "number", description: "Confidence score 0-1" },
                  },
                  required: ["approved", "reason", "confidence"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "moderate_content" } },
        }),
      }
    );

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        // Rate limited — for gossip, we REJECT by default (strict)
        console.warn("AI rate limited, rejecting gossip content by default");
        await updateModerationStatus(content_type, content_id, "rejected", "Auto-rejected (rate limit - strict mode)");
        return new Response(
          JSON.stringify({ approved: false, reason: "Auto-rejected (strict mode)" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      await updateModerationStatus(content_type, content_id, "rejected", "Auto-rejected (AI error - strict mode)");
      return new Response(
        JSON.stringify({ approved: false, reason: "Auto-rejected (strict mode)" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    let decision = { approved: false, reason: "Auto-rejected (parse fallback)", confidence: 0 };

    if (toolCall?.function?.arguments) {
      try {
        decision = JSON.parse(toolCall.function.arguments);
      } catch {
        console.error("Failed to parse tool call arguments");
      }
    }

    // Strict threshold: reject if confidence < 0.7
    if (decision.approved && decision.confidence < 0.7) {
      decision.approved = false;
      decision.reason = `Low confidence (${decision.confidence.toFixed(2)}) - rejected under strict gossip policy. Original: ${decision.reason}`;
    }

    const status = decision.approved ? "approved" : "rejected";
    await updateModerationStatus(content_type, content_id, status, decision.reason);

    return new Response(
      JSON.stringify({ approved: decision.approved, reason: decision.reason, confidence: decision.confidence }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Gossip moderation error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function updateModerationStatus(contentType: string, contentId: string, status: string, reason: string) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const table = contentType === "gossip_post" ? "gossip_posts" : "gossip_comments";
  const { error } = await supabase
    .from(table)
    .update({ moderation_status: status, moderation_reason: reason })
    .eq("id", contentId);

  if (error) {
    console.error(`Failed to update ${table} moderation:`, error);
  }
}
