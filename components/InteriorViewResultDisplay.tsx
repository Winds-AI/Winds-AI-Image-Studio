
import React from 'react';
import type { TryOnResult } from '../types';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { HomeIcon } from './icons/HomeIcon';

interface InteriorViewResultDisplayProps {
  isLoading: boolean;
  result: TryOnResult | null;
}

export const InteriorViewResultDisplay: React.FC<InteriorViewResultDisplayProps> = ({ isLoading, result }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center text-gray-400 w-full">
        <SpinnerIcon className="w-12 h-12 mb-4" />
        <p className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
          Generating room view...
        </p>
        <p className="text-sm mt-1">This can take a few moments.</p>
      </div>
    );
  }

  if (result?.imageUrl) {
    return (
      <div className="w-full">
        <h3 className="text-2xl font-bold text-center mb-4 text-white">Your Room View</h3>
        <div className="bg-gray-900/50 p-2 rounded-lg border border-gray-700">
            <img
                src={result.imageUrl}
                alt="Generated room view"
                className="rounded-md w-full max-w-lg mx-auto shadow-lg shadow-black/30"
            />
        </div>
      </div>
    );
  }

  return (
    <div className="text-center text-gray-500">
      <HomeIcon className="w-16 h-16 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-400">Your generated room view will appear here</h3>
      <p className="mt-1">Identify rooms on your floor plan, select one, and click "Generate View".</p>
    </div>
  );
};
