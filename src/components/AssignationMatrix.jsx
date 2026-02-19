import React from "react";
import PropTypes from "prop-types";

import "../styles/Optimal.css";

const AssignationMatrix = ({ nodes, matrix, matrixpos, totalCost }) => {
  const rowCount = matrix.length;
  const headerNodes = nodes.filter((node) => node.id > rowCount - 1);

  return (
    <div>
      <table style={{ width: "100%" }}>
        <thead>
          <tr>
            <th></th>
            {headerNodes.map((node) => (
              <th key={node.id}>{node.data.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td className="labels" style={{ fontWeight: "bold" }}>
                {nodes[rowIndex].data.label}
              </td>
              {row.map((cell, cellIndex) => {
                const i = matrixpos.findIndex(
                  (coords) => coords[0] === rowIndex && coords[1] === cellIndex
                );
                const className = `weights ${i !== -1 ? "red" : ""}`;
                return (
                  <td className={className} key={cellIndex}>
                    {cell}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <h1> Costo total: {totalCost}</h1>
      </div>
    </div>
  );
};

AssignationMatrix.propTypes = {
  nodes: PropTypes.array.isRequired,
  matrix: PropTypes.array.isRequired,
  matrixpos: PropTypes.array.isRequired,
  totalCost: PropTypes.number.isRequired,
};

export default AssignationMatrix;
