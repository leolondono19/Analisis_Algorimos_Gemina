// Nuevo archivo sugerido: src/components/LaplaceMathLabDesktop.jsx

import React from "react";

const laplaceExamples = [
  {
    title: "¿Qué es la Transformada de Laplace?",
    content: (
      <>
        <p>
          La <b>transformada de Laplace</b> es una herramienta matemática fundamental para analizar sistemas dinámicos y resolver ecuaciones diferenciales. Convierte funciones del dominio del tiempo en funciones del dominio de la frecuencia compleja (<i>s</i>).
        </p>
        <ul>
          <li>Facilita la resolución de ecuaciones diferenciales ordinarias y parciales.</li>
          <li>Permite analizar sistemas lineales, circuitos eléctricos, control y señales.</li>
        </ul>
      </>
    ),
  },
  {
    title: "Uso en MATLAB: función <code>laplace</code>",
    content: (
      <>
        <p>
          MATLAB proporciona la función <code>laplace</code> para calcular la transformada de Laplace simbólica de una expresión o ecuación.
        </p>
        <pre style={{ background: "#f3f4f6", padding: "1em", borderRadius: "8px" }}>
          {`syms t s
f = exp(-2*t)*sin(3*t);
F = laplace(f, t, s)`}
        </pre>
        <p>
          <b>Resultado:</b> <code>F</code> contendrá la transformada simbólica de <code>f</code>.
        </p>
      </>
    ),
  },
  {
    title: "Ejemplo: Laplace de una ecuación diferencial",
    content: (
      <>
        <p>
          Puedes usar <code>laplace</code> para resolver ecuaciones diferenciales. Por ejemplo:
        </p>
        <pre style={{ background: "#f3f4f6", padding: "1em", borderRadius: "8px" }}>
          {`syms y(t) Y s
Dy = diff(y, t) + 2*y == exp(-t);
eqLap = laplace(Dy, t, s)`}
        </pre>
        <p>
          Esto transforma la ecuación diferencial al dominio de Laplace, facilitando su resolución algebraica.
        </p>
      </>
    ),
  },
  {
    title: "Comandos útiles de Laplace en MATLAB",
    content: (
      <ul>
        <li>
          <code>laplace(f, t, s)</code>: Calcula la transformada de Laplace de <code>f</code> respecto a <code>t</code> y variable <code>s</code>.
        </li>
        <li>
          <code>ilaplace(F, s, t)</code>: Calcula la transformada inversa de Laplace.
        </li>
        <li>
          <code>solve</code>: Resuelve ecuaciones simbólicas, útil tras aplicar Laplace.
        </li>
      </ul>
    ),
  },
  {
    title: "Recursos oficiales",
    content: (
      <ul>
        <li>
          <a href="https://www.mathworks.com/help/symbolic/sym.laplace.html" target="_blank" rel="noopener noreferrer">
            Documentación oficial de laplace (MathWorks)
          </a>
        </li>
        <li>
          <a href="https://www.mathworks.com/matlabcentral/answers/2006972-comandos-para-obtener-laplace-de-una-ecuacion-diferencial" target="_blank" rel="noopener noreferrer">
            Ejemplos y respuestas en MATLAB Central
          </a>
        </li>
      </ul>
    ),
  },
];

const LaplaceMathLabDesktop = () => (
  <div
    style={{
      maxWidth: 900,
      margin: "2.5rem auto",
      background: "linear-gradient(135deg, #f8fafc 60%, #e0e7ff 100%)",
      borderRadius: 18,
      boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
      border: "1px solid #e0e7ff",
      padding: "2.5rem 2vw",
    }}
  >
    <h2 style={{ textAlign: "center", color: "#2d3a4a", marginBottom: "2rem" }}>
      Laplace en MATLAB Desktop
    </h2>
    {laplaceExamples.map((ex, i) => (
      <section
        key={i}
        style={{
          background: "#fff",
          borderRadius: "14px",
          boxShadow: "0 2px 8px rgba(31,38,135,0.08)",
          border: "1px solid #e0e7ff",
          padding: "1.5rem 1.2rem",
          marginBottom: "1.5rem",
        }}
      >
        <h3 style={{ color: "#0076d6", marginBottom: "0.7rem" }} dangerouslySetInnerHTML={{ __html: ex.title }} />
        <div style={{ color: "#374151", fontSize: "1.08rem" }}>{ex.content}</div>
      </section>
    ))}
    <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
      <button
        onClick={() => (window.location.href = "mathlabonline://abrir?modulo=symbolic&tool=laplace")}
        style={{
          padding: "14px 32px",
          background: "linear-gradient(90deg, #0076d6 60%, #00c6fb 100%)",
          color: "#fff",
          border: "none",
          borderRadius: "10px",
          fontWeight: "bold",
          fontSize: "1.1rem",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          transition: "background 0.2s",
        }}
      >
        Abrir Laplace en MATLAB Desktop
      </button>
    </div>
  </div>
);

export default LaplaceMathLabDesktop;