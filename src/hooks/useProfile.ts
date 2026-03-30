import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// Temporarily declaring the type here since we haven't regenerated types yet
export type SubscriptionTier = 'free' | 'foundation' | 'brickhouse' | 'goddess' | 'coaching';

export interface Profile {
  id: string;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
  audit_scores: Record<string, number> | null;
  birth_date: string | null;
  goals: string[] | null;
  transformation_choice: string | null;
  subscription_tier: SubscriptionTier;
  shopify_customer_id: string | null;
  zodiac_sign?: string | null;
  reminder_preferences?: Record<string, unknown> | null;
  passion_pick_media?: string | null;
}

export const useProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async (): Promise<Profile | null> => {
      if (!user) return null;

      const { data, error } = await (supabase as any)
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }

      // Cast to the extended profile type to include the fields added in the new migration
      return data as unknown as Profile;
    },
    enabled: !!user,
  });
};
