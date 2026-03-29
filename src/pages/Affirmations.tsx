import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAffirmations } from "@/hooks/useAffirmations";
import { useSchedulerTasks } from "@/hooks/useSchedulerTasks";
import { bricks } from "@/data/bricksContent";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Plus, Trash2, Sparkles, ChevronDown, ArrowLeft, Lock, Headphones, X, Clock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AudioPlayer } from "@/components/ui/AudioPlayer";
import { AffirmationTeleprompter } from "@/components/AffirmationTeleprompter";

const Affirmations = () => {
  const { user } = useAuth();
  const [selectedBrick, setSelectedBrick] = useState<number | undefined>(undefined);
  const [newAffirmation, setNewAffirmation] = useState("");
  const [showBuilder, setShowBuilder] = useState(false);
  const [expandedBrick, setExpandedBrick] = useState<number | null>(null);
  const [practiceMode, setPracticeMode] = useState(false);
  const [schedulingId, setSchedulingId] = useState<string | null>(null);
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const { addTask: addSchedulerTask } = useSchedulerTasks();

  const { brickAffirmations, userAffirmations, dailyAffirmation, addAffirmation, toggleFavorite, deleteAffirmation, isLoading } = useAffirmations(selectedBrick);

  const handleAdd = () => {
    const text = newAffirmation.trim();
    if (!text) return;
    if (!text.toLowerCase().startsWith("i am") && !text.toLowerCase().startsWith("i ")) {
      toast.error("Start your affirmation with 'I am' or 'I'");
      return;
    }
    addAffirmation.mutate({ affirmation: text, brickId: selectedBrick });
    setNewAffirmation("");
    toast.success("Affirmation added 💎");
  };

  // Group brick affirmations by brick_id
  const groupedByBrick = brickAffirmations.reduce((acc, a) => {
    const key = a.brick_id;
    if (key == null) return acc;
    const numKey = Number(key);
    if (!acc[numKey]) acc[numKey] = [];
    acc[numKey].push(a);
    return acc;
  }, {} as Record<number, typeof brickAffirmations>);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="font-display text-sm text-muted-foreground tracking-wider animate-pulse">Loading affirmations...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-5 py-10 pb-24">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-display text-3xl tracking-wider">Affirmations</h1>
            <p className="font-body text-sm text-muted-foreground">Speak your truth into existence</p>
          </div>
        </div>

        {/* Daily Featured */}
        {dailyAffirmation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden bg-gradient-card border border-primary/20 rounded-2xl p-6 mb-8"
          >
            <div className="absolute top-3 right-3">
              <Sparkles className="w-5 h-5 text-accent/60" />
            </div>
            <div className="font-body text-[10px] text-accent uppercase tracking-widest mb-3">
              Today's Affirmation
            </div>
            <p className="font-display text-xl leading-relaxed tracking-wide">
              "{dailyAffirmation.text.replace('Audio Affirmation: ', '')}"
            </p>
            {dailyAffirmation.audio_url && (
              <AudioPlayer src={dailyAffirmation.audio_url} />
            )}
            <div className="mt-3 text-[10px] text-muted-foreground uppercase tracking-wider">
              {bricks.find((b) => String(b.id) === dailyAffirmation.brick_id)?.name}
            </div>

          </motion.div>
        )}

        {/* I AM Builder */}
        {/* Practice Mode */}
        <button
          onClick={() => setPracticeMode(true)}
          className="w-full flex items-center justify-center gap-3 bg-gradient-pink text-foreground font-display text-sm tracking-wider uppercase py-4 rounded-xl hover:opacity-90 transition-opacity mb-8 shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
        >
          <Headphones className="w-5 h-5" />
          Practice Mode — Speak With Ché
        </button>

        <AnimatePresence>
          {practiceMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col items-center justify-center px-6"
            >
              <button
                onClick={() => setPracticeMode(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted/40 transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
              <h2 className="font-display text-2xl tracking-wider mb-2">Practice Mode</h2>
              <p className="font-body text-sm text-muted-foreground mb-10">Listen to Ché speak, then repeat with conviction.</p>
              <AffirmationTeleprompter
                count={5}
                onComplete={() => {
                  setPracticeMode(false);
                  toast.success("Practice complete 💎");
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="mb-8">
          <button
            onClick={() => setShowBuilder(!showBuilder)}
            className="w-full flex items-center justify-between bg-gradient-card border border-border rounded-xl px-5 py-4 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Plus className="w-5 h-5 text-primary" />
              <span className="font-display text-sm tracking-wider">I AM Builder</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showBuilder ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {showBuilder && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-3 space-y-3">
                  <input
                    type="text"
                    value={newAffirmation}
                    onChange={(e) => setNewAffirmation(e.target.value)}
                    placeholder="I am..."
                    maxLength={200}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    className="w-full bg-input border border-border rounded-lg px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                  <button
                    onClick={handleAdd}
                    disabled={addAffirmation.isPending || !newAffirmation.trim()}
                    className="w-full bg-gradient-pink text-foreground font-body font-bold text-sm tracking-wider uppercase py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {addAffirmation.isPending ? "..." : "Add Affirmation"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* My Affirmations */}
        {userAffirmations.length > 0 && (
          <div className="mb-8">
            <h2 className="font-display text-lg tracking-wider mb-4">My Affirmations</h2>
            <div className="space-y-2">
              {userAffirmations.map((a) => (
                <motion.div
                  key={a.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-3 bg-gradient-card border border-border rounded-xl px-4 py-3 group"
                >
                  <p className="flex-1 font-body text-sm leading-relaxed">"{a.affirmation}"</p>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleFavorite.mutate({ id: a.id, is_favorite: !a.is_favorite })}
                      className="p-1.5 rounded-lg hover:bg-muted/40 transition-colors"
                    >
                      <Heart className={`w-4 h-4 ${a.is_favorite ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                    </button>
                    <button
                      onClick={() => {
                        deleteAffirmation.mutate(a.id);
                        toast.success("Removed");
                      }}
                      className="p-1.5 rounded-lg hover:bg-destructive/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Browse by Brick — Locked to Brick 1 for Beta */}
        <h2 className="font-display text-lg tracking-wider mb-4">Browse by Brick</h2>
        <div className="space-y-2">
          {bricks.map((brick) => {
            const affirmations = groupedByBrick[brick.id] || [];
            
            if (!affirmations.length) return null;
            const isOpen = expandedBrick === brick.id;

            return (
              <div key={brick.id} className="border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedBrick(isOpen ? null : brick.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors"
                >
                  <span className="text-lg">{brick.icon}</span>
                  <span className="flex-1 text-left font-display text-sm tracking-wider">{brick.name}</span>
                  <span className="text-[10px] text-muted-foreground">{affirmations.length}</span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-2">
                        {affirmations.map((a) => (
                          <div key={a.id} className="bg-gradient-card border border-border/40 rounded-xl p-4 mb-2">
                            <div className="flex items-start gap-2">
                              <div className="flex-1 font-body text-sm text-foreground leading-relaxed pl-1">
                                💎 "{a.text.replace('Audio Affirmation: ', '')}"
                              </div>
                              <button
                                onClick={() => setSchedulingId(schedulingId === a.id ? null : a.id)}
                                className={cn(
                                  "shrink-0 p-2 rounded-lg transition-colors",
                                  schedulingId === a.id
                                    ? "bg-accent/20 text-accent"
                                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                                )}
                                title="Schedule this affirmation"
                              >
                                <Clock className="w-4 h-4" />
                              </button>
                            </div>
                            {/* Inline Time Picker */}
                            <AnimatePresence>
                              {schedulingId === a.id && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/30">
                                    <input
                                      type="time"
                                      value={scheduleTime}
                                      onChange={(e) => setScheduleTime(e.target.value)}
                                      className="flex-1 bg-input border border-border rounded-lg px-3 py-2 font-body text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
                                    />
                                    <button
                                      onClick={() => {
                                        addSchedulerTask.mutate({
                                          title: a.text.replace('Audio Affirmation: ', ''),
                                          task_type: 'affirmation',
                                          affirmation_id: a.id,
                                          time_of_day: scheduleTime + ':00',
                                          reminder_type: 'daily',
                                          days_of_week: [1, 2, 3, 4, 5, 6, 7],
                                          snooze_interval: 'every_hour',
                                          is_active: true,
                                        });
                                        toast.success(`Affirmation scheduled for ${scheduleTime} ⏰`);
                                        setSchedulingId(null);
                                      }}
                                      className="bg-gradient-pink text-foreground font-body font-bold text-[10px] uppercase tracking-wider px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                                    >
                                      Schedule
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                            {a.audio_url && (
                              <AudioPlayer src={a.audio_url} />
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Affirmations;
