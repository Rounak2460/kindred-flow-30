import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import dmLogo from "@/assets/digitalmitra-logo.png";

export default function FeedWelcome() {
  const navigate = useNavigate();

  return (
    <div className="relative rounded-2xl bg-card border border-border p-6 mb-4">
      {/* Red left accent bar */}
      <div className="absolute left-0 top-4 bottom-4 w-1 rounded-full bg-primary" />
      <div className="pl-4">
        <div className="flex items-center gap-2.5 mb-3">
          <img src={dmLogo} alt="IIMB" className="h-7 w-7 rounded-full" />
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">IIM Bangalore</span>
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl text-foreground mb-2">
          The Knowledge Layer of <span className="text-primary italic">IIM Bangalore</span>
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mb-5 leading-relaxed">
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
    </div>
  );
}
