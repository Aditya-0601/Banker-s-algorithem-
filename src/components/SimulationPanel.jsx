import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '../lib/utils';

export const SimulationPanel = ({ steps, currentStep }) => {
  if (!steps || steps.length === 0) return null;

  const stepData = steps[currentStep];
  const { type, message, work, safeSequence, finish, processIdx } = stepData;

  const getTypeIcon = () => {
    switch (type) {
      case 'SAFE_SEQUENCE': return <CheckCircle2 className="w-6 h-6 text-status-safe" />;
      case 'DEADLOCK': return <XCircle className="w-6 h-6 text-status-blocked" />;
      case 'EVALUATING': return <AlertCircle className="w-6 h-6 text-status-evaluating animate-pulse" />;
      case 'START': return <Info className="w-6 h-6 text-primary" />;
      default: return <Info className="w-6 h-6 text-text-muted" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'SAFE_SEQUENCE': return 'border-status-safe';
      case 'DEADLOCK': return 'border-status-blocked';
      case 'EVALUATING': return 'border-status-evaluating';
      case 'START': return 'border-primary';
      default: return 'border-border';
    }
  };

  return (
    <div className="glass-panel p-6 flex flex-col gap-6 w-full h-full">
      
      {/* Status & Message Box */}
      <motion.div 
        key={currentStep}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "p-4 rounded-lg bg-surfaceHighlight border flex items-start gap-4 shadow-lg transition-colors duration-500",
          getBorderColor()
        )}
      >
        <div className="mt-1">
          {getTypeIcon()}
        </div>
        <div>
          <h3 className="text-lg font-bold text-text mb-1 flex items-center gap-2">
            Step {currentStep} 
            <span className="text-sm font-normal text-text-muted">
              ({steps.length > 0 ? `${currentStep + 1}/${steps.length}` : '0/0'})
            </span>
          </h3>
          <p className="text-text-muted leading-relaxed">
            {message}
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        
        {/* Work Vector View */}
        <div className="bg-background/50 border border-border rounded-xl p-4 flex flex-col items-center justify-center">
          <h4 className="text-sm font-bold text-primary mb-4 uppercase tracking-widest text-center">Current Work Vector</h4>
          <div className="flex flex-wrap gap-3 justify-center">
            <AnimatePresence mode="popLayout">
              {work.map((val, idx) => (
                <motion.div
                  key={`work-${idx}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="flex flex-col items-center"
                >
                  <span className="text-xs text-text-muted mb-1">{String.fromCharCode(65 + idx)}</span>
                  <div className="w-12 h-12 rounded-lg bg-surface border border-primary/50 text-text font-mono flex items-center justify-center text-lg shadow-glow">
                    {val}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Safe Sequence / Processes Overview */}
        <div className="bg-background/50 border border-border rounded-xl p-4">
          <h4 className="text-sm font-bold text-primary mb-4 uppercase tracking-widest text-center">Process Status</h4>
          <div className="flex flex-wrap gap-3 justify-center">
            {finish.map((isFinished, idx) => {
              const isEvaluating = type === 'EVALUATING' && processIdx === idx;
              return (
                <div 
                  key={`P${idx}`}
                  className={cn(
                    "flex flex-col items-center p-2 border rounded-lg transition-all duration-300",
                    isFinished ? "bg-status-safe/10 border-status-safe" : 
                    isEvaluating ? "bg-status-evaluating/10 border-status-evaluating shadow-glow" : "bg-surface border-border",
                    type === 'DEADLOCK' && !isFinished ? "bg-status-blocked/10 border-status-blocked" : ""
                  )}
                >
                  <span className={cn(
                    "font-mono font-bold text-sm",
                    isFinished ? "text-status-safe" :
                    isEvaluating ? "text-status-evaluating" : "text-text",
                    type === 'DEADLOCK' && !isFinished ? "text-status-blocked" : ""
                  )}>
                    P{idx}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-border flex flex-col items-center">
            <h5 className="text-xs text-text-muted mb-2 uppercase">Safe Sequence Path</h5>
            {safeSequence.length === 0 ? (
              <span className="text-text-muted/50 text-sm italic">No sequence yet</span>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-2">
                {safeSequence.map((p, index) => (
                  <React.Fragment key={`seq-${index}`}>
                    {index > 0 && <span className="text-primary/50">→</span>}
                    <motion.div 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="px-3 py-1 rounded bg-status-safe/20 text-status-safe font-mono border border-status-safe/30"
                    >
                      P{p}
                    </motion.div>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
