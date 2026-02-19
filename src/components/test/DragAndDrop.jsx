import React from "react";
import CustomComponentNode from "../utils/CustomComponentNode";

const DragAndDrop = () => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      className="dndnode output"
      onDragStart={(event) => onDragStart(event, "default")}
      draggable
    >
      A
    </div>
  );
};

export default DragAndDrop;
