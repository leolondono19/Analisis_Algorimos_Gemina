export const kruskalAlgorithm = (adjacencyMatrix, mode = "min") => {
  const numVertices = adjacencyMatrix.length;
  const edges = [];

  // Create a list of all edges in the graph
  for (let i = 0; i < numVertices; i++) {
    for (let j = i + 1; j < numVertices; j++) {
      if (adjacencyMatrix[i][j] !== 0) {
        edges.push([i, j, adjacencyMatrix[i][j]]);
      }
    }
  }

  // Sort edges by weight
  if (mode === "min") {
    edges.sort((a, b) => a[2] - b[2]);
  } else if (mode === "max") {
    edges.sort((a, b) => b[2] - a[2]);
  } else {
    throw new Error(`Invalid mode: ${mode}`);
  }

  const parent = new Array(numVertices).fill(-1);
  const result = [];

  let numEdges = 0;
  let i = 0;

  // Loop until we have numVertices - 1 edges or all edges have been processed
  while (numEdges < numVertices - 1 && i < edges.length) {
    const [u, v, weight] = edges[i];

    const setU = find(parent, u);
    const setV = find(parent, v);

    // If including this edge does not cause a cycle, include it
    if (setU !== setV) {
      result.push([u, v, weight]);
      union(parent, setU, setV);
      numEdges++;
    }

    i++;
  }

  return result;
};

const find = (parent, vertex) => {
  if (parent[vertex] === -1) {
    return vertex;
  }

  return find(parent, parent[vertex]);
};

const union = (parent, u, v) => {
  const setU = find(parent, u);
  const setV = find(parent, v);

  parent[setU] = setV;
};