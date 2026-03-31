import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function AudioPlayer({ src }: { src: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState("0:00");
  const [currentTime, setCurrentTime] = useState("0:00");
  const [actualSrc, setActualSrc] = useState<string | undefined>(undefined);
  const audioRef = useRef<HTMLAudioElement>(null);

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "0:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  useEffect(() => {
    let isMounted = true;
    const resolveSrc = async () => {
      if (!src) return;
      
      // If src is already a full URL, blob, or base64 data, use it directly
      if (src.startsWith('http') || src.startsWith('blob:') || src.startsWith('data:')) {
        if (isMounted) setActualSrc(src);
        return;
      }

      // If it's a relative storage path, generate the public URL instead of a signed URL
      // since the affirmations bucket is marked as public and anon users cannot create signed URLs client-side.
      const { data } = supabase.storage.from('affirmations').getPublicUrl(src);
      if (isMounted) setActualSrc(data.publicUrl);
    };
    resolveSrc();
    return () => { isMounted = false; };
  }, [src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
      setCurrentTime(formatTime(audio.currentTime));
    };

    const handleLoadedMetadata = () => {
      setDuration(formatTime(audio.duration));
    };

    const handlePlayEvent = () => setIsPlaying(true);
    const handlePauseEvent = () => setIsPlaying(false);

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime("0:00");
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("play", handlePlayEvent);
    audio.addEventListener("pause", handlePauseEvent);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("play", handlePlayEvent);
      audio.removeEventListener("pause", handlePauseEvent);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => {
          console.error("Audio playback failed:", err);
        });
      }
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement> | React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      const time = (Number((e.target as HTMLInputElement).value) / 100) * audioRef.current.duration;
      if (!isNaN(time)) {
        audioRef.current.currentTime = time;
        setProgress(Number((e.target as HTMLInputElement).value));
      }
    }
  };

  return (
    <div 
      className="flex flex-col gap-2 mt-3 p-3 bg-card/30 border border-primary/10 rounded-xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-4">
        <audio ref={audioRef} src={actualSrc} preload="metadata" crossOrigin="anonymous" />
        
        <button 
          onClick={togglePlay}
          className="h-12 w-12 shrink-0 flex items-center justify-center rounded-full bg-gradient-pink text-foreground hover:shadow-pink-glow hover:scale-105 transition-all outline-none"
        >
          {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
        </button>

        <div className="flex-1 flex flex-col justify-center pointer-events-auto">
          <input 
            type="range" 
            min="0" 
            max="100" 
            step="0.1"
            value={progress}
            onChange={handleSeek}
            className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary hover:h-2 transition-all mt-1" 
          />
          <div className="flex justify-between items-center mt-2 font-display text-xs text-muted-foreground w-full tracking-wider">
            <span>{currentTime}</span>
            <span>{duration}</span>
          </div>
        </div>

        <button 
          onClick={toggleMute}
          className="h-10 w-10 shrink-0 flex items-center justify-center rounded-full hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors outline-none"
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
