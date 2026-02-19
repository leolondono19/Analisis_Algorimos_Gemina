import React, { useRef, useState } from "react";

// Puedes instalar react-icons si no lo tienes: npm install react-icons
import { FaCheckCircle, FaCogs, FaProjectDiagram, FaLightbulb, FaLayerGroup, FaRegEye } from "react-icons/fa";

const carouselImages = [
  {
    src: "https://es.mathworks.com/videos/fuzzy-logic-application-with-matlab-and-simulink-1480432014753/_jcr_content/thumbnail.adapt.1200.medium.jpg/1606324491342.jpg",
    alt: "Editor FIS de MATLAB",
    caption: "Editor FIS: Crea y edita sistemas de inferencia difusa (.fis) de forma gráfica.",
  },
  {
    src: "https://www.mathworks.com/products/fuzzy-logic/_jcr_content/mainParsys/band_1749659463_copy/mainParsys/columns/be6d2ac8-b0d2-4a96-a82c-ff04cdea407e/image_copy.adapt.full.medium.gif/1743677873671.gif",
    alt: "Funciones de membresía",
    caption: "Funciones de membresía: Define cómo los valores de entrada se asignan a conjuntos difusos.",
  },
  {
    src: "https://user-images.githubusercontent.com/94420252/226128876-0344b6a1-a8f1-4aaf-a316-cf74744364d7.png",
    alt: "Simulación y análisis",
    caption: "Simulación y análisis: Prueba y ajusta tus sistemas difusos con datos reales o simulados.",
  },
];

const infoCards = [
  {
    icon: <FaCogs size={32} color="#0076d6" />,
    title: "¿Qué es Fuzzy Logic Toolbox?",
    desc: "Fuzzy Logic Toolbox™ proporciona funciones, apps y un bloque de Simulink® para analizar, diseñar y simular sistemas basados en lógica difusa. Puedes modelar sistemas complejos donde la lógica tradicional no es suficiente.",
    link: "https://www.mathworks.com/products/fuzzy-logic.html",
    linkText: "Ver más",
  },
  {
    icon: <FaLayerGroup size={32} color="#28a745" />,
    title: "Sistemas de Inferencia Difusa Tipo-2",
    desc: "Los sistemas de inferencia difusa tipo-2 permiten modelar incertidumbre adicional en los sistemas difusos, siendo útiles cuando los datos o el conocimiento experto son imprecisos.",
    link: "https://www.mathworks.com/help/fuzzy/type-2-fuzzy-inference-systems.html",
    linkText: "Aprende sobre Tipo-2",
  },
  {
    icon: <FaProjectDiagram size={32} color="#f59e42" />,
    title: "Fuzzy Logic Designer App",
    desc: "La app Fuzzy Logic Designer te permite crear, editar y visualizar sistemas de inferencia difusa de manera interactiva, facilitando la experimentación y el ajuste de parámetros.",
    link: "https://www.mathworks.com/help/fuzzy/fuzzylogicdesigner-app.html",
    linkText: "Explora la App",
  },
  {
    icon: <FaLightbulb size={32} color="#eab308" />,
    title: "Modelado de Sistemas de Inferencia Difusa",
    desc: "Modela sistemas de inferencia difusa utilizando reglas, funciones de membresía y lógica difusa para resolver problemas complejos de control, clasificación y toma de decisiones.",
    link: "https://www.mathworks.com/help/fuzzy/fuzzy-inference-system-modeling.html",
    linkText: "Guía de modelado",
  },
];

