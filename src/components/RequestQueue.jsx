import React from 'react';
import { ListIcon, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const RequestQueue = ({ queue, processNext }) => {
  return (
    <div className="glass-panel flex flex-col h-full overflow-hidden border-yellow-500/20">
      <div className="p-2 border-b border-border/50 bg-surface/50 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <ListIcon className="w-4 h-4 text-yello-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Request Queue ({queue.length})</span>
        </div>
        <button 
          onClick={processNext}
          disabled={queue.length === 0}
          className="text-[10px] uppercase font-bold bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded hover:bg-yellow-500/30 disabled:opacity-30 transition-colors flex items-center gap-1"
        >
          <Play className="w-3 h-3" /> Process Next
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar flex flex-col gap-2">
        <AnimatePresence>
          {queue.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-xs text-text-muted/50 italic py-4"
            >
              Queue is empty
            </motion.div>
          ) : (
            queue.map((req, idx) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: 20 }}
                transition={{ duration: 0.2 }}
                className="bg-background border border-border p-2 rounded flex justify-between items-center shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-text-muted opacity-50">#{idx + 1}</span>
                  <div className="px-1.5 py-0.5 rounded bg-primary/20 text-primary font-mono text-xs border border-primary/30">
                    P{req.processIdx}
                  </div>
                </div>
                <div className="font-mono text-xs text-text-muted flex items-center gap-1">
                  Req: <span className="text-white">[{req.requestVector.join(', ')}]</span>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
