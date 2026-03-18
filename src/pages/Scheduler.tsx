import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, CalendarClock, Bell, BellOff, Trash2, Blocks, Sunrise, Diamond } from "lucide-react";
import { useReminders, type Reminder } from "@/hooks/useReminders";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "ritual", label: "Daily Ritual", icon: Sunrise },
  { value: "bricks", label: "Brick Lesson", icon: Blocks },
  { value: "affirmations", label: "Affirmations", icon: Diamond },
] as const;

const DAYS = [
  { value: 1, label: "M" },
  { value: 2, label: "T" },
  { value: 3, label: "W" },
  { value: 4, label: "T" },
  { value: 5, label: "F" },
  { value: 6, label: "S" },
  { value: 7, label: "S" },
];

const formatTime = (t: string) => {
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const display = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${display}:${m} ${ampm}`;
};

const Scheduler = () => {
  const { reminders, isLoading, addReminder, updateReminder, deleteReminder } = useReminders();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("ritual");
  const [timeOfDay, setTimeOfDay] = useState("09:00");
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 7]);

  const resetForm = () => {
    setTitle("");
    setCategory("ritual");
    setTimeOfDay("09:00");
    setSelectedDays([1, 2, 3, 4, 5, 6, 7]);
    setShowForm(false);
  };

  const handleAdd = () => {
    if (!title.trim()) {
      toast.error("Give your reminder a name");
      return;
    }
    if (selectedDays.length === 0) {
      toast.error("Select at least one day");
      return;
    }
    addReminder.mutate(
      {
        title: title.trim(),
        category,
        reminder_type: selectedDays.length === 7 ? "daily" : "weekly",
        time_of_day: timeOfDay + ":00",
        days_of_week: selectedDays,
        is_active: true,
      },
      {
        onSuccess: () => {
          toast.success("Reminder set 🔔");
          resetForm();
        },
      }
    );
  };

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const toggleActive = (r: Reminder) => {
    updateReminder.mutate({ id: r.id, is_active: !r.is_active });
  };

  const handleDelete = (id: string) => {
    deleteReminder.mutate(id, {
      onSuccess: () => toast.success("Reminder removed"),
    });
  };

  const getCategoryIcon = (cat: string) => {
    const found = CATEGORIES.find((c) => c.value === cat);
    return found?.icon ?? CalendarClock;
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
            My <span className="text-accent">Schedule</span>
          </h1>
        </div>
        <p className="font-body text-sm text-muted-foreground mb-6 ml-8">
          Set reminders so you never miss a ritual.
        </p>

        {/* Add Button */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full flex items-center justify-center gap-2 bg-gradient-pink text-foreground font-body font-bold text-xs tracking-wider uppercase px-5 py-3 rounded-xl mb-6 hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          {showForm ? "Cancel" : "New Reminder"}
        </button>

        {/* New Reminder Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-gradient-card border border-border rounded-xl p-5 space-y-4">
                {/* Title */}
                <div>
                  <label className="font-body text-[10px] text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Reminder Name
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Morning Affirmation Check-In"
                    maxLength={100}
                    className="w-full bg-input border border-border rounded-lg px-3 py-2.5 font-body text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="font-body text-[10px] text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Category
                  </label>
                  <div className="flex gap-2">
                    {CATEGORIES.map((c) => {
                      const Icon = c.icon;
                      return (
                        <button
                          key={c.value}
                          onClick={() => setCategory(c.value)}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-body text-[10px] tracking-wider border transition-all",
                            category === c.value
                              ? "bg-primary/20 border-primary/40 text-primary"
                              : "bg-foreground/[0.03] border-border text-muted-foreground hover:border-primary/20"
                          )}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {c.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time */}
                <div>
                  <label className="font-body text-[10px] text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Time
                  </label>
                  <input
                    type="time"
                    value={timeOfDay}
                    onChange={(e) => setTimeOfDay(e.target.value)}
                    className="bg-input border border-border rounded-lg px-3 py-2.5 font-body text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                {/* Days */}
                <div>
                  <label className="font-body text-[10px] text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Days
                  </label>
                  <div className="flex gap-1.5">
                    {DAYS.map((d) => (
                      <button
                        key={d.value}
                        onClick={() => toggleDay(d.value)}
                        className={cn(
                          "w-9 h-9 rounded-lg font-display text-sm transition-all",
                          selectedDays.includes(d.value)
                            ? "bg-accent text-accent-foreground"
                            : "bg-foreground/[0.05] text-muted-foreground hover:bg-foreground/10"
                        )}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Save */}
                <button
                  onClick={handleAdd}
                  disabled={addReminder.isPending}
                  className="w-full bg-gradient-pink text-foreground font-body font-bold text-xs tracking-wider uppercase px-5 py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  {addReminder.isPending ? "Saving…" : "Save Reminder"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reminders List */}
        {reminders.length === 0 && !showForm ? (
          <div className="text-center py-16">
            <CalendarClock className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="font-body text-sm text-muted-foreground">No reminders yet.</p>
            <p className="font-body text-xs text-muted-foreground/60 mt-1">
              Tap "New Reminder" to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map((r) => {
              const Icon = getCategoryIcon(r.category);
              return (
                <motion.div
                  key={r.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "border rounded-xl p-4 transition-all",
                    r.is_active
                      ? "bg-gradient-card border-border"
                      : "bg-gradient-card border-border opacity-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-sm tracking-wider truncate">{r.title}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-body text-[10px] text-accent">
                          {formatTime(r.time_of_day)}
                        </span>
                        <span className="font-body text-[10px] text-muted-foreground">
                          {r.days_of_week.length === 7
                            ? "Every day"
                            : r.days_of_week.map((d) => DAYS[d - 1]?.label).join(", ")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleActive(r)}
                        className="p-2 rounded-lg hover:bg-foreground/10 transition-colors"
                        title={r.is_active ? "Pause" : "Activate"}
                      >
                        {r.is_active ? (
                          <Bell className="w-4 h-4 text-accent" />
                        ) : (
                          <BellOff className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="p-2 rounded-lg hover:bg-destructive/20 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Scheduler;
