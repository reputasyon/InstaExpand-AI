import React, { useCallback } from 'react';
import { Upload, Image as ImageIcon, X, Sparkles } from 'lucide-react';
import { AspectRatio } from '../types';

interface ImageUploaderProps {
  currentImage: string | null;
  onImageUpload: (file: File) => void;
  onClear: () => void;
  disabled?: boolean;
  targetRatio?: AspectRatio;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  currentImage, 
  onImageUpload, 
  onClear, 
  disabled,
  targetRatio = AspectRatio.SQUARE 
}) => {
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  }, [onImageUpload]);

  // If we have an image, show the "Preview" mode which respects aspect ratio
  if (currentImage) {
    // Convert enum '3:4' to css '3/4'
    const ratioValue = targetRatio.replace(':', '/');

    return (
      <div className="relative w-full bg-gray-50 rounded-2xl border border-gray-200 p-6 flex items-center justify-center overflow-hidden transition-all duration-300">
        
        {/* The Frame Container - constrained by height to fit screen, width fits parent */}
        <div 
          className="relative w-full shadow-2xl rounded-lg overflow-hidden transition-all duration-500 bg-gray-200"
          style={{ 
            aspectRatio: ratioValue,
            maxHeight: '50vh', // Don't let 9:16 take up entire screen
            maxWidth: targetRatio === AspectRatio.STORY ? '260px' : '100%' // Keep story skinny on desktop
          }}
        >
          {/* Layer 1: Blurred Background (Simulates "AI Fill Area") */}
          <div className="absolute inset-0 overflow-hidden">
             <img 
              src={currentImage} 
              alt="Background Blur" 
              className="w-full h-full object-cover opacity-50 blur-xl scale-110" 
            />
            {/* Overlay Grid to suggest "Generation" */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-20"></div>
            <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
          </div>

          {/* Layer 2: The actual original image, contained within the frame */}
          <img 
            src={currentImage} 
            alt="Original" 
            className="absolute inset-0 w-full h-full object-contain z-10" 
          />

          {/* Indicator Badge */}
          <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center opacity-80">
             <span className="bg-black/60 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-md flex items-center gap-1">
               <Sparkles className="w-3 h-3 text-yellow-400" />
               AI Expansion Area
             </span>
          </div>
        </div>

        {/* Floating Close Button */}
        <button
          onClick={onClear}
          disabled={disabled}
          className="absolute top-3 right-3 p-2 bg-white hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-full transition-colors shadow-sm border border-gray-200 z-30"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // Upload State
  return (
    <div className="relative group">
      <div className={`
        relative w-full h-64 sm:h-80 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center text-center p-6
        ${disabled 
          ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60' 
          : 'border-gray-300 bg-white hover:border-pink-400 hover:bg-pink-50/30 cursor-pointer'}
      `}>
        <div className="mb-4 p-4 bg-gradient-to-tr from-pink-100 to-orange-100 rounded-full group-hover:scale-110 transition-transform duration-300">
          <Upload className="w-8 h-8 text-pink-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-1">Upload Photo</h3>
        <p className="text-sm text-gray-500 max-w-[200px]">
          Tap to select a photo from your library
        </p>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
};
