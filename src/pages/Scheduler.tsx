import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useAnimation, type PanInfo } from "framer-motion";
import {
  ChevronLeft, Sparkles, Pin, Heart, Sun, Moon, Flame, Edit2, Trash2, Bug, Hourglass, Share, CheckCircle2,
  Clock, Plus, X, CalendarClock, Activity, BookOpen, Briefcase, CircleDollarSign, Leaf, ChevronDown, ChevronRight
} from "lucide-react";
import { useSchedulerTasks, type SchedulerTask } from "@/hooks/useSchedulerTasks";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { format, addMinutes } from "date-fns";
import { NotificationService } from "@/lib/NotificationService";

import { Wrench } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */
const SCHEDULING_CATEGORIES = [
  { id: 'build', label: 'Build It', icon: Briefcase, description: 'Goals & Work' },
  { id: 'feed', label: 'Feed It', icon: Heart, description: 'Self-care & Spirit' },
  { id: 'live', label: 'Live It', icon: Sparkles, description: 'Mandatory Fun' }
];

const BUG_ME_OPTIONS = [
  { label: "None", value: "none" },
  { label: "1 Minute", value: "every_minute" },
  { label: "1 Hour", value: "every_hour" },
];

const TIME_QUICK_PICKERS = [5, 10, 15, 30, 45, 60];

const GOAL_CATEGORIES = [
  { id: "love", title: "Attract love and healthy relationships", icon: Heart },
  { id: "body", title: "Rebuild my relationship with my body", icon: Activity },
  { id: "business", title: "Build or grow my business or income", icon: Briefcase },
  { id: "validation", title: "Heal and reclaim my power", icon: Leaf },
  { id: "purpose", title: "Find my purpose and create a life I love", icon: BookOpen },
  { id: "peace", title: "Create peace and joy in my everyday life", icon: Sparkles }
];

const TIMEFRAMES = [
  { id: "tomorrow", label: "Tomorrow" },
  { id: "this_week", label: "This Week" },
  { id: "this_month", label: "This Month" },
  { id: "3_months", label: "3 Months" },
  { id: "6_months", label: "6 Months" },
  { id: "9_months", label: "9 Months" }
];

const TRUTH_STATEMENTS: Record<string, string> = {
  love: "I am building a foundation of self-love that naturally attracts the right partner.",
  body: "My body is a temple being fortified with strength, energy, and discipline.",
  business: "I am architecting a sovereign enterprise that solves real problems and creates real value.",
  validation: "I am reconstructing my spirit, stronger at the broken places.",
  purpose: "I am the master builder of a life filled with meaning and directional power.",
  peace: "I am fiercely protecting my peace and scheduling joy as non-negotiable."
};

