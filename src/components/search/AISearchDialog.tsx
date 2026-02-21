import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Sparkles, ArrowRight, MessageSquare, ThumbsUp, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAISearch, type AISearchResult } from "@/hooks/useAISearch";
import { cn } from "@/lib/utils";

interface AISearchDialogProps {
  open: boolean;
  onClose: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  placements: "bg-blue-500/15 text-blue-400",
  academics: "bg-emerald-500/15 text-emerald-400",
  campus_life: "bg-amber-500/15 text-amber-400",
  confessions: "bg-pink-500/15 text-pink-400",
  advice: "bg-violet-500/15 text-violet-400",
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
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const { results, isSearching, error, search, clear } = useAISearch();
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
      clear();
      setSelectedIndex(0);
    }
  }, [open, clear]);

  // Keyboard shortcut to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (!open) {
          // parent handles opening
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const handleQueryChange = useCallback(
    (val: string) => {
      setQuery(val);
      setSelectedIndex(0);
      clearTimeout(debounceRef.current);
      if (!val.trim()) {
        clear();
        return;
      }
      debounceRef.current = setTimeout(() => search(val), 350);
    },
    [search, clear]
  );

  const handleSelect = (result: AISearchResult) => {
    onClose();
    navigate(`/post/${result.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-1/2 top-[12vh] z-[101] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2"
          >
            <div className="rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden">
              {/* Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border/30">
                <div className="relative">
                  {isSearching ? (
                    <Loader2 className="h-4.5 w-4.5 text-primary animate-spin" />
                  ) : (
                    <Sparkles className="h-4.5 w-4.5 text-primary" />
                  )}
                </div>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything… e.g. 'best marketing electives'"
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
                />
                {query && (
                  <button
                    onClick={() => handleQueryChange("")}
                    className="p-1 rounded-full hover:bg-accent text-muted-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-border/50 bg-muted/50 px-1.5 text-[10px] text-muted-foreground font-mono">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto overscroll-contain">
                {!query.trim() && (
                  <div className="px-4 py-8 text-center">
                    <Sparkles className="h-8 w-8 text-primary/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">AI-powered search</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      Ask in natural language — "placement prep tips", "finance elective reviews"
                    </p>
                  </div>
                )}

                {error && (
                  <div className="px-4 py-6 text-center">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                {query.trim() && !isSearching && results.length === 0 && !error && (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm text-muted-foreground">No matches found</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Try rephrasing your query</p>
                  </div>
                )}

                {results.length > 0 && (
                  <div className="py-1.5">
                    <div className="px-4 py-1.5">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium">
                        {results.length} result{results.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {results.map((result, i) => (
                      <button
                        key={result.id}
                        onClick={() => handleSelect(result)}
                        onMouseEnter={() => setSelectedIndex(i)}
                        className={cn(
                          "w-full text-left px-4 py-3 flex gap-3 transition-colors group",
                          i === selectedIndex
                            ? "bg-accent/60"
                            : "hover:bg-accent/30"
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate leading-snug">
                            {result.title}
                          </p>
                          <p className="text-xs text-primary/70 mt-0.5 line-clamp-1">
                            {result.reason}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span
                              className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                                CATEGORY_COLORS[result.category] || CATEGORY_COLORS.general
                              )}
                            >
                              {result.category.replace("_", " ")}
                            </span>
                            {result.flair && (
                              <span className="text-[10px] text-muted-foreground/60">
                                {result.flair}
                              </span>
                            )}
                            <span className="text-[10px] text-muted-foreground/40">·</span>
                            <span className="text-[10px] text-muted-foreground/50 flex items-center gap-0.5">
                              <ThumbsUp className="h-2.5 w-2.5" /> {result.upvote_count}
                            </span>
                            <span className="text-[10px] text-muted-foreground/50 flex items-center gap-0.5">
                              <MessageSquare className="h-2.5 w-2.5" /> {result.comment_count}
                            </span>
                            <span className="text-[10px] text-muted-foreground/40">
                              {timeAgo(result.created_at)}
                            </span>
                          </div>
                        </div>
                        <ArrowRight
                          className={cn(
                            "h-4 w-4 mt-1 flex-shrink-0 transition-all",
                            i === selectedIndex
                              ? "text-primary opacity-100 translate-x-0"
                              : "text-muted-foreground opacity-0 -translate-x-1"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                )}

                {isSearching && (
                  <div className="px-4 py-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-3 py-3 animate-pulse">
                        <div className="flex-1 space-y-2">
                          <div className="h-3.5 bg-muted/50 rounded w-3/4" />
                          <div className="h-2.5 bg-muted/30 rounded w-1/2" />
                          <div className="h-2 bg-muted/20 rounded w-1/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-border/20 flex items-center justify-between">
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground/40">
                  <span className="flex items-center gap-1">
                    <kbd className="font-mono border border-border/30 rounded px-1">↑↓</kbd> navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="font-mono border border-border/30 rounded px-1">↵</kbd> open
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground/30 flex items-center gap-1">
                  <Sparkles className="h-2.5 w-2.5" /> AI powered
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
