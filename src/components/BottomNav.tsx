import { useLocation, useNavigate } from "react-router-dom";
import { BookOpen, Sunrise, Sparkles, CalendarDays, User } from "lucide-react";

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { to: "/bricks", label: "Bricks", icon: BookOpen },
    { to: "/daily-ritual", label: "Rituals", icon: Sunrise },
    { to: "/affirmations", label: "Affirmations", icon: Sparkles },
    { to: "/scheduler", label: "Scheduler", icon: CalendarDays },
    { to: "/dashboard", label: "Profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#1A0010]/90 backdrop-blur-md border-t border-[#D4006A]/20 pb-safe pb-4 pt-2 px-4 shadow-[0_-10px_40px_rgba(212,0,106,0.1)]">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = location.pathname.startsWith(tab.to);
          return (
            <button
              key={tab.to}
              onClick={() => navigate(tab.to)}
              className={`flex flex-col items-center justify-center w-16 gap-1 transition-all duration-300 ${
                isActive 
                  ? "text-[#D4006A] translate-y-[-2px]" 
                  : "text-[#FAF0F5]/50 hover:text-[#FAF0F5]"
              }`}
            >
              <div className={`p-2 rounded-full transition-colors ${isActive ? 'bg-[#D4006A]/10' : ''}`}>
                <tab.icon className={`w-6 h-6 ${isActive ? 'drop-shadow-[0_0_8px_rgba(212,0,106,0.5)]' : ''}`} />
              </div>
              <span className={`text-[10px] font-body tracking-wider ${isActive ? 'font-semibold' : 'font-normal'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
