import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import PropTypes from "prop-types";

const SelectionSortVisualizer = ({ steps }) => {
  const svgRef = useRef();
  const [stepCount, setStepCount] = useState(0);
  const [currentStepDescription, setCurrentStepDescription] = useState("");
  const [visualizationRuntime, setVisualizationRuntime] = useState(0); // Estado para el tiempo de visualización

  useEffect(() => {
    if (!steps || steps.length === 0) return;

    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 400;
    const barWidth = width / steps[0].arrayState.length;
    const maxValue = Math.max(...steps[0].arrayState) * 1.1;

    svg.selectAll("*").remove(); // Limpiar el SVG antes de dibujar

    const renderBars = (data, highlightIndices = [], description = "") => {
      svg
        .selectAll("rect")
        .data(data)
        .join("rect")
        .attr("x", (_, i) => i * barWidth)
        .attr("y", (d) => height - (d / maxValue) * height)
        .attr("width", barWidth - 4)
        .attr("height", (d) => (d / maxValue) * height)
        .attr("fill", (_, i) =>
          highlightIndices.includes(i) ? "#ff6f61" : "#4caf50"
        )
        .attr("rx", 6)
        .attr("ry", 6);

      svg
        .selectAll("text")
        .data(data)
        .join("text")
        .attr("x", (_, i) => i * barWidth + barWidth / 2 - 10)
        .attr("y", height + 20)
        .text((d) => d)
        .attr("fill", "#ffffff")
        .attr("font-size", "12px")
        .attr("text-anchor", "middle");

      setCurrentStepDescription(description);
    };

    const animateSort = async () => {
      const start = performance.now(); // Iniciar el tiempo de visualización
      let intervalId;

      // Iniciar un temporizador que actualiza el Runtime de la visualización en tiempo real
      intervalId = setInterval(() => {
        const now = performance.now();
        setVisualizationRuntime(((now - start) / 1000).toFixed(10)); // Actualizar el tiempo en segundos
      }, 90); // Actualizar cada 100 ms

      for (let i = 0; i < steps.length; i++) {
        const { arrayState, highlightIndices, description } = steps[i];
        renderBars(arrayState, highlightIndices, description);
        setStepCount(i + 1); // Actualizar contador de pasos
        await new Promise((resolve) => setTimeout(resolve, 500)); // Pausa entre pasos
      }

      clearInterval(intervalId); // Detener el temporizador cuando la animación termine

      const end = performance.now(); // Finalizar el tiempo de visualización
      setVisualizationRuntime(((end - start) / 1000).toFixed(10)); // Guardar el tiempo final en segundos
    };

    renderBars(steps[0].arrayState); // Dibujar el estado inicial
    animateSort(); // Iniciar la animación
  }, [steps]);

  return (
    <div>
      <h3>Visualización de Selection Sort</h3>
      <svg ref={svgRef} width="800" height="400"></svg>
      <p>Pasos realizados: {stepCount}</p>
      <p>{currentStepDescription}</p>
      <p>Runtime de la visualización: {visualizationRuntime} segundos</p>
    </div>
  );
};

SelectionSortVisualizer.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      arrayState: PropTypes.array.isRequired,
      highlightIndices: PropTypes.arrayOf(PropTypes.number),
      description: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default SelectionSortVisualizer;