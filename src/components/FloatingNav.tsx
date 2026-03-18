import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Home, LayoutDashboard, BookOpen, Sunrise, ClipboardCheck, LogOut, Sparkles, Flame, Gem } from "lucide-react";
import logo from "@/assets/brickhouse-logo.png";

const publicLinks = [
  { to: "/", label: "Home", icon: Home },
  { to: "/life-audit", label: "Life Audit", icon: ClipboardCheck },
  { to: "/coaching", label: "Coaching", icon: BookOpen },
];

const authedLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/bricks", label: "My Bricks", icon: BookOpen },
  { to: "/daily-ritual", label: "Daily Ritual", icon: Sunrise },
  { to: "/affirmations", label: "Affirmations", icon: Sparkles },
  { to: "/passion-pick", label: "Passion Pick", icon: Flame },
  { to: "/goddess-rx", label: "Goddess Rx", icon: Gem },
];

const FloatingNav = () => {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Hide on auth/onboarding/reset pages
  const hidden = ["/auth", "/onboarding", "/reset-password"].some((p) =>
    location.pathname.startsWith(p)
  );
  if (hidden) return null;

  const links = user ? authedLinks : publicLinks;

  const handleNav = (to: string) => {
    navigate(to);
    setOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
    navigate("/");
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[98]"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Expanded menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-20 right-6 z-[99] bg-card/95 backdrop-blur-xl border border-border rounded-2xl p-5 min-w-[220px] shadow-[0_0_40px_hsl(var(--primary)/0.2)]"
          >
            <img src={logo} alt="Brickhouse" className="w-24 mx-auto mb-4 opacity-80" />

            <nav className="flex flex-col gap-1">
              {links.map((link) => {
                const active = location.pathname === link.to;
                return (
                  <button
                    key={link.to}
                    onClick={() => handleNav(link.to)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-body transition-all ${
                      active
                        ? "bg-primary/15 text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </button>
                );
              })}

              {user && (
                <>
                  <div className="h-px bg-border my-2" />
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-body text-muted-foreground hover:text-destructive transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating pill trigger */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed top-5 right-6 z-[100] w-12 h-12 rounded-full bg-gradient-pink border border-primary/30 flex items-center justify-center shadow-[0_0_30px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_40px_hsl(var(--primary)/0.6)] transition-shadow"
        whileTap={{ scale: 0.9 }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="w-6 h-6 text-foreground" />
            </motion.div>
          ) : (
            <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Menu className="w-6 h-6 text-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
};

export default FloatingNav;
