import React, { useState } from "react";
import DownloadIcon from "/icons/download.png";
import UploadIcon from "/icons/upload.png";
import fileService from "../service/matrixFile";
import { transportAlgorithm } from "../algorithms/transport";
import Modal from "./Modal";
import RemoveAllIcon from "/icons/removeAll.png";

import "../styles/AssignmentTransport.css";
import TransportationMatrix from "./TransportationMatrix";

const NorthWest = () => {
  // Estados principales
  const [numRows, setNumRows] = useState(2);
  const [numColumns, setNumColumns] = useState(2);
  const [inputMatrix, setInputMatrix] = useState(
    Array.from({ length: numRows + 2 }, () =>
      new Array(numColumns + 2).fill("")
    )
  );

  // Nueva copia temporal para cálculos y visualización
  const [tempMatrix, setTempMatrix] = useState([]);

  const [allocationMatrix, setAllocationMatrix] = useState([]);
  const [minMax, setMinMax] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showDocument, setShowDocument] = useState(false); // Estado para controlar el modal
  const [textualSolution, setTextualSolution] = useState([]);

  //We can change the number of rows by clicking on the button
  const handleNumRows = () => {
    let newNumRows = prompt("Ingrese el numero de filas");
    if (newNumRows === null || newNumRows === "") {
      return;
    }
    if (isNaN(newNumRows) || newNumRows < 1) {
      alert("Ingrese un numero valido");
      return;
    }
    newNumRows = parseInt(newNumRows);
    const difference = newNumRows - numRows;
    // In case we increase the number of rows, we add a new row with before the last row
    if (difference > 0) {
      const newInputMatrix = inputMatrix.map((row) => row.map((cell) => cell));
      for (let i = 0; i < difference; i++) {
        newInputMatrix.splice(
          newInputMatrix.length - 1,
          0,
          new Array(newInputMatrix[0].length).fill("")
        );
      }
      setInputMatrix(newInputMatrix);
    }
    // In case we decrease the number of rows, we remove the last rows except the last one
    else {
      const newInputMatrix = inputMatrix.map((row) => row.map((cell) => cell));
      for (let i = 0; i < -difference; i++) {
        newInputMatrix.splice(newInputMatrix.length - 2, 1);
      }
      setInputMatrix(newInputMatrix);
    }
    setNumRows(newNumRows);
  };

  // We can change the number of columns by clicking on the button
  const handleNumColumns = () => {
    let newNumColumns = prompt("Ingrese el numero de columnas");
    if (newNumColumns === null || newNumColumns === "") {
      return;
    }
    if (isNaN(newNumColumns) || newNumColumns < 1) {
      alert("Ingrese un numero valido");
      return;
    }
    newNumColumns = parseInt(newNumColumns);
    const difference = newNumColumns - numColumns;
    // In case we increase the number of columns, we add a new column with before the last column
    if (difference > 0) {
      const newInputMatrix = inputMatrix.map((row) => row.map((cell) => cell));
      for (let i = 0; i < difference; i++) {
        for (let j = 0; j < newInputMatrix.length; j++) {
          newInputMatrix[j].splice(newInputMatrix[j].length - 1, 0, "");
        }
      }
      setInputMatrix(newInputMatrix);
    }
    // In case we decrease the number of columns, we remove the last columns except the last one
    else {
      const newInputMatrix = inputMatrix.map((row) => row.map((cell) => cell));
      for (let i = 0; i < -difference; i++) {
        for (let j = 0; j < newInputMatrix.length; j++) {
          newInputMatrix[j].splice(newInputMatrix[j].length - 2, 1);
        }
      }
      setInputMatrix(newInputMatrix);
    }
    setNumColumns(newNumColumns);
  };

  // We can change the value of the matrix by clicking on the input, this depends on matrixFile service
  const handleFileUpload = async (event) => {
    await fileService.uploadMatrix(event).then((response) => {
      // console.log(response);

      setNumRows(response.numRows);
      setNumColumns(response.numColumns);
      setInputMatrix(response.matrix);
      return response;
    });
  };

  // We can download the matrix by clicking on the button, this depends on matrixFile service
  const handleFileDownload = () => {
    const fileName = prompt("Introduzca el nombre del archivo");
    if (fileName === null) return;
    fileService.downloadMatrix(
      "transport",
      numRows,
      numColumns,
      inputMatrix,
      `${fileName}.json`
    );
  };

  const handleMax = () => {
    // Crear una copia temporal de la matriz de entrada
    const temp = [...inputMatrix.map((row) => [...row])];

    // Agregar filas y columnas ficticias a la copia temporal
    const sumSupply = temp.slice(1, numRows + 1).reduce((acc, row) => acc + parseInt(row[numColumns + 1] || 0), 0);
    const sumDemand = temp[numRows + 1].slice(1, numColumns + 1).reduce((acc, val) => acc + parseInt(val || 0), 0);

    if (sumSupply > sumDemand) {
      // Agregar columna ficticia
      temp[0].splice(numColumns + 1, 0, "Ficticia");
      for (let i = 1; i <= numRows; i++) {
        temp[i].splice(numColumns + 1, 0, "0");
      }
      temp[numRows + 1].splice(numColumns + 1, 0, (sumSupply - sumDemand).toString());
    } else if (sumDemand > sumSupply) {
      // Agregar fila ficticia
      const fictitiousRow = new Array(numColumns + 2).fill("0");
      fictitiousRow[0] = "Ficticia";
      fictitiousRow[numColumns + 1] = (sumDemand - sumSupply).toString();
      temp.splice(numRows + 1, 0, fictitiousRow);
    }

    // Guardar la copia temporal en el estado
    setTempMatrix(temp);

    // Ejecutar el algoritmo con la copia temporal
    const data = {
      algorithm: "transport-max",
      numRows: temp.length - 2,
      numColumns: temp[0].length - 2,
      matrix: temp,
    };

    try {
      const { allocationMatrix, totalCost, textualSolution } = transportAlgorithm(data);

      // Mostrar los resultados en el modal
      setAllocationMatrix(allocationMatrix);
      setTotalCost(totalCost);
      setTextualSolution(textualSolution);
      setShowModal(true);
      setMinMax(true);
    } catch (error) {
      alert(error);
    }
  };

  const handleMin = () => {
    // Crear una copia temporal de la matriz de entrada
    const temp = [...inputMatrix.map((row) => [...row])];

    // Agregar filas y columnas ficticias a la copia temporal
    const sumSupply = temp.slice(1, numRows + 1).reduce((acc, row) => acc + parseInt(row[numColumns + 1] || 0), 0);
    const sumDemand = temp[numRows + 1].slice(1, numColumns + 1).reduce((acc, val) => acc + parseInt(val || 0), 0);

    if (sumSupply > sumDemand) {
      // Agregar columna ficticia
      temp[0].splice(numColumns + 1, 0, "Ficticia");
      for (let i = 1; i <= numRows; i++) {
        temp[i].splice(numColumns + 1, 0, "0");
      }
      temp[numRows + 1].splice(numColumns + 1, 0, (sumSupply - sumDemand).toString());
    } else if (sumDemand > sumSupply) {
      // Agregar fila ficticia
      const fictitiousRow = new Array(numColumns + 2).fill("0");
      fictitiousRow[0] = "Ficticia";
      fictitiousRow[numColumns + 1] = (sumDemand - sumSupply).toString();
      temp.splice(numRows + 1, 0, fictitiousRow);
    }

    // Guardar la copia temporal en el estado
    setTempMatrix(temp);

    // Ejecutar el algoritmo con la copia temporal
    const data = {
      algorithm: "transport-min",
      numRows: temp.length - 2,
      numColumns: temp[0].length - 2,
      matrix: temp,
    };

    try {
      const { allocationMatrix, totalCost, textualSolution } = transportAlgorithm(data);

      // Mostrar los resultados en el modal
      setAllocationMatrix(allocationMatrix);
      setTotalCost(totalCost);
      setTextualSolution(textualSolution);
      setShowModal(true);
      setMinMax(false);
    } catch (error) {
      alert(error);
    }
  };

  const handleClear = () => {
    setNumRows(2);
    setNumColumns(2);
    setInputMatrix(
      Array.from({ length: numRows + 2 }, () =>
        new Array(numColumns + 2).fill("")
      )
    );
  };

  return (
    <>
      {showModal && (
        <Modal
          content={
            <TransportationMatrix
              inputMatrix={tempMatrix} // Usar la copia temporal
              allocationMatrix={allocationMatrix}
              totalCost={totalCost}
              minMax={minMax}
              textualSolution={textualSolution}
            />
          }
          show={showModal}
          onClose={() => setShowModal(false)}
        />
      )}

      {showDocument && (
        <Modal
          show={showDocument}
          onClose={() => setShowDocument(false)}
          title="Documento"
          content={
            <iframe
              src="https://docs.google.com/document/d/e/2PACX-1vTu_1M4apjbqikdQA0-wyDgYBE1uuK1mQf1itkHXAvRrgnUrHtbZG3_hTzdWB0Ufk-HxBSSpr7yI32v/pub"
              width="100%"
              height="600px"
              style={{ border: "none" }}
            ></iframe>
          }
        />
      )}

      <input
        id="file-input"
        type="file"
        onChange={handleFileUpload}
        style={{ display: "none" }}
      />

      <h1
        style={{
          textAlign: "center",
        }}
      >
        Algoritmo de Transporte
      </h1>

      <br />

      <div className="matrix">
        <div className="matrix-header">
          <div className="matrix-header-cell"></div>
          {Array.from({ length: numColumns }, (_, i) => (
            // Save the value of the input in the array to (first row)
            <div className="matrix-header-cell" key={i}>
              <input
                type="text"
                value={inputMatrix[0][i + 1]}
                onChange={(e) => {
                  const value = e.target.value;
                  setInputMatrix((prev) => {
                    const newMatrix = [...prev];
                    newMatrix[0][i + 1] = value;
                    return newMatrix;
                  });
                }}
              />
            </div>
          ))}
          <div className="matrix-header-cell">
            <p style={{ fontSize: 15 }}>DISPONIBILIDAD</p>
          </div>
        </div>
        {Array.from({ length: numRows }, (_, i) => (
          <div className="matrix-row" key={i}>
            <div
              className="matrix-header-cell"
              style={{ backgroundColor: "#ccc" }}
            >
              <input
                type="text"
                value={inputMatrix[i + 1][0]}
                onChange={(e) => {
                  const value = e.target.value;
                  setInputMatrix((prev) => {
                    const newMatrix = [...prev];
                    newMatrix[i + 1][0] = value;
                    return newMatrix;
                  });
                }}
              />
            </div>
            {Array.from({ length: numColumns }, (_, j) => (
              <div className="matrix-cell" key={j}>
                <input
                  type="text"
                  value={inputMatrix[i + 1][j + 1]}
                  onChange={(e) => {
                    const value = e.target.value;
                    setInputMatrix((prev) => {
                      const newMatrix = [...prev];
                      newMatrix[i + 1][j + 1] = value;
                      return newMatrix;
                    });
                  }}
                />
              </div>
            ))}
            <div className="matrix-cell" style={{ backgroundColor: "#f2f2f2" }}>
              <input
                type="text"
                value={inputMatrix[i + 1][numColumns + 1]}
                onChange={(e) => {
                  const value = e.target.value;
                  setInputMatrix((prev) => {
                    const newMatrix = [...prev];
                    newMatrix[i + 1][numColumns + 1] = value;
                    return newMatrix;
                  });
                }}
              />
            </div>
          </div>
        ))}
        <div className="matrix-row">
          <div
            className="matrix-header-cell"
            style={{ backgroundColor: "#ccc", fontWeight: "bold" }}
          >
            <p style={{ fontSize: 15 }}>DEMANDA</p>
          </div>
          {Array.from({ length: numColumns }, (_, i) => (
            <div
              className="matrix-cell"
              style={{ backgroundColor: "#f2f2f2" }}
              key={i}
            >
              <input
                type="text"
                value={inputMatrix[numRows + 1][i + 1]}
                onChange={(e) => {
                  const value = e.target.value;
                  setInputMatrix((prev) => {
                    const newMatrix = [...prev];
                    newMatrix[numRows + 1][i + 1] = value;
                    return newMatrix;
                  });
                }}
              />
            </div>
          ))}
          <div
            className="matrix-cell"
            style={{ backgroundColor: "#f2f2f2" }}
          ></div>
        </div>
      </div>

      <div className="controls-bottom-left">
        <button className="controls-botton" onClick={handleNumRows}>
          #F
        </button>
        <button className="controls-botton" onClick={handleNumColumns}>
          #C
        </button>
        <button
          className="controls-botton"
          style={{ fontSize: 10 }}
          onClick={handleMax}
        >
          MAX
        </button>
        <button
          className="controls-botton"
          style={{ fontSize: 10 }}
          onClick={handleMin}
        >
          MIN
        </button>
        <button className="controls-botton" onClick={handleFileDownload}>
          <img
            src={DownloadIcon}
            alt="A"
            style={{
              width: "20px",
            }}
          />
        </button>
        <button
          className="controls-botton"
          onClick={() => document.getElementById("file-input").click()}
        >
          <img
            src={UploadIcon}
            alt="A"
            style={{
              width: "20px",
            }}
          />
        </button>
        <button className="controls-botton" onClick={handleClear}>
          <img
            src={RemoveAllIcon}
            alt="Remove All"
            style={{
              width: "20px",
            }}
          />
        </button>
        <button
          className="controls-botton"
          onClick={() => setShowDocument(true)} // Cambiar para abrir el modal
          style={{ color: "#000" }}
        >
          ?
        </button>
      </div>
    </>
  );
};

export default NorthWest;
