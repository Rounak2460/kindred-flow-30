import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Plus, User, LogOut } from "lucide-react";
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
import NotificationBell from "@/components/NotificationBell";

export default function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const { user, profile } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/"); };

  const initials = profile?.name
    ? profile.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-200 bg-card",
      scrolled ? "border-b border-border/60" : "border-b border-border/40"
    )}>
      <div className="max-w-2xl mx-auto flex items-center h-14 px-4 gap-3">
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <DMLogo size={28} />
          <span className="text-sm font-semibold text-foreground tracking-tight">Digi Mitra</span>
        </Link>

        <div className="flex-1" />

        {/* Desktop search */}
        <button
          onClick={() => navigate("/search")}
          className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-muted hover:bg-border/60 text-muted-foreground text-xs transition-colors max-w-xs w-full"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="flex-1 text-left">Search…</span>
          <kbd className="inline-flex h-5 items-center rounded border border-border bg-card px-1.5 text-[10px] font-mono text-muted-foreground/60">⌘K</kbd>
        </button>

        {/* Mobile search icon */}
        <button
          onClick={() => navigate("/search")}
          className="md:hidden h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors"
        >
          <Search className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {user && <NotificationBell />}
          {user ? (
            <>
              <Button size="sm" className="hidden md:flex gap-1.5 h-8 text-xs rounded-lg font-semibold" onClick={() => navigate("/submit")}><Plus className="h-3.5 w-3.5" /> Post</Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="ml-0.5 rounded-full ring-1 ring-border hover:ring-primary/40 transition-all">
                    <Avatar className="h-8 w-8"><AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">{initials}</AvatarFallback></Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  {profile && (
                    <div className="px-3 py-2">
                      <p className="font-semibold text-sm text-foreground">{profile.name}</p>
                      <p className="text-xs text-muted-foreground">{profile.credits} credits</p>
                    </div>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-xs" onClick={() => navigate("/profile")}><User className="h-3.5 w-3.5 mr-2" /> Profile</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-xs" onClick={handleLogout}><LogOut className="h-3.5 w-3.5 mr-2" /> Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button size="sm" className="h-8 text-xs rounded-lg font-semibold px-4" onClick={() => navigate("/auth")}>Join</Button>
          )}
        </div>
      </div>
    </header>
  );
}
