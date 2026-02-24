import { useNavigate, useLocation } from "react-router-dom";
import { Home, LayoutGrid, Plus, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import ExploreSheet from "@/components/layout/ExploreSheet";
import { useState } from "react";
import { useUnreadCount } from "@/hooks/useChat";

const tabs = [
  { key: "/", icon: Home, label: "Home" },
  { key: "/explore", icon: LayoutGrid, label: "Sections" },
  { key: "/submit", icon: Plus, label: "Post", accent: true },
  { key: "/chat", icon: MessageCircle, label: "Chat" },
  { key: "/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [exploreOpen, setExploreOpen] = useState(false);
  const unreadCount = useUnreadCount();

  const handleTap = (key: string) => {
    if (key === "/explore") {
      setExploreOpen(true);
      return;
    }
    if ((key === "/submit" || key === "/profile" || key === "/chat") && !user) {
      navigate("/auth");
      return;
    }
    navigate(key);
  };

  return (
    <>
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/95 backdrop-blur-lg border-t border-border/60 safe-area-pb">
      <div className="flex items-center justify-around h-14 px-2">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.key || (tab.key === "/chat" && location.pathname.startsWith("/chat"));
          return (
            <button
              key={tab.key}
              onClick={() => handleTap(tab.key)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 w-14 h-12 rounded-xl transition-colors relative",
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
                  <div className="relative">
                    <tab.icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
                    {tab.key === "/chat" && unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1.5 h-3.5 w-3.5 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-[8px] font-bold text-primary-foreground">{unreadCount > 9 ? "9+" : unreadCount}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-medium">{tab.label}</span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </nav>
    <ExploreSheet open={exploreOpen} onOpenChange={setExploreOpen} />
    </>
  );
}
