import { SquarePaymentForm } from "@/components/SquarePaymentForm";
import { CheckCircle2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import logo from "@/assets/BHhres-white.png";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

const Checkout = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const tier = searchParams.get("tier") || "foundation";

  const tierDetails = {
    mini: { name: "Mini Bundle", price: 88, desc: "Book + Audiobook + Workbook", features: ["The Book", "The Workbook", "The Audiobook"] },
    foundation: { name: "Collective Foundation", price: 55, desc: "Core app access to begin laying your foundation.", features: ["Immediate Platform Access", "Daily Rituals", "Passion Pick"] },
    brickhouse: { name: "Collective Brickhouse", price: 123, desc: "Advanced access for serious builders.", features: ["Foundation Access", "Goddess Prescription", "Brick Circles"] },
    goddess: { name: "Collective Goddess", price: 555, desc: "The ultimate transformation track.", features: ["Full Access", "Priority 1:1 Coaching", "Che's Corner"] }
  };

  const currentTier = tierDetails[tier as keyof typeof tierDetails] || tierDetails.foundation;

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <h2 className="font-display text-2xl text-foreground mb-4">Please sign in to proceed</h2>
        <Link to="/auth" className="text-primary underline">Go to Sign In</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 sm:px-6 pt-12 pb-20 relative overflow-x-hidden">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 relative z-10">
        
        {/* Left Column: Product Summary */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col justify-center"
        >
          <img src={logo} alt="Brickhouse Logo" className="w-24 mb-8" />
          
          <div className="inline-block px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-[10px] uppercase tracking-widest text-accent mb-4 self-start">
            {tier.toUpperCase()} ACCESS
          </div>
          
          <h1 className="font-display text-4xl sm:text-5xl text-foreground mb-6 tracking-wide leading-tight">
            {currentTier.name}
          </h1>
          
          <p className="font-body text-foreground/70 mb-8 max-w-md text-sm leading-relaxed">
            {currentTier.desc}
          </p>

          <div className="space-y-4 mb-8">
            {currentTier.features.map((feat, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-display text-sm tracking-widest text-foreground">{feat}</h4>
                </div>
              </div>
            ))}
          </div>

        </motion.div>

        {/* Right Column: Square Integration */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center justify-center lg:items-end w-full"
        >
          <div className="w-full">
            <SquarePaymentForm 
              amount={currentTier.price} 
              tier={tier}
              label={`Pay $${currentTier.price}/mo`} 
            />
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Checkout;
