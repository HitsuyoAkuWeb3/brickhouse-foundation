import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Slider } from "@/components/ui/slider";

export type RitualType = "morning_affirmation" | "midday_checkin" | "evening_reflection";

interface Step {
  id: string;
  title: string;
  prompt: string;
  type: "input" | "timer" | "slider" | "passion_timer";
  duration?: number; // for timer
  key?: string; // for data saving
}

const RITUAL_CONFIGS: Record<RitualType, Step[]> = {
  morning_affirmation: [
    { id: "gratitude", title: "Gratitude", prompt: "What are you grateful for today?", type: "input", key: "gratitude_note" },
    { id: "intention", title: "Intention", prompt: "What is your intention for today?", type: "input", key: "morning_intention" },
    { id: "affirmation", title: "Affirmation", prompt: "Look in the mirror. Say your I AM declarations out loud. Mean every word.", type: "timer", duration: 15 },
    { id: "joy", title: "Joy Claim", prompt: "Schedule one joyful thing today.", type: "input", key: "joy_moment" },
  ],
  midday_checkin: [
    { id: "energy", title: "Energy Check", prompt: "Are you aligned with your goals right now? (1 = Drowning, 10 = Flowing)", type: "slider", key: "energy_level" },
    { id: "passion", title: "Passion Pick Reset", prompt: "Visualize your ultimate goal.", type: "passion_timer", duration: 15 },
    { id: "recommit", title: "Recommit", prompt: "Breathe. Recommit to your intention.", type: "timer", duration: 15 },
    { id: "one_thing", title: "The One Thing", prompt: "What is the ONE thing you must accomplish before the day ends?", type: "input", key: "midday_one_thing" },
  ],
  evening_reflection: [
    { id: "brick", title: "Honor the Brick", prompt: "What did you build today? What brick did you lay?", type: "input", key: "evening_brick" },
    { id: "win", title: "Your Win", prompt: "Acknowledge your biggest win today.", type: "input", key: "evening_win" },
    { id: "release", title: "Your Release", prompt: "What do you need to release before you sleep?", type: "input", key: "evening_release" },
    { id: "tomorrow", title: "Tomorrow's Intention", prompt: "Set your intention for tomorrow.", type: "input", key: "tomorrow_intention" },
  ],
};

const slideVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, scale: 1.05, transition: { duration: 0.2 } },
};

interface RitualPlayerProps {
  type: RitualType;
  onClose: () => void;
  onComplete: (data: Record<string, string | number>) => void;
}

