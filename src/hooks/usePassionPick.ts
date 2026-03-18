import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface PassionPick {
  id: string;
  user_id: string;
  photo_url: string | null;
  song_url: string | null;
  song_title: string | null;
  goal_text: string | null;
  affirmation: string | null;
  created_at: string;
  updated_at: string;
}

export const usePassionPick = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: pick, isLoading } = useQuery({
    queryKey: ["passion-pick", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("passion_picks")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as PassionPick | null;
    },
  });

  const upsert = useMutation({
    mutationFn: async (updates: Partial<Omit<PassionPick, "id" | "user_id" | "created_at" | "updated_at">>) => {
      if (pick) {
        const { error } = await supabase
          .from("passion_picks")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("id", pick.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("passion_picks")
          .insert({ user_id: user!.id, ...updates });
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["passion-pick", user?.id] }),
  });

  const uploadPhoto = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop();
    const path = `${user!.id}/passion-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("passion-picks").upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("passion-picks").getPublicUrl(path);
    return data.publicUrl;
  };

  return { pick, isLoading, upsert, uploadPhoto };
};
