import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldX, Server, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

export const Dashboard = ({ 
  totalResources, 
  allocatedResources, 
  availableResources, 
  runningProcesses, 
  waitingProcesses, 
  riskStatus 
}) => {

  const riskConfig = {
    'SAFE': { icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/50', text: 'System Safe' },
    'RISK': { icon: ShieldAlert, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/50', text: 'At Risk' },
    'UNSAFE': { icon: ShieldX, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/50', text: 'Deadlocked' },
  };

  const RiskIcon = riskConfig[riskStatus]?.icon || ShieldCheck;
  const config = riskConfig[riskStatus] || riskConfig['SAFE'];

  return (
    <div className="flex gap-4 p-4 w-full border-b border-border bg-surfaceHighlight/50 shrink-0">
      
      {/* Risk Badge */}
      <div className={cn("flex flex-col items-center justify-center p-3 rounded-lg border min-w-[120px] transition-all duration-500", config.bg, config.border)}>
        <RiskIcon className={cn("w-8 h-8 mb-1", config.color)} />
        <span className={cn("text-xs font-bold tracking-wider uppercase", config.color)}>{config.text}</span>
      </div>

      {/* Stats Cards */}
      <div className="flex-1 grid grid-cols-5 gap-3">
        <StatCard icon={Server} title="Total Resources" valArray={totalResources} color="text-cyan-400" />
        <StatCard icon={CheckCircle2} title="Allocated" valArray={allocatedResources} color="text-blue-400" />
        <StatCard icon={CheckCircle2} title="Available" valArray={availableResources} color="text-emerald-400" />
        <SimpleStatCard title="Running Processes" value={runningProcesses} />
        <SimpleStatCard title="Waiting" value={waitingProcesses} color="text-yellow-500" />
      </div>

    </div>
  );
};

const StatCard = ({ icon: Icon, title, valArray, color }) => (
  <div className="glass-panel p-3 flex flex-col gap-1 justify-center relative overflow-hidden">
    <div className="flex items-center gap-2 mb-1 opacity-70">
      <Icon className="w-3 h-3" />
      <span className="text-[10px] uppercase font-bold tracking-widest">{title}</span>
    </div>
    <div className="flex gap-1 items-center font-mono">
      {valArray.map((v, i) => (
        <React.Fragment key={i}>
          <span className={cn("font-bold", color)}>{v}</span>
          {i < valArray.length - 1 && <span className="text-text-muted/30">|</span>}
        </React.Fragment>
      ))}
    </div>
  </div>
);

const SimpleStatCard = ({ title, value, color="text-text" }) => (
  <div className="glass-panel p-3 flex flex-col gap-1 justify-center relative overflow-hidden">
    <div className="flex items-center gap-2 mb-1 opacity-70">
      <span className="text-[10px] uppercase font-bold tracking-widest">{title}</span>
    </div>
    <span className={cn("font-mono text-xl font-bold", color)}>{value}</span>
  </div>
);
