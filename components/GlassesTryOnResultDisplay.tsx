import React from 'react';
import type { TryOnResult } from '../types';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { GlassesIcon } from './icons/GlassesIcon';

interface GlassesTryOnResultDisplayProps {
  isLoading: boolean;
  results: TryOnResult[] | null;
}

export const GlassesTryOnResultDisplay: React.FC<GlassesTryOnResultDisplayProps> = ({ isLoading, results }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center text-gray-400 w-full">
        <SpinnerIcon className="w-12 h-12 mb-4" />
        <p className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">
          Generating your new look...
        </p>
        <p className="text-sm mt-1">This might take a few moments.</p>
      </div>
    );
  }

  if (results && results.length > 0) {
    return (
      <div className="w-full">
        <h3 className="text-2xl font-bold text-center mb-4 text-white">Your New Look!</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((item, index) => (
            item.imageUrl && (
              <div key={index} className="bg-gray-900/50 p-2 rounded-lg border border-gray-700">
                <img
                  src={item.imageUrl}
                  alt={`Generated view ${index + 1}`}
                  className="rounded-md w-full h-full object-cover shadow-lg shadow-black/30"
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
      <GlassesIcon className="w-16 h-16 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-400">Your glasses try-on will appear here</h3>
      <p className="mt-1">Upload both images and click "Generate" to see the results.</p>
    </div>
  );
};
