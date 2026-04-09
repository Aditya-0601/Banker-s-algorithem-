import React, { useState, useEffect, useRef } from 'react';
import { InputForm } from './components/InputForm';
import { GraphView } from './components/GraphView';
import { Timeline } from './components/Timeline';
import { StepExplanation } from './components/StepExplanation';
import { generateSimulationSteps } from './lib/SimulationEngine';
import { validateInput } from './lib/algorithm';
import { ShieldCheck, DatabaseZap, PlaySquare } from 'lucide-react';
import { cn } from './lib/utils';
import { MatrixTable } from './components/MatrixTable';

function App() {
  const [numProcesses, setNumProcesses] = useState(5);
  const [numResources, setNumResources] = useState(3);
  
  // Matrices state
  const [allocation, setAllocation] = useState(
    [[0, 1, 0], [2, 0, 0], [3, 0, 2], [2, 1, 1], [0, 0, 2]]
  );
  const [max, setMax] = useState(
    [[7, 5, 3], [3, 2, 2], [9, 0, 2], [2, 2, 2], [4, 3, 3]]
  );
  const [available, setAvailable] = useState([3, 3, 2]);
  
  // Simulation State
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const autoPlayTimerRef = useRef(null);

  const resetMatrices = (p, r) => {
    setAllocation(Array(p).fill().map(() => Array(r).fill(0)));
    setMax(Array(p).fill().map(() => Array(r).fill(0)));
    setAvailable(Array(r).fill(0));
    setSteps([]);
    setCurrentStep(0);
    setIsAutoPlaying(false);
  };

  const handleDimensionsChange = (p, r) => {
    setNumProcesses(p);
    setNumResources(r);
    resetMatrices(p, r);
  };

  const loadExampleData = () => {
    setNumProcesses(5);
    setNumResources(3);
    setAllocation([[0, 1, 0], [2, 0, 0], [3, 0, 2], [2, 1, 1], [0, 0, 2]]);
    setMax([[7, 5, 3], [3, 2, 2], [9, 0, 2], [2, 2, 2], [4, 3, 3]]);
    setAvailable([3, 3, 2]);
    setSteps([]);
    setCurrentStep(0);
    setIsAutoPlaying(false);
  };

  const generateRandomData = () => {
    const p = numProcesses;
    const r = numResources;
    const newMax = Array(p).fill().map(() => Array(r).fill().map(() => Math.floor(Math.random() * 10) + 1));
    const newAlloc = newMax.map(row => row.map(val => Math.floor(Math.random() * (val + 1))));
    const newAvail = Array(r).fill().map(() => Math.floor(Math.random() * 5) + 1);
    
    setAllocation(newAlloc);
    setMax(newMax);
    setAvailable(newAvail);
    setSteps([]);
    setCurrentStep(0);
    setIsAutoPlaying(false);
  };

  const handleSimulationStart = () => {
    const val = validateInput(allocation, max, available);
    if (!val.valid) {
      alert(val.error);
      return;
    }
    const result = generateSimulationSteps(allocation, max, available);
    setSteps(result.steps);
    setCurrentStep(0);
  };

  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayTimerRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) {
            setIsAutoPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2000);
    } else {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    }
    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isAutoPlaying, steps.length]);

  const activeStep = steps.length > 0 ? steps[currentStep] : null;

  return (
    <div className="h-screen text-text flex flex-col font-sans overflow-hidden" style={{ background: 'radial-gradient(circle at top, #052e2b, #020617)' }}>
      
      {/* Top Header Bar */}
      <header className="px-6 py-3 border-b border-border bg-surface/50 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-primary" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent tracking-wide">
            Banker's Simulator
          </h1>
        </div>
      </header>

      {/* 3-Panel Main Workspace */}
      <main className="flex-1 flex overflow-hidden p-4 gap-4">
        
        {/* L1: Left Panel - Input & Controls */}
        <div className="w-[30%] min-w-[350px] max-w-[450px] flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
          
          <InputForm 
            numProcesses={numProcesses}
            numResources={numResources}
            onDimensionsChange={handleDimensionsChange}
            generateRandomData={generateRandomData}
            loadExampleData={loadExampleData}
          />
          
          <div className="glass-panel p-4 flex flex-col gap-4">
             <div className="flex items-center gap-2 border-b border-border/50 pb-2">
              <DatabaseZap className="w-5 h-5 text-primary" />
              <h2 className="text-sm font-bold text-text uppercase tracking-wider">Matrices</h2>
            </div>
            
            <MatrixTable 
              title="Allocation" 
              matrix={allocation} 
              colHeaders={Array(numResources).fill().map((_, i) => String.fromCharCode(65 + i))}
              editable={steps.length === 0}
              highlightRow={activeStep ? activeStep.processIdx : -1}
              onChange={(i, j, val) => {
                const newAlloc = [...allocation];
                newAlloc[i] = [...newAlloc[i]];
                newAlloc[i][j] = val;
                setAllocation(newAlloc);
                setSteps([]);
              }}
            />
            <MatrixTable 
              title="Max" 
              matrix={max} 
              colHeaders={Array(numResources).fill().map((_, i) => String.fromCharCode(65 + i))}
              editable={steps.length === 0}
              highlightRow={activeStep ? activeStep.processIdx : -1}
              onChange={(i, j, val) => {
                const newMax = [...max];
                newMax[i] = [...newMax[i]];
                newMax[i][j] = val;
                setMax(newMax);
                setSteps([]);
              }}
            />
             <MatrixTable 
              title="Available" 
              matrix={[available]} 
              rowHeaders={['Work']}
              colHeaders={Array(numResources).fill().map((_, i) => String.fromCharCode(65 + i))}
              editable={steps.length === 0}
              onChange={(i, j, val) => {
                const newAvail = [...available];
                newAvail[j] = val;
                setAvailable(newAvail);
                setSteps([]);
              }}
            />
            
            <button
              onClick={handleSimulationStart}
              className="primary-button w-full h-12 text-lg border border-primary/50 mt-2"
            >
              <PlaySquare className="w-5 h-5 mr-1" />
              Run Simulation
            </button>
          </div>
        </div>

        {/* L2: Center Panel - Visual Graph */}
        <div className="flex-1 flex flex-col min-w-[500px] h-full relative">
          {steps.length === 0 ? (
            <div className="w-full h-full glass-panel flex flex-col justify-center items-center opacity-80 gap-4">
              <div className="w-24 h-24 rounded-full border-4 border-dashed border-primary/30 animate-spin-slow flex items-center justify-center">
                <ShieldCheck className="w-10 h-10 text-primary/50" />
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Configure & Run to enable Visualizer</h2>
              <p className="text-text-muted text-sm max-w-sm text-center">Set up your matrices on the left and hit the "Run Simulation" button to watch the process resolution graph come alive.</p>
            </div>
          ) : (
            <>
              <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none items-start z-10">
                {/* Visual Work Vector */}
                <div className="glass-panel p-3 pointer-events-auto bg-surface/90 flex flex-col gap-2">
                  <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Work Vector</span>
                  <div className="flex gap-2">
                    {activeStep?.work?.map((val, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <span className="text-[10px] text-text-muted">{String.fromCharCode(65 + idx)}</span>
                        <div key={`${idx}-${val}`} className="w-8 h-8 rounded bg-background border border-primary/30 flex items-center justify-center font-mono font-bold text-sm text-primary shadow-sm animate-[pulse_0.5s_ease-out]">
                          {val}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Animated Safe Sequence */}
                <div className="glass-panel p-3 pointer-events-auto bg-surface/90 flex flex-col gap-2 relative overflow-hidden min-w-[200px]">
                  <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Safe Sequence</span>
                  <div className="flex gap-2 items-center flex-wrap h-8">
                    {activeStep?.safeSequence?.length === 0 ? (
                      <span className="text-xs text-text-muted/50 italic">None</span>
                    ) : (
                      activeStep?.safeSequence?.map((p, index) => (
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

              <div className="absolute inset-0 top-[70px] bottom-[90px] left-4 right-4 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-[16px] p-[20px]">
                <GraphView 
                  stepData={activeStep} 
                  numProcesses={numProcesses} 
                  numResources={numResources}
                  defaultAllocation={allocation}
                  defaultNeed={max}
                />
              </div>
              <div className="absolute bottom-6 left-0 right-0 px-4">
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
            </>
          )}
        </div>

        {/* L3: Right Panel - Explanation Engine */}
        <div className="w-[25%] min-w-[300px] max-w-[400px]">
           {steps.length > 0 ? (
             <StepExplanation stepData={activeStep} numResources={numResources} />
           ) : (
             <div className="glass-panel w-full h-full flex flex-col p-6 border-dashed opacity-50 justify-center text-center">
                <h3 className="text-lg text-primary font-bold mb-2">Awaiting Context</h3>
                <p className="text-sm text-text-muted">The Explanation Engine will provide precise analytical context for every algorithm decision here once the simulation begins.</p>
             </div>
           )}
        </div>

      </main>
    </div>
  );
}

export default App;
