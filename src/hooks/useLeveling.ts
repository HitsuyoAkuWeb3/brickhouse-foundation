import { useLessonProgress } from "@/hooks/useLessonProgress";
import { useDailyRitual } from "@/hooks/useDailyRitual";

export const useLeveling = () => {
  const { completedLessons } = useLessonProgress();
  const { streak } = useDailyRitual();

  const score = (completedLessons.length * 10) + (streak * 5);

  let title = "Apprentice";
  if (score > 100) title = "Architect";
  if (score > 500) title = "Sovereign";

  let nextTierScore = 101;
  let progress = Math.min(100, Math.round((score / 101) * 100));

  if (score > 100) {
    nextTierScore = 501;
    progress = Math.min(100, Math.round(((score - 100) / 400) * 100));
  }
  if (score > 500) {
    nextTierScore = score;
    progress = 100;
  }

  return {
    score,
    title,
    nextTierScore,
    progress
  };
};
