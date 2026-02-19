import React from "react";
import PropTypes from "prop-types";

const AssignmentMatrix = ({
  inputMatrix,
  assignmentMatrix,
  totalCost,
  minMax,
}) => {
  const numRows = inputMatrix.length - 2;
  const numColumns = inputMatrix[0].length - 2;

  return (
    <>
      <h1 style={{ textTransform: "uppercase" }}>
        {!minMax ? "Minimización" : "Maximización"} con el algoritmo de
        asignación
      </h1>
      <br />
      <div className="matrix">
        <div className="matrix-header">
          <div className="matrix-header-cell"></div>
          {Array.from({ length: numColumns }, (_, i) => (
            <div className="matrix-header-cell" key={i}>
              {inputMatrix[0][i + 1]}
            </div>
          ))}
        </div>
        {Array.from({ length: numRows }, (_, i) => (
          <div className="matrix-row" key={i}>
            <div
              className="matrix-header-cell"
              style={{ backgroundColor: "#ccc", fontWeight: "bold" }}
            >
              {inputMatrix[i + 1][0]}
            </div>
            {Array.from({ length: numColumns }, (_, j) => (
              <div
                className="matrix-cell"
                key={j}
                style={{
                  backgroundColor:
                    assignmentMatrix[i][j] !== null ? "#F2EE82" : "#fff",
                }}
              >
                {inputMatrix[i + 1][j + 1]}
              </div>
            ))}
          </div>
        ))}
      </div>
      <br />
      <h1 style={{ textTransform: "uppercase" }}>
        Costo total: {totalCost} unidades
      </h1>
    </>
  );
};

AssignmentMatrix.propTypes = {
  inputMatrix: PropTypes.array.isRequired,
  assignmentMatrix: PropTypes.array.isRequired,
  totalCost: PropTypes.number.isRequired,
  minMax: PropTypes.bool.isRequired,
};

export default AssignmentMatrix;
