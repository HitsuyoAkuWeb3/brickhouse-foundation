import { motion } from "framer-motion";
import { CheckCircle, Instagram, Calendar, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/brickhouse-logo.png";

const steps = [
  {
    emoji: "📩",
    title: "Check Your Inbox",
    description: "A welcome email with everything you need is on its way.",
  },
  {
    emoji: "📅",
    title: "Block 44 Minutes × 3 Days",
    description: "Clear the space. This isn't optional — this is for you.",
  },
  {
    emoji: "🔥",
    title: "Show Up Ready",
    description: "Bring a journal, an open mind, and the courage to be honest.",
  },
];

const BreakthroughConfirmation = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-6 py-12 overflow-x-hidden">
      <div className="max-w-lg w-full">
        {/* Logo */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <img
            src={logo}
            alt="Brickhouse Mindset"
            className="w-48 mx-auto mb-6 drop-shadow-[0_0_30px_hsl(330_100%_42%/0.4)]"
          />
        </motion.div>

        {/* Confirmation badge */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6, ease: "easeOut" }}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/10 border border-accent/30 mb-5">
            <CheckCircle className="w-10 h-10 text-accent" />
          </div>
          <h1 className="font-display text-4xl sm:text-5xl leading-tight mb-3">
            You're In <span className="text-gradient-pink">🔥</span>
          </h1>
          <p className="font-body text-muted-foreground leading-relaxed">
            Your spot in the <strong className="text-foreground">Brickhouse Breakthrough</strong> 3-Day Intensive is locked. This is where building begins.
          </p>
        </motion.div>

        {/* Next steps */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
        >
          <p className="font-display text-sm tracking-[4px] text-gold-light text-center mb-6">
            YOUR NEXT STEPS
          </p>
          <div className="space-y-4">
            {steps.map((step) => (
              <div
                key={step.title}
                className="flex items-start gap-4 rounded-2xl bg-card border border-border p-5 transition-colors hover:border-primary/30"
              >
                <span className="text-2xl shrink-0 mt-0.5">{step.emoji}</span>
                <div>
                  <h3 className="font-display text-lg mb-1">{step.title}</h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* What to expect */}
        <motion.div
          className="rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/5 border border-primary/25 p-7 mb-10 text-center"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6, ease: "easeOut" }}
        >
          <Calendar className="w-8 h-8 text-primary mx-auto mb-3" />
          <h3 className="font-display text-xl mb-2">What to Expect</h3>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            3 days. 44 minutes a day. Guided exercises, reflection prompts, and a community of women building alongside you. This isn't theory — it's transformation.
          </p>
        </motion.div>

        {/* Social + back */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
        >
          <p className="font-body text-sm text-muted-foreground mb-4">
            Follow along for daily inspiration:
          </p>
          <a
            href="https://instagram.com/BrickhouseMindset"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 py-3 px-6 rounded-xl border border-accent/40 font-body font-semibold text-sm text-accent transition-all hover:bg-accent hover:text-accent-foreground hover:scale-[1.02]"
          >
            <Instagram className="w-4 h-4" />
            @BrickhouseMindset
          </a>

          <div className="mt-8">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </motion.div>

        {/* Footer sig */}
        <div className="text-center pt-10 pb-5 text-[11px] text-muted-foreground/40 tracking-[2px]">
          Built with love by <span className="text-accent">Che' Lovelight</span> · Lifestyle Architect
        </div>
      </div>
    </div>
  );
};

export default BreakthroughConfirmation;
