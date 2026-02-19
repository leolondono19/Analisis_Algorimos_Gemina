import React, { useState } from "react";
import {
  insertionSort,
  selectionSort,
  mergeSort,
  shellSort,
} from "../helpers/sorts_2";
import { generateRandomArray, arrayToString } from "../algorithms/sorts";
import "../styles/Sorts.css";
import Modal from "./Modal";
import ArrayCuadraditos from "./ArrayGraph";
import fileService from "../service/arrayFile";
import SortVisualizer from "./SortVisualizer";
import InsertionSortVisualizer from "./InsertionSortVisualizer";
import SelectionSortVisualizer from "./SelectionSortVisualizer";
import ShellSortVisualizer from "./ShellSortVisualizer";
import MergeSortVisualizer from "./MergeSortVisualizer";

const TestSort = () => {
  const [algorithm, setAlgorithm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [array, setArray] = useState([]);
  const [sortedArray, setSortedArray] = useState([]);
  const [isRandom, setIsRandom] = React.useState(false);
  const [text, setText] = useState("");
  const [readOnly, setReadOnly] = useState(false);
  const [Disabled, setDisabled] = useState(false);
  const [operations, setOperations] = useState(0);
  const [runtime, setRuntime] = useState(0);
  const [steps, setSteps] = useState([]); // Nuevo estado para los pasos
  const [showUserManual, setShowUserManual] = useState(false); // Nuevo estado para el modal

  const handleShowModal = () => {
    setShowModal(false);
  };

  const handleShowUserManual = () => {
    setShowUserManual(true);
  };

  const handleCloseUserManual = () => {
    setShowUserManual(false);
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    const arrayFromText = e.target.value.split(",").map(Number);
    if (arrayFromText.some(isNaN)) {
      alert("Porfavor ingrese un valor valido");
      return;
    }
    setArray(arrayFromText);
  };

  const handleClear = () => {
    setText("");
    setArray([]);
    setSortedArray([]);
    setReadOnly(false);
    setIsRandom(false);
    setDisabled(false);
  };

  const handleRandomArray = () => {
    const n = prompt("¿Cuántos elementos tendrá el arreglo?");
    if (!n || isNaN(n) || n <= 0) {
      alert("Por favor, ingrese un número válido mayor a 0 para la cantidad de elementos.");
      return;
    }

    const min = prompt("Ingrese el valor mínimo del rango:");
    if (!min || isNaN(min)) {
      alert("Por favor, ingrese un número válido para el valor mínimo.");
      return;
    }

    const max = prompt("Ingrese el valor máximo del rango:");
    if (!max || isNaN(max) || Number(max) < Number(min)) {
      alert("Por favor, ingrese un número válido mayor o igual al valor mínimo para el valor máximo.");
      return;
    }

    const randomArray = generateRandomArray(Number(n), Number(min), Number(max));
    setIsRandom(true);
    setArray(randomArray);
    setText(arrayToString(randomArray));
    setDisabled(true);
  };

  const handleSort = (sortFunction, algorithmName) => {
    if (array.length === 0) {
      alert("El arreglo está vacío");
      return;
    }
    const copyArrayAux = [...array];
    const sortedArrayAux = sortFunction(copyArrayAux);
    setSortedArray([...sortedArrayAux.sortedArray]);
    setOperations(sortedArrayAux.numOperations || sortedArrayAux.numSteps);
    setRuntime(sortedArrayAux.runtime);
    setSteps(sortedArrayAux.steps || []); // Guardar los pasos
    setAlgorithm(algorithmName);
    setShowModal(true);
  };

  const handleShellSort = () => {
    if (array.length === 0) {
      alert("El arreglo está vacío");
      return;
    }

    const initialGap = prompt("Ingrese el intervalo (n) para la separación:");
    if (!initialGap || isNaN(initialGap) || initialGap <= 0) {
      alert("Por favor, ingrese un número válido mayor a 0.");
      return;
    }

    const copyArrayAux = [...array];
    const sortedArrayAux = shellSort(copyArrayAux, parseInt(initialGap, 10)); // Pasar el intervalo inicial
    setSortedArray([...sortedArrayAux.sortedArray]);
    setOperations(sortedArrayAux.numOperations || sortedArrayAux.numSteps);
    setRuntime(sortedArrayAux.runtime);
    setSteps(sortedArrayAux.steps || []); // Guardar los pasos
    setAlgorithm("Shell Sort");
    setShowModal(true);
  };

  const handleFileDownload = () => {
    if (array.length === 0) {
      alert("El arreglo está vacío");
      return;
    }
    const fileName = prompt("Introduzca el nombre del archivo");
    if (fileName === null) return;
    fileService.downloadArray(array, `${fileName}.json`);
  };

  const handleFileUpload = async (event) => {
    await fileService.uploadArray(event).then((response) => {
      setIsRandom(true);
      setArray(response.array);
      setText(arrayToString(response.array));
      setDisabled(true);
    });
  };

  const renderVisualizer = () => {
    switch (algorithm) {
      case "Insertion Sort":
        return <InsertionSortVisualizer array={array} steps={steps} />;
      case "Selection Sort":
        return <SelectionSortVisualizer array={array} steps={steps} />;
      case "Shell Sort":
        return <ShellSortVisualizer array={array} steps={steps} />;
      case "Merge Sort":
        return <MergeSortVisualizer array={array} steps={steps} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <h1
        style={{
          textAlign: "center",
        }}
      >
        Algoritmos de Ordenamiento
      </h1>
      <br />

      <div>
        <input
          id="file-input"
          type="file"
          onChange={handleFileUpload}
          style={{ display: "none" }}
        />

        <textarea
          id="textarea"
          rows="1"
          value={isRandom ? array : text}
          onChange={handleTextChange}
          disabled={readOnly}
        />
      </div>
      <div className="row-intial">
        <button
          className="buttonSort"
          onClick={handleRandomArray}
          disabled={Disabled}
        >
          Arreglo Aleatorio
        </button>
        <button className="buttonSort" onClick={handleClear}>
          Limpiar
        </button>
        <button className="buttonSort" onClick={handleFileDownload}>
          Descargar Arreglo
        </button>

        <button
          className="buttonSort"
          onClick={() => document.getElementById("file-input").click()}
        >
          Cargar Arreglo
        </button>
        <br />
        <button className="buttonSort" onClick={handleShowUserManual}>
          Manual de Usuario
        </button>
      </div>

      <div className="row">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/0/0f/Insertion-sort-example-300px.gif"
          alt="Insertion Sort"
          width="200"
          height="200"
        />
        <img
          src="https://www.google.com/url?sa=i&url=https%3A%2F%2Fdev.to%2Fimparth%2Fimplement-selection-sort-easily-in-your-program-kln&psig=AOvVaw38TNw0RcvtrwqI2cc6Z0pX&ust=1745333961052000&source=images&cd=vfe&opi=89978449&ved=0CBMQjRxqFwoTCPi61uux6YwDFQAAAAAdAAAAABAI"
          alt="Selection Sort"
          width="200"
          height="200"
        />
      </div>

      <div className="row">
        <button onClick={() => handleSort(insertionSort, "Insertion Sort")}>
          Insertion Sort
        </button>
        <button onClick={() => handleSort(selectionSort, "Selection Sort")}>
          Selection Sort
        </button>
      </div>

      <div className="row">
        <img
          src="https://cdn.hashnode.com/res/hashnode/image/upload/v1651064131557/DwUHiegcH.gif"
          alt="Shell Sort"
          width="200"
          height="200"
        />
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Merge-sort-example-300px.gif"
          alt="Merge Sort"
          width="200"
          height="200"
        />
      </div>

      <div className="row">
        <button onClick={handleShellSort}>Shell Sort</button>
        <button onClick={() => handleSort(mergeSort, "Merge Sort")}>
          Merge Sort
        </button>
      </div>

      {showModal ? (
        <Modal
          className="modal-main"
          content={
            <div>
              <ArrayCuadraditos
                array={array}
                sortedArray={sortedArray}
                algorithm={algorithm}
                operations={operations}
                runtime={runtime}
              />
              {renderVisualizer()}
            </div>
          }
          show={showModal}
          onClose={handleShowModal}
        />
      ) : null}

      {/* Modal para el Manual de Usuario */}
      {showUserManual && (
        <Modal
          show={showUserManual}
          onClose={handleCloseUserManual}
          title="Manual de Usuario"
          content={
            <iframe
              src="https://docs.google.com/document/d/e/2PACX-1vQpohqSZFTIy2m1FvSbfb8gRgAieGVflajhHURG1X4xV2yrbDCcgfmJH27IRCtGB3SO3DGJDV2cdiLl/pub"
              width="100%"
              height="600px"
              style={{ border: "none" }}
            ></iframe>
          }
        />
      )}
    </div>
  );
};

export default TestSort;
