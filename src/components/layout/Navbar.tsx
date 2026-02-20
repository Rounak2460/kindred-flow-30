import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Plus, User, LogOut, FileText, Search, Bell, Award } from "lucide-react";
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

export default function Navbar() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, profile } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const initials = profile?.name
    ? profile.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
      <div className="max-w-5xl mx-auto flex items-center h-12 px-3 gap-3">
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <img src={dmLogo} alt="Digital Mitra" className="h-8 w-8 rounded-full" />
          <span className="hidden sm:inline text-sm font-bold text-foreground tracking-tight">digitalmitra</span>
        </Link>

        {/* Desktop search */}
        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Digital Mitra"
              className="pl-9 h-9 bg-secondary border-none text-sm rounded-full hover:bg-accent focus-visible:bg-accent focus-visible:ring-1 focus-visible:ring-border"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim()) {
                  navigate("/?q=" + encodeURIComponent((e.target as HTMLInputElement).value.trim()));
                }
              }}
            />
          </div>
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-1 ml-auto">
          <Button variant="ghost" size="sm" className="text-muted-foreground text-xs h-9 px-3 hover:bg-accent" onClick={() => navigate("/forms")}>
            <FileText className="h-4 w-4" />
          </Button>
          {user ? (
            <>
              <Button variant="ghost" size="sm" className="h-9 px-3 text-muted-foreground hover:bg-accent" onClick={() => { import("sonner").then(m => m.toast.info("Notifications coming soon!")); }}>
                <Bell className="h-4 w-4" />
              </Button>
              <Button size="sm" className="gap-1.5 h-8 text-xs rounded-full" onClick={() => navigate("/submit")}>
                <Plus className="h-3.5 w-3.5" /> Create Post
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="ml-1 rounded-full ring-1 ring-border hover:ring-muted-foreground transition-colors">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-[10px] font-semibold bg-primary/20 text-primary">{initials}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  {profile && (
                    <div className="px-3 py-2">
                      <p className="font-medium text-sm text-foreground">{profile.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Award className="h-3.5 w-3.5 text-orange-500" />
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
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-xs" onClick={handleLogout}>
                    <LogOut className="h-3.5 w-3.5 mr-2" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs rounded-full" onClick={() => navigate("/auth")}>Log In</Button>
              <Button size="sm" className="h-8 text-xs rounded-full" onClick={() => navigate("/auth?tab=signup")}>Sign Up</Button>
            </div>
          )}
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-1 ml-auto">
          {user && (
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => navigate("/submit")}>
              <Plus className="h-4 w-4" />
            </Button>
          )}
          <button className="p-1.5 text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card">
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search Digital Mitra"
                className="pl-9 h-9 bg-secondary border-none text-sm rounded-full"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim()) {
                    navigate("/?q=" + encodeURIComponent((e.target as HTMLInputElement).value.trim()));
                    setMobileOpen(false);
                  }
                }}
              />
            </div>
          </div>
          <nav className="flex flex-col p-2 gap-0.5">
            <Link to="/forms" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-sm text-muted-foreground rounded hover:bg-accent flex items-center gap-2">
              <FileText className="h-4 w-4" /> Forms
            </Link>
            <div className="border-t border-border mt-1 pt-1">
              {user ? (
                <div className="flex flex-col gap-0.5">
                  {profile && (
                    <div className="px-3 py-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Award className="h-3.5 w-3.5 text-orange-500" />
                        <span className="font-medium text-foreground">{profile.credits} karma</span>
                      </div>
                    </div>
                  )}
                  <button onClick={() => { navigate("/profile"); setMobileOpen(false); }} className="px-3 py-2.5 text-sm text-left rounded hover:bg-accent flex items-center gap-2">
                    <User className="h-4 w-4" /> Profile
                  </button>
                  <button onClick={handleLogout} className="px-3 py-2.5 text-sm text-left text-muted-foreground rounded hover:bg-accent flex items-center gap-2">
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 p-2">
                  <Button variant="outline" size="sm" className="flex-1 rounded-full" onClick={() => { navigate("/auth"); setMobileOpen(false); }}>Log In</Button>
                  <Button size="sm" className="flex-1 rounded-full" onClick={() => { navigate("/auth?tab=signup"); setMobileOpen(false); }}>Sign Up</Button>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
