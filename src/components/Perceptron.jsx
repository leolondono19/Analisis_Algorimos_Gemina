import React, { useState } from "react";
import Modal from "./Modal";
import "../styles/Sorts.css";
import "../styles/Perceptron.css";
import { perceptron } from "../algorithms/perceptron";
import PerceptronSpinner from "./PerceptronSpinner";
import PerceptronResults from "./PerceptronResults";

const Perceptron = () => {
  const [tableData, setTableData] = useState([]);
  const [tableColumns, setTableColumns] = useState(0);
  const [editableColumn, setEditableColumn] = useState([]);
  //Para obtener en matriz las entradas
  const [tableValues, setTableValues] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);

  const [resultValues, setResultValues] = useState([]);
  const [weights, setWeights] = useState([]);

  const [umbral, setUmbral] = useState(0);
  const [razon, setRazon] = useState(0);

  const [lastWeights, setLastWeights] = useState([]);
  const [iterations, setIterations] = useState(0);

  // Limpiar campos
  const handleClear = () => {
    setTableData([]);
    setTableColumns(0);
    setEditableColumn([]);
    setShowModal(false);
    setShowSpinner(false);
    setWeights([]);
  };

  // Funcion que crea la tabla
  const handleTableCreate = () => {
    const columns = parseInt(prompt("Introduzca el número de entradas"));

    if (isNaN(columns)) {
      alert("Ingrese un número válido para las columnas");
      return;
    }

    const rows = Math.pow(2, columns); // Calcular el número de filas

    const newData = generateCombinations(rows, columns);

    setTableData(newData);
    setTableColumns(columns);
    setEditableColumn(Array.from({ length: rows }, () => ""));

    setEditableColumn(Array.from({ length: rows }, () => ""));
    setResultValues([]);
    setWeights([]);

    //Aqui se settean los pesos
    for (let i = 0; i < columns; i++) {
      const weight = parseFloat(
        prompt(`Introduzca el peso sináptico para x${i + 1}`)
      );
      if (isNaN(weight)) {
        alert("Ingrese un número válido para el peso sináptico");
        return;
      }
      setWeights((prev) => [...prev, weight]);
    }

    const matrix = generateCombinations(rows, columns);
    const newTableValues = matrix.map((row) =>
      Array.from({ length: columns }, (_, i) => (row[i] ? 1 : 0))
    );
    setTableValues(newTableValues);

    setTableData(matrix);
    setTableColumns(columns);
    setEditableColumn(Array.from({ length: rows }, () => ""));
    setResultValues([]);
  };

  // Funcion que genera las combinaciones de 0 y 1

  const generateCombinations = (rows, columns) => {
    const combinations = [];
    generateRow([], 0);
    return combinations;

    function generateRow(row, columnIndex) {
      if (columnIndex === columns) {
        combinations.push(row);
        return;
      }

      generateRow([...row, 1], columnIndex + 1);
      generateRow([...row, 0], columnIndex + 1);
    }
  };

  //Funcion que permite que la ultima columna sea editable

  const handleEditableCellValueChange = (rowIndex, value) => {
    const newEditableColumn = [...editableColumn];
    newEditableColumn[rowIndex] = value;
    setEditableColumn(newEditableColumn);

    const newResultValues = [...resultValues];
    newResultValues[rowIndex] = value;
    setResultValues(newResultValues);
  };

  // Entrenar perceptron
  // Aqui se llama a la funcion de entrenamiento
  const handleTrain = () => {
    // console.log(tableValues);
    // console.log(weights);

    setShowModal(true);

    setUmbral(parseFloat(document.getElementById("input1").value));
    setRazon(parseFloat(document.getElementById("input2").value));

    const valoresEditados = editableColumn.map((valor) => valor);
    setResultValues(valoresEditados);

    var resultado = perceptron(
      tableValues,
      weights,
      resultValues,
      razon,
      umbral
    );

    // console.log(resultado);

    setLastWeights(Array.from(resultado.weights));
    if (resultado.iterations == 0) {
      setIterations(1);
    }
    if (resultado.iterations == 101) {
      alert("No se pudo entrenar el perceptron");
      setShowSpinner(false);
      setShowModal(false);
      return;
    }

    setTimeout(() => {
      setShowModal(false);
      setShowSpinner(true);
    }, 3000);

    setIterations(resultado.iterations);
    // console.log(iterations);

    //// console.log(resultado);
  };

  const handleUmbralChange = (e) => {
    setUmbral(e.target.value);
  };

  const handleRazonChange = (e) => {
    setRazon(e.target.value);
  };

  return (
    <div className="container">
      <h1 style={{ textAlign: "center" }}>Perceptron</h1>
      <br />

      <div className="row-p">
        <div className="input-container">
          <label htmlFor="input1">Umbral</label>
          <input
            onChange={handleUmbralChange}
            id="input1"
            className="perceptron-fields"
            type="text"
          />
        </div>

        <div className="input-container">
          <label htmlFor="input2">Razón</label>
          <input
            onChange={handleRazonChange}
            id="input2"
            className="perceptron-fields"
            type="text"
          />
        </div>
      </div>

      <div className="row-intial">
        <button className="buttonSort" onClick={handleClear}>
          Limpiar
        </button>

        <button className="buttonSort" onClick={handleTableCreate}>
          Crear Tabla
        </button>

        <button className="buttonSort" onClick={handleTrain}>
          Entrenar Perceptron
        </button>

        {/* Other buttons */}
      </div>

      {/* Table */}
      {tableColumns > 0 && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                {Array.from({ length: tableColumns }, (_, index) => (
                  <th key={index}>x{index + 1}</th>
                ))}
                <th>Resultado</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, columnIndex) => (
                    <td key={columnIndex}>{cell}</td>
                  ))}
                  <td>
                    <input
                      type="text"
                      value={editableColumn[rowIndex]}
                      onChange={(e) =>
                        handleEditableCellValueChange(rowIndex, e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        content={<PerceptronSpinner> </PerceptronSpinner>}
      ></Modal>

      {/* Perceptron Cartesian */}
      {showSpinner && (
        <PerceptronResults
          iterations={iterations}
          lastWeights={lastWeights}
        ></PerceptronResults>
      )}
    </div>
  );
};

export default Perceptron;
