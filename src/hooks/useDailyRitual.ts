import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

export interface DailyRitual {
  id: string;
  user_id: string;
  ritual_date: string;
  morning_affirmation: boolean;
  midday_checkin: boolean;
  evening_reflection: boolean;
  joy_moment: string | null;
  gratitude_note: string | null;
}

export const useDailyRitual = (date?: Date) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const today = format(date ?? new Date(), "yyyy-MM-dd");

  const { data: ritual, isLoading } = useQuery({
    queryKey: ["daily-ritual", user?.id, today],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_rituals")
        .select("*")
        .eq("user_id", user!.id)
        .eq("ritual_date", today)
        .maybeSingle();
      if (error) throw error;
      return data as DailyRitual | null;
    },
  });

  const upsertRitual = useMutation({
    mutationFn: async (updates: Partial<Omit<DailyRitual, "id" | "user_id" | "ritual_date">>) => {
      const { data: existing } = await supabase
        .from("daily_rituals")
        .select("id")
        .eq("user_id", user!.id)
        .eq("ritual_date", today)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("daily_rituals")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("daily_rituals")
          .insert({ user_id: user!.id, ritual_date: today, ...updates });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-ritual", user?.id, today] });
    },
  });

  // Streak calculation
  const { data: streakData } = useQuery({
    queryKey: ["ritual-streak", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_rituals")
        .select("ritual_date, morning_affirmation, midday_checkin, evening_reflection")
        .eq("user_id", user!.id)
        .order("ritual_date", { ascending: false })
        .limit(90);
      if (error) throw error;
      return data;
    },
  });

  const streak = (() => {
    if (!streakData?.length) return 0;
    let count = 0;
    const now = new Date();
    for (let i = 0; i < streakData.length; i++) {
      const d = new Date(streakData[i].ritual_date);
      const expected = new Date(now);
      expected.setDate(expected.getDate() - i);
      if (format(d, "yyyy-MM-dd") !== format(expected, "yyyy-MM-dd")) break;
      const r = streakData[i];
      if (r.morning_affirmation || r.midday_checkin || r.evening_reflection) count++;
      else break;
    }
    return count;
  })();

  return { ritual, isLoading, upsertRitual, streak };
};
