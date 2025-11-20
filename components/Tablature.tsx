import React from 'react';

interface TablatureProps {
  tabData: string;
}

const Tablature: React.FC<TablatureProps> = ({ tabData }) => {
  if (!tabData) {
    return null;
  }

  // Split by newline and filter out empty lines or non-tab lines
  const lines = tabData
    .trim()
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.includes('|'));

  // If parsing fails or yields no lines, fall back to a simple preformatted block
  if (lines.length === 0) {
    return (
      <pre className="p-4 bg-gray-800 text-gray-200 rounded-md overflow-x-auto text-sm font-mono leading-relaxed whitespace-pre-wrap">
        <code>{tabData}</code>
      </pre>
    );
  }
  
  return (
    <div className="p-4 bg-gray-800 text-gray-200 rounded-md overflow-x-auto text-sm">
      <div className="inline-block min-w-full">
        {lines.map((line, index) => {
          const parts = line.split('|');
          const stringName = parts[0].trim();
          const tabContent = parts.slice(1).join('|');

          return (
            <div key={index} className="flex whitespace-pre font-mono leading-relaxed">
              <span className="w-6 text-gray-400 font-semibold">{stringName}</span>
              <span className="text-gray-500">|</span>
              <span className="tracking-wide text-blue-300">{tabContent}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Tablature;
