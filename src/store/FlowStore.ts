import { create } from "zustand";
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
} from "reactflow";
import { v4 as uuidv4 } from 'uuid'; // Importar la biblioteca uuid

type RFState = {
  deletePersona: Boolean;
  adjacencyMatrix: number[][];
  assignationMatrix: number[][];
  totalCost: string;
  posMatrix: number[][];
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
};

const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;

// this is our useStore hook that we can use in our components to get parts of the store and call actions
const useStore = create<RFState>((set, get) => ({
  /*
   * Enables the user to eliminate nodes and edges.
   */
  deletePersona: false,

  /*
   * Switches the deletePersona.
   * @returns new state of deletePersona.
   */
  toggleDeletePersona: () =>
    set((state) => ({ deletePersona: !state.deletePersona })),

  /*
   * Adjacency matrix state variable.
   */
  adjacencyMatrix: [],

  /*
   * Sets adjacencyMatrix state variable to the given matrix.
   * @param matrix: number[][] the matrix to set.
   * @returns new state of adjacencyMatrix.
   */
  setAdjacencyMatrix: (adjacencyMatrix: number[][]) =>
    set({ adjacencyMatrix: adjacencyMatrix }),

  /*
   * Assignation matrix state variable.
   */
  assignationMatrix: [],

  /*
   * Sets assignationMatrix state variable to the given matrix.
   * @param matrix: number[][] the matrix to set.
   * @returns new state of assignationMatrix.
   */
  setAssignationMatrix: (assignationMatrix: number[][]) =>
    set({ assignationMatrix: assignationMatrix }),

  //Pos matrix
  // TODO: Change to a more descriptive name and document code
  posMatrix: [],
  setPosMatrix: (posMatrix: number[][]) => set({ posMatrix: posMatrix }),

  // total cost
  // TODO: Change to a more descriptive name and document code
  totalCost: "",
  setTotalCost: (totalCost: string) => set({ totalCost: totalCost }),

  /*
   * Nodes state variable.
   */
  nodes: [],

  /*
   * Adds a node to the nodes state variable.
   * @returns new state of nodes.
   */
  addNode: () => {
    const nodes = get().nodes;

    const label = prompt("Introduzca la etiqueta del nodo:");
    if (label === null || label.length === 0) {
      alert("La etiqueta no puede estar vacía");
      return;
    }

    const nodeExists = nodes.find((node) => node.data.label === label);
    if (nodeExists) {
      alert("Ya existe un nodo con esa etiqueta, intenta con otra.");
      return;
    }

    const newNode = {
      id: nodes.length.toString(),
      handleId: nodes.length.toString(),
      type: "graph-node-start",
      data: { label: label },
      position: { x: screenWidth / 2, y: screenHeight / 2 },
    };
    set({ nodes: [...nodes, newNode] });
  },

  /*
   * Deletes a node from the nodes state variable.
   * @param nodeId: String the id of the node to delete.
   * @returns new state of nodes without the deleted node.
   */
  deleteNode: (nodeId: string) => {
    const newNodes = get().nodes.filter((node) => node.id !== nodeId);
    const newEdges = get().edges.filter(
      (edge) => edge.source !== nodeId && edge.target !== nodeId
    );
    // Remap the ids in the new nodes
    const idMap = newNodes.map((node, index) => {
      return { oldId: node.id, newId: index.toString() };
    });

    newNodes.forEach((node, index) => {
      node.id = index.toString();
    });
    newEdges.forEach((edge) => {
      const sourceId = idMap.find((id) => id.oldId === edge.source);
      const targetId = idMap.find((id) => id.oldId === edge.target);
      edge.source = sourceId?.newId || "";
      edge.target = targetId?.newId || "";
    });
    set({ nodes: newNodes, edges: newEdges});
  },

  /*
   * Sets nodes state variable to the given nodes.
   * @param nodes: Node[] the nodes to set.
   * @returns new state of nodes.
   */
  setNodes: (nodes: Node[]) => set({ nodes: nodes }),

  /*
   * Updates the nodes when a change is made.
   * @param nodeChanges: NodeChange[] the changes to apply.
   * @returns new state of nodes.
   */
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  /*
   * Edges state variable.
   */
  edges: [],

  /*
   * Modifies weight of an edge.
   * @param edgeId: String id of the edge to modify.
   * @returns The state of the edges with the modified edge on its corresponding edgeId.
   */
  setWeight: (edgeId: String) => {
    const weight = prompt("Introduzca el peso de la arista:"); // prompt user for weight
    if (weight === null || weight.length === 0) {
      alert("El peso no puede estar vacío");
      return;
    }
    // Validate if weight is a number
    if (isNaN(Number(weight))) {
      alert("El peso debe ser un número");
      return;
    }

    const newEdges = get().edges.map((edge: Edge) => {
      // iterate over edges and update weight if edgeId matches
      if (edge.id === edgeId) {
        edge.data.weight = weight;
      }
      return edge;
    });
    set({ edges: newEdges });
  },

  /*
   * Sets the edges of the graph.
   * @param edgeId: Edge[] id of the edge to delete.
   * @returns The state of the edges with the deleted edge.
   */
  setEdges: (edges: Edge[]) => set({ edges: edges }),

  /*
    * Adds an edge to the graph.
    * @param connection: Connection connection to add.
    * @returns The state of the edges with the new edge added.
  */
  deleteEdge: (edgeId: String) => {
    const newEdges = get().edges.filter((edge) => edge.id !== edgeId);
    set({ edges: newEdges });
  },

  /*
   * Updates the edges when changed.
   * @param changes: EdgeChange[] changes to apply to the edges.
   * @returns The state of the edges with the changes applied.
   */
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  /*
   * Adds an edge to the graph.
   * @param connection: Connection connection to add.
   * @returns The state of the edges with the new edge added.
   */
  onConnect: (connection: Connection) => {
    // Generar un valor aleatorio para la curvatura entre 0.5 y 5.5
    const randomCurvature = Math.random() * (2.5 - 0.5) ;
    set({
      edges: addEdge(
        {
          ...connection,
          id: uuidv4(), // Generar un identificador único para cada camino
          type: "graph-edge",
          data: { label: "", weight: "?", curvature: randomCurvature },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#342e37",
          },
        },
        get().edges
      ),
    });
  },
}));

export default useStore;
