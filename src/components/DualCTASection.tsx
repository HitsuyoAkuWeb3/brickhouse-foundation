import { useState } from "react";
import { ClipboardCheck, Flame } from "lucide-react";
import LeadCaptureModal from "@/components/LeadCaptureModal";

const DualCTASection = () => {
  const [modalVariant, setModalVariant] = useState<"audit" | "breakthrough">(
    "audit"
  );
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = (variant: "audit" | "breakthrough") => {
    setModalVariant(variant);
    setModalOpen(true);
  };

  return (
    <section className="relative px-6 py-20 md:py-28">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-center mb-4">
          Choose Your Starting Point
        </h2>
        <p className="font-body text-muted-foreground text-center mb-14 max-w-lg mx-auto">
          Whether you need clarity or action — we've got you.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Life Audit Card */}
          <div className="group relative rounded-2xl bg-gradient-card border border-border p-8 md:p-10 transition-all duration-500 hover:border-primary/40 hover:shadow-pink-glow">
            <span className="inline-block font-display text-sm tracking-[4px] text-gold-light mb-6">
              OPTION 1
            </span>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <ClipboardCheck className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-2xl md:text-3xl">
                Brickhouse Life Audit
              </h3>
            </div>

            <p className="font-body text-muted-foreground mb-6 leading-relaxed">
              Know exactly where you're building from. 5 life areas. 2 minutes.
              Personalized results that name the wound holding you back.
            </p>

            <div className="flex items-center gap-3 mb-8">
              <span className="font-display text-3xl text-gradient-gold">
                FREE
              </span>
            </div>

            <button
              onClick={() => openModal("audit")}
              className="w-full py-4 px-6 rounded-xl bg-gradient-pink font-body font-semibold tracking-wide transition-all duration-300 hover:scale-[1.02] text-foreground"
            >
              Start My Audit →
            </button>
          </div>

          {/* Breakthrough Card */}
          <div className="group relative rounded-2xl bg-gradient-card border border-border p-8 md:p-10 transition-all duration-500 hover:border-accent/40 hover:shadow-gold-glow">
            <span className="inline-block font-display text-sm tracking-[4px] text-gold-light mb-6">
              OPTION 2
            </span>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Flame className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-display text-2xl md:text-3xl">
                Brickhouse Breakthrough
              </h3>
            </div>

            <p className="font-body text-muted-foreground mb-6 leading-relaxed">
              3-Day Intensive. 44 minutes a day. A free virtual program designed
              to start building your Brickhouse — now.
            </p>

            <div className="flex items-center gap-3 mb-8">
              <span className="font-display text-3xl text-gradient-gold">
                FREE
              </span>
            </div>

            <button
              onClick={() => openModal("breakthrough")}
              className="w-full py-4 px-6 rounded-xl border-2 border-accent font-body font-semibold tracking-wide text-accent transition-all duration-300 hover:bg-accent hover:text-accent-foreground hover:scale-[1.02]"
            >
              Register Now →
            </button>
          </div>
        </div>
      </div>

      <LeadCaptureModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        variant={modalVariant}
      />
    </section>
  );
};

export default DualCTASection;
