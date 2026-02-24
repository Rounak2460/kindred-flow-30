import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowLeft, Sparkles, Loader2, X } from "lucide-react";
import { useSearch, type SearchResult } from "@/hooks/useSearch";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/mock-data";

const RECENT_KEY = "dm_recent_searches";
const MAX_RECENT = 5;

function getRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; }
}
function addRecent(q: string) {
  const list = getRecent().filter((r) => r !== q);
  list.unshift(q);
  localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, MAX_RECENT)));
}

export default function SearchPage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>(getRecent());
  const instantDebounce = useRef<ReturnType<typeof setTimeout>>();
  const aiDebounce = useRef<ReturnType<typeof setTimeout>>();
  const [aiTriggered, setAiTriggered] = useState(false);

  const { instantResults, aiResults, isInstantSearching, isAISearching, instantSearch, deepSearch, clear } = useSearch();

  const results: SearchResult[] = aiResults.length > 0 ? aiResults : instantResults;

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleChange = useCallback((val: string) => {
    setQuery(val);
    setAiTriggered(false);
    clearTimeout(instantDebounce.current);
    clearTimeout(aiDebounce.current);
    if (!val.trim()) { clear(); return; }
    instantDebounce.current = setTimeout(() => instantSearch(val), 150);
    aiDebounce.current = setTimeout(() => { setAiTriggered(true); deepSearch(val); }, 2000);
  }, [instantSearch, deepSearch, clear]);

  const handleSelect = (result: SearchResult) => {
    addRecent(query.trim());
    navigate(`/post/${result.id}`);
  };

  const triggerAI = () => {
    if (query.trim() && !aiTriggered) {
      clearTimeout(aiDebounce.current);
      setAiTriggered(true);
      deepSearch(query);
    }
  };

  const handleRecent = (q: string) => {
    setQuery(q);
    handleChange(q);
  };

  const isLoading = isInstantSearching && results.length === 0;
  const showDeep = query.trim() && !aiTriggered && !isAISearching && results.length > 0 && results.length < 3;

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground p-1">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border border-border">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Search posts, courses, companies…"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
          />
          {(isInstantSearching || isAISearching) && <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />}
          {query && (
            <button onClick={() => { setQuery(""); clear(); }} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Recent searches */}
      {!query.trim() && recent.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium mb-2">Recent</p>
          <div className="flex flex-wrap gap-1.5">
            {recent.map((r) => (
              <button key={r} onClick={() => handleRecent(r)} className="text-xs px-3 py-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors">
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3 mt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex gap-3 p-4 rounded-xl border border-border/50">
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-muted rounded w-3/4" />
                <div className="h-2.5 bg-muted/60 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium mb-2">
            {results.length} result{results.length !== 1 ? "s" : ""}{aiResults.length > 0 ? " · AI ranked" : ""}
          </p>
          {results.map((result) => (
            <button
              key={result.id}
              onClick={() => handleSelect(result)}
              className="w-full text-left p-3 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors"
            >
              <p className="text-sm font-medium text-foreground truncate">{result.title}</p>
              {result.reason && <p className="text-[11px] text-primary/70 mt-0.5 line-clamp-1">{result.reason}</p>}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{result.category}</span>
                <span className="text-[10px] text-muted-foreground">{timeAgo(result.created_at)}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {query.trim() && !isLoading && results.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">No results for "{query}"</p>
          {!aiTriggered && (
            <button onClick={triggerAI} className="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Try deep search
            </button>
          )}
        </div>
      )}

      {/* Deep search hint */}
      {showDeep && (
        <div className="text-center mt-4">
          <button onClick={triggerAI} className="text-[11px] text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> Deep search for more results
          </button>
        </div>
      )}
    </div>
  );
}
