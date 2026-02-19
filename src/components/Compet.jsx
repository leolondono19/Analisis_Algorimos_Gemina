import React, { useState } from "react";

import ReactFlow, { MiniMap, Controls, ControlButton } from "reactflow";

import RemoveAllIcon from "/icons/removeAll.png";
import CreateNodeIcon from "/icons/createNode.png";
import RemoveNodeIcon from "/icons/removeNode.png";
import CompetIcon from "/icons/compet.png";
import DownloadIcon from "/icons/download.png";
import UploadIcon from "/icons/upload.png";
import GraphNode from "./GraphNode";
import GraphEdge from "./GraphEdge";
import MiniMapNode from "./MiniMapNode";
import CompetCoordinates from "./CompetCoordinates";

import fileService from "./../service/file";
import Modal from "./Modal";
import useFlowStore from "./../store/FlowStore";
import { shallow } from "zustand/shallow";
import { competAlgorithm } from "../algorithms/compet";

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

const Compet = () => {
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
  const [coordinatesArray, setCoordinatesArray] = useState([]);
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

  const calculateCendroid = () => {
    // // check if there is a node with id "centroid"
    // const centroidNode = nodes.find((node) => node.id === "centroid");
    // // if there is a node with id "centroid" remove it
    // if (centroidNode) {
    //   setNodes(nodes.filter((node) => node.id !== "centroid"));
    //   return;
    // }
    // get the coordinates of the nodes as an array of arrays, except if the node is the centroid
    const coordinates = nodes.map((node) => {
      if (node.id === "centroid") return null;
      return [node.position.x, node.position.y, node.data.label];
    });
    // remove the null values from the array
    for (let i = 0; i < coordinates.length; i++) {
      if (coordinates[i] === null) {
        coordinates.splice(i, 1);
        i--;
      }
    }
    // extract the coordinates from the array to a new array called newCoordinates
    const newCoordinates = [];
    for (let i = 0; i < coordinates.length; i++) {
      newCoordinates.push([coordinates[i][0], coordinates[i][1]]);
    }
    // console.log(coordinates);
    // calculate the centroid
    const centroid = competAlgorithm(newCoordinates);
    if (centroid === null) {
      alert(
        "No se puede calcular el centroide, los nodos no forman un poligono convexo"
      );
      return;
    }
    // create a new node with the centroid coordinates
    const newCentroidNode = {
      id: "centroid",
      type: "graph-node-start",
      position: { x: centroid[0], y: centroid[1] },
      data: { label: " O ", weight: 0 },
    };
    // add the centroid node to the nodes array
    setNodes([...nodes, newCentroidNode]);
    setShowModal(true);
    // Add the label to each coordinate
    setCoordinatesArray([...coordinates, [...centroid, "Centroide"]]);
    // console.log(centroid);
  };

  return (
    <div
      style={{
        //give 80% height
        height: "100vh",
      }}
    >
      {showModal ? (
        <div>
          <Modal
            content={<CompetCoordinates coordinates={coordinatesArray} />}
            show={showModal}
            onClose={() => setShowModal(false)}
            title="COORDENADAS DE LOS NODOS"
          ></Modal>
        </div>
      ) : (
        <></>
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

          <ControlButton onClick={calculateCendroid}>
            <img
              src={CompetIcon}
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
            onClick={() =>
              window.open(
                "https://docs.google.com/document/u/0/d/19a-S0iG242SVOKOlIre3ltMluHy514fI3p2VMhAvp9w/edit?pli=1",
                "_blank"
              )
            }
            style={{ color: "#000" }}
          >
            ?
          </ControlButton>
        </Controls>
      </ReactFlow>
    </div>
  );
};

export default Compet;