const MathLabDesktop = () => {
  const fileInputRef = useRef(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const openMathLab = () => {
    window.location.href = "mathlabonline://abrir";
  };

  const openMathLabFuzzy = () => {
    window.location.href = "mathlabonline://abrir?modulo=fuzzylogic";
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const filePath = encodeURIComponent(file.path || file.name);
    window.location.href = `mathlabonline://abrir?archivo=${filePath}`;
  };

  const nextImage = () => {
    setCarouselIndex((prev) => (prev + 1) % carouselImages.length);
  };

  const prevImage = () => {
    setCarouselIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1100px",
        margin: "2.5rem auto",
        padding: "2.5rem 2vw",
        background: "linear-gradient(135deg, #f8fafc 60%, #e0e7ff 100%)",
        borderRadius: "18px",
        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
        border: "1px solid #e0e7ff",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          color: "#2d3a4a",
          marginBottom: "2rem",
          letterSpacing: "1px",
          fontSize: "2.2rem",
        }}
      >
        MathLab Desktop
      </h2>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "2rem",
          justifyContent: "center",
          alignItems: "flex-start",
          marginBottom: "2.5rem",
        }}
      >
        <button
          onClick={openMathLab}
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
          Abrir MathLab Desktop
        </button>
        <button
          onClick={openMathLabFuzzy}
          style={{
            padding: "14px 32px",
            background: "linear-gradient(90deg, #28a745 60%, #6ee7b7 100%)",
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
          Abrir en FuzzyLogic
        </button>
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "1.5rem",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            border: "1px solid #e5e7eb",
            minWidth: "260px",
            flex: "1 1 300px",
            maxWidth: "350px",
          }}
        >
          <label style={{ fontWeight: "bold", color: "#374151" }}>
            Abrir archivo compatible en MathLab Desktop:
            <input
              type="file"
              ref={fileInputRef}
              accept=".fis,.mat,.m,.txt,.csv,.xls,.xlsx"
              style={{
                display: "block",
                margin: "16px 0 8px 0",
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                background: "#f1f5f9",
                fontSize: "1rem",
                width: "100%",
              }}
              onChange={handleFileChange}
            />
          </label>
          <small style={{ color: "#64748b" }}>
            Selecciona un archivo <b>.fis, .mat, .m, .txt, .csv, .xls, .xlsx</b> para abrirlo en MATLAB Desktop.
          </small>
        </div>
      </div>

      {/* Carrusel de imágenes */}
      <div
        style={{
          margin: "2.5rem auto 2rem auto",
          maxWidth: "700px",
          background: "#fff",
          borderRadius: "14px",
          boxShadow: "0 2px 8px rgba(31,38,135,0.06)",
          border: "1px solid #e0e7ff",
          padding: "1.5rem 1rem 2rem 1rem",
          textAlign: "center",
        }}
      >
        <h3 style={{ color: "#0076d6", marginBottom: "1.2rem", fontSize: "1.5rem" }}>
          Ejemplos visuales de Fuzzy Logic Toolbox
        </h3>
        <div style={{ position: "relative", minHeight: "260px" }}>
          <img
            src={carouselImages[carouselIndex].src}
            alt={carouselImages[carouselIndex].alt}
            style={{
              width: "100%",
              maxWidth: "500px",
              height: "260px",
              objectFit: "contain",
              borderRadius: "10px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
              margin: "0 auto",
              display: "block",
              transition: "box-shadow 0.3s",
            }}
          />
          <button
            onClick={prevImage}
            style={{
              position: "absolute",
              top: "50%",
              left: "10px",
              transform: "translateY(-50%)",
              background: "#e0e7ff",
              border: "none",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "#0076d6",
              boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
            }}
            aria-label="Anterior"
          >
            &#8592;
          </button>
          <button
            onClick={nextImage}
            style={{
              position: "absolute",
              top: "50%",
              right: "10px",
              transform: "translateY(-50%)",
              background: "#e0e7ff",
              border: "none",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "#0076d6",
              boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
            }}
            aria-label="Siguiente"
          >
            &#8594;
          </button>
        </div>
        <div style={{ marginTop: "1rem", color: "#374151", fontSize: "1.08rem" }}>
          {carouselImages[carouselIndex].caption}
        </div>
      </div>

      {/* Sección informativa sobre Fuzzy Logic */}
      <div
        style={{
          margin: "2.5rem auto 0 auto",
          maxWidth: "900px",
          background: "linear-gradient(120deg, #f1f5f9 60%, #e0e7ff 100%)",
          borderRadius: "14px",
          padding: "2.5rem 2rem",
          boxShadow: "0 2px 8px rgba(31,38,135,0.06)",
          border: "1px solid #e0e7ff",
        }}
      >
        <h3 style={{ color: "#0076d6", marginBottom: "1.2rem", textAlign: "center", fontSize: "1.7rem" }}>
          ¿Qué es Fuzzy Logic Toolbox?
        </h3>
        <p style={{ color: "#374151", fontSize: "1.15rem", marginBottom: "1.2rem", textAlign: "center" }}>
          <b>Fuzzy Logic Toolbox</b> es una herramienta de MATLAB que permite diseñar, simular y analizar sistemas de inferencia difusa. Es ideal para modelar sistemas complejos donde la lógica tradicional no es suficiente y se requiere trabajar con incertidumbre o información imprecisa.
        </p>
        <ul style={{ color: "#374151", marginBottom: "1.2rem", paddingLeft: "1.2rem", fontSize: "1.08rem" }}>
          <li>
            <b>Editor FIS:</b> Crea y edita sistemas de inferencia difusa (.fis) de forma gráfica.
          </li>
          <li>
            <b>Funciones de membresía:</b> Define cómo los valores de entrada se asignan a conjuntos difusos.
          </li>
          <li>
            <b>Reglas difusas:</b> Establece reglas lógicas para la toma de decisiones.
          </li>
          <li>
            <b>Simulación y análisis:</b> Prueba y ajusta tus sistemas difusos con datos reales o simulados.
          </li>
          <li>
            <b>Integración:</b> Usa archivos <b>.fis</b>, <b>.mat</b>, <b>.m</b>, <b>.csv</b>, <b>.xls</b> y más para importar/exportar datos y sistemas.
          </li>
        </ul>
        <div
          style={{
            background: "#e0e7ff",
            borderRadius: "8px",
            padding: "1.2rem",
            marginBottom: "1.2rem",
            textAlign: "center",
            color: "#374151",
            fontSize: "1.08rem",
          }}
        >
          <b>¿Cómo usarlo?</b> <br />
          1. Crea o carga un archivo <b>.fis</b> para definir tu sistema difuso.<br />
          2. Usa el editor gráfico o comandos como <code>fuzzy</code>, <code>readfis</code>, <code>writefis</code>.<br />
          3. Simula y ajusta tu sistema con tus propios datos.<br />
          4. Exporta los resultados para usarlos en otros proyectos.
        </div>
        <div style={{ textAlign: "center" }}>
          <a
            href="https://www.mathworks.com/help/fuzzy/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "12px 28px",
              background: "linear-gradient(90deg, #0076d6 60%, #00c6fb 100%)",
              color: "#fff",
              borderRadius: "7px",
              textDecoration: "none",
              fontWeight: "bold",
              marginTop: "0.5rem",
              boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
              transition: "background 0.2s",
              fontSize: "1.1rem",
            }}
          >
            Más información en la documentación oficial
          </a>
        </div>
        {/* Video explicativo */}
        <div style={{ marginTop: "2.5rem", textAlign: "center" }}>
          <h4 style={{ color: "#0076d6", marginBottom: "1rem" }}>Video introductorio</h4>
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/GQE0mW6WWjU?si=VlCKHZffogD95fGZ"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            style={{
              maxWidth: "100%",
              borderRadius: "10px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
            }}
          ></iframe>
        </div>

        {/* NUEVA SECCIÓN: Información extendida de los links */}
        <div style={{ marginTop: "3rem", display: "flex", flexDirection: "column", gap: "2.5rem" }}>
          {/* Fuzzy Logic Toolbox */}
          <section
            style={{
              background: "linear-gradient(120deg, #e0e7ff 60%, #f1f5f9 100%)",
              borderRadius: "16px",
              boxShadow: "0 4px 24px rgba(31,38,135,0.10)",
              padding: "2.5rem 2rem",
              marginBottom: "1.5rem",
              transition: "box-shadow 0.3s",
              border: "1px solid #dbeafe",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
              <FaCogs size={48} color="#0076d6" style={{ flexShrink: 0 }} />
              <div>
                <h3 style={{ color: "#0076d6", fontSize: "1.5rem", marginBottom: "0.7rem" }}>
                  Fuzzy Logic Toolbox™
                </h3>
                <p style={{ color: "#374151", fontSize: "1.13rem", marginBottom: "0.7rem" }}>
                  Fuzzy Logic Toolbox™ proporciona funciones, apps y bloques de Simulink® para analizar, diseñar y simular sistemas basados en lógica difusa. Permite modelar sistemas complejos donde la lógica tradicional no es suficiente, facilitando la toma de decisiones bajo incertidumbre y datos imprecisos.
                </p>
                <ul style={{ color: "#374151", fontSize: "1.08rem", marginBottom: "0.7rem", paddingLeft: "1.2rem" }}>
                  <li>Diseña sistemas de inferencia difusa tipo-1 y tipo-2.</li>
                  <li>Utiliza funciones de membresía personalizadas y reglas lógicas flexibles.</li>
                  <li>Simula, ajusta y visualiza el comportamiento de tus sistemas difusos.</li>
                  <li>Integra con MATLAB, Simulink y otras herramientas para flujos de trabajo avanzados.</li>
                </ul>
                <a
                  href="https://www.mathworks.com/products/fuzzy-logic.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    padding: "10px 24px",
                    background: "linear-gradient(90deg, #0076d6 60%, #00c6fb 100%)",
                    color: "#fff",
                    borderRadius: "7px",
                    textDecoration: "none",
                    fontWeight: "bold",
                    fontSize: "1.08rem",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                    marginTop: "0.5rem",
                  }}
                >
                  Más sobre Fuzzy Logic Toolbox
                </a>
              </div>
            </div>
          </section>

          {/* Sistemas de Inferencia Difusa Tipo-2 */}
          <section
            style={{
              background: "linear-gradient(120deg, #f1f5f9 60%, #e0e7ff 100%)",
              borderRadius: "16px",
              boxShadow: "0 4px 24px rgba(31,38,135,0.10)",
              padding: "2.5rem 2rem",
              marginBottom: "1.5rem",
              border: "1px solid #dbeafe",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
              <FaLayerGroup size={48} color="#28a745" style={{ flexShrink: 0 }} />
              <div>
                <h3 style={{ color: "#28a745", fontSize: "1.5rem", marginBottom: "0.7rem" }}>
                  Sistemas de Inferencia Difusa Tipo-2
                </h3>
                <p style={{ color: "#374151", fontSize: "1.13rem", marginBottom: "0.7rem" }}>
                  Los sistemas de inferencia difusa tipo-2 permiten modelar incertidumbre adicional en los sistemas difusos, siendo útiles cuando los datos o el conocimiento experto son imprecisos o variables. Ofrecen mayor robustez frente a la incertidumbre en comparación con los sistemas tipo-1.
                </p>
                <ul style={{ color: "#374151", fontSize: "1.08rem", marginBottom: "0.7rem", paddingLeft: "1.2rem" }}>
                  <li>Soportan funciones de membresía tipo-2 y reglas difusas extendidas.</li>
                  <li>Permiten capturar la variabilidad y la ambigüedad en los datos de entrada.</li>
                  <li>Ideales para aplicaciones donde la incertidumbre es significativa, como sistemas biomédicos, control avanzado y procesamiento de señales.</li>
                </ul>
                <a
                  href="https://www.mathworks.com/help/fuzzy/type-2-fuzzy-inference-systems.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    padding: "10px 24px",
                    background: "linear-gradient(90deg, #28a745 60%, #6ee7b7 100%)",
                    color: "#fff",
                    borderRadius: "7px",
                    textDecoration: "none",
                    fontWeight: "bold",
                    fontSize: "1.08rem",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                    marginTop: "0.5rem",
                  }}
                >
                  Aprende sobre sistemas tipo-2
                </a>
              </div>
            </div>
          </section>

          {/* Fuzzy Logic Designer App */}
          <section
            style={{
              background: "linear-gradient(120deg, #e0e7ff 60%, #f1f5f9 100%)",
              borderRadius: "16px",
              boxShadow: "0 4px 24px rgba(31,38,135,0.10)",
              padding: "2.5rem 2rem",
              marginBottom: "1.5rem",
              border: "1px solid #dbeafe",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
              <FaProjectDiagram size={48} color="#f59e42" style={{ flexShrink: 0 }} />
              <div>
                <h3 style={{ color: "#f59e42", fontSize: "1.5rem", marginBottom: "0.7rem" }}>
                  Fuzzy Logic Designer App
                </h3>
                <p style={{ color: "#374151", fontSize: "1.13rem", marginBottom: "0.7rem" }}>
                  La app Fuzzy Logic Designer permite crear, editar y visualizar sistemas de inferencia difusa de manera interactiva. Ofrece herramientas gráficas para definir funciones de membresía, reglas, entradas y salidas, y simular el comportamiento del sistema en tiempo real.
                </p>
                <ul style={{ color: "#374151", fontSize: "1.08rem", marginBottom: "0.7rem", paddingLeft: "1.2rem" }}>
                  <li>Interfaz intuitiva para diseñar sistemas difusos tipo-1 y tipo-2.</li>
                  <li>Visualización de funciones de membresía y reglas.</li>
                  <li>Simulación interactiva y ajuste de parámetros en tiempo real.</li>
                  <li>Exportación e importación de archivos <b>.fis</b> y compatibilidad con Simulink.</li>
                </ul>
                <a
                  href="https://www.mathworks.com/help/fuzzy/fuzzylogicdesigner-app.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    padding: "10px 24px",
                    background: "linear-gradient(90deg, #f59e42 60%, #fbbf24 100%)",
                    color: "#fff",
                    borderRadius: "7px",
                    textDecoration: "none",
                    fontWeight: "bold",
                    fontSize: "1.08rem",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                    marginTop: "0.5rem",
                  }}
                >
                  Explora Fuzzy Logic Designer
                </a>
              </div>
            </div>
          </section>

          {/* Modelado de Sistemas de Inferencia Difusa */}
          <section
            style={{
              background: "linear-gradient(120deg, #f1f5f9 60%, #e0e7ff 100%)",
              borderRadius: "16px",
              boxShadow: "0 4px 24px rgba(31,38,135,0.10)",
              padding: "2.5rem 2rem",
              marginBottom: "1.5rem",
              border: "1px solid #dbeafe",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
              <FaLightbulb size={48} color="#eab308" style={{ flexShrink: 0 }} />
              <div>
                <h3 style={{ color: "#eab308", fontSize: "1.5rem", marginBottom: "0.7rem" }}>
                  Modelado de Sistemas de Inferencia Difusa
                </h3>
                <p style={{ color: "#374151", fontSize: "1.13rem", marginBottom: "0.7rem" }}>
                  El modelado de sistemas de inferencia difusa permite resolver problemas complejos de control, clasificación y toma de decisiones mediante reglas lógicas, funciones de membresía y operadores difusos. MATLAB facilita la creación, simulación y ajuste de estos modelos.
                </p>
                <ul style={{ color: "#374151", fontSize: "1.08rem", marginBottom: "0.7rem", paddingLeft: "1.2rem" }}>
                  <li>Define entradas, salidas, funciones de membresía y reglas lógicas.</li>
                  <li>Utiliza métodos de inferencia Mamdani y Sugeno.</li>
                  <li>Simula el comportamiento del sistema y ajusta parámetros para optimizar resultados.</li>
                  <li>Aplica el modelado difuso en controladores, sistemas expertos, clasificación y más.</li>
                </ul>
                <a
                  href="https://www.mathworks.com/help/fuzzy/fuzzy-inference-system-modeling.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    padding: "10px 24px",
                    background: "linear-gradient(90deg, #eab308 60%, #fde68a 100%)",
                    color: "#fff",
                    borderRadius: "7px",
                    textDecoration: "none",
                    fontWeight: "bold",
                    fontSize: "1.08rem",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                    marginTop: "0.5rem",
                  }}
                >
                  Guía de modelado difuso
                </a>
              </div>
            </div>
          </section>
        </div>
        {/* FIN NUEVA SECCIÓN */}
        </div>
      </div>
    );
  };
  
  export default MathLabDesktop;