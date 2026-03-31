import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sun, Clock, Moon, Sparkles, Heart, Flame, Play, CalendarClock, ChevronDown } from "lucide-react";
import { useDailyRitual } from "@/hooks/useDailyRitual";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { RitualPlayer, RitualType } from "@/components/RitualPlayer";
import { format } from "date-fns";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useSchedulerTasks } from "@/hooks/useSchedulerTasks";
import { useAffirmations } from "@/hooks/useAffirmations";
import { AudioPlayer } from "@/components/ui/AudioPlayer";

const JOY_ACTIVITIES = [
  "🎶 Dance to my favorite song",
  "☕ Enjoy a quiet cup of tea",
  "🚶‍♀️ Take a walk outside",
  "📞 Call someone I love",
  "🎨 Do something creative",
  "📚 Read a chapter",
  "🧘‍♀️ 10 min meditation",
  "🛒 Treat myself to something small",
];

const ritualItems = [
  {
    key: "morning_checkin" as RitualType,
    dbKey: "morning_completed" as const,
    icon: Sun,
    title: "Wake-up Reflection",
    subtitle: "Start your day centered",
    prompt: "Look in the mirror. Say your I AM declarations out loud. Mean every word.",
    time: "Morning",
    audio_url: "rituals/morning-ritual.m4a",
  },
  {
    key: "midday_checkin" as RitualType,
    dbKey: "midday_completed" as const,
    icon: Clock,
    title: "Mid-day Reflection",
    subtitle: "Reset your energy",
    prompt: "Pause. Breathe. Are you aligned with your goals right now? Code Switch if needed.",
    time: "Afternoon",
    audio_url: "rituals/midday-ritual.m4a",
  },
  {
    key: "evening_reflection" as RitualType,
    dbKey: "evening_completed" as const,
    icon: Moon,
    title: "Evening Reflection",
    subtitle: "Honor your progress",
    prompt: "What did you build today? What brick did you lay? Acknowledge it.",
    time: "Evening",
    audio_url: "rituals/evening-ritual.m4a",
  },
];

