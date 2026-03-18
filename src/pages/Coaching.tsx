import { motion } from "framer-motion";
import logo from "@/assets/brickhouse-logo.png";
import LandingFooter from "@/components/LandingFooter";
import ScrollReveal from "@/components/ScrollReveal";
import { analytics } from "@/lib/analytics";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

const Coaching = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 py-24 overflow-hidden">
        {/* Pink radial glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[60%] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, hsl(330 100% 42% / 0.15) 0%, transparent 70%)",
          }}
        />

        <motion.div className="relative z-10 max-w-2xl mx-auto" {...fadeUp}>
          <img
            src={logo}
            alt="Brickhouse Mindset"
            className="w-[clamp(180px,50vw,320px)] mx-auto mb-8 drop-shadow-[0_0_40px_hsl(330_100%_42%/0.4)]"
          />

          <p className="font-display text-base tracking-[5px] text-accent mb-5 opacity-90">
            LIFESTYLE ARCHITECT
          </p>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] mb-6">
            Build the life you've been{" "}
            <span className="text-gradient-pink">designing in your head.</span>
          </h1>

          <p className="font-body text-lg text-muted-foreground max-w-lg mx-auto">
            Not a life coach. A Lifestyle Architect. 20+ years of executive
            experience turned into a blueprint for women who are done surviving
            and ready to build.
          </p>
        </motion.div>
      </section>

      {/* Anchor Story */}
      <ScrollReveal>
        <section className="px-6 py-20">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-2 text-[10px] tracking-[3px] text-accent uppercase mb-6">
              <span className="flex-1 max-w-[60px] h-px bg-accent/30" />
              The Story Behind the Blueprint
              <span className="flex-1 max-w-[60px] h-px bg-accent/30" />
            </div>

            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl leading-[1.1] mb-8">
              She chose to <span className="text-gradient-pink">build</span>,
              not break.
            </h2>

            <div className="space-y-5 font-body text-[15px] leading-relaxed text-foreground/75">
              <p>
                Che' Lovelight's daughter was abducted. For two years, she had no
                contact. In that same season, she faced divorce, unemployment,
                and gained 35 pounds.
              </p>
              <p>
                Everything that could break a woman — happened. And she made a
                choice:{" "}
                <strong className="text-foreground">Build. Don't. Break.</strong>
              </p>
              <p>
                That decision became a framework. That framework became 144
                lessons across 12 life categories. That system became{" "}
                <span className="text-accent">Brickhouse Mindset</span> — a
                complete owner's manual for women who are done surviving and
                ready to architect a life that actually feels like theirs.
              </p>
              <p>
                With 20+ years of executive experience in technology and the
                music industry, Che' doesn't do fluffy affirmations. She builds
                blueprints. Brick by brick. Area by area. Day by day.
              </p>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* What You Get */}
      <ScrollReveal delay={0.1}>
        <section className="px-6 py-20">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl leading-[1.1] text-center mb-12">
              What working with Che'{" "}
              <span className="text-accent">looks like</span>
            </h2>

            <div className="space-y-4">
              {[
                {
                  icon: "🏛️",
                  title: "The Brickhouse Blueprint",
                  desc: "A personalized plan built around YOUR 12 Bricks — not generic advice. Every prescription is tailored to where you are and where you're building toward.",
                },
                {
                  icon: "🔥",
                  title: "Direct Access to Che'",
                  desc: "Priority 1:1 sessions. No gatekeepers, no group calls where you're one of 200. Just you and your Lifestyle Architect.",
                },
                {
                  icon: "📐",
                  title: "Life Architecture Sessions",
                  desc: "Strategic planning that turns 'I want to change my life' into a phased, time-bound blueprint with accountability built in.",
                },
                {
                  icon: "⚡",
                  title: "Code Switch Mastery",
                  desc: "Che's proprietary technique for shifting out of pain, overwhelm, or stagnation in real time — not after 6 months of therapy.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-gradient-card border border-border rounded-2xl p-6 hover:border-primary/40 transition-colors"
                >
                  <div className="text-2xl mb-3">{item.icon}</div>
                  <h3 className="font-display text-xl tracking-wider mb-2">
                    {item.title}
                  </h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Who This Is For */}
      <ScrollReveal delay={0.1}>
        <section className="px-6 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl leading-[1.1] mb-8">
              This is for the woman who…
            </h2>

            <div className="space-y-3 font-body text-[15px] text-foreground/75 max-w-lg mx-auto text-left">
              {[
                "Has the career, the résumé, and the body — but still feels empty inside.",
                "Is surviving day to day, directionless and overwhelmed.",
                "Gives everything to everyone else and gets crumbs in return.",
                "Knows she's meant for more but can't figure out the next step.",
                "Is done with generic advice and ready for a real blueprint.",
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-primary mt-0.5 shrink-0">✦</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* CTA */}
      <ScrollReveal>
        <section className="px-6 py-20">
          <div className="max-w-xl mx-auto text-center">
            <div className="bg-gradient-to-br from-primary/[0.15] to-background/50 border border-primary/30 rounded-2xl p-10">
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl leading-[1.1] mb-4">
                Ready to <span className="text-gradient-pink">architect</span>{" "}
                your life?
              </h2>

              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-8 max-w-md mx-auto">
                1:1 coaching with Che' is high-ticket and limited. If you're
                serious about building, send the word and she'll reach back.
              </p>

              <a
                href="https://instagram.com/BrickhouseMindset"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  analytics.ctaClicked(
                    "Coaching DM CTA",
                    "https://instagram.com/BrickhouseMindset"
                  )
                }
                className="inline-block bg-gradient-pink text-foreground font-body font-extrabold text-[13px] tracking-[2px] uppercase px-12 py-[18px] cursor-pointer [clip-path:polygon(8px_0%,100%_0%,calc(100%-8px)_100%,0%_100%)] hover:opacity-90 hover:-translate-y-0.5 transition-all mb-4"
              >
                DM "ARCHITECT" on Instagram →
              </a>

              <p className="font-body text-xs text-muted-foreground opacity-60">
                @BrickhouseMindset · Limited spots available
              </p>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <LandingFooter />
    </div>
  );
};

export default Coaching;
