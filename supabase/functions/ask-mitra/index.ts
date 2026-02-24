import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function extractKeywords(question: string): string[] {
  const stopWords = new Set(["the", "a", "an", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did", "will", "would", "could", "should", "may", "might", "can", "shall", "to", "of", "in", "for", "on", "with", "at", "by", "from", "as", "into", "about", "between", "through", "during", "before", "after", "above", "below", "and", "but", "or", "nor", "not", "so", "yet", "both", "either", "neither", "each", "every", "all", "any", "few", "more", "most", "other", "some", "such", "no", "only", "own", "same", "than", "too", "very", "just", "because", "if", "when", "where", "how", "what", "which", "who", "whom", "this", "that", "these", "those", "i", "me", "my", "we", "our", "you", "your", "he", "him", "his", "she", "her", "it", "its", "they", "them", "their", "tell", "give", "know", "think", "want", "need", "take", "get", "make", "go", "come", "see", "look", "find", "use", "say", "try", "ask", "work", "seem", "feel", "leave", "call", "keep", "let", "begin", "show", "hear", "play", "run", "move", "live", "believe", "bring", "happen", "write", "provide", "sit", "stand", "lose", "pay", "meet", "include", "continue", "set", "learn", "change", "lead", "understand", "watch", "follow", "stop", "create", "speak", "read", "allow", "add", "spend", "grow", "open", "walk", "win", "offer", "remember", "love", "consider", "appear", "buy", "wait", "serve", "die", "send", "expect", "build", "stay", "fall", "cut", "reach", "kill", "remain", "suggest", "raise", "pass", "sell", "require", "report", "decide", "pull"]);
  return question.toLowerCase().split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w)).slice(0, 5);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, history } = await req.json();
    if (!question) {
      return new Response(JSON.stringify({ error: "Question is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const keywords = extractKeywords(question);
    const searchPattern = keywords.map(k => `%${k}%`);

    // Fetch context in parallel
    const [postsRes, coursesRes, reviewsRes, tipsRes] = await Promise.all([
      // Posts
      supabase
        .from("posts")
        .select("title, body, category, course_name, company_name, college_name")
        .eq("moderation_status", "approved")
        .or(keywords.map(k => `title.ilike.%${k}%,body.ilike.%${k}%`).join(","))
        .order("upvote_count", { ascending: false })
        .limit(8),
      // Courses
      supabase
        .from("courses")
        .select("code, name, professor, domain, description, avg_rating")
        .or(keywords.map(k => `name.ilike.%${k}%,code.ilike.%${k}%,description.ilike.%${k}%,professor.ilike.%${k}%`).join(","))
        .limit(10),
      // Course reviews with course info
      supabase
        .from("course_reviews")
        .select("review_text, overall_rating, tags, tips, courses(code, name, professor)")
        .or(keywords.map(k => `review_text.ilike.%${k}%`).join(","))
        .limit(5),
      // Campus tips
      supabase
        .from("campus_tips")
        .select("name, category, tip_text, rating")
        .or(keywords.map(k => `name.ilike.%${k}%,tip_text.ilike.%${k}%`).join(","))
        .limit(5),
    ]);

    // Also fetch all courses if the question seems general
    let allCourses: any[] = [];
    const generalTerms = ["course", "elective", "term 4", "t4", "recommend", "easy", "chill", "best", "worst", "avoid", "take"];
    if (generalTerms.some(t => question.toLowerCase().includes(t))) {
      const { data } = await supabase
        .from("courses")
        .select("code, name, professor, domain, description, avg_rating, review_count")
        .order("avg_rating", { ascending: false })
        .limit(47);
      allCourses = data || [];
    }

    // Build context
    const contextParts: string[] = [];

    if (allCourses.length > 0) {
      contextParts.push("=== ALL AVAILABLE T4 COURSES ===");
      allCourses.forEach(c => {
        contextParts.push(`[Course] ${c.code} — ${c.name} | Prof: ${c.professor} | Domain: ${c.domain} | Rating: ${c.avg_rating}/5 (${c.review_count} reviews) | ${c.description}`);
      });
    }

    const posts = postsRes.data || [];
    if (posts.length > 0) {
      contextParts.push("\n=== COMMUNITY POSTS ===");
      posts.forEach(p => {
        const meta = [p.course_name, p.company_name, p.college_name].filter(Boolean).join(", ");
        contextParts.push(`[Post] ${p.title}${meta ? ` (${meta})` : ""}: ${p.body?.slice(0, 300)}`);
      });
    }

    const courses = coursesRes.data || [];
    if (courses.length > 0 && allCourses.length === 0) {
      contextParts.push("\n=== MATCHING COURSES ===");
      courses.forEach(c => {
        contextParts.push(`[Course] ${c.code} — ${c.name} by ${c.professor} (${c.domain}) | Rating: ${c.avg_rating}/5 | ${c.description}`);
      });
    }

    const reviews = reviewsRes.data || [];
    if (reviews.length > 0) {
      contextParts.push("\n=== PEER REVIEWS ===");
      reviews.forEach((r: any) => {
        const course = r.courses;
        contextParts.push(`[Review] ${course?.code || "?"} ${course?.name || "?"} (${r.overall_rating}/5): ${r.review_text}${r.tips ? ` TIP: ${r.tips}` : ""}`);
      });
    }

    const tips = tipsRes.data || [];
    if (tips.length > 0) {
      contextParts.push("\n=== CAMPUS TIPS ===");
      tips.forEach(t => {
        contextParts.push(`[Tip] ${t.name} (${t.category}, ${t.rating}/5): ${t.tip_text}`);
      });
    }

    const context = contextParts.join("\n");

    const systemPrompt = `You are Mitra Ronnie, a friendly and knowledgeable AI assistant for IIM Bangalore students on the Digi Mitra platform. 

RULES:
1. Answer questions using ONLY the platform data provided below. Do NOT make up information about courses, professors, companies, or campus life.
2. If the data doesn't contain enough info, say so honestly and suggest the student check Digi Mitra for more details.
3. Be conversational, use emojis sparingly, and keep responses concise but helpful.
4. When discussing courses, always mention the course code, professor name, and relevant peer sentiment.
5. For course recommendations, consider the student's context (workload, interest, scoring goals).
6. Use markdown formatting for readability.

PLATFORM DATA:
${context || "No matching data found for this query."}`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []),
      { role: "user", content: question },
    ];

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        stream: true,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(aiResponse.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ask-mitra error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
