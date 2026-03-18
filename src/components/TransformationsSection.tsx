import { Sparkles, Waves, Heart } from "lucide-react";

const transformations = [
  {
    title: "Badbody to Brickhouse",
    description:
      "You look good on paper but feel empty inside. The body or the success is there — the internal beauty isn't. It's time to align what the world sees with what you actually feel.",
    icon: Sparkles,
    accent: "primary" as const,
  },
  {
    title: "Drowning to Building",
    description:
      "You're surviving, not living. Directionless, overwhelmed, just getting through the day. You don't need more motivation — you need a blueprint.",
    icon: Waves,
    accent: "secondary" as const,
  },
  {
    title: "Crumbs to Adoration",
    description:
      "You're overgiving and getting nothing back. You accept crumbs when you deserve adoration. It's time to raise your standard — permanently.",
    icon: Heart,
    accent: "accent" as const,
  },
];

const accentStyles = {
  primary: {
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    border: "hover:border-primary/30",
  },
  secondary: {
    iconBg: "bg-secondary/20",
    iconColor: "text-primary",
    border: "hover:border-secondary/40",
  },
  accent: {
    iconBg: "bg-accent/10",
    iconColor: "text-accent",
    border: "hover:border-accent/30",
  },
};

const TransformationsSection = () => {
  return (
    <section className="relative px-6 py-20 md:py-28">
      {/* Divider glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />

      <div className="max-w-5xl mx-auto">
        <p className="font-display text-sm tracking-[6px] text-gold-light text-center mb-4">
          THREE TRANSFORMATIONS
        </p>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-center mb-4">
          Which Woman Are You?
        </h2>
        <p className="font-body text-muted-foreground text-center mb-14 max-w-lg mx-auto">
          Every woman who builds her Brickhouse starts from one of these places.
          Find yours.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {transformations.map((t) => {
            const styles = accentStyles[t.accent];
            return (
              <div
                key={t.title}
                className={`group rounded-2xl bg-gradient-card border border-border p-8 transition-all duration-500 ${styles.border} hover:shadow-card hover:-translate-y-1`}
              >
                <div
                  className={`w-14 h-14 rounded-xl ${styles.iconBg} flex items-center justify-center mb-6`}
                >
                  <t.icon className={`w-7 h-7 ${styles.iconColor}`} />
                </div>

                <h3 className="font-display text-xl md:text-2xl mb-4">
                  {t.title}
                </h3>

                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  {t.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TransformationsSection;
