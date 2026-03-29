import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Settings, User as UserIcon, Crown, Calendar, Target, Sparkles, Trophy, Heart } from "lucide-react";
import { useGoddessRx } from "@/hooks/useGoddessRx";
import { useLeveling } from "@/hooks/useLeveling";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

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
  const { prescription } = useGoddessRx();
  const { score, title, nextTierScore, progress } = useLeveling();

  const { data: gratitudeHistory } = useQuery({
    queryKey: ["gratitude-history", profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_rituals")
        .select("date, ritual_data")
        .eq("profile_id", profile!.id)
        .order("date", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data
        .filter((d: Record<string, unknown>) => d.ritual_data && (d.ritual_data as Record<string, unknown>).gratitude_note)
        .map((d: Record<string, unknown>) => ({
          // Fix timezone issue when parsing date strings
          date: format(new Date((d.date as string) + "T00:00:00"), "MMM d, yyyy"),
          note: (d.ritual_data as Record<string, unknown>).gratitude_note as string,
        }));
    },
  });

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
                    <h2 className="text-2xl font-semibold">{profile?.name || "Brick House"}</h2>
                    <p className="text-muted-foreground">{profile?.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center">
                    <Trophy className="w-5 h-5 mr-2 text-accent" />
                    Builder Rank
                  </div>
                  <span className="text-primary font-display">{title}</span>
                </CardTitle>
                <CardDescription>Your Lifestyle Architecture Progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{score} XP</span>
                  <span>{score >= 500 ? "MAX" : `${nextTierScore} XP`}</span>
                </div>
                <div className="h-2 w-full bg-foreground/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000" 
                    style={{ width: `${progress}%` }} 
                  />
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
                      onClick={() => navigate("/checkout?tier=foundation")}
                    >
                      Upgrade to Foundation
                    </Button>
                  )}
                  {currentTier === "foundation" && (
                     <Button 
                     className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                     onClick={() => navigate("/checkout?tier=brickhouse")}
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
                  
                  <p className="text-sm font-medium">Zodiac Sign</p>
                  <p className="text-muted-foreground text-sm capitalize">
                    {profile?.zodiac_sign || "Not provided"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {prescription && (
              <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <Sparkles className="w-4 h-4 mr-2 text-primary" />
                    Latest Goddess Rx
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium mb-1">Mantra</p>
                  <p className="text-muted-foreground text-sm italic mb-3">
                    "{prescription.mantra}"
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {prescription.crystals.slice(0, 2).map((c, i) => (
                      <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {c.emoji || "💎"} {c.name}
                      </span>
                    ))}
                    {prescription.colors.slice(0, 1).map((c, i) => (
                      <span key={i} className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.hex }} />
                        {c.name}
                      </span>
                    ))}
                  </div>
                  <Button variant="link" className="mt-3 h-auto p-0 text-xs text-muted-foreground" onClick={() => navigate("/goddess-rx")}>
                    View Full Prescription
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Gratitude History Card */}
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <Heart className="w-4 h-4 mr-2 text-primary" />
                  Gratitude History
                </CardTitle>
                <CardDescription>Your moments of joy and appreciation</CardDescription>
              </CardHeader>
              <CardContent>
                {(!gratitudeHistory || gratitudeHistory.length === 0) ? (
                  <p className="text-sm text-muted-foreground italic">No gratitude notes saved yet.</p>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {gratitudeHistory.map((item, i) => (
                      <div key={i} className="bg-foreground/[0.03] border border-border/50 rounded-lg p-3 transition-colors hover:bg-foreground/[0.05]">
                        <div className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">{item.date}</div>
                        <p className="text-sm text-foreground/90 leading-relaxed">💛 {item.note}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

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
