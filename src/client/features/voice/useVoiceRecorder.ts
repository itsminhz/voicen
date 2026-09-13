import { useCallback, useEffect, useRef, useState } from 'react';
import { blobToWav } from '@/client/lib/wav';

export const MAX_RECORDING_SECONDS = 110; // stay under AssemblyAI's 120s cap

export type RecorderStatus = 'idle' | 'requesting' | 'recording' | 'stopped' | 'error';

interface UseVoiceRecorderResult {
  status: RecorderStatus;
  seconds: number;
  levels: number[];
  error: string | null;
  start: () => Promise<void>;
  stop: () => Promise<Blob | null>;
  reset: () => void;
}

const LEVEL_BARS = 24;

export function useVoiceRecorder(): UseVoiceRecorderResult {
  const [status, setStatus] = useState<RecorderStatus>('idle');
  const [seconds, setSeconds] = useState(0);
  const [levels, setLevels] = useState<number[]>(() => new Array(LEVEL_BARS).fill(0.08));
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const resolveStopRef = useRef<((blob: Blob | null) => void) | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    audioCtxRef.current?.close().catch(() => {});
    timerRef.current = null;
    rafRef.current = null;
    streamRef.current = null;
    audioCtxRef.current = null;
    analyserRef.current = null;
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const tickLevels = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    const avg = data.reduce((a, b) => a + b, 0) / data.length / 255;
    setLevels((prev) => [...prev.slice(1), Math.max(0.08, Math.min(1, avg * 2.2))]);
    rafRef.current = requestAnimationFrame(tickLevels);
  }, []);

  const start = useCallback(async () => {
    setError(null);
    setStatus('requesting');
    setSeconds(0);
    setLevels(new Array(LEVEL_BARS).fill(0.08));

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextCtor();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;
      rafRef.current = requestAnimationFrame(tickLevels);

      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : undefined;
      const mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const rawBlob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' });
        cleanup();
        const resolve = resolveStopRef.current;
        resolveStopRef.current = null;
        try {
          if (rawBlob.size === 0) {
            resolve?.(null);
            return;
          }
          const wavBlob = await blobToWav(rawBlob);
          resolve?.(wavBlob);
        } catch {
          setError("We couldn't process that recording. Try again.");
          setStatus('error');
          resolve?.(null);
        }
      };

      mediaRecorder.start(250);
      setStatus('recording');

      timerRef.current = setInterval(() => {
        setSeconds((prev) => {
          const next = prev + 1;
          if (next >= MAX_RECORDING_SECONDS) {
            mediaRecorderRef.current?.stop();
          }
          return next;
        });
      }, 1000);
    } catch (err: any) {
      cleanup();
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        setError('Microphone access was denied. Please allow microphone access and try again.');
      } else if (err?.name === 'NotFoundError') {
        setError('No microphone was found on this device.');
      } else {
        setError('We could not start recording. Please try again.');
      }
      setStatus('error');
    }
  }, [cleanup, tickLevels]);

  const stop = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === 'inactive') {
        resolve(null);
        return;
      }
      resolveStopRef.current = resolve;
      setStatus('stopped');
      recorder.stop();
    });
  }, []);

  const reset = useCallback(() => {
    cleanup();
    setStatus('idle');
    setSeconds(0);
    setError(null);
    setLevels(new Array(LEVEL_BARS).fill(0.08));
  }, [cleanup]);

  return { status, seconds, levels, error, start, stop, reset };
}
