import React, { memo } from "react";
import PropTypes from "prop-types";

import { Handle } from "reactflow";

import "./../../styles/RingHandle.css";

// eslint-disable-next-line react/display-name
const BinaryTreeNode = memo(({ id, handleId, data, isConnectable }) => {
  const handleNodeClick = () => console.log("handleNodeClick pressed");

  return (
    <div className="node-container" onClick={handleNodeClick}>
      {(data.earlyTime === undefined && data.lateTime === undefined) ||
      (data.earlyTime === null && data.lateTime === null) ? (
        <div className="customNode">{data.label}</div>
      ) : (
        <div className="customJohnsonNode">
          {data.label}
          <hr />
          {data.earlyTime} | {data.lateTime}
        </div>
      )}

      <Handle
        id={`${handleId}-top`}
        type="target"
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

BinaryTreeNode.propTypes = {
  id: PropTypes.string.isRequired,
  handleId: PropTypes.string, //FIXME: isRequired
  data: PropTypes.shape({
    label: PropTypes.string.isRequired,
    earlyTime: PropTypes.number,
    lateTime: PropTypes.number,
  }).isRequired,
  isConnectable: PropTypes.bool.isRequired,
};

export default BinaryTreeNode;
