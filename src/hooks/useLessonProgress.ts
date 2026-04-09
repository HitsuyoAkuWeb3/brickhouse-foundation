import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const useLessonProgress = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: completedLessons = [], isLoading } = useQuery({
    queryKey: ["lesson-progress", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
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
        const nextUnlock = new Date();
        nextUnlock.setDate(nextUnlock.getDate() + 7);
        const { error } = await (supabase as any)
          .from("user_lesson_progress")
          .upsert({
            user_id: user!.id,
            lesson_id: lessonId,
            status: "completed",
            completed_at: new Date().toISOString(),
            next_unlock_date: nextUnlock.toISOString(),
          }, { onConflict: "user_id,lesson_id" });
        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from("user_lesson_progress")
          .delete()
          .eq("user_id", user!.id)
          .eq("lesson_id", lessonId);
        if (error) throw error;
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lesson-progress", user?.id] });
      if (variables.completed) {
        toast.success("Lesson saved");
      }
    },
    onError: (err: any) => {
      console.error("Error saving lesson progress:", err);
      toast.error("We couldn't save your lesson progress");
    },
  });

  const isLessonCompleted = (lessonId: string) =>
    completedLessons.some((l) => l.lesson_id === lessonId);

  const getCompletedAt = (lessonId: string) => {
    const lesson = completedLessons.find((l) => l.lesson_id === lessonId);
    return lesson?.completed_at ? new Date(lesson.completed_at) : null;
  };

  const getBrickProgress = (brickId: number, totalLessons: number) => {
    const prefix = `${brickId}-`;
    const completed = completedLessons.filter((l: any) => l.lesson_id?.startsWith(prefix)).length;
    return { completed, total: totalLessons, percent: totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0 };
  };

  // ─── Lesson Drip Logic (§5.2 #16) ──────────────────────────────────────────
  // next_unlock_date = completed_at + 7 days. Lessons after the current one
  // are locked until that date passes.

  const getNextUnlockDate = (lessonId: string): Date | null => {
    const lesson = completedLessons.find((l) => l.lesson_id === lessonId);
    if (!lesson?.completed_at) return null;
    const unlock = new Date(lesson.completed_at);
    unlock.setDate(unlock.getDate() + 7);
    return unlock;
  };

  const isLessonLocked = (brickId: number, lessonIndex: number): boolean => {
    if (lessonIndex === 0) return false; // First lesson always unlocked
    // Previous lesson must be completed AND next_unlock_date must have passed
    const prevLessonId = `${brickId}-${lessonIndex - 1}`;
    if (!isLessonCompleted(prevLessonId)) return true;
    const unlockDate = getNextUnlockDate(prevLessonId);
    if (!unlockDate) return true;
    return new Date() < unlockDate;
  };

  const getUnlockCountdown = (brickId: number, lessonIndex: number): string | null => {
    if (lessonIndex === 0) return null;
    const prevLessonId = `${brickId}-${lessonIndex - 1}`;
    if (!isLessonCompleted(prevLessonId)) return "Complete previous lesson first";
    const unlockDate = getNextUnlockDate(prevLessonId);
    if (!unlockDate || new Date() >= unlockDate) return null;
    const daysLeft = Math.ceil((unlockDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return `Unlocks in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`;
  };

  return { completedLessons, isLoading, toggleLesson, isLessonCompleted, getCompletedAt, getBrickProgress, isLessonLocked, getUnlockCountdown };
};
