import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, X, Plus, User, LogOut, FileText, Bell, Award, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import dmLogo from "@/assets/digitalmitra-logo.png";
import { cn } from "@/lib/utils";

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const initials = profile?.name
    ? profile.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-200",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-soft"
          : "bg-background border-b border-border/30"
      )}
    >
      <div className="max-w-3xl mx-auto flex items-center h-14 px-4 gap-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <img src={dmLogo} alt="Digital Mitra" className="h-8 w-8 rounded-full" />
          <span className="hidden sm:inline text-sm font-semibold text-foreground tracking-tight">digitalmitra</span>
        </Link>

        {/* Expandable search */}
        <div className="flex-1 flex justify-center">
          {searchOpen ? (
            <div className="relative w-full max-w-sm animate-in fade-in-0 slide-in-from-top-1 duration-200">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                autoFocus
                placeholder="Search…"
                className="pl-9 pr-9 h-9 bg-secondary/80 border-border/50 text-sm rounded-full focus-visible:ring-1 focus-visible:ring-primary/30"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim()) {
                    navigate("/?q=" + encodeURIComponent((e.target as HTMLInputElement).value.trim()));
                    setSearchOpen(false);
                  }
                  if (e.key === "Escape") setSearchOpen(false);
                }}
                onBlur={() => setSearchOpen(false)}
              />
              <button onClick={() => setSearchOpen(false)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/60 hover:bg-secondary text-muted-foreground text-sm transition-colors max-w-xs w-full"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search…</span>
            </button>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Mobile search */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-accent transition-colors"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            <Search className="h-4 w-4" />
          </button>

          {user ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:flex h-9 w-9 p-0 text-muted-foreground hover:bg-accent rounded-full"
                onClick={() => navigate("/forms")}
              >
                <FileText className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:flex h-9 w-9 p-0 text-muted-foreground hover:bg-accent rounded-full"
                onClick={() => { import("sonner").then(m => m.toast.info("Notifications coming soon!")); }}
              >
                <Bell className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                className="hidden md:flex gap-1.5 h-8 text-xs rounded-full font-semibold"
                onClick={() => navigate("/submit")}
              >
                <Plus className="h-3.5 w-3.5" /> Post
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="ml-0.5 rounded-full ring-1 ring-border/50 hover:ring-muted-foreground/50 transition-all">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-[10px] font-semibold bg-primary/15 text-primary">{initials}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  {profile && (
                    <div className="px-3 py-2.5">
                      <p className="font-semibold text-sm text-foreground">{profile.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Award className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs text-muted-foreground">{profile.credits} karma</span>
                        {profile.founding_contributor && (
                          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium ml-1">Founder</span>
                        )}
                      </div>
                    </div>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-xs" onClick={() => navigate("/profile")}>
                    <User className="h-3.5 w-3.5 mr-2" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-xs" onClick={() => navigate("/forms")}>
                    <FileText className="h-3.5 w-3.5 mr-2" /> Forms
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-xs" onClick={handleLogout}>
                    <LogOut className="h-3.5 w-3.5 mr-2" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button size="sm" className="h-8 text-xs rounded-full font-semibold px-4" onClick={() => navigate("/auth")}>
              Join
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
