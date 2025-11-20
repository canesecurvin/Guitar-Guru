
import { useState, useRef, useCallback, useEffect } from 'react';
import type { NoteDetails } from '../types';
import { NOTE_STRINGS } from '../constants';

const A4 = 440;
const C0 = A4 * Math.pow(2, -4.75);

const getNoteDetails = (frequency: number): NoteDetails | null => {
  if (frequency === 0) return null;
  
  const noteNum = 12 * (Math.log(frequency / C0) / Math.log(2));
  const noteIndex = Math.round(noteNum);
  const detune = (noteNum - noteIndex) * 100; // in cents
  
  const octave = Math.floor(noteIndex / 12);
  const noteName = NOTE_STRINGS[noteIndex % 12];

  return { noteName, detune, octave, frequency };
};


export const usePitchDetection = () => {
  const [noteDetails, setNoteDetails] = useState<NoteDetails | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const processAudio = useCallback(() => {
    if (!analyserRef.current) return;
    
    const bufferLength = analyserRef.current.fftSize;
    const buffer = new Float32Array(bufferLength);
    analyserRef.current.getFloatTimeDomainData(buffer);

    // Autocorrelation to find the fundamental frequency
    let bestCorrelation = 0;
    let bestLag = -1;
    const sampleRate = audioContextRef.current?.sampleRate ?? 44100;

    for (let lag = 40; lag < bufferLength / 2; lag++) {
        let correlation = 0;
        for (let i = 0; i < bufferLength / 2; i++) {
            correlation += buffer[i] * buffer[i + lag];
        }
        if (correlation > bestCorrelation) {
            bestCorrelation = correlation;
            bestLag = lag;
        }
    }
    
    const frequency = bestLag > 0 ? sampleRate / bestLag : 0;
    setNoteDetails(getNoteDetails(frequency));
    
    animationFrameId.current = requestAnimationFrame(processAudio);
  }, []);

  const start = useCallback(async () => {
    try {
      if (isListening) return;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Fix: Cast window to any to support vendor-prefixed webkitAudioContext for older browsers.
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = context;

      const source = context.createMediaStreamSource(stream);
      sourceRef.current = source;
      
      const analyser = context.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;

      source.connect(analyser);

      setIsListening(true);
      setError(null);
      animationFrameId.current = requestAnimationFrame(processAudio);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Microphone access denied. Please allow microphone access in your browser settings.');
      setIsListening(false);
    }
  }, [isListening, processAudio]);

  const stop = useCallback(() => {
    if (!isListening) return;

    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    
    streamRef.current?.getTracks().forEach(track => track.stop());
    sourceRef.current?.disconnect();
    analyserRef.current?.disconnect();
    audioContextRef.current?.close();

    audioContextRef.current = null;
    analyserRef.current = null;
    sourceRef.current = null;
    streamRef.current = null;
    
    setIsListening(false);
    setNoteDetails(null);
  }, [isListening]);
  
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return { noteDetails, isListening, error, start, stop };
};
