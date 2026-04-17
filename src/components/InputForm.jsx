import React, { useState } from 'react';
import { Settings, RefreshCw, Layers, Database, ShieldCheck, ShieldAlert } from 'lucide-react';

export const InputForm = ({ 
  numProcesses, 
  numResources, 
  onDimensionsChange, 
  onGenerateSafeData,
  onGenerateUnsafeData,
  onGenerateRandomData,
  loadExampleData
}) => {
  const [localP, setLocalP] = useState(numProcesses || "");
  const [localR, setLocalR] = useState(numResources || "");
  const [errorMsg, setErrorMsg] = useState("");

  const handleApply = () => {
    setErrorMsg("");
    
    const pStr = localP.toString().trim();
    const rStr = localR.toString().trim();

    if (pStr === "" || rStr === "") {
      setErrorMsg("Inputs cannot be empty.");
      return;
    }

    const p = parseInt(pStr);
    const r = parseInt(rStr);

    if (isNaN(p) || p <= 0 || p > 10 || isNaN(r) || r <= 0 || r > 10) {
      setErrorMsg("Values must be between 1 and 10.");
      return;
    }

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
            placeholder="Enter processes (1-10)"
            onChange={e => {
              setLocalP(e.target.value);
              setErrorMsg("");
            }}
            className="w-full bg-background border border-border px-3 py-2 rounded text-text focus:outline-none focus:border-primary transition-colors placeholder:text-text-muted/40"
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
            placeholder="Enter resources (1-10)"
            onChange={e => {
              setLocalR(e.target.value);
              setErrorMsg("");
            }}
            className="w-full bg-background border border-border px-3 py-2 rounded text-text focus:outline-none focus:border-primary transition-colors placeholder:text-text-muted/40"
          />
        </div>
      </div>

      {errorMsg && <div className="text-error text-xs font-bold px-1">{errorMsg}</div>}
      
      <button 
        onClick={handleApply}
        className="glass-button w-full justify-center mt-2"
      >
        Apply Dimensions
      </button>

      <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border/50">
        <button 
          onClick={onGenerateSafeData}
          className="glass-button w-full justify-center text-sm border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
        >
          <ShieldCheck className="w-4 h-4 mr-1" />
          <span>Generate Safe Case</span>
        </button>
        <button 
          onClick={onGenerateUnsafeData}
          className="glass-button w-full justify-center text-sm border-red-500/30 text-red-400 hover:bg-red-500/10"
        >
          <ShieldAlert className="w-4 h-4 mr-1" />
          <span>Generate Unsafe Case</span>
        </button>
        <button 
          onClick={onGenerateRandomData}
          className="glass-button w-full justify-center text-sm border-primary/30 text-primary/80 hover:text-primary hover:bg-primary/10"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          <span>Generate Random Matrix</span>
        </button>
      </div>

    </div>
  );
};
