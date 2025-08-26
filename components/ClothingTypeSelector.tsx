import React from 'react';
import type { ClothingType } from '../types';
import { ShirtIcon } from './icons/ShirtIcon';
import { PantsIcon } from './icons/PantsIcon';
import { JacketIcon } from './icons/JacketIcon';
import { DressIcon } from './icons/DressIcon';

interface ClothingTypeSelectorProps {
  value: ClothingType;
  onChange: (value: ClothingType) => void;
}

const options: { id: ClothingType; label: string; icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
  { id: 'top', label: 'Top', icon: ShirtIcon },
  { id: 'bottom', label: 'Bottom', icon: PantsIcon },
  { id: 'outerwear', label: 'Outerwear', icon: JacketIcon },
  { id: 'fullBody', label: 'Full Body', icon: DressIcon },
];

export const ClothingTypeSelector: React.FC<ClothingTypeSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="flex flex-col gap-3">
      <label className="font-semibold text-gray-300 text-center">Select Clothing Type</label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all duration-200 ${
              value === option.id
                ? 'bg-purple-500/20 border-purple-500 text-white'
                : 'bg-gray-700/50 border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-200'
            }`}
            aria-pressed={value === option.id}
          >
            <option.icon className="w-7 h-7" />
            <span className="font-semibold text-sm">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
