import { Link } from "react-router-dom";
import { useGoddessRx } from "@/hooks/useGoddessRx";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Loader2, RefreshCw, Gem, Palette, Wind } from "lucide-react";
import { toast } from "sonner";
import type { Crystal, PowerColor, SpiritualTool } from "@/hooks/useGoddessRx";

const zodiacEmojis: Record<string, string> = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋", Leo: "♌", Virgo: "♍",
  Libra: "♎", Scorpio: "♏", Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
};

const GoddessRx = () => {
  const { prescription, isLoading, generate } = useGoddessRx();

  const handleGenerate = () => {
    generate.mutate(undefined, {
      onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to generate"),
      onSuccess: () => toast.success("Your Goddess Rx is ready ✨"),
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="font-display text-sm text-muted-foreground tracking-wider animate-pulse">Loading your prescription...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-5 py-10 pb-24">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-display text-3xl tracking-wider">Goddess Rx</h1>
            <p className="font-body text-sm text-muted-foreground">Your sacred spiritual toolkit</p>
          </div>
        </div>

        {!prescription ? (
          /* Empty state — generate first prescription */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-9 h-9 text-secondary" />
            </div>
            <h2 className="font-display text-2xl tracking-wider mb-3">Unlock Your Prescription</h2>
            <p className="font-body text-sm text-muted-foreground max-w-sm mx-auto mb-8">
              Based on your zodiac sign, element, and transformation path — AI will curate your personal crystals, power colors, and spiritual tools.
            </p>
            <button
              onClick={handleGenerate}
              disabled={generate.isPending}
              className="inline-flex items-center gap-3 bg-gradient-pink border border-primary/30 rounded-xl px-8 py-4 font-display text-sm tracking-wider hover:shadow-[0_0_30px_hsl(var(--primary)/0.3)] transition-all disabled:opacity-60"
            >
              {generate.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
              {generate.isPending ? "Channeling the stars..." : "Generate My Goddess Rx"}
            </button>
          </motion.div>
        ) : (
          /* Full prescription display */
          <div className="space-y-6">
            {/* Zodiac Header */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden bg-gradient-card border border-secondary/20 rounded-2xl p-6 text-center"
            >
              <div className="text-5xl mb-3">{zodiacEmojis[prescription.zodiac_sign] || "✨"}</div>
              <h2 className="font-display text-2xl tracking-wider">{prescription.zodiac_sign}</h2>
              <div className="flex justify-center gap-4 mt-3">
                <span className="font-body text-[10px] text-muted-foreground uppercase tracking-widest">
                  {prescription.element} sign
                </span>
                <span className="text-border">•</span>
                <span className="font-body text-[10px] text-muted-foreground uppercase tracking-widest">
                  Ruled by {prescription.ruling_planet}
                </span>
              </div>
            </motion.div>

            {/* Mantra */}
            {prescription.mantra && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-card border border-accent/20 rounded-2xl p-6 text-center"
              >
                <div className="font-body text-[10px] text-accent uppercase tracking-widest mb-3">Your Mantra</div>
                <p className="font-display text-xl leading-relaxed tracking-wide">"{prescription.mantra}"</p>
              </motion.div>
            )}

            {/* Crystals */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Gem className="w-4 h-4 text-primary" />
                <h3 className="font-display text-sm tracking-wider uppercase">Your Crystals</h3>
              </div>
              <div className="space-y-2">
                {prescription.crystals.map((c: Crystal, i: number) => (
                  <div key={i} className="bg-gradient-card border border-border rounded-xl px-4 py-3">
                    <div className="font-display text-sm tracking-wider mb-1">
                      {c.emoji || "💎"} {c.name}
                    </div>
                    <p className="font-body text-xs text-muted-foreground leading-relaxed">{c.reason}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Colors */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Palette className="w-4 h-4 text-accent" />
                <h3 className="font-display text-sm tracking-wider uppercase">Your Power Colors</h3>
              </div>
              <div className="space-y-2">
                {prescription.colors.map((c: PowerColor, i: number) => (
                  <div key={i} className="bg-gradient-card border border-border rounded-xl px-4 py-3 flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-lg shrink-0 border border-border"
                      style={{ backgroundColor: c.hex }}
                    />
                    <div>
                      <div className="font-display text-sm tracking-wider mb-1">{c.name}</div>
                      <p className="font-body text-xs text-muted-foreground leading-relaxed">{c.meaning}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Spiritual Tools */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Wind className="w-4 h-4 text-secondary" />
                <h3 className="font-display text-sm tracking-wider uppercase">Your Spiritual Tools</h3>
              </div>
              <div className="space-y-2">
                {prescription.spiritual_tools.map((t: SpiritualTool, i: number) => (
                  <div key={i} className="bg-gradient-card border border-border rounded-xl px-4 py-3">
                    <div className="font-display text-sm tracking-wider mb-1">
                      {t.emoji || "🔮"} {t.name}
                    </div>
                    <p className="font-body text-xs text-muted-foreground leading-relaxed">{t.practice}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Regenerate */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center pt-4"
            >
              <button
                onClick={handleGenerate}
                disabled={generate.isPending}
                className="inline-flex items-center gap-2 font-body text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                {generate.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                {generate.isPending ? "Regenerating..." : "Generate a new prescription"}
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoddessRx;
