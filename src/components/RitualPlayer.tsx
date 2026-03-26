import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Slider } from "@/components/ui/slider";
import { useAudioAnalyzer } from "@/hooks/useAudioAnalyzer";
import { AffirmationTeleprompter } from "@/components/AffirmationTeleprompter";
import { VoiceRecorder } from "@/components/VoiceRecorder";

export type RitualType = "morning_affirmation" | "midday_checkin" | "evening_reflection";

interface Step {
  id: string;
  title: string;
  prompt: string;
  type: "input" | "timer" | "slider" | "passion_timer" | "teleprompter" | "voice_recording";
  duration?: number; // for timer
  key?: string; // for data saving
}

const RITUAL_CONFIGS: Record<RitualType, Step[]> = {
  morning_affirmation: [
    { id: "gratitude", title: "Gratitude", prompt: "What are you grateful for today?", type: "input", key: "gratitude_note" },
    { id: "intention", title: "Intention", prompt: "What is your intention for today?", type: "input", key: "morning_intention" },
    { id: "affirmation", title: "Affirmation", prompt: "Listen to Ché, then repeat each declaration with conviction.", type: "teleprompter" },
    { id: "voice_affirmation", title: "Your Voice", prompt: "Now record your own 'I AM' declaration.", type: "voice_recording", key: "voice_affirmation" },
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
  animate: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, scale: 1.05, transition: { duration: 0.2 } },
};

const AUDIO_URLS: Record<RitualType, string> = {
  morning_affirmation: "/audio/morning-ritual.m4a",
  midday_checkin: "/audio/midday-ritual.m4a",
  evening_reflection: "/audio/evening-ritual.m4a",
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
  const audioRef = useRef<HTMLAudioElement>(null);
  const { isSilent, isPlaying } = useAudioAnalyzer(audioRef);
  const [audioStarted, setAudioStarted] = useState(false);
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

  // Auto-play audio once started
  const handleStartAudio = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(console.error);
      setAudioStarted(true);
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
  };

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
    if (!audioStarted) return true; // prevent advancing before audio starts
    if (currentStep.type === "input" || currentStep.type === "voice_recording") {
      const val = data[currentStep.key as string];
      return !val || String(val).trim() === "";
    }
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
      case "teleprompter":
        return (
          <AffirmationTeleprompter
            count={4}
            onComplete={handleNext}
          />
        );
      case "voice_recording":
        return (
          <VoiceRecorder onRecordingComplete={(url) => handleInput(url)} />
        );
      case "passion_timer":
      case "timer": {
        return (
          <div className="flex flex-col items-center justify-center py-10 relative">
            {currentStep.type === "passion_timer" && passionMedia && (
              <div className="absolute inset-0 opacity-20 -z-10 rounded-2xl overflow-hidden blur-sm">
                <img src={passionMedia} alt="Passion Pick" className="w-full h-full object-cover" />
              </div>
            )}
            
            <div className="relative w-48 h-48 flex items-center justify-center">
              <div className={cn(
                "absolute inset-0 rounded-full border border-primary/20 transition-all duration-700",
                isPlaying && !isSilent && "scale-110 opacity-50",
                isPlaying && isSilent && "scale-105 opacity-20"
              )} />
              <div className={cn(
                "absolute inset-4 rounded-full border border-primary/40 transition-all duration-500",
                isPlaying && !isSilent && "scale-105 opacity-70",
                isPlaying && isSilent && "scale-100 opacity-40"
              )} />
              
              <div className={cn(
                "flex flex-col items-center justify-center bg-background/80 backdrop-blur-md rounded-full w-36 h-36 z-10 transition-colors duration-1000",
                isPlaying && isSilent && "bg-primary/5 border border-primary/20",
                !isPlaying && "opacity-50"
              )}>
                {isSilent ? (
                  <>
                    <span className="font-display text-lg text-accent tracking-widest text-center px-4 leading-tight">Intentional Silence</span>
                    <span className="font-body text-xs text-muted-foreground uppercase tracking-widest mt-2 animate-pulse">
                      Breathe
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className={cn("w-6 h-6 text-primary mb-2", isPlaying && "animate-pulse")} />
                    <span className="font-body text-xs text-muted-foreground uppercase tracking-widest mt-1 text-center px-2">
                       {isPlaying ? "Listen & Reflect" : "Paused"}
                    </span>
                  </>
                )}
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
      <audio ref={audioRef} src={AUDIO_URLS[type]} playsInline />
      
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
      <div className="p-6 max-w-xl mx-auto w-full flex flex-col gap-4">
        {!audioStarted ? (
          <button
            onClick={handleStartAudio}
            className="w-full bg-primary/20 text-primary border border-primary/50 font-body font-bold text-sm tracking-wider uppercase px-8 py-5 rounded-xl hover:bg-primary/30 transition-colors flex items-center justify-center gap-3 animate-pulse"
          >
            Start Guided Audio <Play className="w-4 h-4 fill-current ml-1" />
          </button>
        ) : (
          <div className="w-full flex items-center gap-3">
             <button
               onClick={toggleAudio}
               className="h-14 w-14 bg-foreground/5 shrink-0 rounded-xl flex items-center justify-center hover:bg-foreground/10 transition-colors"
             >
               {isPlaying ? <Pause className="w-5 h-5 text-foreground" /> : <Play className="w-5 h-5 text-foreground pl-1" />}
             </button>
             <button
               onClick={handleNext}
               disabled={isNextDisabled()}
               className="flex-1 bg-gradient-pink text-foreground font-body font-bold text-sm tracking-wider uppercase h-14 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-3"
             >
               {currentStepIndex === steps.length - 1 ? (
                 <>Complete Ritual <Check className="w-5 h-5" /></>
               ) : (
                 <>Next Step <Check className="w-4 h-4 ml-1" /></>
               )}
             </button>
          </div>
        )}
      </div>
    </div>
  );
};
