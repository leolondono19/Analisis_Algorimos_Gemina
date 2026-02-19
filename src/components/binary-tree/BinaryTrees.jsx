import React from "react";

import "./../../styles/binary-tree/BinaryTrees.css";

import ReactFlow, { Controls } from "reactflow";

import { shallow } from "zustand/shallow";

// import CustomComponentNode from "./CustomComponentNode";
import CustomTEST from "./../test/custom";

import useBinaryTreeStore from "../../store/BinaryTreeStore";
import BinaryTreeNode from "./BinaryTreeNode";
import BinaryTreeEdge from "./BinaryTreeEdge";
import TraversalVisualization from "./TraversalVisualization";

/**
 * State selector
 * */
const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
});

/**
 * nodeTypes
 * */
const nodeTypes = {
  componentNode: CustomTEST,
  binaryTreeNode: BinaryTreeNode,
  traversalVisualizationNode: TraversalVisualization,
};

const edgeTypes = {
  custom: BinaryTreeEdge,
};

const BinaryTrees = () => {
  const { onNodesChange, onEdgesChange, onConnect, nodes, edges } =
    useBinaryTreeStore(selector, shallow);

  return (
    <div className="tree-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        proOptions={{ hideAttribution: true }}
      >
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default BinaryTrees;
