import React, { useState } from "react";

import ReactFlow, { MiniMap, Controls, ControlButton } from "reactflow";

import RemoveAllIcon from "/icons/removeAll.png";
import CreateNodeIcon from "/icons/createNode.png";
import RemoveNodeIcon from "/icons/removeNode.png";
import DownloadIcon from "/icons/download.png";
import UploadIcon from "/icons/upload.png";
import DijkstraIcon from "/icons/dijkstra.png";
import GraphNode from "./GraphNode";
import GraphEdge from "./GraphEdge";
import MiniMapNode from "./MiniMapNode";
import fileService from "./../service/file";
import Modal from "./Modal";
import Paths from "./Paths";
import useFlowStore from "./../store/FlowStore";
import { shallow } from "zustand/shallow";
import { dijkstraAlgorithm } from "./../algorithms/dijkstra";

const bgColor = "#fff";

const nodeTypes = {
  "graph-node-start": GraphNode,
};

const edgeTypes = {
  "graph-edge": GraphEdge,
};

const selector = (state) => ({
  // Persona
  deletePersona: state.deletePersona,
  toggleDeletePersona: state.toggleDeletePersona,

  // adjacency matrix
  adjacencyMatrix: state.adjacencyMatrix,
  setAdjacencyMatrix: state.setAdjacencyMatrix,

  //assignation matrix
  assignationMatrix: state.assignationMatrix,
  setAssignationMatrix: state.setAssignationMatrix,

  //Positions matrix
  posMatrix: state.posMatrix,
  setPosMatrix: state.setPosMatrix,

  //costo total
  totalCost: state.totalCost,
  setTotalCost: state.setTotalCost,

  // nodes
  nodes: state.nodes,
  addNode: state.addNode,
  setNodes: state.setNodes,
  onNodesChange: state.onNodesChange,
  setWeight: state.setWeight,

  // edges
  edges: state.edges,
  setEdges: state.setEdges,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
});