export const RitualPlayer = ({ type, onClose, onComplete }: RitualPlayerProps) => {
  const { user } = useAuth();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [data, setData] = useState<Record<string, string | number>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [timerActive, setTimerActive] = useState(false);
  const [passionMedia, setPassionMedia] = useState<string | null>(null);

  const steps = RITUAL_CONFIGS[type];
  const currentStep = steps[currentStepIndex];

  // Fetch passion pick if needed
  useEffect(() => {
    if (type === "midday_checkin" && user) {
      const fetchPassion = async () => {
        const { data } = await supabase.from("passion_picks").select("image_url").eq("user_id", user.id).limit(1).maybeSingle();
        if (data?.image_url) setPassionMedia(data.image_url);
      };
      fetchPassion();
    }
  }, [type, user]);

  // Timer logic
  useEffect(() => {
    if ((currentStep.type === "timer" || currentStep.type === "passion_timer") && currentStep.duration) {
      setTimeLeft(currentStep.duration);
      setTimerActive(true);
    } else {
      setTimerActive(false);
    }
  }, [currentStepIndex, currentStep]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timerActive && timeLeft === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      onComplete(data);
    }
  };

  const handleInput = (val: string | number) => {
    if (currentStep.key) {
      setData((prev) => ({ ...prev, [currentStep.key as string]: val }));
    }
  };

  const isNextDisabled = () => {
    if (currentStep.type === "input") {
      const val = data[currentStep.key as string];
      return !val || String(val).trim() === "";
    }
    if ((currentStep.type === "timer" || currentStep.type === "passion_timer") && timerActive) {
      return true; // wait for timer
    }
    // slider has a default of 5 if untouched, but we can just require interaction, or allow default
    if (currentStep.type === "slider") {
      return data[currentStep.key as string] === undefined;
    }
    return false;
  };

  const renderCurrentStepContent = () => {
    switch (currentStep.type) {
      case "input":
        return (
          <textarea
            autoFocus
            className="w-full bg-input border border-border rounded-xl p-5 font-body text-base text-foreground focus:outline-none focus:border-primary resize-none transition-colors"
            rows={4}
            placeholder="Type your answer here..."
            value={(data[currentStep.key as string] as string) || ""}
            onChange={(e) => handleInput(e.target.value)}
          />
        );
      case "slider":
        return (
          <div className="py-10 px-4">
            <div className="flex justify-between items-center mb-6 font-display tracking-wider">
              <span className="text-muted-foreground">1 - Drowning</span>
              <span className="text-xl text-accent">{data[currentStep.key as string] || 5}</span>
              <span className="text-muted-foreground">10 - Flowing</span>
            </div>
            <Slider
              max={10}
              min={1}
              step={1}
              value={[Number(data[currentStep.key as string]) || 5]}
              onValueChange={(vals) => handleInput(vals[0])}
            />
          </div>
        );
      case "passion_timer":
      case "timer": {
        const progress = 1 - timeLeft / (currentStep.duration || 1);
        return (
          <div className="flex flex-col items-center justify-center py-10 relative">
            {currentStep.type === "passion_timer" && passionMedia && (
              <div className="absolute inset-0 opacity-20 -z-10 rounded-2xl overflow-hidden blur-sm">
                <img src={passionMedia} alt="Passion Pick" className="w-full h-full object-cover" />
              </div>
            )}
            
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  className="stroke-border fill-none"
                  strokeWidth="4"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  className="stroke-primary fill-none transition-all duration-1000 ease-linear"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 88}
                  strokeDashoffset={2 * Math.PI * 88 * (1 - progress)}
                  strokeLinecap="round"
                />
              </svg>
              
              <div className={cn(
                "flex flex-col items-center justify-center bg-background/80 backdrop-blur-md rounded-full w-36 h-36 z-10",
                timerActive && "animate-pulse"
              )}>
                <span className="font-display text-4xl text-accent tracking-widest">{timeLeft}s</span>
                <span className="font-body text-xs text-muted-foreground uppercase tracking-widest mt-1">
                  {timerActive ? "Breathe" : "Done"}
                </span>
              </div>
            </div>
            
            {currentStep.type === "passion_timer" && passionMedia && (
              <img src={passionMedia} alt="Passion Focus" className="w-24 h-24 object-cover mt-8 rounded-xl border border-border shadow-[0_0_20px_hsl(var(--primary)/0.2)]" />
            )}
          </div>
        );
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col pt-safe-top pb-safe-bottom">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="font-display tracking-widest text-sm uppercase text-muted-foreground">
            {type.replace("_", " ")}
          </span>
        </div>
        <button onClick={onClose} className="p-2 bg-foreground/5 hover:bg-foreground/10 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center gap-2 mt-4 px-6">
        {steps.map((s, i) => (
          <div
            key={s.id}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === currentStepIndex ? "w-8 bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]" 
              : i < currentStepIndex ? "w-2 bg-primary/40" 
              : "w-2 bg-foreground/10"
            )}
          />
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center px-6 max-w-xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.id}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full flex-1 flex flex-col justify-center"
          >
            <h2 className="font-display text-4xl sm:text-5xl text-center mb-4 tracking-wider">
              {currentStep.title}
            </h2>
            <p className="font-body text-center text-muted-foreground mb-10 max-w-md mx-auto text-lg leading-relaxed">
              {currentStep.prompt}
            </p>

            {renderCurrentStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Footer */}
      <div className="p-6 max-w-xl mx-auto w-full">
        <button
          onClick={handleNext}
          disabled={isNextDisabled()}
          className="w-full bg-gradient-pink text-foreground font-body font-bold text-sm tracking-wider uppercase px-8 py-5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-3"
        >
          {currentStepIndex === steps.length - 1 ? (
            <>Complete Ritual <Check className="w-5 h-5" /></>
          ) : (
            <>Continue <Play className="w-4 h-4 fill-current ml-1" /></>
          )}
        </button>
      </div>
    </div>
  );
};
