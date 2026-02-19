import React, { useState } from "react";
import CustomComponentNode from "./../utils/CustomComponentNode";

import { shallow } from "zustand/shallow";

import useBinaryTreeStore from "../../store/BinaryTreeStore";

const selector = (state) => ({
  addNode: state.addNode,
  nodeLabels: state.nodeLabels,
  parentNode: state.parentNode,
  setParentNode: state.setParentNode,
  inOrderTraversal: state.inorderTraversal,
});

const CustomTEST = () => {
  const { addNode, nodeLabels, parentNode, setParentNode, inOrderTraversal } =
    useBinaryTreeStore(selector, shallow);
  const labels = [...nodeLabels];
  const [input, setInput] = useState("");
  // const [parentNode, setParentNode] = useState(
  //   labels.length > 0 ? labels[0] : null
  // );
  //
  //

  /*
   * Internal variable to hold input
   * */

  const handleInput = (event) => {
    setInput(event.target.value);
  };

  const handleAddNumber = () => {
    // make verification for input, check it its null or if its a number
    if (input !== null && !isNaN(input)) {
      addNode(input);
      nodeSelect();
    } else {
      alert("Por favor introduce un numero.");
    }
  };

  const handleSelectChange = (event) => {
    if (event.target.value !== "" || event.target.value.length !== 0) {
      setParentNode(event.target.value);
    } else {
      alert("Por favor selecciona un nodo padre.");
    }
  };

  const nodeSelect = () => {
    return (
      <>
        <label htmlFor="node">Seleccionar Padre:</label>
        <select name="node" id="node" onChange={handleSelectChange}>
          {labels.map((label) => (
            <option value={label} key={label}>
              {label}
            </option>
          ))}
        </select>
      </>
    );
  };

  const test = () => {
    inOrderTraversal();
  };

  return (
    <CustomComponentNode>
      <label htmlFor="text">Añadir Elemento:</label>
      <input type="text" id="text" name="text" onChange={handleInput} />
      {nodeSelect()}
      <button type="button" id="input" onClick={handleAddNumber}>
        Añadir
      </button>

      <button type="button" id="input" onClick={test}>
        test
      </button>
    </CustomComponentNode>
  );
};

export default CustomTEST;
