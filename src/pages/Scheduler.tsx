import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Plus, Bell, Trash2, Hammer, Heart, Sparkles, Target,
  CheckCircle2, Circle, BookOpen, AlarmClock, FileText, type LucideIcon
} from "lucide-react";
import { useSchedulerTasks, type SchedulerTask } from "@/hooks/useSchedulerTasks";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: "build_it", label: "Build It", icon: Hammer, desc: "Business & Skills" },
  { value: "feed_it", label: "Feed It", icon: Heart, desc: "Health & Mindset" },
  { value: "live_it", label: "Live It", icon: Sparkles, desc: "Lifestyle & Joy" },
] as const;

const TIMEFRAMES = [
  { value: "1_week", label: "This Week" },
  { value: "1_month", label: "1 Month" },
  { value: "3_months", label: "3 Months" },
  { value: "6_months", label: "6 Months" },
  { value: "9_months", label: "9 Months" },
] as const;

const SNOOZE_OPTIONS = [
  { value: "none", label: "Off" },
  { value: "every_minute", label: "Every Min" },
  { value: "every_hour", label: "Every Hour" },
] as const;

// ─── Goal Templates (from Ché's Spin Brief) ─────────────────────────────────

interface GoalTemplate {
  id: string;
  title: string;
  category: "build_it" | "feed_it" | "live_it";
  icon: LucideIcon;
  truth: string; // Brickhouse truth statement
  phases: {
    label: string;
    timeframe: string;
    tasks: string[];
  }[];
}

