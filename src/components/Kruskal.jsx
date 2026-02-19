import React, { useState } from "react";

import ReactFlow, { MiniMap, Controls, ControlButton } from "reactflow";

import RemoveAllIcon from "/icons/removeAll.png";
import CreateNodeIcon from "/icons/createNode.png";
import RemoveNodeIcon from "/icons/removeNode.png";
import DownloadIcon from "/icons/download.png";
import UploadIcon from "/icons/upload.png";
import ShowAdjacencyMatrixIcon from "/icons/showMatrix.png";
import GraphNode from "./GraphNode";
import GraphEdge from "./GraphEdge";
import MiniMapNode from "./MiniMapNode";
import AdjacencyMatrix from "./AdjacencyMatrix";
import Modal from "./Modal";

import fileService from "./../service/file";

import useFlowStore from "./../store/FlowStore";
import { shallow } from "zustand/shallow";
import { kruskalAlgorithm } from "./../algorithms/kruskal";

const bgColor = "#fff";

const nodeTypes = {
  "graph-node-start": GraphNode,
};

const edgeTypes = {
  "graph-edge": GraphEdge,
};
/* Set state modal */
//const [isModalOpen, setIsModalOpen] = useState(false);

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

const Kruskal = () => {
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

  const [KruskalRef, setKruskalRef] = useState(false);
  const [showMatrixModal, setShowMatrixModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const handleShowMatrix = () => setShowMatrixModal(true);
  const handleCloseMatrix = () => setShowMatrixModal(false);

  // uses /service/file.js to upload the graph and set the nodes and edges
  const handleFileUpload = async (event) => {
    await fileService.upload(event).then((response) => {
      setNodes(response.nodes);
      setEdges(response.edges);
      let showKruskal = false;
      for (let i = 0; i < response.edges.length; i++) {
        if (response.edges[i].data.label === " ") {
          showKruskal = true;
          break;
        }
      }
      setKruskalRef(showKruskal);
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
      return [];
    }
    // NO modifiques el estado aquí
    const matrix = new Array(nodes.length)
      .fill(0)
      .map(() => new Array(nodes.length).fill(0));
    edges.forEach((edge) => {
      matrix[edge.source][edge.target] = parseInt(edge.data.weight);
      matrix[edge.target][edge.source] = parseInt(edge.data.weight);
    });
    return matrix;
  };

  const handleMax = () => {
    const adjacencyMatrix = adjacencymatrix();
    const kruskal = kruskalAlgorithm(adjacencyMatrix, "max");

    const newEdges = edges.map((edge) => {
      const sourceIndex = nodes.indexOf(
        nodes.find((node) => node.id === edge.source)
      );
      const targetIndex = nodes.indexOf(
        nodes.find((node) => node.id === edge.target)
      );

      const edgeInKruskal = kruskal.find(
        (kruskalEdge) =>
          ((kruskalEdge[0] === sourceIndex && kruskalEdge[1] === targetIndex) ||
            (kruskalEdge[0] === targetIndex &&
              kruskalEdge[1] === sourceIndex)) &&
          kruskalEdge[2] === parseInt(edge.data.weight)
      );
      return {
        ...edge,
        data: {
          ...edge.data,
          label: edgeInKruskal ? " " : null,
        },
        markerEnd: {
          ...edge.markerEnd,
          color: edgeInKruskal ? "green" : "#342e37",
        },
        animated: edgeInKruskal ? true : false,
      };
    });
    setEdges(newEdges);
    const totalCost = kruskal.reduce((acc, curr) => acc + curr[2], 0);
    alert(`El costo total es: ${totalCost}`);
  };

  const handleMin = () => {
    const adjacencyMatrix = adjacencymatrix();
    const kruskal = kruskalAlgorithm(adjacencyMatrix, "min");
    const newEdges = edges.map((edge) => {
      const sourceIndex = nodes.indexOf(
        nodes.find((node) => node.id === edge.source)
      );
      const targetIndex = nodes.indexOf(
        nodes.find((node) => node.id === edge.target)
      );

      const edgeInKruskal = kruskal.find(
        (kruskalEdge) =>
          ((kruskalEdge[0] === sourceIndex && kruskalEdge[1] === targetIndex) ||
            (kruskalEdge[0] === targetIndex &&
              kruskalEdge[1] === sourceIndex)) &&
          kruskalEdge[2] === parseInt(edge.data.weight)
      );
      return {
        ...edge,
        data: {
          ...edge.data,
          label: edgeInKruskal ? " " : null,
        },
        markerEnd: {
          ...edge.markerEnd,
          color: edgeInKruskal ? "green" : "#342e37",
        },
        animated: edgeInKruskal ? true : false,
      };
    });
    setEdges(newEdges);
    const totalCost = kruskal.reduce((acc, curr) => acc + curr[2], 0);
    alert(`El costo total es: ${totalCost}`);
  };

  // Nueva función para manejar la conexión y evitar bucles
  const handleConnect = (params) => {
    if (params.source === params.target) {
      alert("En Kruskal no se permiten bucles (aristas de un nodo a sí mismo).");
      return;
    }
    onConnect(params);
  };

  return (
    <div
      style={{
        //give 80% height
        height: "100vh",
      }}
    >
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
        onConnect={handleConnect}
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
          <ControlButton onClick={handleMax} style={{ fontSize: 10 }}>
            MAX
          </ControlButton>
          <ControlButton onClick={handleMin} style={{ fontSize: 10 }}>
            MIN
          </ControlButton>
          <ControlButton onClick={handleShowMatrix}>
            <img
              src={ShowAdjacencyMatrixIcon}
              alt="Matriz de adyacencia"
              style={{ width: "20px" }}
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
      {/* Modal para la matriz de adyacencia */}
      {showMatrixModal && (
        <Modal
          show={showMatrixModal}
          onClose={handleCloseMatrix}
          title="Matriz de Adyacencia"
          content={
            <AdjacencyMatrix nodes={nodes} matrix={adjacencymatrix() || []} />
          }
        />
      )}
      {showHelpModal && (
        <Modal
          show={showHelpModal}
          onClose={() => setShowHelpModal(false)}
          title="Ayuda"
          content={
            <iframe
              src="https://docs.google.com/document/d/e/2PACX-1vQRryr5jbLkfSi1nnKRB79sx-SVP1x6G2nwo2xF_rQXKp0j0rFYs8B8WAKbOL_2NJp46_uGOo7TJsdb/pub"
              width="100%"
              height="600px"
              style={{ border: "none" }}
              title="Ayuda"
            ></iframe>
          }
        />
      )}
      {KruskalRef ? (
        <div
          style={{
            position: "absolute",
            bottom: "0",
            left: "60px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <h5 style={{ display: "inline-block", marginRight: "10px" }}>
            Arista en el árbol de expansión:
          </h5>
          <div
            style={{
              border: "none",
              borderBottom: "5px dashed var(--dashed-line-color, green)",
              width: "120px",
              display: "inline-block",
              marginRight: "10px",
              boxSizing: "border-box",
            }}
          ></div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default Kruskal;
