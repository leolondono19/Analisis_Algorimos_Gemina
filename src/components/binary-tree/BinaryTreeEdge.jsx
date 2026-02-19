import React from "react";
import PropTypes from "prop-types";

import { EdgeLabelRenderer } from "reactflow";

const foreignObjectSize = 40;
const BinaryTreeEdge = ({
  id,
  style = {
    flex: "1 1",
    stroke: "#342e37",
    strokeWidth: 3,
  },
  data = { label: "", weight: 1 },
  markerEnd,
}) => {
  let edgePath, labelX, labelY;

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
    </>
  );
};

BinaryTreeEdge.propTypes = {
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

export default BinaryTreeEdge;
