import { Outlet } from "react-router-dom";
import LandingFooter from "../components/LandingFooter";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-brand-red/30">
      <main className="relative z-10">
        <Outlet />
      </main>
      <LandingFooter />
    </div>
  );
}
