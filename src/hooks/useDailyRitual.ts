import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCrudField } from "@/hooks/useCrudField";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

export type DailyRitual = {
  id: string;
  profile_id: string;
  date: string;
  morning_completed: boolean;
  midday_completed: boolean;
  evening_completed: boolean;
  ritual_data: Record<string, any>;
  created_at: string;
};

export const useDailyRitual = (date?: Date) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const today = format(date ?? new Date(), "yyyy-MM-dd");

  const { data: ritual, isLoading } = useQuery({
    queryKey: ["daily-ritual", user?.id, today],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("daily_rituals")
        .select("*")
        .eq("profile_id", user!.id)
        .eq("date", today)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        ...data,
        ritual_data: (data.ritual_data as Record<string, any>) || {}
      } as DailyRitual;
    },
  });

  const crudMutation = useCrudField<DailyRitual>({
    tableName: "daily_rituals",
    queryKey: ["daily-ritual", user?.id, today],
    userIdColumn: "profile_id",
  });

  const upsertRitual = {
    mutate: (updates: Partial<Omit<DailyRitual, "id" | "profile_id" | "date" | "created_at">>) => {
      // Manual merge for JSON data
      const mergedRitualData = {
        ...((ritual?.ritual_data as Record<string, any>) || {}),
        ...(updates.ritual_data || {})
      };

      const mutationOptions = {
        onSettled: () => {
          queryClient.invalidateQueries({ queryKey: ["ritual-streak", user?.id] });
        }
      };

      if (ritual?.id) {
        crudMutation.mutate({
          id: ritual.id,
          updates: { ...updates, ritual_data: mergedRitualData }
        }, mutationOptions);
      } else {
        crudMutation.mutate({
          insertAppend: { date: today },
          updates: { ...updates, ritual_data: mergedRitualData }
        }, mutationOptions);
      }
    },
    isPending: crudMutation.isPending,
  };

  // Streak calculation
  const { data: streakData } = useQuery({
    queryKey: ["ritual-streak", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("daily_rituals")
        .select("date, morning_completed, midday_completed, evening_completed")
        .eq("profile_id", user!.id)
        .order("date", { ascending: false })
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
      const d = new Date(streakData[i].date);
      const expected = new Date(now);
      expected.setDate(expected.getDate() - i);
      if (format(d, "yyyy-MM-dd") !== format(expected, "yyyy-MM-dd")) break;
      const r = streakData[i];
      if (r.morning_completed || r.midday_completed || r.evening_completed) count++;
      else break;
    }
    return count;
  })();

  return { ritual, isLoading, upsertRitual, streak };
};
