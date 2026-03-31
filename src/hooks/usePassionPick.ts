import { useQuery } from "@tanstack/react-query";
import { useCrudField } from "@/hooks/useCrudField";
import { supabase } from "@/integrations/supabase/client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAuth } from "@/hooks/useAuth";

export interface PassionPick {
  id: string;
  user_id: string;
  image_url: string | null;
  song_url: string | null;
  song_title: string | null;
  title: string | null;
  affirmation_text: string | null;
  created_at: string;
  updated_at: string;
}

export const usePassionPick = () => {
  const { user } = useAuth();

  const { data: pick, isLoading } = useQuery({
    queryKey: ["passion-pick", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
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

  const upsert = useCrudField<Partial<PassionPick>>({
    tableName: "passion_picks",
    queryKey: ["passion-pick", user?.id],
  });

  const uploadMedia = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop();
    const path = `${user!.id}/passion-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("passion-picks").upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from("passion-picks").getPublicUrl(path);
    return data.publicUrl;
  };

  return { pick, isLoading, upsert, uploadMedia };
};
