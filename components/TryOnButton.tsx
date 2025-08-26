import React from 'react';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';

interface TryOnButtonProps {
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export const TryOnButton: React.FC<TryOnButtonProps> = ({ onClick, disabled, isLoading, loadingText, children }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className="w-full flex items-center justify-center gap-3 text-lg font-bold text-white bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg px-8 py-4 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
    >
      {isLoading ? (
        <>
          <SpinnerIcon className="w-6 h-6" />
          <span>{loadingText || 'Generating...'}</span>
        </>
      ) : (
        <>
          {children}
          <ArrowRightIcon className="w-6 h-6" />
        </>
      )}
    </button>
  );
};
