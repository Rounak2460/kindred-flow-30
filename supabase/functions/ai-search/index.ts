import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    if (!query || typeof query !== "string" || !query.trim()) {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch all approved posts
    const { data: posts, error } = await supabase
      .from("posts")
      .select("id, title, body, category, flair, course_code, course_name, company_name, college_name, created_at, upvote_count, comment_count")
      .eq("moderation_status", "approved")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) throw error;
    if (!posts || posts.length === 0) {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build a compact post index for the AI
    const postIndex = posts.map((p, i) => {
      const meta = [p.category, p.flair, p.course_code, p.course_name, p.company_name, p.college_name]
        .filter(Boolean)
        .join(", ");
      return `[${i}] "${p.title}" | ${meta} | ${p.body.slice(0, 150)}`;
    }).join("\n");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a search engine for a college discussion forum. Given a user query and a list of posts, return the most relevant post indices ranked by relevance. Consider semantic meaning, not just keyword matching. Understand intent - if someone asks "best electives" find posts about elective recommendations, course reviews etc.`,
          },
          {
            role: "user",
            content: `User query: "${query.trim()}"\n\nPosts:\n${postIndex}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_search_results",
              description: "Return ranked search results with relevance explanations",
              parameters: {
                type: "object",
                properties: {
                  results: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        index: { type: "number", description: "Post index from the list" },
                        reason: { type: "string", description: "One-line reason why this matches (max 15 words)" },
                        relevance: { type: "number", description: "Relevance score 0-100" },
                      },
                      required: ["index", "reason", "relevance"],
                    },
                  },
                },
                required: ["results"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_search_results" } },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await aiResponse.text();
      console.error("AI error:", aiResponse.status, t);
      throw new Error("AI gateway error");
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(toolCall.function.arguments);
    } catch {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Map indices back to post data, take top 8
    const results = (parsed.results || [])
      .filter((r: any) => r.index >= 0 && r.index < posts.length && r.relevance > 20)
      .sort((a: any, b: any) => b.relevance - a.relevance)
      .slice(0, 8)
      .map((r: any) => ({
        ...posts[r.index],
        reason: r.reason,
        relevance: r.relevance,
      }));

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-search error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
