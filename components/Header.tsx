
import React from 'react';
import { ShirtIcon } from './icons/ShirtIcon';
import { GlassesIcon } from './icons/GlassesIcon';
import { HomeIcon } from './icons/HomeIcon';

interface HeaderProps {
    activeStudio: 'apparel' | 'eyewear' | 'interior';
}

export const Header: React.FC<HeaderProps> = ({ activeStudio }) => {
  const studioConfig = {
    apparel: {
      icon: <ShirtIcon className="w-6 h-6 text-white" />,
      gradient: 'from-purple-500 to-indigo-600',
    },
    eyewear: {
      icon: <GlassesIcon className="w-6 h-6 text-white" />,
      gradient: 'from-amber-400 to-yellow-500',
    },
    interior: {
      icon: <HomeIcon className="w-6 h-6 text-white" />,
      gradient: 'from-blue-500 to-cyan-600',
    },
  };

  const { icon, gradient } = studioConfig[activeStudio];

  return (
    <header className="py-4 px-8 border-b border-gray-700/50">
      <div className="container mx-auto flex items-center gap-3">
        <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Winds AI <span className="text-gray-400">Studio</span>
        </h1>
      </div>
    </header>
  );
};