const DailyRitual = () => {
  const { ritual, isLoading, upsertRitual, streak } = useDailyRitual();
  const [joyMoment, setJoyMoment] = useState("");
  const [joyTime, setJoyTime] = useState("");
  const [showJoyPicker, setShowJoyPicker] = useState(false);
  const [gratitude, setGratitude] = useState("");
  const [showGratitudeHistory, setShowGratitudeHistory] = useState(false);
  const [activeRitual, setActiveRitual] = useState<RitualType | null>(null);
  const { dailyAffirmation } = useAffirmations();
  const [joyDate, setJoyDate] = useState("");
  const { trackEvent } = useAnalytics();
  const { addTask } = useSchedulerTasks();

  const completedCount = [
    ritual?.morning_completed,
    ritual?.midday_completed,
    ritual?.evening_completed,
  ].filter(Boolean).length;

  const handleRitualComplete = (data: Record<string, string | number>) => {
    if (!activeRitual) return;
    
    // Convert RitualType to DB column name
    const dbColumn = activeRitual === "morning_checkin" ? "morning_completed" :
                     activeRitual === "midday_checkin" ? "midday_completed" : "evening_completed";

    upsertRitual.mutate({ 
      [dbColumn]: true,
      ritual_data: data 
    });

    trackEvent('brick_completed', { ritual_type: activeRitual });
    setActiveRitual(null);
    toast.success("Brick laid 🧱");
  };

  const handleSaveJoy = (activity?: string) => {
    const text = activity || joyMoment.trim();
    if (!text) return;
    const joyData: Record<string, string> = { joy_moment: text };
    if (joyTime) joyData.joy_scheduled_time = joyTime;
    if (joyDate) joyData.joy_scheduled_date = joyDate;
    upsertRitual.mutate({ ritual_data: joyData });
    
    // Convert to schedulable item in Scheduler if time or date is provided
    if (joyTime || joyDate) {
      addTask.mutate({
        title: `Joy: ${text}`,
        category: "live_it",
        task_type: "joy_moment",
        time_of_day: joyTime ? `${joyTime}:00` : "09:00:00",
        scheduled_for: joyDate || undefined,
        reminder_type: joyDate ? "exact" : "daily",
        snooze_interval: "none",
        is_active: true,
      });
    }
    
    toast.success(joyTime ? `Joy moment scheduled for ${joyTime} ✨` : "Joy moment captured ✨");
    setJoyMoment("");
    setJoyTime("");
    setJoyDate("");
    setShowJoyPicker(false);
  };

  const handleSaveGratitude = () => {
    if (!gratitude.trim()) return;
    const note = gratitude.trim();
    // Append to history (cap at 30 entries, newest first)
    const existingHistory: string[] = ritual?.ritual_data?.gratitude_history || [];
    const updatedHistory = [note, ...existingHistory].slice(0, 30);
    upsertRitual.mutate({ 
      ritual_data: { 
        gratitude_note: note, 
        gratitude_history: updatedHistory,
      } 
    });
    toast.success("Gratitude logged 💛");
    setGratitude("");
  };

  if (isLoading) return null;

  // Retrieve joy and gratitude from ritual_data to display
  const savedJoy = ritual?.ritual_data?.joy_moment;
  const savedJoyTime = ritual?.ritual_data?.joy_scheduled_time;
  const savedJoyDate = ritual?.ritual_data?.joy_scheduled_date;
  const savedGratitude = ritual?.ritual_data?.gratitude_note;
  // Gratitude history from ritual_data (array of past entries)
  const gratitudeHistory: string[] = ritual?.ritual_data?.gratitude_history || [];

  return (
    <>
      <AnimatePresence>
        {activeRitual && (
          <RitualPlayer 
            type={activeRitual} 
            onClose={() => {
              trackEvent('ritual_abandoned', { ritual_type: activeRitual });
              setActiveRitual(null);
            }} 
            onComplete={handleRitualComplete} 
          />
        )}
      </AnimatePresence>

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
            {/* Slot 1: My Daily Affirmation */}
            <Link to="/affirmations">
              <motion.div
                layout
                className="bg-primary/5 border border-primary/20 hover:border-primary/50 rounded-xl overflow-hidden transition-all cursor-pointer"
              >
                <div className="w-full flex items-center gap-4 p-4 text-left">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all bg-primary/20 text-primary">
                    <Sun className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-sm tracking-wider text-primary">
                      My Daily Affirmation
                    </h3>
                    <p className="font-body text-[10px] sm:text-xs text-foreground/80 mt-1 italic">
                      "{dailyAffirmation?.text || "Build the foundation. Lay the brick. Claim the joy."}"
                    </p>
                  </div>
                </div>
              </motion.div>
            </Link>

            {ritualItems.map((item) => {
              const done = ritual?.[item.dbKey] ?? false;
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.key}
                  layout
                  className={cn(
                    "border rounded-xl overflow-hidden transition-all",
                    done
                      ? "bg-primary/10 border-primary/30"
                      : "bg-gradient-card border-border hover:border-primary/50"
                  )}
                >
                  <div className="w-full flex items-center gap-4 p-4 text-left">
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
                      <p className="font-body text-[10px] text-muted-foreground truncate">{item.subtitle}</p>
                    </div>
                    
                    {!done ? (
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => {
                            trackEvent('ritual_started', { ritual_type: item.key });
                            setActiveRitual(item.key);
                          }}
                          className="flex items-center justify-center gap-2 font-body font-bold text-xs tracking-widest uppercase bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2.5 rounded-xl transition-colors shadow-sm w-full sm:w-auto"
                        >
                          Start Journey <Play className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="font-body text-[10px] text-primary/70 uppercase tracking-wider font-bold">
                        ✓ Done
                      </div>
                    )}
                  </div>
                  {item.audio_url && (
                    <div className="px-4 pb-4">
                       <AudioPlayer src={item.audio_url} />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Joy Moment — Schedulable with Activity Picker */}
          <div className="bg-gradient-card border border-border rounded-xl p-5 mb-3">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-5 h-5 text-accent" />
              <div className="flex-1">
                <h3 className="font-display text-sm tracking-wider">Joy Moment</h3>
                <p className="font-body text-[10px] text-muted-foreground">Schedule one joyful thing today</p>
              </div>
              {!savedJoy && (
                <button
                  onClick={() => setShowJoyPicker(!showJoyPicker)}
                  className="flex items-center gap-1 text-[10px] text-accent font-body uppercase tracking-wider hover:text-primary transition-colors"
                >
                  <CalendarClock className="w-3.5 h-3.5" />
                  Pick
                </button>
              )}
            </div>
            {savedJoy ? (
              <div className="font-body text-sm text-foreground/80 bg-foreground/[0.04] rounded-lg p-3 border border-border/50">
                ✨ {savedJoy}
                {(savedJoyTime || savedJoyDate) && (
                  <span className="text-[10px] text-accent ml-2">
                    @ {savedJoyDate && format(new Date(savedJoyDate), "MMM do")} {savedJoyTime}
                  </span>
                )}
              </div>
            ) : (
              <>
                {/* Activity Picker */}
                <AnimatePresence>
                  {showJoyPicker && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mb-3"
                    >
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {JOY_ACTIVITIES.map((activity) => (
                          <button
                            key={activity}
                            onClick={() => handleSaveJoy(activity)}
                            className="text-left bg-foreground/[0.03] border border-border/50 rounded-lg px-3 py-2 font-body text-xs text-foreground/80 hover:border-accent/40 hover:bg-accent/5 transition-all"
                          >
                            {activity}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-2 mt-3 flex-wrap">
                  <input
                    type="text"
                    placeholder="Or type your own joy moment..."
                    value={joyMoment}
                    onChange={(e) => setJoyMoment(e.target.value)}
                    maxLength={200}
                    className="flex-1 min-w-[200px] bg-input border border-border rounded-lg px-3 py-2.5 font-body text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={joyDate}
                      onChange={(e) => setJoyDate(e.target.value)}
                      className="w-[110px] bg-input border border-border rounded-lg px-2 py-2.5 font-body text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                    <input
                      type="time"
                      value={joyTime}
                      onChange={(e) => setJoyTime(e.target.value)}
                      className="w-[90px] bg-input border border-border rounded-lg px-2 py-2.5 font-body text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                    <button
                      onClick={() => handleSaveJoy()}
                      disabled={!joyMoment.trim()}
                      className="bg-gradient-pink text-foreground font-body font-bold text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Gratitude */}
          <div className="bg-gradient-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <Heart className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <h3 className="font-display text-sm tracking-wider">Gratitude Note</h3>
                <p className="font-body text-[10px] text-muted-foreground">One thing you're grateful for today</p>
              </div>
              {gratitudeHistory.length > 0 && (
                <button
                  onClick={() => setShowGratitudeHistory(!showGratitudeHistory)}
                  className="flex items-center gap-1 text-[10px] text-primary font-body uppercase tracking-wider hover:text-accent transition-colors"
                >
                  History
                  <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showGratitudeHistory && "rotate-180")} />
                </button>
              )}
            </div>
            {savedGratitude ? (
              <div className="font-body text-sm text-foreground/80 bg-foreground/[0.04] rounded-lg p-3 border border-border/50">
                💛 {savedGratitude}
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
                  className="bg-gradient-pink text-foreground font-body font-bold text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  Save
                </button>
              </div>
            )}

            {/* Gratitude History */}
            <AnimatePresence>
              {showGratitudeHistory && gratitudeHistory.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 pt-3 border-t border-border/50 space-y-2">
                    <div className="font-body text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Past Gratitude</div>
                    {gratitudeHistory.slice(0, 7).map((note, i) => (
                      <div key={i} className="font-body text-xs text-foreground/60 bg-foreground/[0.02] rounded-lg px-3 py-2 border border-border/30">
                        💛 {note}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
};

export default DailyRitual;
