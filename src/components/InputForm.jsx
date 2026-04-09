import React, { useState } from 'react';
import { Settings, RefreshCw, Layers, Database } from 'lucide-react';

export const InputForm = ({ 
  numProcesses, 
  numResources, 
  onDimensionsChange, 
  generateRandomData,
  loadExampleData
}) => {
  const [localP, setLocalP] = useState(numProcesses);
  const [localR, setLocalR] = useState(numResources);

  const handleApply = () => {
    // Clamping limits
    const p = Math.max(1, Math.min(10, localP));
    const r = Math.max(1, Math.min(10, localR));
    setLocalP(p);
    setLocalR(r);
    onDimensionsChange(p, r);
  };

  return (
    <div className="glass-panel p-4 flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-2 border-b border-border/50 pb-2">
        <Settings className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-text">System Configuration</h2>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-text-muted mb-1 flex items-center gap-1">
            <Layers className="w-3 h-3" /> Processes (Max 10)
          </label>
          <input 
            type="number" 
            min="1" 
            max="10" 
            value={localP} 
            onChange={e => setLocalP(parseInt(e.target.value) || 1)}
            className="w-full bg-background border border-border px-3 py-2 rounded text-text focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1 flex items-center gap-1">
            <Database className="w-3 h-3" /> Resources (Max 10)
          </label>
          <input 
            type="number" 
            min="1" 
            max="10" 
            value={localR} 
            onChange={e => setLocalR(parseInt(e.target.value) || 1)}
            className="w-full bg-background border border-border px-3 py-2 rounded text-text focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>
      
      <button 
        onClick={handleApply}
        className="glass-button w-full justify-center mt-2"
      >
        Apply Dimensions
      </button>

      <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border/50">
        <button 
          onClick={generateRandomData}
          className="glass-button w-full justify-center text-sm"
        >
          <RefreshCw className="w-4 h-4 text-primary" />
          <span>Randomize Matrix Data</span>
        </button>
        <button 
          onClick={loadExampleData}
          className="glass-button w-full justify-center text-sm border-primary/30 text-primary/80 hover:text-primary"
        >
          Load Safe Example
        </button>
      </div>

    </div>
  );
};
