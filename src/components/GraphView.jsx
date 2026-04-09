import React, { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Custom Nodes could be used if we need complex HTML inside the node, 
// but default nodes with custom styling via style prop or classNames often suffice for shapes.
// To ensure circles and squares, we apply border-radius in styling.

export const GraphView = ({ stepData, numProcesses, numResources, defaultAllocation, defaultNeed }) => {
  
  // Extract matrices dynamically from step or fallback to initial
  const allocMatrix = stepData?.allocation || defaultAllocation;
  const needMatrix = stepData?.need || defaultNeed;
  const activeProcessIdx = stepData?.processIdx !== undefined ? stepData.processIdx : null;
  const stepType = stepData?.type;
  const finish = stepData?.finish || Array(numProcesses).fill(false);

  const { nodes, edges } = useMemo(() => {
    const newNodes = [];
    const newEdges = [];

    const pSpacing = 100;
    const rSpacing = 120;
    const leftX = 100;
    const rightX = 400;

    // 1. Create Process Nodes (Left Column, Circular)
    for (let p = 0; p < numProcesses; p++) {
      const isFinished = finish[p];
      const isEvaluating = p === activeProcessIdx && stepType === 'EVALUATING';
      const isExecuting = p === activeProcessIdx && stepType === 'EXECUTING';
      const isReleasing = p === activeProcessIdx && stepType === 'RELEASING';
      const isBlocked = p === activeProcessIdx && stepType === 'WAITING';

      let bgClass = "bg-[#0f172a] border-border text-[#e5e7eb]";
      // Active / Evaluating
      if (isEvaluating || isExecuting || isReleasing) bgClass = "bg-[#0f172a] border-[#facc15] text-[#e5e7eb] shadow-[0_0_15px_-3px_rgba(250,204,21,0.4)]";
      // Completed
      else if (isFinished) bgClass = "bg-[#0f172a] border-[#22c55e] text-[#e5e7eb] shadow-[0_0_10px_-2px_rgba(34,197,94,0.3)]";
      // Blocked / Deadlock
      else if (isBlocked || (stepType === 'DEADLOCK' && !isFinished)) bgClass = "bg-[#0f172a] border-[#ef4444] text-[#e5e7eb]";

      newNodes.push({
        id: `P${p}`,
        position: { x: leftX, y: 50 + p * pSpacing },
        data: { label: `P${p}` },
        className: `w-14 h-14 rounded-xl flex items-center justify-center font-bold font-mono border transition-all duration-300 text-lg opacity-100 ${bgClass}`,
        sourcePosition: 'right',
        targetPosition: 'right',
      });
    }

    // 2. Create Resource Nodes (Right Column, Square)
    for (let r = 0; r < numResources; r++) {
      newNodes.push({
        id: `R${r}`,
        position: { x: rightX, y: 50 + r * rSpacing },
        data: { 
          label: (
            <div className="flex flex-col items-center leading-tight w-full">
              <span className="text-xl font-bold opacity-100 leading-none mb-1">{String.fromCharCode(65 + r)}</span>
              {stepData?.work !== undefined && <span className="text-xs text-[#9ca3af] font-normal tracking-wide">Work: {stepData.work[r]}</span>}
            </div>
          ) 
        },
        className: `w-20 h-16 rounded-xl flex flex-col items-center justify-center font-bold border bg-[#0f172a] border-[#22c55e] text-[#e5e7eb] opacity-100 shadow-[0_0_10px_-2px_rgba(34,197,94,0.2)]`,
        sourcePosition: 'left',
        targetPosition: 'left',
      });
    }

    // 3. Create Edges
    if (allocMatrix && needMatrix && activeProcessIdx !== null) {
      const p = activeProcessIdx;
      for (let r = 0; r < numResources; r++) {
        const isActivelyEvaluating = p === activeProcessIdx;
        const isReleasingNow = stepType === 'RELEASING';
        const isExecutingNow = stepType === 'EXECUTING';

        // Allocation Edge (Only shown during RELEASING, visually returning resources)
        const allocated = allocMatrix[p][r];
        if (allocated > 0 && isReleasingNow) {
          newEdges.push({
            id: `E_A_P${p}_R${r}`,
            source: `P${p}`, // Switch direction so it shows Process giving it back to Resource visually
            target: `R${r}`,
            type: 'straight',
            animated: true,
            style: { 
              stroke: '#10b981', 
              strokeWidth: 3, 
              opacity: 0.9
            },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
          });
        }

        // Need Edge (Shown during EVALUATING, WAITING, and EXECUTING)
        const needed = needMatrix[p][r];
        if (needed > 0 && (stepType === 'EVALUATING' || stepType === 'WAITING' || stepType === 'EXECUTING')) {
          let edgeColor = '#f59e0b'; // Yellow for checking/executing
          if (stepType === 'WAITING') edgeColor = '#ef4444'; // Red if blocked
          if (stepType === 'EXECUTING') edgeColor = '#10b981'; // Green if verified and acting

          newEdges.push({
            id: `E_N_P${p}_R${r}`,
            source: `R${r}`,
            target: `P${p}`,
            type: 'straight',
            animated: stepType !== 'WAITING',
            style: { 
              stroke: edgeColor, 
              strokeWidth: 2,
              strokeDasharray: '4,4',
              opacity: stepType === 'WAITING' ? 0.7 : 1
            },
            markerEnd: { type: MarkerType.ArrowClosed, color: edgeColor },
          });
        }
      }
    }

    return { nodes: newNodes, edges: newEdges };
  }, [allocMatrix, needMatrix, activeProcessIdx, stepType, finish, numProcesses, numResources]);

  return (
    <div className="w-full h-full glass-panel overflow-hidden">
      <ReactFlow 
        nodes={nodes} 
        edges={edges} 
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.5}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }} // standard to clean up UI for a dashboard
        className="bg-transparent"
      >
        <Background gap={16} color="rgba(16, 185, 129, 0.05)" />
        <Controls showInteractive={false} className="bg-surface border-border fill-primary" />
      </ReactFlow>
    </div>
  );
};
