
import React from 'react';
import { ShirtIcon } from './icons/ShirtIcon';
import { GlassesIcon } from './icons/GlassesIcon';
import { HomeIcon } from './icons/HomeIcon';
import { GithubIcon } from './icons/GithubIcon';
import { XSocialIcon } from './icons/XSocialIcon';
import { LinkedinIcon } from './icons/LinkedinIcon';
import { NpmIcon } from './icons/NpmIcon';

interface HeaderProps {
    activeStudio: 'apparel' | 'eyewear' | 'interior';
    onShowExamples: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeStudio, onShowExamples }) => {
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
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center`}>
            {icon}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Winds AI <span className="text-gray-400">Studio</span>
          </h1>
        </div>
        <div className="flex items-center gap-6">
            <button 
              onClick={onShowExamples}
              className="font-semibold text-black transition-colors px-3 py-2 rounded-md bg-teal-400"
            >
              Examples
            </button>
            <div className="h-6 w-px bg-gray-600"></div>
            <a href="https://github.com/Winds-AI" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors"><GithubIcon className="w-6 h-6" /></a>
            <a href="https://x.com/winds_ai" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors"><XSocialIcon className="w-5 h-5" /></a>
            <a href="https://www.linkedin.com/in/meet-limbani/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors"><LinkedinIcon className="w-6 h-6" /></a>
            <a href="https://www.npmjs.com/settings/winds-ai/packages" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors"><NpmIcon className="w-6 h-6" /></a>
        </div>
      </div>
    </header>
  );
};
