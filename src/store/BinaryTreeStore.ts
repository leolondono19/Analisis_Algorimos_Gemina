import { create } from "zustand";

import { Heap } from "./../utils/heap.js";

import {
  Connection,
  Node,
  Edge,
  EdgeChange,
  NodeChange,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from "reactflow";

const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;

interface BinaryTreeState {
  nodes: Node[];
  nodeLabels: number[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;

  inputNumber: number | null;
  parentNode: number | null;

  preOrder: number[];
  inOrder: number[];
  postOrder: number[];
}

/**
 * IMPORTANT
 * this variable keeps the componentNode always on the state
 **/
const initialNodes: Node[] = [
  {
    id: "component",
    deletable: false,
    type: "componentNode",
    data: { label: "Input Node" },
    position: { x: 70, y: screenHeight / 2 + 250 },
  },
  {
    id: "traversal",
    deletable: false,
    type: "traversalVisualizationNode",
    data: {},
    position: { x: screenWidth - 50, y: screenHeight / 2 + 250 },
  },
];

const initialPreOrder: number[] = [];
const initialInOrder: number[] = [];
const initialPostOrder: number[] = [];

// const initialNodes: Node[] = [
//   {
//     id: "component",
//     deletable: false,
//     type: "componentNode",
//     data: {
//       label: "Input Node",
//     },
//     position: {
//       x: 71,
//       y: 764.5,
//     },
//     width: 152,
//     height: 141,
//     selected: true,
//     positionAbsolute: {
//       x: 71,
//       y: 764.5,
//     },
//     dragging: false,
//   },
//   {
//     id: "1",
//     handleId: "1",
//     type: "binaryTreeNode",
//     data: {
//       label: "2",
//       visitedBy: [1, 3],
//     },
//     position: {
//       x: 619,
//       y: 445.5,
//     },
//     width: 50,
//     height: 50,
//   },
//   {
//     id: "2",
//     handleId: "2",
//     type: "binaryTreeNode",
//     data: {
//       label: "1",
//       visitedBy: [],
//     },
//     position: {
//       x: 519,
//       y: 545.5,
//     },
//     width: 50,
//     height: 50,
//   },
//   {
//     id: "3",
//     handleId: "3",
//     type: "binaryTreeNode",
//     data: {
//       label: "3",
//       visitedBy: [],
//     },
//     position: {
//       x: 719,
//       y: 545.5,
//     },
//     width: 50,
//     height: 50,
//   },
// ];

// const initialEdges: Edge[] = [
//   {
//     id: "1-2",
//     source: "1",
//     target: "2",
//   },
// ];

const initialEdges: Edge[] = [];

const useBinaryTreeStore = create<BinaryTreeState>((set, get) => ({
  parentNode: null,
  setParentNode: (node: number) => set({ parentNode: node }),
  /**
   * Nodes state variable
   * */
  nodes: initialNodes,
  nodeLabels: [],

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
   * Adds a node to the nodes state variable.
   * @returns new state of nodes.
   */
  addNode: (label: string) => {
    let edgeSource = `${get().parentNode}`;
    const nodes = get().nodes;
    const parentNode = get().parentNode;

    const nodeExists = nodes.find((node) => node.data.label === label);
    if (nodeExists) {
      alert("Ya existe un nodo con ese valor");
      return;
    }
    let newNode;

    if (nodes.length === 2 && typeof parentNode !== "number") {
      // creates root node
      newNode = {
        id: nodes.length.toString(),
        handleId: nodes.length.toString(),
        type: "binaryTreeNode",
        data: { label: label, visitedBy: [], parent: null },
        position: { x: screenWidth / 2, y: screenHeight / 2 },
      };
      // convert the code from the bottom to list
      const newNodeLabels: number[] = [];

      // iterate every node except the first
      for (let i = 2; i < nodes.length; i++) {
        // get the label of the node
        const nodeLabel = parseInt(nodes[i].data.label);
        // add the label to the list
        newNodeLabels.push(nodeLabel);
      }
      newNodeLabels.push(parseInt(label));

      const newNodes = nodes.map((node) => {
        if (node.id === get().parentNode?.toString()) {
          node.data.wasVisited = true;
        }
        return node;
      });
      set({
        nodes: [...newNodes, newNode],
        nodeLabels: newNodeLabels,
        parentNode: newNodeLabels[0],
      });
    } else {
      // console.log("Ejecutando la wea del parentNode");
      //TODO: check this!!!
      const parentNodeFound = nodes.find(
        (node) =>
          node.data.label === get().parentNode?.toString() &&
          node.data.visitedBy.length < 2
      );
      if (!parentNodeFound) {
        alert(
          "No se encontró el nodo padre o no se ha seleccionado un nodo padre válido."
        );
        return;
      }

      const parentPosition = parentNodeFound.position;
      const parentX = parentPosition.x;
      const parentY = parentPosition.y;

      let X = 100;
      const Y = 100;

      const parentNodeLabel = parentNodeFound.data.label;
      edgeSource = parentNodeFound.id.toString();

      if (parseInt(parentNodeLabel) > parseInt(label)) {
        X = -100;
      }

      const newNodeX = parentX + X;
      const newNodeY = parentY + Y;

      newNode = {
        id: nodes.length.toString(),
        handleId: nodes.length.toString(),
        type: "binaryTreeNode",
        data: {
          label: label,
          visitedBy: [],
          parent: parseInt(parentNodeLabel),
        },
        position: { x: newNodeX, y: newNodeY },
      };
    }

    // convert the code from the bottom to list
    const newNodeLabels: number[] = [];

    // iterate every node except the first
    for (let i = 2; i < nodes.length; i++) {
      // get the label of the node
      const nodeLabel = parseInt(nodes[i].data.label);
      // add the label to the list
      newNodeLabels.push(nodeLabel);
    }
    newNodeLabels.push(parseInt(label));

    const newNodes = nodes.map((node) => {
      if (node.data.label === get().parentNode?.toString()) {
        node.data.visitedBy.push(parseInt(label));
      }
      return node;
    });

    // console.log("newNodes", newNodes);

    set({
      nodes: [...newNodes, newNode],
      nodeLabels: newNodeLabels,
      edges: [
        ...get().edges,
        {
          id: `${edgeSource}-${nodes.length.toString()}`,
          source: edgeSource,
          target: nodes.length.toString(),
        },
      ],
    });
  },

  edges: initialEdges,

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
    set({
      edges: addEdge(connection, get().edges),
    });
  },

  inputNumber: null,
  setNumber: (number: number) => set({ inputNumber: number }),

  /*
   * Binary tree traversals
   *
   */

  // Preorder traversal
  preOrder: initialPreOrder,

  preorderTraversal: () => {
    const nodes = get().nodes;

    const heap = new Heap();

    for (let i = 2; i < nodes.length; i++) {
      heap.insert(parseInt(nodes[i].data.label));
    }

    const preorderTraversal = heap.preorderTraversal();

    set({
      preOrder: preorderTraversal,
    });
  },

  // Inorder traversal
  inOrder: initialInOrder,

  inorderTraversal: () => {
    const nodes = get().nodes;

    const heap = new Heap();

    for (let i = 2; i < nodes.length; i++) {
      heap.insert(parseInt(nodes[i].data.label));
    }

    const inOrderTraversal = heap.inOrderTraversal();

    set({ inOrder: inOrderTraversal });
  },

  // Postorder traversal
  postOrder: initialPostOrder,

  postorderTraversal: () => {
    const nodes = get().nodes;

    const heap = new Heap();

    for (let i = 2; i < nodes.length; i++) {
      heap.insert(parseInt(nodes[i].data.label));
    }

    const postOrderTraversal = heap.postOrderTraversal();

    set({
      postOrder: postOrderTraversal,
    });
  },

  makeTraversal: () => {
    const nodes = get().nodes;

    const heap = new Heap();

    for (let i = 2; i < nodes.length; i++) {
      heap.insert(parseInt(nodes[i].data.label));
    }

    const preOrderTraversal = heap.preOrderTraversal();
    const inOrderTraversal = heap.inOrderTraversal();
    const postOrderTraversal = heap.postOrderTraversal();

    set({
      preOrder: preOrderTraversal,
      inOrder: inOrderTraversal,
      postOrder: postOrderTraversal,
    });
  },
}));

export default useBinaryTreeStore;
