import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AISearchResult {
  id: string;
  title: string;
  body: string;
  category: string;
  flair: string | null;
  course_code: string | null;
  course_name: string | null;
  company_name: string | null;
  college_name: string | null;
  created_at: string;
  upvote_count: number;
  comment_count: number;
  reason: string;
  relevance: number;
}

export function useAISearch() {
  const [results, setResults] = useState<AISearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    // Abort previous request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsSearching(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("ai-search", {
        body: { query: query.trim() },
      });

      if (controller.signal.aborted) return;

      if (fnError) throw fnError;
      if (data?.error) {
        setError(data.error);
        setResults([]);
        return;
      }

      setResults(data?.results || []);
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      console.error("AI search error:", e);
      setError("Search failed. Try again.");
      setResults([]);
    } finally {
      if (!controller.signal.aborted) {
        setIsSearching(false);
      }
    }
  }, []);

  const clear = useCallback(() => {
    abortRef.current?.abort();
    setResults([]);
    setError(null);
    setIsSearching(false);
  }, []);

  return { results, isSearching, error, search, clear };
}
