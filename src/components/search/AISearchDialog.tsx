import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Sparkles, ArrowRight, MessageSquare, ThumbsUp, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearch, type SearchResult } from "@/hooks/useSearch";
import { cn } from "@/lib/utils";

interface AISearchDialogProps {
  open: boolean;
  onClose: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  placements: "bg-blue-500/10 text-blue-500",
  academics: "bg-emerald-500/10 text-emerald-500",
  campus_life: "bg-amber-500/10 text-amber-500",
  confessions: "bg-pink-500/10 text-pink-500",
  advice: "bg-violet-500/10 text-violet-500",
  internships: "bg-cyan-500/10 text-cyan-500",
  exchange: "bg-orange-500/10 text-orange-500",
  general: "bg-muted text-muted-foreground",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}

export default function AISearchDialog({ open, onClose }: AISearchDialogProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const instantDebounce = useRef<ReturnType<typeof setTimeout>>();
  const aiDebounce = useRef<ReturnType<typeof setTimeout>>();
  const { instantResults, aiResults, isInstantSearching, isAISearching, error, instantSearch, deepSearch, clear } = useSearch();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [aiTriggered, setAiTriggered] = useState(false);

  // Merged results: AI results take priority when available
  const results: SearchResult[] = aiResults.length > 0 ? aiResults : instantResults;

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
      setQuery("");
      clear();
      setSelectedIndex(0);
      setAiTriggered(false);
    }
  }, [open, clear]);

  const handleQueryChange = useCallback(
    (val: string) => {
      setQuery(val);
      setSelectedIndex(0);
      setAiTriggered(false);
      clearTimeout(instantDebounce.current);
      clearTimeout(aiDebounce.current);
      if (!val.trim()) { clear(); return; }

      // Tier 1: instant DB search after 150ms
      instantDebounce.current = setTimeout(() => instantSearch(val), 150);

      // Tier 2: AI deep search after 1.5s idle
      aiDebounce.current = setTimeout(() => {
        setAiTriggered(true);
        deepSearch(val);
      }, 1500);
    },
    [instantSearch, deepSearch, clear]
  );

  const triggerAI = useCallback(() => {
    if (query.trim() && !aiTriggered) {
      clearTimeout(aiDebounce.current);
      setAiTriggered(true);
      deepSearch(query);
    }
  }, [query, aiTriggered, deepSearch]);

  const handleSelect = (result: SearchResult) => {
    onClose();
    navigate(`/post/${result.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex((i) => Math.min(i + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") {
      e.preventDefault();
      if (results[selectedIndex]) handleSelect(results[selectedIndex]);
      else triggerAI();
    }
    else if (e.key === "Escape") { onClose(); }
  };

  if (!open) return null;

  const isLoading = isInstantSearching && results.length === 0;
  const showAIHint = query.trim() && !aiTriggered && !isAISearching && instantResults.length >= 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="fixed inset-0 z-[100] bg-foreground/20 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-1/2 top-[12vh] z-[101] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2"
          >
            <div className="rounded-xl border border-border bg-card shadow-elevated overflow-hidden">
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search posts, courses, companies…"
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
                />
                {(isInstantSearching || isAISearching) && (
                  <Loader2 className="h-3.5 w-3.5 text-primary animate-spin flex-shrink-0" />
                )}
                {query && (
                  <button onClick={() => handleQueryChange("")} className="p-1 rounded-md hover:bg-muted text-muted-foreground">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-border bg-muted px-1.5 text-[10px] text-muted-foreground/60 font-mono">ESC</kbd>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto overscroll-contain">
                {!query.trim() && (
                  <div className="px-4 py-8 text-center">
                    <Search className="h-7 w-7 text-muted-foreground/20 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground/60">Type to search instantly</p>
                    <p className="text-xs text-muted-foreground/40 mt-1">Press Enter for AI-powered semantic search</p>
                  </div>
                )}

                {error && <div className="px-4 py-5 text-center"><p className="text-sm text-destructive">{error}</p></div>}

                {query.trim() && !isLoading && results.length === 0 && !error && (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm text-muted-foreground">No results found</p>
                    {!aiTriggered && (
                      <button onClick={triggerAI} className="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1">
                        <Sparkles className="h-3 w-3" /> Try AI search
                      </button>
                    )}
                  </div>
                )}

                {isLoading && (
                  <div className="px-4 py-4 space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-3 animate-pulse">
                        <div className="flex-1 space-y-2">
                          <div className="h-3.5 bg-muted rounded w-3/4" />
                          <div className="h-2.5 bg-muted/60 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {results.length > 0 && (
                  <div className="py-1">
                    <div className="px-4 py-1.5 flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground/40 font-medium">
                        {results.length} result{results.length !== 1 ? "s" : ""}
                        {aiResults.length > 0 && " · AI ranked"}
                      </span>
                      {isAISearching && <Loader2 className="h-3 w-3 text-primary animate-spin" />}
                    </div>
                    {results.map((result, i) => (
                      <button
                        key={result.id}
                        onClick={() => handleSelect(result)}
                        onMouseEnter={() => setSelectedIndex(i)}
                        className={cn(
                          "w-full text-left px-4 py-2.5 flex gap-3 transition-colors",
                          i === selectedIndex ? "bg-muted" : "hover:bg-muted/50"
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{result.title}</p>
                          {result.reason && (
                            <p className="text-xs text-primary/70 mt-0.5 line-clamp-1">{result.reason}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className={cn("text-[10px] px-1.5 py-0.5 rounded-md font-medium", CATEGORY_COLORS[result.category] || CATEGORY_COLORS.general)}>
                              {result.category.replace("_", " ")}
                            </span>
                            {result.flair && <span className="text-[10px] text-muted-foreground/50">{result.flair}</span>}
                            <span className="text-[10px] text-muted-foreground/40">·</span>
                            <span className="text-[10px] text-muted-foreground/40 flex items-center gap-0.5"><ThumbsUp className="h-2.5 w-2.5" />{result.upvote_count}</span>
                            <span className="text-[10px] text-muted-foreground/40 flex items-center gap-0.5"><MessageSquare className="h-2.5 w-2.5" />{result.comment_count}</span>
                            <span className="text-[10px] text-muted-foreground/30">{timeAgo(result.created_at)}</span>
                          </div>
                        </div>
                        <ArrowRight className={cn("h-4 w-4 mt-1 flex-shrink-0 transition-all", i === selectedIndex ? "text-primary opacity-100" : "opacity-0")} />
                      </button>
                    ))}
                  </div>
                )}

                {/* AI search hint */}
                {showAIHint && results.length > 0 && !isAISearching && (
                  <div className="px-4 py-2 border-t border-border/50">
                    <button onClick={triggerAI} className="text-[11px] text-muted-foreground/50 hover:text-primary transition-colors flex items-center gap-1.5 w-full justify-center py-1">
                      <Sparkles className="h-3 w-3" /> Press Enter or wait for AI-powered deep search
                    </button>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground/30">
                  <span className="flex items-center gap-1"><kbd className="font-mono border border-border rounded px-1">↑↓</kbd> navigate</span>
                  <span className="flex items-center gap-1"><kbd className="font-mono border border-border rounded px-1">↵</kbd> open</span>
                </div>
                {aiResults.length > 0 && (
                  <span className="text-[10px] text-primary/40 flex items-center gap-1"><Sparkles className="h-2.5 w-2.5" /> AI ranked</span>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
