import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SearchResult {
  id: string;
  title: string;
  category: string;
  flair: string | null;
  course_code: string | null;
  course_name: string | null;
  company_name: string | null;
  college_name: string | null;
  created_at: string;
  upvote_count: number;
  comment_count: number;
  reason?: string;
  relevance?: number;
  body?: string;
}

const SELECT_FIELDS =
  "id, title, body, category, flair, course_code, course_name, company_name, college_name, created_at, upvote_count, comment_count";

export function useSearch() {
  const [instantResults, setInstantResults] = useState<SearchResult[]>([]);
  const [aiResults, setAiResults] = useState<SearchResult[]>([]);
  const [isInstantSearching, setIsInstantSearching] = useState(false);
  const [isAISearching, setIsAISearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const instantSearch = useCallback(async (query: string) => {
    const q = query.trim();
    if (!q) {
      setInstantResults([]);
      setError(null);
      return;
    }
    setIsInstantSearching(true);
    setError(null);
    try {
      const filter = [
        `title.ilike.%${q}%`,
        `course_code.ilike.%${q}%`,
        `course_name.ilike.%${q}%`,
        `company_name.ilike.%${q}%`,
        `college_name.ilike.%${q}%`,
        `flair.ilike.%${q}%`,
      ].join(",");

      const { data, error: err } = await supabase
        .from("posts")
        .select(SELECT_FIELDS)
        .eq("moderation_status", "approved")
        .or(filter)
        .order("upvote_count", { ascending: false })
        .limit(10);

      if (err) throw err;
      setInstantResults(data || []);
    } catch (e: any) {
      console.error("Instant search error:", e);
      setError("Search failed");
      setInstantResults([]);
    } finally {
      setIsInstantSearching(false);
    }
  }, []);

  const deepSearch = useCallback(async (query: string) => {
    const q = query.trim();
    if (!q) {
      setAiResults([]);
      return;
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsAISearching(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("ai-search", {
        body: { query: q },
      });
      if (controller.signal.aborted) return;
      if (fnError) throw fnError;
      if (data?.error) {
        setError(data.error);
        setAiResults([]);
        return;
      }
      setAiResults(data?.results || []);
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      console.error("AI search error:", e);
      setAiResults([]);
    } finally {
      if (!controller.signal.aborted) setIsAISearching(false);
    }
  }, []);

  const clear = useCallback(() => {
    abortRef.current?.abort();
    setInstantResults([]);
    setAiResults([]);
    setError(null);
    setIsInstantSearching(false);
    setIsAISearching(false);
  }, []);

  return { instantResults, aiResults, isInstantSearching, isAISearching, error, instantSearch, deepSearch, clear };
}
