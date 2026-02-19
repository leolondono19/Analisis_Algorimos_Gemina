import React, { useState } from "react";
import ReactFlow, { MiniMap, Controls, ControlButton } from "reactflow";
import RemoveAllIcon from "/icons/removeAll.png";
import CreateNodeIcon from "/icons/createNode.png";
import RemoveNodeIcon from "/icons/removeNode.png";
import DownloadIcon from "/icons/download.png";
import UploadIcon from "/icons/upload.png";
import ShowAdjacencyMatrixIcon from "/icons/showMatrix.png";
import HideAdjacencyMatrixIcon from "/icons/hideMatrix.png";
import GraphNode from "./GraphNode";
import GraphEdge from "./GraphEdge";
import AdjacencyMatrix from "./AdjacencyMatrix";
import AssignationMatrix from "./AssignationMatrix";
import AssignationIconMax from "/icons/maxIcon.png";
import AssignationIconMin from "/icons/minIcon.png";
import MiniMapNode from "./MiniMapNode";
import fileService from "../service/file";
import useFlowStore from "../store/FlowStore";
import { shallow } from "zustand/shallow";
import assign from "../helpers/assignation.js";
import assignWithMunkres from "../helpers/assingMatrix.js";
import assignMax from "../helpers/assignationMax.js";
import Modal from "./Modal";
import { toPng } from "html-to-image";

const bgColor = "#fff";

const nodeTypes = {
  "graph-node-start": GraphNode,
};

const edgeTypes = {
  "graph-edge": GraphEdge,
};

const selector = (state) => ({
  ...state,
});

