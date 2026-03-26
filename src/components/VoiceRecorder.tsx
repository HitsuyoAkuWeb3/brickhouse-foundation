import { useState, useRef } from "react";
import { Mic, Square, Play, Pause, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const VoiceRecorder = ({ onRecordingComplete }: { onRecordingComplete: (blobUrl: string) => void }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        onRecordingComplete(url);
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      toast.error("Microphone access denied or unavailable.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setAudioUrl(null);
    setIsPlaying(false);
    onRecordingComplete("");
  };

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      {!audioUrl ? (
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={cn(
            "w-24 h-24 rounded-full flex items-center justify-center transition-all",
            isRecording 
              ? "bg-destructive/20 border-2 border-destructive animate-pulse" 
              : "bg-primary/20 hover:bg-primary/30 border border-primary/50"
          )}
        >
          {isRecording ? (
            <Square className="w-8 h-8 text-destructive fill-current" />
          ) : (
            <Mic className="w-8 h-8 text-primary" />
          )}
        </button>
      ) : (
        <div className="flex items-center gap-4">
          <audio 
            ref={audioRef} 
            src={audioUrl} 
            onEnded={() => setIsPlaying(false)} 
            className="hidden" 
          />
          <button
            onClick={togglePlayback}
            className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50 hover:bg-primary/30 transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-primary" />
            ) : (
              <Play className="w-6 h-6 text-primary pl-1" />
            )}
          </button>
          <button
            onClick={handleReset}
            className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center border border-border hover:bg-foreground/10 transition-colors"
          >
            <RotateCcw className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      )}
      <p className="font-body text-xs text-muted-foreground mt-4">
        {isRecording ? "Recording... Tap to stop" : audioUrl ? "Review your affirmation" : "Tap to start recording"}
      </p>
    </div>
  );
};
