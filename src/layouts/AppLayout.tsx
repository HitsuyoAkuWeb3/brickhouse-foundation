import { Outlet } from "react-router-dom";
import BottomNav from "../components/BottomNav";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#1A0010] text-[#FAF0F5] relative pb-[80px]">
      <main className="relative z-10 min-h-screen max-w-lg mx-auto w-full">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
