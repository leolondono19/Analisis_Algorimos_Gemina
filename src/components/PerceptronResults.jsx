import React from "react";
import PropTypes from "prop-types";
import "../styles/PerceptronResults.css";

const PerceptronResults = ({ lastWeights, iterations }) => {
  return (
    <div className="perceptron-results">
      <h2>Resultados del Perceptrón</h2>
      <p>Últimos pesos sinápticos:</p>
      {lastWeights.map((weight, index) => (
        <p key={`weight-${index}`}>{`W${index + 1}: ${parseFloat(
          weight
        ).toFixed(2)}`}</p>
      ))}
      <p>Número de iteraciones: {iterations}</p>
    </div>
  );
};

PerceptronResults.propTypes = {
  lastWeights: PropTypes.arrayOf(PropTypes.number).isRequired,
  iterations: PropTypes.number.isRequired,
};

export default PerceptronResults;
