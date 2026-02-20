import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Plus, Coins, User, LogOut, FileText } from "lucide-react";
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
  const location = useLocation();
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
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto flex items-center justify-between h-14 px-4 max-w-3xl">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1.5 font-display text-lg font-bold tracking-tight text-foreground">
          <span className="text-primary">D</span>M
        </Link>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground gap-1.5 text-xs"
            onClick={() => navigate("/forms")}
          >
            <FileText className="h-3.5 w-3.5" />
            Forms
          </Button>
          {user ? (
            <>
              <div className="flex items-center gap-1.5 bg-secondary px-2.5 py-1 rounded-full text-xs font-medium">
                <Coins className="h-3 w-3 text-primary" />
                <span>{profile?.credits ?? 0}</span>
              </div>
              <Button size="sm" className="rounded-full gap-1.5 h-8 text-xs" onClick={() => navigate("/submit")}>
                <Plus className="h-3 w-3" />
                Post
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full">
                    <Avatar className="h-7 w-7 border border-border">
                      <AvatarFallback className="text-[10px] font-medium bg-secondary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="h-3.5 w-3.5 mr-2" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-3.5 w-3.5 mr-2" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => navigate("/auth")}>
                Sign in
              </Button>
              <Button size="sm" className="rounded-full h-8 text-xs" onClick={() => navigate("/auth?tab=signup")}>
                Join IIMB
              </Button>
            </div>
          )}
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-2">
          {user && (
            <Button size="sm" className="rounded-full gap-1 h-7 text-xs px-2.5" onClick={() => navigate("/submit")}>
              <Plus className="h-3 w-3" />
            </Button>
          )}
          <button className="p-1.5" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl">
          <nav className="flex flex-col p-3 gap-1">
            <Link to="/forms" onClick={() => setMobileOpen(false)}
              className="px-3 py-2 text-sm text-muted-foreground rounded-lg hover:bg-muted">
              📋 Data Forms
            </Link>
            <div className="border-t border-border mt-1 pt-2">
              {user ? (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 px-3 py-2 text-sm">
                    <Coins className="h-3.5 w-3.5 text-primary" />
                    {profile?.credits ?? 0} credits
                  </div>
                  <button
                    onClick={() => { navigate("/profile"); setMobileOpen(false); }}
                    className="px-3 py-2 text-sm text-left rounded-lg hover:bg-muted"
                  >
                    Profile
                  </button>
                  <button onClick={handleLogout} className="px-3 py-2 text-sm text-left text-muted-foreground rounded-lg hover:bg-muted">
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <Button variant="ghost" size="sm" className="justify-start" onClick={() => { navigate("/auth"); setMobileOpen(false); }}>Sign in</Button>
                  <Button size="sm" className="rounded-full" onClick={() => { navigate("/auth?tab=signup"); setMobileOpen(false); }}>Join IIMB</Button>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
