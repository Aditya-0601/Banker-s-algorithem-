import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, RotateCcw } from 'lucide-react';
import { cn } from '../lib/utils';

export const Timeline = ({ 
  steps, 
  currentStep, 
  onJumpToStep,
  isAutoPlaying,
  onAutoPlayToggle,
  onNext,
  onPrev,
  onReset
}) => {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="glass-panel p-4 flex flex-col gap-4 mx-6 mt-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onPrev} disabled={currentStep <= 0} className="glass-button p-2" title="Previous Step">
            <SkipBack className="w-4 h-4" />
          </button>
          
          <button
            onClick={onAutoPlayToggle}
            className={cn("glass-button px-6 relative overflow-hidden", isAutoPlaying ? "text-primary border-primary shadow-glow ring-1 ring-primary" : "")}
            title={isAutoPlaying ? "Pause Auto-play" : "Auto-play"}
          >
            {isAutoPlaying ? (
              <>
                <span className="absolute inset-0 bg-primary/10 animate-pulse"></span>
                <Pause className="w-5 h-5 relative z-10" />
              </>
            ) : (
              <Play className="w-5 h-5" />
            )}
          </button>
          
          <button onClick={onNext} disabled={currentStep >= steps.length - 1} className="glass-button p-2" title="Next Step">
            <SkipForward className="w-4 h-4" />
          </button>

          <button onClick={onReset} className="glass-button p-2 text-text-muted hover:text-error hover:border-error/50">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
        
        <div className="text-sm font-mono text-primary font-bold">
          Step {currentStep} / {steps.length - 1}
        </div>
      </div>

      {/* Scrubber / Progress Bar */}
      <div className="relative h-2 bg-surfaceHighlight rounded-full overflow-hidden flex cursor-pointer" onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const targetStep = Math.round(percent * (steps.length - 1));
        onJumpToStep(targetStep);
      }}>
        {steps.map((_, i) => (
          <div 
            key={`timeline-${i}`} 
            className={cn(
              "flex-1 h-full border-r border-background/20 transition-colors duration-300",
              i < currentStep ? "bg-primary" : i === currentStep ? "bg-status-evaluating animate-pulse" : "bg-transparent"
            )}
          />
        ))}
      </div>
    </div>
  );
};
