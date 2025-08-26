import React from 'react';
import type { TryOnResult } from '../types';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { ImageIcon } from './icons/ImageIcon';

interface ExtractorResultDisplayProps {
  isLoading: boolean;
  results: TryOnResult[] | null;
}

export const ExtractorResultDisplay: React.FC<ExtractorResultDisplayProps> = ({ isLoading, results }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center text-gray-400 w-full">
        <SpinnerIcon className="w-12 h-12 mb-4" />
        <p className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500">
          Extracting clothing items...
        </p>
        <p className="text-sm mt-1">The AI is analyzing your image.</p>
      </div>
    );
  }

  if (results && results.length > 0) {
    return (
      <div className="w-full">
        <h3 className="text-2xl font-bold text-center mb-4 text-white">Extracted Items</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {results.map((item, index) => (
            item.imageUrl && (
              <div key={index} className="bg-gray-900/50 p-2 rounded-lg border border-gray-700">
                <img
                  src={item.imageUrl}
                  alt={`Extracted item ${index + 1}`}
                  className="rounded-md w-full h-full object-contain"
                />
              </div>
            )
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="text-center text-gray-500">
      <ImageIcon className="w-16 h-16 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-400">Your extracted items will appear here</h3>
      <p className="mt-1">Upload a photo and click "Extract Items" to begin.</p>
    </div>
  );
};
