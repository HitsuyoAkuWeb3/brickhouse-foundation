import React, { useState, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { createShopifyCheckout } from "@/lib/shopify";
import { useAuth } from "@/hooks/useAuth";
import { CreditCard, Bell, User, Loader2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const { data: profile, refetch, isLoading } = useProfile();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setBirthDate(profile.birth_date || "");
      
      try {
        const prefs = profile.reminder_preferences as Record<string, unknown>;
        setRemindersEnabled(prefs?.enabled === true);
      } catch (e) {
        setRemindersEnabled(false);
      }
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    
    try {
      const updates = {
        name,
        birth_date: birthDate || null,
      };

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;
      
      await refetch();
      toast({
        title: "Profile updated",
        description: "Your personal information has been saved.",
      });
    } catch (error) {
      toast({
        title: "Error saving profile",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleReminders = async (enabled: boolean) => {
    if (!user) return;
    setRemindersEnabled(enabled);
    
    try {
      const prefs = ((profile?.reminder_preferences as Record<string, unknown>) || {});
      const newPrefs = { ...prefs, enabled };
      
      const { error } = await supabase
        .from("profiles")
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - Supabase types haven't been updated for reminder_preferences yet
        .update({ reminder_preferences: newPrefs })
        .eq("id", user.id);
        
      if (error) throw error;
      
      toast({
        title: enabled ? "Reminders enabled" : "Reminders disabled",
        description: "Your notification preferences have been updated.",
      });
    } catch (error) {
      setRemindersEnabled(!enabled); // Revert on failure
      toast({
        title: "Error updating preferences",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleManageSubscription = () => {
    // We would redirect to Stripe billing portal here.
    // Since we don't have the backend implementation yet, we'll show a toast or create a checkout
    if (profile?.subscription_tier === 'free') {
      createShopifyCheckout('foundation');
    } else {
      toast({
        title: "Billing Portal",
        description: "Customer portal integration is coming soon.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full pt-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6 pb-24 p-4 sm:p-6 max-w-lg mx-auto w-full pt-16 sm:pt-20">
      <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-display text-3xl sm:text-4xl tracking-wider">
            Settings
          </h1>
        </div>

        <div className="space-y-6">
          <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Personal Information
              </CardTitle>
              <CardDescription>Update your basic profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Birth Date</Label>
                <Input 
                  id="birthDate" 
                  type="date"
                  value={birthDate} 
                  onChange={(e) => setBirthDate(e.target.value)} 
                />
              </div>
              <Button 
                onClick={handleSaveProfile} 
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Notifications
              </CardTitle>
              <CardDescription>Manage your daily reminders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="reminders" className="flex flex-col space-y-1">
                  <span>Daily Reminders</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Receive push notifications for your daily rituals
                  </span>
                </Label>
                <Switch 
                  id="reminders" 
                  checked={remindersEnabled}
                  onCheckedChange={handleToggleReminders}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Subscription & Billing
              </CardTitle>
              <CardDescription>Manage your access tier and payment methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-md border border-border/50 flex flex-col sm:flex-row justify-between sm:items-center space-y-4 sm:space-y-0">
                <div>
                  <p className="font-medium text-sm text-muted-foreground mb-1">Current Plan</p>
                  <p className="font-semibold text-lg capitalize">{profile?.subscription_tier || "Free"} Tier</p>
                </div>
                <Button variant="outline" onClick={handleManageSubscription}>
                  Manage Billing
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}
