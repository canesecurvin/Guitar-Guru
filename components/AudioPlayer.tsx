import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { NotePlayback } from '../types';
import PlayIcon from './icons/PlayIcon';
import StopIcon from './icons/StopIcon';

// Declare Tone on the window object to satisfy TypeScript since it's loaded from a CDN
declare global {
  interface Window {
    Tone: any;
  }
}

interface AudioPlayerProps {
  snippet: NotePlayback[];
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ snippet }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const synthRef = useRef<any>(null);
  const partRef = useRef<any>(null);

  // Initialize synth
  useEffect(() => {
    if (window.Tone) {
      // Use a synth that sounds somewhat like a plucked string
      synthRef.current = new window.Tone.PluckSynth().toDestination();
    }
    return () => {
      synthRef.current?.dispose();
    };
  }, []);

  // Setup the Tone.Part with the snippet data
  useEffect(() => {
    if (!window.Tone || !synthRef.current || !snippet || snippet.length === 0) {
      return;
    }
    
    // Clean up previous part if it exists
    partRef.current?.dispose();
    
    const part = new window.Tone.Part((time: number, value: any) => {
      synthRef.current.triggerAttackRelease(value.note, value.duration, time);
    }, snippet).start(0);

    partRef.current = part;
    
    const transportEndCallback = () => {
       // Using setTimeout to avoid React batching issues and ensure state updates after Tone.js transport stops
      setTimeout(() => setIsPlaying(false), 10);
    };
    
    window.Tone.Transport.on('stop', transportEndCallback);
    
    return () => {
      part?.dispose();
      window.Tone.Transport.off('stop', transportEndCallback);
      // Ensure transport is stopped when component unmounts or snippet changes
      if (window.Tone.Transport.state === 'started') {
        window.Tone.Transport.stop();
      }
    };
  }, [snippet]);
  
  const togglePlay = useCallback(async () => {
    if (!window.Tone || !partRef.current) return;

    if (window.Tone.context.state !== 'running') {
      await window.Tone.start();
    }

    if (isPlaying) {
      window.Tone.Transport.stop();
      // Position is reset to 0 on stop
      setIsPlaying(false);
    } else {
      window.Tone.Transport.start();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  if (!snippet || snippet.length === 0) {
    return null;
  }
  
  return (
    <button
      onClick={togglePlay}
      className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
      aria-label={isPlaying ? "Stop snippet" : "Play snippet"}
    >
      {isPlaying ? <StopIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
      <span>{isPlaying ? 'Playing...' : 'Hear Snippet'}</span>
    </button>
  );
};

export default AudioPlayer;