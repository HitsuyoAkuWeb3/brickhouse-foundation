import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLessonProgress } from "@/hooks/useLessonProgress";
import { useDailyRitual } from "@/hooks/useDailyRitual";
import { motion } from "framer-motion";
import {
  Blocks, Sunrise, Diamond, Flame, CalendarClock, Sparkles,
  Sun, Clock, Moon, Play, CheckCircle2, type LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/brickhouse-logo.png";

type TimeWindow = "morning" | "midday" | "evening";

interface DashTile {
  icon: LucideIcon;
  label: string;
  link?: string;
  subtitle?: string;
  accent: string;
  iconBg: string;
}

const getTimeWindow = (): TimeWindow => {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "midday";
  return "evening";
};

const GREETINGS: Record<TimeWindow, string> = {
  morning: "Good Morning",
  midday: "Good Afternoon",
  evening: "Good Evening",
};

const RITUAL_META: Record<TimeWindow, { icon: LucideIcon; label: string; prompt: string; dbKey: string }> = {
  morning: { icon: Sun, label: "Morning Affirmation", prompt: "Start your day centered — gratitude, intention, joy.", dbKey: "morning_completed" },
  midday: { icon: Clock, label: "Midday Check-In", prompt: "Pause. Breathe. Realign with your goals.", dbKey: "midday_completed" },
  evening: { icon: Moon, label: "Evening Reflection", prompt: "Honor your brick. Release. Set tomorrow's intention.", dbKey: "evening_completed" },
};

const Dashboard = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [checkingProfile, setCheckingProfile] = useState(true);
  const { completedLessons } = useLessonProgress();
  const { ritual, streak } = useDailyRitual();

  const timeWindow = useMemo(() => getTimeWindow(), []);
  const greeting = GREETINGS[timeWindow];
  const featuredRitual = RITUAL_META[timeWindow];

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

  const ritualStatus = {
    morning: ritual?.morning_completed ?? false,
    midday: ritual?.midday_completed ?? false,
    evening: ritual?.evening_completed ?? false,
  };

  const todayComplete = Object.values(ritualStatus).filter(Boolean).length;
  const isFeaturedDone = ritualStatus[timeWindow];
  const allDone = todayComplete === 3;

  const tiles: DashTile[] = [
    { icon: Blocks, label: "My Bricks", link: "/bricks", subtitle: "Explore →", accent: "text-primary", iconBg: "bg-primary/15" },
    { icon: Sunrise, label: "Daily Ritual", link: "/daily-ritual", subtitle: todayComplete === 3 ? "Done ✓" : "Start →", accent: "text-accent", iconBg: "bg-accent/15" },
    { icon: Diamond, label: "Affirmations", link: "/affirmations", subtitle: "Explore →", accent: "text-primary", iconBg: "bg-primary/15" },
    { icon: Flame, label: "Passion Pick", link: "/passion-pick", subtitle: "Explore →", accent: "text-destructive", iconBg: "bg-destructive/10" },
    { icon: CalendarClock, label: "Scheduler", link: "/scheduler", subtitle: "Manage →", accent: "text-accent", iconBg: "bg-accent/10" },
    { icon: Sparkles, label: "Goddess Rx", link: "/goddess-rx", subtitle: "Explore →", accent: "text-secondary", iconBg: "bg-secondary/15" },
  ];

  const FeaturedIcon = featuredRitual.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-6 py-12 text-center">
      <img
        src={logo}
        alt="Brickhouse Mindset"
        className="w-48 mb-8 drop-shadow-[0_0_30px_hsl(330_100%_42%/0.3)]"
      />

      <h1 className="font-display text-4xl sm:text-5xl tracking-wider mb-3">
        {greeting}, <span className="text-accent">Queen</span>
      </h1>

      <p className="font-body text-muted-foreground max-w-md mb-6">
        Your Brickhouse is under construction.{" "}
        {completedLessons.length > 0 && `${completedLessons.length} lessons completed.`}
      </p>

      {/* Featured Ritual Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg mb-8"
      >
        <Link
          to="/daily-ritual"
          className={cn(
            "block w-full rounded-2xl border p-5 transition-all",
            allDone
              ? "bg-primary/10 border-primary/30"
              : isFeaturedDone
              ? "bg-primary/5 border-primary/20"
              : "bg-gradient-card border-border hover:border-primary/40 hover:shadow-[0_0_25px_hsl(var(--primary)/0.12)]"
          )}
        >
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
              allDone ? "bg-primary/20" : isFeaturedDone ? "bg-primary/15" : "bg-accent/15"
            )}>
              {allDone ? (
                <CheckCircle2 className="w-6 h-6 text-primary" />
              ) : (
                <FeaturedIcon className={cn("w-6 h-6", isFeaturedDone ? "text-primary" : "text-accent")} />
              )}
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-display text-sm tracking-wider">
                {allDone ? "All Rituals Complete 🔥" : featuredRitual.label}
              </h3>
              <p className="font-body text-[10px] text-muted-foreground mt-0.5">
                {allDone
                  ? "You laid every brick today. Rest well, Queen."
                  : isFeaturedDone
                  ? "Done ✓ — Next ritual awaits"
                  : featuredRitual.prompt}
              </p>
            </div>
            {!allDone && !isFeaturedDone && (
              <div className="flex items-center gap-1.5 font-body font-bold text-[10px] tracking-widest uppercase text-accent bg-accent/10 px-3 py-2 rounded-lg">
                Start <Play className="w-3 h-3" />
              </div>
            )}
          </div>

          {/* Mini ritual progress */}
          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border/50">
            {(["morning", "midday", "evening"] as const).map((w) => {
              const meta = RITUAL_META[w];
              const Icon = meta.icon;
              const done = ritualStatus[w];
              return (
                <div key={w} className={cn(
                  "flex items-center gap-1.5 flex-1 py-1.5 px-2 rounded-lg text-left",
                  done ? "bg-primary/10" : w === timeWindow ? "bg-foreground/[0.04]" : ""
                )}>
                  <Icon className={cn("w-3.5 h-3.5 shrink-0", done ? "text-primary" : "text-muted-foreground")} />
                  <span className={cn(
                    "font-body text-[9px] tracking-wider uppercase",
                    done ? "text-primary" : "text-muted-foreground"
                  )}>
                    {done ? "✓" : w === timeWindow ? "Now" : w}
                  </span>
                </div>
              );
            })}
          </div>
        </Link>
      </motion.div>

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
