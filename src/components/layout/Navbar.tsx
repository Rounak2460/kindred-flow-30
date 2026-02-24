import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Plus, User, LogOut, FileText, Award, X, Sparkles, ArrowRight, MessageSquare, ThumbsUp, Loader2, MessageCircle } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DMLogo from "@/components/DMLogo";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";
import { useSearch, type SearchResult } from "@/hooks/useSearch";
import { useUnreadCount } from "@/hooks/useChat";

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

export default function Navbar() {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, profile } = useAuth();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatUnread = useUnreadCount();

  // Search logic
  const [query, setQuery] = useState("");
  const instantDebounce = useRef<ReturnType<typeof setTimeout>>();
  const aiDebounce = useRef<ReturnType<typeof setTimeout>>();
  const { instantResults, aiResults, isInstantSearching, isAISearching, error, instantSearch, deepSearch, clear } = useSearch();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [aiTriggered, setAiTriggered] = useState(false);

  const results: SearchResult[] = aiResults.length > 0 ? aiResults : instantResults;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); openSearch(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!searchOpen) return;
    const handler = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        closeSearch();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [searchOpen]);

  const openSearch = () => {
    setSearchOpen(true);
    setQuery("");
    clear();
    setSelectedIndex(0);
    setAiTriggered(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery("");
    clear();
  };

  const handleQueryChange = useCallback(
    (val: string) => {
      setQuery(val);
      setSelectedIndex(0);
      setAiTriggered(false);
      clearTimeout(instantDebounce.current);
      clearTimeout(aiDebounce.current);
      if (!val.trim()) { clear(); return; }
      instantDebounce.current = setTimeout(() => instantSearch(val), 150);
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
    closeSearch();
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
    else if (e.key === "Escape") { closeSearch(); }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/"); };

  const initials = profile?.name
    ? profile.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const isLoading = isInstantSearching && results.length === 0;
  const showAIHint = query.trim() && !aiTriggered && !isAISearching && instantResults.length > 0;

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-200 bg-card",
      scrolled ? "shadow-soft border-b border-border/60" : "border-b border-border/40"
    )}>
      <div className="max-w-2xl mx-auto flex items-center h-14 px-4 gap-3">
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <DMLogo size={28} />
          <span className="hidden sm:inline text-sm font-semibold text-foreground tracking-tight">Digi Mitra</span>
          <span className="hidden sm:inline text-[9px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded-md tracking-wide">IIMB</span>
          {user && profile && (
            <span className="sm:hidden inline-flex items-center gap-1 text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-1">
              <Award className="h-3 w-3" />{profile.credits}
            </span>
          )}
        </Link>

        {/* Inline Search */}
        <div className="flex-1 flex justify-center relative" ref={searchContainerRef}>
          {searchOpen ? (
            <div className="relative w-full max-w-xs">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted border border-border text-xs">
                <Search className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search…"
                  className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/50 outline-none text-xs"
                />
                {(isInstantSearching || isAISearching) && (
                  <Loader2 className="h-3 w-3 text-primary animate-spin flex-shrink-0" />
                )}
                <button onClick={closeSearch} className="p-0.5 rounded hover:bg-border text-muted-foreground">
                  <X className="h-3 w-3" />
                </button>
              </div>

              {(query.trim() || results.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-border bg-card shadow-elevated max-h-[60vh] overflow-y-auto z-50">
                  {error && <div className="px-4 py-4 text-center"><p className="text-xs text-destructive">{error}</p></div>}

                  {query.trim() && !isLoading && results.length === 0 && !error && (
                    <div className="px-4 py-6 text-center">
                      <p className="text-xs text-muted-foreground">No results found</p>
                      {!aiTriggered && (
                        <button onClick={triggerAI} className="text-[11px] text-primary hover:underline mt-2 inline-flex items-center gap-1">
                          <Sparkles className="h-3 w-3" /> Try AI search
                        </button>
                      )}
                    </div>
                  )}

                  {isLoading && (
                    <div className="px-4 py-3 space-y-2.5">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-3 animate-pulse">
                          <div className="flex-1 space-y-1.5">
                            <div className="h-3 bg-muted rounded w-3/4" />
                            <div className="h-2.5 bg-muted/60 rounded w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {results.length > 0 && (
                    <div className="py-1">
                      <div className="px-3 py-1 flex items-center justify-between">
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
                            "w-full text-left px-3 py-2 flex gap-2.5 transition-colors",
                            i === selectedIndex ? "bg-muted" : "hover:bg-muted/50"
                          )}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">{result.title}</p>
                            {result.reason && (
                              <p className="text-[10px] text-primary/70 mt-0.5 line-clamp-1">{result.reason}</p>
                            )}
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={cn("text-[9px] px-1.5 py-0.5 rounded-md font-medium", CATEGORY_COLORS[result.category] || CATEGORY_COLORS.general)}>
                                {result.category.replace("_", " ")}
                              </span>
                              <span className="text-[9px] text-muted-foreground/40 flex items-center gap-0.5"><ThumbsUp className="h-2.5 w-2.5" />{result.upvote_count}</span>
                              <span className="text-[9px] text-muted-foreground/40 flex items-center gap-0.5"><MessageSquare className="h-2.5 w-2.5" />{result.comment_count}</span>
                              <span className="text-[9px] text-muted-foreground/30">{timeAgo(result.created_at)}</span>
                            </div>
                          </div>
                          <ArrowRight className={cn("h-3.5 w-3.5 mt-1 flex-shrink-0 transition-all", i === selectedIndex ? "text-primary opacity-100" : "opacity-0")} />
                        </button>
                      ))}
                    </div>
                  )}

                  {showAIHint && results.length > 0 && !isAISearching && (
                    <div className="px-3 py-1.5 border-t border-border/50">
                      <button onClick={triggerAI} className="text-[10px] text-muted-foreground/50 hover:text-primary transition-colors flex items-center gap-1 w-full justify-center py-0.5">
                        <Sparkles className="h-2.5 w-2.5" /> Press Enter for AI deep search
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <button onClick={openSearch} className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-muted hover:bg-border/60 text-muted-foreground text-xs transition-colors max-w-xs w-full">
              <Search className="h-3.5 w-3.5" />
              <span className="flex-1 text-left">Search…</span>
              <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-border bg-card px-1.5 text-[10px] font-mono text-muted-foreground/60">⌘K</kbd>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <ThemeToggle />
          {user && <NotificationBell />}
          {user && (
            <button onClick={() => navigate("/chat")} className="relative h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors">
              <MessageCircle className="h-4 w-4" />
              {chatUnread > 0 && (
                <div className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-[8px] font-bold text-primary-foreground">{chatUnread > 9 ? "9+" : chatUnread}</span>
                </div>
              )}
            </button>
          )}
          {user ? (
            <>
              <Button variant="ghost" size="sm" className="hidden md:flex h-8 w-8 p-0 text-muted-foreground hover:bg-muted rounded-lg" onClick={() => navigate("/forms")}><FileText className="h-4 w-4" /></Button>
              <Button size="sm" className="hidden md:flex gap-1.5 h-8 text-xs rounded-lg font-semibold" onClick={() => navigate("/submit")}><Plus className="h-3.5 w-3.5" /> Post</Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="ml-0.5 rounded-full ring-1 ring-border hover:ring-primary/40 transition-all">
                    <Avatar className="h-8 w-8"><AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">{initials}</AvatarFallback></Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  {profile && (
                    <div className="px-3 py-2.5">
                      <p className="font-semibold text-sm text-foreground">{profile.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Award className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs text-muted-foreground">{profile.credits} credits</span>
                        {profile.founding_contributor && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-medium ml-1">Founder</span>}
                      </div>
                    </div>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-xs" onClick={() => navigate("/profile")}><User className="h-3.5 w-3.5 mr-2" /> Profile</DropdownMenuItem>
                  <DropdownMenuItem className="text-xs" onClick={() => navigate("/chat")}><MessageCircle className="h-3.5 w-3.5 mr-2" /> Messages</DropdownMenuItem>
                  <DropdownMenuItem className="text-xs" onClick={() => navigate("/forms")}><FileText className="h-3.5 w-3.5 mr-2" /> Forms</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-xs" onClick={handleLogout}><LogOut className="h-3.5 w-3.5 mr-2" /> Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button size="sm" className="h-8 text-xs rounded-lg font-semibold px-4" onClick={() => navigate("/auth")}>Join</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
