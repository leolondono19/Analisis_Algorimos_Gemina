import React from "react";
import PropTypes from "prop-types";

import { getBezierPath, EdgeLabelRenderer } from "reactflow";

import useStore from "./../store/FlowStore";
import { useLocation } from "react-router-dom";

const selector = (state) => ({
  // Persona
  deletePersona: state.deletePersona,

  // actions
  deleteEdge: state.deleteEdge,
});

const foreignObjectSize = 40;
const GraphEdge = ({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {
    flex: "1 1",
    stroke: "#342e37",
    strokeWidth: 3,
  },
  data = { label: "", weight: 1, isSolution: false },
  markerEnd,
}) => {
  const setWeight = useStore((state) => state.setWeight);
  const { deletePersona, deleteEdge } = useStore(selector);

  // Calculate dynamic curvature based on the position of the nodes
  const calculateCurvature = (sourceX, sourceY, targetX, targetY) => {
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return Math.min(0.5, 100 / distance); // Adjust the factor as needed
  };

  const location = useLocation();

  // Usar línea recta solo para el árbol binario
  let edgePath, labelX, labelY;
  if (location.pathname === "/graph-theory-and-algorithms/binary-tree") {
    edgePath = `M${sourceX},${sourceY} L${targetX},${targetY}`;
    // Coloca la etiqueta en el punto medio de la línea
    labelX = (sourceX + targetX) / 2;
    labelY = (sourceY + targetY) / 2;
  } else {
    let controlX, controlY;
    const curveFactor = calculateCurvature(sourceX, sourceY, targetX, targetY);
    [edgePath, controlX, controlY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
      curvature: curveFactor,
    });
    labelX = controlX;
    labelY = controlY;
  }

  // Custom color for edges in jhonson algorithm
  if (location.pathname === "/graph-theory-and-algorithms/johnson") {
    if (data.label !== "") {
      style = {
        ...style,
        stroke: data.label === "h = 0" ? "green" : "#342e37",
      };
    }
  }
  // Custom color for edges in kruskal algorithm
  if (location.pathname === "/graph-theory-and-algorithms/kruskal") {
    if (data.label === " ") {
      style = {
        ...style,
        stroke: "green",
      };
    }
    // transparent markerEnd for edges in kruskal algorithm
    markerEnd = {
      ...markerEnd,
      color: "transparent",
    };
  }

  return (
    <>
      <path
        id={id}
        style={{
          ...style,
          stroke: data.isSolution ? "green" : style.stroke,
          strokeWidth: data.isSolution ? 4 : style.strokeWidth,
        }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            padding: 10,
            borderRadius: 5,
            fontSize: 12,
            fontWeight: 700,
            color: "#342e37",
          }}
          className="nodrag nopan"
        >
          {data.weight}
          <br />
          {data.isSolution && (
            <span style={{ color: "green", fontSize: "10px" }}>
              Parte de la solución
            </span>
          )}
        </div>
      </EdgeLabelRenderer>
      <foreignObject
        id="capa1"
        width={foreignObjectSize}
        height={foreignObjectSize}
        x={labelX - foreignObjectSize / 2}
        y={labelY - foreignObjectSize / 2}
        className="edgebutton-foreignobject"
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        <div>
          <button
            className="edgebutton"
            onClick={() => (deletePersona ? deleteEdge(id) : setWeight(id))}
            style={{
              display:
                location.pathname === "/graph-theory-and-algorithms/binary-tree"
                  ? "none"
                  : "block",
            }}
          >
            {data.weight}
          </button>
        </div>
      </foreignObject>
    </>
  );
};

GraphEdge.propTypes = {
  id: PropTypes.string.isRequired,
  source: PropTypes.string.isRequired,
  target: PropTypes.string.isRequired,
  sourceX: PropTypes.number.isRequired,
  sourceY: PropTypes.number.isRequired,
  targetX: PropTypes.number.isRequired,
  targetY: PropTypes.number.isRequired,
  sourcePosition: PropTypes.string.isRequired,
  targetPosition: PropTypes.string.isRequired,
  style: PropTypes.object,
  data: PropTypes.object,
  markerEnd: PropTypes.string,
};

export default GraphEdge;
