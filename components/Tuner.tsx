
import React from 'react';
import { usePitchDetection } from '../hooks/usePitchDetection';
import { STANDARD_TUNING_NOTES } from '../constants';
import type { NoteDetails } from '../types';

const getTuningTarget = (noteDetails: NoteDetails | null) => {
  if (!noteDetails) return null;
  const { noteName, octave } = noteDetails;
  const fullNoteName = `${noteName}${octave}`;
  return STANDARD_TUNING_NOTES.find(n => n.name === fullNoteName) || null;
};

const TunerDisplay: React.FC<{ noteDetails: NoteDetails | null }> = ({ noteDetails }) => {
  const detune = noteDetails?.detune ?? 0;
  const rotation = Math.max(-90, Math.min(90, detune * 1.8)); // Clamp between -90 and 90 degrees
  const isInTune = Math.abs(detune) < 5;

  const getBarColor = (d: number) => {
    if (Math.abs(d) < 5) return 'bg-green-500';
    if (Math.abs(d) < 15) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-md">
      {/* Note Name Display */}
      <div className="text-7xl md:text-8xl font-bold text-center w-48 h-28 flex items-center justify-center">
        {noteDetails ? (
          <div className="flex items-baseline">
            <span>{noteDetails.noteName}</span>
            <span className="text-4xl md:text-5xl text-gray-400">{noteDetails.octave}</span>
          </div>
        ) : (
          <span className="text-gray-600">--</span>
        )}
      </div>

      {/* Visual Tuner Needle */}
      <div className="relative w-full h-24 flex items-center justify-center">
        <div className="w-full h-1 bg-gray-700 rounded-full"></div>
        <div className="absolute w-1 h-8 bg-green-500 top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 rounded-full"></div>
        {/* Needle */}
        <div 
          className="absolute top-0 w-1 h-16 bg-blue-400 rounded-full origin-bottom transition-transform duration-150 ease-linear"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <div className="absolute -top-2 -left-1.5 w-4 h-4 bg-blue-400 rounded-full"></div>
        </div>
      </div>
      
      {/* Detune Bars */}
      <div className="flex items-center justify-center gap-1 w-full">
        {Array.from({ length: 21 }).map((_, i) => {
          const barDetune = (i - 10) * 5; // from -50 to +50 cents
          const isActive = detune > barDetune - 2.5 && detune < barDetune + 2.5;
          return (
            <div
              key={i}
              className={`w-2 h-8 rounded-full transition-colors ${isActive ? getBarColor(barDetune) : 'bg-gray-700'}`}
            ></div>
          );
        })}
      </div>

      <div className={`text-center text-2xl font-semibold transition-colors ${isInTune ? 'text-green-400' : 'text-gray-400'}`}>
        {isInTune ? "In Tune" : (detune > 0 ? "Sharp" : "Flat")}
      </div>
    </div>
  );
};


const Tuner: React.FC = () => {
  const { noteDetails, isListening, error, start, stop } = usePitchDetection();
  
  const targetNote = getTuningTarget(noteDetails);

  return (
    <div className="flex flex-col items-center justify-center w-full p-4 md:p-8 bg-gray-800 rounded-2xl shadow-lg border border-gray-700">
      <h2 className="text-3xl font-bold text-gray-200 mb-6">Guitar Tuner</h2>
      
      {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-lg mb-4">{error}</p>}

      <div className="w-full p-6 bg-gray-900 rounded-xl mb-6">
        <TunerDisplay noteDetails={noteDetails} />
      </div>

      <button
        onClick={isListening ? stop : start}
        className={`px-8 py-3 text-lg font-bold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg ${
          isListening
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isListening ? 'Stop Listening' : 'Start Tuner'}
      </button>

      <div className="mt-8 text-center">
        <h3 className="text-xl font-semibold text-gray-300 mb-3">Standard Tuning (EADGBe)</h3>
        <div className="flex flex-wrap justify-center gap-4">
          {STANDARD_TUNING_NOTES.slice().reverse().map((note) => (
             <div
             key={note.string}
             className={`w-20 py-2 rounded-lg text-center transition-all duration-200 border-2 ${
               targetNote?.name === note.name ? 'bg-blue-500 border-blue-300 scale-110 shadow-lg' : 'bg-gray-700 border-gray-600'
             }`}
           >
             <div className="font-bold text-lg">{note.name.slice(0, -1)}</div>
             <div className="text-sm text-gray-300">String {note.string}</div>
           </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tuner;
