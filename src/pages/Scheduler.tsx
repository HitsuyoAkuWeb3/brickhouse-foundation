import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useAnimation, type PanInfo } from "framer-motion";
import {
  ChevronLeft, Sparkles, Pin, Paperclip, Home, Trees,
  Edit2, Trash2, Bug, Hourglass, Share, CheckCircle2, Circle,
  MousePointer, Plus, X
} from "lucide-react";
import { useSchedulerTasks, type SchedulerTask } from "@/hooks/useSchedulerTasks";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format, addMinutes } from "date-fns";

// --- Theme Colors ---
const THEME = {
  header: "bg-[#009EDB]",       // Screen top header
  background: "bg-[#9CBCCC]",   // Screen main body
  card: "bg-white",             // Unused mostly, but cards are grayish
  pickerBox: "bg-[#5A5A5A]",    // Dark grey quick pickers
};

// --- Icons ---
/* eslint-disable @typescript-eslint/no-explicit-any */
const ICON_MAP: Record<string, React.FC<any>> = {
  finger: MousePointer,
  sparkles: Sparkles,
  pin: Pin,
  paperclip: Paperclip,
  home: Home,
  forest: Trees,
};

const BUG_ME_OPTIONS = [
  { label: "None", value: "none" },
  { label: "1 Minute", value: "every_minute" },
  { label: "1 Hour", value: "every_hour" },
];

const TIME_QUICK_PICKERS = [5, 10, 15, 30, 45, 60];

