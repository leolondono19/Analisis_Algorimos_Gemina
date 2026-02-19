import React from "react";
import PropTypes from "prop-types";

const AdjacencyMatrix = ({ nodes, matrix }) => {
  // Calcular la suma de cada fila
  const rowSums = matrix.map(row => row.reduce((acc, val) => acc + Number(val), 0));
  // Calcular la suma de cada columna
  const colSums = matrix.reduce((acc, row) => row.map((val, i) => acc[i] + Number(val)), new Array(matrix[0].length).fill(0));
  // Calcular la suma total
  const totalSum = rowSums.reduce((acc, val) => acc + val, 0);

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th></th>
            {nodes.map((node) => (
              <th key={node.id}>{node.data.label}</th>
            ))}
            <th>Suma</th>
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td className="labels" style={{ fontWeight: "bold" }}>
                {nodes[rowIndex].data.label}
              </td>
              {row.map((cell, cellIndex) => (
                <td className="weights" key={cellIndex}>
                  {cell}
                </td>
              ))}
              <td className="weights">{rowSums[rowIndex]}</td>
            </tr>
          ))}
          <tr>
            <td className="labels" style={{ fontWeight: "bold" }}>Suma</td>
            {colSums.map((sum, index) => (
              <td className="weights" key={index}>{sum}</td>
            ))}
            <td className="weights">{totalSum}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

AdjacencyMatrix.propTypes = {
  nodes: PropTypes.array.isRequired,
  matrix: PropTypes.array.isRequired,
};

export default AdjacencyMatrix;
