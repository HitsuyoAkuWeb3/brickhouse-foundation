import { useState } from "react";
import LeadCaptureModal from "@/components/LeadCaptureModal";

const SocialProofSection = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section className="relative px-6 py-20 md:py-28">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />

      <div className="max-w-3xl mx-auto text-center">
        <p className="font-display text-sm tracking-[6px] text-gold-light mb-4">
          BUILD DON'T BREAK
        </p>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl mb-6">
          144 Lessons. 12 Life Categories.
          <br />
          <span className="text-gradient-pink">One Brickhouse.</span>
        </h2>
        <p className="font-body text-muted-foreground text-lg mb-10 max-w-xl mx-auto leading-relaxed">
          The Master Builder number isn't a coincidence. Brickhouse Mindset is a
          complete operating system for your life — designed by Che' Lovelight,
          Lifestyle Architect with 20+ years in technology and music.
        </p>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-12">
          {[
            { number: "144", label: "Lessons" },
            { number: "12", label: "Life Bricks" },
            { number: "3", label: "Transformations" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-4xl md:text-5xl text-gradient-gold">
                {stat.number}
              </p>
              <p className="font-body text-xs tracking-widest text-muted-foreground uppercase mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => setModalOpen(true)}
          className="py-4 px-10 rounded-xl bg-gradient-pink font-body font-semibold tracking-wide transition-all duration-300 hover:scale-[1.02] text-foreground"
        >
          Take the Free Life Audit →
        </button>
      </div>

      <LeadCaptureModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        variant="audit"
      />
    </section>
  );
};

export default SocialProofSection;
