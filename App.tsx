import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Camera, Sparkles, Download, ArrowRight, Wand2, Info } from 'lucide-react';
import { Button } from './components/Button';
import { RatioSelector } from './components/RatioSelector';
import { ImageUploader } from './components/ImageUploader';
import { AspectRatio, GenerationStatus } from './types';
import { generateExpandedImage, blobToBase64 } from './services/geminiService';

// Add type definition for the AI Studio window object
// We extend the existing AIStudio interface which is already declared on Window
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}

const App: React.FC = () => {
  const [apiKeySet, setApiKeySet] = useState<boolean>(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalImageBase64, setOriginalImageBase64] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>(AspectRatio.PORTRAIT);
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize API Key check
  useEffect(() => {
    const checkApiKey = async () => {
      try {
        if (window.aistudio && window.aistudio.hasSelectedApiKey) {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          setApiKeySet(hasKey);
        } else {
            // Fallback for dev environments where window.aistudio might not exist immediately
            // In a real deployed extension scenario, this should be robust.
            // For now, if missing, we can't proceed with high-quality generation.
            console.warn("window.aistudio not found. Image generation may fail if key is not injected.");
        }
      } catch (e) {
        console.error("Error checking API key", e);
      }
    };
    checkApiKey();
  }, []);

  const handleSelectKey = async () => {
    try {
      if (window.aistudio && window.aistudio.openSelectKey) {
        await window.aistudio.openSelectKey();
        // Assume success as per guidelines to avoid race condition
        setApiKeySet(true);
      }
    } catch (e) {
      console.error("Error selecting key", e);
      setErrorMsg("Failed to select API key. Please try again.");
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const url = URL.createObjectURL(file);
      setOriginalImage(url);
      setGeneratedImage(null);
      setErrorMsg(null);
      
      const b64 = await blobToBase64(file);
      setOriginalImageBase64(b64);
    } catch (e) {
      setErrorMsg("Failed to process image. Please try another one.");
    }
  };

  const handleClear = () => {
    setOriginalImage(null);
    setOriginalImageBase64(null);
    setGeneratedImage(null);
    setStatus('idle');
  };

  const handleGenerate = async () => {
    if (!originalImageBase64 || !apiKeySet) return;
    
    setStatus('generating');
    setErrorMsg(null);

    try {
      const result = await generateExpandedImage(originalImageBase64, selectedRatio);
      setGeneratedImage(result);
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || "Something went wrong. Please try again.");
      
      // If error is related to API key (404/403 often means key missing/invalid in this context), reset state
      if (err.message && err.message.includes("Requested entity was not found")) {
          setApiKeySet(false);
          setErrorMsg("API Key issue. Please select your key again.");
      }
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `insta-expand-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!apiKeySet) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
          <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Welcome to InstaExpand</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            To generate high-quality Instagram posts, please connect your Google Cloud Project with a paid billing account.
          </p>
          <Button onClick={handleSelectKey} fullWidth>
            Connect API Key
          </Button>
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block mt-6 text-xs text-gray-400 hover:text-gray-600 underline"
          >
            Learn more about billing & API keys
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex justify-center">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl flex flex-col relative">
        
        {/* Header */}
        <header className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-yellow-400 via-red-500 to-pink-500 p-1.5 rounded-lg">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-gray-900">InstaExpand</span>
          </div>
          <div className="text-xs font-medium text-pink-600 bg-pink-50 px-2 py-1 rounded-full">
            AI Powered
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-6 py-6 pb-24 scroll-smooth">
          
          {/* Step 1: Upload */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Original Photo</h2>
              {originalImage && (
                <button onClick={handleClear} className="text-xs text-red-500 font-medium hover:text-red-600">
                  Reset
                </button>
              )}
            </div>
            <ImageUploader 
              currentImage={originalImage} 
              onImageUpload={handleImageUpload} 
              onClear={handleClear}
              disabled={status === 'generating'}
              targetRatio={selectedRatio}
            />
          </section>

          {/* Step 2: Settings (Only visible if image uploaded) */}
          {originalImage && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <section className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                   <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Target Format</h2>
                   <div className="group relative">
                      <Info className="w-3 h-3 text-gray-400 cursor-help"/>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-800 text-white text-xs p-2 rounded hidden group-hover:block z-10">
                        AI will expand the background to fit the new ratio.
                      </div>
                   </div>
                </div>
                <RatioSelector 
                  selectedRatio={selectedRatio} 
                  onSelect={setSelectedRatio} 
                  disabled={status === 'generating'}
                />
              </section>

              {/* Action Area */}
              {!generatedImage && (
                <div className="mt-4">
                  <Button 
                    onClick={handleGenerate} 
                    isLoading={status === 'generating'} 
                    fullWidth 
                    className="shadow-xl shadow-pink-200"
                  >
                    {status === 'generating' ? 'Expanding Image...' : 'Generate Expansion'}
                    {!status.includes('generating') && <Wand2 className="w-4 h-4 ml-2" />}
                  </Button>
                  {errorMsg && (
                    <p className="mt-3 text-sm text-red-500 text-center bg-red-50 p-2 rounded-lg border border-red-100">
                      {errorMsg}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Result */}
          {generatedImage && (
            <div className="animate-in fade-in zoom-in duration-500 mt-6 border-t border-gray-100 pt-6">
               <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center">
                 <Sparkles className="w-4 h-4 text-yellow-500 mr-2" />
                 AI Result
               </h2>
               
               <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-gray-100">
                  <img src={generatedImage} alt="Expanded" className="w-full h-auto" />
               </div>

               <div className="mt-6 flex flex-col gap-3">
                 <Button onClick={handleDownload} fullWidth variant="primary">
                   Download Image <Download className="w-4 h-4 ml-2" />
                 </Button>
                 <Button onClick={() => setGeneratedImage(null)} fullWidth variant="ghost">
                   Try Different Ratio
                 </Button>
               </div>
            </div>
          )}
        </main>

        {/* Footer info - only if not generated yet to save space */}
        {!generatedImage && (
          <div className="absolute bottom-6 left-0 right-0 text-center px-6 pointer-events-none opacity-50">
             <p className="text-[10px] text-gray-400">
               Powered by Gemini 3 Pro Image Model
             </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;