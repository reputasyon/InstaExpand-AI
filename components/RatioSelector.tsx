import React from 'react';
import { AspectRatio } from '../types';
import { Square, RectangleVertical, Smartphone } from 'lucide-react';

interface RatioSelectorProps {
  selectedRatio: AspectRatio;
  onSelect: (ratio: AspectRatio) => void;
  disabled?: boolean;
}

export const RatioSelector: React.FC<RatioSelectorProps> = ({ selectedRatio, onSelect, disabled }) => {
  const options = [
    { 
      id: AspectRatio.SQUARE, 
      label: 'Square', 
      subLabel: '1:1',
      icon: Square,
      desc: 'Post'
    },
    { 
      id: AspectRatio.PORTRAIT, 
      label: 'Portrait', 
      subLabel: '4:5', // Displaying 4:5 to user, but technically using 3:4 backend
      icon: RectangleVertical,
      desc: 'Feed' 
    },
    { 
      id: AspectRatio.STORY, 
      label: 'Story', 
      subLabel: '9:16', 
      icon: Smartphone,
      desc: 'Reels' 
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {options.map((opt) => {
        const Icon = opt.icon;
        const isSelected = selectedRatio === opt.id;
        
        return (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            disabled={disabled}
            className={`
              relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all duration-200
              ${isSelected 
                ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-sm' 
                : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200 hover:bg-gray-50'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className={`mb-2 p-2 rounded-full ${isSelected ? 'bg-pink-100' : 'bg-gray-100'}`}>
              <Icon className={`w-5 h-5 ${isSelected ? 'text-pink-600' : 'text-gray-500'}`} />
            </div>
            <span className="text-xs font-bold mb-0.5">{opt.label}</span>
            <span className="text-[10px] text-gray-400 font-medium">{opt.subLabel}</span>
          </button>
        );
      })}
    </div>
  );
};
