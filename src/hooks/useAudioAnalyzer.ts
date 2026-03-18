import { useState, useEffect, RefObject, useRef } from 'react';

export function useAudioAnalyzer(audioRef: RefObject<HTMLAudioElement>) {
  const [isSilent, setIsSilent] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const sourceCreated = useRef(false);

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    let audioCtx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let rafId: number;
    let silenceStart = 0;

    const setupAudio = () => {
      if (sourceCreated.current) return;
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtx = new AudioContextClass();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        const source = audioCtx.createMediaElementSource(audioEl);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        sourceCreated.current = true;
      } catch (e) {
        console.warn("AudioContext setup failed:", e);
      }
    };

    const checkSilence = () => {
      if (!analyser) return;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);
      
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      
      // Threshold for silence
      if (average < 5) {
        if (silenceStart === 0) silenceStart = Date.now();
        else if (Date.now() - silenceStart > 1000) {
          setIsSilent(true);
        }
      } else {
        silenceStart = 0;
        setIsSilent(false);
      }
      rafId = requestAnimationFrame(checkSilence);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setupAudio();
      if (audioCtx?.state === 'suspended') {
        audioCtx.resume();
      }
      checkSilence();
    };

    const handlePause = () => {
      setIsPlaying(false);
      setIsSilent(false);
      if (rafId) cancelAnimationFrame(rafId);
    };

    audioEl.addEventListener('play', handlePlay);
    audioEl.addEventListener('pause', handlePause);
    audioEl.addEventListener('ended', handlePause);

    return () => {
      audioEl.removeEventListener('play', handlePlay);
      audioEl.removeEventListener('pause', handlePause);
      audioEl.removeEventListener('ended', handlePause);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [audioRef]);

  return { isSilent, isPlaying };
}
