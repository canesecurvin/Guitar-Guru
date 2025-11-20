import React, { useState } from 'react';
import { Difficulty, Style, FingerpickingFocus } from '../types';
import Spinner from './Spinner';

interface TutorialFormProps {
  onGenerate: (song: string, artist: string, difficulty: Difficulty, style?: Style, fingerpickingFocus?: FingerpickingFocus) => void;
  isLoading: boolean;
}

const TutorialForm: React.FC<TutorialFormProps> = ({ onGenerate, isLoading }) => {
  const [song, setSong] = useState('');
  const [artist, setArtist] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Easy);
  const [style, setStyle] = useState<Style>(Style.Chords);
  const [fingerpickingFocus, setFingerpickingFocus] = useState<FingerpickingFocus>(FingerpickingFocus.Melody);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (song.trim() && !isLoading) {
      if (difficulty === Difficulty.Hard) {
        onGenerate(song, artist, difficulty);
      } else {
        const focus = style === Style.Fingerpicking ? fingerpickingFocus : undefined;
        onGenerate(song, artist, difficulty, style, focus);
      }
    }
  };

  const showStyleOptions = difficulty === Difficulty.Easy || difficulty === Difficulty.Medium;
  const showFocusOptions = showStyleOptions && style === Style.Fingerpicking;

  return (
    <div className="w-full max-w-2xl mx-auto p-6 md:p-8 bg-gray-800 rounded-2xl shadow-lg border border-gray-700">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="song" className="block text-lg font-medium text-gray-300 mb-2">
              Song Name
            </label>
            <input
              type="text"
              id="song"
              value={song}
              onChange={(e) => setSong(e.target.value)}
              placeholder="e.g., 'Stairway to Heaven'"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              required
            />
          </div>
          <div>
            <label htmlFor="artist" className="block text-lg font-medium text-gray-300 mb-2">
              Artist Name
            </label>
            <input
              type="text"
              id="artist"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="e.g., 'Led Zeppelin'"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
          </div>
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-300 mb-2">Difficulty</label>
          <div className="grid grid-cols-3 gap-2 rounded-lg bg-gray-700 p-1">
            {Object.values(Difficulty).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setDifficulty(level)}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 ${
                  difficulty === level ? 'bg-blue-600 text-white shadow' : 'text-gray-300 hover:bg-gray-600'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className={`transition-all duration-300 ease-in-out ${showStyleOptions ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          {showStyleOptions && (
            <div>
              <label className="block text-lg font-medium text-gray-300 mb-2">Style</label>
              <div className="grid grid-cols-2 gap-2 rounded-lg bg-gray-700 p-1">
                {Object.values(Style).map((styleOption) => (
                  <button
                    key={styleOption}
                    type="button"
                    onClick={() => setStyle(styleOption)}
                    className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 ${
                      style === styleOption ? 'bg-blue-600 text-white shadow' : 'text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {styleOption}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={`transition-all duration-300 ease-in-out ${showFocusOptions ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          {showFocusOptions && (
            <div>
              <label className="block text-lg font-medium text-gray-300 mb-2">Fingerpicking Focus</label>
              <div className="grid grid-cols-2 gap-2 rounded-lg bg-gray-700 p-1">
                {Object.values(FingerpickingFocus).map((focusOption) => (
                  <button
                    key={focusOption}
                    type="button"
                    onClick={() => setFingerpickingFocus(focusOption)}
                    className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 ${
                      fingerpickingFocus === focusOption ? 'bg-purple-600 text-white shadow' : 'text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {focusOption}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !song.trim()}
          className="w-full flex justify-center items-center py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500 shadow-lg"
        >
          {isLoading ? <Spinner /> : 'Generate Tutorial'}
        </button>
      </form>
    </div>
  );
};

export default TutorialForm;