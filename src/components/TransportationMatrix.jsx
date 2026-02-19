import React from "react";
import PropTypes from "prop-types";
import "../styles/TransportationMatrix.css";

const TransportationMatrix = ({
  inputMatrix,
  allocationMatrix,
  totalCost,
  minMax,
  textualSolution,
}) => {
  const numRows = inputMatrix.length - 2;
  const numColumns = inputMatrix[0].length - 2;

  // Detectar si hay filas o columnas ficticias
  const hasFictitiousRow = inputMatrix[numRows + 1][0] === undefined;
  const hasFictitiousColumn = inputMatrix[0][numColumns + 1] === undefined;

  const supply = Array.from(inputMatrix.slice(1, numRows + 1), (row) =>
    parseInt(row[numColumns + 1])
  );
  const demand = Array.from(
    inputMatrix[numRows + 1].slice(1, numColumns + 1),
    (val) => parseInt(val)
  );

  return (
    <>
      <h1 style={{ textTransform: "uppercase" }}>
        {!minMax ? "Minimización" : "Maximización"} con el algoritmo de
        transporte
      </h1>
      <br />
      <div className="matrix">
        <div className="matrix-header">
          <div className="matrix-header-cell"></div>
          {Array.from({ length: numColumns }, (_, i) => (
            <div
              className={`matrix-header-cell ${
                hasFictitiousColumn && i === numColumns - 1
                  ? "fictitious-column"
                  : ""
              }`}
              key={i}
            >
              {inputMatrix[0][i + 1]}
            </div>
          ))}
          <div className="matrix-header-cell"></div>
        </div>
        {Array.from({ length: numRows }, (_, i) => (
          <div
            className={`matrix-row ${
              hasFictitiousRow && i === numRows - 1 ? "fictitious-row" : ""
            }`}
            key={i}
          >
            <div
              className="matrix-header-cell"
              style={{
                backgroundColor: hasFictitiousRow && i === numRows - 1 ? "#ffebcc" : "#ccc",
                fontWeight: "bold",
              }}
            >
              {inputMatrix[i + 1][0]}
            </div>
            {Array.from({ length: numColumns }, (_, j) => (
              <div
                className={`matrix-cell ${
                  (hasFictitiousRow && i === numRows - 1) ||
                  (hasFictitiousColumn && j === numColumns - 1)
                    ? "fictitious-cell"
                    : ""
                }`}
                key={j}
                style={{
                  backgroundColor:
                    (hasFictitiousRow && i === numRows - 1) ||
                    (hasFictitiousColumn && j === numColumns - 1)
                      ? "#fff" // Fondo blanco para filas o columnas ficticias
                      : allocationMatrix[i][j] !== null && allocationMatrix[i][j] > 0
                      ? "#F2EE82" // Fondo amarillo solo para asignaciones reales
                      : "#fff", // Fondo blanco para el resto
                }}
              >
                {allocationMatrix[i][j] !== null && allocationMatrix[i][j] > 0
                  ? `${inputMatrix[i + 1][j + 1]} (${allocationMatrix[i][j]})`
                  : `${inputMatrix[i + 1][j + 1]} (0)`}
              </div>
            ))}
            <div
              className="matrix-cell"
              style={{
                backgroundColor: hasFictitiousRow && i === numRows - 1 ? "#ffebcc" : "#f2f2f2",
              }}
            >
              {supply[i]}
            </div>
          </div>
        ))}
        <div className="matrix-row">
          <div
            className="matrix-header-cell"
            style={{ backgroundColor: "#ccc", fontWeight: "bold" }}
          ></div>
          {Array.from({ length: numColumns }, (_, i) => (
            <div
              className={`matrix-cell ${
                hasFictitiousColumn && i === numColumns - 1
                  ? "fictitious-cell"
                  : ""
              }`}
              style={{
                backgroundColor: hasFictitiousColumn && i === numColumns - 1 ? "#ffebcc" : "#f2f2f2",
              }}
              key={i}
            >
              {demand[i]}
            </div>
          ))}
          <div
            className="matrix-cell"
            style={{ backgroundColor: "#f2f2f2" }}
          ></div>
        </div>
      </div>
      <h2>Referencia: Costo (Cantidad)</h2>
      <br />
      <h1 style={{ textTransform: "uppercase" }}>
        Costo total: {totalCost} unidades
      </h1>
      <div className="textual-solution-container">
        <h3 className="textual-solution-title">Solución textual:</h3>
        <div className="textual-solution-list">
          {textualSolution.map((text, index) => (
            <div key={index} className="textual-solution-item">
              <span className="solution-index">{index + 1}.</span>
              <span className="solution-text">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

TransportationMatrix.propTypes = {
  inputMatrix: PropTypes.array.isRequired,
  allocationMatrix: PropTypes.array.isRequired,
  totalCost: PropTypes.number.isRequired,
  minMax: PropTypes.bool.isRequired,
  textualSolution: PropTypes.array.isRequired,
};

export default TransportationMatrix;
