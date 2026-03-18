import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, CalendarClock, Bell, BellOff, Trash2, Hammer, Heart, Sparkles, Target, CheckCircle2, Circle } from "lucide-react";
import { useSchedulerTasks, type SchedulerTask } from "@/hooks/useSchedulerTasks";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "build_it", label: "Build It", icon: Hammer, desc: "Business & Skills" },
  { value: "feed_it", label: "Feed It", icon: Heart, desc: "Health & Mindset" },
  { value: "live_it", label: "Live It", icon: Sparkles, desc: "Lifestyle & Joy" },
] as const;

const TIMEFRAMES = [
  { value: "1_week", label: "1 Week" },
  { value: "1_month", label: "1 Month" },
  { value: "3_months", label: "3 Months" },
] as const;

const formatTime = (t?: string) => {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const display = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${display}:${m} ${ampm}`;
};

const Scheduler = () => {
  const { tasks, isLoading, addTask, updateTask, deleteTask } = useSchedulerTasks();
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("build_it");
  const [timeframe, setTimeframe] = useState<string>("1_week");

  // Filter tasks into goals and subtasks
  const goals = tasks.filter((t) => !t.parent_goal_id && t.reminder_type === "goal");
  const subtasks = tasks.filter((t) => t.parent_goal_id);
  const standaloneReminders = tasks.filter((t) => !t.parent_goal_id && t.reminder_type !== "goal");

  const resetForm = () => {
    setTitle("");
    setCategory("build_it");
    setTimeframe("1_week");
    setShowGoalForm(false);
  };

  const handleGenerateRoadmap = async () => {
    if (!title.trim()) {
      toast.error("Give your goal a name");
      return;
    }

    // 1. Create the Parent Goal
    addTask.mutate(
      {
        title: title.trim(),
        category,
        timeframe,
        reminder_type: "goal",
        is_active: true,
      },
      {
        onSuccess: (newGoal) => {
          // 2. Generate Subtasks based on timeframe (Simulation of AI Generator)
          const generatedSubtasks = [
            { title: "Research & Preparation", time_of_day: "09:00:00", escalation_level: 1 },
            { title: "Execute Core Actions", time_of_day: "13:00:00", escalation_level: 2 },
            { title: "Review & Refine", time_of_day: "18:00:00", escalation_level: 3 },
          ];

          generatedSubtasks.forEach((sub) => {
            addTask.mutate({
              title: sub.title,
              category,
              time_of_day: sub.time_of_day,
              escalation_level: sub.escalation_level,
              parent_goal_id: newGoal.id,
              reminder_type: "daily",
              days_of_week: [1, 2, 3, 4, 5],
              is_active: true,
            });
          });

          toast.success("Goal & Roadmap Generated 🗺️");
          resetForm();
        },
      }
    );
  };

  const toggleTaskCompletion = (t: SchedulerTask) => {
    updateTask.mutate({ id: t.id, is_completed: !t.is_completed });
    if (!t.is_completed) {
      toast.success("Task completed! 🎯");
    }
  };

  const handleDelete = (id: string, isGoal: boolean) => {
    deleteTask.mutate(id, {
      onSuccess: () => {
        toast.success(isGoal ? "Goal deleted" : "Task removed");
      },
    });
  };

  const getCategoryIcon = (cat?: string) => {
    const found = CATEGORIES.find((c) => c.value === cat);
    return found?.icon ?? Target;
  };

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-background px-6 py-10 pb-24">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-display text-3xl sm:text-4xl tracking-wider">
            Life <span className="text-accent">Architecture</span>
          </h1>
        </div>
        <p className="font-body text-sm text-muted-foreground mb-8 ml-8">
          Design your roadmap to a Brickhouse life.
        </p>

        {/* Add Goal Button */}
        <button
          onClick={() => setShowGoalForm(!showGoalForm)}
          className="w-full flex items-center justify-center gap-2 bg-gradient-pink text-foreground font-body font-bold text-xs tracking-wider uppercase px-5 py-3 rounded-xl mb-8 hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          {showGoalForm ? "Cancel" : "New Goal Sandbox"}
        </button>

        {/* New Goal Form */}
        <AnimatePresence>
          {showGoalForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-gradient-card border border-border rounded-xl p-5 space-y-5">
                {/* Title */}
                <div>
                  <label className="font-body text-[10px] text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Target Goal
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Launch my agency"
                    maxLength={100}
                    className="w-full bg-input border border-border rounded-lg px-3 py-2.5 font-body text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="font-body text-[10px] text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Architecture Category
                  </label>
                  <div className="flex flex-col gap-2">
                    {CATEGORIES.map((c) => {
                      const Icon = c.icon;
                      const isActive = category === c.value;
                      return (
                        <button
                          key={c.value}
                          onClick={() => setCategory(c.value)}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                            isActive
                              ? "bg-primary/10 border-primary text-foreground"
                              : "bg-foreground/[0.02] border-border text-muted-foreground hover:bg-foreground/[0.05]"
                          )}
                        >
                          <div className={cn("p-2 rounded-lg", isActive ? "bg-primary/20" : "bg-foreground/[0.05]")}>
                            <Icon className={cn("w-4 h-4", isActive && "text-primary")} />
                          </div>
                          <div>
                            <div className="font-display text-sm tracking-wide">{c.label}</div>
                            <div className="font-body text-[10px] opacity-70">{c.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Timeframe */}
                <div>
                  <label className="font-body text-[10px] text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Timeframe
                  </label>
                  <div className="flex gap-2">
                    {TIMEFRAMES.map((t) => (
                      <button
                        key={t.value}
                        onClick={() => setTimeframe(t.value)}
                        className={cn(
                          "flex-1 py-2 rounded-lg font-body text-[10px] tracking-wider border transition-all",
                          timeframe === t.value
                            ? "bg-accent/20 border-accent/40 text-accent"
                            : "bg-foreground/[0.03] border-border text-muted-foreground hover:border-accent/20"
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerateRoadmap}
                  disabled={addTask.isPending}
                  className="w-full bg-foreground text-background font-body font-bold text-xs tracking-wider uppercase px-5 py-3 rounded-xl hover:bg-foreground/90 transition-colors disabled:opacity-40 flex items-center justify-center gap-2 mt-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {addTask.isPending ? "Generating..." : "Generate Roadmap"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Goals List */}
        <div className="space-y-8">
          {goals.length === 0 && !showGoalForm ? (
            <div className="text-center py-16 bg-gradient-card border border-border rounded-xl">
              <Target className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="font-body text-sm text-muted-foreground">No active goals.</p>
              <p className="font-body text-xs text-muted-foreground/60 mt-1">
                Start building your Life Architecture roadmap.
              </p>
            </div>
          ) : (
            goals.map((goal) => {
              const Icon = getCategoryIcon(goal.category);
              const goalSubtasks = subtasks.filter((s) => s.parent_goal_id === goal.id);

              return (
                <div key={goal.id} className="space-y-4 group">
                  {/* Goal Header */}
                  <div className="flex items-center gap-4 bg-muted/40 p-4 rounded-xl border border-border relative overflow-hidden transition-all hover:bg-muted/60">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-pink" />
                    
                    <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center shrink-0 border border-border shadow-sm">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h2 className="font-display text-lg tracking-wider truncate text-foreground pr-4">
                          {goal.title}
                        </h2>
                        <button
                          onClick={() => handleDelete(goal.id, true)}
                          className="pt-1 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-body text-[10px] tracking-wider uppercase text-muted-foreground">
                          {CATEGORIES.find(c => c.value === goal.category)?.label || goal.category}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span className="font-body text-[10px] tracking-wider uppercase text-accent">
                          {TIMEFRAMES.find(t => t.value === goal.timeframe)?.label || goal.timeframe}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Subtasks */}
                  <div className="space-y-2 pl-4 border-l-2 border-border/50 ml-6">
                    {goalSubtasks.length === 0 && (
                      <p className="font-body text-xs text-muted-foreground py-2">No subtasks generated yet.</p>
                    )}
                    {goalSubtasks.map((task) => (
                      <div
                        key={task.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border bg-background transition-all group/task",
                          task.is_completed ? "border-primary/30 bg-primary/5" : "border-border hover:border-primary/20"
                        )}
                      >
                        <button
                          onClick={() => toggleTaskCompletion(task)}
                          className={cn(
                            "w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors",
                            task.is_completed ? "text-primary" : "text-border hover:text-primary/50"
                          )}
                        >
                          {task.is_completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "font-body text-xs transition-colors",
                            task.is_completed ? "text-muted-foreground line-through" : "text-foreground"
                          )}>
                            {task.title}
                          </p>
                          {task.time_of_day && (
                            <p className="font-body text-[9px] text-muted-foreground mt-0.5 flex items-center gap-1">
                              <Bell className="w-2.5 h-2.5" />
                              {formatTime(task.time_of_day)}
                              {task.escalation_level && (
                                <span className={cn("ml-1 uppercase text-[8px]", 
                                  task.escalation_level === 3 ? "text-destructive" :
                                  task.escalation_level === 2 ? "text-accent" :
                                  "text-primary"
                                )}>
                                  Lvl {task.escalation_level}
                                </span>
                              )}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => handleDelete(task.id, false)}
                          className="opacity-0 group-hover/task:opacity-100 p-2 text-muted-foreground hover:text-destructive transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};

export default Scheduler;
