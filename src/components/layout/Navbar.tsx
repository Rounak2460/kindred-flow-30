import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Plus, User, LogOut, FileText, Award, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import dmLogo from "@/assets/digitalmitra-logo.png";
import { cn } from "@/lib/utils";
import AISearchDialog from "@/components/search/AISearchDialog";

export default function Navbar() {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, profile } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/"); };

  const initials = profile?.name
    ? profile.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <>
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-200 bg-card",
        scrolled ? "shadow-soft border-b border-border/60" : "border-b border-border/40"
      )}>
        <div className="max-w-2xl mx-auto flex items-center h-14 px-4 gap-3">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img src={dmLogo} alt="Digi Mitra" className="h-7 w-7 rounded-full" />
            <span className="hidden sm:inline text-sm font-semibold text-foreground tracking-tight">Digi Mitra</span>
          </Link>

          <div className="flex-1 flex justify-center">
            <button onClick={() => setSearchOpen(true)} className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-muted hover:bg-border/60 text-muted-foreground text-xs transition-colors max-w-xs w-full">
              <Search className="h-3.5 w-3.5" />
              <span className="flex-1 text-left">Search…</span>
              <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-border bg-card px-1.5 text-[10px] font-mono text-muted-foreground/60">⌘K</kbd>
            </button>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {user ? (
              <>
                <Button variant="ghost" size="sm" className="hidden md:flex h-8 w-8 p-0 text-muted-foreground hover:bg-muted rounded-lg" onClick={() => navigate("/gossip")}><EyeOff className="h-4 w-4" /></Button>
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
                    <DropdownMenuItem className="text-xs" onClick={() => navigate("/gossip")}><EyeOff className="h-3.5 w-3.5 mr-2" /> Gossip</DropdownMenuItem>
                    <DropdownMenuItem className="text-xs" onClick={() => navigate("/forms")}><FileText className="h-3.5 w-3.5 mr-2" /> Forms</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-xs" onClick={handleLogout}><LogOut className="h-3.5 w-3.5 mr-2" /> Sign out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="hidden md:flex h-8 text-xs rounded-lg font-medium px-3 text-muted-foreground hover:text-foreground" onClick={() => navigate("/gossip")}>Gossip</Button>
                <Button size="sm" className="h-8 text-xs rounded-lg font-semibold px-4" onClick={() => navigate("/auth")}>Join</Button>
              </>
            )}
          </div>
        </div>
      </header>
      <AISearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