const Dijkstra = () => {
  const {
    deletePersona,
    toggleDeletePersona,
    nodes,
    addNode,
    setNodes,
    edges,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = useFlowStore(selector, shallow);

  const [showModal, setShowModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [paths, setPaths] = useState([]);
  const [costs, setCosts] = useState([]);
  const [labels, setLabels] = useState([]);
  const [bottomInfo, setBottomInfo] = useState({ visible: false, text: "" });

  // uses /service/file.js to upload the graph and set the nodes and edges
  const handleFileUpload = async (event) => {
    await fileService.upload(event).then((response) => {
      setNodes(response.nodes);
      setEdges(response.edges);
      return response;
    });
  };

  const handleFileDownload = () => {
    const fileName = prompt("Introduzca el nombre del archivo");
    if (fileName === null) return;
    fileService.download(nodes, edges, `${fileName}.json`);
  };

  const handleClear = () => {
    setNodes([]);
    setEdges([]);
  };

  const adjacencymatrix = () => {
    if (nodes.length === 0 || edges.length === 0) {
      alert("No hay nodos o aristas");
      return;
    }
    const matrix = new Array(nodes.length)
      .fill(0)
      .map(() => new Array(nodes.length).fill(0));
    edges.forEach((edge) => {
      const sourceIndex = nodes.indexOf(
        nodes.find((node) => node.id === edge.source)
      );
      const targetIndex = nodes.indexOf(
        nodes.find((node) => node.id === edge.target)
      );
      matrix[sourceIndex][targetIndex] =
        typeof edge.data.weight === "undefined"
          ? 1
          : parseInt(edge.data.weight);
    });
    return matrix;
  };

  const inputSourceNode = () => {
    const sourceNode = prompt("Ingrese el nodo de origen");
    if (sourceNode === null) return;
    const sourceNodeIndex = nodes.findIndex(
      (node) => node.data.label === sourceNode
    );
    if (sourceNodeIndex === -1) {
      alert("El nodo no existe");
      return;
    }
    return sourceNodeIndex;
  };

  const inputTargetNode = () => {
    const targetNode = prompt("Ingrese el nodo de destino");
    if (targetNode === null) return;
    const targetNodeIndex = nodes.findIndex(
      (node) => node.data.label === targetNode
    );
    if (targetNodeIndex === -1) {
      alert("El nodo no existe");
      return;
    }
    return targetNodeIndex;
  };

  const handleMinPath = () => {
    const adjacencyMatrix = adjacencymatrix();
    if (adjacencyMatrix === undefined) return;
    const sourceNode = inputSourceNode();
    if (sourceNode === undefined) return;
    const targetNode = inputTargetNode();
    if (targetNode === undefined) return;

    const { costs, idPaths } = dijkstraAlgorithm(adjacencyMatrix, sourceNode, "min");

    if (costs[targetNode] === Infinity) {
      setBottomInfo({ visible: true, text: "No hay camino mínimo entre los nodos seleccionados." });
      return;
    }

    highlightDijkstraPath(idPaths[targetNode]);
    const pathLabels = idPaths[targetNode].map(idx => nodes[idx].data.label).join(" → ");
    setBottomInfo({
      visible: true,
      text: `Ruta mínima: ${pathLabels}\nCosto mínimo: ${costs[targetNode]}`
    });
  };

  const handleMaxPath = () => {
    const adjacencyMatrix = adjacencymatrix();
    if (adjacencyMatrix === undefined) return;
    const sourceNode = inputSourceNode();
    if (sourceNode === undefined) return;
    const targetNode = inputTargetNode();
    if (targetNode === undefined) return;

    const { costs, idPaths } = dijkstraAlgorithm(adjacencyMatrix, sourceNode, "max");

    if (costs[targetNode] === Infinity || costs[targetNode] === -Infinity) {
      setBottomInfo({ visible: true, text: "No hay camino máximo entre los nodos seleccionados." });
      return;
    }

    highlightDijkstraPath(idPaths[targetNode]);
    const pathLabels = idPaths[targetNode].map(idx => nodes[idx].data.label).join(" → ");
    setBottomInfo({
      visible: true,
      text: `Ruta máxima: ${pathLabels}\nCosto máximo: ${costs[targetNode]}`
    });
  };

  const handleMin = () => {
    handleDijkstra("min");
  };

  const handleDijkstra = (mode) => {
    const adjacencyMatrix = adjacencymatrix();
    if (adjacencyMatrix === undefined) return;
    const sourceNode = inputSourceNode();
    if (sourceNode === undefined) return;
    const { costs, idPaths } = dijkstraAlgorithm(
      adjacencyMatrix,
      sourceNode,
      mode
    );
    // console.table(costs);
    // console.table(idPaths);

    const newNodes = nodes.map((node, index) => {
      return {
        ...node,
        data: {
          ...node.data,
          cost: (costs[index] === Infinity ? "∞" : costs[index]).toString(),
        },
      };
    });
    setNodes(newNodes);
    setCosts(costs);
    setLabels(newNodes.map((node) => node.data.label));
    setShowModal(true);

    const newPaths = idPaths.map((path) => {
      return path.map((node) => {
        return nodes[node].data.label;
      });
    });

    setPaths(newPaths);
  };

  const highlightDijkstraPath = (path) => {
    if (!path || path.length < 2) return;
    const newEdges = edges.map((edge) => {
      const sourceIndex = nodes.findIndex((node) => node.id === edge.source);
      const targetIndex = nodes.findIndex((node) => node.id === edge.target);

      let inPath = false;
      for (let i = 0; i < path.length - 1; i++) {
        if (
          (sourceIndex === path[i] && targetIndex === path[i + 1]) ||
          (sourceIndex === path[i + 1] && targetIndex === path[i])
        ) {
          inPath = true;
          break;
        }
      }
      return {
        ...edge,
        data: {
          ...edge.data,
          label: inPath ? " " : null,
        },
        markerEnd: {
          ...edge.markerEnd,
          color: inPath ? "green" : "#342e37",
        },
        animated: inPath ? true : false,
      };
    });
    setEdges(newEdges);
  };

  return (
    <div
      style={{
        height: "100vh",
        position: "relative",
      }}
    >
      {showModal ? (
        <div>
          <Modal
            content={<Paths paths={paths} costs={costs} labels={labels} />}
            show={showModal}
            onClose={() => setShowModal(false)}
            title="Rutas Recorridas"
          ></Modal>
        </div>
      ) : (
        <></>
      )}
      {showHelpModal && (
        <Modal
          show={showHelpModal}
          onClose={() => setShowHelpModal(false)}
          title="Ayuda"
          content={
            <iframe
              src="https://docs.google.com/document/d/e/2PACX-1vQjFQNZLnH1kS8EkaOwW_IeUYg1DOzM9Lfi3x4UyTIWNTFVkkqfVSySae1a5lc_jOQ9fYujg7kpVYvF/pub"
              width="100%"
              height="600px"
              style={{ border: "none" }}
              title="Ayuda"
            ></iframe>
          }
        />
      )}
      <input
        id="file-input"
        type="file"
        onChange={handleFileUpload}
        style={{ display: "none" }}
      />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        style={{ background: bgColor }}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineType="straight"
        connectionLineStyle={{ stroke: "#342e37", strokeWidth: 2 }}
        connectionMode="loose"
        proOptions={{ hideAttribution: true }}
      >
        <MiniMap
          nodeColor="#5e90e1"
          nodeStrokeWidth={3}
          nodeComponent={MiniMapNode}
          zoomable
          pannable
        />
        <Controls>
          <ControlButton onClick={addNode}>
            <img
              src={CreateNodeIcon}
              alt="A"
              style={{
                width: "20px",
                hover: "pointer",
              }}
            />
          </ControlButton>
          <ControlButton
            onClick={toggleDeletePersona}
            style={{ backgroundColor: deletePersona ? "#ff0000" : "#fff" }}
          >
            <img
              src={RemoveNodeIcon}
              alt="A"
              style={{
                width: "20px",
              }}
            />
          </ControlButton>
          <ControlButton onClick={handleMinPath} style={{ fontSize: 10 }}>
            MIN
          </ControlButton>
          <ControlButton onClick={handleMaxPath} style={{ fontSize: 10 }}>
            MAX
          </ControlButton>
          <ControlButton onClick={handleMin}>
            <img
              src={DijkstraIcon}
              alt="A"
              style={{
                width: "20px",
              }}
            />
          </ControlButton>
          <ControlButton onClick={handleFileDownload}>
            <img
              src={DownloadIcon}
              alt="A"
              style={{
                width: "20px",
              }}
            />
          </ControlButton>
          <ControlButton
            onClick={() => document.getElementById("file-input").click()}
          >
            <img
              src={UploadIcon}
              alt="A"
              style={{
                width: "20px",
              }}
            />
          </ControlButton>
          <ControlButton onClick={handleClear}>
            <img
              src={RemoveAllIcon}
              alt="Remove All"
              style={{
                width: "20px",
              }}
            />
          </ControlButton>
          <ControlButton
            onClick={() => setShowHelpModal(true)}
            style={{ color: "#000" }}
          >
            ?
          </ControlButton>
        </Controls>
      </ReactFlow>
      {bottomInfo.visible && (
        <div
          style={{
            position: "fixed",
            left: 0,
            bottom: 0,
            width: "100%",
            background: "rgba(255,255,255,0.95)",
            borderTop: "1px solid #ccc",
            padding: "16px",
            fontSize: "16px",
            zIndex: 1000,
            whiteSpace: "pre-line",
            boxShadow: "0 -2px 8px rgba(0,0,0,0.07)"
          }}
        >
          {bottomInfo.text}
          <button
            style={{
              float: "right",
              marginLeft: "16px",
              background: "#e74c3c",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              padding: "4px 12px",
              cursor: "pointer"
            }}
            onClick={() => setBottomInfo({ ...bottomInfo, visible: false })}
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
};

export default Dijkstra;
