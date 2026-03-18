import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboardingStore, type Step } from "@/store/onboardingStore";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
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

const transformations = [
  {
    id: "badbody-to-brickhouse",
    emoji: "🏛️",
    title: "Badbody to Brickhouse",
    description:
      "You look good on paper but feel empty inside. The body or the success is there — the internal beauty isn't.",
  },
  {
    id: "drowning-to-building",
    emoji: "🌊",
    title: "Drowning to Building",
    description:
      "You're surviving, not living. Directionless, overwhelmed, just getting through the day.",
  },
  {
    id: "crumbs-to-adoration",
    emoji: "💎",
    title: "Crumbs to Adoration",
    description:
      "You're overgiving and getting nothing back. You accept crumbs when you deserve adoration.",
  },
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
  const { step, birthDate, goals, transformation, setStep, setBirthDate, setGoal, setTransformation } = useOnboardingStore();
  const [submitting, setSubmitting] = useState(false);

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
          // Token invalid or already consumed, clean up
          localStorage.removeItem("bridge_token");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("audit_scores")
          .eq("id", user.id)
          .single();

        if (!profile?.audit_scores) {
          await supabase
            .from("profiles")
            .update({ 
              audit_scores: transferRecord.audit_scores, 
              updated_at: new Date().toISOString() 
            })
            .eq("id", user.id);
        }

        // Clean up bridge token after successful import
        localStorage.removeItem("bridge_token");
      } catch (err) {
        console.error("Audit import failed:", err);
      }
    };
    
    importAuditScores();
  }, [user]);

  const updateGoal = (index: number, value: string) => {
    setGoal(index, value);
  };

  const canProceedGoals = goals.filter((g) => g.trim().length > 0).length >= 1;

  const handleFinish = async () => {
    if (!user) return;
    setSubmitting(true);

    try {
      const filteredGoals = goals
        .map((g) => g.trim())
        .filter((g) => g.length > 0);

      const { error } = await supabase
        .from("profiles")
        .update({
          birth_date: birthDate ? format(birthDate, "yyyy-MM-dd") : null,
          goals: filteredGoals,
          transformation_choice: transformation,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-6 py-12 overflow-x-hidden">
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[80%] h-[40%] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, hsl(330 100% 42% / 0.12) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-[480px]">
        <img
          src={logo}
          alt="Brickhouse Mindset"
          className="w-40 mx-auto mb-6 drop-shadow-[0_0_30px_hsl(330_100%_42%/0.4)]"
        />

        <div className="flex items-center justify-center gap-2 mb-10">
          {(["birthdate", "goals", "transformation"] as Step[]).map((s, i) => (
            <div
              key={s}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all",
                step === s
                  ? "bg-primary w-6"
                  : i < ["birthdate", "goals", "transformation"].indexOf(step)
                  ? "bg-accent"
                  : "bg-foreground/15"
              )}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === "birthdate" && (
            <motion.div key="birthdate" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="text-center">
              <h1 className="font-display text-3xl sm:text-4xl tracking-wider mb-2">
                When were you <span className="text-accent">born</span>?
              </h1>
              <p className="font-body text-sm text-muted-foreground mb-8 max-w-sm mx-auto">
                Your birth date powers your future Goddess Prescription — personalized crystals, colors, and spiritual tools aligned to your sign.
              </p>
              <div className="flex justify-center mb-8">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className={cn("flex items-center gap-3 bg-input border border-border rounded-lg px-5 py-3.5 font-body text-sm transition-colors hover:border-primary/40", !birthDate && "text-muted-foreground")}>
                      <CalendarIcon className="w-4 h-4" />
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
                      className={cn("p-3 pointer-events-auto")}
                      captionLayout="dropdown-buttons"
                      fromYear={1940}
                      toYear={new Date().getFullYear()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setStep("goals")} className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors">Skip for now</button>
                <button onClick={() => setStep("goals")} disabled={!birthDate} className="bg-gradient-pink text-foreground font-body font-bold text-sm tracking-wider uppercase px-8 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40">Next →</button>
              </div>
            </motion.div>
          )}

          {step === "goals" && (
            <motion.div key="goals" variants={stepVariants} initial="initial" animate="animate" exit="exit">
              <h1 className="font-display text-3xl sm:text-4xl tracking-wider mb-2 text-center">
                Your <span className="text-accent">3 biggest goals</span>
              </h1>
              <p className="font-body text-sm text-muted-foreground mb-8 text-center max-w-sm mx-auto">
                What are you building toward right now? Be specific. Be honest. These shape your entire Brickhouse experience.
              </p>
              <div className="space-y-3 mb-8">
                {goals.map((goal, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="font-display text-lg text-accent w-6 text-right shrink-0">{i + 1}</span>
                    <input
                      type="text"
                      placeholder={i === 0 ? "e.g. Start my own business" : i === 1 ? "e.g. Build a morning routine" : "e.g. Find a partner who adores me"}
                      value={goal}
                      onChange={(e) => updateGoal(i, e.target.value)}
                      maxLength={200}
                      className="w-full bg-input border border-border rounded-lg px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setStep("birthdate")} className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">← Back</button>
                <button onClick={() => setStep("transformation")} disabled={!canProceedGoals} className="bg-gradient-pink text-foreground font-body font-bold text-sm tracking-wider uppercase px-8 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40">Next →</button>
              </div>
            </motion.div>
          )}

          {step === "transformation" && (
            <motion.div key="transformation" variants={stepVariants} initial="initial" animate="animate" exit="exit">
              <h1 className="font-display text-3xl sm:text-4xl tracking-wider mb-2 text-center">
                Which transformation <span className="text-gradient-pink">speaks to you</span>?
              </h1>
              <p className="font-body text-sm text-muted-foreground mb-8 text-center max-w-sm mx-auto">
                Choose the one that feels most true right now. This shapes your starting path.
              </p>
              <div className="space-y-3 mb-8">
                {transformations.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTransformation(t.id)}
                    className={cn(
                      "w-full text-left bg-gradient-card border rounded-xl p-5 transition-all",
                      transformation === t.id
                        ? "border-primary shadow-[0_0_20px_hsl(330_100%_42%/0.2)]"
                        : "border-border hover:border-primary/30"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl shrink-0">{t.emoji}</span>
                      <div>
                        <div className="font-display text-lg tracking-wider mb-1">{t.title}</div>
                        <p className="font-body text-xs text-muted-foreground leading-relaxed">{t.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setStep("goals")} className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">← Back</button>
                <button
                  onClick={handleFinish}
                  disabled={!transformation || submitting}
                  className="bg-gradient-pink text-foreground font-body font-bold text-sm tracking-wider uppercase px-8 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  {submitting ? "Saving..." : "Start Building 🔥"}
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
