import React from 'react';
import { Activity, Cpu, Layers } from 'lucide-react';
import { cn } from '../lib/utils';

export const MetricsPanel = ({ checksCount, executionSteps, utilizationPercent }) => {
  return (
    <div className="glass-panel p-4 flex flex-col gap-3 border-cyan-500/20 bg-surface/50">
      <div className="flex items-center gap-2 border-b border-border/50 pb-2">
        <Activity className="w-4 h-4 text-cyan-400" />
        <h2 className="text-xs font-bold text-text uppercase tracking-wider">Performance Metrics</h2>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <MetricCard icon={Activity} label="Safety Checks" value={checksCount} />
        <MetricCard icon={Layers} label="Steps Executed" value={executionSteps} />
        
        {/* Utilization Gauge-like card */}
        <div className="flex flex-col gap-1 items-center justify-center bg-background/50 border border-border p-2 rounded relative overflow-hidden">
          <span className="text-[9px] uppercase text-text-muted font-bold tracking-wider z-10 w-full text-center">Util %</span>
          <span className="font-mono font-bold text-emerald-400 z-10">{utilizationPercent}%</span>
          {/* Progress background */}
          <div 
            className="absolute bottom-0 left-0 right-0 bg-emerald-500/10 z-0 transition-all duration-500" 
            style={{ height: `${utilizationPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ icon: Icon, label, value }) => (
  <div className="flex flex-col items-center justify-center bg-background/50 border border-border p-2 rounded">
    <span className="text-[9px] uppercase text-text-muted font-bold tracking-wider text-center">{label}</span>
    <span className="font-mono font-bold text-white mt-1">{value}</span>
  </div>
);
