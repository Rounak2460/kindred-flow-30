import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import dmLogo from "@/assets/digitalmitra-logo.png";

export default function FeedWelcome() {
  const navigate = useNavigate();

  return (
    <div className="rounded-xl bg-card border border-border p-6 sm:p-8 mb-6">
      <div className="flex items-center gap-2.5 mb-4">
        <img src={dmLogo} alt="Digi Mitra" className="h-8 w-8 rounded-full" />
        <span className="text-xs font-semibold text-primary uppercase tracking-wider">IIM Bangalore</span>
      </div>
      <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-2">
        Your Campus Companion
      </h2>
      <p className="text-sm text-muted-foreground max-w-md mb-5 leading-relaxed">
        Course reviews, internship intel, exam papers & campus tips — all anonymous, all honest.
      </p>
      <div className="flex items-center gap-3">
        <Button size="sm" className="rounded-lg font-semibold px-5" onClick={() => navigate("/auth?tab=signup")}>
          Get Started
        </Button>
        <Button size="sm" variant="ghost" className="rounded-lg text-muted-foreground" onClick={() => navigate("/auth")}>
          Sign In
        </Button>
      </div>
    </div>
  );
}
