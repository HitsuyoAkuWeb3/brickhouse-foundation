import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

export function AudioPlayer({ src }: { src: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState("0:00");
  const [currentTime, setCurrentTime] = useState("0:00");
  const audioRef = useRef<HTMLAudioElement>(null);

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "0:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

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

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime("0:00");
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const time = (Number(e.target.value) / 100) * audioRef.current.duration;
      if (!isNaN(time)) {
        audioRef.current.currentTime = time;
        setProgress(Number(e.target.value));
      }
    }
  };

  return (
    <div className="flex flex-col gap-2 mt-3 p-3 bg-card/30 border border-primary/10 rounded-xl">
      <div className="flex items-center gap-4">
        <audio ref={audioRef} src={src} preload="metadata" />
        
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
