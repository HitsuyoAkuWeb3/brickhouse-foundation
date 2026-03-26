import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Volume2, Check, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface Affirmation {
  id: string;
  text: string;
  audio_url: string | null;
}

type VoiceState = "IDLE" | "PLAYING" | "YOUR_TURN" | "DONE";

interface AffirmationTeleprompterProps {
  /** If provided, fetches affirmations for this brick */
  brickId?: string;
  /** Called when all affirmations have been completed */
  onComplete?: () => void;
  /** Max number of affirmations to show per session */
  count?: number;
}

const YOUR_TURN_DURATION = 6; // seconds

export const AffirmationTeleprompter = ({
  brickId,
  onComplete,
  count = 4,
}: AffirmationTeleprompterProps) => {
  const [affirmations, setAffirmations] = useState<Affirmation[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [voiceState, setVoiceState] = useState<VoiceState>("IDLE");
  const [countdown, setCountdown] = useState(YOUR_TURN_DURATION);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch affirmations on mount
  useEffect(() => {
    const fetchAffirmations = async () => {
      let q = (supabase as any)
        .from("affirmations")
        .select("id, text, audio_url")
        .not("audio_url", "is", null);

      if (brickId) {
        q = q.eq("brick_id", brickId);
      }

      const { data, error } = await q;
      if (error) {
        console.error("Failed to fetch affirmations:", error);
        setIsLoading(false);
        return;
      }

      // Shuffle and take `count` items
      const shuffled = (data ?? []).sort(() => Math.random() - 0.5).slice(0, count);
      setAffirmations(shuffled as Affirmation[]);
      setIsLoading(false);
    };

    fetchAffirmations();
  }, [brickId, count]);

  // Auto-start first affirmation when loaded
  useEffect(() => {
    if (affirmations.length > 0 && voiceState === "IDLE") {
      playCurrentAffirmation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [affirmations]);

  const playCurrentAffirmation = useCallback(() => {
    const aff = affirmations[currentIndex];
    if (!aff?.audio_url || !audioRef.current) return;

    audioRef.current.src = aff.audio_url;
    audioRef.current.play().catch(console.error);
    setVoiceState("PLAYING");
  }, [affirmations, currentIndex]);

  // Handle audio ended → transition to YOUR_TURN
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setVoiceState("YOUR_TURN");
      setCountdown(YOUR_TURN_DURATION);
    };

    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, []);

  // YOUR_TURN countdown
  useEffect(() => {
    if (voiceState !== "YOUR_TURN") {
      if (countdownRef.current) clearInterval(countdownRef.current);
      return;
    }

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          advanceToNext();
          return YOUR_TURN_DURATION;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceState]);

  const advanceToNext = useCallback(() => {
    setVoiceState("DONE");

    setTimeout(() => {
      if (currentIndex < affirmations.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setVoiceState("IDLE");
      } else {
        // All done
        onComplete?.();
      }
    }, 400);
  }, [currentIndex, affirmations.length, onComplete]);

  // Auto-play when index changes and state resets to IDLE
  useEffect(() => {
    if (voiceState === "IDLE" && affirmations.length > 0 && currentIndex > 0) {
      playCurrentAffirmation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, voiceState]);

  const skipToNext = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    advanceToNext();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (affirmations.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="font-body text-muted-foreground text-sm">No affirmations available.</p>
      </div>
    );
  }

  const currentAff = affirmations[currentIndex];
  const displayText = currentAff?.text?.replace("Audio Affirmation: ", "") || "";

  return (
    <div className="w-full flex flex-col items-center">
      <audio ref={audioRef} playsInline />

      {/* Progress indicator */}
      <div className="flex gap-2 mb-8">
        {affirmations.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all duration-500",
              i === currentIndex
                ? "w-8 bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
                : i < currentIndex
                ? "w-3 bg-primary/40"
                : "w-3 bg-foreground/10"
            )}
          />
        ))}
      </div>

      {/* State badge */}
      <AnimatePresence mode="wait">
        <motion.div
          key={voiceState}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="mb-6"
        >
          {voiceState === "PLAYING" && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/30 rounded-full">
              <Volume2 className="w-4 h-4 text-accent animate-pulse" />
              <span className="font-display text-xs uppercase tracking-widest text-accent">
                Ché Speaking
              </span>
            </div>
          )}
          {voiceState === "YOUR_TURN" && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/15 border border-primary/40 rounded-full">
              <Mic className="w-4 h-4 text-primary animate-pulse" />
              <span className="font-display text-xs uppercase tracking-widest text-primary">
                Your Turn
              </span>
              <span className="font-display text-xs text-primary/70 ml-1">
                {countdown}s
              </span>
            </div>
          )}
          {voiceState === "DONE" && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
              <Check className="w-4 h-4 text-primary" />
              <span className="font-display text-xs uppercase tracking-widest text-primary/70">
                Beautiful
              </span>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Teleprompter: affirmation list */}
      <div className="w-full max-w-md space-y-4 mb-8">
        {affirmations.map((aff, i) => {
          const text = aff.text?.replace("Audio Affirmation: ", "") || `Affirmation ${i + 1}`;
          const isCurrent = i === currentIndex;
          const isPast = i < currentIndex;
          const isFuture = i > currentIndex;

          return (
            <motion.div
              key={aff.id}
              animate={{
                opacity: isCurrent ? 1 : isPast ? 0.3 : 0.15,
                scale: isCurrent ? 1 : 0.95,
                y: isCurrent && voiceState === "YOUR_TURN" ? -2 : 0,
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={cn(
                "text-center transition-all duration-500 rounded-xl px-4 py-3",
                isCurrent && voiceState === "YOUR_TURN" && "bg-primary/5 border border-primary/20",
                isCurrent && voiceState === "PLAYING" && "bg-accent/5 border border-accent/10",
                isPast && "line-through decoration-primary/30",
              )}
            >
              <p
                className={cn(
                  "font-display tracking-wide leading-relaxed transition-all duration-500",
                  isCurrent ? "text-2xl sm:text-3xl text-foreground" : "text-lg text-muted-foreground",
                  isCurrent && voiceState === "YOUR_TURN" && "text-primary",
                )}
              >
                {text}
              </p>
              {isCurrent && voiceState === "YOUR_TURN" && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-body text-xs text-primary/60 uppercase tracking-widest mt-2"
                >
                  Speak this aloud with conviction
                </motion.p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Skip / advance button */}
      {voiceState === "YOUR_TURN" && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={skipToNext}
          className="font-body text-xs text-muted-foreground/60 uppercase tracking-widest hover:text-foreground transition-colors flex items-center gap-2"
        >
          <Timer className="w-3 h-3" />
          Skip
        </motion.button>
      )}
    </div>
  );
};
