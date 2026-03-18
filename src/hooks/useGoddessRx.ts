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
  user_id: string;
  zodiac_sign: string;
  element: string | null;
  ruling_planet: string | null;
  crystals: Crystal[];
  colors: PowerColor[];
  spiritual_tools: SpiritualTool[];
  mantra: string | null;
  created_at: string;
  updated_at: string;
}

export const useGoddessRx = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: prescription, isLoading } = useQuery({
    queryKey: ["goddess-rx", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("goddess_prescriptions")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        ...data,
        crystals: (data.crystals as unknown) as Crystal[],
        colors: (data.colors as unknown) as PowerColor[],
        spiritual_tools: (data.spiritual_tools as unknown) as SpiritualTool[],
      } as GoddessPrescription;
    },
  });

  const generate = useMutation({
    mutationFn: async () => {
      // Fetch profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("birth_date, transformation_choice, goals, name")
        .eq("id", user!.id)
        .single();

      if (!profile?.birth_date) {
        throw new Error("Please set your birth date in onboarding first.");
      }

      const { data, error } = await supabase.functions.invoke("goddess-rx", {
        body: {
          birth_date: profile.birth_date,
          transformation_choice: profile.transformation_choice,
          goals: profile.goals,
          name: profile.name,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Save to DB
      const { error: saveError } = await supabase
        .from("goddess_prescriptions")
        .insert({
          user_id: user!.id,
          zodiac_sign: data.zodiac_sign,
          element: data.element,
          ruling_planet: data.ruling_planet,
          crystals: data.crystals,
          colors: data.colors,
          spiritual_tools: data.spiritual_tools,
          mantra: data.mantra,
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
