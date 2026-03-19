import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboardingStore, type OnboardingStep } from "@/store/onboardingStore";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { CalendarIcon, Upload, Play, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import logo from "@/assets/brickhouse-logo.png";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";

const GOAL_CATEGORIES = [
  "Attract Love",
  "Body Transformation",
  "Publish a Book",
  "Build or Relaunch a Business",
  "Rebuild Finances",
  "Heal and Rebuild",
];

const LIFE_AUDIT_AREAS = [
  { id: "body", label: "Body & Health" },
  { id: "mind", label: "Mind & Focus" },
  { id: "spirit", label: "Spirit & Purpose" },
  { id: "business", label: "Business & Wealth" },
  { id: "relationships", label: "Love & Relationships" },
];

const stepVariants = {
  initial: { opacity: 0, x: 40 },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
  exit: {
    opacity: 0,
    x: -40,
    transition: { duration: 0.25, ease: "easeIn" as const },
  },
};

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    step,
    setStep,
    nextStep,
    prevStep,
    lifeAuditScores,
    setLifeAuditScore,
    birthDate,
    setBirthDate,
    goals,
    toggleGoal,
    reminderPreferences,
    setReminderPreference,
    passionPickMediaUrl,
    setPassionPickMedia,
    passionPickSkipped,
  } = useOnboardingStore();
  
  const [submitting, setSubmitting] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Import audit scores if user completed audit before signup via Bridge API
  useEffect(() => {
    if (!user?.id) return;
    
    const bridgeToken = localStorage.getItem("bridge_token");
    if (!bridgeToken) return;

    const importAuditScores = async () => {
      try {
        const { data: transferRecord } = await supabase
          .from("lead_transfers")
          .select("audit_scores")
          .eq("transfer_token", bridgeToken)
          .maybeSingle();

        if (!transferRecord) {
          localStorage.removeItem("bridge_token");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("audit_scores")
          .eq("id", user.id)
          .single();

        if (!profile?.audit_scores || Object.keys(profile.audit_scores as Record<string, unknown>).length === 0) {
          await supabase
            .from("profiles")
            .update({ 
              audit_scores: transferRecord.audit_scores, 
              updated_at: new Date().toISOString() 
            })
            .eq("id", user.id);
            
          // Hydrate generic state with DB state
          Object.entries(transferRecord.audit_scores).forEach(([key, val]) => {
            setLifeAuditScore(key, val as number);
          });
        }

        localStorage.removeItem("bridge_token");
      } catch (err) {
        console.error("Audit import failed:", err);
      }
    };
    
    importAuditScores();
  }, [user, setLifeAuditScore]);

  const handleFinish = async () => {
    if (!user) return;
    setSubmitting(true);

    try {
      // Map the user's first goal to a valid transformation_track enum value
      const goalToTrack = (goal: string): 'spiritual' | 'business' | 'wellness' | 'relationships' => {
        const g = goal?.toLowerCase() || '';
        if (g.includes('love') || g.includes('relationship')) return 'relationships';
        if (g.includes('business') || g.includes('finance') || g.includes('book')) return 'business';
        if (g.includes('body') || g.includes('heal')) return 'wellness';
        return 'spiritual';
      };

      const { error } = await supabase
        .from("profiles")
        .update({
          birth_date: birthDate ? format(birthDate, "yyyy-MM-dd") : null,
          goals: goals,
          transformation_choice: goalToTrack(goals[0] ?? ''),
          audit_scores: lifeAuditScores,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For MVP, we simulate reading a local URL. Actual upload goes to Supabase storage.
      const url = URL.createObjectURL(file);
      setPassionPickMedia(url, false);
    }
  };

  const isLifeAuditComplete = LIFE_AUDIT_AREAS.every(area => lifeAuditScores[area.id] !== undefined);
  const isGoalsComplete = goals.length > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-6 py-12 overflow-x-hidden">
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[80%] h-[40%] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, hsl(330 100% 42% / 0.12) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-[540px]">
        <img
          src={logo}
          alt="Brickhouse Mindset"
          className="w-40 mx-auto mb-6 drop-shadow-[0_0_30px_hsl(330_100%_42%/0.4)]"
        />

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {([1, 2, 3, 4, 5, 6, 7, 8] as const).map((s) => (
            <div
              key={s}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all",
                step === s
                  ? "bg-primary w-6 shadow-[0_0_10px_hsl(330_100%_42%/0.5)]"
                  : step > s
                  ? "bg-accent"
                  : "bg-foreground/15"
              )}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: WELCOME */}
          {step === 1 && (
            <motion.div key="step1" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="text-center">
              <h1 className="font-display text-4xl sm:text-5xl tracking-wider mb-4">
                Welcome to <span className="text-accent">Brickhouse</span>
              </h1>
              <p className="font-body text-base text-muted-foreground mb-10 max-w-md mx-auto leading-relaxed">
                You are about to build an unshakeable foundation. We’ll guide you through a quick 7-step setup so the system can serve exactly what you need.
              </p>
              <button onClick={nextStep} className="bg-gradient-pink text-foreground font-body font-bold text-sm tracking-wider uppercase px-10 py-4 rounded-lg hover:opacity-90 transition-opacity">
                Begin Architecture →
              </button>
            </motion.div>
          )}

          {/* STEP 2: LIFE AUDIT fallback UI */}
          {step === 2 && (
            <motion.div key="step2" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="text-center">
              <h1 className="font-display text-3xl sm:text-4xl tracking-wider mb-2">
                Your <span className="text-accent">Baseline</span>
              </h1>
              <p className="font-body text-sm text-muted-foreground mb-10 max-w-md mx-auto">
                Rate where you are right now across these 5 core domains from 1 (Desperate) to 10 (Abundant). Be brutally honest.
              </p>
              
              <div className="space-y-8 mb-10 px-4">
                {LIFE_AUDIT_AREAS.map((area) => (
                  <div key={area.id} className="text-left">
                    <div className="flex justify-between items-center mb-3">
                      <label className="font-display tracking-wider text-foreground">{area.label}</label>
                      <span className="font-body font-bold text-accent">{lifeAuditScores[area.id] || 5}/10</span>
                    </div>
                    <Slider
                      value={[lifeAuditScores[area.id] || 5]}
                      max={10}
                      min={1}
                      step={1}
                      onValueChange={(vals) => setLifeAuditScore(area.id, vals[0])}
                      className="cursor-pointer"
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-3 justify-center">
                <button onClick={prevStep} className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors px-6 py-3">← Back</button>
                <button 
                  onClick={nextStep} 
                  disabled={!isLifeAuditComplete} 
                  className="bg-gradient-pink text-foreground font-body font-bold text-sm tracking-wider uppercase px-8 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: BIRTH DATE */}
          {step === 3 && (
            <motion.div key="step3" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="text-center">
              <h1 className="font-display text-3xl sm:text-4xl tracking-wider mb-2">
                When were you <span className="text-accent">born</span>?
              </h1>
              <p className="font-body text-sm text-muted-foreground mb-10 max-w-sm mx-auto">
                Your birth date powers your future Goddess Prescription — personalized tracking aligned to your sign.
              </p>
              <div className="flex justify-center mb-10">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className={cn("flex items-center gap-3 bg-input border border-border rounded-lg px-6 py-4 font-body text-base transition-colors hover:border-primary/40 focus:ring-2 focus:ring-primary/20", !birthDate && "text-muted-foreground")}>
                      <CalendarIcon className="w-5 h-5 text-accent" />
                      {birthDate ? format(birthDate, "MMMM d, yyyy") : "Select your birthday"}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <Calendar
                      mode="single"
                      selected={birthDate}
                      onSelect={setBirthDate}
                      disabled={(date) => date > new Date() || date < new Date("1920-01-01")}
                      initialFocus
                      className={cn("p-3 pointer-events-auto bg-card rounded-md border border-border")}
                      captionLayout="dropdown-buttons"
                      fromYear={1940}
                      toYear={new Date().getFullYear()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex gap-3 justify-center">
                <button onClick={prevStep} className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors px-6 py-3">← Back</button>
                <button onClick={nextStep} disabled={!birthDate} className="bg-gradient-pink text-foreground font-body font-bold text-sm tracking-wider uppercase px-8 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40">Next →</button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: GOAL SELECTION */}
          {step === 4 && (
            <motion.div key="step4" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="text-center w-full">
              <h1 className="font-display text-3xl sm:text-4xl tracking-wider mb-2">
                Select Your <span className="text-accent">Goals</span>
              </h1>
              <p className="font-body text-sm text-muted-foreground mb-8 text-center max-w-md mx-auto">
                What are you building toward right now? Choose up to 3 core focuses.
              </p>
              <div className="grid gap-3 mb-10 text-left">
                {GOAL_CATEGORIES.map((goal) => {
                  const isSelected = goals.includes(goal);
                  return (
                    <button
                      key={goal}
                      onClick={() => toggleGoal(goal)}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl border transition-all",
                        isSelected 
                          ? "border-primary bg-primary/10 shadow-[0_0_15px_hsl(330_100%_42%/0.1)]" 
                          : "border-border bg-card/40 hover:border-primary/30"
                      )}
                    >
                      <span className={cn("font-display tracking-wide", isSelected ? "text-foreground" : "text-muted-foreground")}>{goal}</span>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-primary" />}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-3 justify-center">
                <button onClick={prevStep} className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors px-6 py-3">← Back</button>
                <button onClick={nextStep} disabled={!isGoalsComplete} className="bg-gradient-pink text-foreground font-body font-bold text-sm tracking-wider uppercase px-8 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40">Next →</button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: REMINDERS */}
          {step === 5 && (
            <motion.div key="step5" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="text-center">
              <h1 className="font-display text-3xl sm:text-4xl tracking-wider mb-2">
                Set Your <span className="text-accent">Rituals</span>
              </h1>
              <p className="font-body text-sm text-muted-foreground mb-10 max-w-md mx-auto">
                Brickhouse works best when you lock in your non-negotiable times. Set your daily reminder windows.
              </p>
              
              <div className="space-y-6 mb-10 text-left px-4">
                {(["morning", "midday", "evening"] as const).map((period) => (
                  <div key={period} className="flex items-center justify-between bg-card/40 p-4 border border-border rounded-xl">
                    <span className="font-display tracking-wider capitalize text-foreground text-lg">{period}</span>
                    <input
                      type="time"
                      value={reminderPreferences[period]}
                      onChange={(e) => setReminderPreference(period, e.target.value)}
                      className="bg-input border border-border rounded-lg px-4 py-2 font-body text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-3 justify-center">
                <button onClick={prevStep} className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors px-6 py-3">← Back</button>
                <button onClick={nextStep} className="bg-gradient-pink text-foreground font-body font-bold text-sm tracking-wider uppercase px-8 py-3 rounded-lg hover:opacity-90 transition-opacity">Next →</button>
              </div>
            </motion.div>
          )}

          {/* STEP 6: PASSION PICK */}
          {step === 6 && (
            <motion.div key="step6" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="text-center">
              <h1 className="font-display text-3xl sm:text-4xl tracking-wider mb-2">
                Your <span className="text-accent">Passion Pick</span>
              </h1>
              <p className="font-body text-sm text-muted-foreground mb-8 max-w-md mx-auto">
                Upload a photo that represents your ultimate goal. This will be your visual anchor during your daily rituals.
              </p>
              
              <div className="flex justify-center mb-10">
                <label className="relative cursor-pointer group w-64 h-64 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center bg-card/20 transition-all overflow-hidden">
                  {passionPickMediaUrl ? (
                    <img src={passionPickMediaUrl} alt="Passion Pick" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <>
                      <div className="p-4 bg-primary/10 rounded-full mb-4 group-hover:bg-primary/20 transition-colors">
                        <Upload className="w-8 h-8 text-primary" />
                      </div>
                      <span className="font-display tracking-widest text-sm text-muted-foreground group-hover:text-foreground transition-colors uppercase">Upload Image</span>
                    </>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                </label>
              </div>

              <div className="flex gap-3 justify-center">
                <button onClick={() => { setPassionPickMedia(undefined, true); nextStep(); }} className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors px-6 py-3">Skip for now</button>
                <button onClick={nextStep} disabled={!passionPickMediaUrl} className="bg-gradient-pink text-foreground font-body font-bold text-sm tracking-wider uppercase px-8 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40">Next →</button>
              </div>
            </motion.div>
          )}

          {/* STEP 7: WELCOME VIDEO */}
          {step === 7 && (
            <motion.div key="step7" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="text-center w-full">
              <h1 className="font-display text-3xl sm:text-4xl tracking-wider mb-4">
                Watch <span className="text-accent">Your Primer</span>
              </h1>
              <p className="font-body text-sm text-muted-foreground mb-8 max-w-md mx-auto">
                Before you enter the architecture, watch this critical instruction from Ché.
              </p>
              
              <div className="relative aspect-video w-full rounded-2xl bg-black border border-border overflow-hidden mb-10">
                <video
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-contain"
                  poster=""
                >
                  <source src="https://dl.dropboxusercontent.com/scl/fi/6znpgdleclll59ulqtxkz/Edits_App_Welcome_20260314_135437.MP4?rlkey=fjba4ip568doet9126roeyhap&st=5jaqt530" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>

              <div className="flex gap-3 justify-center">
                <button onClick={prevStep} className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors px-6 py-3">← Back</button>
                <button
                  onClick={nextStep}
                  className="bg-gradient-pink text-foreground font-body font-bold text-sm tracking-wider uppercase px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Next →
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 8: FOUNDATION SET — COMPLETE */}
          {step === 8 && (
            <motion.div key="step8" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/15 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <h1 className="font-display text-3xl sm:text-4xl tracking-wider mb-4">
                Your <span className="text-accent">Foundation</span> is Set
              </h1>
              <p className="font-body text-base text-muted-foreground mb-10 max-w-md mx-auto leading-relaxed">
                Welcome to the Brickhouse. Your daily rituals, your goals, and your architecture are locked in. Time to build.
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={prevStep} className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors px-6 py-3">← Back</button>
                <button
                  onClick={handleFinish}
                  disabled={submitting}
                  className="bg-gradient-pink text-foreground font-body font-bold text-sm tracking-wider uppercase px-10 py-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  {submitting ? "Building Profile..." : "Enter Dashboard 🔥"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding;
