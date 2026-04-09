import React from 'react';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, Power } from 'lucide-react';
import { cn } from '../lib/utils';

export const ControlPanel = ({ 
  onStart, 
  onNext, 
  onPrev, 
  onReset,
  onAutoPlayToggle,
  isAutoPlaying,
  currentStep,
  totalSteps,
  simulationReady
}) => {
  return (
    <div className="glass-panel p-4 flex flex-col md:flex-row items-center justify-between gap-4">
      
      <div className="flex items-center gap-2">
        <button 
          onClick={onStart}
          disabled={!simulationReady || currentStep > 0}
          className="primary-button group"
        >
          <Power className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span>Generate Sequence</span>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onPrev}
          disabled={currentStep <= 0}
          className="glass-button"
          title="Previous Step"
        >
          <SkipBack className="w-5 h-5" />
        </button>
        
        <button
          onClick={onAutoPlayToggle}
          disabled={currentStep === 0 || currentStep === totalSteps - 1}
          className={cn(
            "glass-button px-6 relative overflow-hidden",
            isAutoPlaying ? "text-primary border-primary shadow-glow ring-1 ring-primary" : ""
          )}
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
        
        <button
          onClick={onNext}
          disabled={currentStep >= totalSteps - 1 || totalSteps === 0}
          className="glass-button"
          title="Next Step"
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onReset}
          className="glass-button text-error hover:text-error hover:border-error/50"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset</span>
        </button>
      </div>
      
    </div>
  );
};
