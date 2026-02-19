export const johnsonAlgorithm = (adjacencyMatrix) => {
  const n = adjacencyMatrix.length; // number of nodes
  const earlyTimes = new Array(n).fill(0); // early times
  const lateTimes = new Array(n).fill(0); // late times
  const slacks = new Array(n).fill(null).map(() => new Array(n).fill(null)); // slacks

  // Calculate early times
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (adjacencyMatrix[i][j] !== 0) {
        earlyTimes[j] = Math.max(
          earlyTimes[j],
          earlyTimes[i] + adjacencyMatrix[i][j]
        );
      }
    }
  }

  // Calculate late times
  for (let i = n - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (adjacencyMatrix[i][j] !== 0) {
        if (lateTimes[j] === 0) {
          lateTimes[j] = earlyTimes[j];
        }
        lateTimes[i] = Math.min(
          lateTimes[i] === 0
            ? lateTimes[j] - adjacencyMatrix[i][j]
            : lateTimes[i],
          lateTimes[j] - adjacencyMatrix[i][j]
        );
      }
    }
  }

  // Calculate slacks
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (adjacencyMatrix[i][j] !== 0) {
        slacks[i][j] = lateTimes[j] - earlyTimes[i] - adjacencyMatrix[i][j];
      }
    }
  }

  // Return slacks and times as a matrix and vectors, respectively
  return { slacks, earlyTimes, lateTimes };
};
