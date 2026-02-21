import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Compass, Plus, EyeOff, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import AISearchDialog from "@/components/search/AISearchDialog";
import ExploreSheet from "@/components/layout/ExploreSheet";

const tabs = [
  { key: "/", icon: Home, label: "Home" },
  { key: "/explore", icon: Compass, label: "Explore" },
  { key: "/submit", icon: Plus, label: "Post", accent: true },
  { key: "/gossip", icon: EyeOff, label: "Gossip" },
  { key: "/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);

  const handleTap = (key: string) => {
    if (key === "/explore") {
      setExploreOpen(true);
      return;
    }
    if ((key === "/submit" || key === "/profile") && !user) {
      navigate("/auth");
      return;
    }
    navigate(key);
  };

  return (
    <>
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/95 backdrop-blur-lg border-t border-border/50 safe-area-pb">
      <div className="flex items-center justify-around h-14 px-2">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.key || (tab.key === "/" && location.pathname === "/");
          return (
            <button
              key={tab.key}
              onClick={() => handleTap(tab.key)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 w-14 h-12 rounded-xl transition-colors",
                tab.accent
                  ? "text-primary-foreground"
                  : isActive
                    ? "text-primary"
                    : "text-muted-foreground"
              )}
            >
              {tab.accent ? (
                <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center shadow-glow">
                  <tab.icon className="h-5 w-5" />
                </div>
              ) : (
                <>
                  <tab.icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
                  <span className="text-[10px] font-medium">{tab.label}</span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </nav>
    <AISearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    <ExploreSheet open={exploreOpen} onOpenChange={setExploreOpen} />
    </>
  );
}
