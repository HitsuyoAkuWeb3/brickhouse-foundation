import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Crystal {
  name: string;
  reason: string;
  emoji?: string;
}

export interface PowerColor {
  name: string;
  hex: string;
  meaning: string;
}

export interface SpiritualTool {
  name: string;
  practice: string;
  emoji?: string;
}

export interface GoddessPrescription {
  id: string;
  profile_id: string;
  zodiac_sign: string;
  element: string | null;
  ruling_planet: string | null;
  crystals: Crystal[];
  colors: PowerColor[];
  spiritual_tools: SpiritualTool[];
  mantra: string | null;
  created_at: string;
  updated_at?: string;
}

// Helper to extract prescription fields from prescription_data Json
function parsePrescription(row: any): GoddessPrescription {
  const pd = row.prescription_data ?? {};
  return {
    id: row.id,
    profile_id: row.profile_id,
    zodiac_sign: pd.zodiac_sign ?? "",
    element: pd.element ?? null,
    ruling_planet: pd.ruling_planet ?? null,
    crystals: (pd.crystals ?? []) as Crystal[],
    colors: (pd.colors ?? []) as PowerColor[],
    spiritual_tools: (pd.spiritual_tools ?? []) as SpiritualTool[],
    mantra: pd.mantra ?? null,
    created_at: row.created_at,
  };
}

export const useGoddessRx = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: prescription, isLoading } = useQuery({
    queryKey: ["goddess-rx", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("goddess_prescriptions")
        .select("*")
        .eq("profile_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return parsePrescription(data);
    },
  });

  const generate = useMutation({
    mutationFn: async () => {
      const { data: profile } = await (supabase as any)
        .from("profiles")
        .select("zodiac_sign, transformation_choice, goals, full_name")
        .eq("id", user!.id)
        .single();
      if (!profile) throw new Error("Profile not found.");

      if (!profile?.zodiac_sign) {
        throw new Error("Please set your zodiac sign in onboarding first.");
      }

      const { data, error } = await supabase.functions.invoke("goddess-rx", {
        body: {
          zodiac_sign: profile.zodiac_sign,
          transformation_choice: profile.transformation_choice,
          goals: profile.goals,
          name: profile.full_name,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Save to DB — store everything in prescription_data Json
      const { error: saveError } = await (supabase as any)
        .from("goddess_prescriptions")
        .insert({
          profile_id: user!.id,
          prescription_data: {
            zodiac_sign: data.zodiac_sign,
            element: data.element,
            ruling_planet: data.ruling_planet,
            crystals: data.crystals,
            colors: data.colors,
            spiritual_tools: data.spiritual_tools,
            mantra: data.mantra,
          },
        });
      if (saveError) throw saveError;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goddess-rx", user?.id] });
    },
  });

  return { prescription, isLoading, generate };
};
