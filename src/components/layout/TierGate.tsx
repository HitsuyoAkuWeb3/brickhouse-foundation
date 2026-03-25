import React from "react";
import { useProfile, type SubscriptionTier } from "@/hooks/useProfile";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface TierGateProps {
  requiredTier: SubscriptionTier;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const TIER_WEIGHTS: Record<SubscriptionTier, number> = {
  free: 0,
  foundation: 1,
  brickhouse: 2,
  goddess: 3,
  coaching: 4,
};

export const TierGate: React.FC<TierGateProps> = ({ requiredTier, children, fallback }) => {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const userTier = profile?.subscription_tier || "free";
  const hasAccess = TIER_WEIGHTS[userTier] >= TIER_WEIGHTS[requiredTier];

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  // Default upgrade prompt
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/20">
      <Lock className="w-12 h-12 mb-4 text-muted-foreground" />
      <h3 className="text-xl font-bold mb-2">Upgrade Required</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        This content requires the <span className="capitalize font-semibold">{requiredTier}</span> tier or higher. 
        Upgrade your access to unlock this feature and continue your transformation.
      </p>
      <Button 
        onClick={() => navigate(`/checkout?tier=${requiredTier}`)}
        className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        Upgrade to {requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)}
      </Button>
    </div>
  );
};
