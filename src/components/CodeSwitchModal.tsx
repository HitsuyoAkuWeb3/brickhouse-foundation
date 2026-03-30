import { motion } from "framer-motion";
import { X } from "lucide-react";

export type PassionPickRow = {
  id: string;
  user_id: string;
  image_url: string | null;
  song_url: string | null;
  song_title: string | null;
  title: string | null;
  affirmation_text: string | null;
  created_at: string;
  updated_at: string;
};

export const CodeSwitchModal = ({ pick, onClose }: { pick: PassionPickRow, onClose: () => void }) => {
  // If it's a spotify link, replace /track/ with /embed/track/
  const embedUrl = pick.song_url?.includes("spotify.com/track") 
    ? pick.song_url.replace("spotify.com/track", "spotify.com/embed/track") 
    : null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-background/95 backdrop-blur-md overflow-y-auto"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1, transition: { duration: 0.3 } }}
      exit={{ opacity: 0, scale: 1.05, transition: { duration: 0.2 } }}
    >
      {pick.image_url && (
        <div className="absolute inset-0 -z-10">
          <img src={pick.image_url} className="w-full h-full object-cover opacity-20 blur-xl" alt="Vision" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>
      )}
      
      <button 
        onClick={onClose} 
        className="absolute top-6 right-6 w-12 h-12 bg-foreground/10 hover:bg-foreground/20 text-foreground backdrop-blur rounded-full flex items-center justify-center border border-border transition-colors z-20"
      >
        <X className="w-6 h-6" />
      </button>

      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-full max-w-sm space-y-8 relative z-10 py-10"
      >
        {pick.image_url && (
          <img 
            src={pick.image_url} 
            className="w-56 h-56 mx-auto rounded-3xl object-cover border-4 border-primary shadow-[0_0_50px_hsl(var(--primary)/0.4)]" 
            alt="My Anchor"
          />
        )}
        
        {pick.affirmation_text && (
          <div className="text-center px-4">
            <h2 className="font-display text-sm tracking-[4px] uppercase text-accent mb-4">Power Affirmation</h2>
            <p className="font-body text-xl italic text-foreground leading-relaxed">"{pick.affirmation_text}"</p>
          </div>
        )}

        {pick.title && (
          <div className="text-center bg-gradient-to-b from-foreground/5 to-transparent p-5 rounded-2xl border border-border/50">
            <h3 className="font-display text-xs tracking-widest text-muted-foreground uppercase">Anchor Goal</h3>
            <p className="font-body font-bold mt-2 text-primary">{pick.title}</p>
          </div>
        )}

        {embedUrl ? (
          <iframe 
            src={embedUrl} 
            width="100%" 
            height="152" 
            frameBorder="0" 
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
            className="rounded-2xl mt-6 shadow-xl"
            loading="lazy"
          ></iframe>
        ) : pick.song_url ? (
           <a 
             href={pick.song_url} 
             target="_blank" 
             rel="noreferrer"
             className="block text-center w-full bg-accent text-accent-foreground font-body font-extrabold py-5 rounded-2xl mt-6 uppercase tracking-[3px] shadow-[0_0_20px_hsl(var(--accent)/0.3)] hover:opacity-90 hover:scale-[1.02] transition-all"
           >
             Play Theme Song 🎵
           </a>
        ) : null}
      </motion.div>
    </motion.div>
  );
};
