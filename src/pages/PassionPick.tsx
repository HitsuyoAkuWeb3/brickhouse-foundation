import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { usePassionPick } from "@/hooks/usePassionPick";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, Music, Target, Sparkles, RotateCcw, Upload } from "lucide-react";
import { toast } from "sonner";

const PassionPick = () => {
  const { pick, isLoading, upsert, uploadPhoto } = usePassionPick();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [songUrl, setSongUrl] = useState("");
  const [songTitle, setSongTitle] = useState("");
  const [goalText, setGoalText] = useState("");
  const [affirmation, setAffirmation] = useState("");
  const [resetActive, setResetActive] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadPhoto(file);
      await upsert.mutateAsync({ photo_url: url });
      toast.success("Vision photo uploaded 📸");
    } catch (err) {
      toast.error("Upload failed — try again");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveSong = () => {
    if (!songTitle.trim() && !songUrl.trim()) return;
    upsert.mutate({ song_url: songUrl.trim() || null, song_title: songTitle.trim() || null });
    toast.success("Theme song saved 🎵");
  };

  const handleSaveGoal = () => {
    if (!goalText.trim()) return;
    upsert.mutate({ goal_text: goalText.trim() });
    toast.success("Goal locked in 🎯");
  };

  const handleSaveAffirmation = () => {
    if (!affirmation.trim()) return;
    upsert.mutate({ affirmation: affirmation.trim() });
    toast.success("Power affirmation set 💎");
  };

  const handleVibrationReset = () => {
    setResetActive(true);
    // Haptic feedback if supported
    if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
    setTimeout(() => setResetActive(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="font-display text-sm text-muted-foreground tracking-wider animate-pulse">Loading your Passion Pick...</div>
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
            <h1 className="font-display text-3xl tracking-wider">Passion Pick</h1>
            <p className="font-body text-sm text-muted-foreground">Your visual anchor. One tap to reset your vibration.</p>
          </div>
        </div>

        {/* One-Tap Vibration Reset */}
        <motion.button
          onClick={handleVibrationReset}
          className={`w-full relative overflow-hidden rounded-2xl p-6 mb-8 border transition-all ${
            resetActive
              ? "border-primary/50 shadow-[0_0_40px_hsl(var(--primary)/0.3)]"
              : "border-border hover:border-primary/30"
          }`}
          whileTap={{ scale: 0.97 }}
        >
          {/* Background photo */}
          {pick?.photo_url ? (
            <div className="absolute inset-0">
              <img src={pick.photo_url} alt="" className="w-full h-full object-cover opacity-30" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-card" />
          )}

          <div className="relative z-10 text-center">
            <motion.div
              animate={resetActive ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] } : {}}
              transition={{ duration: 0.6 }}
            >
              <RotateCcw className={`w-10 h-10 mx-auto mb-3 ${resetActive ? "text-primary" : "text-accent"}`} />
            </motion.div>

            <div className="font-display text-lg tracking-wider mb-1">
              {resetActive ? "Vibration Reset ✨" : "Tap to Reset Your Vibration"}
            </div>

            {pick?.affirmation && (
              <p className="font-body text-sm text-primary/80 italic mt-2">"{pick.affirmation}"</p>
            )}

            {pick?.song_title && (
              <p className="font-body text-[10px] text-muted-foreground mt-2 uppercase tracking-wider">
                🎵 {pick.song_title}
              </p>
            )}

            {pick?.goal_text && (
              <p className="font-body text-xs text-accent/80 mt-1">
                🎯 {pick.goal_text}
              </p>
            )}
          </div>
        </motion.button>

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

          {pick?.photo_url ? (
            <div className="relative rounded-xl overflow-hidden mb-3">
              <img src={pick.photo_url} alt="Passion pick" className="w-full h-48 object-cover" />
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm text-foreground font-body text-[10px] px-3 py-1.5 rounded-lg border border-border hover:border-primary/30 transition-colors"
              >
                <Upload className="w-3 h-3 inline mr-1" /> Change
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full h-40 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary/30 transition-colors disabled:opacity-50"
            >
              <Camera className="w-8 h-8 text-muted-foreground" />
              <span className="font-body text-xs text-muted-foreground">
                {uploading ? "Uploading..." : "Upload your vision photo"}
              </span>
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
        </div>

        {/* Theme Song */}
        <div className="bg-gradient-card border border-border rounded-xl p-5 mb-3">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
              <Music className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-display text-sm tracking-wider">Theme Song</h3>
              <p className="font-body text-[10px] text-muted-foreground">The song that shifts your energy instantly</p>
            </div>
          </div>

          {pick?.song_title ? (
            <div className="flex items-center justify-between bg-foreground/[0.04] rounded-lg p-3">
              <span className="font-body text-sm">🎵 {pick.song_title}</span>
              <button
                onClick={() => { setSongTitle(""); setSongUrl(""); upsert.mutate({ song_title: null, song_url: null }); }}
                className="font-body text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Song name (e.g. Run the World — Beyoncé)"
                value={songTitle}
                onChange={(e) => setSongTitle(e.target.value)}
                maxLength={150}
                className="w-full bg-input border border-border rounded-lg px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
              <input
                type="url"
                placeholder="Spotify/YouTube link (optional)"
                value={songUrl}
                onChange={(e) => setSongUrl(e.target.value)}
                maxLength={500}
                className="w-full bg-input border border-border rounded-lg px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
              <button
                onClick={handleSaveSong}
                disabled={!songTitle.trim()}
                className="w-full bg-gradient-pink text-foreground font-body font-bold text-sm tracking-wider uppercase py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Save Song
              </button>
            </div>
          )}
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

          {pick?.goal_text ? (
            <div className="flex items-center justify-between bg-foreground/[0.04] rounded-lg p-3">
              <span className="font-body text-sm">🎯 {pick.goal_text}</span>
              <button
                onClick={() => upsert.mutate({ goal_text: null })}
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

          {pick?.affirmation ? (
            <div className="flex items-center justify-between bg-foreground/[0.04] rounded-lg p-3">
              <span className="font-body text-sm italic">"{pick.affirmation}"</span>
              <button
                onClick={() => upsert.mutate({ affirmation: null })}
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
  );
};

export default PassionPick;
