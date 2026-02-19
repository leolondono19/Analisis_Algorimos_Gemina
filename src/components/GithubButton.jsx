import React from "react";

import "./../styles/GithubButton.css";

import OctocatIcon from "/icons/octocat.png";

const GithubButton = () => {
  return (
    <button
      className="github-button"
      onClick={() =>
        window.open(
          "https://github.com/iguiIllanes/graph-theory-and-algorithms"
        )
      }
    >
      <div className="github-button-container">
        Ver en GitHub
        <img src={OctocatIcon} alt="Imagen" width="25px" />
      </div>
    </button>
  );
};

export default GithubButton;
