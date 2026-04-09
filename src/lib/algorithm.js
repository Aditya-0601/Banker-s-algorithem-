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
