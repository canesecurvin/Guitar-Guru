import React, { useState, useCallback } from 'react';
import TutorialForm from './components/TutorialForm';
import TutorialDisplay from './components/TutorialDisplay';
import Tuner from './components/Tuner';
import MusicNoteIcon from './components/icons/MusicNoteIcon';
import { generateTutorial } from './services/geminiService';
import type { Difficulty, Style, Tutorial, FingerpickingFocus } from './types';

type View = 'TUTORIALS' | 'TUNER';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('TUTORIALS');
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateTutorial = useCallback(async (
    song: string,
    artist: string,
    difficulty: Difficulty,
    style?: Style,
    fingerpickingFocus?: FingerpickingFocus
  ) => {
    setIsLoading(true);
    setError(null);
    setTutorial(null);
    try {
      const generatedTutorial = await generateTutorial(song, artist, difficulty, style, fingerpickingFocus);
      setTutorial(generatedTutorial);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleNewSearch = () => {
    setTutorial(null);
    setError(null);
  };
  
  const NavButton: React.FC<{ view: View; label: string }> = ({ view, label }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`px-4 py-2 text-sm md:text-base font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 ${
        activeView === view ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 md:p-8">
      <header className="w-full max-w-5xl mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700">
          <div className="flex items-center gap-3">
            <MusicNoteIcon className="w-8 h-8 text-blue-400" />
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              AI Guitar Guru
            </h1>
          </div>
          <nav className="flex gap-2 p-1 bg-gray-700/50 rounded-lg">
            <NavButton view="TUTORIALS" label="Tutorials" />
            <NavButton view="TUNER" label="Tuner" />
          </nav>
        </div>
      </header>

      <main className="w-full max-w-5xl flex-grow flex items-start justify-center">
        {activeView === 'TUTORIALS' && (
          <div className="w-full">
            {!tutorial && <TutorialForm onGenerate={handleGenerateTutorial} isLoading={isLoading} />}
            {isLoading && (
               <div className="text-center mt-8">
                <p className="text-xl text-gray-300 mb-4">Generating your tutorial... This may take a moment.</p>
              </div>
            )}
            {error && (
              <div className="mt-8 text-center p-4 bg-red-900/50 border border-red-500 rounded-lg max-w-2xl mx-auto">
                <h3 className="text-xl font-bold text-red-300 mb-2">Generation Failed</h3>
                <p className="text-red-300">{error}</p>
                <button
                    onClick={handleNewSearch}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
                >
                    Try Again
                </button>
              </div>
            )}
            {tutorial && <TutorialDisplay tutorial={tutorial} onNewSearch={handleNewSearch} />}
          </div>
        )}

        {activeView === 'TUNER' && <Tuner />}
      </main>
      
      <footer className="w-full max-w-5xl mt-8 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} AI Guitar Guru. Powered by Gemini.</p>
      </footer>
    </div>
  );
};

export default App;