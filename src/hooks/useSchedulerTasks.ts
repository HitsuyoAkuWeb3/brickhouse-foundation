import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface SchedulerTask {
  id: string;
  profile_id: string;
  title: string;
  description?: string;
  reminder_type?: string;     // 'daily', 'weekly', 'one_off'
  category?: string;          // 'build_it', 'feed_it', 'live_it', 'ritual', etc.
  time_of_day?: string;       // e.g., '09:00:00'
  days_of_week?: number[];
  is_active: boolean;
  parent_goal_id?: string;    // If this is a subtask 
  timeframe?: string;         // '1_week', '1_month', '3_months'
  escalation_level?: number;  // 1, 2, 3
  is_completed?: boolean;
  scheduled_for?: string;
  created_at: string;
  updated_at?: string;
}

type TaskInsert = Omit<SchedulerTask, "id" | "created_at" | "updated_at" | "profile_id">;
type TaskUpdate = Partial<Omit<SchedulerTask, "id" | "profile_id" | "created_at" | "updated_at">>;

export function useSchedulerTasks() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const key = ["scheduler_tasks", user?.id];

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: key,
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scheduler_tasks" as any)
        .select("*")
        .eq("profile_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as SchedulerTask[];
    },
  });

  const addTask = useMutation({
    mutationFn: async (input: TaskInsert) => {
      const { data, error } = await supabase
        .from("scheduler_tasks" as any)
        .insert({ ...input, profile_id: user!.id } as any)
        .select()
        .single();
      if (error) throw error;
      return data as SchedulerTask;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, ...updates }: TaskUpdate & { id: string }) => {
      const { error } = await supabase
        .from("scheduler_tasks" as any)
        .update({ ...updates } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("scheduler_tasks" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return { tasks, isLoading, addTask, updateTask, deleteTask };
}
