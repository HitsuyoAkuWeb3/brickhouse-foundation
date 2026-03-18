import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAffirmations } from "@/hooks/useAffirmations";
import { bricks } from "@/data/bricksContent";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Plus, Trash2, Sparkles, ChevronDown, ArrowLeft, Wand2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const Affirmations = () => {
  const { user } = useAuth();
  const [selectedBrick, setSelectedBrick] = useState<number | undefined>(undefined);
  const [newAffirmation, setNewAffirmation] = useState("");
  const [showBuilder, setShowBuilder] = useState(false);
  const [expandedBrick, setExpandedBrick] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);
  const [aiResults, setAiResults] = useState<string[]>([]);

  const { brickAffirmations, userAffirmations, dailyAffirmation, addAffirmation, toggleFavorite, deleteAffirmation, isLoading } = useAffirmations(selectedBrick);

  const handleAdd = () => {
    const text = newAffirmation.trim();
    if (!text) return;
    if (!text.toLowerCase().startsWith("i am") && !text.toLowerCase().startsWith("i ")) {
      toast.error("Start your affirmation with 'I am' or 'I'");
      return;
    }
    addAffirmation.mutate({ affirmation: text, brickId: selectedBrick });
    setNewAffirmation("");
    toast.success("Affirmation added 💎");
  };

  const handleGenerate = async () => {
    if (!user) return;
    setGenerating(true);
    setAiResults([]);
    try {
      // Fetch profile for context
      const { data: profile } = await supabase
        .from("profiles")
        .select("transformation_choice, goals, name")
        .eq("id", user.id)
        .single();

      const { data, error } = await supabase.functions.invoke("generate-affirmations", {
        body: {
          transformation_choice: profile?.transformation_choice,
          goals: profile?.goals,
          name: profile?.name,
        },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }

      setAiResults(data.affirmations || []);
      toast.success("Your personalized affirmations are ready ✨");
    } catch (e) {
      console.error(e);
      toast.error("Couldn't generate affirmations right now");
    } finally {
      setGenerating(false);
    }
  };

  const saveAiAffirmation = (text: string) => {
    addAffirmation.mutate({ affirmation: text });
    setAiResults((prev) => prev.filter((a) => a !== text));
    toast.success("Saved to My Affirmations 💎");
  };

  // Group brick affirmations by brick_id
  const groupedByBrick = brickAffirmations.reduce((acc, a) => {
    const key = a.brick_id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(a);
    return acc;
  }, {} as Record<number, typeof brickAffirmations>);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="font-display text-sm text-muted-foreground tracking-wider animate-pulse">Loading affirmations...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-5 py-10 pb-24">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-display text-3xl tracking-wider">Affirmations</h1>
            <p className="font-body text-sm text-muted-foreground">Speak your truth into existence</p>
          </div>
        </div>

        {/* Daily Featured */}
        {dailyAffirmation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden bg-gradient-card border border-primary/20 rounded-2xl p-6 mb-8"
          >
            <div className="absolute top-3 right-3">
              <Sparkles className="w-5 h-5 text-accent/60" />
            </div>
            <div className="font-body text-[10px] text-accent uppercase tracking-widest mb-3">
              Today's Affirmation
            </div>
            <p className="font-display text-xl leading-relaxed tracking-wide">
              "{dailyAffirmation.affirmation}"
            </p>
            <div className="mt-3 text-[10px] text-muted-foreground uppercase tracking-wider">
              {bricks.find((b) => b.id === dailyAffirmation.brick_id)?.name}
            </div>
          </motion.div>
        )}

        {/* AI Generator */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full flex items-center justify-center gap-3 bg-gradient-pink border border-primary/30 rounded-xl px-5 py-4 hover:shadow-[0_0_25px_hsl(var(--primary)/0.3)] transition-all disabled:opacity-60"
          >
            {generating ? (
              <Loader2 className="w-5 h-5 animate-spin text-foreground" />
            ) : (
              <Wand2 className="w-5 h-5 text-foreground" />
            )}
            <span className="font-display text-sm tracking-wider">
              {generating ? "Channeling your energy..." : "Generate My Affirmations"}
            </span>
          </button>
          <p className="text-center font-body text-[10px] text-muted-foreground mt-2">
            AI-crafted based on your goals & transformation path
          </p>

          {/* AI Results */}
          <AnimatePresence>
            {aiResults.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 space-y-2">
                  {aiResults.map((text, i) => (
                    <motion.div
                      key={text}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-3 bg-gradient-card border border-accent/20 rounded-xl px-4 py-3"
                    >
                      <Sparkles className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                      <p className="flex-1 font-body text-sm leading-relaxed">"{text}"</p>
                      <button
                        onClick={() => saveAiAffirmation(text)}
                        className="shrink-0 px-3 py-1 bg-primary/20 hover:bg-primary/30 rounded-lg font-body text-[10px] text-primary uppercase tracking-wider transition-colors"
                      >
                        Save
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* I AM Builder */}
        <div className="mb-8">
          <button
            onClick={() => setShowBuilder(!showBuilder)}
            className="w-full flex items-center justify-between bg-gradient-card border border-border rounded-xl px-5 py-4 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Plus className="w-5 h-5 text-primary" />
              <span className="font-display text-sm tracking-wider">I AM Builder</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showBuilder ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {showBuilder && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-3 space-y-3">
                  <input
                    type="text"
                    value={newAffirmation}
                    onChange={(e) => setNewAffirmation(e.target.value)}
                    placeholder="I am..."
                    maxLength={200}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    className="w-full bg-input border border-border rounded-lg px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                  <button
                    onClick={handleAdd}
                    disabled={addAffirmation.isPending || !newAffirmation.trim()}
                    className="w-full bg-gradient-pink text-foreground font-body font-bold text-sm tracking-wider uppercase py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {addAffirmation.isPending ? "..." : "Add Affirmation"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* My Affirmations */}
        {userAffirmations.length > 0 && (
          <div className="mb-8">
            <h2 className="font-display text-lg tracking-wider mb-4">My Affirmations</h2>
            <div className="space-y-2">
              {userAffirmations.map((a) => (
                <motion.div
                  key={a.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-3 bg-gradient-card border border-border rounded-xl px-4 py-3 group"
                >
                  <p className="flex-1 font-body text-sm leading-relaxed">"{a.affirmation}"</p>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleFavorite.mutate({ id: a.id, is_favorite: !a.is_favorite })}
                      className="p-1.5 rounded-lg hover:bg-muted/40 transition-colors"
                    >
                      <Heart className={`w-4 h-4 ${a.is_favorite ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                    </button>
                    <button
                      onClick={() => {
                        deleteAffirmation.mutate(a.id);
                        toast.success("Removed");
                      }}
                      className="p-1.5 rounded-lg hover:bg-destructive/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Browse by Brick */}
        <h2 className="font-display text-lg tracking-wider mb-4">Browse by Brick</h2>
        <div className="space-y-2">
          {bricks.map((brick) => {
            const affirmations = groupedByBrick[brick.id] || [];
            if (!affirmations.length) return null;
            const isOpen = expandedBrick === brick.id;

            return (
              <div key={brick.id} className="border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedBrick(isOpen ? null : brick.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors"
                >
                  <span className="text-lg">{brick.icon}</span>
                  <span className="flex-1 text-left font-display text-sm tracking-wider">{brick.name}</span>
                  <span className="text-[10px] text-muted-foreground">{affirmations.length}</span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-2">
                        {affirmations.map((a) => (
                          <div key={a.id} className="font-body text-sm text-muted-foreground leading-relaxed pl-8">
                            💎 "{a.affirmation}"
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Affirmations;
