import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  reminder_type: string;
  category: string;
  time_of_day: string;
  days_of_week: number[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

type ReminderInsert = Omit<Reminder, "id" | "created_at" | "updated_at">;
type ReminderUpdate = Partial<Omit<Reminder, "id" | "user_id" | "created_at" | "updated_at">>;

export function useReminders() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const key = ["reminders", user?.id];

  const { data: reminders = [], isLoading } = useQuery({
    queryKey: key,
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reminders" as any)
        .select("*")
        .eq("user_id", user!.id)
        .order("time_of_day", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Reminder[];
    },
  });

  const addReminder = useMutation({
    mutationFn: async (input: Omit<ReminderInsert, "user_id">) => {
      const { error } = await supabase
        .from("reminders" as any)
        .insert({ ...input, user_id: user!.id } as any);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const updateReminder = useMutation({
    mutationFn: async ({ id, ...updates }: ReminderUpdate & { id: string }) => {
      const { error } = await supabase
        .from("reminders" as any)
        .update({ ...updates, updated_at: new Date().toISOString() } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const deleteReminder = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("reminders" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return { reminders, isLoading, addReminder, updateReminder, deleteReminder };
}
