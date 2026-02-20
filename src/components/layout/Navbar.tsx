import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Plus, Search, Coins, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navLinks = [
  { label: "Academics", path: "/academics" },
  { label: "Exam Papers", path: "/papers" },
  { label: "Exchange", path: "/exchange" },
  { label: "Internships", path: "/internships" },
  { label: "Campus Life", path: "/campus" },
];

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
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-tight text-foreground">
          <span className="text-primary">D</span>igital Mitra
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? "text-primary bg-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-full text-sm font-medium">
                <Coins className="h-3.5 w-3.5 text-primary" />
                <span>{profile?.credits ?? 0}</span>
              </div>
              <Button size="sm" className="rounded-full gap-1.5" onClick={() => navigate("/contribute")}>
                <Plus className="h-3.5 w-3.5" />
                Contribute
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full">
                    <Avatar className="h-8 w-8 border-2 border-border">
                      <AvatarFallback className="text-xs font-medium bg-secondary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
                Sign in
              </Button>
              <Button size="sm" className="rounded-full" onClick={() => navigate("/auth?tab=signup")}>
                Get Started
              </Button>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl">
          <nav className="flex flex-col p-4 gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2.5 text-sm font-medium rounded-lg ${
                    isActive ? "text-primary bg-accent" : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="border-t border-border mt-2 pt-3">
              {user ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 px-3 py-2">
                    <Coins className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{profile?.credits ?? 0} credits</span>
                  </div>
                  <Button size="sm" className="rounded-full" onClick={() => { navigate("/contribute"); setMobileOpen(false); }}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> Contribute
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    Sign out
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { navigate("/auth"); setMobileOpen(false); }}>Sign in</Button>
                  <Button size="sm" className="rounded-full" onClick={() => { navigate("/auth?tab=signup"); setMobileOpen(false); }}>Get Started</Button>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
