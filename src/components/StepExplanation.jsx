import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, AlertTriangle, CheckCircle, DatabaseZap } from 'lucide-react';
import { cn } from '../lib/utils';
import { MatrixTable } from './MatrixTable';

export const StepExplanation = ({ stepData, numResources }) => {
  if (!stepData) return null;

  const { type, bullets, work, finish, safeSequence, processIdx } = stepData;

  const getTypeStyle = () => {
    switch (type) {
      case 'EVALUATING': return 'border-status-evaluating bg-status-evaluating/10 text-status-evaluating';
      case 'EXECUTING': return 'border-primary bg-primary/10 text-primary';
      case 'WAITING': return 'border-status-blocked bg-status-blocked/10 text-status-blocked';
      case 'RELEASING': return 'border-cyan-500 bg-cyan-500/10 text-cyan-400';
      case 'FINISHED': return 'border-status-safe bg-status-safe/10 text-status-safe';
      case 'DEADLOCK': return 'border-error bg-error/20 text-error font-bold';
      case 'SAFE_SEQUENCE_FOUND': return 'border-status-safe bg-status-safe/20 text-status-safe font-bold';
      default: return 'border-border bg-surfaceHighlight text-text';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'EVALUATING': return <AlertTriangle className="w-5 h-5" />;
      case 'DEADLOCK': return <AlertTriangle className="w-6 h-6 animate-ping" />;
      case 'FINISHED': case 'SAFE_SEQUENCE_FOUND': return <CheckCircle className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Top sticky explanation */}
      <motion.div 
        key={bullets?.join('-')}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className={cn(
          "p-5 rounded-xl border flex items-start gap-4 shadow-sm",
          getTypeStyle()
        )}
      >
        <div className="mt-1 shrink-0">
          {getIcon()}
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider mb-2 opacity-80 border-b border-current/20 pb-1 inline-block">{type.replace('_', ' ')}</h3>
          <ul className="space-y-1 mt-1">
            {bullets && bullets.map((b, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <span className="opacity-60 text-xs mt-0.5">▶</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* Process Flow Panel */}
      <div className="flex-1 overflow-y-auto glass-panel p-4 flex flex-col gap-6">
        
        {processIdx !== null && processIdx !== undefined ? (
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-bold text-text-muted mb-2 uppercase tracking-widest border-b border-border/50 pb-2">Active Flow: P{processIdx}</h4>
            
            <div className={cn("p-2 rounded text-sm flex gap-2 items-center", type !== 'WAITING' ? "text-primary" : "text-text-muted")}>
              {type !== 'WAITING' ? <CheckCircle className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border border-current" />}
              <span>1. Check Process P{processIdx}</span>
            </div>

            <div className={cn("p-2 rounded text-sm flex gap-2 items-center", (type === 'EXECUTING' || type === 'RELEASING' || type === 'FINISHED') ? "text-primary" : type === 'WAITING' ? "text-error" : type === 'EVALUATING' ? "text-status-evaluating animate-pulse" : "text-text-muted")}>
              {(type === 'EXECUTING' || type === 'RELEASING' || type === 'FINISHED') ? <CheckCircle className="w-4 h-4" /> : type === 'WAITING' ? <AlertTriangle className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border border-current" />}
              <span>2. Validate Need ≤ Work</span>
            </div>

            <div className={cn("p-2 rounded text-sm flex gap-2 items-center", (type === 'RELEASING' || type === 'FINISHED') ? "text-primary" : (type === 'EXECUTING') ? "text-status-evaluating animate-pulse" : "text-text-muted")}>
              {(type === 'RELEASING' || type === 'FINISHED') ? <CheckCircle className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border border-current" />}
              <span>3. Execute P{processIdx}</span>
            </div>

            <div className={cn("p-2 rounded text-sm flex gap-2 items-center", type === 'FINISHED' ? "text-primary" : type === 'RELEASING' ? "text-status-evaluating animate-pulse" : "text-text-muted")}>
              {type === 'FINISHED' ? <CheckCircle className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border border-current" />}
              <span>4. Update Work Vector</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 opacity-50 text-center h-full">
            <Info className="w-8 h-8 mb-2 text-primary" />
            <span className="text-sm">Select 'Run Simulation' to initialize flow.</span>
          </div>
        )}

        <div className="border-t border-border/50 pt-4 mt-auto">
          <h4 className="text-xs font-bold text-text-muted mb-3 uppercase tracking-widest text-center">All Processes Status</h4>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            {finish.map((isG, p) => (
              <div key={p} className={cn(
                "p-1.5 rounded text-center border font-mono text-xs transition-all",
                isG ? "bg-[#d1fae5]/10 border-[#10b981]/50 text-[#10b981]" :
                (processIdx === p && type === 'EVALUATING') ? "bg-[#fef3c7]/10 border-[#f59e0b] text-[#f59e0b]" :
                "bg-background/50 border-border text-text-muted"
              )}>
                P{p}: {isG ? 'Done' : 'Wait'}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
