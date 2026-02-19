import React, { useState } from "react";

const Laplace = () => {
  const [mode, setMode] = useState("toLaplace");
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");

  // Simulación de transformación (debes reemplazar con lógica real o API)
  const transform = () => {
    if (mode === "toLaplace") {
      setResult(`Laplace(${input})`);
    } else {
      setResult(`InverseLaplace(${input})`);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Transformada de Laplace</h2>
      <div>
        <button onClick={() => setMode("toLaplace")}>A Laplace</button>
        <button onClick={() => setMode("fromLaplace")}>A Ecuación Original</button>
      </div>
      <div style={{ marginTop: "1rem" }}>
        <input
          type="text"
          placeholder={mode === "toLaplace" ? "Introduce la ecuación" : "Introduce la ecuación en Laplace"}
          value={input}
          onChange={e => setInput(e.target.value)}
          style={{ width: "60%", marginRight: "1rem" }}
        />
        <button onClick={transform}>Transformar</button>
      </div>
      {result && (
        <div style={{ marginTop: "1rem" }}>
          <strong>Resultado:</strong> {result}
        </div>
      )}
    </div>
  );
};

export default Laplace;