/**
 * Computes the Need matrix.
 */
export const computeNeedMatrix = (allocation, max) => {
  return max.map((row, i) => row.map((val, j) => val - allocation[i][j]));
};

/**
 * Validates matrices dimensions and values.
 */
export const validateInput = (allocation, max, available) => {
  for (let i = 0; i < max.length; i++) {
    for (let j = 0; j < max[i].length; j++) {
      if (allocation[i][j] > max[i][j]) {
        return { valid: false, error: `Process ${i} Allocation cannot exceed Max for Resource ${String.fromCharCode(65 + j)}` };
      }
    }
  }
  return { valid: true };
};

/**
 * Runs the Banker's Safety Algorithm and generates step-by-step states.
 */
export const runSafetyAlgorithm = (allocation, max, available) => {
  const numProcesses = allocation.length;
  const numResources = available.length;
  const need = computeNeedMatrix(allocation, max);
  
  let work = [...available];
  let finish = Array(numProcesses).fill(false);
  
  let safeSequence = [];
  let steps = [];

  // Initial step
  steps.push({
    type: 'START',
    processIdx: null,
    work: [...work],
    finish: [...finish],
    safeSequence: [...safeSequence],
    need,
    message: "Starting Safety Algorithm. Initializing Work vector to Available resources.",
  });

  let count = 0;
  let deadlock = false;

  while (count < numProcesses) {
    let found = false;
    for (let p = 0; p < numProcesses; p++) {
      if (!finish[p]) {
        // Step: Evaluating this process
        steps.push({
          type: 'EVALUATING',
          processIdx: p,
          work: [...work],
          finish: [...finish],
          safeSequence: [...safeSequence],
          need,
          message: `Evaluating Process P${p}. Checking if Need(P${p}) <= Work.`,
        });

        // Check if all resources for this process can be allocated
        let canAllocate = true;
        for (let r = 0; r < numResources; r++) {
          if (need[p][r] > work[r]) {
            canAllocate = false;
            break;
          }
        }

        if (canAllocate) {
          // Process can be completed
          for (let r = 0; r < numResources; r++) {
            work[r] += allocation[p][r];
          }
          finish[p] = true;
          safeSequence.push(p);
          count++;
          found = true;

          steps.push({
            type: 'PROCESS_COMPLETED',
            processIdx: p,
            work: [...work],
            finish: [...finish],
            safeSequence: [...safeSequence],
            need,
            message: `Process P${p} completed. Need <= Work. Resources released back to Work vector.`,
          });
        } else {
          // Process has to wait
          steps.push({
            type: 'PROCESS_WAITING',
            processIdx: p,
            work: [...work],
            finish: [...finish],
            safeSequence: [...safeSequence],
            need,
            message: `Process P${p} wait. Need > Work for at least one resource.`,
          });
        }
      }
    }

    if (!found) {
      deadlock = true;
      break;
    }
  }

  if (deadlock) {
    steps.push({
      type: 'DEADLOCK',
      processIdx: null,
      work: [...work],
      finish: [...finish],
      safeSequence: [...safeSequence],
      need,
      message: "DEADLOCK DETECTED! Unable to find a safe sequence. System is in an unsafe state.",
    });
  } else {
    steps.push({
      type: 'SAFE_SEQUENCE',
      processIdx: null,
      work: [...work],
      finish: [...finish],
      safeSequence: [...safeSequence],
      need,
      message: `System is SAFE. Safe Sequence: <${safeSequence.map(p => `P${p}`).join(', ')}>`,
    });
  }

  return { steps, safeSequence, isSafe: !deadlock, need };
};

export const generateSafeCase = (numProcesses, numResources) => {
  let p = numProcesses;
  let r = numResources;
  let safe = false;
  let alloc, max, avail;
  
  while (!safe) {
    max = Array(p).fill().map(() => Array(r).fill().map(() => Math.floor(Math.random() * 10) + 1));
    alloc = max.map(row => row.map(val => Math.floor(Math.random() * (val + 1))));
    avail = Array(r).fill().map(() => Math.floor(Math.random() * 5) + 1);
    
    const { isSafe } = runSafetyAlgorithm(alloc, max, avail);
    if (isSafe) safe = true;
  }
  return { allocation: alloc, max, available: avail };
};

export const generateUnsafeCase = (numProcesses, numResources) => {
  let p = numProcesses;
  let r = numResources;
  let safe = true;
  let alloc, max, avail;
  
  while (safe) {
    max = Array(p).fill().map(() => Array(r).fill().map(() => Math.floor(Math.random() * 10) + 1));
    alloc = max.map(row => row.map(val => Math.floor(Math.random() * (val + 1))));
    avail = Array(r).fill().map(() => Math.floor(Math.random() * 2));
    
    const { isSafe } = runSafetyAlgorithm(alloc, max, avail);
    if (!isSafe) safe = false;
  }
  return { allocation: alloc, max, available: avail };
};

export const processRequest = (allocation, max, available, processIdx, requestVector) => {
  const p = processIdx;
  const need = computeNeedMatrix(allocation, max);
  
  for (let r = 0; r < requestVector.length; r++) {
    if (requestVector[r] > need[p][r]) {
      return { success: false, reason: `Request exceeds maximum needed resources.` };
    }
  }

  for (let r = 0; r < requestVector.length; r++) {
    if (requestVector[r] > available[r]) {
      return { success: false, reason: `Request exceeds available resources. Process must wait.` };
    }
  }

  let newAlloc = allocation.map(row => [...row]);
  let newAvail = [...available];
  
  for (let r = 0; r < requestVector.length; r++) {
    newAvail[r] -= requestVector[r];
    newAlloc[p][r] += requestVector[r];
  }

  const { isSafe, safeSequence } = runSafetyAlgorithm(newAlloc, max, newAvail);
  
  if (isSafe) {
    return { success: true, newAllocation: newAlloc, newAvailable: newAvail, reason: `Request granted. System is safe.`, safeSequence };
  } else {
    return { success: false, reason: `Request denied. Granting this request leads to an UNSAFE state.` };
  }
};

export const evaluateSystemRisk = (allocation, max, available) => {
  const { isSafe, need, steps } = runSafetyAlgorithm(allocation, max, available);
  if (!isSafe) return 'UNSAFE';

  let activeProcesses = 0;
  for (let p = 0; p < need.length; p++) {
    let hasResources = allocation[p].some(val => val > 0) || need[p].some(val => val > 0);
    if (hasResources) activeProcesses++;
  }

  let hasZeroAvailable = available.some(val => val === 0);
  if (hasZeroAvailable && activeProcesses > 1) {
    return 'RISK';
  }

  return 'SAFE';
};
