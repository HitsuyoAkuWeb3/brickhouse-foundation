import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { usePassionPick } from "@/hooks/usePassionPick";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Camera, Music, Target, Sparkles, RotateCcw, Upload } from "lucide-react";
import { toast } from "sonner";
import { CodeSwitchModal } from "@/components/CodeSwitchModal";
import { cn } from "@/lib/utils";

const PassionPick = () => {
  const { pick, isLoading, upsert, uploadMedia } = usePassionPick();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [songUrl, setSongUrl] = useState("");
  const [songTitle, setSongTitle] = useState("");
  const [goalText, setGoalText] = useState("");
  const [affirmation, setAffirmation] = useState("");
  const [resetActive, setResetActive] = useState(false);

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Media must be under 50MB");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadMedia(file);
      await upsert.mutateAsync({ 
        id: pick?.id, 
        updates: { image_url: url },
        insertAppend: { title: "Untitled Passion" }
      });
      toast.success("Vision media uploaded 📸");
    } catch (err) {
      console.error("Upload error details:", err);
      const errorMessage = err instanceof Error ? err.message : "Upload failed — try again";
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const isVideo = pick?.image_url?.match(/\.(mp4|mov|webm)$/i);

  const handleSaveSong = () => {
    if (!songTitle.trim() && !songUrl.trim()) return;
    upsert.mutate({ 
      id: pick?.id, 
      updates: { song_url: songUrl.trim() || null, song_title: songTitle.trim() || null },
      insertAppend: { title: "Untitled Passion" }
    });
    toast.success("Theme song saved 🎵");
  };

  const handleSaveGoal = () => {
    if (!goalText.trim()) return;
    upsert.mutate({ id: pick?.id, updates: { title: goalText.trim() } });
    toast.success("Goal locked in 🎯");
  };

  const handleSaveAffirmation = () => {
    if (!affirmation.trim()) return;
    upsert.mutate({ 
      id: pick?.id, 
      updates: { affirmation_text: affirmation.trim() },
      insertAppend: { title: "Untitled Passion" }
    });
    toast.success("Power affirmation set 💎");
  };

  const handleVibrationReset = () => {
    setResetActive(true);
    // Haptic feedback if supported
    if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="font-display text-sm text-muted-foreground tracking-wider animate-pulse">Loading your Passion Pick...</div>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {resetActive && pick && (
          <CodeSwitchModal pick={pick} onClose={() => setResetActive(false)} />
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-background px-5 py-10 pb-24">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-display text-3xl tracking-wider">Passion Pick</h1>
              <p className="font-body text-sm text-muted-foreground">Your visual anchor. One tap to reset your vibration.</p>
            </div>
          </div>

          {/* One-Tap Vibration Reset */}
          <motion.button
            onClick={handleVibrationReset}
            className={`w-full relative overflow-hidden rounded-3xl p-8 mb-10 border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent shadow-[0_0_30px_hsl(var(--primary)/0.15)] hover:border-primary/50 hover:shadow-[0_0_40px_hsl(var(--primary)/0.3)] transition-all`}
            whileTap={{ scale: 0.97 }}
          >
            {/* Background media */}
            {pick?.image_url ? (
              <div className="absolute inset-0">
                {isVideo ? (
                  <video src={pick.image_url} className="w-full h-full object-cover opacity-20 blur-[2px]" autoPlay muted loop playsInline />
                ) : (
                  <img src={pick.image_url} alt="" className="w-full h-full object-cover opacity-20 blur-[2px]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/60 to-background/40" />
              </div>
            ) : (
              <div className="absolute inset-0 bg-gradient-card" />
            )}

            <div className="relative z-10 text-center flex flex-col items-center justify-center h-full">
              <RotateCcw className="w-12 h-12 mx-auto mb-4 text-primary animate-[pulse_3s_ease-in-out_infinite]" />

              <div className="font-display text-2xl tracking-widest uppercase text-foreground mb-2">
                Code Switch
              </div>
              <p className="font-body text-xs text-muted-foreground tracking-widest uppercase">
                Initialize Instant Reset
              </p>
            </div>
          </motion.button>

          {/* Configuration Sections Start Here Output unmodified */}
          
          {/* Vision Photo */}
          <div className="bg-gradient-card border border-border rounded-xl p-5 mb-3">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                <Camera className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-sm tracking-wider">Vision Photo</h3>
                <p className="font-body text-[10px] text-muted-foreground">The image that anchors your why</p>
              </div>
            </div>

            {pick?.image_url ? (
              <div className="relative rounded-xl overflow-hidden mb-3 group">
                {isVideo ? (
                  <video src={pick.image_url} className="w-full h-48 object-cover" autoPlay muted loop playsInline />
                ) : (
                  <img src={pick.image_url} alt="Passion pick" className="w-full h-48 object-cover" />
                )}
                <label className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm text-foreground font-body text-[10px] px-3 py-1.5 rounded-lg border border-border hover:border-primary/30 transition-colors cursor-pointer inline-block overflow-hidden">
                  <Upload className="w-3 h-3 inline mr-1 relative z-10 pointer-events-none" /> 
                  <span className="relative z-10 pointer-events-none">Change</span>
                  <input type="file" accept="image/*,video/*" className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-20" onChange={handleMediaUpload} disabled={uploading} />
                </label>
              </div>
            ) : (
              <label
                className={cn(
                  "w-full h-40 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary/30 transition-colors cursor-pointer",
                  uploading ? "opacity-50 pointer-events-none" : ""
                )}
              >
                <Camera className="w-8 h-8 text-muted-foreground" />
                <span className="font-body text-xs text-muted-foreground relative z-10 pointer-events-none">
                  {uploading ? "Uploading..." : "Upload your vision photo or video"}
                </span>
                <input type="file" accept="image/*,video/*" className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-20" onChange={handleMediaUpload} disabled={uploading} />
              </label>
            )}
          </div>

          {/* Theme Song (Coming Soon per Phase 1 spec) */}
          <div className="bg-gradient-card border border-border/50 rounded-xl p-5 mb-3 opacity-60 grayscale pointer-events-none relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-muted text-muted-foreground text-[10px] font-display uppercase tracking-widest px-2 py-1 rounded-full">
              Coming Soon
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
                <Music className="w-5 h-5 text-accent opacity-50" />
              </div>
              <div>
                <h3 className="font-display text-sm tracking-wider">Theme Song</h3>
                <p className="font-body text-[10px] text-muted-foreground">The song that shifts your energy instantly</p>
              </div>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="Song name (e.g. Run the World — Beyoncé)"
                disabled
                className="w-full bg-input/50 border border-border/50 rounded-lg px-4 py-3 font-body text-sm text-muted-foreground placeholder:text-muted-foreground/50 focus:outline-none"
              />
              <input
                type="url"
                placeholder="Spotify/YouTube link (optional)"
                disabled
                className="w-full bg-input/50 border border-border/50 rounded-lg px-4 py-3 font-body text-sm text-muted-foreground placeholder:text-muted-foreground/50 focus:outline-none"
              />
              <button
                disabled
                className="w-full bg-gradient-pink text-foreground font-body font-bold text-sm tracking-wider uppercase py-3 rounded-lg opacity-30 cursor-not-allowed"
              >
                Save Song
              </button>
            </div>
          </div>

          {/* Goal */}
          <div className="bg-gradient-card border border-border rounded-xl p-5 mb-3">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-sm tracking-wider">Anchor Goal</h3>
                <p className="font-body text-[10px] text-muted-foreground">The one goal that drives everything else</p>
              </div>
            </div>

            {pick?.title ? (
              <div className="flex items-center justify-between bg-foreground/[0.04] rounded-lg p-3">
                <span className="font-body text-sm">🎯 {pick.title}</span>
                <button
                  onClick={() => upsert.mutate({ id: pick?.id, updates: { title: null } })}
                  className="font-body text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="e.g. Launch my brand by September"
                  value={goalText}
                  onChange={(e) => setGoalText(e.target.value)}
                  maxLength={200}
                  className="w-full bg-input border border-border rounded-lg px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  onClick={handleSaveGoal}
                  disabled={!goalText.trim()}
                  className="w-full bg-gradient-pink text-foreground font-body font-bold text-sm tracking-wider uppercase py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  Lock It In
                </button>
              </div>
            )}
          </div>

          {/* Power Affirmation */}
          <div className="bg-gradient-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-secondary/15 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h3 className="font-display text-sm tracking-wider">Power Affirmation</h3>
                <p className="font-body text-[10px] text-muted-foreground">The declaration that plays when you reset</p>
              </div>
            </div>

            {pick?.affirmation_text ? (
              <div className="flex items-center justify-between bg-foreground/[0.04] rounded-lg p-3">
                <span className="font-body text-sm italic">"{pick.affirmation_text}"</span>
                <button
                  onClick={() => upsert.mutate({ id: pick?.id, updates: { affirmation_text: null } })}
                  className="font-body text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="e.g. I am unstoppable and divinely guided"
                  value={affirmation}
                  onChange={(e) => setAffirmation(e.target.value)}
                  maxLength={200}
                  className="w-full bg-input border border-border rounded-lg px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  onClick={handleSaveAffirmation}
                  disabled={!affirmation.trim()}
                  className="w-full bg-gradient-pink text-foreground font-body font-bold text-sm tracking-wider uppercase py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  Set Affirmation
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PassionPick;
