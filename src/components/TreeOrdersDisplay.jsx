import React, { useMemo } from "react";
import { getOrdersFromList } from "../algorithms/binaryTree";

const TreeOrdersDisplay = ({ list }) => {
  const { preOrder, inOrder, postOrder } = useMemo(
    () => (list && list.length > 0 ? getOrdersFromList(list) : { preOrder: [], inOrder: [], postOrder: [] }),
    [list]
  );

  const style = {
    width: "20px",
    height: "20px",
    textAlign: "center",
  };

  const renderOrder = (order) => (
    <div style={{ marginBottom: "10px" }}>
      <table>
        <tbody>
          <tr>
            {order.map((node, idx) => (
              <td key={idx} style={style}>{node}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <div style={{
      border: "1px solid #222",
      borderRadius: "8px",
      padding: "16px",
      background: "#fff",
      minWidth: "250px"
    }}>
      <h2>Recorridos del árbol</h2>
      <div>
        <strong>Pre-Order:</strong>
        {renderOrder(preOrder)}
      </div>
      <div>
        <strong>In-Order:</strong>
        {renderOrder(inOrder)}
      </div>
      <div>
        <strong>Post-Order:</strong>
        {renderOrder(postOrder)}
      </div>
    </div>
  );
};

export default TreeOrdersDisplay;