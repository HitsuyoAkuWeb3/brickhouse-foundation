import { Outlet } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import pageBg from "@/assets/bg-brickhouse.jpeg";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-transparent text-[#FAF0F5] relative pb-[80px] overflow-x-hidden">
      <div 
        className="fixed inset-0 z-[0] bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: `url(${pageBg})` }}
      >
        <div className="absolute inset-0 bg-[#1A0010]/85" />
      </div>
      <main className="relative z-10 min-h-screen max-w-lg mx-auto w-full">
        <Outlet />
      </main>
      <div className="relative z-10 w-full">
        <BottomNav />
      </div>
    </div>
  );
}
