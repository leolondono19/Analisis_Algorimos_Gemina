import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import PropTypes from "prop-types";
import styles from "../styles/SortVisualizer.module.css"; // Usar CSS Modules

const SortVisualizer = ({ array, algorithm }) => {
  const svgRef = useRef();
  const [isPaused, setIsPaused] = useState(false); // Estado para pausar/reanudar
  const [stepCount, setStepCount] = useState(0); // Contador de pasos

  useEffect(() => {
    if (!array || array.length === 0) return;

    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 400;
    const barWidth = width / array.length;
    const maxValue = Math.max(...array) * 1.1; // Escala un 10% más que el valor máximo

    svg.selectAll("*").remove(); // Limpiar el SVG antes de dibujar

    const renderBars = (data, highlightIndex = -1) => {
      svg
        .selectAll("rect")
        .data(data)
        .join("rect")
        .attr("x", (_, i) => i * barWidth)
        .attr("y", (d) => height - (d / maxValue) * height)
        .attr("width", barWidth - 4)
        .attr("height", (d) => (d / maxValue) * height)
        .attr("fill", (_, i) => (i === highlightIndex ? "#ff6f61" : "url(#gradient)")) // Resaltar barras
        .attr("rx", 6) // Bordes redondeados
        .attr("ry", 6)
        .style("stroke", "rgba(0, 0, 0, 0.2)") // Borde de las barras
        .style("stroke-width", 1)
        .style("transition", "all 0.3s ease-in-out"); // Transición suave
    };

    const animateSort = async () => {
      const data = [...array];
      const steps = [];

      // Simular el algoritmo de ordenamiento y capturar los pasos
      if (algorithm === "Selection Sort") {
        for (let i = 0; i < data.length - 1; i++) {
          let minIndex = i;
          for (let j = i + 1; j < data.length; j++) {
            if (data[j] < data[minIndex]) {
              minIndex = j;
            }
          }
          [data[i], data[minIndex]] = [data[minIndex], data[i]];
          steps.push([...data]);
        }
      } else if (algorithm === "Insertion Sort") {
        for (let i = 1; i < data.length; i++) {
          let j = i - 1;
          const temp = data[i];
          while (j >= 0 && data[j] > temp) {
            data[j + 1] = data[j];
            j--;
          }
          data[j + 1] = temp;
          steps.push([...data]);
        }
      } else if (algorithm === "Shell Sort") {
        const gaps = [701, 301, 132, 57, 23, 10, 4, 1];
        for (let gap of gaps) {
          for (let i = gap; i < data.length; i++) {
            const temp = data[i];
            let j = i;
            while (j >= gap && data[j - gap] > temp) {
              data[j] = data[j - gap];
              j -= gap;
            }
            data[j] = temp;
            steps.push([...data]);
          }
        }
      } else if (algorithm === "Merge Sort") {
        const mergeSortSteps = (arr) => {
          if (arr.length <= 1) return arr;
          const mid = Math.floor(arr.length / 2);
          const left = mergeSortSteps(arr.slice(0, mid));
          const right = mergeSortSteps(arr.slice(mid));
          const merged = [];
          let i = 0,
            j = 0;
          while (i < left.length && j < right.length) {
            if (left[i] < right[j]) {
              merged.push(left[i++]);
            } else {
              merged.push(right[j++]);
            }
            steps.push([...merged, ...left.slice(i), ...right.slice(j)]);
          }
          return merged.concat(left.slice(i)).concat(right.slice(j));
        };
        mergeSortSteps(data);
      }

      // Animar los pasos
      for (let i = 0; i < steps.length; i++) {
        if (isPaused) {
          await new Promise((resolve) => {
            const interval = setInterval(() => {
              if (!isPaused) {
                clearInterval(interval);
                resolve();
              }
            }, 100);
          });
        }
        await new Promise((resolve) => setTimeout(resolve, 300)); // Pausa entre pasos
        renderBars(steps[i]);
        setStepCount(i + 1); // Actualizar contador de pasos
      }
    };

    // Crear un gradiente para las barras
    const defs = svg.append("defs");
    const gradient = defs
      .append("linearGradient")
      .attr("id", "gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#4caf50");
    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#2e7d32");

    renderBars(array); // Dibujar el estado inicial
    animateSort(); // Iniciar la animación
  }, [array, algorithm, isPaused]);

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Visualización del Algoritmo: {algorithm}</h3>
      <svg ref={svgRef} width="800" height="400"></svg>
      <div className={styles.controls}>
        <button onClick={() => setIsPaused(!isPaused)} className={styles.button}>
          {isPaused ? "Reanudar" : "Pausar"}
        </button>
        <p className={styles.info}>Pasos realizados: {stepCount}</p>
      </div>
    </div>
  );
};

SortVisualizer.propTypes = {
  array: PropTypes.array.isRequired,
  algorithm: PropTypes.string.isRequired,
};

export default SortVisualizer;