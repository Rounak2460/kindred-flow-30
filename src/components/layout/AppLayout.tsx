import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import BottomNav from "./BottomNav";
import PageTransition from "./PageTransition";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-14 pb-20 md:pb-6">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <BottomNav />
    </div>
  );
}
