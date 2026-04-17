import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { cn } from '../lib/utils';

const Toast = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration || 3500);
    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  const icons = {
    SUCCESS: <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />,
    ERROR: <XCircle className="w-5 h-5 text-red-400 shrink-0" />,
    WARNING: <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0" />,
    INFO: <Info className="w-5 h-5 text-cyan-400 shrink-0" />
  };

  const borders = {
    SUCCESS: "border-emerald-500/30 bg-emerald-500/10 shadow-emerald-500/10",
    ERROR: "border-red-500/30 bg-red-500/10 shadow-red-500/10",
    WARNING: "border-yellow-500/30 bg-yellow-500/10 shadow-yellow-500/10",
    INFO: "border-cyan-500/30 bg-cyan-500/10 shadow-cyan-500/10"
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95, transition: { duration: 0.2 } }}
      className={cn(
        "relative flex items-start gap-3 p-4 mb-3 rounded-xl border backdrop-blur-xl shadow-lg pointer-events-auto overflow-hidden",
        "w-80",
        borders[toast.type] || borders.INFO
      )}
    >
      {/* Progress Bar Bonus */}
      <motion.div 
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: (toast.duration || 3500) / 1000, ease: "linear" }}
        className="absolute bottom-0 left-0 h-[2px] bg-white/20"
      />
      
      {icons[toast.type] || icons.INFO}
      <div className="flex-1 min-w-0 pr-4 mt-0.5">
        <p className="text-[13px] text-text font-medium leading-relaxed tracking-wide">
          {toast.message}
        </p>
      </div>
      
      <button 
        onClick={() => onRemove(toast.id)}
        className="absolute top-2 right-2 text-text-muted hover:text-text transition-colors p-1"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export const Toaster = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-20 right-6 z-50 flex flex-col pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};
