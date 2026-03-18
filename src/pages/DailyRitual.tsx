import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Sun, Clock, Moon, Sparkles, Heart, Flame } from "lucide-react";
import { useDailyRitual } from "@/hooks/useDailyRitual";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ritualItems = [
  {
    key: "morning_affirmation" as const,
    icon: Sun,
    title: "Morning Affirmation",
    subtitle: "Start your day centered",
    prompt: "Look in the mirror. Say your I AM declarations out loud. Mean every word.",
    time: "Morning",
  },
  {
    key: "midday_checkin" as const,
    icon: Clock,
    title: "Midday Check-In",
    subtitle: "Reset your energy",
    prompt: "Pause. Breathe. Are you aligned with your goals right now? Code Switch if needed.",
    time: "Afternoon",
  },
  {
    key: "evening_reflection" as const,
    icon: Moon,
    title: "Evening Reflection",
    subtitle: "Honor your progress",
    prompt: "What did you build today? What brick did you lay? Acknowledge it.",
    time: "Evening",
  },
];

const DailyRitual = () => {
  const { ritual, isLoading, upsertRitual, streak } = useDailyRitual();
  const [joyMoment, setJoyMoment] = useState("");
  const [gratitude, setGratitude] = useState("");
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const completedCount = [
    ritual?.morning_affirmation,
    ritual?.midday_checkin,
    ritual?.evening_reflection,
  ].filter(Boolean).length;

  const handleToggle = (key: "morning_affirmation" | "midday_checkin" | "evening_reflection") => {
    const current = ritual?.[key] ?? false;
    upsertRitual.mutate({ [key]: !current });
    if (!current) toast.success("Brick laid 🧱");
  };

  const handleSaveJoy = () => {
    if (!joyMoment.trim()) return;
    upsertRitual.mutate({ joy_moment: joyMoment.trim() });
    toast.success("Joy moment captured ✨");
  };

  const handleSaveGratitude = () => {
    if (!gratitude.trim()) return;
    upsertRitual.mutate({ gratitude_note: gratitude.trim() });
    toast.success("Gratitude logged 💛");
  };

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-display text-3xl sm:text-4xl tracking-wider">
            Daily <span className="text-accent">Ritual</span>
          </h1>
        </div>
        <p className="font-body text-sm text-muted-foreground mb-6 ml-8">
          Three checkpoints. One transformed day.
        </p>

        {/* Streak + Progress */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center gap-2 bg-gradient-card border border-border rounded-xl px-4 py-3">
            <Flame className="w-5 h-5 text-accent" />
            <div>
              <div className="font-display text-xl">{streak}</div>
              <div className="font-body text-[9px] text-muted-foreground uppercase tracking-wider">Day Streak</div>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5 font-body">
              <span>Today's Progress</span>
              <span>{completedCount}/3</span>
            </div>
            <div className="h-2 bg-foreground/[0.07] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                initial={{ width: 0 }}
                animate={{ width: `${(completedCount / 3) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>

        {/* Ritual Checkpoints */}
        <div className="space-y-3 mb-8">
          {ritualItems.map((item) => {
            const done = ritual?.[item.key] ?? false;
            const expanded = expandedItem === item.key;
            const Icon = item.icon;

            return (
              <motion.div
                key={item.key}
                layout
                className={cn(
                  "border rounded-xl overflow-hidden transition-all",
                  done
                    ? "bg-primary/10 border-primary/30"
                    : "bg-gradient-card border-border"
                )}
              >
                <button
                  onClick={() => setExpandedItem(expanded ? null : item.key)}
                  className="w-full flex items-center gap-4 p-4 text-left"
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all",
                      done ? "bg-primary/20 text-primary" : "bg-foreground/[0.05] text-muted-foreground"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={cn("font-display text-sm tracking-wider", done && "text-primary")}>
                      {item.title}
                    </h3>
                    <p className="font-body text-[10px] text-muted-foreground">{item.subtitle}</p>
                  </div>
                  <div className="font-body text-[9px] text-muted-foreground uppercase tracking-wider">
                    {item.time}
                  </div>
                </button>

                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4"
                  >
                    <p className="font-body text-xs text-muted-foreground leading-relaxed mb-4 pl-14">
                      {item.prompt}
                    </p>
                    <button
                      onClick={() => handleToggle(item.key)}
                      className={cn(
                        "ml-14 font-body font-bold text-xs tracking-wider uppercase px-5 py-2 rounded-lg transition-all",
                        done
                          ? "bg-foreground/10 text-muted-foreground hover:bg-foreground/20"
                          : "bg-gradient-pink text-foreground hover:opacity-90"
                      )}
                    >
                      {done ? "✓ Completed" : "Mark Complete"}
                    </button>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Joy Moment */}
        <div className="bg-gradient-card border border-border rounded-xl p-5 mb-3">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-5 h-5 text-accent" />
            <div>
              <h3 className="font-display text-sm tracking-wider">Joy Moment</h3>
              <p className="font-body text-[10px] text-muted-foreground">Schedule one joyful thing today</p>
            </div>
          </div>
          {ritual?.joy_moment ? (
            <div className="font-body text-sm text-foreground/80 bg-foreground/[0.04] rounded-lg p-3">
              ✨ {ritual.joy_moment}
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Dance to my favorite song at lunch"
                value={joyMoment}
                onChange={(e) => setJoyMoment(e.target.value)}
                maxLength={200}
                className="flex-1 bg-input border border-border rounded-lg px-3 py-2.5 font-body text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
              <button
                onClick={handleSaveJoy}
                disabled={!joyMoment.trim()}
                className="bg-gradient-pink text-foreground font-body font-bold text-xs px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                Save
              </button>
            </div>
          )}
        </div>

        {/* Gratitude */}
        <div className="bg-gradient-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <Heart className="w-5 h-5 text-primary" />
            <div>
              <h3 className="font-display text-sm tracking-wider">Gratitude Note</h3>
              <p className="font-body text-[10px] text-muted-foreground">One thing you're grateful for today</p>
            </div>
          </div>
          {ritual?.gratitude_note ? (
            <div className="font-body text-sm text-foreground/80 bg-foreground/[0.04] rounded-lg p-3">
              💛 {ritual.gratitude_note}
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. The way the sun felt on my face this morning"
                value={gratitude}
                onChange={(e) => setGratitude(e.target.value)}
                maxLength={300}
                className="flex-1 bg-input border border-border rounded-lg px-3 py-2.5 font-body text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
              <button
                onClick={handleSaveGratitude}
                disabled={!gratitude.trim()}
                className="bg-gradient-pink text-foreground font-body font-bold text-xs px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                Save
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyRitual;
