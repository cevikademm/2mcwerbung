/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useCallback, useState, useEffect } from 'react';
import { CloudArrowUpIcon, DocumentMagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface InputAreaProps {
  onGenerate: (prompt: string, file?: File) => void;
  isGenerating: boolean;
  disabled?: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ onGenerate, isGenerating, disabled = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);

  // Simulation of progress
  useEffect(() => {
    let interval: any;
    if (isGenerating) {
        setProgress(0);
        interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 95) return prev;
                // Slow down as it gets higher
                const increment = prev < 50 ? 5 : prev < 80 ? 2 : 0.5;
                return prev + increment;
            });
        }, 200);
    } else {
        setProgress(100);
        setTimeout(() => setProgress(0), 500);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleFile = (file: File) => {
    // Prompt is now handled by system instruction mostly, but we trigger it here
    const prompt = `Analyze this invoice`;
    onGenerate(prompt, file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isGenerating) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [disabled, isGenerating]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (!disabled && !isGenerating) {
        setIsDragging(true);
    }
  }, [disabled, isGenerating]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  return (
    <div className="w-full">
      <div className={`relative group transition-all duration-300 ${isDragging ? 'scale-[1.01]' : ''}`}>
        <label
          className={`
            relative flex flex-col items-center justify-center
            h-40 md:h-56
            bg-[#0a0a0c]
            rounded-xl border border-dashed
            cursor-pointer overflow-hidden
            transition-all duration-300
            ${isDragging 
              ? 'border-blue-500 bg-zinc-900/50' 
              : 'border-zinc-800 hover:border-zinc-700 hover:bg-[#0c0c0e]'
            }
            ${isGenerating ? 'cursor-wait border-blue-500/30' : ''}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
            {/* Technical Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
                 style={{backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px'}}>
            </div>

            {isGenerating ? (
                <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-xs space-y-3 md:space-y-4">
                    <div className="relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="50%"
                                cy="50%"
                                r="42%"
                                stroke="currentColor"
                                strokeWidth="6"
                                fill="transparent"
                                className="text-zinc-800"
                            />
                            <circle
                                cx="50%"
                                cy="50%"
                                r="42%"
                                stroke="currentColor"
                                strokeWidth="6"
                                fill="transparent"
                                strokeDasharray="264"
                                strokeDashoffset={264 - (264 * progress) / 100}
                                className="text-blue-500 transition-all duration-300 ease-out"
                            />
                        </svg>
                        <span className="absolute text-xl md:text-2xl font-bold text-white font-mono">
                            %{Math.round(progress)}
                        </span>
                    </div>
                    <span className="text-xs text-zinc-500 animate-pulse">Analiz Ediliyor...</span>
                </div>
            ) : (
                <div className="relative z-10 flex flex-col items-center text-center space-y-3 md:space-y-4 p-4 md:p-6">
                    <div className={`
                        w-10 h-10 md:w-12 md:h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center 
                        transition-all duration-300 group-hover:scale-110 group-hover:border-zinc-700
                        ${isDragging ? 'bg-blue-900/20 border-blue-800' : ''}
                    `}>
                        <CloudArrowUpIcon className={`w-5 h-5 md:w-6 md:h-6 ${isDragging ? 'text-blue-400' : 'text-zinc-500'}`} />
                    </div>

                    <div>
                        <h3 className="text-base md:text-lg font-semibold text-zinc-200 mb-1">
                            Fatura veya Fiş Yükle
                        </h3>
                        <p className="text-xs md:text-sm text-zinc-500">
                            PDF, JPG veya PNG sürükleyebilirsiniz.
                        </p>
                    </div>
                </div>
            )}

            <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={handleFileChange}
                disabled={isGenerating || disabled}
            />
        </label>
      </div>
    </div>
  );
};