import { computeNeedMatrix } from './algorithm';

export const generateSimulationSteps = (allocation, max, available) => {
  const numProcesses = allocation.length;
  const numResources = available.length;
  const need = computeNeedMatrix(allocation, max);
  
  let work = [...available];
  let finish = Array(numProcesses).fill(false);
  
  let safeSequence = [];
  let steps = [];

  // Snapshot helper to ensure deep copies at the exact moment
  const captureState = (type, processIdx, bullets, extra = {}) => {
    steps.push({
      type,
      processIdx,
      work: [...work],
      finish: [...finish],
      safeSequence: [...safeSequence],
      need: need.map(row => [...row]),
      allocation: allocation.map(row => [...row]),
      max: max.map(row => [...row]),
      bullets: bullets,
      ...extra
    });
  };

  captureState('START', null, [
    "Simulation started",
    "Work vector initialized to Available"
  ]);

  let count = 0;
  let deadlock = false;
  let cycle = 0;

  while (count < numProcesses) {
    let found = false;
    cycle++;
    
    // Safety break for infinite loops in case of bug
    if (cycle > numProcesses * 3) {
      deadlock = true;
      break;
    }

    for (let p = 0; p < numProcesses; p++) {
      if (!finish[p]) {
        captureState('EVALUATING', p, [
          `Checking Process P${p}`,
          `Need ≤ Work ?`
        ]);

        let canAllocate = true;
        for (let r = 0; r < numResources; r++) {
          if (need[p][r] > work[r]) {
            canAllocate = false;
            break;
          }
        }

        if (canAllocate) {
          captureState('EXECUTING', p, [
            `Need for P${p} ≤ Work`,
            `Simulating execution`
          ]);
          
          captureState('RELEASING', p, [
            `P${p} completes execution`,
            `Resources released to Work`
          ]);
          // Release resources back to work vector
          for (let r = 0; r < numResources; r++) {
            work[r] += allocation[p][r];
          }
          
          finish[p] = true;
          safeSequence.push(p);
          count++;
          found = true;

          captureState('FINISHED', p, [
            `P${p} marked as Finished`
          ]);
        } else {
          captureState('WAITING', p, [
            `Need > Work`,
            `P${p} must wait`
          ]);
        }
      }
    }

    if (!found) {
      deadlock = true;
      break;
    }
  }

  if (deadlock) {
    captureState('DEADLOCK', null, [
      "Deadlock DETECTED!",
      "No process can proceed",
      "System in UNSAFE state"
    ]);
  } else {
    captureState('SAFE_SEQUENCE_FOUND', null, [
      "Simulation Successful!",
      "System is in Safe State"
    ]);
  }

  return { steps, safeSequence, isSafe: !deadlock };
};
