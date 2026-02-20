import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MODERATION_PROMPT = `You are an AI content moderator for Digital Mitra, a knowledge-sharing platform for IIM Bangalore students. Your job is to review user-generated content and determine if it should be approved or rejected.

APPROVE content that is:
- Academic discussions, course reviews, study tips
- Internship/placement experiences and advice
- Exchange program reviews and tips
- Campus life discussions, recommendations
- Exam paper discussions (not sharing copyrighted material)
- Constructive criticism and honest opinions
- Professional networking and career advice
- Questions and help requests

REJECT content that contains:
- Hate speech, slurs, or discriminatory language (racism, sexism, casteism, homophobia)
- Personal attacks, bullying, harassment, or doxxing
- Sexually explicit or NSFW content
- Spam, promotional content, or advertising
- Sharing of confidential exam papers or plagiarized content
- Misinformation or deliberately misleading claims
- Personal information of others (phone numbers, addresses, private emails)
- Threats of violence or self-harm
- Illegal activities or substance abuse promotion
- Defamation of specific professors, staff, or students by name with unverified claims
- Content that violates academic integrity policies
- Trolling or deliberately inflammatory content with no constructive value
- External links to malicious or phishing websites
- Excessive profanity used in a hostile manner

EDGE CASES - Use judgment:
- Mild profanity in casual context → APPROVE with note
- Criticism of courses/professors without personal attacks → APPROVE
- Memes and humor that aren't offensive → APPROVE
- Political opinions expressed respectfully → APPROVE
- Rants about campus issues if not targeting individuals → APPROVE`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content_type, content_id, title, body } = await req.json();

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

    const contentToReview = title ? `Title: ${title}\n\nBody: ${body}` : body;

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
            { role: "system", content: MODERATION_PROMPT },
            {
              role: "user",
              content: `Review this ${content_type} and respond with a JSON object. Do not wrap in markdown code blocks.\n\n${contentToReview}`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "moderate_content",
                description: "Return the moderation decision for the content",
                parameters: {
                  type: "object",
                  properties: {
                    approved: {
                      type: "boolean",
                      description: "Whether the content is approved",
                    },
                    reason: {
                      type: "string",
                      description:
                        "Brief reason for the decision. If rejected, explain why.",
                    },
                    confidence: {
                      type: "number",
                      description: "Confidence score 0-1",
                    },
                  },
                  required: ["approved", "reason", "confidence"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "moderate_content" },
          },
        }),
      }
    );

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        // Rate limited - auto-approve to not block users
        console.warn("AI rate limited, auto-approving content");
        await updateModerationStatus(content_type, content_id, "approved", "Auto-approved (rate limit)");
        return new Response(
          JSON.stringify({ approved: true, reason: "Auto-approved" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      // On error, auto-approve to not block
      await updateModerationStatus(content_type, content_id, "approved", "Auto-approved (AI error)");
      return new Response(
        JSON.stringify({ approved: true, reason: "Auto-approved" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    let decision = { approved: true, reason: "Auto-approved (parse fallback)", confidence: 0.5 };

    if (toolCall?.function?.arguments) {
      try {
        decision = JSON.parse(toolCall.function.arguments);
      } catch {
        console.error("Failed to parse tool call arguments");
      }
    }

    const status = decision.approved ? "approved" : "rejected";
    await updateModerationStatus(content_type, content_id, status, decision.reason);

    return new Response(
      JSON.stringify({
        approved: decision.approved,
        reason: decision.reason,
        confidence: decision.confidence,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Moderation error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function updateModerationStatus(
  contentType: string,
  contentId: string,
  status: string,
  reason: string
) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const table = contentType === "post" ? "posts" : "comments";
  const { error } = await supabase
    .from(table)
    .update({ moderation_status: status, moderation_reason: reason })
    .eq("id", contentId);

  if (error) {
    console.error(`Failed to update ${table} moderation:`, error);
  }
}
