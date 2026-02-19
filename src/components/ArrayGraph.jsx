import React from "react";
import PropTypes from "prop-types";

import "../styles/ArrayCuadraditos.css";

const ArrayCuadraditos = ({
  array,
  sortedArray,
  algorithm,
  operations,
  runtime,
}) => {
  return (
    <div className="container">
      <h3>Algoritmo: {algorithm}</h3>
      <h3>Operaciones: {operations}</h3>
      <h3>Runtime: {runtime} ms</h3>

      <div className="container">
        <h3>Array Desordenado:</h3>
        <div className="array">
          {array.map((num, index) => (
            <span key={index} className="num">
              {num}
            </span>
          ))}
        </div>

        <h3>Array Ordenado:</h3>
        <div className="array">
          {sortedArray.map((num, index) => (
            <span key={index} className="num">
              {num}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

ArrayCuadraditos.propTypes = {
  array: PropTypes.array.isRequired,
  sortedArray: PropTypes.array.isRequired,
  algorithm: PropTypes.string.isRequired,
  operations: PropTypes.number.isRequired,
  runtime: PropTypes.number.isRequired,
};

export default ArrayCuadraditos;
