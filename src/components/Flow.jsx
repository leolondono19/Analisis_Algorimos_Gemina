import React, { useState } from "react";

import ReactFlow, { MiniMap, Controls, ControlButton } from "reactflow";

import RemoveAllIcon from "/icons/removeAll.png";
import CreateNodeIcon from "/icons/createNode.png";
import RemoveNodeIcon from "/icons/removeNode.png";
import ShowAdjacencyMatrixIcon from "/icons/showMatrix.png";
import HideAdjacencyMatrixIcon from "/icons/hideMatrix.png";
import JonsonIcon from "/icons/cpm.png";
import DownloadIcon from "/icons/download.png";
import UploadIcon from "/icons/upload.png";
import CriticPathIcon from "/icons/johnson.jpg";
import GraphNode from "./GraphNode";
import GraphEdge from "./GraphEdge";
import MiniMapNode from "./MiniMapNode";
import AdjacencyMatrix from "./AdjacencyMatrix";

import fileService from "./../service/file";

import useFlowStore from "./../store/FlowStore";
import { shallow } from "zustand/shallow";

import Modal from "./Modal";
import { johnsonAlgorithm } from "../algorithms/johnson";

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
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
});

const Flow = () => {
  const {
    deletePersona,
    toggleDeletePersona,
    adjacencyMatrix,
    setAdjacencyMatrix,
    nodes,
    addNode,
    setNodes,
    edges,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = useFlowStore(selector, shallow);

  const handleConnect = (params) => {
    const { source, target } = params;

    // Check for loops
    if (source === target) {
      alert("No se permiten caminos en bucle.");
      return;
    }

    // Check for reverse paths
    const existingEdge = edges.find(
      (edge) => edge.source === target && edge.target === source
    );
    if (existingEdge) {
      alert("No se permiten caminos de vuelta.");
      return;
    }

    // If no loop or reverse path, proceed with the connection
    onConnect(params);
  };

  const [showMatrix, setShowMatrix] = useState(false);
  const [JohnsonRef, setJohnsonRef] = useState(false);
  const [finalArrivalTime, setFinalArrivalTime] = useState(0); // <-- Aquí

  const [showModal, setShowModal] = useState(false);
  const [showDocument, setShowDocument] = useState(false);
  //Matriz de adyancecia
  const handleCloseModal = () => {
    setShowModal(false);
    setShowMatrix(false);
  };

  const handleMatrix = () => {
    const matrix = [];
    // fill matrix with zeros
    for (let i = 0; i < nodes.length; i++) {
      matrix[i] = new Array(nodes.length).fill(0);
    }

    edges.forEach((edge) => {
      matrix[edge.source][edge.target] =
        typeof edge.data.weight === "undefined" ? 1 : edge.data.weight;
    });
    // console.log("matrix", matrix);
    setAdjacencyMatrix(matrix);

    // hide/show matrix
    setShowMatrix(!showMatrix);
    setShowModal(!showModal);
    // console.log("showMatrix", showMatrix);

    //handleAssignation();

    /* 
    
    ALGORITMO de Asignacion 
 
    */
    // Si cambias los pesos de los nodos se vuelve string, por eso  convierto xd
    // matrix = [[7, 3, 12], [2, 4, 6], [2, 7, 4]];
    let matrixConverted = matrix.map((innerArr) => innerArr.map(Number));

    // console.log(matrixConverted);

    //Array de valores minimos por columna
    let min = minColumns(matrixConverted);
    // console.log("minimos", min);
    //Array de valores maximos por columna
    let max = maxColumns(matrixConverted);
    // console.log("maximos", max);
    // Para sacar alpha prima
    let alphaPrime = alphaMatrix(min);
    // console.log("alphaprima", alphaPrime);

    // comparacion entre la mtariz principal y alpha prima
    let comparacion = restarMatrices(matrixConverted, alphaPrime);
    // console.log("matrix - alpha", comparacion);

    /* maximos elementos por fila
    let maxfilas= rowElements(comparacion);
    // console.log('Beta máximos',maxfilas); */

    //minimos elementos por fila
    let minfilas = minrowElements(comparacion);
    // console.log("Beta", minfilas);

    //Beta prima
    let betaPrime = betaPrima(minfilas);
    // console.log("prime", betaPrime);

    // matrix-alpha-beta
    //que es la matriz a analizar
    let AAB = restarMatrices(comparacion, betaPrime);
    // console.log("MATRIZ A ANALIZAR", AAB);
  };

  //minimos de cada columna
  function minColumns(matrix) {
    const minCol = [];
    for (let i = 0; i < matrix[0].length; i++) {
      let min = matrix[0][i];
      for (let j = 1; j < matrix.length; j++) {
        if (matrix[j][i] < min) {
          min = matrix[j][i];
        }
      }
      minCol.push(min);
    }
    return minCol;
  }

  //maximos de cada columna xd
  function maxColumns(matrix) {
    let max = new Array(matrix[0].length).fill(0);
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[i].length; j++) {
        if (matrix[i][j] > max[j]) {
          max[j] = matrix[i][j];
        }
      }
    }
    return max;
  }

  // alpha prima

  function alphaMatrix(matrix) {
    let alphaPrima = [];
    for (let i = 0; i < matrix.length; i++) {
      alphaPrima.push(matrix);
    }
    return alphaPrima;
  }

  //restar matrices
  function restarMatrices(matriz1, matriz2) {
    if (
      matriz1.length !== matriz2.length ||
      matriz1[0].length !== matriz2[0].length
    ) {
      return null;
    }
    const resultado = [];
    for (let i = 0; i < matriz1.length; i++) {
      resultado.push(new Array(matriz1[0].length));
    }
    for (let i = 0; i < matriz1.length; i++) {
      for (let j = 0; j < matriz1[0].length; j++) {
        resultado[i][j] = matriz1[i][j] - matriz2[i][j];
      }
    }
    return resultado;
  }

  // minimos elementos por fila
  function minrowElements(matrix) {
    const minRow = [];
    for (let i = 0; i < matrix.length; i++) {
      let min = matrix[i][0];
      for (let j = 1; j < matrix[i].length; j++) {
        if (matrix[i][j] < min) {
          min = matrix[i][j];
        }
      }
      minRow.push(min);
    }
    return minRow;
  }

  // BETA PRIMA

  function betaPrima(lista) {
    const resultado = [];
    for (let i = 0; i < lista.length; i++) {
      let columna = [];
      for (let j = 0; j < lista.length; j++) {
        if (j === 1) {
          columna.push(lista[i]);
        } else {
          columna.push(0);
        }
      }
      resultado.push(columna);
    }
    return resultado;
  }

  // uses /service/file.js to upload the graph and set the nodes and edges
  const handleFileUpload = async (event) => {
    await fileService.upload(event).then((response) => {
      setNodes(response.nodes);
      setEdges(response.edges);
      let showJohnson = false;
      for (let i = 0; i < response.nodes.length; i++) {
        if (response.nodes[i].data.earlyTime != null) {
          showJohnson = true;
          break;
        }
      }

      setJohnsonRef(showJohnson);
      return response;
    });
  };

  const handleFileDownload = () => {
    const fileName = prompt("Introduzca el nombre del archivo");
    if (fileName === null) return;
    // console.log(fileName);
    // fileService.download(nodes, edges, `${fileName}.json`);
    fileService.download(nodes, edges, `${fileName}.json`);
  };

  const handleJohnson = () => {
    if (nodes.length === 0 || edges.length === 0) {
      alert("No hay nodos o aristas");
      return;
    }
    setJohnsonRef(true);

    // matrix with zeros
    const matrix = new Array(nodes.length)
      .fill(0)
      .map(() => new Array(nodes.length).fill(0));

    // Sort nodes by their x position in ascending order
    const sortedNodes = nodes.sort((a, b) => a.position.x - b.position.x);
    // Sort edges based on source node's x position in ascending order
    const sortedEdges = edges.sort((a, b) => {
      const sourceNodeA = nodes.find((node) => node.id === a.source);
      const sourceNodeB = nodes.find((node) => node.id === b.source);
      return sourceNodeA.position.x - sourceNodeB.position.x;
    });

    sortedEdges.forEach((edge) => {
      const sourceIndex = sortedNodes.indexOf(
        nodes.find((node) => node.id === edge.source)
      );
      const targetIndex = sortedNodes.indexOf(
        nodes.find((node) => node.id === edge.target)
      );
      matrix[sourceIndex][targetIndex] =
        typeof edge.data.weight === "undefined"
          ? 1
          : parseInt(edge.data.weight);
    });

    // johnson algorithm
    let slacks, earlyTimes, lateTimes;

    ({ slacks, earlyTimes, lateTimes } = johnsonAlgorithm(matrix));
    // set edges labels and
    const newEdges = sortedEdges.map((edge) => {
      const sourceIndex = sortedNodes.indexOf(
        nodes.find((node) => node.id === edge.source)
      );
      const targetIndex = sortedNodes.indexOf(
        nodes.find((node) => node.id === edge.target)
      );
      return {
        ...edge,
        data: {
          ...edge.data,
          label: `h = ${slacks[sourceIndex][targetIndex]}`,
        },
        markerEnd: {
          ...edge.markerEnd,
          color: slacks[sourceIndex][targetIndex] === 0 ? "green" : "#342e37",
        },
        animated: slacks[sourceIndex][targetIndex] === 0 ? true : false,
        style: {
          stroke: slacks[sourceIndex][targetIndex] === 0 ? "green" : "#342e37",
          strokeWidth: slacks[sourceIndex][targetIndex] === 0 ? 3 : 2,
        },
      };
    });
    setEdges(newEdges);

    const newNodes = sortedNodes.map((node, index) => {
      return {
        ...node,
        data: {
          ...node.data,
          earlyTime: earlyTimes[index],
          lateTime: lateTimes[index],
        },
      };
    });
    setNodes(newNodes);

    //Calcular tiempo de llegada final
    const finalArrivalTime = Math.max(...earlyTimes);
    setFinalArrivalTime(finalArrivalTime);
  };

  const handleClear = () => {
    setNodes([]);
    setEdges([]);
    setJohnsonRef(false);
  };

  return (
    <div
      style={{
        //give 80% height
        height: "100vh",
      }}
    >
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
        onConnect={handleConnect} // Use the new handleConnect function
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
          <ControlButton onClick={handleMatrix}>
            <img
              src={
                showMatrix ? HideAdjacencyMatrixIcon : ShowAdjacencyMatrixIcon
              }
              alt="A"
              style={{
                width: "20px",
              }}
            />
          </ControlButton>
          <ControlButton onClick={handleJohnson}>
            <img
              src={JonsonIcon}
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
          <ControlButton onClick={() => setShowDocument(true)} style={{ color: "#000" }}>
            ?
          </ControlButton>
        </Controls>
      </ReactFlow>
      {JohnsonRef ? (
        <div
          style={{
            position: "absolute",
            bottom: "0",
            left: "60px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <h5 style={{ display: "inline-block", marginRight: "10px",  }}>
            Ruta Critica - Johnson
          </h5>
          <img
            src={CriticPathIcon}
            alt="Critic Path"
            style={{ width: "220px" }}
          />
          <h5 style={{ display: "inline-block", marginLeft: "10px" }}>
            Tiempo de llegada final: {finalArrivalTime}
          </h5>
        </div>
      ) : (
        <></>
      )}
      {showDocument && (
        <Modal
          show={showDocument}
          onClose={() => setShowDocument(false)}
          title="Documento"
          content={
            <iframe
              src="https://docs.google.com/document/d/e/2PACX-1vT91GghbBRq8liYZcYAzZdxL-ScoRvTZ4sdBByE7IwpiFsh2kXf8NjbdXCNT6nw8QoysT4G-0mUqDad/pub"
              width="100%"
              height="600px"
              style={{ border: "none" }}
            ></iframe>
          }
        />
      )}
    </div>
  );
};

export default Flow;
