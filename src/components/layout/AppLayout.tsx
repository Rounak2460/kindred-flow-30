import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-12">
        <Outlet />
      </main>
    </div>
  );
}
