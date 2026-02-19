import React, { useState } from "react";
import "../styles/styles.css";
import AssignmentGraph from "./AssignmentGraph";
import AssignmentTransport from "./AssignmentTransport";
/**
 * Choose between AssignmentGraph and AssignmentTransport
 * @returns the AssignmentScreen component
 */
const AssignmentScreen = () => {
  const [selectScreen, setSelectScreen] = useState(true);
  //change the state of selectScreen
  const handleTogle = () => {
    setSelectScreen(!selectScreen);
  };
  return (
    <>
      <button className="buttonScreen" onClick={handleTogle}>
        {selectScreen ? "Matriz de Asignación" : "Grafo de Asignación"}
      </button>
      {selectScreen ? <AssignmentGraph /> : <AssignmentTransport />}
    </>
  );
};
export default AssignmentScreen;
