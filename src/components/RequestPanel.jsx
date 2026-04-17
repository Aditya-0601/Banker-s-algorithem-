import React, { useState } from 'react';
import { Send, Zap } from 'lucide-react';

export const RequestPanel = ({ numProcesses, numResources, onRequestSubmit }) => {
  const [selectedProcess, setSelectedProcess] = useState(0);
  const [requestVector, setRequestVector] = useState(Array(numResources).fill(0));

  const handleResourceChange = (idx, val) => {
    const newVector = [...requestVector];
    if (val === "") {
      newVector[idx] = "";
    } else {
      const parsed = parseInt(val);
      if (!isNaN(parsed)) {
        newVector[idx] = Math.max(0, parsed);
      }
    }
    setRequestVector(newVector);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanVector = requestVector.map(v => v === "" ? 0 : v);
    onRequestSubmit(selectedProcess, cleanVector);
  };

  // Ensure requestVector updates if numResources changes
  React.useEffect(() => {
    setRequestVector(Array(numResources).fill(0));
  }, [numResources]);

  return (
    <div className="glass-panel p-4 flex flex-col gap-4">
      <div className="flex items-center gap-2 border-b border-border/50 pb-2">
        <Zap className="w-5 h-5 text-yellow-400" />
        <h2 className="text-sm font-bold text-text uppercase tracking-wider">Resource Request</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs text-text-muted mb-1">Select Process</label>
          <select 
            value={selectedProcess}
            onChange={(e) => setSelectedProcess(parseInt(e.target.value))}
            className="w-full bg-background border border-border px-3 py-2 rounded text-text focus:outline-none focus:border-cyan-500 font-mono text-sm"
          >
            {Array(numProcesses).fill().map((_, i) => (
              <option key={i} value={i}>Process P{i}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-text-muted mb-1">Request Vector</label>
          <div className="flex gap-2">
            {requestVector.map((val, i) => (
              <div key={i} className="flex flex-col items-center flex-1">
                <span className="text-[10px] text-text-muted mb-1">{String.fromCharCode(65 + i)}</span>
                <input
                  type="number"
                  min="0"
                  value={val !== "" ? val : ""}
                  onChange={(e) => handleResourceChange(i, e.target.value)}
                  className="w-full bg-background border border-border px-2 py-1.5 rounded text-center text-text focus:outline-none focus:border-cyan-500 font-mono text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        <button 
          type="submit"
          className="glass-button w-full justify-center bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20"
        >
          <Send className="w-4 h-4 mr-2" />
          Submit Request
        </button>
      </form>
    </div>
  );
};
