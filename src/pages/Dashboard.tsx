import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLessonProgress } from "@/hooks/useLessonProgress";
import { useDailyRitual } from "@/hooks/useDailyRitual";
import { motion, AnimatePresence } from "framer-motion";
import {
  Blocks, Sunrise, Diamond, CalendarClock, Sparkles,
  Sun, Clock, Moon, Play, CheckCircle2, MessageSquare, Heart, ArrowRight, Flame, Video, Users, type LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/brickhouse-logo.png";
import { brick1Lessons } from "@/data/brick1Lessons";

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
  morning: { icon: Sun, label: "Wake Up Affirmation", prompt: "Start your day centered — gratitude, intention, joy.", dbKey: "morning_completed" },
  midday: { icon: Clock, label: "Midday Check-In", prompt: "Pause. Breathe. Realign with your goals.", dbKey: "midday_completed" },
  evening: { icon: Moon, label: "Evening Reflection", prompt: "Honor your brick. Release. Set tomorrow’s intention.", dbKey: "evening_completed" },
};

// Extracted from brick1Lessons for variety
const AFFIRMATIONS = brick1Lessons
  .map(l => l.pullQuote || l.installedBelief)
  .filter(Boolean)
  .filter((v, i, a) => a.indexOf(v) === i);

const Dashboard = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [firstName, setFirstName] = useState("Brick House");
  const [primaryGoal, setPrimaryGoal] = useState("");
  const { completedLessons } = useLessonProgress();
  const { ritual, streak } = useDailyRitual();

  const [showWelcomeOverlay, setShowWelcomeOverlay] = useState(false);

  useEffect(() => {
    if (location.state && (location.state as { justFinishedOnboarding?: boolean }).justFinishedOnboarding) {
      setShowWelcomeOverlay(true);
      // Clear the state so it doesn't re-trigger on reload
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    if (showWelcomeOverlay) {
      const timer = setTimeout(() => setShowWelcomeOverlay(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showWelcomeOverlay]);

  const timeWindow = useMemo(() => getTimeWindow(), []);
  const greeting = GREETINGS[timeWindow];
  const featuredRitual = RITUAL_META[timeWindow];
  
  // Rotating affirmation based on date so it persists for the day
  const dailyAffirmation = useMemo(() => {
    const day = new Date().getDate();
    return AFFIRMATIONS[day % AFFIRMATIONS.length];
  }, []);

  useEffect(() => {
    if (loading || !user) return;

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, transformation_choice, goals")
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

        if (data.full_name) setFirstName(data.full_name.split(" ")[0]);
        if (data.goals && data.goals.length > 0) setPrimaryGoal(data.goals[0]);

        setCheckingProfile(false);
      } catch {
        setCheckingProfile(false);
      }
    };

    fetchProfile();
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
    { icon: CalendarClock, label: "Scheduler", link: "/scheduler", subtitle: "Manage →", accent: "text-accent", iconBg: "bg-accent/10" },
    { icon: Sparkles, label: "Goddess Rx", link: "/goddess-rx", subtitle: "Explore →", accent: "text-secondary", iconBg: "bg-secondary/15" },
  ];

  const FeaturedIcon = featuredRitual.icon;

  const calendlyUrl = import.meta.env.VITE_CALENDLY_URL || "#";
  const collectiveUrl = import.meta.env.VITE_COLLECTIVE_URL || "#";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 sm:px-6 pt-8 pb-20 overflow-x-hidden">
      
      {/* Top Header */}
      <div className="w-full max-w-lg mb-8 text-center flex flex-col items-center">
        <img
          src={logo}
          alt="Brickhouse Mindset"
          className="w-32 mb-6 drop-shadow-[0_0_30px_hsl(330_100%_42%/0.3)]"
        />
        <h1 className="font-display text-4xl sm:text-5xl tracking-wider mb-2">
          {greeting}, <span className="text-accent">{firstName}</span>
        </h1>
        <p className="font-body text-sm text-foreground/80 italic max-w-[280px]">
          "{dailyAffirmation}"
        </p>
      </div>

      {/* Pulsing Lesson 1 Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="w-full max-w-lg mb-8 relative group"
      >
        <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-primary to-accent opacity-30 blur-lg group-hover:opacity-60 transition duration-500 animate-pulse"></div>
        <Link 
          to="/bricks/self-love/lesson/1" 
          className="relative flex flex-col items-start bg-card/60 backdrop-blur-md border border-primary/30 rounded-3xl p-6 sm:p-8 overflow-hidden hover:bg-card/80 transition-all"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Blocks className="w-40 h-40 transform rotate-12 translate-x-10 -translate-y-10" />
          </div>
          
          <div className="font-body text-xs font-bold uppercase tracking-widest text-primary mb-2 bg-primary/10 px-3 py-1.5 rounded-full inline-block">
            Your Owner's Manual
          </div>
          
          <h2 className="font-display text-2xl sm:text-3xl text-foreground mb-3 text-left">
            Brick 1: <br />
            <span className="text-accent">Self-Love & Identity</span>
          </h2>
          
          <p className="font-body text-sm text-foreground/70 text-left mb-6 max-w-[280px]">
            The foundation of everything you will build. This is where we start.
          </p>

          <div className="flex items-center gap-2 font-display tracking-widest text-primary">
            TAP TO BEGIN <ArrowRight className="w-5 h-5" />
          </div>
        </Link>
      </motion.div>

      {/* Passion Pick */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-lg mb-6"
      >
        <Link
          to="/passion-pick"
          className="w-full rounded-2xl border border-destructive/30 bg-gradient-to-br from-destructive/10 to-card/60 backdrop-blur-md p-5 flex items-center gap-4 hover:border-destructive/50 transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_20px_hsl(var(--destructive)/0.15)]"
        >
          <div className="w-12 h-12 rounded-xl bg-destructive/15 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 text-destructive" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-display text-base tracking-wider">Passion Pick</h3>
            <p className="font-body text-[11px] text-muted-foreground mt-0.5">Discover what lights your fire today</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        </Link>
      </motion.div>

      {/* Coaching Block */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="w-full max-w-lg mb-6"
      >
        <a
          href={calendlyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 to-card/60 backdrop-blur-md p-5 flex items-center gap-4 hover:border-accent/50 transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_20px_hsl(var(--accent)/0.15)]"
        >
          <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
            <Video className="w-6 h-6 text-accent" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-display text-base tracking-wider">Book a Coaching Call</h3>
            <p className="font-body text-[11px] text-muted-foreground mt-0.5">1:1 with Che' — your Lifestyle Architect</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        </a>
      </motion.div>

      {/* Join the Collective */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="w-full max-w-lg mb-8"
      >
        <a
          href={collectiveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-card/60 backdrop-blur-md p-5 flex items-center gap-4 hover:border-primary/50 transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_20px_hsl(var(--primary)/0.15)]"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-display text-base tracking-wider">Join the Collective</h3>
            <p className="font-body text-[11px] text-muted-foreground mt-0.5">Connect with your Brickhouse sisters</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        </a>
      </motion.div>

      {/* Daily Ritual */}
      <div className="w-full max-w-lg mb-8">
        <h3 className="font-display tracking-widest text-lg mb-3 text-left w-full pl-2">Daily Ritual</h3>
        <Link
          to="/daily-ritual"
          className={cn(
            "w-full rounded-2xl border p-5 transition-all flex flex-col",
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
              <h3 className="font-display text-base tracking-wider">
                {allDone ? "Rituals Complete 🔥" : featuredRitual.label}
              </h3>
              <p className="font-body text-[11px] text-muted-foreground mt-0.5">
                {allDone
                  ? "You laid every brick today. Rest well, Brick House."
                  : isFeaturedDone
                  ? "Done ✓ — Next ritual awaits"
                  : featuredRitual.prompt}
              </p>
            </div>
            {!allDone && !isFeaturedDone && (
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/20 text-accent">
                <Play className="w-3.5 h-3.5 ml-0.5" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mt-5 pt-4 border-t border-border/50">
            {(["morning", "midday", "evening"] as const).map((w) => {
              const meta = RITUAL_META[w];
              const Icon = meta.icon;
              const done = ritualStatus[w];
              return (
                <div key={w} className={cn(
                  "flex items-center justify-center gap-1.5 flex-1 py-2 px-1 rounded-xl text-center border transition-colors",
                  done ? "bg-primary/10 border-primary/20" : w === timeWindow ? "bg-foreground/[0.04] border-border" : "bg-transparent border-transparent"
                )}>
                  <Icon className={cn("w-3.5 h-3.5 shrink-0", done ? "text-primary" : "text-muted-foreground")} />
                  <span className={cn(
                    "font-body text-[9px] tracking-widest uppercase",
                    done ? "text-primary font-bold" : "text-muted-foreground"
                  )}>
                    {done ? "Done" : w}
                  </span>
                </div>
              );
            })}
          </div>
        </Link>
      </div>

      {/* Toolbox Grid — 5 tiles (Passion Pick promoted above) */}
      <div className="w-full max-w-lg mb-10">
        <h3 className="font-display tracking-widest text-lg mb-3 text-left w-full pl-2">Your Toolbox</h3>
        <div className="grid grid-cols-3 gap-3">
          {tiles.slice(0, 3).map((tile) => {
            const Icon = tile.icon;
            return (
              <Link
                key={tile.label}
                to={tile.link!}
                className="bg-gradient-card border border-border rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-primary/40 transition-all hover:-translate-y-1 hover:shadow-[0_4px_15px_hsl(var(--primary)/0.1)] aspect-square"
              >
                <div className={`w-10 h-10 rounded-xl ${tile.iconBg} flex items-center justify-center mb-2`}>
                  <Icon className={`w-5 h-5 ${tile.accent}`} />
                </div>
                <div className="font-display text-xs tracking-wider leading-tight">{tile.label}</div>
              </Link>
            );
          })}
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          {tiles.slice(3).map((tile) => {
            const Icon = tile.icon;
            return (
              <Link
                key={tile.label}
                to={tile.link!}
                className="bg-gradient-card border border-border rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-primary/40 transition-all hover:-translate-y-1 hover:shadow-[0_4px_15px_hsl(var(--primary)/0.1)]"
              >
                <div className={`w-10 h-10 rounded-xl ${tile.iconBg} flex items-center justify-center mb-2`}>
                  <Icon className={`w-5 h-5 ${tile.accent}`} />
                </div>
                <div className="font-display text-xs tracking-wider leading-tight">{tile.label}</div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Goal Anchor — moved below the fold per Prompt 2 */}
      {primaryGoal && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg bg-card/40 border border-primary/20 rounded-2xl p-4 mb-8 flex items-start gap-4 shadow-[0_0_20px_hsl(330_100%_42%/0.08)]"
        >
          <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <div className="font-body text-[10px] uppercase tracking-widest text-muted-foreground mb-1">What I Am Building</div>
            <div className="font-display tracking-widest text-foreground leading-snug">{primaryGoal}</div>
          </div>
        </motion.div>
      )}

      {/* MVP Static Community Feed Preview */}
      <div className="w-full max-w-lg mb-12">
        <div className="flex items-center justify-between mb-3 pl-2 pr-2">
          <h3 className="font-display tracking-widest text-lg">Community Feed</h3>
          <span className="font-body text-[10px] uppercase tracking-widest text-accent bg-accent/10 px-2 py-1 rounded">Beta Preview</span>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden">
          
          {/* Post 1 */}
          <div className="pb-4 border-b border-border/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-xs font-bold text-white">SA</div>
                <div className="font-display text-sm">Sarah A.</div>
              </div>
              <div className="font-body text-[10px] text-muted-foreground">2 hrs ago</div>
            </div>
            <p className="font-body text-sm text-foreground/80 leading-relaxed indent-1">
              "Just finished Brick 1 Lesson 4. The part about 'what are you actually comparing yourself to' hit me so hard. I've been exhausted performing for an audience that doesn't even care."
            </p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Heart className="w-3.5 h-3.5" /> 12</div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><MessageSquare className="w-3.5 h-3.5" /> 3</div>
            </div>
          </div>
          
          {/* Post 2 */}
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">MJ</div>
                <div className="font-display text-sm text-muted-foreground">Mila J.</div>
              </div>
            </div>
            <p className="font-body text-sm text-muted-foreground blur-[2px] select-none">
              This is a placeholder text for another post. The community feed will be fully activated in Phase 2 of the Brickhouse application rollout. Keep building.
            </p>
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent z-10"></div>
          </div>
        </div>
      </div>

      {/* Quick Stats Banner & Sign out */}
      <div className="w-full max-w-lg mt-auto flex flex-col items-center">
        <div className="flex gap-4 mb-8 w-full">
          <div className="bg-accent/5 border border-accent/20 rounded-xl px-4 py-3 text-center flex-1">
            <div className="font-display text-xl text-accent">{streak}</div>
            <div className="font-body text-[9px] text-muted-foreground uppercase tracking-wider">Day Streak</div>
          </div>
          <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 text-center flex-1">
            <div className="font-display text-xl text-primary">{completedLessons.length}</div>
            <div className="font-body text-[9px] text-muted-foreground uppercase tracking-wider">Bricks Laid</div>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 pb-8"
        >
          Sign out
        </button>
      </div>

      <AnimatePresence>
        {showWelcomeOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-md"
          >
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="font-display text-4xl sm:text-5xl text-foreground mb-4 tracking-wider"
            >
              You're all set.
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="font-body text-xl text-primary tracking-widest uppercase"
            >
              Your space is ready.
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
