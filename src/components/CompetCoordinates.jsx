import React from "react";
import PropTypes from "prop-types";
import "../styles/Dijkstra.css";

const CompetCoordinates = ({ coordinates }) => {
  console.log(coordinates);
  return (
    <div className="pathsContainer">
      <table className="pathsTable">
        <thead>
          <tr>
            <th>ETIQUETA</th>
            <th>COORDENADA X</th>
            <th>CORRDENADA Y</th>
          </tr>
        </thead>
        <tbody>
          {coordinates.map((coordinate, index) => (
            <tr
              key={index}
              style={{
                backgroundColor:
                  coordinate[2] === "Centroide" ? "#F2EE82" : "#FFFFFF",
              }}
            >
              <td>{coordinate[2]}</td>
              <td>{coordinate[0]}</td>
              <td>{coordinate[1]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

CompetCoordinates.propTypes = {
  coordinates: PropTypes.array.isRequired,
};

export default CompetCoordinates;
