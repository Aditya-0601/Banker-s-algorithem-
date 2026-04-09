import React from 'react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

export const MatrixTable = ({ 
  title, 
  matrix, 
  colHeaders, 
  rowHeaders, 
  highlightRow = -1, 
  editable = false,
  onChange = null,
  cellStatus = null // function(rowIndex, colIndex) => returns color/class
}) => {
  return (
    <div className="glass-panel p-4 flex flex-col items-center">
      <h3 className="text-primary font-bold mb-3 tracking-wider">{title}</h3>
      <div className="overflow-x-auto">
        <table className="border-collapse">
          <thead>
            <tr>
              <th className="p-2 border-b border-border text-text-muted font-mono text-sm"></th>
              {colHeaders?.map((col, i) => (
                <th key={i} className="p-2 border-b border-border text-primary font-mono text-sm">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => (
              <motion.tr 
                key={i}
                animate={{
                  backgroundColor: highlightRow === i ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                  borderColor: highlightRow === i ? '#10b981' : 'transparent',
                }}
                className={cn(
                  "border-b border-border/30 transition-colors duration-300",
                  highlightRow === i ? "border-l-2 border-l-primary" : "border-l-2 border-l-transparent"
                )}
              >
                <td className="p-2 font-mono text-sm text-text-muted border-r border-border/30">
                  {rowHeaders ? rowHeaders[i] : `P${i}`}
                </td>
                {row.map((val, j) => {
                  const customClass = cellStatus ? cellStatus(i, j) : "";
                  return (
                    <td key={j} className="p-1">
                      {editable ? (
                        <input
                          type="text"
                          value={val}
                          placeholder="0"
                          onChange={(e) => {
                            const raw = e.target.value;
                            if (raw === "" || /^\d+$/.test(raw)) {
                              onChange(i, j, raw);
                            }
                          }}
                          className="matrix-input w-10 h-10 sm:w-12 sm:h-12 text-center text-base font-bold bg-[#0f172a] focus:bg-[#08170d] focus:ring-2 focus:ring-[#10b981] transition-all rounded shadow-sm"
                        />
                      ) : (
                        <div className={cn(
                          "w-10 h-10 sm:w-12 flex items-center justify-center font-mono text-sm rounded bg-background/50 border border-border",
                          customClass
                        )}>
                          {val}
                        </div>
                      )}
                    </td>
                  );
                })}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
