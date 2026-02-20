import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { AuthProvider } from "@/contexts/AuthContext";

export default function AppLayout() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-12">
          <Outlet />
        </main>
      </div>
    </AuthProvider>
  );
}
