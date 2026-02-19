import React from "react";

import { shallow } from "zustand/shallow";

import useBinaryTreeStore from "../../store/BinaryTreeStore";

import CustomComponentNode from "../utils/CustomComponentNode";

const selector = (state) => ({
  inOrder: state.inOrder,
  preOrder: state.preOrder,
  postOrder: state.postOrder,
  makeTraversal: state.makeTraversal,
});

const TraversalVisualization = () => {
  const { inOrder, preOrder, postOrder, makeTraversal } = useBinaryTreeStore(
    selector,
    shallow
  );

  const handleTraversal = () => {
    makeTraversal();
  };

  const preOrderComponent = () => {
    // iterate through the array and return a list of components
    const style = {
      width: "20px",
      height: "20px",
      textAlign: "center",
    };
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          width: "200px",
        }}
      >
        <table>
          <tbody>
            {preOrder.map((node, index) => {
              return (
                <tr key={index}>
                  <td style={style}>{node}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const postOrderComponent = () => {
    // iterate through the array and return a list of components
    const style = {
      width: "20px",
      height: "20px",
      textAlign: "center",
    };
    return (
      <div>
        <table>
          <tbody>
            {postOrder.map((node, index) => {
              return (
                <tr key={index}>
                  <td style={style}>{node}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const inOrderComponent = () => {
    // iterate through the array and return a list of components
    const style = {
      width: "20px",
      height: "20px",
      textAlign: "center",
    };
    return (
      <div>
        <table>
          <tbody>
            {inOrder.map((node, index) => {
              return (
                <tr key={index}>
                  <td style={style}>{node}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <CustomComponentNode>
      <h1>Recorrido del árbol</h1>
      <h2>Pre-Order:</h2>
      {preOrderComponent()}
      <h2>In-Order:</h2>
      {inOrderComponent()}
      <h2>Post-Order:</h2>
      {postOrderComponent()}
      <br />
      <button onClick={handleTraversal}>Recorrer</button>
    </CustomComponentNode>
  );
};

export default TraversalVisualization;
