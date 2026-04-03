import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";
import logo from "@/assets/BHhres-white.png";

const LandingFooter = () => {
  return (
    <footer className="relative px-6 py-16 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-10">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <img src={logo} alt="Brickhouse Mindset" className="w-36 opacity-80" />
            <p className="font-body text-sm text-muted-foreground max-w-xs text-center md:text-left">
              Simplifying Loving Yourself and Creating a Life That You Love.
            </p>
            <a
              href="https://instagram.com/BrickhouseMindset"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center transition-colors hover:border-primary hover:text-primary text-muted-foreground"
            >
              <Instagram className="w-4 h-4" />
            </a>
          </div>

          {/* Links */}
          <div className="flex gap-12">
            <div className="flex flex-col gap-2.5">
              <span className="font-display text-xs tracking-[3px] text-accent mb-1">EXPLORE</span>
              <Link to="/life-audit" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">Life Audit</Link>
              <Link to="/coaching" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">Coaching</Link>
              <Link to="/auth" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
            </div>
            <div className="flex flex-col gap-2.5">
              <span className="font-display text-xs tracking-[3px] text-accent mb-1">LEGAL</span>
              <Link to="/terms" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
              <Link to="/privacy" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link to="/contact" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
            </div>
          </div>
        </div>

        <div className="h-px bg-border my-8" />

        <p className="font-body text-xs text-muted-foreground text-center opacity-60">
          © {new Date().getFullYear()} Brickhouse Mindset. Che' Lovelight, Lifestyle Architect. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default LandingFooter;
