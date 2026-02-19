import React, { memo, useState } from "react";
import PropTypes from "prop-types";

import { Handle } from "reactflow";

import useStore from "./../store/FlowStore";
import { shallow } from "zustand/shallow";
import { useLocation } from "react-router-dom";
import useFlowStore from "./../store/FlowStore";

import "./../styles/RingHandle.css";

const selector = (state) => ({
  // Persona
  deletePersona: state.deletePersona,

  // actions
  deleteNode: state.deleteNode,

  // nodes
  nodes: state.nodes,
  setNodes: state.setNodes,
  onNodesChange: state.onNodesChange,
});

// eslint-disable-next-line react/display-name
const CustomNode = memo(({ id, handleId, data, isConnectable }) => {
  const { deletePersona, deleteNode, onNodesChange } = useStore(
    selector,
    shallow
  );
  const { nodes, setNodes } = useFlowStore(selector, shallow);

  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);

  const location = useLocation();
  const handleNodeClick = () => {
    if (deletePersona) {
      deleteNode(id);
      return;
    }
    if (location.pathname === "/graph-theory-and-algorithms/compet") {
      const selectedNode = nodes.find((node) => node.id === id);
      // Promt to introduce the x and y coordinates
      const x = prompt("Introduzca la coordenada x");
      const y = prompt("Introduzca la coordenada y");
      // Validate if null or empty
      if (x === null || x === "" || y === null || y === "") {
        alert("Introduzca un número");
        return;
      }
      // Validate if the user introduced a number
      if (isNaN(x) || isNaN(y)) {
        alert("Introduzca un número");
        return;
      }
      selectedNode.position = { x: parseInt(x), y: parseInt(y) };
      setNodes(nodes);
      onNodesChange(nodes);
      return;
    }
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleChange = (e) => {
    setLabel(e.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    const updatedNodes = nodes.map((node) => {
      if (node.id === id) {
        return {
          ...node,
          data: {
            ...node.data,
            label: label,
          },
        };
      }
      return node;
    });
    setNodes(updatedNodes);
  };

  const iscustomNode =
    (data.earlyTime === undefined &&
      data.lateTime === undefined &&
      data.cost === undefined &&
      data.weight === undefined) ||
    (data.earlyTime === null &&
      data.lateTime === null &&
      data.cost === null &&
      data.weight === null);
  const isJhonsonNode =
    data.earlyTime !== undefined &&
    data.earlyTime !== null &&
    data.lateTime !== undefined &&
    data.lateTime !== null;
  const isCentroidNode = data.weight !== undefined && data.weight !== null;
  const isDijkstraNode = data.cost !== undefined && data.cost !== null;

  return (
    <div className="node-container" onClick={handleNodeClick} onDoubleClick={handleDoubleClick}>
      {isEditing ? (
        <input
          type="text"
          value={label}
          onChange={handleChange}
          onBlur={handleBlur}
          autoFocus
        />
      ) : (
        <>
          {iscustomNode ? (
            <div className="customNode">{label}</div>
          ) : isJhonsonNode ? (
            <div className="customJohnsonNode">
              {label}
              <hr />
              {data.earlyTime} | {data.lateTime}
            </div>
          ) : isCentroidNode ? (
            <div className="customCentroidNode"> {label} </div>
          ) : isDijkstraNode ? (
            <div
              className="customDijkstraNode"
              style={
                data.cost == 0
                  ? { backgroundColor: "salmon" }
                  : { backgroundColor: "#3c91e6" }
              }
            >
              {label}
              <br />
              {`[${data.cost}]`}
            </div>
          ) : (
            <div className="customNode">{label}</div>
          )}
        </>
      )}
      <Handle
        id={`${handleId}-left`}
        type="source"
        position="left"
        style={{
          opacity: 0,
          marginLeft: "5px",
          border: "1px solid #fff",
        }}
        isConnectable={isConnectable}
        className="ring-handle"
      />
      <Handle
        id={`${handleId}-right`}
        type="source"
        position="right"
        style={{
          opacity: 0,
          marginRight: "5px",
          border: "1px solid #fff",
        }}
        isConnectable={isConnectable}
      />
      <Handle
        id={`${handleId}-top`}
        type="source"
        position="top"
        style={{
          opacity: 0,
          border: "1px solid #fff",
          marginTop: "5px",
        }}
        isConnectable={isConnectable}
      />
      <Handle
        id={`${handleId}-bottom`}
        type="source"
        position="bottom"
        style={{
          opacity: 0,
          border: "1px solid #fff",
          marginBottom: "5px",
        }}
        isConnectable={isConnectable}
      />
    </div>
  );
});

CustomNode.propTypes = {
  id: PropTypes.string.isRequired,
  handleId: PropTypes.string, //FIXME: isRequired
  data: PropTypes.shape({
    label: PropTypes.string.isRequired,
    earlyTime: PropTypes.number,
    lateTime: PropTypes.number,
    cost: PropTypes.number,
    weight: PropTypes.number,
  }).isRequired,
  isConnectable: PropTypes.bool.isRequired,
};

export default CustomNode;