// --- Swipeable Reminder Card (For general one-off tasks) ---
const ReminderCard = ({
  task,
  onToggle,
  onDelete,
  onBugMeClick,
}: {
  task: SchedulerTask;
  onToggle: (t: SchedulerTask) => void;
  onDelete: (id: string) => void;
  onBugMeClick: (t: SchedulerTask) => void;
}) => {
  const controls = useAnimation();
  const categoryMatch = SCHEDULING_CATEGORIES.find(c => c.id === task.category);
  const Icon = categoryMatch ? categoryMatch.icon : Pin;

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -100) {
      controls.start({ x: -180 });
    } else {
      controls.start({ x: 0 });
    }
  };

  const formattedDate = task.scheduled_for
    ? format(new Date(task.scheduled_for), "EEE, MMM d, yyyy 'at' h:mm a")
    : format(new Date(task.created_at), "EEE, MMM d, yyyy 'at' h:mm a");

  return (
    <div className="relative mb-3 overflow-hidden rounded-2xl bg-gradient-card border border-border">
      <div className="absolute right-0 top-0 h-full flex items-center justify-end px-4 gap-4 w-full bg-foreground/[0.03]">
        <button className="text-muted-foreground hover:text-foreground transition-colors"><Edit2 className="w-5 h-5" /></button>
        <button className="text-accent hover:text-accent/80 transition-colors" onClick={() => onBugMeClick(task)}><Bug className="w-5 h-5" /></button>
        <button className="text-muted-foreground hover:text-foreground transition-colors"><Hourglass className="w-5 h-5" /></button>
        <button className="text-muted-foreground hover:text-foreground transition-colors"><Share className="w-5 h-5" /></button>
        <button className="text-primary hover:text-primary/80 transition-colors" onClick={() => onToggle(task)}>
          <CheckCircle2 className="w-5 h-5" />
        </button>
        <button className="text-destructive hover:text-destructive/80 transition-colors ml-2" onClick={() => onDelete(task.id)}>
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: -180, right: 0 }}
        onDragEnd={handleDragEnd}
        animate={controls}
        className={cn(
          "relative z-10 p-5 rounded-2xl border-l-[4px] bg-card flex items-start gap-4 transition-colors",
          task.is_completed ? "opacity-50 grayscale border-l-muted" : "border-l-primary"
        )}
      >
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border", 
          task.is_completed ? "bg-muted border-border" : "bg-primary/10 border-primary/20"
        )}>
          <Icon className={cn("w-6 h-6", task.is_completed ? "text-muted-foreground" : "text-primary")} />
        </div>
        <div className="flex-1 min-w-0 pt-1">
          <h3 className={cn("font-display text-base tracking-wider leading-tight break-words text-foreground", task.is_completed && "line-through opacity-70")}>
            {task.title}
          </h3>
          <div className="flex items-end justify-between mt-2">
            <p className="font-body text-[11px] text-muted-foreground">
              {task.reminder_type === 'daily' && task.time_of_day ? `Scheduled daily at ${
                (() => {
                  try {
                    const [h, m] = task.time_of_day.split(':');
                    return format(new Date().setHours(parseInt(h), parseInt(m)), "h:mm a");
                  } catch (e) {
                    return task.time_of_day;
                  }
                })()
              }` : formattedDate}
            </p>
            {task.snooze_interval && task.snooze_interval !== "none" && (
              <span className="flex items-center gap-1 text-[9px] uppercase font-bold tracking-widest text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                {task.snooze_interval === "every_minute" ? "1m" : "1h"} <Bug className="w-3 h-3 ml-0.5" />
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- Timeframe Section Component ---
const TimeframeSection = ({ 
  timeframe, 
  tasks, 
  onAddStep, 
  onToggleStep, 
  onUpdateNotes,
  onDeleteStep
}: { 
  timeframe: any, 
  tasks: SchedulerTask[], 
  onAddStep: (tf: string) => void,
  onToggleStep: (t: SchedulerTask) => void,
  onUpdateNotes: (t: SchedulerTask, notes: string) => void,
  onDeleteStep: (id: string) => void
}) => {
  const [isOpen, setIsOpen] = useState(true);
  
  return (
    <div className="mb-4 bg-gradient-card border border-border rounded-xl shadow-sm overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-muted/10 hover:bg-muted/20 transition-colors"
      >
        <h3 className="font-display text-base tracking-wider text-foreground">{timeframe.label}</h3>
        {isOpen ? <ChevronDown className="w-5 h-5 text-muted-foreground" /> : <ChevronRight className="w-5 h-5 text-muted-foreground" />}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-2 space-y-3 border-t border-border/50">
              {tasks.length === 0 ? (
                <p className="font-body text-xs text-muted-foreground italic">No steps defined for {timeframe.label.toLowerCase()} yet.</p>
              ) : (
                tasks.map(task => (
                  <div key={task.id} className="relative group">
                    <div className="flex items-start gap-3">
                      <button 
                        onClick={() => onToggleStep(task)}
                        className={cn(
                          "mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors",
                          task.is_completed ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/50 hover:border-primary"
                        )}
                      >
                        {task.is_completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>
                      <div className="flex-1">
                        <p className={cn("font-body text-sm text-foreground", task.is_completed && "line-through opacity-50")}>
                          {task.title}
                        </p>
                        <textarea
                          placeholder="Add personal notes..."
                          defaultValue={task.notes || ""}
                          onBlur={(e) => {
                            if (e.target.value !== task.notes) {
                              onUpdateNotes(task, e.target.value);
                            }
                          }}
                          className="mt-2 w-full bg-background/50 border border-border/50 text-foreground font-body text-xs p-2 rounded-lg resize-none focus:outline-none focus:border-primary/50 transition-colors h-16"
                        />
                      </div>
                      <button 
                        onClick={() => onDeleteStep(task.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
              
              <button 
                onClick={() => onAddStep(timeframe.id)}
                className="w-full mt-2 py-2 flex items-center justify-center gap-2 border border-dashed border-border/80 rounded-lg text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors font-body text-xs uppercase tracking-widest"
              >
                <Plus className="w-3 h-3" /> Add Step
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Scheduler = () => {
  const { user } = useAuth();
  const { tasks, isLoading, addTask, updateTask, deleteTask } = useSchedulerTasks();
  const [view, setView] = useState<"list" | "step1" | "step2" | "goal_selection" | "goal_template" | "goal_step_create">("list");
  
  // Creation Form State (General Reminders)
  const [draftTitle, setDraftTitle] = useState("");
  const [draftIcon, setDraftIcon] = useState("build");
  const [draftDate, setDraftDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [draftTime, setDraftTime] = useState<string>("09:00");
  const [draftSnooze, setDraftSnooze] = useState<string>("none");
  const [isDoneLoading, setIsDoneLoading] = useState(false);

  // Creation Form State (Goal Step)
  const [draftGoalStepTitle, setDraftGoalStepTitle] = useState("");
  const [draftGoalStepTimeframe, setDraftGoalStepTimeframe] = useState("");
  const [draftGoalStepDate, setDraftGoalStepDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [draftGoalStepTime, setDraftGoalStepTime] = useState<string>("09:00");
  const [draftGoalStepSnooze, setDraftGoalStepSnooze] = useState<string>("none");

  // Bug Me Sheet State
  const [bugMeTask, setBugMeTask] = useState<SchedulerTask | null>(null);

  // Goal & Roadmap State
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);

  // Listen for push notification actions
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SNOOZE_TASK' && event.data.data) {
        setBugMeTask(event.data.data);
      }
    };
    
    navigator.serviceWorker.addEventListener('message', handleMessage);
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, []);
  
  // Filter Tasks
  const generalTasks = tasks.filter(t => t.task_type !== "goal" && t.task_type !== "goal_step");
  const activeGoals = tasks.filter(t => t.task_type === "goal");
  
  // Sort general reminders
  const reminders = generalTasks.sort((a, b) => new Date(a.scheduled_for || a.created_at).getTime() - new Date(b.scheduled_for || b.created_at).getTime());

  // Action Handlers (General)
  const handleToggle = (task: SchedulerTask) => {
    updateTask.mutate({ id: task.id, is_completed: !task.is_completed });
    if (!task.is_completed) toast.success("Completed! 💎");
  };

  const handleDelete = (id: string) => {
    deleteTask.mutate(id, { onSuccess: () => toast.success("Deleted") });
  };

  const handleCreateReminder = async () => {
    if (!draftTitle.trim()) {
      toast.error("Please enter what to remind you about.");
      return;
    }
    setIsDoneLoading(true);
    
    // Parse combined date and time
    const scheduledDate = new Date(`${draftDate}T${draftTime}:00`);

    addTask.mutate(
      {
        title: draftTitle.trim(),
        category: draftIcon,
        reminder_type: "one_off",
        task_type: "custom",
        scheduled_for: scheduledDate.toISOString(),
        snooze_interval: draftSnooze,
        is_active: true,
      },
      {
        onSuccess: () => {
          toast.success("RE.minder scheduled ⏰");
          NotificationService.requestPermissionAndSubscribe(user!.id);
          setIsDoneLoading(false);
          setDraftTitle("");
          setDraftIcon("build");
          setDraftDate(format(new Date(), "yyyy-MM-dd"));
          setDraftTime("09:00");
          setDraftSnooze("none");
          setView("list");
        },
        onError: () => setIsDoneLoading(false)
      }
    );
  };

  const handleUpdateBugMe = (interval: string) => {
    if (!bugMeTask) return;
    updateTask.mutate(
      { id: bugMeTask.id, snooze_interval: interval },
      { onSuccess: () => { 
          toast.success("Bug Me setting updated 🐛");
          if (interval !== "none") {
            NotificationService.showLocalTestNotification(
              "Snooze Active 🐛",
              `We'll bug you ${interval === "every_minute" ? "every minute" : "every hour"} for: ${bugMeTask.title}`,
              { task_id: bugMeTask.id }
            );
          }
          setBugMeTask(null); 
        } 
      }
    );
  };

  // --- Goal Specific Handlers ---
  const handleCreateGoal = (categoryId: string, title: string) => {
    addTask.mutate(
      {
        title,
        category: categoryId,
        task_type: "goal",
        is_active: true
      },
      {
        onSuccess: (newGoal) => {
          toast.success("Goal Architecture Initiated 🧱");
          setActiveGoalId(newGoal.id);
          setView("goal_template");
        }
      }
    );
  };

  const activeGoal = tasks.find(t => t.id === activeGoalId);
  const activeGoalSteps = tasks.filter(t => t.task_type === "goal_step" && t.parent_goal_id === activeGoalId);

  const activeGoalProgress = activeGoalSteps.length > 0
    ? (activeGoalSteps.filter(t => t.is_completed).length / activeGoalSteps.length) * 100
    : 0;

  const handleAddGoalStep = (timeframe: string) => {
    setDraftGoalStepTimeframe(timeframe);
    setDraftGoalStepTitle("");
    setDraftGoalStepDate(format(new Date(), "yyyy-MM-dd"));
    setDraftGoalStepTime("09:00");
    setDraftGoalStepSnooze("none");
    setView("goal_step_create");
  };

  const handleCreateGoalStep = async () => {
    if (!draftGoalStepTitle.trim() || !activeGoalId) {
      toast.error("Please enter a title for the step.");
      return;
    }
    setIsDoneLoading(true);
    
    const scheduledDate = new Date(`${draftGoalStepDate}T${draftGoalStepTime}:00`);

    addTask.mutate({
      title: draftGoalStepTitle.trim(),
      task_type: "goal_step",
      parent_goal_id: activeGoalId,
      timeframe: draftGoalStepTimeframe,
      scheduled_for: scheduledDate.toISOString(),
      snooze_interval: draftGoalStepSnooze,
      is_active: true
    }, {
      onSuccess: () => {
        toast.success("Step scheduled 🧱");
        // Register for push notifications via service worker
        NotificationService.requestPermissionAndSubscribe(user!.id);
        setIsDoneLoading(false);
        setView("goal_template");
      },
      onError: () => setIsDoneLoading(false)
    });
  };

  const handleUpdateGoalNotes = (task: SchedulerTask, notes: string) => {
    updateTask.mutate({ id: task.id, notes });
  };

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 sm:px-6 pt-8 pb-20 overflow-x-hidden font-sans">
      <div className="w-full max-w-lg mx-auto h-screen flex flex-col relative">
        
        {/* VIEW 1: HOME (Active Builds & Reminders) */}
        <AnimatePresence mode="wait">
          {view === "list" && (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col h-full absolute inset-0 pb-16 overflow-y-auto hide-scrollbar"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-8 relative z-20 shrink-0">
                <Link 
                  to="/dashboard" 
                  className="w-10 h-10 rounded-full border border-border bg-gradient-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Link>
                <div className="text-center absolute left-1/2 -translate-x-1/2">
                    <div className="font-body text-[10px] uppercase tracking-widest text-accent mb-1">Architecture</div>
                    <h1 className="font-display text-2xl tracking-wider text-foreground">
                    Scheduler
                    </h1>
                </div>
              </div>

              {/* MY WEEK (General Build Button) */}
              <div className="mb-4">
                <button
                  onClick={() => setView("step1")}
                  className="w-full bg-gradient-card border border-border p-5 rounded-2xl flex flex-col items-start gap-4 hover:border-primary/50 hover:bg-primary/5 transition-all shadow-sm group"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <CalendarClock className="w-6 h-6 text-primary" />
                      </div>
                      <div className="text-left">
                        <h2 className="font-display text-xl tracking-wider text-foreground group-hover:text-primary transition-colors">My Week</h2>
                        <p className="font-body text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Schedule new tasks</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </button>
              </div>

              {/* GENERAL REMINDERS (MY WEEK'S SCHEDULE) */}
              <div className="mb-10">
                <h2 className="font-body text-lg font-bold uppercase tracking-widest text-primary ml-1 mb-4">My Week's Schedule</h2>
                {reminders.length === 0 ? (
                  <div className="bg-gradient-card border border-border p-6 rounded-2xl text-center shadow-sm">
                    <p className="font-body text-xs text-muted-foreground mb-4">No tasks scheduled for this week.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reminders.map(task => (
                      <ReminderCard
                        key={task.id}
                        task={task}
                        onToggle={handleToggle}
                        onDelete={handleDelete}
                        onBugMeClick={setBugMeTask}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* ACTIVE BUILDS (GOALS) */}
              <div className="mb-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-body text-lg font-bold uppercase tracking-widest text-primary ml-1">Active Builds</h2>
                  <button 
                    onClick={() => setView("goal_selection")}
                    className="flex items-center text-base font-bold uppercase tracking-widest text-accent bg-accent/10 hover:bg-accent/20 px-6 py-3 rounded-xl transition-all shadow-[0_0_15px_hsl(var(--accent)/0.15)] hover:shadow-[0_0_25px_hsl(var(--accent)/0.25)]"
                  >
                    <Plus className="w-5 h-5 mr-2" /> New Build
                  </button>
                </div>
                
                {activeGoals.length === 0 ? (
                  <div className="bg-gradient-card border border-border outline outline-1 outline-border/20 p-6 rounded-2xl text-center shadow-lg">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-display text-lg tracking-wider text-foreground mb-1">What are you building?</h3>
                    <p className="font-body text-xs text-muted-foreground mb-4">You have no active architectures in progress.</p>
                    <button 
                      onClick={() => setView("goal_selection")}
                      className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-display tracking-widest shadow-[0_0_20px_hsl(var(--primary)/0.3)] hover:bg-primary/90 transition-all"
                    >
                      Start a Build
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeGoals.map(goal => {
                      const CatIcon = GOAL_CATEGORIES.find(c => c.id === goal.category)?.icon || Flame;
                      // Calculate progress for this goal
                      const goalSteps = tasks.filter(t => t.task_type === "goal_step" && t.parent_goal_id === goal.id);
                      const progress = goalSteps.length > 0 
                        ? (goalSteps.filter(t => t.is_completed).length / goalSteps.length) * 100 
                        : 0;

                      return (
                        <div 
                          key={goal.id}
                          onClick={() => { setActiveGoalId(goal.id); setView("goal_template"); }}
                          className="bg-gradient-card border border-border p-4 rounded-2xl flex flex-col cursor-pointer hover:border-primary/50 transition-colors group"
                        >
                          <div className="flex items-start gap-4">
                             <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                <CatIcon className="w-5 h-5 text-primary" />
                             </div>
                             <div className="flex-1 min-w-0 pt-0.5">
                                <h3 className="font-display text-base tracking-wider text-foreground truncate group-hover:text-primary transition-colors">
                                  {goal.title}
                                </h3>
                                <p className="font-body text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                                  {goalSteps.filter(t => t.is_completed).length} of {goalSteps.length} Bricks Laid
                                </p>
                             </div>
                             <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-2" />
                          </div>
                          {/* Progress Bar (Brick Wall) */}
                          <div className="w-full h-1.5 bg-muted rounded-full mt-4 overflow-hidden relative">
                            <div 
                              className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-out"
                              style={{ width: `${progress}%` }}
                            />
                            {/* Brick segment markers */}
                            <div className="absolute inset-0 flex justify-between" style={{ mixBlendMode: 'overlay' }}>
                              <div className="w-[1px] h-full bg-background" />
                              <div className="w-[1px] h-full bg-background" />
                              <div className="w-[1px] h-full bg-background" />
                              <div className="w-[1px] h-full bg-background" />
                              <div className="w-[1px] h-full bg-background" />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* GENERAL REMINDERS MOVED TO TOP */}

              {/* Bug Me Action Sheet Context Menu */}
              <AnimatePresence>
                {bugMeTask && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 max-w-lg mx-auto"
                      onClick={() => setBugMeTask(null)}
                    />
                    <motion.div
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "100%" }}
                      transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                      className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto z-50 p-4 pb-8"
                    >
                      <div className="bg-card border border-border rounded-2xl overflow-hidden mb-3 shadow-[0_0_40px_hsl(var(--accent)/0.15)]">
                        <div className="py-4 text-center border-b border-border/50 bg-muted/30">
                          <p className="font-body text-[10px] uppercase tracking-widest text-muted-foreground">Bug Me Settings</p>
                        </div>
                        {BUG_ME_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => handleUpdateBugMe(opt.value)}
                            className="w-full py-5 text-center border-b border-border/50 font-display text-lg tracking-wider text-accent hover:bg-accent/5 transition-colors"
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setBugMeTask(null)}
                        className="w-full py-5 text-center rounded-2xl bg-foreground/[0.03] border border-border font-display text-lg tracking-wider text-muted-foreground shadow-lg hover:bg-foreground/[0.05] transition-colors"
                      >
                        Cancel
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* VIEW: GOAL SELECTION ("What are you building?") */}
          {view === "goal_selection" && (
            <motion.div
              key="goal_selection"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col h-full absolute inset-0 z-30 bg-background overflow-y-auto hide-scrollbar pb-16"
            >
              <div className="flex items-center justify-between mb-8 relative z-20 shrink-0">
                <button 
                  onClick={() => setView("list")} 
                  className="w-10 h-10 rounded-full border border-border bg-gradient-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>

              <div className="text-center mb-8">
                <h1 className="font-display text-3xl tracking-wider text-foreground mb-3">
                  What are you <span className="text-primary italic">building?</span>
                </h1>
                <p className="font-body text-sm text-muted-foreground px-4">
                  Select a pillar of your life to architect a targeted master plan.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {GOAL_CATEGORIES.map(category => (
                  <button
                    key={category.id}
                    onClick={() => handleCreateGoal(category.id, category.title)}
                    className="bg-gradient-card border border-border p-5 rounded-2xl flex flex-col items-center justify-center text-center hover:border-primary/50 hover:bg-primary/5 transition-all group shadow-sm"
                  >
                    <div className="w-14 h-14 rounded-full bg-background border border-border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <category.icon className="w-6 h-6 text-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <span className="font-display text-sm tracking-widest leading-tight text-foreground">
                      {category.title}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* VIEW: GOAL TEMPLATE ROADMAP */}
          {view === "goal_template" && activeGoal && (
            <motion.div
              key="goal_template"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col h-full absolute inset-0 z-30 bg-background overflow-y-auto hide-scrollbar pb-16"
            >
              <div className="flex items-center justify-between mb-6 relative z-20 shrink-0">
                <button 
                  onClick={() => { setActiveGoalId(null); setView("list"); }} 
                  className="font-body text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground flex items-center transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Home
                </button>
                <div className="text-center absolute left-1/2 -translate-x-1/2">
                    <h1 className="font-display text-sm tracking-wider text-foreground">
                      Architecture
                    </h1>
                </div>
                <button 
                  onClick={() => {
                    if(window.confirm("Delete this entire build?")) {
                      handleDelete(activeGoal.id);
                      setView("list");
                    }
                  }}
                  className="font-body text-xs p-2 text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mb-6">
                <h2 className="font-display text-3xl tracking-widest text-primary leading-none mb-4">
                  {activeGoal.title}
                </h2>
                
                {/* Truth Statement */}
                {activeGoal.category && TRUTH_STATEMENTS[activeGoal.category] && (
                  <div className="bg-gradient-card border-l-2 border-primary p-4 rounded-r-xl shadow-sm mb-6">
                    <p className="font-body text-sm italic text-foreground/90 leading-relaxed">
                      "{TRUTH_STATEMENTS[activeGoal.category]}"
                    </p>
                  </div>
                )}

                {/* Progress Visual */}
                <div className="mb-8">
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-body text-[10px] uppercase tracking-widest text-muted-foreground">Foundation Progress</span>
                    <span className="font-display text-sm text-primary">{Math.round(activeGoalProgress)}%</span>
                  </div>
                  <div className="w-full h-3 bg-muted rounded-md overflow-hidden relative border border-border">
                    <div 
                      className="absolute top-0 left-0 h-full bg-primary transition-all duration-700 ease-out"
                      style={{ width: `${activeGoalProgress}%` }}
                    />
                    <div className="absolute inset-0 flex justify-between" style={{ mixBlendMode: 'overlay' }}>
                      {Array.from({ length: 9 }).map((_, i) => (
                         <div key={i} className="w-[2px] h-full bg-background" />
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Roadmap Sections */}
                <div className="space-y-4">
                  {TIMEFRAMES.map((tf) => {
                    const sectionTasks = activeGoalSteps.filter(t => t.timeframe === tf.id);
                    return (
                      <TimeframeSection
                        key={tf.id}
                        timeframe={tf}
                        tasks={sectionTasks}
                        onAddStep={handleAddGoalStep}
                        onToggleStep={handleToggle}
                        onUpdateNotes={handleUpdateGoalNotes}
                        onDeleteStep={handleDelete}
                      />
                    );
                  })}
                </div>

              </div>
            </motion.div>
          )}

          {/* VIEW: CREATE GENERAL REMINDER STEP 1 */}
          {view === "step1" && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col h-full absolute inset-0 z-30 bg-background"
            >
              <div className="flex items-center justify-between mb-8 relative z-20">
                <button 
                  onClick={() => setView("list")} 
                  className="font-body text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <div className="text-center absolute left-1/2 -translate-x-1/2">
                    <h1 className="font-display text-base tracking-wider text-foreground">
                    New RE.minder
                    </h1>
                </div>
                <button 
                  onClick={() => draftTitle.trim() && setView("step2")} 
                  className={cn("font-body text-xs uppercase tracking-widest transition-colors", !draftTitle.trim() ? "text-muted-foreground/50" : "text-primary hover:text-primary/80")}
                  disabled={!draftTitle.trim()}
                >
                  Next
                </button>
              </div>

              <div className="flex flex-col mt-4">
                <label className="font-body text-[10px] uppercase tracking-widest text-primary mb-3 ml-2">Objective</label>
                <div className="relative">
                  <input
                    type="text"
                    autoFocus
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    className="w-full bg-gradient-card border border-border text-foreground font-display text-lg tracking-wide py-4 pl-5 pr-12 rounded-2xl focus:outline-none focus:border-primary/50 transition-colors"
                    placeholder="Enter objective..."
                  />
                  {draftTitle && (
                    <button
                      onClick={() => setDraftTitle("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
                    >
                      <X className="w-3.5 h-3.5 text-foreground" />
                    </button>
                  )}
                </div>

                <label className="font-body text-[10px] uppercase tracking-widest text-primary mt-10 mb-4 ml-2">Category</label>
                <div className="grid grid-cols-3 gap-3">
                  {SCHEDULING_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setDraftIcon(cat.id)}
                      className={cn(
                        "rounded-2xl flex flex-col items-center justify-center p-4 transition-all bg-gradient-card border",
                        draftIcon === cat.id 
                          ? "border-primary bg-primary/10 shadow-[0_0_15px_hsl(var(--primary)/0.15)]" 
                          : "border-border hover:border-primary/30"
                      )}
                    >
                      <cat.icon className={cn("w-6 h-6 mb-2", draftIcon === cat.id ? "text-primary" : "text-muted-foreground")} />
                      <span className={cn("font-display tracking-widest text-[10px] uppercase", draftIcon === cat.id ? "text-primary" : "text-foreground")}>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* VIEW: CREATE GENERAL REMINDER STEP 2 */}
          {view === "step2" && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 flex flex-col h-full absolute inset-0 z-30 bg-background"
            >
              <div className="flex items-center justify-between mb-8 relative z-20">
                <button 
                  onClick={() => setView("step1")} 
                  className="font-body text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground flex items-center transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </button>
                <div className="text-center absolute left-1/2 -translate-x-1/2 w-40 truncate">
                    <h1 className="font-display text-sm tracking-wider text-foreground truncate">
                    {draftTitle}
                    </h1>
                </div>
                <button 
                  onClick={handleCreateReminder}
                  disabled={isDoneLoading}
                  className="font-body text-xs uppercase tracking-widest text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                >
                  {isDoneLoading ? "..." : "Schedule"}
                </button>
              </div>

              <div className="flex flex-col mt-4 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-body text-[10px] uppercase tracking-widest text-primary mb-3 ml-2 block">Date</label>
                    <input 
                      type="date"
                      value={draftDate}
                      onChange={(e) => setDraftDate(e.target.value)}
                      className="w-full bg-input border border-border rounded-lg px-4 py-3 font-body text-sm text-foreground focus:outline-none focus:border-primary transition-colors [&::-webkit-calendar-picker-indicator]:invert"
                    />
                  </div>

                  <div>
                    <label className="font-body text-[10px] uppercase tracking-widest text-primary mb-3 ml-2 block">Time (12-Hour)</label>
                    <input 
                      type="time"
                      value={draftTime}
                      onChange={(e) => setDraftTime(e.target.value)}
                      className="w-full bg-input border border-border rounded-lg px-4 py-3 font-body text-sm text-foreground focus:outline-none focus:border-primary transition-colors [&::-webkit-calendar-picker-indicator]:invert"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-body text-[10px] uppercase tracking-widest text-primary mb-3 ml-2 block">Snooze Settings</label>
                  <select 
                    value={draftSnooze}
                    onChange={(e) => setDraftSnooze(e.target.value)}
                    className="w-full bg-input border border-border rounded-lg px-4 py-3 font-body text-sm text-foreground focus:outline-none focus:border-primary transition-colors appearance-none"
                  >
                    {BUG_ME_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value} className="bg-background text-foreground">{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {/* VIEW: CREATE GOAL STEP */}
          {view === "goal_step_create" && (
            <motion.div
              key="goal_step_create"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 flex flex-col h-full absolute inset-0 z-30 bg-background"
            >
              <div className="flex items-center justify-between mb-8 relative z-20">
                <button 
                  onClick={() => setView("goal_template")} 
                  className="font-body text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground flex items-center transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </button>
                <div className="text-center absolute left-1/2 -translate-x-1/2 w-40 truncate">
                    <h1 className="font-display text-sm tracking-wider text-foreground truncate">
                    New Step
                    </h1>
                </div>
                <button 
                  onClick={handleCreateGoalStep}
                  disabled={isDoneLoading || !draftGoalStepTitle.trim()}
                  className="font-body text-xs uppercase tracking-widest text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                >
                  {isDoneLoading ? "..." : "Schedule"}
                </button>
              </div>

              <div className="flex flex-col mt-4 space-y-6">
                <div>
                  <label className="font-body text-[10px] uppercase tracking-widest text-primary mb-3 ml-2 block">Step Title</label>
                  <div className="relative">
                    <input
                      type="text"
                      autoFocus
                      value={draftGoalStepTitle}
                      onChange={(e) => setDraftGoalStepTitle(e.target.value)}
                      className="w-full bg-gradient-card border border-border text-foreground font-display text-lg tracking-wide py-4 pl-5 pr-12 rounded-2xl focus:outline-none focus:border-primary/50 transition-colors"
                      placeholder="Enter step title..."
                    />
                    {draftGoalStepTitle && (
                      <button
                        onClick={() => setDraftGoalStepTitle("")}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
                      >
                        <X className="w-3.5 h-3.5 text-foreground" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-body text-[10px] uppercase tracking-widest text-primary mb-3 ml-2 block">Date</label>
                    <input 
                      type="date"
                      value={draftGoalStepDate}
                      onChange={(e) => setDraftGoalStepDate(e.target.value)}
                      className="w-full bg-input border border-border rounded-lg px-4 py-3 font-body text-sm text-foreground focus:outline-none focus:border-primary transition-colors [&::-webkit-calendar-picker-indicator]:invert"
                    />
                  </div>

                  <div>
                    <label className="font-body text-[10px] uppercase tracking-widest text-primary mb-3 ml-2 block">Time (12-Hour)</label>
                    <input 
                      type="time"
                      value={draftGoalStepTime}
                      onChange={(e) => setDraftGoalStepTime(e.target.value)}
                      className="w-full bg-input border border-border rounded-lg px-4 py-3 font-body text-sm text-foreground focus:outline-none focus:border-primary transition-colors [&::-webkit-calendar-picker-indicator]:invert"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-body text-[10px] uppercase tracking-widest text-primary mb-3 ml-2 block">Snooze Settings</label>
                  <select 
                    value={draftGoalStepSnooze}
                    onChange={(e) => setDraftGoalStepSnooze(e.target.value)}
                    className="w-full bg-input border border-border rounded-lg px-4 py-3 font-body text-sm text-foreground focus:outline-none focus:border-primary transition-colors appearance-none"
                  >
                    {BUG_ME_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value} className="bg-background text-foreground">{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default Scheduler;

