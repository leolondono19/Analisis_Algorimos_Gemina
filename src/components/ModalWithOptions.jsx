import React, { useState } from "react";
import PropTypes from "prop-types";

import "../styles/Modal.css";

const ModalWithOptions = ({ show, onClose, children }) => {
  const [selectedOption, setSelectedOption] = useState("Maximizar");
  const options = ["Maximizar", "Minimizar"];

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
  };

  const showHideClassName = show ? "modal display-block" : "modal display-none";

  return (
    <div className={showHideClassName}>
      <div className="modal-main">
        <button className="close" onClick={onClose}>
          X
        </button>
        <h2>Selecciona una opción:</h2>
        <div className="modal-content">
          <label>
            Opción:
            <select value={selectedOption} onChange={handleOptionChange}>
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
        {children}
      </div>
    </div>
  );
};

ModalWithOptions.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export default ModalWithOptions;