// --- Swipeable Reminder Card ---
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
  const Icon = ICON_MAP[task.category || "finger"] || ICON_MAP.finger;

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // If swiped far enough left, snap to -200px (reveal actions), else snap back
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
    <div className="relative mb-3 overflow-hidden rounded-xl bg-black">
      {/* Background Actions (Revealed via Swipe) */}
      <div className="absolute right-0 top-0 h-full flex items-center justify-end px-4 gap-4 bg-[#5A5A5A] text-white/50 w-full rounded-xl border border-blue-600">
        <button className="hover:text-white transition-colors"><Edit2 className="w-5 h-5" /></button>
        <button className="hover:text-white transition-colors" onClick={() => onBugMeClick(task)}><Bug className="w-5 h-5" /></button>
        <button className="hover:text-white transition-colors"><Hourglass className="w-5 h-5" /></button>
        <button className="hover:text-white transition-colors"><Share className="w-5 h-5" /></button>
        <button className="hover:text-green-400 transition-colors" onClick={() => onToggle(task)}>
          <CheckCircle2 className="w-5 h-5" />
        </button>
        <button className="hover:text-red-400 transition-colors ml-2" onClick={() => onDelete(task.id)}>
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Foreground Draggable Card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -180, right: 0 }}
        onDragEnd={handleDragEnd}
        animate={controls}
        className={cn(
          "relative z-10 p-4 rounded-xl border-2 border-blue-600 bg-gray-300 flex items-start gap-4 transition-colors",
          task.is_completed ? "opacity-50 grayscale" : ""
        )}
      >
        <div className="pt-1">
          <Icon className="w-8 h-8 text-black/40" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={cn("text-[17px] font-bold text-black leading-tight break-words", task.is_completed && "line-through opacity-70")}>
            {task.title}
          </h3>
          <div className="flex items-end justify-between mt-1">
            <p className="text-[13px] text-black/70">
              {formattedDate}
            </p>
            {task.snooze_interval && task.snooze_interval !== "none" && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-black/60 bg-black/10 px-1.5 py-0.5 rounded">
                {task.snooze_interval === "every_minute" ? "1m" : "1h"} <Bug className="w-3 h-3" />
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- Time Scroller (Fallback) ---
// Since building a native iOS spinner in React is complex, we use a structured layout
// mimicking the design, combined with quick pickers.

const Scheduler = () => {
  const { tasks, isLoading, addTask, updateTask, deleteTask } = useSchedulerTasks();
  const [view, setView] = useState<"list" | "step1" | "step2">("list");
  
  // Creation Form State
  const [draftTitle, setDraftTitle] = useState("");
  const [draftIcon, setDraftIcon] = useState("finger");
  const [draftMinutes, setDraftMinutes] = useState<number>(5);
  const [isDoneLoading, setIsDoneLoading] = useState(false);

  // Bug Me Sheet State
  const [bugMeTask, setBugMeTask] = useState<SchedulerTask | null>(null);

  // Filter tasks into active RE.minders
  const reminders = tasks.filter((t) => !t.parent_goal_id)
    .sort((a, b) => new Date(a.scheduled_for || a.created_at).getTime() - new Date(b.scheduled_for || b.created_at).getTime());

  // Action Handlers
  const handleToggle = (task: SchedulerTask) => {
    updateTask.mutate({ id: task.id, is_completed: !task.is_completed });
    if (!task.is_completed) toast.success("RE.minder completed!");
  };

  const handleDelete = (id: string) => {
    deleteTask.mutate(id, { onSuccess: () => toast.success("RE.minder deleted") });
  };

  const handleCreate = async () => {
    if (!draftTitle.trim()) {
      toast.error("Please enter what to remind you about.");
      return;
    }
    setIsDoneLoading(true);

    const scheduledDate = addMinutes(new Date(), draftMinutes);

    addTask.mutate(
      {
        title: draftTitle.trim(),
        category: draftIcon,
        reminder_type: "one_off",
        task_type: "custom",
        scheduled_for: scheduledDate.toISOString(),
        is_active: true,
      },
      {
        onSuccess: () => {
          toast.success("RE.minder created!");
          setIsDoneLoading(false);
          setDraftTitle("");
          setDraftIcon("finger");
          setDraftMinutes(5);
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
      {
        onSuccess: () => {
          toast.success("Bug Me setting updated");
          setBugMeTask(null);
        }
      }
    );
  };

  if (isLoading) return null;

  return (
    <div className={cn("min-h-screen font-sans", THEME.background)}>
      <div className="max-w-md mx-auto h-screen flex flex-col relative bg-gradient-to-b from-[#9CBCCC] to-[#AECBD9]">
        
        {/* VIEW 1: LIST */}
        <AnimatePresence mode="wait">
          {view === "list" && (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col h-full absolute inset-0 pb-16"
            >
              {/* Header */}
              <div className={cn("flex items-center justify-between px-4 py-4", THEME.header, "text-white shadow-xl relative z-20")}>
                <Link to="/dashboard" className="text-white hover:opacity-80 transition-opacity">
                  <ChevronLeft className="w-8 h-8" />
                </Link>
                <h1 className="text-xl font-bold tracking-wide absolute left-1/2 -translate-x-1/2">
                  RE.minders
                </h1>
                <button onClick={() => setView("step1")} className="hover:opacity-80 transition-opacity">
                  <Plus className="w-7 h-7 font-light" />
                </button>
              </div>

              {/* Ticker */}
              <div className="bg-[#0A1A1A] py-1 text-center shadow-lg border-b border-black/20">
                <p className="text-[#00FF00] font-sans text-[13px]">
                  Next RE.minder in {reminders.length > 0 && reminders[0].scheduled_for ? 
                    Math.max(0, Math.round((new Date(reminders[0].scheduled_for).getTime() - Date.now()) / 60000)) 
                    : "0"} minutes
                </p>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {reminders.length === 0 ? (
                  <div className="text-center py-20 opacity-60">
                    <MousePointer className="w-12 h-12 mx-auto mb-4 text-black/40" />
                    <p className="text-black/60 font-medium">No active RE.minders</p>
                  </div>
                ) : (
                  reminders.map((task) => (
                    <ReminderCard
                      key={task.id}
                      task={task}
                      onToggle={handleToggle}
                      onDelete={handleDelete}
                      onBugMeClick={setBugMeTask}
                    />
                  ))
                )}
              </div>

              {/* Bug Me Action Sheet Context Menu */}
              <AnimatePresence>
                {bugMeTask && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/40 z-40 max-w-md mx-auto"
                      onClick={() => setBugMeTask(null)}
                    />
                    <motion.div
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "100%" }}
                      transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                      className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-50 p-2 pb-6"
                    >
                      <div className="bg-white/90 backdrop-blur-md rounded-2xl overflow-hidden mb-2 shadow-2xl">
                        <div className="py-3 text-center border-b border-black/10">
                          <p className="text-[#8F8F8F] text-[13px] font-medium">Bug Me</p>
                        </div>
                        {BUG_ME_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => handleUpdateBugMe(opt.value)}
                            className="w-full py-4 text-center border-b border-black/10 text-xl text-[#007AFF] hover:bg-black/5 transition-colors"
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setBugMeTask(null)}
                        className="w-full py-4 text-center rounded-2xl bg-white text-xl font-bold text-[#007AFF] shadow-xl hover:bg-black/5 transition-colors"
                      >
                        Cancel
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* VIEW 2: CREATE STEP 1 */}
          {view === "step1" && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col h-full absolute inset-0 z-30 bg-[#9CBCCC]"
            >
              {/* Header */}
              <div className={cn("flex items-center justify-between px-4 py-4", THEME.header, "text-white")}>
                <button onClick={() => setView("list")} className="text-[17px] hover:opacity-80 transition-opacity">
                  Cancel
                </button>
                <h1 className="text-[17px] font-bold tracking-wide absolute left-1/2 -translate-x-1/2">
                  New RE.minder
                </h1>
                <button 
                  onClick={() => draftTitle.trim() && setView("step2")} 
                  className={cn("text-[17px] font-medium transition-opacity", !draftTitle.trim() ? "opacity-50" : "hover:opacity-80")}
                  disabled={!draftTitle.trim()}
                >
                  Next
                </button>
              </div>

              {/* Form Body */}
              <div className="p-4 flex flex-col mt-4">
                <label className="text-white font-bold text-lg mb-2 drop-shadow-sm">RE.mind me to:</label>
                <div className="relative">
                  <input
                    type="text"
                    autoFocus
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    className="w-full bg-white text-black text-[17px] py-3 pl-4 pr-10 rounded-lg shadow-sm focus:outline-none"
                    placeholder="App"
                  />
                  {draftTitle && (
                    <button
                      onClick={() => setDraftTitle("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/20 rounded-full p-0.5"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  )}
                </div>

                <label className="text-white font-bold text-sm mt-12 mb-3 drop-shadow-sm">Quick Pickers:</label>
                <div className="flex flex-wrap gap-2.5">
                  {Object.entries(ICON_MAP).map(([key, Icon]) => (
                    <button
                      key={key}
                      onClick={() => setDraftIcon(key)}
                      className={cn(
                        THEME.pickerBox,
                        "w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-md relative overflow-hidden",
                        draftIcon === key ? "ring-2 ring-white scale-105" : "hover:bg-opacity-80"
                      )}
                    >
                      <Icon className={cn("w-9 h-9", draftIcon === key ? "text-white" : "text-black")} />
                      
                      {/* Fake mini-text line indicator from the screenshot */}
                      <div className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 bg-black/20 rounded-full flex flex-col items-center justify-center gap-[1px] opacity-60">
                         <span className="w-1.5 h-[1px] bg-black/60 rounded"></span>
                         <span className="w-1.5 h-[1px] bg-black/60 rounded"></span>
                         <span className="w-1.5 h-[1px] bg-black/60 rounded"></span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* VIEW 3: CREATE STEP 2 */}
          {view === "step2" && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 flex flex-col h-full absolute inset-0 z-30 bg-[#9CBCCC]"
            >
              {/* Header */}
              <div className={cn("flex items-center justify-between px-4 py-4 pt-12", THEME.header, "text-white")}>
                <button onClick={() => setView("step1")} className="text-[17px] flex items-center hover:opacity-80 transition-opacity">
                  <ChevronLeft className="w-6 h-6 mr-0.5" /> Back
                </button>
                <h1 className="text-[17px] font-bold tracking-wide absolute left-1/2 -translate-x-1/2">
                  {draftTitle.substring(0, 15)}{draftTitle.length > 15 ? "..." : ""}
                </h1>
                <button 
                  onClick={handleCreate}
                  disabled={isDoneLoading}
                  className="text-[17px] font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
                >
                  {isDoneLoading ? "..." : "Done"}
                </button>
              </div>

              {/* Form Body */}
              <div className="p-4 flex flex-col mt-4">
                <label className="text-white font-bold text-lg mb-2 drop-shadow-sm">RE.mind me in:</label>
                <input
                  type="text"
                  readOnly
                  value={`${draftMinutes} minutes`}
                  className="w-full bg-white text-black text-[17px] py-3 px-4 rounded-lg shadow-sm focus:outline-none"
                />

                <label className="text-white font-bold text-sm mt-12 mb-3 drop-shadow-sm">Quick Pickers:</label>
                <div className="flex flex-wrap gap-2.5">
                  {TIME_QUICK_PICKERS.map((mins) => (
                    <button
                      key={mins}
                      onClick={() => setDraftMinutes(mins)}
                      className={cn(
                        THEME.pickerBox,
                        "w-16 h-16 rounded-xl flex flex-col items-center justify-center transition-all shadow-md text-white",
                        draftMinutes === mins ? "ring-2 ring-white scale-105" : "hover:bg-opacity-80"
                      )}
                    >
                      <span className="text-2xl font-bold leading-none">{mins}</span>
                      <span className="text-[10px] font-medium opacity-80 mt-0.5">min</span>
                    </button>
                  ))}
                </div>

                {/* Mock Date Picker Spinner Area (Visual mapping for screenshot fidelity) */}
                <div className="flex-1 mt-12 relative flex items-center justify-center h-48 pointer-events-none opacity-40 mix-blend-multiply">
                   <div className="absolute w-full h-8 bg-black/10 rounded-md top-1/2 -translate-y-1/2" />
                   <div className="flex gap-8 text-black/60 font-medium text-xl items-center pb-2">
                      <div className="text-right w-24 leading-loose">
                        <div className="opacity-30">Tue Mar 24</div>
                        <div className="opacity-60">Wed Mar 25</div>
                        <div className="text-black text-2xl">Today</div>
                        <div className="opacity-60">Fri Mar 27</div>
                        <div className="opacity-30">Sat Mar 28</div>
                      </div>
                      <div className="text-center w-8 leading-loose">
                        <div className="opacity-30">5</div>
                        <div className="opacity-60">6</div>
                        <div className="text-black text-2xl">7</div>
                        <div className="opacity-60">8</div>
                        <div className="opacity-30">9</div>
                      </div>
                      <div className="text-center w-8 leading-loose">
                        <div className="opacity-30">05</div>
                        <div className="opacity-60">06</div>
                        <div className="text-black text-2xl">07</div>
                        <div className="opacity-60">08</div>
                        <div className="opacity-30">09</div>
                      </div>
                      <div className="text-left w-8 leading-loose">
                        <div className="text-black text-2xl">AM</div>
                        <div className="opacity-60">PM</div>
                        <div className="opacity-0">PM</div>
                        <div className="opacity-0">PM</div>
                        <div className="opacity-0">PM</div>
                      </div>
                   </div>
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
