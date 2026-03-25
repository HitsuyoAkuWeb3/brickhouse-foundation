import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { getBrickBySlug } from "@/data/bricksContent";
import { useLessonProgress } from "@/hooks/useLessonProgress";
import { cn } from "@/lib/utils";

const LessonPlayer = () => {
  const { slug, lessonId } = useParams<{ slug: string; lessonId: string }>();
  const navigate = useNavigate();
  const brick = slug ? getBrickBySlug(slug) : undefined;
  const lesson = brick?.lessons.find((l) => l.id === lessonId);
  const { isLessonCompleted, toggleLesson } = useLessonProgress();

  if (!brick || !lesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="font-display text-2xl mb-4">Lesson not found</p>
          <button onClick={() => navigate("/bricks")} className="text-accent hover:underline font-body text-sm">
            ← Back to My Bricks
          </button>
        </div>
      </div>
    );
  }

  const completed = isLessonCompleted(lesson.id);

  const handleComplete = () => {
    if (!completed) {
      toggleLesson.mutate({
        lessonId: lesson.id,
        brickId: brick.id,
        completed: true,
      });
    }
    // Navigate back to the brick detail page after a short delay
    setTimeout(() => {
      navigate(`/bricks/${brick.slug}`);
    }, 600);
  };

  const isReflection = lesson.promptType?.toLowerCase() === "reflection";
  const promptAccent = isReflection ? "border-primary bg-primary/10 text-primary" : "border-secondary bg-secondary/10 text-secondary";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-6 py-10 overflow-x-hidden">
      <div className="w-full max-w-2xl relative z-10">
        
        {/* Header / Nav */}
        <div className="flex items-center justify-between mb-10">
          <Link
            to={`/bricks/${brick.slug}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <div className="font-display text-[10px] tracking-[3px] text-muted-foreground uppercase text-right">
            Brick {String(brick.id).padStart(2, "0")} • {brick.name}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full"
        >
          {/* Lesson Number & Title */}
          <div className="font-body text-xs text-accent uppercase tracking-widest mb-3">
            Lesson {lesson.number || lesson.id}
          </div>
          <h1 className="font-display text-4xl sm:text-5xl tracking-wider leading-tight mb-8">
            {lesson.title}
          </h1>

          {/* Pull Quote */}
          {lesson.pullQuote && (
            <div className="pl-6 border-l-2 border-primary my-8 py-2">
              <p className="font-display text-xl sm:text-2xl text-foreground/90 italic leading-relaxed">
                "{lesson.pullQuote}"
              </p>
            </div>
          )}

          {/* Main Body */}
          {lesson.body && (
            <div className="font-body text-base text-foreground/80 leading-loose space-y-6 mb-12">
              {lesson.body.split('\n\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          )}

          {/* Prompt Box */}
          {lesson.promptBox && (
            <div className={cn("rounded-2xl border-2 p-6 sm:p-8 mb-16", promptAccent)}>
              <div className="flex items-center gap-2 mb-4">
                <span className="font-display tracking-widest uppercase text-sm font-bold">
                  {lesson.promptType || "Exercise"}
                </span>
              </div>
              <p className="font-body text-sm sm:text-base leading-relaxed text-foreground">
                {lesson.promptBox}
              </p>
            </div>
          )}

          {/* Completion Footer */}
          <div className="flex flex-col items-center pt-8 border-t border-border/50 pb-16">
            <button
              onClick={handleComplete}
              disabled={completed}
              className={cn(
                "w-full sm:w-auto font-body font-bold text-sm tracking-widest uppercase px-10 py-5 rounded-xl transition-all duration-300 flex items-center justify-center gap-3",
                completed 
                  ? "bg-primary/20 text-primary border border-primary/30" 
                  : "bg-gradient-pink text-foreground hover:opacity-90 hover:scale-[1.02] shadow-[0_0_30px_hsl(var(--primary)/0.3)]"
              )}
            >
              {completed ? (
                <>
                  <CheckCircle2 className="w-5 h-5" /> Work Completed
                </>
              ) : (
                "I'VE DONE THE WORK"
              )}
            </button>
            {!completed && (
              <p className="font-body text-xs text-muted-foreground mt-4 max-w-sm text-center">
                Only tap this once you have fully completed the reflection or homework for this lesson.
              </p>
            )}
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default LessonPlayer;
