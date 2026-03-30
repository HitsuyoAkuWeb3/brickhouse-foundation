import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboardingStore, type OnboardingStep } from "@/store/onboardingStore";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAnalytics } from "@/hooks/useAnalytics";
import { cn } from "@/lib/utils";
import logo from "@/assets/brickhouse-logo.png";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";

const GOAL_CATEGORIES = [
  "Building or Relaunching a Business",
  "Rebuilding Finances",
  "Body Transformation",
  "Building a Meaningful Relationship",
  "Rebuilding Mind and Focus",
  "Overcoming Grief or Trauma",
];

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer",
  "Leo", "Virgo", "Libra", "Scorpio",
  "Sagittarius", "Capricorn", "Aquarius", "Pisces"
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
  const { trackEvent } = useAnalytics();
  const navigate = useNavigate();
  const {
    step,
    nextStep,
    prevStep,
    lifeAuditScores,
    setLifeAuditScore,
    zodiacSign,
    setZodiacSign,
    goals,
    toggleGoal,
    reminderPreferences,
    setReminderPreference,
    passionPickMediaUrl,
    setPassionPickMedia,
  } = useOnboardingStore();
  
  const [submitting, setSubmitting] = useState(false);

  // Import audit scores if user completed audit before signup via Bridge API
  useEffect(() => {
    if (!user?.id) return;
    
    const bridgeToken = localStorage.getItem("bridge_token");
    if (!bridgeToken) return;

    const importAuditScores = async () => {
      try {
        const { data: transferRecord } = await (supabase as any)
          .from("lead_transfers")
          .select("audit_scores")
          .eq("transfer_token", bridgeToken)
          .maybeSingle();

        if (!transferRecord) {
          localStorage.removeItem("bridge_token");
          return;
        }

        const { data: profile } = await (supabase as any)
          .from("profiles")
          .select("audit_scores")
          .eq("id", user.id)
          .single();

        if (!profile?.audit_scores || Object.keys(profile.audit_scores as Record<string, unknown>).length === 0) {
          await (supabase as any)
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
        if (g.includes('body') || g.includes('heal') || g.includes('trauma')) return 'wellness';
        return 'spiritual';
      };

      const { error } = await (supabase as any)
        .from("profiles")
        .update({
          zodiac_sign: zodiacSign || null,
          goals: goals,
          transformation_choice: goalToTrack(goals[0] ?? ''),
          audit_scores: lifeAuditScores,
          onboarding_completed: true,
          onboarding_complete: true,
          updated_at: new Date().toISOString(),
          // we are intentionally not sending birth_date since we use zodiac
        })
        .eq("id", user.id);

      if (error) throw error;
      trackEvent("profile_setup_completed", { goals, zodiac_sign: zodiacSign });
      navigate("/dashboard", { replace: true, state: { justFinishedOnboarding: true } });
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
          {([1, 2, 3, 4, 5, 6] as const).map((s) => (
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
                You are about to build an unshakeable foundation. We’ll guide you through a quick 6-step setup so the system can set your baseline.
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

          {/* STEP 3: ZODIAC SIGN */}
          {step === 3 && (
            <motion.div key="step3" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="text-center">
              <h1 className="font-display text-3xl sm:text-4xl tracking-wider mb-2">
                Your <span className="text-accent">Zodiac</span>
              </h1>
              <p className="font-body text-sm text-muted-foreground mb-10 max-w-sm mx-auto">
                Your sign powers your future Goddess Prescription — personalized tracking aligned to your sign.
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-10 text-left">
                {ZODIAC_SIGNS.map((sign) => {
                  const isSelected = zodiacSign === sign;
                  return (
                    <button
                      key={sign}
                      onClick={() => setZodiacSign(sign)}
                      className={cn(
                        "flex flex-col items-center justify-center p-4 rounded-xl border transition-all h-24",
                        isSelected 
                          ? "border-primary bg-primary/10 shadow-[0_0_15px_hsl(330_100%_42%/0.1)]" 
                          : "border-border bg-card/40 hover:border-primary/30"
                      )}
                    >
                      <span className={cn("font-display tracking-wide text-xs sm:text-sm uppercase text-center", isSelected ? "text-foreground" : "text-muted-foreground")}>{sign}</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-3 justify-center">
                <button onClick={prevStep} className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors px-6 py-3">← Back</button>
                <button onClick={nextStep} disabled={!zodiacSign} className="bg-gradient-pink text-foreground font-body font-bold text-sm tracking-wider uppercase px-8 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40">Next →</button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: GOAL SELECTION */}
          {step === 4 && (
            <motion.div key="step4" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="text-center w-full">
              <h1 className="font-display text-3xl sm:text-4xl tracking-wider mb-2">
                Select Your <span className="text-accent">Goal</span>
              </h1>
              <p className="font-body text-sm text-muted-foreground mb-8 text-center max-w-md mx-auto">
                What are you building toward right now? Choose your NUMBER ONE focus.
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

          {/* STEP 5: PASSION PICK */}
          {step === 5 && (
            <motion.div key="step5" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="text-center">
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
                <button onClick={prevStep} className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors px-6 py-3">← Back</button>
                <button onClick={() => { setPassionPickMedia(passionPickMediaUrl, !passionPickMediaUrl); nextStep(); }} className={cn("bg-gradient-pink text-foreground font-body font-bold text-sm tracking-wider uppercase px-8 py-3 rounded-lg hover:opacity-90 transition-opacity", !passionPickMediaUrl && "opacity-60")}>{!passionPickMediaUrl ? "Skip for now" : "Next →"}</button>
              </div>
            </motion.div>
          )}

          {/* STEP 6: REMINDERS - COMPLETE */}
          {step === 6 && (
            <motion.div key="step6" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="text-center">
              <h1 className="font-display text-3xl sm:text-4xl tracking-wider mb-2">
                Set Your <span className="text-accent">Rituals</span>
              </h1>
              <p className="font-body text-sm text-muted-foreground mb-10 max-w-md mx-auto">
                Brickhouse works best when you lock in your non-negotiable times. Set your daily reminder windows to finalize your foundation.
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
