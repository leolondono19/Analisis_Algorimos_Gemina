import React from "react";
import PropTypes from "prop-types";

const MiniMapNode = ({ x, y, color }) => {
  return <circle cx={x} cy={y} r="50" fill={color} />;
};

MiniMapNode.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
};

export default MiniMapNode;
