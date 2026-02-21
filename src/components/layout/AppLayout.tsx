import { Outlet } from "react-router-dom";
import { Linkedin } from "lucide-react";
import Navbar from "./Navbar";
import BottomNav from "./BottomNav";
import PageTransition from "./PageTransition";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="pt-14 pb-20 md:pb-6 flex-1">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <footer className="hidden md:flex items-center justify-center gap-2 py-6 text-xs text-muted-foreground border-t border-border/50">
        <span>Built by <span className="font-medium text-foreground">Ronnie T</span> (PGP 2026)</span>
        <span className="text-border">·</span>
        <a href="https://www.linkedin.com/in/rounak-tikmani-a79635169/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors font-medium">
          <Linkedin className="h-3.5 w-3.5" /> LinkedIn
        </a>
      </footer>
      <BottomNav />
    </div>
  );
}
