import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Plus, User, LogOut, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Navbar() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          const { data } = await supabase
            .from("profiles")
            .select("name, credits, founding_contributor")
            .eq("user_id", session.user.id)
            .single();
          setProfile(data);
        } else {
          setProfile(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase
          .from("profiles")
          .select("name, credits, founding_contributor")
          .eq("user_id", session.user.id)
          .single()
          .then(({ data }) => setProfile(data));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-12 px-4 max-w-2xl">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1 text-sm font-bold tracking-tight text-foreground">
          <span className="text-primary text-base font-display">d/</span>
          <span className="hidden sm:inline">DigitalMitra</span>
          <span className="sm:hidden">DM</span>
        </Link>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground text-xs h-8"
            onClick={() => navigate("/forms")}
          >
            <FileText className="h-3.5 w-3.5 mr-1" />
            Forms
          </Button>
          {user ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="gap-1 h-8 text-xs"
                onClick={() => navigate("/submit")}
              >
                <Plus className="h-3 w-3" />
                Create Post
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="ml-1 rounded-full">
                    <Avatar className="h-7 w-7 border border-border">
                      <AvatarFallback className="text-[10px] font-medium bg-muted text-muted-foreground">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
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
            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => navigate("/auth")}>
                Log In
              </Button>
              <Button size="sm" className="h-8 text-xs" onClick={() => navigate("/auth?tab=signup")}>
                Sign Up
              </Button>
            </div>
          )}
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-1">
          {user && (
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => navigate("/submit")}>
              <Plus className="h-4 w-4" />
            </Button>
          )}
          <button className="p-1.5" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="flex flex-col p-2 gap-0.5">
            <Link to="/forms" onClick={() => setMobileOpen(false)}
              className="px-3 py-2 text-sm text-muted-foreground rounded hover:bg-muted">
              Forms
            </Link>
            <div className="border-t border-border mt-1 pt-1">
              {user ? (
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => { navigate("/profile"); setMobileOpen(false); }}
                    className="px-3 py-2 text-sm text-left rounded hover:bg-muted"
                  >
                    Profile
                  </button>
                  <button onClick={handleLogout} className="px-3 py-2 text-sm text-left text-muted-foreground rounded hover:bg-muted">
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-0.5">
                  <Button variant="ghost" size="sm" className="justify-start" onClick={() => { navigate("/auth"); setMobileOpen(false); }}>Log In</Button>
                  <Button size="sm" onClick={() => { navigate("/auth?tab=signup"); setMobileOpen(false); }}>Sign Up</Button>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
