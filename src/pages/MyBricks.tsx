import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { bricks } from "@/data/bricksContent";
import { ArrowLeft } from "lucide-react";
import { useLessonProgress } from "@/hooks/useLessonProgress";

const container = {
  animate: {
    transition: { staggerChildren: 0.05 },
  },
};

const tile = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

const MyBricks = () => {
  const { getBrickProgress } = useLessonProgress();

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-display text-3xl sm:text-4xl tracking-wider">
            My <span className="text-accent">Bricks</span>
          </h1>
        </div>
        <p className="font-body text-sm text-muted-foreground mb-8 ml-8">
          12 life areas. 144 lessons. Your complete blueprint.
        </p>

        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 gap-3"
          variants={container}
          initial="initial"
          animate="animate"
        >
          {bricks.map((brick) => {
            const progress = getBrickProgress(brick.id, brick.lessonCount);
            return (
              <motion.div key={brick.id} variants={tile}>
                <Link to={`/bricks/${brick.slug}`} className="block group">
                  <div className="relative bg-gradient-card border border-border rounded-xl p-5 h-full transition-all hover:border-primary/40 hover:shadow-[0_0_20px_hsl(var(--primary)/0.15)] overflow-hidden">
                    <div className="absolute top-2 right-3 font-display text-[40px] leading-none text-foreground/[0.04]">
                      {String(brick.id).padStart(2, "0")}
                    </div>
                    <div className="text-3xl mb-3">{brick.icon}</div>
                    <h3 className="font-display text-sm tracking-wider leading-snug mb-1 group-hover:text-accent transition-colors">
                      {brick.name}
                    </h3>
                    <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider mb-3">
                      {brick.subtitle}
                    </p>
                    <div className="mt-auto">
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1.5">
                        <span>{brick.lessonCount} lessons</span>
                        <span>{progress.percent}%</span>
                      </div>
                      <div className="h-1 bg-foreground/[0.07] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
                          style={{ width: `${progress.percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="text-center mt-8">
          <p className="font-display text-sm tracking-[3px] text-muted-foreground">
            144 LESSONS · THE MASTER BUILDER NUMBER
          </p>
        </div>
      </div>
    </div>
  );
};

export default MyBricks;