const AssignmentScreen = () => {
  const {
    deletePersona,
    toggleDeletePersona,
    adjacencyMatrix,
    setAdjacencyMatrix,
    assignationMatrix,
    setAssignationMatrix,
    posMatrix,
    setPosMatrix,
    totalCost,
    setTotalCost,
    nodes,
    addNode,
    setNodes,
    edges,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = useFlowStore(selector, shallow);

  const [showMatrix, setShowMatrix] = useState(false);
  const [showAssignationMin, setShowAssignationMin] = useState(false);
  const [showAssignationMax, setShowAssignationMax] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showModalAssignation, setShowModalAssignation] = useState(false);
  const [titleAssignation, setTitleAssignation] = useState("");
  const [showDocument, setShowDocument] = useState(false);
  const [assignationResults, setAssignationResults] = useState([]);
  const [assignationResultsMax, setAssignationResultsMax] = useState([]);
  const [showMinResults, setShowMinResults] = useState(false);
  const [showMaxResults, setShowMaxResults] = useState(false);
  const [minAssignationImage, setMinAssignationImage] = useState(null);
  const [maxAssignationImage, setMaxAssignationImage] = useState(null);

  const handleCloseModal = () => {
    setShowModal(false);
    setShowMatrix(false);
  };

  const handleCloseModalAssignation = () => {
    setShowAssignationMin(false);
    setShowModalAssignation(false);
  };

  const captureMatrixAsImage = async (matrixId, setImage) => {
    const matrixElement = document.getElementById(matrixId);
    if (matrixElement) {
      try {
        const image = await toPng(matrixElement);
        setImage(image);
      } catch (error) {
        console.error("Error al capturar la matriz como imagen:", error);
      }
    }
  };

  const handleAssignationMin_2 = () => {
    function removeZeros(matrix) {
      const filteredMatrix = matrix.map((row) =>
        row.filter((elem) => elem !== 0)
      );
      for (let i = 0; i < filteredMatrix.length; i++) {
        if (filteredMatrix[i].length === 0) {
          filteredMatrix.splice(i, 1);
          i--;
        }
      }
      return filteredMatrix;
    }

    let matrix = [];
    for (let i = 0; i < nodes.length; i++) {
      matrix[i] = new Array(nodes.length).fill(0);
    }

    edges.forEach((edge) => {
      matrix[edge.source][edge.target] =
        typeof edge.data.weight === "undefined" ? 1 : edge.data.weight;
    });

    matrix = matrix.map((innerArr) => innerArr.map(Number));
    let matrixFinal = removeZeros(matrix);
    const totalCost1 = assign(matrixFinal);
    let mat2 = matrixFinal;
    let x = assignWithMunkres(mat2, true);

    setTotalCost(totalCost1);
    let ceros = assignInitial(x);
    setPosMatrix(ceros);
    setShowModalAssignation(!showModalAssignation);
    setAssignationMatrix(mat2);
    setTitleAssignation("Minimización");
    setShowAssignationMin(!showAssignationMin);

    const results = ceros.map(([source, target]) => ({
      source,
      target,
      weight: mat2[source][target],
    }));

    // Actualizar aristas directamente
    edges.forEach((edge) => {
      edge.data.isSolution = results.some(
        (result) => result.source === edge.source && result.target === edge.target
      );
    });

    setEdges([...edges]); // Forzar actualización del estado

    setAssignationResults(results);
    setShowMinResults(true);
    setShowMaxResults(false);

    setTimeout(() => captureMatrixAsImage("assignation-matrix-min", setMinAssignationImage), 500);
  };

  const handleAssignationMax = () => {
    function removeZeros(matrix) {
      const filteredMatrix = matrix.map((row) =>
        row.filter((elem) => elem !== 0)
      );
      for (let i = 0; i < filteredMatrix.length; i++) {
        if (filteredMatrix[i].length === 0) {
          filteredMatrix.splice(i, 1);
          i--;
        }
      }
      return filteredMatrix;
    }

    let matrix = [];
    for (let i = 0; i < nodes.length; i++) {
      matrix[i] = new Array(nodes.length).fill(0);
    }

    edges.forEach((edge) => {
      matrix[edge.source][edge.target] =
        typeof edge.data.weight === "undefined" ? 1 : edge.data.weight;
    });
    matrix = matrix.map((innerArr) => innerArr.map(Number));
    let matrixFinal = removeZeros(matrix);

    const totalCost1 = assignMax(matrixFinal);
    let mat2 = [...matrixFinal];
    let x = assignWithMunkres(mat2, false);
    setTotalCost(totalCost1);
    let ceros = assignInitial(x);
    setPosMatrix(ceros);
    setAssignationMatrix(mat2);

    setShowAssignationMax(!showAssignationMax);
    setShowModalAssignation(!showModalAssignation);
    setTitleAssignation("Maximización");

    const results = ceros.map(([source, target]) => ({
      source,
      target,
      weight: mat2[source][target],
    }));
    setAssignationResultsMax(results);
    setShowMaxResults(true);
    setShowMinResults(false);

    setTimeout(() => captureMatrixAsImage("assignation-matrix-max", setMaxAssignationImage), 500);
  };

  function assignInitial(matrix) {
    let assignments = [];
    let rows = matrix.length;
    let cols = matrix[0].length;

    let assignedRows = new Set();
    let assignedCols = new Set();

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (matrix[i][j] == 1 && !assignedRows.has(i) && !assignedCols.has(j)) {
          assignments.push([i, j]);
          assignedRows.add(i);
          assignedCols.add(j);
        }
      }
    }

    return assignments;
  }

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

  const handleConnect = (params) => {
    const { source, target } = params;

    if (source === target) {
      alert("No se permiten caminos en bucle.");
      return;
    }

    const existingEdge = edges.find(
      (edge) => edge.source === target && edge.target === source
    );
    if (existingEdge) {
      alert("No se permiten caminos de vuelta.");
      return;
    }

    onConnect(params);
  };

  const handleMatrix = () => {
    const matrix = [];
    for (let i = 0; i < nodes.length; i++) {
      matrix[i] = new Array(nodes.length).fill(0);
    }

    edges.forEach((edge) => {
      matrix[edge.source][edge.target] =
        typeof edge.data.weight === "undefined" ? 1 : edge.data.weight;
    });
    setAdjacencyMatrix(matrix);

    setShowMatrix(!showMatrix);
    setShowModal(!showModal);
  };

  return (
    <div style={{ height: "100vh" }}>
      {showMatrix ? (
        <div>
          <Modal
            title={`Matriz de Adyacencia`}
            content={<AdjacencyMatrix nodes={nodes} matrix={adjacencyMatrix} />}
            show={showModal}
            onClose={handleCloseModal}
          ></Modal>
        </div>
      ) : (
        <></>
      )}

      {showModalAssignation ? (
        <Modal
          show={showModalAssignation}
          onClose={handleCloseModalAssignation}
          title={`Asignacion de nodos ${titleAssignation}`}
          content={
            <div
              id={
                titleAssignation === "Minimización"
                  ? "assignation-matrix-min"
                  : "assignation-matrix-max"
              }
            >
              <AssignationMatrix
                matrixpos={posMatrix}
                nodes={nodes}
                matrix={assignationMatrix}
                totalCost={totalCost}
              />
            </div>
          }
        ></Modal>
      ) : (
        <> </>
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
        onConnect={handleConnect}
        style={{ background: bgColor }}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
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
          <ControlButton onClick={handleMatrix}>
            <img
              src={showMatrix ? HideAdjacencyMatrixIcon : ShowAdjacencyMatrixIcon}
              alt="A"
              style={{
                width: "20px",
              }}
            />
          </ControlButton>
          <ControlButton onClick={handleAssignationMin_2}>
            <img
              src={AssignationIconMin}
              alt="assignation"
              style={{
                width: "20px",
              }}
            />
          </ControlButton>
          <ControlButton onClick={handleAssignationMax}>
            <img
              src={AssignationIconMax}
              alt="assignation"
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
          <ControlButton onClick={() => setShowDocument(true)} style={{ color: "#000" }}>
            ?
          </ControlButton>
        </Controls>
      </ReactFlow>

      {showDocument && (
        <Modal
          show={showDocument}
          onClose={() => setShowDocument(false)}
          title="Documento"
          content={
            <iframe
              src="https://docs.google.com/document/d/e/2PACX-1vTx0n792Q933GhlNsqjS2O1G8w-Q11YR9brC0wq1AxDKkV1pcMxsYisVRYsY5zTQzpkYgBYdrmey6bx/pub"
              width="120%"
              height="600px"
              style={{ border: "none" }}
            ></iframe>
          }
        />
      )}

      {showMinResults && minAssignationImage && (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "70px",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            padding: "10px",
            borderRadius: "5px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            maxWidth: "600px",
            overflowY: "auto",
            maxHeight: "900px",
          }}
        >
          <h4 style={{ margin: "0 0 10px 0" }}>Matriz de Asignación Minimización</h4>
          <img src={minAssignationImage} alt="Matriz de Asignación Minimización" style={{ width: "100%" }} />
        </div>
      )}

      {showMaxResults && maxAssignationImage && (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "70px",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            padding: "10px",
            borderRadius: "5px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            maxWidth: "600px",
            overflowY: "auto",
            maxHeight: "900px",
          }}
        >
          <h4 style={{ margin: "0 0 10px 0" }}>Matriz de Asignación Maximización</h4>
          <img src={maxAssignationImage} alt="Matriz de Asignación Maximización" style={{ width: "100%" }} />
        </div>
      )}
    </div>
  );
};

export default AssignmentScreen;
