import React, { useEffect } from 'react';

// Debug component to track re-renders
export const RenderTracker: React.FC<{ name: string; deps?: any[] }> = ({ name, deps = [] }) => {
  const renderCount = React.useRef(0);
  const prevDeps = React.useRef(deps);
  
  useEffect(() => {
    renderCount.current += 1;
    
    const changed = deps.some((dep, i) => dep !== prevDeps.current[i]);
    if (changed || renderCount.current === 1) {
      console.log(`🔄 ${name} rendered #${renderCount.current}`, {
        changed,
        deps,
        prevDeps: prevDeps.current
      });
    }
    
    prevDeps.current = deps;
  });

  return null;
};

export default RenderTracker;