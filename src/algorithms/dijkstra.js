export const dijkstraAlgorithm = (adjacencyMatrix, startNode, mode = "min") => {
  const n = adjacencyMatrix.length;
  const dist = new Array(n).fill(Infinity);
  const visited = new Array(n).fill(false);
  const idPaths = new Array(n).fill([]);

  dist[startNode] = 0;
  idPaths[startNode] = [startNode]; // Initialize the ID path for the start node

  for (let i = 0; i < n - 1; i++) {
    let u = -1;
    for (let j = 0; j < n; j++) {
      if (!visited[j] && (u === -1 || dist[j] < dist[u])) {
        u = j;
      }
    }
    visited[u] = true;
    for (let v = 0; v < n; v++) {
      if (adjacencyMatrix[u][v] !== 0) {
        const alt = dist[u] + adjacencyMatrix[u][v] * (mode === "min" ? 1 : -1);
        if (alt < dist[v]) {
          dist[v] = alt;
          idPaths[v] = idPaths[u].concat(v); // Update the ID path for node v
        }
      }
    }
  }
  const costs =
    mode === "min"
      ? dist
      : dist.map((x) => (x === Infinity || x === 0 ? x : -x));

  // console.table(costs);
  // console.table(idPaths);
  return { costs, idPaths };
};