const GOAL_TEMPLATES: GoalTemplate[] = [
  {
    id: "attract_love",
    title: "Attract Love",
    category: "live_it",
    icon: Heart,
    truth: "You don't chase love. You become the frequency it can't resist.",
    phases: [
      { label: "This Week", timeframe: "1_week", tasks: ["Complete Life Audit — Relationships score", "Write your Non-Negotiables list (10 items)", "Delete or archive 3 dead-end connections"] },
      { label: "This Month", timeframe: "1_month", tasks: ["Read or listen to 1 attachment theory resource", "Start wake up affirmation: 'I am magnetic to aligned love'", "Journal: 'What patterns do I repeat in relationships?'"] },
      { label: "3 Months", timeframe: "3_months", tasks: ["Attend 1 social event outside your comfort zone", "Practice boundary-setting in 3 real conversations", "Create your Goddess Rx self-care ritual"] },
      { label: "6 Months", timeframe: "6_months", tasks: ["Evaluate new connections against your Non-Negotiables", "Book a solo trip or experience to celebrate your growth", "Write a letter to your future partner"] },
    ],
  },
  {
    id: "body_transformation",
    title: "Body Transformation",
    category: "feed_it",
    icon: Heart,
    truth: "Your body is the first brick. Every discipline builds the next one.",
    phases: [
      { label: "This Week", timeframe: "1_week", tasks: ["Complete Life Audit — Body & Health score", "Log 3 days of meals (no judgment, just data)", "Walk 20 minutes every morning before screens"] },
      { label: "This Month", timeframe: "1_month", tasks: ["Establish a consistent sleep schedule (±30 min)", "Replace 1 unhealthy meal habit per week", "Start body movement routine (yoga, weights, or dance)"] },
      { label: "3 Months", timeframe: "3_months", tasks: ["Take progress photos (front, side, back)", "Complete 30-day consistency streak on any exercise", "Research supplementation for your body type"] },
      { label: "6 Months", timeframe: "6_months", tasks: ["Hit at least 1 measurable fitness milestone", "Overhaul pantry/kitchen to reflect new standards", "Write your Body Manifesto — what your body means to you"] },
    ],
  },
  {
    id: "publish_book",
    title: "Publish a Book",
    category: "build_it",
    icon: BookOpen,
    truth: "A book is a brick. It proves you can build something that outlives the conversation.",
    phases: [
      { label: "This Week", timeframe: "1_week", tasks: ["Define your book's core thesis in 1 sentence", "List 10-15 chapter topics from your lived experience", "Set a daily writing block (minimum 25 minutes)"] },
      { label: "This Month", timeframe: "1_month", tasks: ["Write 10,000+ words of raw content", "Research 3 self-publishing platforms (KDP, Lulu, IngramSpark)", "Create working title + subtitle options"] },
      { label: "3 Months", timeframe: "3_months", tasks: ["Complete first draft (minimum 30,000 words)", "Get 2 trusted readers for honest feedback", "Design the book cover (or commission it)"] },
      { label: "6 Months", timeframe: "6_months", tasks: ["Complete final edit and formatting", "Set up pre-order campaign", "Launch book + host a virtual release event"] },
    ],
  },
  {
    id: "build_business",
    title: "Build / Relaunch Business",
    category: "build_it",
    icon: Hammer,
    truth: "A business without architecture is just an expensive hobby. Build the infra first.",
    phases: [
      { label: "This Week", timeframe: "1_week", tasks: ["Define your 1-sentence value proposition", "Identify your ICP (Ideal Client Profile) in detail", "Audit your current digital presence (website, socials)"] },
      { label: "This Month", timeframe: "1_month", tasks: ["Build or update your core landing page", "Set up your offer stack (free → mid → high-ticket)", "Launch 1 lead magnet or diagnostic tool"] },
      { label: "3 Months", timeframe: "3_months", tasks: ["Reach first 10 paying clients or customers", "Automate onboarding and fulfillment workflows", "Build a content engine (weekly output cadence)"] },
      { label: "6 Months", timeframe: "6_months", tasks: ["Hit revenue target of $5K/mo recurring", "Hire or contract 1 support role", "Create a 90-day scaling roadmap for next phase"] },
    ],
  },
  {
    id: "rebuild_finances",
    title: "Rebuild Finances",
    category: "build_it",
    icon: Target,
    truth: "Financial sovereignty starts with visibility. You can't manage what you refuse to measure.",
    phases: [
      { label: "This Week", timeframe: "1_week", tasks: ["Complete Life Audit — Business & Wealth score", "List ALL debts with balances and interest rates", "Set up a budget tracker or spreadsheet"] },
      { label: "This Month", timeframe: "1_month", tasks: ["Cut 3 unnecessary subscriptions or expenses", "Open a dedicated savings account (even if starting at $25)", "Research 1 new income stream aligned with your skills"] },
      { label: "3 Months", timeframe: "3_months", tasks: ["Build emergency fund to $500+", "Pay off or negotiate 1 debt balance", "Start investing in financial education (1 book or course)"] },
      { label: "6 Months", timeframe: "6_months", tasks: ["Achieve consistent positive cash flow for 2+ months", "Create a 12-month financial roadmap", "Automate savings (pay yourself first)"] },
    ],
  },
  {
    id: "heal_rebuild",
    title: "Heal and Rebuild",
    category: "feed_it",
    icon: Sparkles,
    truth: "Healing isn't soft. It's the most aggressive renovation project you'll ever run.",
    phases: [
      { label: "This Week", timeframe: "1_week", tasks: ["Complete Life Audit — Spirit & Purpose score", "Identify 1 specific wound or pattern to address", "Begin a daily journaling practice (5 min minimum)"] },
      { label: "This Month", timeframe: "1_month", tasks: ["Start a morning ritual (meditation, prayer, or breathwork)", "Read or listen to 1 healing-focused resource", "Have 1 honest conversation you've been avoiding"] },
      { label: "3 Months", timeframe: "3_months", tasks: ["Establish consistent therapy, coaching, or support group", "Forgive or release 1 person/situation through a ritual", "Notice and document 3 behavioral pattern shifts"] },
      { label: "6 Months", timeframe: "6_months", tasks: ["Write a letter of closure (sent or unsent)", "Create a 'new foundation' vision board for your next chapter", "Celebrate progress — host a small ceremony for yourself"] },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatTime = (t?: string) => {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const display = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${display}:${m} ${ampm}`;
};

// ─── Component ───────────────────────────────────────────────────────────────

const Scheduler = () => {
  const { tasks, isLoading, addTask, updateTask, deleteTask } = useSchedulerTasks();
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("build_it");
  const [timeframe, setTimeframe] = useState<string>("1_week");
  const [selectedTemplate, setSelectedTemplate] = useState<GoalTemplate | null>(null);

  // Filter tasks
  const goals = tasks.filter((t) => !t.parent_goal_id && t.reminder_type === "goal");
  const subtasks = tasks.filter((t) => t.parent_goal_id);

  const filteredTemplates = GOAL_TEMPLATES.filter((t) => t.category === category);

  const resetForm = () => {
    setTitle("");
    setCategory("build_it");
    setTimeframe("1_week");
    setSelectedTemplate(null);
    setShowGoalForm(false);
  };

  const selectTemplate = (template: GoalTemplate) => {
    setSelectedTemplate(template);
    setTitle(template.title);
    setCategory(template.category);
  };

  const handleGenerateRoadmap = async () => {
    if (!title.trim()) {
      toast.error("Give your goal a name");
      return;
    }

    // If a template is selected, generate time-phased subtasks from it.
    // Otherwise, generate generic subtasks (backward compatible).
    const phasedTasks = selectedTemplate
      ? selectedTemplate.phases
          .flatMap((phase) =>
            phase.tasks.map((taskTitle, i) => ({
              title: `[${phase.label}] ${taskTitle}`,
              time_of_day: i === 0 ? "09:00:00" : i === 1 ? "13:00:00" : "18:00:00",
              escalation_level: Math.min(i + 1, 3),
            }))
          )
      : [
          { title: "Research & Preparation", time_of_day: "09:00:00", escalation_level: 1 },
          { title: "Execute Core Actions", time_of_day: "13:00:00", escalation_level: 2 },
          { title: "Review & Refine", time_of_day: "18:00:00", escalation_level: 3 },
        ];

    addTask.mutate(
      {
        title: title.trim(),
        category,
        timeframe,
        task_type: "goal",
        reminder_type: "goal",
        is_active: true,
      },
      {
        onSuccess: (newGoal) => {
          phasedTasks.forEach((sub) => {
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
    if (!t.is_completed) toast.success("Task completed! 🎯");
  };

  const handleDelete = (id: string, isGoal: boolean) => {
    deleteTask.mutate(id, {
      onSuccess: () => toast.success(isGoal ? "Goal deleted" : "Task removed"),
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
                {/* Category Selector */}
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
                          onClick={() => { setCategory(c.value); setSelectedTemplate(null); setTitle(""); }}
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

                {/* Goal Templates for Selected Category */}
                {filteredTemplates.length > 0 && (
                  <div>
                    <label className="font-body text-[10px] text-muted-foreground uppercase tracking-wider block mb-1.5">
                      Brickhouse Templates
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {filteredTemplates.map((t) => {
                        const Icon = t.icon;
                        const isActive = selectedTemplate?.id === t.id;
                        return (
                          <button
                            key={t.id}
                            onClick={() => selectTemplate(t)}
                            className={cn(
                              "p-3 rounded-xl border text-left transition-all",
                              isActive
                                ? "bg-accent/10 border-accent/40"
                                : "bg-foreground/[0.02] border-border hover:border-accent/20"
                            )}
                          >
                            <Icon className={cn("w-4 h-4 mb-1", isActive ? "text-accent" : "text-muted-foreground")} />
                            <div className="font-display text-xs tracking-wide">{t.title}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Truth Statement */}
                {selectedTemplate && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-primary/5 border border-primary/20 rounded-xl p-4"
                  >
                    <p className="font-body text-xs text-primary/80 italic leading-relaxed">
                      "{selectedTemplate.truth}"
                    </p>
                  </motion.div>
                )}

                {/* Title (pre-filled from template or custom) */}
                <div>
                  <label className="font-body text-[10px] text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Goal Name
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={selectedTemplate ? selectedTemplate.title : "e.g. Launch my agency"}
                    maxLength={100}
                    className="w-full bg-input border border-border rounded-lg px-3 py-2.5 font-body text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                {/* Timeframe */}
                <div>
                  <label className="font-body text-[10px] text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Timeframe
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TIMEFRAMES.map((t) => (
                      <button
                        key={t.value}
                        onClick={() => setTimeframe(t.value)}
                        className={cn(
                          "py-2 px-3 rounded-lg font-body text-[10px] tracking-wider border transition-all",
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
                  {addTask.isPending ? "Generating..." : selectedTemplate ? "Generate Brickhouse Roadmap" : "Generate Roadmap"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Goals List */}
        <div className="space-y-8 pb-10">
          {goals.length === 0 && !showGoalForm ? (
            <div className="text-center py-16 bg-gradient-card border border-border rounded-xl">
              <Target className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="font-body text-sm text-muted-foreground">No active goals.</p>
              <p className="font-body text-xs text-muted-foreground/60 mt-1">
                Start building your Life Architecture roadmap.
              </p>
            </div>
          ) : (
            CATEGORIES.map((categoryInfo) => {
              const categoryGoals = goals.filter((g) => g.category === categoryInfo.value);
              if (categoryGoals.length === 0) return null;
              
              const CategoryIcon = categoryInfo.icon;

              return (
                <div key={categoryInfo.value} className="mb-10 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-3 mb-5 border-b border-border/40 pb-3">
                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                      <CategoryIcon className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-display text-xl tracking-wider text-foreground">
                      {categoryInfo.label}
                    </h3>
                    <span className="font-body text-[10px] uppercase text-muted-foreground font-normal tracking-wide bg-foreground/5 px-2 py-0.5 rounded ml-2">
                      {categoryInfo.desc}
                    </span>
                  </div>
                  
                  <div className="space-y-6">
                    {categoryGoals.map((goal) => {
                      const Icon = getCategoryIcon(goal.category);
                      const goalSubtasks = subtasks.filter((s) => s.parent_goal_id === goal.id);
                      const completedCount = goalSubtasks.filter((s) => s.is_completed).length;
                      const progressPercent = goalSubtasks.length > 0 ? Math.round((completedCount / goalSubtasks.length) * 100) : 0;

                      return (
                        <div key={goal.id} className="space-y-4 group">
                          {/* Goal Header */}
                          <div className="flex items-center gap-4 bg-muted/40 p-4 rounded-xl border border-border relative overflow-hidden transition-all hover:bg-muted/60">
                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-pink" />

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
                                <span className="font-body text-[10px] tracking-wider uppercase text-accent">
                                  {TIMEFRAMES.find((t) => t.value === goal.timeframe)?.label || goal.timeframe}
                                </span>
                                {goalSubtasks.length > 0 && (
                                  <>
                                    <span className="w-1 h-1 rounded-full bg-border" />
                                    <span className="font-body text-[10px] tracking-wider uppercase text-primary">
                                      {progressPercent}% Complete
                                    </span>
                                  </>
                                )}
                              </div>
                              {/* Progress bar */}
                              {goalSubtasks.length > 0 && (
                                <div className="w-full h-1.5 bg-border/50 rounded-full mt-3 overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-pink rounded-full transition-all duration-500"
                                    style={{ width: `${progressPercent}%` }}
                                  />
                                </div>
                              )}
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
                                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                    {task.time_of_day && (
                                      <span className="font-body text-[9px] text-muted-foreground flex items-center gap-1 bg-foreground/[0.03] px-1.5 py-0.5 rounded">
                                        <Bell className="w-2.5 h-2.5" />
                                        {formatTime(task.time_of_day)}
                                        {task.escalation_level && (
                                          <span className={cn("ml-1 uppercase text-[8px]",
                                            task.escalation_level === 3 ? "text-destructive" :
                                            task.escalation_level === 2 ? "text-accent" : "text-primary"
                                          )}>
                                            Lvl {task.escalation_level}
                                          </span>
                                        )}
                                      </span>
                                    )}
                                    {/* Snooze Interval Selector */}
                                    <div className="flex items-center gap-1 bg-foreground/[0.03] px-1.5 py-0.5 rounded border border-transparent hover:border-border transition-colors">
                                      <select
                                        value={task.snooze_interval || "none"}
                                        onChange={(e) => updateTask.mutate({ id: task.id, snooze_interval: e.target.value })}
                                        className="font-body text-[9px] bg-transparent text-muted-foreground focus:outline-none cursor-pointer"
                                        title="Snooze reminder interval"
                                      >
                                        {SNOOZE_OPTIONS.map((o) => (
                                          <option key={o.value} value={o.value}>{o.label === "Off" ? "🔕 Snooze Off" : `🔔 ${o.label}`}</option>
                                        ))}
                                      </select>
                                    </div>
                                    {task.snooze_interval && task.snooze_interval !== "none" && (
                                      <span className="font-body text-[8px] text-accent font-medium uppercase flex items-center gap-0.5 bg-accent/10 px-1.5 py-0.5 rounded">
                                        <AlarmClock className="w-2 h-2" /> Persistent
                                      </span>
                                    )}
                                  </div>
                                  {/* Notes */}
                                  {task.notes && (
                                    <p className="font-body text-[9px] text-muted-foreground/70 mt-1.5 flex items-start gap-1 p-2 bg-muted/30 rounded-md border border-border/50">
                                      <FileText className="w-2.5 h-2.5 mt-0.5 shrink-0" />
                                      {task.notes}
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
                    })}
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
