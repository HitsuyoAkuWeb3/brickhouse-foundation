import logo from "@/assets/BHhres-white.png";
import heroImage from "@/assets/hero-image.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 py-20 overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt=""
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-hero" />
        {/* Pink radial glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[70%]"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, hsl(330 100% 42% / 0.18) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Logo */}
        <div className="mb-8 animate-fade-up">
          <img
            src={logo}
            alt="Brickhouse Mindset"
            className="w-[clamp(220px,60vw,420px)] mx-auto"
          />
        </div>

        {/* Eyebrow */}
        <p
          className="font-display text-lg tracking-[6px] mb-4 opacity-90 animate-fade-up"
          style={{ animationDelay: "0.2s" }}
        >
          SIMPLIFYING LOVING YOURSELF
        </p>

        {/* Headline */}
        <h1
          className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1] mb-6 animate-fade-up"
          style={{ animationDelay: "0.4s" }}
        >
          You already know something needs to shift.{" "}
          <span className="text-gradient-pink">Let's find out what.</span>
        </h1>

        {/* Subhead */}
        <p
          className="font-body text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto mb-12 animate-fade-up"
          style={{ animationDelay: "0.6s" }}
        >
          Two ways to start. Both are free. Both will change how you see
          yourself.
        </p>

        {/* Scroll indicator */}
        <div
          className="animate-float"
          style={{ animationDelay: "1s" }}
        >
          <svg
            className="w-6 h-6 mx-auto text-primary opacity-60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
