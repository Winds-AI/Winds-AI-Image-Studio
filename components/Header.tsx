import React from 'react';
import { ShirtIcon } from './icons/ShirtIcon';
import { GithubIcon } from './icons/GithubIcon';
import { XSocialIcon } from './icons/XSocialIcon';
import { LinkedinIcon } from './icons/LinkedinIcon';
import { NpmIcon } from './icons/NpmIcon';

export const Header: React.FC = () => {
  return (
    <header className="py-4 px-8 border-b border-gray-700/50">
      <div className="container mx-auto flex justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <ShirtIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Winds AI <span className="text-gray-400">Studio</span>
          </h1>
        </div>
        <div className="flex justify-center items-center gap-6">
                <a href="https://github.com/charliecyt" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><GithubIcon className="w-6 h-6" /></a>
                <a href="https://x.com/charliecyt" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><XSocialIcon className="w-5 h-5" /></a>
                <a href="https://www.linkedin.com/in/charliecyt/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><LinkedinIcon className="w-6 h-6" /></a>
                <a href="https://www.npmjs.com/~charliecyt" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><NpmIcon className="w-6 h-6" /></a>
            </div>
      </div>
    </header>
  );
};
