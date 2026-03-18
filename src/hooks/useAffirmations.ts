import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useAffirmations = (brickId?: number) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Brick affirmations (seeded content)
  const { data: brickAffirmations = [], isLoading: loadingBrick } = useQuery({
    queryKey: ["brick-affirmations", brickId],
    queryFn: async () => {
      let q = supabase.from("brick_affirmations").select("*").order("created_at");
      if (brickId) q = q.eq("brick_id", brickId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  // User custom affirmations
  const { data: userAffirmations = [], isLoading: loadingUser } = useQuery({
    queryKey: ["user-affirmations", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_affirmations")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addAffirmation = useMutation({
    mutationFn: async ({ affirmation, brickId: bId }: { affirmation: string; brickId?: number }) => {
      const { error } = await supabase
        .from("user_affirmations")
        .insert({ user_id: user!.id, affirmation, brick_id: bId ?? null });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user-affirmations", user?.id] }),
  });

  const toggleFavorite = useMutation({
    mutationFn: async ({ id, is_favorite }: { id: string; is_favorite: boolean }) => {
      const { error } = await supabase
        .from("user_affirmations")
        .update({ is_favorite })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user-affirmations", user?.id] }),
  });

  const deleteAffirmation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("user_affirmations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user-affirmations", user?.id] }),
  });

  // Daily featured — deterministic pick based on date
  const dailyAffirmation = (() => {
    if (!brickAffirmations.length) return null;
    const day = new Date();
    const seed = day.getFullYear() * 1000 + day.getMonth() * 31 + day.getDate();
    return brickAffirmations[seed % brickAffirmations.length];
  })();

  return {
    brickAffirmations,
    userAffirmations,
    dailyAffirmation,
    addAffirmation,
    toggleFavorite,
    deleteAffirmation,
    isLoading: loadingBrick || loadingUser,
  };
};
