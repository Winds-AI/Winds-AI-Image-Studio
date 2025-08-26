import React from 'react';
import { ShirtIcon } from './icons/ShirtIcon';

export const Header: React.FC = () => {
  return (
    <header className="py-4 px-8 border-b border-gray-700/50">
      <div className="container mx-auto flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
          <ShirtIcon className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Winds AI <span className="text-gray-400">Studio</span>
        </h1>
      </div>
    </header>
  );
};