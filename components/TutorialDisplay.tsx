import React from 'react';
import type { Tutorial } from '../types';
import Tablature from './Tablature';
import AudioPlayer from './AudioPlayer';
import ChordDiagram from './ChordDiagram';

interface TutorialDisplayProps {
  tutorial: Tutorial;
  onNewSearch: () => void;
}

const TutorialDisplay: React.FC<TutorialDisplayProps> = ({ tutorial, onNewSearch }) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 md:p-8 bg-gray-800 rounded-2xl shadow-lg border border-gray-700 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-gray-600 pb-4 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">{tutorial.songTitle}</h1>
          <h2 className="text-xl md:text-2xl text-gray-300">{tutorial.artist}</h2>
        </div>
        <div className="flex items-center gap-2 mt-3 sm:mt-0">
          <span className="px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full">{tutorial.difficulty}</span>
          {tutorial.style && <span className="px-3 py-1 bg-purple-600 text-white text-sm font-semibold rounded-full">{tutorial.style}</span>}
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-semibold mb-3 text-blue-300">Introduction</h3>
          <p className="text-gray-300 leading-relaxed">{tutorial.introduction}</p>
        </div>

        {tutorial.sections.map((section, index) => (
          <div key={index} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
             <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3 mb-3">
                <h4 className="text-2xl font-semibold text-green-300">{section.title}</h4>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="text-sm font-semibold text-gray-300 bg-gray-700 px-3 py-1 rounded-full">
                    Practice: Play {section.repetitions} times
                  </span>
                  {section.audioSnippet && <AudioPlayer snippet={section.audioSnippet} />}
                </div>
            </div>

            {section.chords && (
              <div className="mb-4">
                <p className="font-semibold text-gray-200">Chords:</p>
                <p className="text-lg text-yellow-300 font-mono tracking-wider mb-3">{section.chords}</p>
                {section.chordDiagrams && <ChordDiagram diagrams={section.chordDiagrams} />}
              </div>
            )}
            <div className="mb-4">
              <p className="font-semibold text-gray-200">Instructions:</p>
              <p className="text-gray-300 leading-relaxed">{section.instructions}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-200">Tablature:</p>
              <Tablature tabData={section.tablature} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={onNewSearch}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
        >
          Generate Another Tutorial
        </button>
      </div>
    </div>
  );
};

export default TutorialDisplay;