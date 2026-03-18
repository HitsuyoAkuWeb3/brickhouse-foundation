import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useLessonProgress = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: completedLessons = [], isLoading } = useQuery({
    queryKey: ["lesson-progress", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lesson_progress")
        .select("lesson_id, brick_id, completed_at")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
  });

  const toggleLesson = useMutation({
    mutationFn: async ({
      lessonId,
      brickId,
      completed,
    }: {
      lessonId: string;
      brickId: number;
      completed: boolean;
    }) => {
      if (completed) {
        const { error } = await supabase
          .from("lesson_progress")
          .insert({ user_id: user!.id, brick_id: brickId, lesson_id: lessonId });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("lesson_progress")
          .delete()
          .eq("user_id", user!.id)
          .eq("lesson_id", lessonId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lesson-progress", user?.id] });
    },
  });

  const isLessonCompleted = (lessonId: string) =>
    completedLessons.some((l) => l.lesson_id === lessonId);

  const getBrickProgress = (brickId: number, totalLessons: number) => {
    const completed = completedLessons.filter((l) => l.brick_id === brickId).length;
    return { completed, total: totalLessons, percent: totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0 };
  };

  return { completedLessons, isLoading, toggleLesson, isLessonCompleted, getBrickProgress };
};
