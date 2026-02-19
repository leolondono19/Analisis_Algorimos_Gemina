import React from "react";
import PropTypes from "prop-types";

import "../styles/Modal.css";

const Modal = ({ show, onClose, title, content }) => {
  const showHideClassName = show ? "modal display-block" : "modal display-none";

  return (
    <div className={showHideClassName}>
      <div className="modal-main">
        <button className="close" onClick={onClose}>
          X
        </button>
        {title && <h2>{title}</h2>}
        <div className="modal-content">{content}</div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  content: PropTypes.node.isRequired,
};

export default Modal;
