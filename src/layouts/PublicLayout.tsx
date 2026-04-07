import { Outlet } from "react-router-dom";
import LandingFooter from "../components/LandingFooter";
import pageBg from "@/assets/bg-brickhouse.jpeg";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-brand-red/30 relative overflow-x-hidden">
      <div 
        className="fixed inset-0 z-[0] bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: `url(${pageBg})` }}
      >
        <div className="absolute inset-0 bg-black/85" />
      </div>
      <main className="relative z-10 w-full">
        <Outlet />
      </main>
      <div className="relative z-10 w-full">
        <LandingFooter />
      </div>
    </div>
  );
}
