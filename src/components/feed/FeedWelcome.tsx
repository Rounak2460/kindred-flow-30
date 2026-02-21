import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function FeedWelcome() {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-card to-card border border-border/50 p-6 mb-4">
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Welcome</span>
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl text-foreground mb-2">
          The Knowledge Layer of <span className="text-primary italic">IIM Bangalore</span>
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mb-4 leading-relaxed">
          Anonymous reviews, exam papers, exchange diaries, and internship insights — by students, for students.
        </p>
        <div className="flex items-center gap-3">
          <Button size="sm" className="rounded-full font-semibold px-5" onClick={() => navigate("/auth?tab=signup")}>
            Join with IIMB Email
          </Button>
          <Button size="sm" variant="ghost" className="rounded-full text-muted-foreground" onClick={() => navigate("/auth")}>
            Sign In
          </Button>
        </div>
      </div>
      {/* Decorative gradient blob */}
      <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-primary/5 blur-3xl" />
    </div>
  );
}
