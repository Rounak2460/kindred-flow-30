import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import dmLogo from "@/assets/digitalmitra-logo.png";

export default function FeedWelcome() {
  const navigate = useNavigate();

  return (
    <div className="relative rounded-2xl bg-card border border-border p-8 mb-6 overflow-hidden">
      {/* Red left accent bar */}
      <div className="absolute left-0 top-4 bottom-4 w-1 rounded-full bg-primary" />
      {/* Subtle dot pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03]" style={{
        backgroundImage: "radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)",
        backgroundSize: "12px 12px"
      }} />
      <div className="pl-4 relative">
        <div className="flex items-center gap-2.5 mb-4">
          <img src={dmLogo} alt="Digi Mitra" className="h-8 w-8 rounded-full" />
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">IIM Bangalore</span>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl text-foreground mb-2">
          Your Campus <span className="text-primary italic">Companion</span> 👋
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
          Course reviews, internship intel, exam papers & campus tips — all anonymous, all honest.
        </p>
        <div className="flex items-center gap-3">
          <Button size="sm" className="rounded-full font-semibold px-6" onClick={() => navigate("/auth?tab=signup")}>
            Get Started
          </Button>
          <Button size="sm" variant="ghost" className="rounded-full text-muted-foreground" onClick={() => navigate("/auth")}>
            Sign In
          </Button>
        </div>
      </div>
    </div>
  );
}
