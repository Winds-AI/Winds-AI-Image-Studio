import React from 'react';
import type { TryOnResult } from '../types';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { ImageIcon } from './icons/ImageIcon';

interface ResultDisplayProps {
  isLoading: boolean;
  result: TryOnResult | null;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ isLoading, result }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center text-gray-400 w-full">
        <SpinnerIcon className="w-12 h-12 mb-4" />
        <p className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
          Generating your new look...
        </p>
        <p className="text-sm mt-1">This might take a moment.</p>
      </div>
    );
  }

  if (result?.imageUrl) {
    return (
      <div className="w-full">
        <h3 className="text-2xl font-bold text-center mb-4 text-white">Your New Look!</h3>
        <img
          src={result.imageUrl}
          alt="Generated try-on"
          className="rounded-xl w-full max-w-lg mx-auto shadow-2xl shadow-black/50 border-2 border-purple-500/50"
        />
        {result.text && (
          <p className="mt-4 text-center text-gray-300 bg-gray-900/50 p-3 rounded-lg">{result.text}</p>
        )}
      </div>
    );
  }

  return (
    <div className="text-center text-gray-500">
      <ImageIcon className="w-16 h-16 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-400">Your virtual try-on will appear here</h3>
      <p className="mt-1">Upload both images and click "Generate" to see the result.</p>
    </div>
  );
};