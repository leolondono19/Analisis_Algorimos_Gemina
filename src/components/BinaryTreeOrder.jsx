import React from "react";
import PropTypes from "prop-types";
import "../styles/Dijkstra.css";

const BinaryTreeOrder = ({ preOrder, inOrder, postOrder }) => {
  return (
    <div className="pathsContainer">
      <table className="pathsTable">
        <thead>
          <tr>
            <th>ORDER </th>
            <th>RECORRIDO</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="originColumn">PRE ORDER</td>
            <td className="pathColumn">
              {preOrder.map((node, nodeIndex) => (
                <span key={nodeIndex} style={{ margin: "0 10px" }}>
                  {node}
                  {nodeIndex !== preOrder.length - 1 && <span>,</span>}
                </span>
              ))}
            </td>
          </tr>
          <tr>
            <td className="originColumn">IN ORDER</td>
            <td className="pathColumn">
              {inOrder.map((node, nodeIndex) => (
                <span key={nodeIndex} style={{ margin: "0 10px" }}>
                  {node}
                  {nodeIndex !== inOrder.length - 1 && <span>,</span>}
                </span>
              ))}
            </td>
          </tr>
          <tr>
            <td className="originColumn">POST ORDER</td>
            <td className="pathColumn">
              {postOrder.map((node, nodeIndex) => (
                <span key={nodeIndex} style={{ margin: "0 10px" }}>
                  {node}
                  {nodeIndex !== postOrder.length - 1 && <span>,</span>}
                </span>
              ))}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

BinaryTreeOrder.propTypes = {
  preOrder: PropTypes.array.isRequired,
  inOrder: PropTypes.array.isRequired,
  postOrder: PropTypes.array.isRequired,
};

export default BinaryTreeOrder;
