import React from "react";

import PropsTypes from "prop-types";

import "./../../styles/CustomComponentNode.css";

const CustomComponentNode = ({ children }) => {
  return (
    <>
      <div className="custom-component-node">
        <div className="content">{children}</div>
      </div>
    </>
  );
};

CustomComponentNode.propTypes = {
  children: PropsTypes.node.isRequired,
};

export default CustomComponentNode;
