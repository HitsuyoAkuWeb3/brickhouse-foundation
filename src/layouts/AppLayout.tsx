import { Outlet } from "react-router-dom";
import FloatingNav from "../components/FloatingNav";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-brand-red/30 pl-0 md:pl-20 pb-20 md:pb-0">
      <FloatingNav />
      {/* App Sidebar would go here eventually */}
      <main className="relative z-10 min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
