import React from "react";
import PropTypes from "prop-types";
import "../styles/Dijkstra.css";

const Paths = ({ paths, costs, labels }) => {
  let origin;

  for (let i = 0; i < paths.length; i++) {
    const path = paths[i];
    for (let j = 0; j < path.length; j++) {
      if (path[j] !== undefined) {
        origin = path[j];
        break;
      }
    }
    if (origin !== undefined) {
      break;
    }
  }
  return (
    <div className="pathsContainer">
      <table className="pathsTable">
        <thead>
          <tr>
            <th>Nodo Origen</th>
            <th>Camino</th>
            <th>Nodo Destino</th>
            <th>Costo Total</th>
          </tr>
        </thead>
        <tbody>
          {paths.map((path, index) => (
            <tr key={index}>
              <td className="originColumn">{origin}</td>
              <td className="pathColumn">
                {costs[index] === Infinity ? (
                  <span> Camino no alcanzable</span>
                ) : (
                  <>
                    {path.map((node, nodeIndex) => (
                      <span key={nodeIndex} style={{ margin: "0 10px" }}>
                        {node}
                        {nodeIndex !== path.length - 1 && (
                          <span className="arrow">→</span>
                        )}
                      </span>
                    ))}
                  </>
                )}
              </td>
              <td className="destinationColumn">{labels[index]}</td>
              <td className="costColumn">
                {" "}
                {costs[index] == Infinity ? "∞" : costs[index]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

Paths.propTypes = {
  paths: PropTypes.array.isRequired,
  costs: PropTypes.array.isRequired,
  labels: PropTypes.array.isRequired,
};

export default Paths;
