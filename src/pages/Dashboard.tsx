import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLessonProgress } from "@/hooks/useLessonProgress";
import { useDailyRitual } from "@/hooks/useDailyRitual";
import { Blocks, Sunrise, Diamond, Flame, CalendarClock, Sparkles, type LucideIcon } from "lucide-react";
import logo from "@/assets/brickhouse-logo.png";

interface DashTile {
  icon: LucideIcon;
  label: string;
  link?: string;
  subtitle?: string;
  accent: string;
  iconBg: string;
}

const Dashboard = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [checkingProfile, setCheckingProfile] = useState(true);
  const { completedLessons } = useLessonProgress();
  const { ritual, streak } = useDailyRitual();

  useEffect(() => {
    if (loading || !user) return;

    const checkOnboarding = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("transformation_choice")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Profile check failed:", error.message);
          setCheckingProfile(false);
          return;
        }

        if (!data?.transformation_choice) {
          navigate("/onboarding", { replace: true });
          return;
        }
        setCheckingProfile(false);
      } catch {
        setCheckingProfile(false);
      }
    };

    checkOnboarding();
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  if (loading || checkingProfile) return null;

  const todayComplete = [
    ritual?.morning_affirmation,
    ritual?.midday_checkin,
    ritual?.evening_reflection,
  ].filter(Boolean).length;

  const tiles: DashTile[] = [
    { icon: Blocks, label: "My Bricks", link: "/bricks", subtitle: "Explore →", accent: "text-primary", iconBg: "bg-primary/15" },
    { icon: Sunrise, label: "Daily Ritual", link: "/daily-ritual", subtitle: todayComplete === 3 ? "Done ✓" : "Start →", accent: "text-accent", iconBg: "bg-accent/15" },
    { icon: Diamond, label: "Affirmations", link: "/affirmations", subtitle: "Explore →", accent: "text-primary", iconBg: "bg-primary/15" },
    { icon: Flame, label: "Passion Pick", link: "/passion-pick", subtitle: "Explore →", accent: "text-destructive", iconBg: "bg-destructive/10" },
    { icon: CalendarClock, label: "Scheduler", link: "/scheduler", subtitle: "Manage →", accent: "text-accent", iconBg: "bg-accent/10" },
    { icon: Sparkles, label: "Goddess Rx", link: "/goddess-rx", subtitle: "Explore →", accent: "text-secondary", iconBg: "bg-secondary/15" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12 text-center">
      <img
        src={logo}
        alt="Brickhouse Mindset"
        className="w-48 mb-8 drop-shadow-[0_0_30px_hsl(330_100%_42%/0.3)]"
      />

      <h1 className="font-display text-4xl sm:text-5xl tracking-wider mb-3">
        Welcome, <span className="text-accent">Queen</span>
      </h1>

      <p className="font-body text-muted-foreground max-w-md mb-4">
        Your Brickhouse is under construction.{" "}
        {completedLessons.length > 0 && `${completedLessons.length} lessons completed.`}
      </p>

      {/* Quick stats */}
      <div className="flex gap-4 mb-8">
        <div className="bg-gradient-card border border-border rounded-xl px-4 py-3 text-center">
          <div className="font-display text-2xl text-accent">{streak}</div>
          <div className="font-body text-[9px] text-muted-foreground uppercase tracking-wider">Day Streak</div>
        </div>
        <div className="bg-gradient-card border border-border rounded-xl px-4 py-3 text-center">
          <div className="font-display text-2xl text-primary">{completedLessons.length}</div>
          <div className="font-body text-[9px] text-muted-foreground uppercase tracking-wider">Lessons Done</div>
        </div>
        <div className="bg-gradient-card border border-border rounded-xl px-4 py-3 text-center">
          <div className="font-display text-2xl">{todayComplete}/3</div>
          <div className="font-body text-[9px] text-muted-foreground uppercase tracking-wider">Today's Ritual</div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg w-full mb-10">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          const isActive = !!tile.link;

          const content = (
            <>
              <div className={`w-11 h-11 rounded-xl ${tile.iconBg} flex items-center justify-center mx-auto mb-3`}>
                <Icon className={`w-5 h-5 ${tile.accent}`} />
              </div>
              <div className="font-display text-xs tracking-wider">{tile.label}</div>
              <div className={`text-[9px] mt-1 uppercase tracking-wider ${isActive ? "text-accent" : "text-muted-foreground"}`}>
                {isActive ? tile.subtitle : "Coming Soon"}
              </div>
            </>
          );

          return isActive ? (
            <Link
              key={tile.label}
              to={tile.link!}
              className="bg-gradient-card border border-border rounded-xl p-4 text-center hover:border-primary/40 transition-all hover:shadow-[0_0_20px_hsl(var(--primary)/0.15)]"
            >
              {content}
            </Link>
          ) : (
            <div
              key={tile.label}
              className="bg-gradient-card border border-border rounded-xl p-4 text-center opacity-50"
            >
              {content}
            </div>
          );
        })}
      </div>

      <button
        onClick={handleSignOut}
        className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
      >
        Sign out
      </button>
    </div>
  );
};

export default Dashboard;
