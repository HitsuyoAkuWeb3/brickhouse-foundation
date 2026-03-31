import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCrudField } from "@/hooks/useCrudField";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { brick1Lessons } from "@/data/brick1Lessons";

interface BrickAffirmation {
  id: string;
  text: string;
  brick_id: string | null;
  category: string | null;
  affirmation_type: string | null;
  astrological_tag: string | null;
  audio_url: string | null;
  tier_required: string | null;
  created_at: string | null;
}

interface UserAffirmation {
  id: string;
  user_id: string;
  affirmation: string;
  brick_id: number | null;
  is_favorite: boolean;
  created_at: string;
}

export const useAffirmations = (brickId?: number) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Brick affirmations (seeded content from "affirmations" table)
  const { data: brickAffirmations = [], isLoading: loadingBrick } = useQuery<BrickAffirmation[]>({
    queryKey: ["brick-affirmations", brickId],
    queryFn: async () => {
      // @ts-expect-error missing DB types for affirmations table
      let q = supabase.from("affirmations").select("*").order("created_at");
      
      if (brickId) {
        // Since brick_id might be a UUID, we filter by category matching Brick0X
        const prefix = brickId < 10 ? `Brick0${brickId}` : `Brick${brickId}`;
        q = q.ilike("category", `${prefix}%`);
      }
      
      const { data, error } = await q;
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return [];
      }
      
      // Transform audio_urls to relative paths so AudioPlayer can fetch signed urls
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return data.map((a: any) => {
        let transformedUrl = a.audio_url;
        if (transformedUrl && transformedUrl.startsWith('/audio/affirmations/')) {
          transformedUrl = transformedUrl.replace('/audio/affirmations/', '');
        }
        return {
          ...a,
          audio_url: transformedUrl
        };
      }) as BrickAffirmation[];
    },
  });

  // User custom affirmations — table may not exist in generated types yet
  const { data: userAffirmations = [], isLoading: loadingUser } = useQuery<UserAffirmation[]>({
    queryKey: ["user-affirmations", user?.id],
    enabled: !!user,
    retry: false,
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("user_affirmations")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error && error.code !== '42P01') throw error;
      return (data ?? []) as UserAffirmation[];
    },
  });

  const customAffirmationsCrud = useCrudField<UserAffirmation>({
    tableName: "user_affirmations" as any,
    queryKey: ["user-affirmations", user?.id],
  });

  const addAffirmation = {
    mutate: (payload: { affirmation: string; brickId?: number }) => {
      customAffirmationsCrud.mutate({
        updates: { affirmation: payload.affirmation, brick_id: payload.brickId ?? null, is_favorite: false },
      });
    },
    isPending: customAffirmationsCrud.isPending,
  };

  const toggleFavorite = {
    mutate: (payload: { id: string; is_favorite: boolean }) => {
      customAffirmationsCrud.mutate({
        id: payload.id,
        updates: { is_favorite: payload.is_favorite },
      });
    },
  };

  const deleteAffirmation = {
    mutate: (id: string) => {
      customAffirmationsCrud.mutate({
        id,
        action: 'delete'
      });
    },
  };

  // Daily featured — deterministic pick based on date (Restricted to Brick 1 for Beta)
  const dailyAffirmation = (() => {
    const available = brickAffirmations.filter(a => 
      a.brick_id === "1" || (a.category && a.category.toLowerCase().startsWith("brick01"))
    );
    if (!available.length) return null;
    const day = new Date();
    const seed = day.getFullYear() * 1000 + day.getMonth() * 31 + day.getDate();
    return available[seed % available.length];
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
