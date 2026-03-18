import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Settings, User as UserIcon, Crown, Calendar, Target } from "lucide-react";
import { createShopifyCheckout } from "@/lib/shopify";

const TIER_DISPLAY_NAMES: Record<string, string> = {
  free: "Free Tier",
  foundation: "Foundation Tier",
  brickhouse: "Brickhouse Tier",
  goddess: "Goddess Tier",
  coaching: "1:1 Coaching",
};

export default function Profile() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { data: profile, isLoading } = useProfile();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const currentTier = profile?.subscription_tier || "free";
  const displayTier = TIER_DISPLAY_NAMES[currentTier] || "Free Tier";

  return (
    <div className="flex flex-col space-y-6 pb-24 p-4 sm:p-6 max-w-lg mx-auto w-full pt-16 sm:pt-20">
      <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl sm:text-4xl tracking-wider">
            Profile
          </h1>
          <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center border-2 border-accent/20">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Profile" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <UserIcon className="h-10 w-10 text-accent" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold">{profile?.name || "Queen"}</h2>
                    <p className="text-muted-foreground">{profile?.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Crown className="w-5 h-5 mr-2 text-accent" />
                  Subscription
                </CardTitle>
                <CardDescription>Your current access level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-md border border-border/50">
                    <span className="font-medium">Current Tier</span>
                    <span className="font-semibold text-accent capitalize">{displayTier}</span>
                  </div>
                  
                  {currentTier === "free" && (
                    <Button 
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                      onClick={() => createShopifyCheckout("foundation")}
                    >
                      Upgrade to Foundation
                    </Button>
                  )}
                  {currentTier === "foundation" && (
                     <Button 
                     className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                     onClick={() => createShopifyCheckout("brickhouse")}
                   >
                     Upgrade to Brickhouse
                   </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <Target className="w-4 h-4 mr-2" />
                    Transformation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium">Path</p>
                  <p className="text-muted-foreground capitalize text-sm mb-3">
                    {profile?.transformation_choice ? profile.transformation_choice.replace(/_/g, ' ') : "Not set"}
                  </p>
                  
                  <p className="text-sm font-medium">Goals</p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground mt-1 space-y-1">
                    {profile?.goals && profile.goals.length > 0 ? (
                      profile.goals.map((goal, i) => <li key={i}>{goal}</li>)
                    ) : (
                      <li>No goals set yet</li>
                    )}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <Calendar className="w-4 h-4 mr-2" />
                    Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium">Birth Date</p>
                  <p className="text-muted-foreground text-sm mb-3">
                    {profile?.birth_date ? new Date(profile.birth_date).toLocaleDateString() : "Not provided"}
                  </p>
                  
                  <p className="text-sm font-medium">Sun Sign</p>
                  <p className="text-muted-foreground text-sm capitalize">
                    {profile?.sun_sign || "Not provided"}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Button 
              variant="destructive" 
              className="w-full mt-8" 
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        )}
    </div>
  );
}
