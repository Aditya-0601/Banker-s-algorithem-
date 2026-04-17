import React, { useState, useEffect, useRef } from 'react';
import { InputForm } from './components/InputForm';
import { GraphView } from './components/GraphView';
import { Timeline } from './components/Timeline';
import { StepExplanation } from './components/StepExplanation';
import { Dashboard } from './components/Dashboard';
import { RequestPanel } from './components/RequestPanel';
import { RequestQueue } from './components/RequestQueue';
import { Toaster } from './components/Toaster';
import { MetricsPanel } from './components/MetricsPanel';

import { generateSimulationSteps } from './lib/SimulationEngine';
import { 
  validateInput, 
  computeNeedMatrix, 
  generateSafeCase, 
  generateUnsafeCase, 
  processRequest, 
  evaluateSystemRisk 
} from './lib/algorithm';

import { ShieldCheck, DatabaseZap, PlaySquare, Bot, Save } from 'lucide-react';
import { cn } from './lib/utils';
import { MatrixTable } from './components/MatrixTable';

function App() {
  const [numProcesses, setNumProcesses] = useState(5);
  const [numResources, setNumResources] = useState(3);
  
  // 1. Centralized OS State
  const initialAlloc = [[0, 1, 0], [2, 0, 0], [3, 0, 2], [2, 1, 1], [0, 0, 2]];
  const initialMax = [[7, 5, 3], [3, 2, 2], [9, 0, 2], [2, 2, 2], [4, 3, 3]];
  const initialAvail = [3, 3, 2];
  
  const [osState, setOsState] = useState({
    allocation: initialAlloc,
    max: initialMax,
    available: initialAvail,
    need: computeNeedMatrix(initialAlloc, initialMax),
    work: [...initialAvail],
    finishedProcesses: Array(5).fill(false),
    safeSequence: [],
  });

  const osStateRef = useRef(osState);
  useEffect(() => {
    osStateRef.current = osState;
  }, [osState]);

  const isProcessingRef = useRef(false);

  const [editBuffer, setEditBuffer] = useState({
    allocation: osState.allocation,
    max: osState.max,
    available: osState.available
  });

  useEffect(() => {
    setEditBuffer({
      allocation: osState.allocation,
      max: osState.max,
      available: osState.available
    });
  }, [osState.allocation, osState.max, osState.available]);

  
  // Step Simulation State
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  // Real-time Event State
  const [requestQueue, setRequestQueue] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [metrics, setMetrics] = useState({ checks: 0, stepsExecuted: 0 });
  const [isAutoSimulating, setIsAutoSimulating] = useState(false);

  // --- LOGIC FUNCTIONS --- //

  const addToast = (type, message) => {
    setToasts(prev => {
      const newToasts = [...prev, {
        id: Date.now() + Math.random(),
        type,
        message,
        duration: 3500
      }];
      if (newToasts.length > 5) return newToasts.slice(newToasts.length - 5);
      return newToasts;
    });
  };

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  const resetState = (p, r, wipeLogs = true) => {
    const alloc = Array(p).fill().map(() => Array(r).fill(0));
    const mx = Array(p).fill().map(() => Array(r).fill(0));
    const avail = Array(r).fill(0);
    
    setOsState({
      allocation: alloc,
      max: mx,
      available: avail,
      need: computeNeedMatrix(alloc, mx),
      work: [...avail],
      finishedProcesses: Array(p).fill(false),
      safeSequence: []
    });
    setSteps([]);
    setCurrentStep(0);
    setIsAutoPlaying(false);
    setRequestQueue([]);
    if (wipeLogs) setToasts([]);
    setMetrics({ checks: 0, stepsExecuted: 0 });
    setIsAutoSimulating(false);
  };

  const handleDimensionsChange = (p, r) => {
    setNumProcesses(p);
    setNumResources(r);
    resetState(p, r);
    addToast('INFO', `System dimensions changed to ${p} processes and ${r} resources.`);
  };

  const loadExampleData = () => {
    setNumProcesses(5);
    setNumResources(3);
    const alloc = [[0, 1, 0], [2, 0, 0], [3, 0, 2], [2, 1, 1], [0, 0, 2]];
    const mx = [[7, 5, 3], [3, 2, 2], [9, 0, 2], [2, 2, 2], [4, 3, 3]];
    const avail = [3, 3, 2];
    
    setOsState({
      allocation: alloc, max: mx, available: avail,
      need: computeNeedMatrix(alloc, mx),
      work: [...avail],
      finishedProcesses: Array(5).fill(false),
      safeSequence: []
    });
    setSteps([]); setCurrentStep(0); setRequestQueue([]);
    setIsAutoPlaying(false); setIsAutoSimulating(false);
    addToast('INFO', 'Loaded Safe Example system state.');
  };

  const handleGenerateRandomData = () => {
    const p = numProcesses, r = numResources;
    const newMax = Array(p).fill().map(() => Array(r).fill().map(() => Math.floor(Math.random() * 10) + 1));
    const newAlloc = newMax.map(row => row.map(val => Math.floor(Math.random() * (val + 1))));
    const newAvail = Array(r).fill().map(() => Math.floor(Math.random() * 5) + 1);
    
    setOsState({
      allocation: newAlloc, max: newMax, available: newAvail,
      need: computeNeedMatrix(newAlloc, newMax),
      work: [...newAvail],
      finishedProcesses: Array(p).fill(false),
      safeSequence: []
    });
    setSteps([]); setCurrentStep(0); setIsAutoPlaying(false);
    addToast('INFO', 'Generated raw random matrix limits.');
  };

  const handleGenerateSafeData = () => {
    const data = generateSafeCase(numProcesses, numResources);
    setOsState({
      allocation: data.allocation, max: data.max, available: data.available,
      need: computeNeedMatrix(data.allocation, data.max),
      work: [...data.available],
      finishedProcesses: Array(numProcesses).fill(false),
      safeSequence: []
    });
    setSteps([]); setCurrentStep(0); setIsAutoPlaying(false);
    addToast('SUCCESS', 'Generated a guaranteed SAFE test case.');
  };

  const handleGenerateUnsafeData = () => {
    const data = generateUnsafeCase(numProcesses, numResources);
    setOsState({
      allocation: data.allocation, max: data.max, available: data.available,
      need: computeNeedMatrix(data.allocation, data.max),
      work: [...data.available],
      finishedProcesses: Array(numProcesses).fill(false),
      safeSequence: []
    });
    setSteps([]); setCurrentStep(0); setIsAutoPlaying(false);
    addToast('WARNING', 'Generated a guaranteed UNSAFE / Deadlocked test case.');
  };

  // Matrix Editing Syncing
  const applyMatrixChanges = () => {
     setOsState(prev => ({
        ...prev,
        allocation: editBuffer.allocation,
        max: editBuffer.max,
        available: editBuffer.available,
        need: computeNeedMatrix(editBuffer.allocation, editBuffer.max),
        work: [...editBuffer.available],
        finishedProcesses: Array(numProcesses).fill(false),
        safeSequence: []
     }));
     setSteps([]);
     setCurrentStep(0);
     addToast('INFO', 'User manually committed matrix changes to actual OS State.');
  };


  // Step Simulation Logic
  const handleSimulationStart = () => {
    const val = validateInput(osState.allocation, osState.max, osState.available);
    if (!val.valid) {
      alert(val.error);
      addToast('ERROR', val.error);
      return;
    }
    const result = generateSimulationSteps(osState.allocation, osState.max, osState.available);
    setSteps(result.steps);
    setCurrentStep(0);
    setMetrics(m => ({ ...m, stepsExecuted: m.stepsExecuted + result.steps.length, checks: m.checks + numProcesses }));
    addToast('INFO', 'Generated step-by-step resolution graph successfully.');
  };

  // Sync execution timeline manually to OS State and Logs!
  useEffect(() => {
     if (steps.length > 0 && currentStep >= 0 && currentStep < steps.length) {
         const step = steps[currentStep];
         
         // Bind core visualizer updates explicitly back to the centralized state
         setOsState(prev => ({
            ...prev,
            work: step.work ? [...step.work] : prev.work,
            finishedProcesses: step.finish ? [...step.finish] : prev.finishedProcesses,
            safeSequence: step.safeSequence ? [...step.safeSequence] : prev.safeSequence
         }));

         // Append precise execution logic output to log system
         if (step.bullets && step.bullets.length > 0) {
            const msg = Array.isArray(step.bullets) ? step.bullets.join(' ') : step.bullets;
            addToast('INFO', `${msg}`);
         }
     }
  }, [currentStep, steps]);

  // Replace fast-loop with Await-based async step execution (Promises)
  useEffect(() => {
     let active = true;
     const runPlay = async () => {
        while (active && isAutoPlaying && currentStep < steps.length - 1) {
           await new Promise(resolve => setTimeout(resolve, 800)); // async await delay
           if (!active || !isAutoPlaying) break;
           setCurrentStep(c => c + 1);
        }
        if (currentStep >= steps.length - 1) {
           setIsAutoPlaying(false);
        }
     };
     
     if (isAutoPlaying) {
        runPlay();
     }
     
     return () => { active = false; };
  }, [isAutoPlaying, currentStep, steps]);


  // Real-time operations
  const handleRequestSubmit = (processIdx, requestVector) => {
    setRequestQueue(prev => [...prev, {
      id: Date.now() + Math.random(),
      processIdx,
      requestVector
    }]);
    addToast('INFO', `Request submitted by P${processIdx}`);
  };

  const processNextRequestInQueue = () => {
    if (isProcessingRef.current || requestQueue.length === 0) return;
    
    isProcessingRef.current = true;
    const req = requestQueue[0];
    setRequestQueue(q => q.slice(1));
    
    addToast('INFO', `Evaluating queued request... P${req.processIdx}: [${req.requestVector.join(', ')}]`);
    
    const currentOs = osStateRef.current;
    const result = processRequest(currentOs.allocation, currentOs.max, currentOs.available, req.processIdx, req.requestVector);
    
    if (result.success) {
      addToast('SUCCESS', `✅ Request Granted — System remains SAFE`);
      setMetrics(m => ({ ...m, checks: m.checks + 1, stepsExecuted: m.stepsExecuted + 1 }));
      setSteps([]); 
      
      setOsState({
         ...currentOs,
         allocation: result.newAllocation,
         available: result.newAvailable,
         need: computeNeedMatrix(result.newAllocation, currentOs.max),
         work: [...result.newAvailable], 
         finishedProcesses: Array(numProcesses).fill(false),
         safeSequence: result.safeSequence || []
      });
    } else {
      addToast('ERROR', `❌ Request Denied — Unsafe State`);
      setMetrics(m => ({ ...m, checks: m.checks + 1 }));
    }
    
    setTimeout(() => {
      isProcessingRef.current = false;
    }, 400);
  };

  // Auto Simulator (Live Request Gen via timer loop sync)
  useEffect(() => {
    if (isAutoSimulating) {
       const timer = setTimeout(() => {
          if (requestQueue.length > 0) {
             processNextRequestInQueue();
          } else {
             const p = Math.floor(Math.random() * numProcesses);
             const n = osState.need[p];
             
             const isActive = osState.allocation[p].some(v => v > 0) || n.some(v => v > 0);
             if (isActive) {
               const req = n.map(nv => Math.floor(Math.random() * (nv + 1)));
               if (req.some(v => v > 0)) {
                 handleRequestSubmit(p, req);
               }
             }
          }
       }, 1000); // UI Async delay for requests
       return () => clearTimeout(timer);
    }
  }, [isAutoSimulating, requestQueue, osState]);


  // Live Calculations properly derived continuously from Central osState
  const activeStep = steps.length > 0 ? steps[currentStep] : null;
  const totalResources = osState.available.map((a, j) => a + osState.allocation.reduce((sum, process) => sum + process[j], 0));
  const allocatedResources = osState.available.map((a, j) => osState.allocation.reduce((sum, process) => sum + process[j], 0));
  const riskStatus = evaluateSystemRisk(osState.allocation, osState.max, osState.available);
  
  // Calculate specific Running vs Waiting Processes synced exactly to Execution Work 
  let running = 0, waiting = 0;
  for(let p=0; p < numProcesses; p++) {
    if (osState.finishedProcesses[p]) continue; // Removed from queue
    
    let hasResources = osState.allocation[p].some(v => v > 0) || osState.need[p].some(v => v > 0);
    if(hasResources) {
      let canSatisfy = true;
      for(let r=0; r < numResources; r++) {
         if(osState.need[p][r] > osState.work[r]) { canSatisfy = false; break; }
      }
      if (canSatisfy) running++;
      else waiting++;
    }
  }

  const totalAlloc = allocatedResources.reduce((a,b)=>a+b, 0);
  const totalTot = totalResources.reduce((a,b)=>a+b, 0);
  const utilPct = totalTot > 0 ? Math.round((totalAlloc / totalTot) * 100) : 0;

  return (
    <div className="h-screen text-text flex flex-col font-sans overflow-hidden" style={{ background: 'radial-gradient(circle at top, #052e2b, #020617)' }}>
      <Toaster toasts={toasts} removeToast={removeToast} />
      {/* Top Header Bar */}
      <header className="px-6 py-3 border-b border-border bg-surface/80 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-primary" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent tracking-wide">
            Banker's OS Simulator
          </h1>
        </div>
        <button
          onClick={() => setIsAutoSimulating(!isAutoSimulating)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 font-bold rounded-lg border transition-all duration-300 shadow-sm",
            isAutoSimulating ? "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20" : "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20"
          )}
        >
          <Bot className="w-5 h-5" />
          {isAutoSimulating ? "Stop Auto-Sim" : "Start Auto-Sim"}
        </button>
      </header>

      <Dashboard 
        totalResources={totalResources}
        allocatedResources={allocatedResources}
        availableResources={osState.available}
        runningProcesses={running}
        waitingProcesses={waiting}
        riskStatus={riskStatus}
      />

      {/* Main Workspace Grid */}
      <main className="flex-1 flex overflow-hidden p-4 gap-4">
        
        {/* Left Column: Configuration & State */}
        <div className="w-[30%] min-w-[350px] max-w-[450px] flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
          <InputForm 
            numProcesses={numProcesses}
            numResources={numResources}
            onDimensionsChange={handleDimensionsChange}
            onGenerateSafeData={handleGenerateSafeData}
            onGenerateUnsafeData={handleGenerateUnsafeData}
            onGenerateRandomData={handleGenerateRandomData}
            loadExampleData={loadExampleData}
          />
          
          <div className="glass-panel p-4 flex flex-col gap-4">
             <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <div className="flex items-center gap-2">
                <DatabaseZap className="w-5 h-5 text-primary" />
                <h2 className="text-sm font-bold text-text uppercase tracking-wider">System Matrices</h2>
              </div>
              <button 
                onClick={applyMatrixChanges}
                className="text-xs flex items-center gap-1 bg-primary/20 text-primary border border-primary/40 px-2 py-1 rounded hover:bg-primary/30 transition-colors"
                title="Commit edits into the actual OS system state"
              >
                <Save className="w-3 h-3" /> Apply Changes
              </button>
            </div>
            
            <MatrixTable 
              title="Allocation" 
              matrix={editBuffer.allocation} 
              colHeaders={Array(numResources).fill().map((_, i) => String.fromCharCode(65 + i))}
              editable={steps.length === 0}
              highlightRow={activeStep ? activeStep.processIdx : -1}
              onChange={(i, j, val) => {
                const newAlloc = editBuffer.allocation.map(r => [...r]);
                newAlloc[i][j] = parseInt(val) || 0;
                setEditBuffer(p => ({ ...p, allocation: newAlloc }));
              }}
            />
            <MatrixTable 
              title="Max Need" 
              matrix={editBuffer.max} 
              colHeaders={Array(numResources).fill().map((_, i) => String.fromCharCode(65 + i))}
              editable={steps.length === 0}
              highlightRow={activeStep ? activeStep.processIdx : -1}
              onChange={(i, j, val) => {
                const newMax = editBuffer.max.map(r => [...r]);
                newMax[i][j] = parseInt(val) || 0;
                setEditBuffer(p => ({ ...p, max: newMax }));
              }}
            />
            <MatrixTable 
              title="True System Need (Max - Alloc)" 
              matrix={osState.need} 
              colHeaders={Array(numResources).fill().map((_, i) => String.fromCharCode(65 + i))}
              editable={false}
              highlightRow={activeStep ? activeStep.processIdx : -1}
            />
             <MatrixTable 
              title="Available (Work)" 
              matrix={[editBuffer.available]} 
              rowHeaders={['Free']}
              colHeaders={Array(numResources).fill().map((_, i) => String.fromCharCode(65 + i))}
              editable={steps.length === 0}
              onChange={(i, j, val) => {
                const newAvail = [...editBuffer.available];
                newAvail[j] = parseInt(val) || 0;
                setEditBuffer(p => ({ ...p, available: newAvail }));
              }}
            />
          </div>
        </div>

        {/* Center Column: Visualizer & Timeline */}
        <div className="flex-1 flex flex-col min-w-[400px] h-full relative gap-4">
          
          {steps.length === 0 ? (
            <div className="flex-1 w-full glass-panel flex flex-col justify-center items-center opacity-80 gap-4 mb-20 relative overflow-hidden">
               {/* Background idle graphic */}
               <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
               <div className="w-24 h-24 rounded-full border-4 border-dashed border-primary/30 animate-spin-slow flex items-center justify-center bg-surface/50 z-10">
                 <ShieldCheck className="w-10 h-10 text-primary/50" />
               </div>
               <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent z-10 text-center">Safety Resolution Graph Standing By</h2>
               <p className="text-text-muted text-sm max-w-md text-center z-10">
                  Hit <b>Run Analytics Check</b> below to generate an exact safe sequence process resolution chart. Or, use the Real-Time Request Panel to simulate dynamic system requests instantly.
               </p>
               <button
                  onClick={handleSimulationStart}
                  className="mt-4 primary-button h-12 text-lg border border-primary/50 z-10 shadow-lg shadow-primary/20 hover:shadow-cyan-500/30"
                >
                  <PlaySquare className="w-5 h-5 mr-1" />
                  Run Analytics Check
               </button>
            </div>
          ) : (
            <div className="flex-1 relative w-full mb-20">
              <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none items-start z-10">
                <div className="glass-panel p-3 pointer-events-auto bg-surface/90 flex flex-col gap-2 shadow-lg">
                  <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Simulated Work Vector</span>
                  <div className="flex gap-2">
                    {osState.work.map((val, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <span className="text-[10px] text-text-muted">{String.fromCharCode(65 + idx)}</span>
                        <div key={`${idx}-${val}`} className="w-8 h-8 rounded bg-background border border-primary/30 flex items-center justify-center font-mono font-bold text-sm text-primary shadow-sm animate-[pulse_0.5s_ease-out]">
                          {val}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-panel p-3 pointer-events-auto bg-surface/90 flex flex-col gap-2 relative overflow-hidden min-w-[200px] shadow-lg">
                  <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Safe Sequence Path</span>
                  <div className="flex gap-2 items-center flex-wrap h-8">
                    {osState.safeSequence.length === 0 ? (
                      <span className="text-xs text-text-muted/50 italic">Evaluating...</span>
                    ) : (
                      osState.safeSequence.map((p, index) => (
                        <React.Fragment key={`seq-${index}`}>
                          {index > 0 && <span className="text-primary/50 text-xs">→</span>}
                          <div className="px-2 py-0.5 rounded bg-primary/20 text-primary font-mono border border-primary/50 text-xs shadow-sm animate-in fade-in slide-in-from-left-2 duration-300">
                             P{p}
                          </div>
                        </React.Fragment>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="absolute inset-0 bg-[#071110] border border-border/80 rounded-[16px] overflow-hidden">
                <GraphView 
                  stepData={activeStep} 
                  numProcesses={numProcesses} 
                  numResources={numResources}
                  defaultAllocation={osState.allocation}
                  defaultNeed={osState.max}
                />
              </div>

              <div className="absolute -bottom-20 left-0 right-0 z-20">
                <Timeline 
                  steps={steps}
                  currentStep={currentStep}
                  onJumpToStep={setCurrentStep}
                  isAutoPlaying={isAutoPlaying}
                  onAutoPlayToggle={() => setIsAutoPlaying(!isAutoPlaying)}
                  onNext={() => setCurrentStep(p => Math.min(steps.length - 1, p + 1))}
                  onPrev={() => setCurrentStep(p => Math.max(0, p - 1))}
                  onReset={() => {
                    setCurrentStep(0);
                    setIsAutoPlaying(false);
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Interaction & Diagnostics */}
        <div className="w-[30%] min-w-[300px] max-w-[400px] flex flex-col gap-4 overflow-hidden h-full pb-4">
           
           <div className="shrink-0 flex flex-col gap-4">
             <MetricsPanel checksCount={metrics.checks} executionSteps={metrics.stepsExecuted} utilizationPercent={utilPct} />
             <RequestPanel numProcesses={numProcesses} numResources={numResources} onRequestSubmit={handleRequestSubmit} />
           </div>

           <div className="flex flex-col gap-4 flex-1 min-h-0">
             <div className="flex-1 min-h-[120px]">
               <RequestQueue queue={requestQueue} processNext={processNextRequestInQueue} />
             </div>
             
             {steps.length > 0 && !isAutoSimulating && (
               <div className="flex-[0.6] min-h-[150px]">
                  <StepExplanation stepData={activeStep} numResources={numResources} />
               </div>
             )}
           </div>

        </div>

      </main>
    </div>
  );
}

export default App;
