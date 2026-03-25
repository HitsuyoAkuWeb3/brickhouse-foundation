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
        .from("user_lesson_progress")
        .select("lesson_id, completed_at")
        .eq("user_id", user!.id)
        .eq("status", "completed");
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
          .from("user_lesson_progress")
          .insert({ 
            user_id: user!.id, 
            lesson_id: lessonId, 
            status: "completed", 
            completed_at: new Date().toISOString() 
          });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_lesson_progress")
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

  const getCompletedAt = (lessonId: string) => {
    const lesson = completedLessons.find((l) => l.lesson_id === lessonId);
    return lesson?.completed_at ? new Date(lesson.completed_at) : null;
  };

  const getBrickProgress = (brickId: number, totalLessons: number) => {
    // We assume lesson_id format "brickId-lessonNumber" mapping
    const prefix = `${brickId}-`;
    const completed = completedLessons.filter((l) => l.lesson_id?.startsWith(prefix)).length;
    return { completed, total: totalLessons, percent: totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0 };
  };

  return { completedLessons, isLoading, toggleLesson, isLessonCompleted, getCompletedAt, getBrickProgress };
};
