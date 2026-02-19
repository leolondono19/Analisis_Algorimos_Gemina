import React, { useState } from "react";

import ReactFlow, { MiniMap, Controls, ControlButton } from "reactflow";

import RemoveAllIcon from "/icons/removeAll.png";
import TreeIcon from "/icons/tree.png";
import DownloadIcon from "/icons/download.png";
import UploadIcon from "/icons/upload.png";
import ModeIcon from "/icons/mode.png";
import GraphNode from "./GraphNode";
import GraphEdge from "./GraphEdge";
import MiniMapNode from "./MiniMapNode";
import Modal from "./Modal";
import fileService from "../service/treeFile";
import BinaryTreeOrder from "./BinaryTreeOrder";
import useFlowStore from "../store/FlowStore";
import { shallow } from "zustand/shallow";
import {
  generateTreeFromList,
  generateListFromOrders,
  getOrdersFromList,
  generateListFromPostInOrders,
} from "../algorithms/binaryTree";
import "../styles/BinaryTree.css";
import TreeOrdersDisplay from "./TreeOrdersDisplay";

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

const BinaryTree = () => {
  const {
    nodes,
    setNodes,
    edges,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = useFlowStore(selector, shallow);

  const [listModeActive, setListModeActive] = useState(false);
  const [list, setList] = useState([]);
  const [listText, setListText] = useState("");
  const [preOrderText, setPreOrderText] = useState("");
  const [postOrderText, setPostOrderText] = useState("");
  const [inOrderText, setInOrderText] = useState("");
  const [preOrder, setPreOrder] = useState([]);
  const [inOrder, setInOrder] = useState([]);
  const [postOrder, setPostOrder] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showHelp, setShowHelp] = useState(false); // Nuevo estado para el modal de ayuda
  const [showOrdersDisplay, setShowOrdersDisplay] = useState(false); // NUEVO estado
  const [ordersDisplayList, setOrdersDisplayList] = useState([]); // NUEVO estado

  // uses /service/file.js to upload the graph and set the nodes and edges
  const handleFileUpload = async (event) => {
    await fileService.upload(event).then((response) => {
      setNodes(response.nodes);
      setEdges(response.edges);
      setList(response.list);
      return response;
    });
  };

  const handleFileDownload = () => {
    const fileName = prompt("Introduzca el nombre del archivo");
    if (fileName === null) return;
    fileService.download(nodes, edges, list, `${fileName}.json`);
  };

  const handleClear = () => {
    setNodes([]);
    setEdges([]);
    setList([]);
    setListText("");
    setPreOrderText("");
    setPostOrderText("");
    setInOrderText("");
    setShowOrdersDisplay(false); // Oculta el TreeOrdersDisplay
    setOrdersDisplayList([]);    // Limpia la lista de recorridos
  };

  const handleTextChange = (e) => {
    setListText(e.target.value);
  };

  const handlePreOrderTextChange = (e) => {
    setPreOrderText(e.target.value);
  };

  const handlePostOrderTextChange = (e) => {
    setPostOrderText(e.target.value);
  };

  const handleModeChange = () => {
    handleClear();
    setShowOrdersDisplay(false); // Oculta el display al cambiar de modo
    setOrdersDisplayList([]);
    setListModeActive(!listModeActive);
  };

  const showOrder = () => {
    if (list.length === 0) {
      alert("Porfavor genere un arbol primero");
      return;
    }
    const { preOrder, inOrder, postOrder } = getOrdersFromList(list);
    setPreOrder(preOrder);
    setInOrder(inOrder);
    setPostOrder(postOrder);
    setShowModal(true);
  };

  const showTreeFromList = () => {
    if (listText === "" || listText === null) {
      alert("Porfavor ingrese un valor valido");
      return;
    }
    const arrayFromText = listText.split(",").map(Number);
    if (arrayFromText.some(isNaN)) {
      alert("Porfavor ingrese un valor valido");
      return;
    }
    if (new Set(arrayFromText).size !== arrayFromText.length) {
      alert("No se permiten valores repetidos");
      return;
    }
    if (list.some((value) => arrayFromText.includes(value))) {
      alert("No se permiten valores repetidos");
      return;
    }
    setList([...list, ...arrayFromText]);
    setListText("");
    const rootCoordinates = [window.innerWidth / 2, 100];
    const { binaryTree } = generateTreeFromList(
      [...list, ...arrayFromText],
      rootCoordinates
    );
    const newNodes = binaryTree.map((binaryTree) => ({
      type: "graph-node-start",
      id: `${binaryTree.label}`,
      handleId: `${binaryTree.label}`,
      data: { label: ` ${binaryTree.label} ` },
      position: { x: binaryTree.x, y: binaryTree.y },
    }));

    const root = binaryTree[0];
    const newEdges = binaryTree.map((binaryTree) => ({
      source: `${binaryTree.parent}`,
      sourceHandle:
        root.label === binaryTree.parent
          ? root.x < binaryTree.x
            ? "undefined-right"
            : "undefined-left"
          : "undefined-top",
      target: `${binaryTree.label}`,
      targetHandle: "undefined-top",
      id: `${binaryTree.parent}-${binaryTree.label}`,
      type: "graph-edge",
      markerEnd: {
        type: "arrowclosed",
        color: "#342e37",
      },
    }));
    setNodes([...newNodes]);
    setEdges([...newEdges]);
  };

  const validateTraversalLists = (preOrder, inOrder, postOrder) => {
    const lists = [
      { name: "Preorden", arr: preOrder },
      { name: "Inorden", arr: inOrder },
      { name: "Postorden", arr: postOrder },
    ].filter((l) => Array.isArray(l.arr) && l.arr.length > 0);

    const lengths = lists.map((l) => l.arr.length);
    if (new Set(lengths).size > 1) {
      const wrong = lists
        .filter((l) => l.arr.length !== lengths[0])
        .map((l) => l.name);
      alert(
        `Las listas no tienen la misma cantidad de elementos. Revise: ${wrong.join(
          ", "
        )}`
      );
      return false;
    }

    const sorted = lists
      .map((l) => [...l.arr].sort((a, b) => a - b).toString());
    if (new Set(sorted).size > 1) {
      const base = sorted[0];
      const wrong = lists
        .filter((l, i) => sorted[i] !== base)
        .map((l) => l.name);
      alert(
        `Las listas no contienen los mismos elementos. Revise: ${wrong.join(
          ", "
        )}`
      );
      return false;
    }

    return true;
  };

  const showTreeFromOrders = () => {
    const preOrderArray = preOrderText
      ? preOrderText.split(",").map(Number)
      : null;
    const postOrderArray = postOrderText
      ? postOrderText.split(",").map(Number)
      : null;
    const inOrderArray = inOrderText
      ? inOrderText.split(",").map(Number)
      : null;

    const count = [
      !!preOrderArray?.length,
      !!postOrderArray?.length,
      !!inOrderArray?.length,
    ].filter(Boolean).length;
    if (count < 2) {
      alert(
        "Debe ingresar al menos dos recorridos: in-orden + pre-orden, in-orden + post-orden, o pre-orden + post-orden."
      );
      return;
    }

    const arrays = [preOrderArray, postOrderArray, inOrderArray].filter(
      Boolean
    );
    for (const arr of arrays) {
      if (arr.some(isNaN)) {
        alert("Porfavor ingrese valores válidos.");
        return;
      }
      if (new Set(arr).size !== arr.length) {
        alert("No se permiten valores repetidos en el mismo arreglo.");
        return;
      }
    }

    if (!validateTraversalLists(preOrderArray, inOrderArray, postOrderArray)) {
      return;
    }

    let list = [];
    if (inOrderArray && preOrderArray) {
      if (
        inOrderArray.length !== preOrderArray.length ||
        [...inOrderArray].sort().toString() !==
          [...preOrderArray].sort().toString()
      ) {
        alert("Los recorridos no corresponden al mismo árbol.");
        return;
      }
      list = generateListFromOrders(preOrderArray, inOrderArray);
    } else if (inOrderArray && postOrderArray) {
      if (
        inOrderArray.length !== postOrderArray.length ||
        [...inOrderArray].sort().toString() !==
          [...postOrderArray].sort().toString()
      ) {
        alert("Los recorridos no corresponden al mismo árbol.");
        return;
      }
      list = generateListFromPostInOrders(postOrderArray, inOrderArray);
    } else if (preOrderArray && postOrderArray) {
      const inOrderArrayFromText = [...preOrderArray].sort((a, b) => a - b);
      const constructedPostOrder = [];
      constructedPostOrder.push(
        ...constructPostOrder(inOrderArrayFromText, preOrderArray)
      );
      if (constructedPostOrder.toString() !== postOrderArray.toString()) {
        alert(
          "Los arreglos ingresados no son válidos, no se puede construir"
        );
        setNodes([]);
        setEdges([]);
        setList([]);
        return;
      }
      list = generateListFromOrders(preOrderArray, postOrderArray);
    } else {
      alert("Debe ingresar una combinación válida de recorridos.");
      return;
    }

    setList([...list]);
    setOrdersDisplayList([...list]); // Guarda la lista para mostrar los recorridos
    setShowOrdersDisplay(true); // Muestra el TreeOrdersDisplay

    const rootCoordinates = [window.innerWidth / 2, 100];
    const { binaryTree } = generateTreeFromList(list, rootCoordinates);
    const newNodes = binaryTree.map((binaryTree) => ({
      type: "graph-node-start",
      id: `${binaryTree.label}`,
      handleId: `${binaryTree.label}`,
      data: { label: ` ${binaryTree.label} ` },
      position: { x: binaryTree.x, y: binaryTree.y },
    }));

    const root = binaryTree[0];
    const newEdges = binaryTree.map((binaryTree) => ({
      source: `${binaryTree.parent}`,
      sourceHandle:
        root.label === binaryTree.parent
          ? root.x < binaryTree.x
            ? "undefined-right"
            : "undefined-left"
          : "undefined-top",
      target: `${binaryTree.label}`,
      targetHandle: "undefined-top",
      id: `${binaryTree.parent}-${binaryTree.label}`,
      type: "graph-edge",
      markerEnd: {
        type: "arrowclosed",
        color: "#342e37",
      },
    }));
    setNodes([...newNodes]);
    setEdges([...newEdges]);
  };

  const constructPostOrder = (inorder, preorder) => {
    if (inorder.length === 0 || preorder.length === 0) {
      return [];
    }

    const rootValue = preorder[0];
    const rootIndex = inorder.indexOf(rootValue);

    const leftSubtreeInorder = inorder.slice(0, rootIndex);
    const rightSubtreeInorder = inorder.slice(rootIndex + 1);

    const leftSubtreePreorder = preorder.slice(1, rootIndex + 1);
    const rightSubtreePreorder = preorder.slice(rootIndex + 1);

    const leftSubtreePostorder = constructPostOrder(
      leftSubtreeInorder,
      leftSubtreePreorder
    );
    const rightSubtreePostorder = constructPostOrder(
      rightSubtreeInorder,
      rightSubtreePreorder
    );

    const postorder = leftSubtreePostorder.concat(
      rightSubtreePostorder,
      rootValue
    );
    return postorder;
  };

  return (
    <div
      style={{
        height: "100vh",
      }}
    >
      {showModal ? (
        <div>
          <Modal
            content={
              <BinaryTreeOrder
                preOrder={preOrder}
                inOrder={inOrder}
                postOrder={postOrder}
              />
            }
            show={showModal}
            onClose={() => setShowModal(false)}
            title="RECORRIDOS DE ARBOLES BINARIOS"
          ></Modal>
        </div>
      ) : null}
      {showHelp && (
        <Modal
          show={showHelp}
          onClose={() => setShowHelp(false)}
          title="Ayuda"
          content={
            <iframe
              src="https://docs.google.com/document/d/e/2PACX-1vT91GghbBRq8liYZcYAzZdxL-ScoRvTZ4sdBByE7IwpiFsh2kXf8NjbdXCNT6nw8QoysT4G-0mUqDad/pub"
              width="100%"
              height="600px"
              style={{ border: "none" }}
              title="Ayuda"
            ></iframe>
          }
        />
      )}
      <div
        className="list-input-container"
        style={{ display: listModeActive ? "none" : "block" }}
      >
        <label>Ingrese uno o mas datos del arbol</label>
        <input
          type="text"
          placeholder="Ej: 9, 2, 1, 16, 6, 11, 8, 4"
          onChange={handleTextChange}
          value={listText}
        />
        <button onClick={showTreeFromList}>Agregar - Generar arbol</button>
      </div>
      <div
        className="list-input-container"
        style={{ display: !listModeActive ? "none" : "block" }}
      >
        <label>Ingrese el recorrido en pre-orden</label>
        <input
          type="text"
          placeholder="9, 2, 1, 6, 4, 8, 16, 11"
          onChange={handlePreOrderTextChange}
          value={preOrderText}
        />
        <label>Ingrese el recorrido en in-orden</label>
        <input
          type="text"
          placeholder="2, 3, 4, 5, 8, 9"
          onChange={(e) => setInOrderText(e.target.value)}
          value={inOrderText}
        />
        <label>Ingrese el recorrido en post-orden</label>
        <input
          type="text"
          placeholder="1, 4, 8, 6, 2, 11, 16, 9"
          onChange={handlePostOrderTextChange}
          value={postOrderText}
        />
        <button onClick={showTreeFromOrders}>Generar arbol</button>
      </div>
      <input
        id="file-input"
        type="file"
        onChange={handleFileUpload}
        style={{ display: "none" }}
      />

      {list.length > 0 && !listModeActive && (
        <div
          style={{
            position: "absolute",
            top: 80,
            right: 20,
            zIndex: 10,
          }}
        >
          <TreeOrdersDisplay list={list} />
        </div>
      )}

      {/* Mostrar TreeOrdersDisplay en modo 2 si hay lista generada */}
      {showOrdersDisplay && listModeActive && ordersDisplayList.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: 80,
            right: 20,
            zIndex: 10,
          }}
        >
          <TreeOrdersDisplay list={ordersDisplayList} />
        </div>
      )}

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
          <ControlButton onClick={showOrder}>
            <img
              src={TreeIcon}
              alt="A"
              style={{
                width: "20px",
              }}
            />
          </ControlButton>
          <ControlButton onClick={handleModeChange}>
            <img
              src={ModeIcon}
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
            onClick={() => setShowHelp(true)}
            style={{ color: "#000" }}
          >
            ?
          </ControlButton>
        </Controls>
      </ReactFlow>
    </div>
  );
};

export default BinaryTree;
