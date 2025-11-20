import React from 'react';

interface ChordDiagramProps {
  diagrams: string;
}

const SingleChordDiagram: React.FC<{ name: string; frets: string }> = ({ name, frets }) => {
  const fretData = frets.split(''); // [E, A, D, G, B, e]
  const stringCount = 6;
  const fretCount = 5;

  const relevantFrets = fretData
    .map(f => parseInt(f, 10))
    .filter(f => !isNaN(f) && f > 0);
  const minFret = relevantFrets.length > 0 ? Math.min(...relevantFrets) : 1;
  const maxFret = relevantFrets.length > 0 ? Math.max(...relevantFrets) : fretCount -1;
  
  const startFret = minFret > fretCount - 2 ? minFret -1 : 1;

  return (
    <div className="inline-flex flex-col items-center bg-gray-700 p-3 rounded-lg">
      <h5 className="font-bold text-lg text-white mb-2">{name}</h5>
      <div className="relative">
        {/* Frets and Nut */}
        <div className="flex flex-col">
          <div className={`h-2.5 rounded-t-sm ${startFret > 1 ? 'bg-gray-500' : 'bg-gray-400'}`}></div>
          {[...Array(fretCount)].map((_, i) => (
            <div key={i} className="h-8 border-t border-gray-500"></div>
          ))}
        </div>

        {/* Strings */}
        <div className="absolute top-0 left-0 w-full h-full flex justify-between px-2">
            {[...Array(stringCount)].map((_, i) => (
                <div key={i} className="w-px bg-gray-500 h-full"></div>
            ))}
        </div>

         {/* Start Fret Number */}
         {startFret > 1 && (
            <div className="absolute -left-5 top-4 text-sm text-gray-400">{startFret}</div>
         )}


        {/* Markers (Open/Muted/Fretted) */}
        <div className="absolute top-0 left-0 w-full h-full flex justify-between px-2">
          {fretData.map((fret, stringIndex) => {
            const fretNum = parseInt(fret, 10);
            const yOffset = (fretNum - startFret + 0.5) * 8 + 2.5; // in h- units (32px)
            
            if (!isNaN(fretNum) && fretNum > 0) {
              return (
                <div key={stringIndex} className="relative w-px h-full">
                    <div 
                        className="absolute w-5 h-5 bg-blue-300 rounded-full border-2 border-gray-800 -translate-x-1/2"
                        style={{ top: `calc(${yOffset / (fretCount * 8 + 2.5) * 100}% - 10px)`}}
                    ></div>
                </div>
              );
            }
            return (
              <div key={stringIndex} className="relative w-px h-full">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-base font-bold text-gray-300">
                    {fret.toLowerCase() === 'x' ? 'x' : fret === '0' ? 'o' : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ChordDiagram: React.FC<ChordDiagramProps> = ({ diagrams }) => {
  if (!diagrams || typeof diagrams !== 'string') {
    return null;
  }

  const parsedDiagrams = diagrams
    .trim()
    .split('\n')
    .map(line => {
      const [name, frets] = line.split(':');
      if (name && frets && frets.trim().length === 6) {
        return { name: name.trim(), frets: frets.trim() };
      }
      return null;
    })
    .filter(Boolean);

  if (parsedDiagrams.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-4 mt-2">
      {parsedDiagrams.map((d, i) => d && <SingleChordDiagram key={i} name={d.name} frets={d.frets} />)}
    </div>
  );
};

export default ChordDiagram;
