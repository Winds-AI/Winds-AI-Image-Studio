
import React, { useState, useEffect } from 'react';
import { EyeIcon } from './icons/EyeIcon';
import { EyeSlashIcon } from './icons/EyeSlashIcon';
import { CheckIcon } from './icons/CheckIcon';

interface ApiKeyInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ value, onChange }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleSave = () => {
    onChange(inputValue);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 backdrop-blur-sm mt-8">
      <h3 className="text-xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
        Configure Your API Key
      </h3>
      <p className="text-center text-gray-400 mt-2 mb-4 text-sm">
        Enter your Google Gemini API key to use the studio. Your key is saved securely in your browser's local storage and is never sent to our servers.
      </p>
      <div className="flex flex-col gap-4">
        <div className="relative">
          <input
            type={isVisible ? 'text' : 'password'}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter your Gemini API Key"
            className="w-full bg-gray-900 border border-gray-600 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 pr-12"
            aria-label="Gemini API Key"
          />
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 hover:text-white"
            aria-label={isVisible ? 'Hide API Key' : 'Show API Key'}
          >
            {isVisible ? <EyeSlashIcon className="w-6 h-6" /> : <EyeIcon className="w-6 h-6" />}
          </button>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaved || inputValue === value}
          className={`w-full flex items-center justify-center gap-2 font-bold text-white rounded-lg px-6 py-3 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 ${
            isSaved 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600'
              : 'bg-gradient-to-r from-yellow-500 to-orange-600'
          }`}
        >
          {isSaved ? (
            <>
              <CheckIcon className="w-6 h-6" />
              <span>Saved!</span>
            </>
          ) : (
            <span>Save Key</span>
          )}
        </button>
      </div>
      <p className="text-center text-gray-500 mt-3 text-xs">
        Don't have a key? Get one from{' '}
        <a
          href="https://aistudio.google.com/app/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="text-yellow-400 hover:underline"
        >
          Google AI Studio
        </a>.
      </p>
    </div>
  );
};
