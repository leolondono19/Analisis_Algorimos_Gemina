import React, { useState, useEffect } from "react";
import { Box, Button, Typography, Paper, Grid } from "@mui/material";
import { Line } from "react-chartjs-2";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Triangular (trimf) - robusta y completa
const trimf = (x, a, b, c) => {
  // Casos degenerados
  if (a === b && b === c) return x === a ? 1 : 0;
  if (a === b) {
    if (x === a) return 1;
    if (x > a && x < c) return (c - x) / (c - b);
    return 0;
  }
  if (b === c) {
    if (x === c) return 1;
    if (x > a && x < b) return (x - a) / (b - a);
    return 0;
  }
  // Caso general
  if (x <= a) return 0;
  if (x === b) return 1;
  if (x >= c) return 0;
  if (x > a && x < b) return (x - a) / (b - a);
  if (x > b && x < c) return (c - x) / (c - b);
  return 0;
};

// Trapezoidal (trapmf) - robusta y completa
const trapmf = (x, a, b, c, d) => {
  // Casos degenerados
  if (a === b && b === c && c === d) return x === a ? 1 : 0;
  if (a === b && c === d) {
    if (x === a) return 1;
    if (x > a && x < c) return 1;
    if (x === c) return 1;
    return 0;
  }
  if (a === b) {
    if (x === a) return 1;
    if (x > a && x < c) return 1;
    if (x >= c && x <= d) return (d - x) / (d - c);
    return 0;
  }
  if (c === d) {
    if (x <= a) return 0;
    if (x > a && x < b) return (x - a) / (b - a);
    if (x >= b && x <= c) return 1;
    if (x === d) return 1;
    return 0;
  }
  // Caso general
  if (x <= a) return 0;
  if (x >= d) return 0;
  if (x >= b && x <= c) return 1;
  if (x > a && x < b) return (x - a) / (b - a);
  if (x > c && x < d) return (d - x) / (d - c);
  return 0;
};

// Gaussiana simple
const gaussmf = (x, mean, sigma) => Math.exp(-0.5 * Math.pow((x - mean) / sigma, 2));
// Gaussiana doble
const gauss2mf = (x, mean1, sigma1, mean2, sigma2) =>
  Math.max(gaussmf(x, mean1, sigma1), gaussmf(x, mean2, sigma2));
// Sigmoidal simple
const sigmf = (x, a, c) => 1 / (1 + Math.exp(-a * (x - c)));
// Producto de dos sigmoides (dsigmf)
const dsigmf = (x, a1, c1, a2, c2) => sigmf(x, a1, c1) * (1 - sigmf(x, a2, c2));
// Diferencia de dos sigmoides (psigmf)
const psigmf = (x, a1, c1, a2, c2) => sigmf(x, a1, c1) - sigmf(x, a2, c2);
// Campana generalizada (gbellmf)
const gbellmf = (x, a, b, c) => 1 / (1 + Math.pow(Math.abs((x - c) / a), 2 * b));
// Función Z (zmf) - robusta y completa
const zmf = (x, a, b) => {
  if (a === b) return x <= a ? 1 : 0;
  if (x <= a) return 1;
  if (x >= b) return 0;
  const ratio = (x - a) / (b - a);
  if (ratio <= 0) return 1;
  if (ratio >= 1) return 0;
  return 1 - 2 * Math.pow(ratio, 2) + Math.pow(ratio, 4);
};
// Función S (smf) - robusta y completa
const smf = (x, a, b) => {
  if (a === b) return x >= b ? 1 : 0;
  if (x <= a) return 0;
  if (x >= b) return 1;
  const ratio = (x - a) / (b - a);
  if (ratio <= 0) return 0;
  if (ratio >= 1) return 1;
  return 2 * Math.pow(ratio, 2) - Math.pow(ratio, 4);
};
// Función Pi (pimf) - robusta y completa
const pimf = (x, a, b, c, d) => {
  // Casos degenerados
  if (a === b && b === c && c === d) return x === a ? 1 : 0;
  if (a === b && c === d) {
    if (x === a) return 1;
    if (x > a && x < c) return 1;
    if (x === c) return 1;
    return 0;
  }
  if (x <= a) return 0;
  if (x >= d) return 0;
  if (x >= b && x <= c) return 1;
  if (x > a && x < b) return smf(x, a, b);
  if (x > c && x < d) return zmf(x, c, d);
  return 0;
};

// Evalúa una regla difusa y retorna el grado de activación y o consecuente
function evaluarRegla(regla, variables) {
  // Obtiene el grado de membresía de cada antecedente
  const grados = regla.antecedents.map(ant => {
    const variable = variables.find(v => v.name === ant.variable);
    if (!variable) return 0;
    // Calcula el grado de membresía usando el tipo y parámetros actuales
    const x = variable.input;
    switch (variable.membershipType) {
      case "trimf":
        return trimf(x, variable.params.a, variable.params.b, variable.params.c);
      case "trapmf":
        return trapmf(x, variable.params.a, variable.params.b, variable.params.c, variable.params.d);
      case "gaussmf":
        return gaussmf(x, variable.params.mean, variable.params.sigma);
      case "gauss2mf":
        return gauss2mf(x, variable.params.mean1, variable.params.sigma1, variable.params.mean2, variable.params.sigma2);
      case "sigmf":
        return sigmf(x, variable.params.a, variable.params.c);
      case "dsigmf":
        return dsigmf(x, variable.params.a1, variable.params.c1, variable.params.a2, variable.params.c2);
      case "psigmf":
        return psigmf(x, variable.params.a1, variable.params.c1, variable.params.a2, variable.params.c2);
      case "gbellmf":
        return gbellmf(x, variable.params.a, variable.params.b, variable.params.c);
      case "zmf":
        return zmf(x, variable.params.a, variable.params.b);
      case "smf":
        return smf(x, variable.params.a, variable.params.b);
      case "pimf":
        return pimf(x, variable.params.a, variable.params.b, variable.params.c, variable.params.d);
      default:
        return 0;
    }
  });

  // Combina los grados según el operador (AND = min, OR = max)
  let gradoFinal = grados[0];
  for (let i = 1; i < grados.length; i++) {
    if (regla.operator === "AND") {
      gradoFinal = Math.min(gradoFinal, grados[i]);
    } else {
      gradoFinal = Math.max(gradoFinal, grados[i]);
    }
  }

  // Retorna el resultado para el consecuente
  return {
    variable: regla.consequent.variable,
    set: regla.consequent.set,
    grado: gradoFinal,
  };
}

// Calcula la salida difusa y el valor desfuzzificado para una variable de salida
function inferirYDesfuzzificar(rules, variables, variableSalida) {
  // Dominio de la variable de salida (ajusta si tu dominio es diferente)
  const xValues = Array.from({ length: 101 }, (_, i) => i / 100);

  // Para cada x, calcula el máximo grado de activación de todas las reglas que afectan a esta variable y conjunto
  const activacion = xValues.map(x => {
    // Para cada regla que afecta a esta variable de salida
    const grados = rules
      .filter(r => r.consequent.variable === variableSalida.name)
      .map(r => {
        // Grado de activación de la regla
        const res = evaluarRegla(r, variables);
        // Función de membresía del conjunto de salida
        let mf = 0;
        switch (variableSalida.membershipType) {
          case "trimf":
            mf = trimf(x, variableSalida.params.a, variableSalida.params.b, variableSalida.params.c); break;
          case "trapmf":
            mf = trapmf(x, variableSalida.params.a, variableSalida.params.b, variableSalida.params.c, variableSalida.params.d); break;
          case "gaussmf":
            mf = gaussmf(x, variableSalida.params.mean, variableSalida.params.sigma); break;
          case "gauss2mf":
            mf = gauss2mf(x, variableSalida.params.mean1, variableSalida.params.sigma1, variableSalida.params.mean2, variableSalida.params.sigma2); break;
          case "sigmf":
            mf = sigmf(x, variableSalida.params.a, variableSalida.params.c); break;
          case "dsigmf":
            mf = dsigmf(x, variableSalida.params.a1, variableSalida.params.c1, variableSalida.params.a2, variableSalida.params.c2); break;
          case "psigmf":
            mf = psigmf(x, variableSalida.params.a1, variableSalida.params.c1, variableSalida.params.a2, variableSalida.params.c2); break;
          case "gbellmf":
            mf = gbellmf(x, variableSalida.params.a, variableSalida.params.b, variableSalida.params.c); break;
          case "zmf":
            mf = zmf(x, variableSalida.params.a, variableSalida.params.b); break;
          case "smf":
            mf = smf(x, variableSalida.params.a, variableSalida.params.b); break;
          case "pimf":
            mf = pimf(x, variableSalida.params.a, variableSalida.params.b, variableSalida.params.c, variableSalida.params.d); break;
          default:
            mf = 0;
        }
        // Recorta la función de membresía al grado de activación de la regla (implicación tipo Mamdani)
        return Math.min(res.grado, mf);
      });
    // Toma el máximo de todas las reglas para este x
    return Math.max(...grados, 0);
  });

  // Desfuzzificación por centroide
  const num = xValues.reduce((acc, x, i) => acc + x * activacion[i], 0);
  const den = xValues.reduce((acc, _, i) => acc + activacion[i], 0);
  const centroide = den === 0 ? 0 : num / den;

  return { xValues, activacion, centroide };
}

// Sugeno (TSK): calcula la salida para reglas tipo Sugeno (soporta múltiples salidas)
function inferirSugeno(rules, variables) {
  // Encuentra todas las variables de salida tipo Sugeno
  const outputVars = variables.filter(v => v.type === "output");
  if (outputVars.length === 0) return null;

  const resultados = {};
  for (const outputVar of outputVars) {
    // Filtra reglas Sugeno que afectan a esta variable de salida
    const sugenoRules = rules.filter(r => r.type === "sugeno" && r.consequent.variable === outputVar.name);
    if (sugenoRules.length === 0) {
      resultados[outputVar.name] = null;
      continue;
    }

    let num = 0;
    let den = 0;
    for (const regla of sugenoRules) {
      // Grado de activación (igual que Mamdani)
      const grados = regla.antecedents.map(ant => {
        const variable = variables.find(v => v.name === ant.variable);
        if (!variable) return 0;
        const set = variable.sets.find(s => s.name === ant.set);
        if (!set) return 0;
        const x = variable.input;
        switch (set.membershipType) {
          case "trimf": return trimf(x, set.params.a, set.params.b, set.params.c);
          case "trapmf": return trapmf(x, set.params.a, set.params.b, set.params.c, set.params.d);
          case "gaussmf": return gaussmf(x, set.params.mean, set.params.sigma);
          case "gauss2mf": return gauss2mf(x, set.params.mean1, set.params.sigma1, set.params.mean2, set.params.sigma2);
          case "sigmf": return sigmf(x, set.params.a, set.params.c);
          case "dsigmf": return dsigmf(x, set.params.a1, set.params.c1, set.params.a2, set.params.c2);
          case "psigmf": return psigmf(x, set.params.a1, set.params.c1, set.params.a2, set.params.c2);
          case "gbellmf": return gbellmf(x, set.params.a, set.params.b, set.params.c);
          case "zmf": return zmf(x, set.params.a, set.params.b);
          case "smf": return smf(x, set.params.a, set.params.b);
          case "pimf": return pimf(x, set.params.a, set.params.b, set.params.c, set.params.d);
          default: return 0;
        }
      });
      let w = grados[0];
      for (let i = 1; i < grados.length; i++) {
        w = regla.operator === "AND" ? Math.min(w, grados[i]) : Math.max(w, grados[i]);
      }

      // Salida de la función Sugeno: y = a1*x1 + a2*x2 + ... + c
      let y = 0;
      for (const v of variables.filter(v => v.type === "input")) {
        y += (regla.consequent[`a_${v.name}`] ?? 0) * (v.input ?? 0);
      }
      y += regla.consequent.c ?? 0;

      num += w * y;
      den += w;
    }
    resultados[outputVar.name] = den === 0 ? 0 : num / den;
  }
  return resultados;
}

function detalleReglasSugeno(rules, variables) {
  // Devuelve un objeto: { [nombreVariableSalida]: [ { w, y, contribucion, regla } ] }
  const outputVars = variables.filter(v => v.type === "output");
  const detalles = {};
  for (const outputVar of outputVars) {
    const sugenoRules = rules.filter(r => r.type === "sugeno" && r.consequent.variable === outputVar.name);
    detalles[outputVar.name] = sugenoRules.map(regla => {
      // Grado de activación
      const grados = regla.antecedents.map(ant => {
        const variable = variables.find(v => v.name === ant.variable);
        if (!variable) return 0;
        const set = variable.sets.find(s => s.name === ant.set);
        if (!set) return 0;
        const x = variable.input;
        switch (set.membershipType) {
          case "trimf": return trimf(x, set.params.a, set.params.b, set.params.c);
          case "trapmf": return trapmf(x, set.params.a, set.params.b, set.params.c, set.params.d);
          case "gaussmf": return gaussmf(x, set.params.mean, set.params.sigma);
          case "gauss2mf": return gauss2mf(x, set.params.mean1, set.params.sigma1, set.params.mean2, set.params.sigma2);
          case "sigmf": return sigmf(x, set.params.a, set.params.c);
          case "dsigmf": return dsigmf(x, set.params.a1, set.params.c1, set.params.a2, set.params.c2);
          case "psigmf": return psigmf(x, set.params.a1, set.params.c1, set.params.a2, set.params.c2);
          case "gbellmf": return gbellmf(x, set.params.a, set.params.b, set.params.c);
          case "zmf": return zmf(x, set.params.a, set.params.b);
          case "smf": return smf(x, set.params.a, set.params.b);
          case "pimf": return pimf(x, set.params.a, set.params.b, set.params.c, set.params.d);
          default: return 0;
        }
      });
      let w = grados[0];
      for (let i = 1; i < grados.length; i++) {
        w = regla.operator === "AND" ? Math.min(w, grados[i]) : Math.max(w, grados[i]);
      }
      // Salida y_i
      let y = 0;
      for (const v of variables.filter(v => v.type === "input")) {
        y += (regla.consequent[`a_${v.name}`] ?? 0) * (v.input ?? 0);
      }
      y += regla.consequent.c ?? 0;
      return {
        w,
        y,
        contribucion: w * y,
        regla
      };
    });
  }
  return detalles;
}

const generateData = (values, membershipType) => {
  const data = [];
  for (let x = 0; x <= 1; x += 0.01) {
    let y = 0;
    switch (membershipType) {
      case "trimf":
        y = trimf(x, values.a, values.b, values.c); break;
      case "trapmf":
        y = trapmf(x, values.a, values.b, values.c, values.d); break;
      case "gaussmf":
        y = gaussmf(x, values.mean, values.sigma); break;
      case "gauss2mf":
        y = gauss2mf(x, values.mean1, values.sigma1, values.mean2, values.sigma2); break;
      case "sigmf":
        y = sigmf(x, values.a, values.c); break;
      case "dsigmf":
        y = dsigmf(x, values.a1, values.c1, values.a2, values.c2); break;
      case "psigmf":
        y = psigmf(x, values.a1, values.c1, values.a2, values.c2); break;
      case "gbellmf":
        y = gbellmf(x, values.a, values.b, values.c); break;
      case "zmf":
        y = zmf(x, values.a, values.b); break;
      case "smf":
        y = smf(x, values.a, values.b); break;
      case "pimf":
        y = pimf(x, values.a, values.b, values.c, values.d); break;
      default:
        y = 0;
    }
    data.push({ x, y });
  }
  return data;
};

const FuzzyLogic = () => {
  const [variables, setVariables] = useState([
    {
      name: "Variable 1",
      type: "input", // Tipo de variable (entrada o salida)
      sets: [
        { name: "Conjunto 1", membershipType: "", params: {} }, // Sin función seleccionada
      ],
      input: 0.5,
      output: null,
    },
  ]);
  const [rules, setRules] = useState([]);
  const [membershipParams, setMembershipParams] = useState({ a: 0, b: 0.5, c: 1 });
  const [membershipType, setMembershipType] = useState("trimf");
  const [input, setInput] = useState(0.5);
  const [output, setOutput] = useState(null);
  const [selectedVariableIdx, setSelectedVariableIdx] = useState(0);
  const [editingRule, setEditingRule] = useState({
    antecedents: [{ variable: "", set: "" }],
    operator: "AND",
    consequent: { variable: "", set: "" },
    weight: 1 // Nuevo campo
  });
  const [desfuzzResults, setDesfuzzResults] = useState([]);
  const [editRuleIdx, setEditRuleIdx] = useState(null); // Índice de la regla a editar
  const [editRuleDraft, setEditRuleDraft] = useState(null); // Borrador de la regla a editar
  const [inferenceMethod, setInferenceMethod] = useState("mamdani"); // "mamdani" o "sugeno"

  useEffect(() => {
    localStorage.setItem("fuzzylogic-variables", JSON.stringify(variables));
    localStorage.setItem("fuzzylogic-rules", JSON.stringify(rules));
  }, [variables, rules]);

    useEffect(() => {
    const vars = localStorage.getItem("fuzzylogic-variables");
    const rls = localStorage.getItem("fuzzylogic-rules");
    if (vars && rls) {
      try {
        setVariables(JSON.parse(vars));
        setRules(JSON.parse(rls));
      } catch {}
    }
  }, []);

  useEffect(() => {
    // Calcula la salida desfuzzificada para cada variable de salida
    const results = variables
      .filter(v => v.type === "output")
      .map(v => ({
        name: v.name,
        centroide: inferirYDesfuzzificar(rules, variables, v).centroide
      }));
    setDesfuzzResults(results);
  }, [variables, rules]);

  const evaluarTodasLasReglas = () => {
    // Devuelve un array con el resultado de cada regla
    return rules.map(regla => evaluarRegla(regla, variables));
  };

  const formik = useFormik({
    initialValues: { a: 0, b: 0.5, c: 1, input: 0.5 },
    validationSchema: Yup.object({
      a: Yup.number().min(0).max(1).required(),
      b: Yup.number().min(0).max(1).required(),
      c: Yup.number().min(0).max(1).required(),
      input: Yup.number().min(0).max(1).required(),
    }),
    onSubmit: (values) => {
      setInput(values.input);
      let result = 0;
      switch (membershipType) {
        case "trimf":
          result = trimf(values.input, values.a, values.b, values.c); break;
        case "trapmf":
          result = trapmf(values.input, values.a, values.b, values.c, values.d); break;
        case "gaussmf":
          result = gaussmf(values.input, values.mean, values.sigma); break;
        case "gauss2mf":
          result = gauss2mf(values.input, values.mean1, values.sigma1, values.mean2, values.sigma2); break;
        case "sigmf":
          result = sigmf(values.input, values.a, values.c); break;
        case "dsigmf":
          result = dsigmf(values.input, values.a1, values.c1, values.a2, values.c2); break;
        case "psigmf":
          result = psigmf(values.input, values.a1, values.c1, values.a2, values.c2); break;
        case "gbellmf":
          result = gbellmf(values.input, values.a, values.b, values.c); break;
        case "zmf":
          result = zmf(values.input, values.a, values.b); break;
        case "smf":
          result = smf(values.input, values.a, values.b); break;
        case "pimf":
          result = pimf(values.input, values.a, values.b, values.c, values.d); break;
        default:
          result = 0;
      }
      setOutput(result.toFixed(3));
    },
  });

  const handleMembershipTypeChange = (e) => {
    setMembershipType(e.target.value);
    formik.resetForm(); // Esto limpia los valores del formulario
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Fuzzy Logic Toolbox (Simulación tipo MATLAB)
      </Typography>
      {/* --- Botones de guardar/cargar configuración --- */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            const data = {
              variables,
              rules,
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "fuzzylogic-config.json";
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          Guardar configuración (JSON)
        </Button>
        <Button
          variant="contained"
          color="secondary"
          component="label"
        >
          Cargar configuración (JSON)
          <input
            type="file"
            accept="application/json"
            hidden
            onChange={async (e) => {
              const file = e.target.files[0];
              if (!file) return;
              try {
                const text = await file.text();
                const data = JSON.parse(text);
                if (data.variables && data.rules) {
                  setVariables(data.variables);
                  setRules(data.rules);
                  alert("¡Configuración cargada correctamente!");
                } else {
                  alert("El archivo no tiene el formato esperado.");
                }
              } catch (err) {
                alert("Error al leer el archivo: " + err.message);
              }
            }}
          />
        </Button>
      </Box>
      {/* --- Selector de método de inferencia --- */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mr: 2, display: "inline" }}>
          Método de inferencia:
        </Typography>
        <select
          value={inferenceMethod}
          onChange={e => setInferenceMethod(e.target.value)}
          style={{ width: 180, height: 30 }}
        >
          <option value="mamdani">Mamdani (centroide)</option>
          <option value="sugeno">Sugeno (TSK)</option>
        </select>
      </Box>
      {/* --- Fin selector de método de inferencia --- */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={2}>
              <Typography>Parámetros Triangular:</Typography>
            </Grid>
            <Grid item xs={12} sm={2}>
              <input
                type="number"
                name="a"
                step="0.01"
                min="0"
                max="1"
                value={formik.values.a}
                onChange={formik.handleChange}
                style={{ width: "60px" }}
              />
              <Typography variant="caption">a</Typography>
            </Grid>
            <Grid item xs={12} sm={2}>
              <input
                type="number"
                name="b"
                step="0.01"
                min="0"
                max="1"
                value={formik.values.b}
                onChange={formik.handleChange}
                style={{ width: "60px" }}
              />
              <Typography variant="caption">b</Typography>
            </Grid>
            <Grid item xs={12} sm={2}>
              <input
                type="number"
                name="c"
                step="0.01"
                min="0"
                max="1"
                value={formik.values.c}
                onChange={formik.handleChange}
                style={{ width: "60px" }}
              />
              <Typography variant="caption">c</Typography>
            </Grid>
            <Grid item xs={12} sm={2}>
              <input
                type="number"
                name="input"
                step="0.01"
                min="0"
                max="1"
                value={formik.values.input}
                onChange={formik.handleChange}
                style={{ width: "60px" }}
              />
              <Typography variant="caption">Entrada</Typography>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button type="submit" variant="contained">
                Calcular
              </Button>
            </Grid>
          </Grid>
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Grid item xs={12} sm={3}>
              <Typography>Tipo de función de membresía:</Typography>
            </Grid>
            <Grid item xs={12} sm={9}>
              <select
                value={membershipType}
                onChange={handleMembershipTypeChange}
                style={{ width: "250px", height: "30px" }}
              >
                <option value="trimf">Triangular (trimf)</option>
                <option value="trapmf">Trapezoidal (trapmf)</option>
                <option value="gaussmf">Gaussiana simple (gaussmf)</option>
                <option value="gauss2mf">Gaussiana doble (gauss2mf)</option>
                <option value="sigmf">Sigmoidal simple (sigmf)</option>
                <option value="dsigmf">Producto de dos sigmoides (dsigmf)</option>
                <option value="psigmf">Diferencia de dos sigmoides (psigmf)</option>
                <option value="gbellmf">Campana generalizada (gbellmf)</option>
                <option value="zmf">Función Z (zmf)</option>
                <option value="smf">Función S (smf)</option>
                <option value="pimf">Función Pi (pimf)</option>
              </select>
            </Grid>
          </Grid>
          {/* Parámetros dinámicos según la función */}
          {membershipType === "trimf" && (
            <>
              <Grid item xs={12} sm={2}>
                <input type="number" name="a" step="0.01" min="0" max="1"
                  value={formik.values.a ?? 0} onChange={formik.handleChange} style={{ width: "60px" }} />
                <Typography variant="caption">a</Typography>
              </Grid>
              <Grid item xs={12} sm={2}>
                <input type="number" name="b" step="0.01" min="0" max="1"
                  value={formik.values.b ?? 0.5} onChange={formik.handleChange} style={{ width: "60px" }} />
                <Typography variant="caption">b</Typography>
              </Grid>
              <Grid item xs={12} sm={2}>
                <input type="number" name="c" step="0.01" min="0" max="1"
                  value={formik.values.c ?? 1} onChange={formik.handleChange} style={{ width: "60px" }} />
                <Typography variant="caption">c</Typography>
              </Grid>
            </>
          )}
          {membershipType === "trapmf" && (
            <>
              <Grid item xs={12} sm={2}>
                <input type="number" name="a" step="0.01" min="0" max="1"
                  value={formik.values.a ?? 0} onChange={formik.handleChange} style={{ width: "60px" }} />
                <Typography variant="caption">a</Typography>
              </Grid>
              <Grid item xs={12} sm={2}>
                <input type="number" name="b" step="0.01" min="0" max="1"
                  value={formik.values.b ?? 0.3} onChange={formik.handleChange} style={{ width: "60px" }} />
                <Typography variant="caption">b</Typography>
              </Grid>
              <Grid item xs={12} sm={2}>
                <input type="number" name="c" step="0.01" min="0" max="1"
                  value={formik.values.c ?? 0.7} onChange={formik.handleChange} style={{ width: "60px" }} />
                <Typography variant="caption">c</Typography>
              </Grid>
              <Grid item xs={12} sm={2}>
                <input type="number" name="d" step="0.01" min="0" max="1"
                  value={formik.values.d ?? 1} onChange={formik.handleChange} style={{ width: "60px" }} />
                <Typography variant="caption">d</Typography>
              </Grid>
            </>
          )}
          {membershipType === "gaussmf" && (
            <>
              <Grid item xs={12} sm={2}>
                <input type="number" name="mean" step="0.01" min="0" max="1"
                  value={formik.values.mean ?? 0.5} onChange={formik.handleChange} style={{ width: "60px" }} />
                <Typography variant="caption">mean</Typography>
              </Grid>
              <Grid item xs={12} sm={2}>
                <input type="number" name="sigma" step="0.01" min="0.01" max="1"
                  value={formik.values.sigma ?? 0.1} onChange={formik.handleChange} style={{ width: "60px" }} />
                <Typography variant="caption">sigma</Typography>
              </Grid>
            </>
          )}
          {membershipType === "gauss2mf" && (
            <>
              <Grid item xs={12} sm={2}>
                <input type="number" name="mean1" step="0.01" min="0" max="1"
                  value={formik.values.mean1 ?? 0.3} onChange={formik.handleChange} style={{ width: "60px" }} />
                <Typography variant="caption">mean1</Typography>
              </Grid>
              <Grid item xs={12} sm={2}>
                <input type="number" name="sigma1" step="0.01" min="0.01" max="1"
                  value={formik.values.sigma1 ?? 0.1} onChange={formik.handleChange} style={{ width: "60px" }} />
                <Typography variant="caption">sigma1</Typography>
              </Grid>
              <Grid item xs={12} sm={2}>
                <input type="number" name="mean2" step="0.01" min="0" max="1"
                  value={formik.values.mean2 ?? 0.7} onChange={formik.handleChange} style={{ width: "60px" }} />
                <Typography variant="caption">mean2</Typography>
              </Grid>
              <Grid item xs={12} sm={2}>
                <input type="number" name="sigma2" step="0.01" min="0.01" max="1"
                  value={formik.values.sigma2 ?? 0.1} onChange={formik.handleChange} style={{ width: "60px" }} />
                <Typography variant="caption">sigma2</Typography>
              </Grid>
            </>
          )}
          {membershipType === "sigmf" && (
            <>
              <Grid item xs={12} sm={2}>
                <input type="number" name="a" step="0.01" min="-10" max="10"
                  value={formik.values.a ?? 1} onChange={formik.handleChange} style={{ width: "60px" }} />
                <Typography variant="caption">a</Typography>
              </Grid>
              <Grid item xs={12} sm={2}>
                <input type="number" name="c" step="0.01" min="0" max="1"
                  value={formik.values.c ?? 0.5} onChange={formik.handleChange} style={{ width: "60px" }} />
                <Typography variant="caption">c</Typography>
              </Grid>
            </>
          )}
          {membershipType === "dsigmf" && (
            <>
              <Grid item xs={12} sm={2}>
                <input type="number" name="a1" step="0.01" min="-10" max="10"
                  value={formik.values.a1 ?? 1} onChange={formik.handleChange} style={{ width: "60px" }} />
                <Typography variant="caption">a1</Typography>
              </Grid>
              <Grid item xs={12} sm={2}>
                <input type="number" name="c1" step="0.01" min="0" max="1"
                  value={formik.values.c1 ?? 0.3} onChange={formik.handleChange} style={{ width: "60px" }} />
                <Typography variant="caption">c1</Typography>
              </Grid>
              <Grid item xs={12} sm={2}>
                <input type="number" name="a2" step="0.01" min="-10" max="10"
                  value={formik.values.a2 ?? 1} onChange={formik.handleChange} style={{ width: "60px" }} />
                <Typography variant="caption">a2</Typography>
              </Grid>
              <Grid item xs={12} sm={2}>
                <input type="number" name="c2" step="0.01" min="0" max="1"
                  value={formik.values.c2 ?? 0.7} onChange={formik.handleChange} style={{ width: "60px" }} />
                <Typography variant="caption">c2</Typography>
              </Grid>
            </>
          )}
          {membershipType === "psigmf" && (
            <>
              <Grid item xs={12} sm={2}>
                <input type="number" name="a1" step="0.01" min="-10" max="10"
                  value={formik.values.a1 ?? 1} onChange={formik.handleChange} style={{ width: "60px" }} />
                <Typography variant="caption">a1</Typography>
              </Grid>
              <Grid item xs={12} sm={2}>
                <input type="number" name="c1" step="0.01" min="0" max="1"
                  value={formik.values.c1 ?? 0.3} onChange={formik.handleChange} style={{ width: "60px" }} />
                <Typography variant="caption">c1</Typography>
              </Grid>
              <Grid item xs={12} sm={2}>
                <input type="number" name="a2" step="0.01" min="-10" max="10"
                  value={formik.values.a2 ?? 1} onChange={formik.handleChange} style={{ width: "60px" }} />
                <Typography variant="caption">a2</Typography>
              </Grid>
              <Grid item xs={12} sm={2}>
                <input type="number" name="c2" step="0.01" min="0" max="1"
                  value={formik.values.c2 ?? 0.7} onChange={formik.handleChange} style={{ width: "60px" }} />
                <Typography variant="caption">c2</Typography>
              </Grid>
            </>
          )}
          {membershipType === "gbellmf" && (
            <>
              <Grid item xs={12} sm={2}>
                <input type="number" name="a" step="0.01" min="0.01" max="1"
                  value={formik.values.a ?? 0.2} onChange={formik.handleChange} style={{ width: "60px" }} />
                <Typography variant="caption">a</Typography>
              </Grid>
              <Grid item xs={12} sm={2}>
                <input type="number" name="b" step="0.01" min="0.01" max="10"
                  value={formik.values.b ?? 2} onChange={formik.handleChange} style={{ width: "60px" }} />
                <Typography variant="caption">b</Typography>
              </Grid>
              <Grid item xs={12} sm={2}>
                <input type="number" name="c" step="0.01" min="0" max="1"
                  value={formik.values.c ?? 0.5} onChange={formik.handleChange} style={{ width: "60px" }} />
                <Typography variant="caption">c</Typography>
              </Grid>
            </>
          )}
          {membershipType === "zmf" && (
            <>
              <Grid item xs={12} sm={2}>
                <input type="number" name="a" step="0.01" min="0" max="1"
                  value={formik.values.a ?? 0.2} onChange={formik.handleChange} style={{ width: "60px" }} />
                <Typography variant="caption">a</Typography>
              </Grid>
              <Grid item xs={12} sm={2}>
                <input type="number" name="b" step="0.01" min="0" max="1"
                  value={formik.values.b ?? 0.8} onChange={formik.handleChange} style={{ width: "60px" }} />
                <Typography variant="caption">b</Typography>
              </Grid>
            </>
          )}
          {membershipType === "smf" && (
            <>
              <Grid item xs={12} sm={2}>
                <input type="number" name="a" step="0.01" min="0" max="1"
                  value={formik.values.a ?? 0.2} onChange={formik.handleChange} style={{ width: "60px" }} />
                <Typography variant="caption">a</Typography>
              </Grid>
              <Grid item xs={12} sm={2}>
                <input type="number" name="b" step="0.01" min="0" max="1"
                  value={formik.values.b ?? 0.8} onChange={formik.handleChange} style={{ width: "60px" }} />
                <Typography variant="caption">b</Typography>
              </Grid>
            </>
          )}
          {membershipType === "pimf" && (
            <>
              <Grid item xs={12} sm={2}>
                <input type="number" name="a" step="0.01" min="0" max="1"
                  value={formik.values.a ?? 0.1} onChange={formik.handleChange} style={{ width: "60px" }} />
                <Typography variant="caption">a</Typography>
              </Grid>
              <Grid item xs={12} sm={2}>
                <input type="number" name="b" step="0.01" min="0" max="1"
                  value={formik.values.b ?? 0.3} onChange={formik.handleChange} style={{ width: "60px" }} />
                <Typography variant="caption">b</Typography>
              </Grid>
              <Grid item xs={12} sm={2}>
                <input type="number" name="c" step="0.01" min="0" max="1"
                  value={formik.values.c ?? 0.7} onChange={formik.handleChange} style={{ width: "60px" }} />
                <Typography variant="caption">c</Typography>
              </Grid>
              <Grid item xs={12} sm={2}>
                <input type="number" name="d" step="0.01" min="0" max="1"
                  value={formik.values.d ?? 0.9} onChange={formik.handleChange} style={{ width: "60px" }} />
                <Typography variant="caption">d</Typography>
              </Grid>
            </>
          )}
        </form>
      </Paper>
      {/* Solo una gráfica grande, la de la variable seleccionada */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6">
          Visualización de conjuntos de la variable
          {variables[selectedVariableIdx] && (
            <> — <b>{variables[selectedVariableIdx].name}</b></>
          )}
        </Typography>
        {variables[selectedVariableIdx] && (
          <Line
            data={{
              labels: Array.from({ length: 101 }, (_, i) => i / 100),
              datasets: [
                // 1. Función de la variable (línea negra punteada)
                {
                  label: `Función de la variable (${variables[selectedVariableIdx].membershipType})`,
                  data: Array.from({ length: 101 }, (_, i) => {
                    const x = i / 100;
                    const v = variables[selectedVariableIdx];
                    switch (v.membershipType) {
                      case "trimf":
                        return trimf(x, v.params.a, v.params.b, v.params.c);
                      case "trapmf":
                        return trapmf(x, v.params.a, v.params.b, v.params.c, v.params.d);
                      case "gaussmf":
                        return gaussmf(x, v.params.mean, v.params.sigma);
                      case "gauss2mf":
                        return gauss2mf(x, v.params.mean1, v.params.sigma1, v.params.mean2, v.params.sigma2);
                      case "sigmf":
                        return sigmf(x, v.params.a, v.params.c);
                      case "dsigmf":
                        return dsigmf(x, v.params.a1, v.params.c1, v.params.a2, v.params.c2);
                      case "psigmf":
                        return psigmf(x, v.params.a1, v.params.c1, v.params.a2, v.params.c2);
                      case "gbellmf":
                        return gbellmf(x, v.params.a, v.params.b, v.params.c);
                      case "zmf":
                        return zmf(x, v.params.a, v.params.b);
                      case "smf":
                        return smf(x, v.params.a, v.params.b);
                      case "pimf":
                        return pimf(x, v.params.a, v.params.b, v.params.c, v.params.d);
                      default:
                        return 0;
                    }
                  }),
                  fill: false,
                  borderColor: "#000",
                  borderDash: [6, 4],
                  borderWidth: 2,
                  pointRadius: 0,
                  tension: 0.1,
                  order: 0,
                },
                // 2. Conjuntos lingüísticos (colores)
                ...variables[selectedVariableIdx].sets
                  .filter(set => set.membershipType)
                  .map((set, setIdx) => ({
                    label: set.name || `Conjunto ${setIdx + 1}`,
                    data: Array.from({ length: 101 }, (_, i) => {
                      const x = i / 100;
                      switch (set.membershipType) {
                        case "trimf":
                          return trimf(x, set.params.a, set.params.b, set.params.c);
                        case "trapmf":
                          return trapmf(x, set.params.a, set.params.b, set.params.c, set.params.d);
                        case "gaussmf":
                          return gaussmf(x, set.params.mean, set.params.sigma);
                        case "gauss2mf":
                          return gauss2mf(x, set.params.mean1, set.params.sigma1, set.params.mean2, set.params.sigma2);
                        case "sigmf":
                          return sigmf(x, set.params.a, set.params.c);
                        case "dsigmf":
                          return dsigmf(x, set.params.a1, set.params.c1, set.params.a2, set.params.c2);
                        case "psigmf":
                          return psigmf(x, set.params.a1, set.params.c1, set.params.a2, set.params.c2);
                        case "gbellmf":
                          return gbellmf(x, set.params.a, set.params.b, set.params.c);
                        case "zmf":
                          return zmf(x, set.params.a, set.params.b);
                        case "smf":
                          return smf(x, set.params.a, set.params.b);
                        case "pimf":
                          return pimf(x, set.params.a, set.params.b, set.params.c, set.params.d);
                        default:
                          return 0;
                      }
                    }),
                    fill: false,
                    borderColor: [
                      "#1976d2", "#d32f2f", "#388e3c", "#fbc02d", "#7b1fa2", "#0288d1", "#c2185b", "#ffa000", "#388e3c", "#303f9f"
                    ][setIdx % 10],
                    backgroundColor: [
                      "#1976d2", "#d32f2f", "#388e3c", "#fbc02d", "#7b1fa2", "#0288d1", "#c2185b", "#ffa000", "#388e3c", "#303f9f"
                    ][setIdx % 10],
                    tension: 0.1,
                    pointRadius: 0,
                    order: 1 + setIdx,
                  })),
                // 3. Línea vertical para la entrada actual
                {
                  label: "Entrada actual",
                  data: Array.from({ length: 101 }, (_, i) => {
                    const x = i / 100;
                    return x === variables[selectedVariableIdx].input ? 1 : null;
                  }),
                  type: "line",
                  borderColor: "#000",
                  borderWidth: 2,
                  pointRadius: 0,
                  fill: false,
                  stepped: false,
                  showLine: true,
                  spanGaps: true,
                  order: 100,
                },
                // 4. Puntos de grado de membresía para cada conjunto en la entrada actual
                ...variables[selectedVariableIdx].sets
                  .filter(set => set.membershipType)
                  .map((set, setIdx) => {
                    const x = variables[selectedVariableIdx].input;
                    let y = 0;
                    switch (set.membershipType) {
                      case "trimf":
                        y = trimf(x, set.params.a, set.params.b, set.params.c); break;
                      case "trapmf":
                        y = trapmf(x, set.params.a, set.params.b, set.params.c, set.params.d); break;
                      case "gaussmf":
                        y = gaussmf(x, set.params.mean, set.params.sigma); break;
                      case "gauss2mf":
                        y = gauss2mf(x, set.params.mean1, set.params.sigma1, set.params.mean2, set.params.sigma2); break;
                      case "sigmf":
                        y = sigmf(x, set.params.a, set.params.c); break;
                      case "dsigmf":
                        y = dsigmf(x, set.params.a1, set.params.c1, set.params.a2, set.params.c2); break;
                      case "psigmf":
                        y = psigmf(x, set.params.a1, set.params.c1, set.params.a2, set.params.c2); break;
                      case "gbellmf":
                        y = gbellmf(x, set.params.a, set.params.b, set.params.c); break;
                      case "zmf":
                        y = zmf(x, set.params.a, set.params.b); break;
                      case "smf":
                        y = smf(x, set.params.a, set.params.b); break;
                      case "pimf":
                        y = pimf(x, set.params.a, set.params.b, set.params.c, set.params.d); break;
                      default:
                        y = 0;
                    }
                    return {
                      label: `(${set.name}) Entrada`,
                      data: Array.from({ length: 101 }, (_, i) => {
                        const xi = i / 100;
                        return xi === x ? y : null;
                      }),
                      type: "scatter",
                      pointBackgroundColor: [
                        "#1976d2", "#d32f2f", "#388e3c", "#fbc02d", "#7b1fa2", "#0288d1", "#c2185b", "#ffa000", "#388e3c", "#303f9f"
                      ][setIdx % 10],
                      pointBorderColor: "#000",
                      pointRadius: 7,
                      showLine: false,
                      order: 101 + setIdx,
                    };
                  }),
              ],
            }}
            options={{
              plugins: {
                legend: { display: true, position: "top" },
                title: {
                  display: true,
                  text: `Conjuntos de la variable "${variables[selectedVariableIdx].name}"`,
                  font: { size: 16 }
                },
                tooltip: tooltipAvanzado,
              },
              scales: {
                x: { title: { display: true, text: "Dominio (x)" } },
                y: { title: { display: true, text: "Grado de membresía" }, min: 0, max: 1 }
              }
            }}
          />
        )}
      </Paper>
      {/* Agregar regla difusa */}
      <Paper sx={{ p: 3, mb: 4, mt: 4 }}>
        <Typography variant="h6" gutterBottom>Agregar regla difusa</Typography>
        <Grid container spacing={2} alignItems="center">
          {/* Antecedentes */}
          <Grid item xs={12} sm={12}>
            <Typography variant="subtitle2">Antecedentes (SI...)</Typography>
            {editingRule.antecedents.map((ant, i) => {
              const selectedVar = variables.find(v => v.name === ant.variable && v.type === "input");
              const conjuntos = selectedVar ? selectedVar.sets.filter(s => s.name) : [];
              return (
                <Box key={i} sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <select
                    value={ant.variable}
                    onChange={e => {
                      const newAnt = [...editingRule.antecedents];
                      newAnt[i].variable = e.target.value;
                      // Al cambiar variable, limpia el conjunto seleccionado
                      newAnt[i].set = "";
                      setEditingRule({ ...editingRule, antecedents: newAnt });
                    }}
                    style={{ width: 140, marginRight: 8 }}
                  >
                    <option value="">Variable</option>
                    {variables.filter(v => v.type === "input").map((v, idx) => (
                      <option key={idx} value={v.name}>{v.name}</option>
                    ))}
                  </select>
                  <select
                    value={ant.set}
                    onChange={e => {
                      const newAnt = [...editingRule.antecedents];
                      newAnt[i].set = e.target.value;
                      setEditingRule({ ...editingRule, antecedents: newAnt });
                    }}
                    style={{ width: 140, marginRight: 8 }}
                    disabled={!ant.variable}
                  >
                    <option value="">Conjunto</option>
                    {conjuntos.map((set, idx) => (
                      <option key={idx} value={set.name}>{set.name}</option>
                    ))}
                  </select>
                  {editingRule.antecedents.length > 1 && (
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={() => {
                        const newAnt = editingRule.antecedents.filter((_, idx) => idx !== i);
                        setEditingRule({ ...editingRule, antecedents: newAnt });
                      }}
                      sx={{ minWidth: 32, px: 1 }}
                    >✕</Button>
                  )}
                  {ant.variable && conjuntos.length === 0 && (
                    <Typography color="error" sx={{ ml: 2 }}>
                      Esta variable no tiene conjuntos definidos.
                    </Typography>
                  )}
                </Box>
              );
            })}
            <Button
              size="small"
              variant="outlined"
              onClick={() =>
                setEditingRule({
                  ...editingRule,
                  antecedents: [...editingRule.antecedents, { variable: "", set: "" }]
                })
              }
              sx={{ mt: 1 }}
            >+ Añadir condición</Button>
          </Grid>
          {/* Operador */}
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" sx={{ mt: 2 }}>Operador entre condiciones</Typography>
            <select
              value={editingRule.operator}
              onChange={e => setEditingRule({ ...editingRule, operator: e.target.value })}
              style={{ width: 100, marginTop: 4 }}
            >
              <option value="AND">AND</option>
              <option value="OR">OR</option>
            </select>
          </Grid>
          {/* Consecuente */}
          <Grid item xs={12} sm={8}>
            <Typography variant="subtitle2" sx={{ mt: 2 }}>Consecuente (ENTONCES...)</Typography>
            {inferenceMethod === "sugeno" ? (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2">
                  Consecuente Sugeno (y = a₁·x₁ + a₂·x₂ + ... + c):
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
                  {variables.filter(v => v.type === "input").map((v, i) => (
                    <span key={i} style={{ marginRight: 10 }}>
                      <input
                        type="number"
                        value={editingRule.consequent[`a_${v.name}`] ?? 0}
                        onChange={e => {
                          setEditingRule({
                            ...editingRule,
                            consequent: {
                              ...editingRule.consequent,
                              [`a_${v.name}`]: parseFloat(e.target.value)
                            }
                          });
                        }}
                        style={{ width: 60 }}
                        placeholder={`a_${v.name}`}
                      />
                      <span style={{ marginLeft: 2 }}>{v.name}</span>
                      {i < variables.filter(v => v.type === "input").length - 1 ? " + " : ""}
                    </span>
                  ))}
                  <span>
                    <input
                      type="number"
                      value={editingRule.consequent.c ?? 0}
                      onChange={e => {
                        setEditingRule({
                          ...editingRule,
                          consequent: {
                            ...editingRule.consequent,
                            c: parseFloat(e.target.value)
                          }
                        });
                      }}
                      style={{ width: 60, marginLeft: 10 }}
                      placeholder="c"
                    />
                  </span>
                </Box>
              </Box>
            ) : (
              <>
                <select
                  value={editingRule.consequent.variable}
                  onChange={e => {
                    setEditingRule({
                      ...editingRule,
                      consequent: { variable: e.target.value, set: "" }
                    });
                  }}
                  style={{ width: 140, marginRight: 8 }}
                >
                  <option value="">Variable</option>
                  {variables.filter(v => v.type === "output").map((v, idx) => (
                    <option key={idx} value={v.name}>{v.name}</option>
                  ))}
                </select>
                <select
                  value={editingRule.consequent.set}
                  onChange={e =>
                    setEditingRule({
                      ...editingRule,
                      consequent: { ...editingRule.consequent, set: e.target.value }
                    })
                  }
                  style={{ width: 140 }}
                  disabled={!editingRule.consequent.variable}
                >
                  <option value="">Conjunto</option>
                  {(variables.find(v => v.name === editingRule.consequent.variable && v.type === "output")?.sets || [])
                    .filter(s => s.name)
                    .map((set, idx) => (
                      <option key={idx} value={set.name}>{set.name}</option>
                    ))}
                </select>
              </>
            )}
          </Grid>
          {/* Botón agregar */}
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              disabled={
                editingRule.antecedents.some(a => !a.variable || !a.set) ||
                (inferenceMethod === "mamdani" && (!editingRule.consequent.variable || !editingRule.consequent.set)) ||
                (inferenceMethod === "sugeno" && (
                  Object.keys(editingRule.consequent).length === 0 ||
                  !Object.entries(editingRule.consequent).some(([k, v]) =>
                    (k.startsWith("a_") || k === "c") && v !== undefined && v !== null && v !== 0
                  )
                ))
              }
              onClick={() => {
                if (
                  editingRule.antecedents.some(a => !a.variable || !a.set) ||
                  (inferenceMethod === "mamdani" && (!editingRule.consequent.variable || !editingRule.consequent.set)) ||
                  (inferenceMethod === "sugeno" && (
                    Object.keys(editingRule.consequent).length === 0 ||
                    !Object.entries(editingRule.consequent).some(([k, v]) =>
                      (k.startsWith("a_") || k === "c") && v !== undefined && v !== null && v !== 0
                    )
                  ))
                ) {
                  alert("Completa todos los campos de la regla y asegúrate de que al menos un coeficiente o el término independiente esté definido y sea distinto de cero.");
                  return;
                }
                setRules([
                  ...rules,
                  {
                    ...editingRule,
                    type: inferenceMethod // "mamdani" o "sugeno"
                  }
                ]);
                setEditingRule({
                  antecedents: [{ variable: "", set: "" }],
                  operator: "AND",
                  consequent: inferenceMethod === "sugeno"
                    ? {}
                    : { variable: "", set: "" }
                });
              }}
            >
              Agregar regla
            </Button>



          </Grid>
        </Grid>
        {/* Lista de reglas agregadas */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2">Reglas agregadas:</Typography>
          {rules.length === 0 && (
            <Typography variant="body2" color="text.secondary">No hay reglas aún.</Typography>
          )}
          {rules.map((rule, idx) => (
            <Paper key={idx} sx={{ p: 1, my: 1, background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography>
                SI{" "}
                {rule.antecedents.map((a, i) => (
                  <span key={i}>
                    <b>{a.variable}</b> ES <b>{a.set}</b>
                    {i < rule.antecedents.length - 1 ? ` ${rule.operator} ` : ""}
                  </span>
                ))}
                {" "}ENTONCES <b>{rule.consequent.variable}</b> ES <b>{rule.consequent.set}</b>
              </Typography>
              <Box>
                <Button
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ ml: 1 }}
                  onClick={() => {
                    setEditRuleIdx(idx);
                    setEditRuleDraft(JSON.parse(JSON.stringify(rule))); // Copia profunda
                  }}
                >Editar</Button>
                <Button
                  size="small"
                  color="secondary"
                  variant="outlined"
                  sx={{ ml: 1 }}
                  onClick={() => {
                    setRules([...rules, JSON.parse(JSON.stringify(rule))]);
                  }}
                >Duplicar</Button>
                <Button
                  size="small"
                  color="error"
                  variant="outlined"
                  sx={{ ml: 1 }}
                  onClick={() => {
                    setRules(rules.filter((_, i) => i !== idx));
                  }}
                >Eliminar</Button>
              </Box>
            </Paper>
          ))}

          {/* Formulario de edición de regla */}
          {editRuleIdx !== null && editRuleDraft && (
            <Paper sx={{ p: 2, my: 2, background: "#e3f2fd" }}>
              <Typography variant="subtitle2" gutterBottom>Editar regla #{editRuleIdx + 1}</Typography>
              <Grid container spacing={2} alignItems="center">
                {/* Antecedentes */}
                <Grid item xs={12}>
                  <Typography variant="body2">Antecedentes (SI...)</Typography>
                  {editRuleDraft.antecedents.map((ant, i) => {
                    const selectedVar = variables.find(v => v.name === ant.variable && v.type === "input");
                    const conjuntos = selectedVar ? selectedVar.sets.filter(s => s.name) : [];
                    return (
                      <Box key={i} sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                        <select
                          value={ant.variable}
                          onChange={e => {
                            const newAnt = [...editRuleDraft.antecedents];
                            newAnt[i].variable = e.target.value;
                            newAnt[i].set = "";
                            setEditRuleDraft({ ...editRuleDraft, antecedents: newAnt });
                          }}
                          style={{ width: 140, marginRight: 8 }}
                        >
                          <option value="">Variable</option>
                          {variables.filter(v => v.type === "input").map((v, idx) => (
                            <option key={idx} value={v.name}>{v.name}</option>
                          ))}
                        </select>
                        <select
                          value={ant.set}
                          onChange={e => {
                            const newAnt = [...editRuleDraft.antecedents];
                            newAnt[i].set = e.target.value;
                            setEditRuleDraft({ ...editRuleDraft, antecedents: newAnt });
                          }}
                          style={{ width: 140, marginRight: 8 }}
                          disabled={!ant.variable}
                        >
                          <option value="">Conjunto</option>
                          {conjuntos.map((set, idx) => (
                            <option key={idx} value={set.name}>{set.name}</option>
                          ))}
                        </select>
                        {editRuleDraft.antecedents.length > 1 && (
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            onClick={() => {
                              const newAnt = editRuleDraft.antecedents.filter((_, idx) => idx !== i);
                              setEditRuleDraft({ ...editRuleDraft, antecedents: newAnt });
                            }}
                            sx={{ minWidth: 32, px: 1 }}
                          >✕</Button>
                        )}
                        {ant.variable && conjuntos.length === 0 && (
                          <Typography color="error" sx={{ ml: 2 }}>
                            Esta variable no tiene conjuntos definidos.
                          </Typography>
                        )}
                      </Box>
                    );
                  })}
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() =>
                      setEditRuleDraft({
                        ...editRuleDraft,
                        antecedents: [...editRuleDraft.antecedents, { variable: "", set: "" }]
                      })
                    }
                    sx={{ mt: 1 }}
                  >+ Añadir condición</Button>
                </Grid>
                {/* Operador */}
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" sx={{ mt: 2 }}>Operador</Typography>
                  <select
                    value={editRuleDraft.operator}
                    onChange={e => setEditRuleDraft({ ...editRuleDraft, operator: e.target.value })}
                    style={{ width: 100, marginTop: 4 }}
                  >
                    <option value="AND">AND</option>
                    <option value="OR">OR</option>
                  </select>
                </Grid>
                {/* Consecuente */}
                <Grid item xs={12} sm={8}>
                  <Typography variant="body2" sx={{ mt: 2 }}>Consecuente (ENTONCES...)</Typography>
                  {inferenceMethod === "sugeno" ? (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2">
                        Consecuente Sugeno (y = a₁·x₁ + a₂·x₂ + ... + c):
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
                        {variables.filter(v => v.type === "input").map((v, i) => (
                          <span key={i} style={{ marginRight: 10 }}>
                            <input
                              type="number"
                              value={editRuleDraft.consequent[`a_${v.name}`] ?? 0}
                              onChange={e => {
                                setEditRuleDraft({
                                  ...editRuleDraft,
                                  consequent: {
                                    ...editRuleDraft.consequent,
                                    [`a_${v.name}`]: parseFloat(e.target.value)
                                  }
                                });
                              }}
                              style={{ width: 60 }}
                              placeholder={`a_${v.name}`}
                            />
                            <span style={{ marginLeft: 2 }}>{v.name}</span>
                            {i < variables.filter(v => v.type === "input").length - 1 ? " + " : ""}
                          </span>
                        ))}
                        <span>
                          <input
                            type="number"
                            value={editRuleDraft.consequent.c ?? 0}
                            onChange={e => {
                              setEditRuleDraft({
                                ...editRuleDraft,
                                consequent: {
                                  ...editRuleDraft.consequent,
                                  c: parseFloat(e.target.value)
                                }
                              });
                            }}
                            style={{ width: 60, marginLeft: 10 }}
                            placeholder="c"
                          />
                        </span>
                      </Box>
                    </Box>
                  ) : (
                    <>
                      <select
                        value={editRuleDraft.consequent.variable}
                        onChange={e => {
                          setEditRuleDraft({
                            ...editRuleDraft,
                            consequent: { variable: e.target.value, set: "" }
                          });
                        }}
                        style={{ width: 140, marginRight: 8 }}
                      >
                        <option value="">Variable</option>
                        {variables.filter(v => v.type === "output").map((v, idx) => (
                          <option key={idx} value={v.name}>{v.name}</option>
                        ))}
                      </select>
                      <select
                        value={editRuleDraft.consequent.set}
                        onChange={e =>
                          setEditRuleDraft({
                            ...editRuleDraft,
                            consequent: { ...editRuleDraft.consequent, set: e.target.value }
                          })
                        }
                        style={{ width: 140 }}
                        disabled={!editRuleDraft.consequent.variable}
                      >
                        <option value="">Conjunto</option>
                        {(variables.find(v => v.name === editRuleDraft.consequent.variable && v.type === "output")?.sets || [])
                          .filter(s => s.name)
                          .map((set, idx) => (
                            <option key={idx} value={set.name}>{set.name}</option>
                          ))}
                      </select>
                    </>
                  )}
                </Grid>
                {/* Botones de acción */}
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2, mr: 2 }}
                    disabled={
                      editRuleDraft.antecedents.some(a => !a.variable || !a.set) ||
                      !editRuleDraft.consequent.variable ||
                      !editRuleDraft.consequent.set
                    }
                    onClick={() => {
                      // Guardar cambios
                      const newRules = [...rules];
                      newRules[editRuleIdx] = editRuleDraft;
                      setRules(newRules);
                      setEditRuleIdx(null);
                      setEditRuleDraft(null);
                    }}
                  >
                    Guardar cambios
                  </Button>
                  <Button
                    variant="outlined"
                    sx={{ mt: 2 }}
                    onClick={() => {
                      setEditRuleIdx(null);
                      setEditRuleDraft(null);
                    }}
                  >
                    Cancelar
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          )}
        </Box>
        {/* Evaluación de reglas con detalle de antecedentes */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2">Evaluación de reglas:</Typography>
          {rules.length === 0 && (
            <Typography variant="body2" color="text.secondary">No hay reglas para evaluar.</Typography>
          )}
          {rules.map((regla, idx) => {
            // Evaluar cada antecedente individualmente
            const antecedentes = regla.antecedents.map(ant => {
              const variable = variables.find(v => v.name === ant.variable);
              if (!variable) return { ...ant, grado: 0 };
              let grado = 0;
              const x = variable.input;
              switch (variable.membershipType) {
                case "trimf":
                  grado = trimf(x, variable.params.a, variable.params.b, variable.params.c); break;
                case "trapmf":
                  grado = trapmf(x, variable.params.a, variable.params.b, variable.params.c, variable.params.d); break;
                case "gaussmf":
                  grado = gaussmf(x, variable.params.mean, variable.params.sigma); break;
                case "gauss2mf":
                  grado = gauss2mf(x, variable.params.mean1, variable.params.sigma1, variable.params.mean2, variable.params.sigma2); break;
                case "sigmf":
                  grado = sigmf(x, variable.params.a, variable.params.c); break;
                case "dsigmf":
                  grado = dsigmf(x, variable.params.a1, variable.params.c1, variable.params.a2, variable.params.c2); break;
                case "psigmf":
                  grado = psigmf(x, variable.params.a1, variable.params.c1, variable.params.a2, variable.params.c2); break;
                case "gbellmf":
                  grado = gbellmf(x, variable.params.a, variable.params.b, variable.params.c); break;
                case "zmf":
                  grado = zmf(x, variable.params.a, variable.params.b); break;
                case "smf":
                  grado = smf(x, variable.params.a, variable.params.b); break;
                case "pimf":
                  grado = pimf(x, variable.params.a, variable.params.b, variable.params.c, variable.params.d); break;
                default:
                  grado = 0;
              }
              return { ...ant, grado };
            });

            // Calcular el grado final
            let gradoFinal = antecedentes[0].grado;
            for (let i = 1; i < antecedentes.length; i++) {
              if (regla.operator === "AND") {
                gradoFinal = Math.min(gradoFinal, antecedentes[i].grado);
              } else {
                gradoFinal = Math.max(gradoFinal, antecedentes[i].grado);
              }
            }

            return (
              <Box key={idx} sx={{ mb: 1 }}>
                <Typography variant="body2">
                  <b>Regla {idx + 1}:</b>{" "}
                  {regla.antecedents.map((a, i) => (
                    <span key={i}>
                      <b>{a.variable}</b> ES <b>{a.set}</b>
                      {" "}(<span style={{ color: "#1976d2" }}>μ={antecedentes[i].grado.toFixed(3)}</span>)
                      {i < regla.antecedents.length - 1 ? ` ${regla.operator} ` : ""}
                    </span>
                  ))}
                  {" "}→ <b>{regla.consequent.variable}</b> ES <b>{regla.consequent.set}</b>
                </Typography>
                <Typography variant="caption" sx={{ ml: 2 }}>
                  Grado de activación final: <b>{gradoFinal.toFixed(3)}</b>
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Paper>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6">Resultado de membresía</Typography>
        {/* Mostrar Sugeno si hay reglas Sugeno */}
        {rules.some(r => r.type === "sugeno") && (
          <>
            <Typography>
              <b>Salida Sugeno (TSK):</b>
            </Typography>
            {(() => {
              const res = inferirSugeno(rules, variables);
              if (!res || Object.keys(res).length === 0) return <Typography>-</Typography>;
              return (
                <>
                  <Bar
                    data={{
                      labels: Object.keys(res),
                      datasets: [
                        {
                          label: "Salida Sugeno",
                          data: Object.values(res).map(v => v !== null ? v : 0),
                          backgroundColor: "#1976d2",
                        },
                      ],
                    }}
                    options={{
                      indexAxis: "y",
                      plugins: {
                        legend: { display: false },
                        title: {
                          display: true,
                          text: "Salidas Sugeno por variable",
                          font: { size: 16 }
                        },
                        tooltip: {
                          callbacks: {
                            label: ctx => `Valor: ${ctx.parsed.x !== undefined ? ctx.parsed.x.toFixed(4) : "-"}`
                          }
                        }
                      },
                      scales: {
                        x: { min: 0, max: 1, title: { display: true, text: "Valor Sugeno" } },
                        y: { title: { display: true, text: "Variable de salida" } }
                      }
                    }}
                  />
                  <ul>
                    {Object.entries(res).map(([name, value]) => (
                      <li key={name}>
                        <b>{name}:</b> {value !== null ? value.toFixed(4) : "-"}
                      </li>
                    ))}
                  </ul>
                  {/* Detalle de reglas Sugeno */}
                  {(() => {
                    const detalles = detalleReglasSugeno(rules, variables);
                    return Object.entries(detalles).map(([varName, filas]) => (
                      <Box key={varName} sx={{ mt: 2 }}>
                        <Typography variant="subtitle2">
                          Detalle de reglas Sugeno para <b>{varName}</b>:
                        </Typography>
                        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
                          <thead>
                            <tr>
                              <th style={{ border: "1px solid #ccc", padding: 4 }}>#</th>
                              <th style={{ border: "1px solid #ccc", padding: 4 }}>w<sub>i</sub></th>
                              <th style={{ border: "1px solid #ccc", padding: 4 }}>y<sub>i</sub></th>
                              <th style={{ border: "1px solid #ccc", padding: 4 }}>w<sub>i</sub>·y<sub>i</sub></th>
                              <th style={{ border: "1px solid #ccc", padding: 4 }}>Regla</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filas.map((fila, i) => (
                              <tr key={i}>
                                <td style={{ border: "1px solid #ccc", padding: 4 }}>{i + 1}</td>
                                <td style={{ border: "1px solid #ccc", padding: 4 }}>{fila.w.toFixed(4)}</td>
                                <td style={{ border: "1px solid #ccc", padding: 4 }}>{fila.y.toFixed(4)}</td>
                                <td style={{ border: "1px solid #ccc", padding: 4 }}>{fila.contribucion.toFixed(4)}</td>
                                <td style={{ border: "1px solid #ccc", padding: 4 }}>
                                  SI {fila.regla.antecedents.map((a, j) => (
                                    <span key={j}>
                                      <b>{a.variable}</b> ES <b>{a.set}</b>
                                      {j < fila.regla.antecedents.length - 1 ? ` ${fila.regla.operator} ` : ""}
                                    </span>
                                  ))}
                                  {` ENTONCES y = `}
                                  {Object.entries(fila.regla.consequent)
                                    .filter(([k]) => k.startsWith("a_"))
                                    .map(([k, v], idx, arr) => (
                                      <span key={k}>
                                        {v !== 0 ? `${v}·${k.replace("a_", "")}` : ""}
                                        {idx < arr.length - 1 ? " + " : ""}
                                      </span>
                                    ))}
                                  {fila.regla.consequent.c !== undefined ? ` + ${fila.regla.consequent.c}` : ""}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </Box>
                    ));
                  })()}
                </>
              );
            })()}
          </>
        )}
        {/* Mostrar Mamdani si hay reglas Mamdani */}
        {rules.some(r => r.type === "mamdani") && (
          <Typography sx={{ mt: 2 }}>
            Para entrada <b>{input}</b>, el grado de membresía es: <b>{output !== null ? output : "-"}</b>
          </Typography>
        )}
      </Paper>

      <Box sx={{ mt: 4, color: "#888" }}>
        <Typography variant="body2">
          * Puedes expandir esto para agregar múltiples variables, reglas, y métodos de inferencia usando <a href="https://github.com/rodri042/fuzzylogic-js" target="_blank" rel="noopener noreferrer">fuzzylogic-js</a> y visualización avanzada.
        </Typography>
      </Box>
      <Box sx={{ mt: 4 }}>
        <Button
          variant="outlined"
          onClick={() => {
            setVariables([
              ...variables,
              {
                name: `Variable ${variables.length + 1}`,
                type: "input",
                sets: [
                  { name: "Conjunto 1", membershipType: "", params: {} }
                ],
                input: 0.5,
                output: null,
                membershipType: "trimf",
                params: { a: 0, b: 0.5, c: 1 }
              }
            ]);
          }}
        >
          Agregar variable
        </Button>
        {variables.length > 1 && (
          <Button
            variant="outlined"
            color="error"
            onClick={() => setVariables(variables.slice(0, -1))}
            sx={{ ml: 2 }}
          >
            Quitar variable
          </Button>
        )}
      </Box>
      {variables.map((variable, idx) => (
        <Paper
          sx={{
            p: 2,
            mb: 2,
            border: selectedVariableIdx === idx ? "2px solid #1976d2" : "1px solid #ccc",
            cursor: "pointer",
            position: "relative", // Necesario para posicionar la X
          }}
          key={idx}
          onClick={() => setSelectedVariableIdx(idx)}
        >
          {/* Botón X en la esquina superior izquierda */}
          <Button
            size="small"
            color="error"
            variant="contained"
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              minWidth: "32px",
              width: "32px",
              height: "32px",
              padding: 0,
              zIndex: 2,
              fontWeight: "bold",
              fontSize: "1.1rem",
              boxShadow: "none",
            }}
            onClick={e => {
              e.stopPropagation();
              if (variables.length > 1) {
                const newVars = variables.filter((_, i) => i !== idx);
                setVariables(newVars);
                if (selectedVariableIdx === idx) setSelectedVariableIdx(0);
                else if (selectedVariableIdx > idx) setSelectedVariableIdx(selectedVariableIdx - 1);
              } else {
                alert("Debe haber al menos una variable.");
              }
            }}
            title="Eliminar variable"
          >
            ✕
          </Button>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <input
                type="text"
                value={variable.name}
                onChange={e => {
                  const newVars = [...variables];
                  newVars[idx].name = e.target.value;
                  setVariables(newVars);
                }}
                style={{ width: "150px" }}
              />
              <Typography variant="caption" sx={{ ml: 1 }}>Nombre de la variable</Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <select
                value={variable.membershipType}
                onChange={e => {
                  const newVars = [...variables];
                  newVars[idx].membershipType = e.target.value;
                  // Reset params según tipo
                  switch (e.target.value) {
                    case "trimf":
                      newVars[idx].params = { a: 0, b: 0.5, c: 1 }; break;
                    case "trapmf":
                      newVars[idx].params = { a: 0, b: 0.3, c: 0.7, d: 1 }; break;
                    case "gaussmf":
                      newVars[idx].params = { mean: 0.5, sigma: 0.2 }; break;
                    case "gauss2mf":
                      newVars[idx].params = { mean1: 0.3, sigma1: 0.1, mean2: 0.7, sigma2: 0.1 }; break;
                    case "sigmf":
                      newVars[idx].params = { a: 10, c: 0.5 }; break;
                    case "dsigmf":
                    case "psigmf":
                      newVars[idx].params = { a1: 10, c1: 0.3, a2: 10, c2: 0.7 }; break;
                    case "gbellmf":
                      newVars[idx].params = { a: 0.2, b: 2, c: 0.5 }; break;
                    case "zmf":
                      newVars[idx].params = { a: 0.2, b: 0.8 }; break;
                    case "smf":
                      newVars[idx].params = { a: 0.2, b: 0.8 }; break;
                    case "pimf":
                      newVars[idx].params = { a: 0.1, b: 0.3, c: 0.7, d: 0.9 }; break;
                    default:
                      newVars[idx].params = {};
                  }
                  setVariables(newVars);
                }}
                style={{ width: "220px", height: "30px" }}
              >
                <option value="trimf">Triangular (trimf)</option>
                <option value="trapmf">Trapezoidal (trapmf)</option>
                <option value="gaussmf">Gaussiana simple (gaussmf)</option>
                <option value="gauss2mf">Gaussiana doble (gauss2mf)</option>
                <option value="sigmf">Sigmoidal simple (sigmf)</option>
                <option value="dsigmf">Producto de dos sigmoides (dsigmf)</option>
                <option value="psigmf">Diferencia de dos sigmoides (psigmf)</option>
                <option value="gbellmf">Campana generalizada (gbellmf)</option>
                <option value="zmf">Función Z (zmf)</option>
                <option value="smf">Función S (smf)</option>
                <option value="pimf">Función Pi (pimf)</option>
              </select>
            </Grid>
            <Grid item xs={12} sm={3}>
              {/* Renderiza los inputs de parámetros según el tipo, igual que ya tienes en tu código */}
              {variable.membershipType === "trimf" && (
                <>
                  <input type="number" value={variable.params.a} step="0.01" min="0" max="1"
                    onChange={e => {
                      const newVars = variables.map((v, i) =>
                        i === idx
                          ? { ...v, params: { ...v.params, a: parseFloat(e.target.value) } }
                          : v
                      );
                      setVariables(newVars);
                    }} style={{ width: "60px" }} />
                  <input type="number" value={variable.params.b} step="0.01" min="0" max="1"
                    onChange={e => {
                      const newVars = variables.map((v, i) =>
                        i === idx
                          ? { ...v, params: { ...v.params, b: parseFloat(e.target.value) } }
                          : v
                      );
                      setVariables(newVars);
                    }} style={{ width: "60px" }} />
                  <input type="number" value={variable.params.c} step="0.01" min="0" max="1"
                    onChange={e => {
                      const newVars = variables.map((v, i) =>
                        i === idx
                          ? { ...v, params: { ...v.params, c: parseFloat(e.target.value) } }
                          : v
                      );
                      setVariables(newVars);
                    }} style={{ width: "60px" }} />
                </>
              )}
              {variable.membershipType === "trapmf" && (
                <>
                  <input type="number" value={variable.params.a} step="0.01" min="0" max="1"
                    onChange={e => {
                      const newVars = variables.map((v, i) =>
                        i === idx
                          ? { ...v, params: { ...v.params, a: parseFloat(e.target.value) } }
                          : v
                      );
                      setVariables(newVars);
                    }} style={{ width: "60px" }} />
                  <input type="number" value={variable.params.b} step="0.01" min="0" max="1"
                    onChange={e => {
                      const newVars = variables.map((v, i) =>
                        i === idx
                          ? { ...v, params: { ...v.params, b: parseFloat(e.target.value) } }
                          : v
                      );
                      setVariables(newVars);
                    }} style={{ width: "60px" }} />
                  <input type="number" value={variable.params.c} step="0.01" min="0" max="1"
                    onChange={e => {
                      const newVars = variables.map((v, i) =>
                        i === idx
                          ? { ...v, params: { ...v.params, c: parseFloat(e.target.value) } }
                          : v
                      );
                      setVariables(newVars);
                    }} style={{ width: "60px" }} />
                  <input type="number" value={variable.params.d} step="0.01" min="0" max="1"
                    onChange={e => {
                      const newVars = variables.map((v, i) =>
                        i === idx
                          ? { ...v, params: { ...v.params, d: parseFloat(e.target.value) } }
                          : v
                      );
                      setVariables(newVars);
                    }} style={{ width: "60px" }} />
                </>
              )}
              {variable.membershipType === "gaussmf" && (
                <>
                  <input type="number" value={variable.params.mean} step="0.01" min="0" max="1"
                    onChange={e => {
                      const newVars = variables.map((v, i) =>
                        i === idx
                          ? { ...v, params: { ...v.params, mean: parseFloat(e.target.value) } }
                          : v
                      );
                      setVariables(newVars);
                    }} style={{ width: "60px" }} />
                  <input type="number" value={variable.params.sigma} step="0.01" min="0.01" max="1"
                    onChange={e => {
                     
                      const newVars = variables.map((v, i) =>
                        i === idx
                          ? { ...v, params: { ...v.params, sigma: parseFloat(e.target.value) } }
                          : v
                      );
                      setVariables(newVars);
                    }} style={{ width: "60px" }} />
                </>
              )}
              {variable.membershipType === "gauss2mf" && (
                <>
                  <input type="number" value={variable.params.mean1} step="0.01" min="0" max="1"
                    onChange={e => {
                      const newVars = variables.map((v, i) =>
                        i === idx
                          ? { ...v, params: { ...v.params, mean1: parseFloat(e.target.value) } }
                          : v
                      );
                      setVariables(newVars);
                    }} style={{ width: "60px" }} />
                  <input type="number" value={variable.params.sigma1} step="0.01" min="0.01" max="1"
                    onChange={e => {
                      const newVars = variables.map((v, i) =>
                        i === idx
                          ? { ...v, params: { ...v.params, sigma1: parseFloat(e.target.value) } }
                          : v
                      );
                      setVariables(newVars);
                    }} style={{ width: "60px" }} />
                  <input type="number" value={variable.params.mean2} step="0.01" min="0" max="1"
                    onChange={e => {
                      const newVars = variables.map((v, i) =>
                        i === idx
                          ? { ...v, params: { ...v.params, mean2: parseFloat(e.target.value) } }
                          : v
                      );
                      setVariables(newVars);
                    }} style={{ width: "60px" }} />
                  <input type="number" value={variable.params.sigma2} step="0.01" min="0.01" max="1"
                    onChange={e => {
                      const newVars = variables.map((v, i) =>
                        i === idx
                          ? { ...v, params: { ...v.params, sigma2: parseFloat(e.target.value) } }
                          : v
                      );
                      setVariables(newVars);
                    }} style={{ width: "60px" }} />
                </>
              )}
              {variable.membershipType === "sigmf" && (
                <>
                  <Grid item xs={12} sm={2}>
                    <input type="number" name="a" step="0.01" min="-10" max="10"
                      value={formik.values.a ?? 1} onChange={formik.handleChange} style={{ width: "60px" }} />
                    <Typography variant="caption">a</Typography>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <input type="number" name="c" step="0.01" min="0" max="1"
                      value={formik.values.c ?? 0.5} onChange={formik.handleChange} style={{ width: "60px" }} />
                    <Typography variant="caption">c</Typography>
                  </Grid>
                </>
              )}
              {variable.membershipType === "dsigmf" && (
                <>
                  <Grid item xs={12} sm={2}>
                    <input type="number" name="a1" step="0.01" min="-10" max="10"
                      value={formik.values.a1 ?? 1} onChange={formik.handleChange} style={{ width: "60px" }} />
                    <Typography variant="caption">a1</Typography>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <input type="number" name="c1" step="0.01" min="0" max="1"
                      value={formik.values.c1 ?? 0.3} onChange={formik.handleChange} style={{ width: "60px" }} />
                    <Typography variant="caption">c1</Typography>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <input type="number" name="a2" step="0.01" min="-10" max="10"
                      value={formik.values.a2 ?? 1} onChange={formik.handleChange} style={{ width: "60px" }} />
                    <Typography variant="caption">a2</Typography>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <input type="number" name="c2" step="0.01" min="0" max="1"
                      value={formik.values.c2 ?? 0.7} onChange={formik.handleChange} style={{ width: "60px" }} />
                    <Typography variant="caption">c2</Typography>
                  </Grid>
                </>
              )}
              {variable.membershipType === "psigmf" && (
                <>
                  <Grid item xs={12} sm={2}>
                    <input type="number" name="a1" step="0.01" min="-10" max="10"
                      value={formik.values.a1 ?? 1} onChange={formik.handleChange} style={{ width: "60px" }} />
                    <Typography variant="caption">a1</Typography>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <input type="number" name="c1" step="0.01" min="0" max="1"
                      value={formik.values.c1 ?? 0.3} onChange={formik.handleChange} style={{ width: "60px" }} />
                    <Typography variant="caption">c1</Typography>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <input type="number" name="a2" step="0.01" min="-10" max="10"
                      value={formik.values.a2 ?? 1} onChange={formik.handleChange} style={{ width: "60px" }} />
                    <Typography variant="caption">a2</Typography>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <input type="number" name="c2" step="0.01" min="0" max="1"
                      value={formik.values.c2 ?? 0.7} onChange={formik.handleChange} style={{ width: "60px" }} />
                    <Typography variant="caption">c2</Typography>
                  </Grid>
                </>
              )}
              {variable.membershipType === "gbellmf" && (
                <>
                  <Grid item xs={12} sm={2}>
                    <input type="number" name="a" step="0.01" min="0.01" max="1"
                      value={formik.values.a ?? 0.2} onChange={formik.handleChange} style={{ width: "60px" }} />
                    <Typography variant="caption">a</Typography>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <input type="number" name="b" step="0.01" min="0.01" max="10"
                      value={formik.values.b ?? 2} onChange={formik.handleChange} style={{ width: "60px" }} />
                    <Typography variant="caption">b</Typography>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <input type="number" name="c" step="0.01" min="0" max="1"
                      value={formik.values.c ?? 0.5} onChange={formik.handleChange} style={{ width: "60px" }} />
                    <Typography variant="caption">c</Typography>
                  </Grid>
                </>
              )}
              {variable.membershipType === "zmf" && (
                <>
                  <Grid item xs={12} sm={2}>
                    <input type="number" name="a" step="0.01" min="0" max="1"
                      value={formik.values.a ?? 0.2} onChange={formik.handleChange} style={{ width: "60px" }} />
                    <Typography variant="caption">a</Typography>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <input type="number" name="b" step="0.01" min="0" max="1"
                      value={formik.values.b ?? 0.8} onChange={formik.handleChange} style={{ width: "60px" }} />
                    <Typography variant="caption">b</Typography>
                  </Grid>
                </>
              )}
              {variable.membershipType === "smf" && (
                <>
                  <Grid item xs={12} sm={2}>
                    <input type="number" name="a" step="0.01" min="0" max="1"
                      value={formik.values.a ?? 0.2} onChange={formik.handleChange} style={{ width: "60px" }} />
                    <Typography variant="caption">a</Typography>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <input type="number" name="b" step="0.01" min="0" max="1"
                      value={formik.values.b ?? 0.8} onChange={formik.handleChange} style={{ width: "60px" }} />
                    <Typography variant="caption">b</Typography>
                  </Grid>
                </>
              )}
              {variable.membershipType === "pimf" && (
                <>
                  <Grid item xs={12} sm={2}>
                    <input type="number" name="a" step="0.01" min="0" max="1"
                      value={formik.values.a ?? 0.1} onChange={formik.handleChange} style={{ width: "60px" }} />
                    <Typography variant="caption">a</Typography>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <input type="number" name="b" step="0.01" min="0" max="1"
                      value={formik.values.b ?? 0.3} onChange={formik.handleChange} style={{ width: "60px" }} />
                    <Typography variant="caption">b</Typography>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <input type="number" name="c" step="0.01" min="0" max="1"
                      value={formik.values.c ?? 0.7} onChange={formik.handleChange} style={{ width: "60px" }} />
                    <Typography variant="caption">c</Typography>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <input type="number" name="d" step="0.01" min="0" max="1"
                      value={formik.values.d ?? 0.9} onChange={formik.handleChange} style={{ width: "60px" }} />
                    <Typography variant="caption">d</Typography>
                  </Grid>
                </>
              )}
            </Grid>
            <Grid item xs={12} sm={2}>
              <input
                type="number"
                value={variable.input}
                step="0.01"
                min="0"
                max="1"
                onChange={e => {
                  const newVars = variables.map((v, i) =>
                    i === idx
                      ? { ...v, input: parseFloat(e.target.value) }
                      : v
                  );
                  setVariables(newVars);
                }}
                style={{ width: "60px" }}
              />
              <Typography variant="caption">Entrada</Typography>
            </Grid>
            <Grid item xs={12} sm={2}>
              <select
                value={variable.type}
                onChange={e => {
                  const newVars = [...variables];
                  newVars[idx].type = e.target.value;
                  setVariables(newVars);
                }}
                style={{ width: "100px", height: "30px" }}
              >
                <option value="input">Entrada</option>
                <option value="output">Salida</option>
              </select>
              <Typography variant="caption" sx={{ ml: 1 }}>Tipo</Typography>
            </Grid>
            <Grid item xs={12} sm={1}>
              <Button
                variant="contained"
                onClick={() => {
                  // Calcula el resultado para esta variable
                  const newVars = [...variables];
                  const v = variable;
                                                                                                                                                                                                                                                                         let result = 0;
                  switch (v.membershipType) {
                    case "trimf":
                      result = trimf(v.input, v.params.a, v.params.b, v.params.c); break;
                    case "trapmf":
                      result = trapmf(v.input, v.params.a, v.params.b, v.params.c, v.params.d); break;
                    case "gaussmf":
                      result = gaussmf(v.input, v.params.mean, v.params.sigma); break;
                    case "gauss2mf":
                      result = gauss2mf(v.input, v.params.mean1, v.params.sigma1, v.params.mean2, v.params.sigma2); break;
                    case "sigmf":
                      result = sigmf(v.input, v.params.a, v.params.c); break;
                    case "dsigmf":
                      result = dsigmf(v.input, v.params.a1, v.params.c1, v.params.a2, v.params.c2); break;
                    case "psigmf":
                      result = psigmf(v.input, v.params.a1, v.params.c1, v.params.a2, v.params.c2); break;
                    case "gbellmf":
                      result = gbellmf(v.input, v.params.a, v.params.b, v.params.c); break;
                    case "zmf":
                      result = zmf(v.input, v.params.a, v.params.b); break;
                    case "smf":
                      result = smf(v.input, v.params.a, v.params.b); break;
                    case "pimf":
                      result = pimf(v.input, v.params.a, v.params.b, v.params.c, v.params.d); break;
                    default:
                      result = 0;
                  }
                  newVars[idx].output = result.toFixed(3);
                  setVariables(newVars);
                }}
              >
                Calcular
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Typography>
                Grado de membresía: <b>{variable.output !== null ? variable.output : "-"}</b>
              </Typography>
            </Grid>
            <Grid item xs={12}>
              {/* Gráfica para esta variable */}
              <Line
                data={{
                  labels: Array.from({ length: 101 }, (_, i) => i / 100),
                  datasets: [
                    {
                      label: `Función de membresía (${variable.membershipType})`,
                      data: Array.from({ length: 101 }, (_, i) => {
                        const x = i / 100;
                        switch (variable.membershipType) {
                          case "trimf":
                            return trimf(x, variable.params.a, variable.params.b, variable.params.c);
                          case "trapmf":
                            return trapmf(x, variable.params.a, variable.params.b, variable.params.c, variable.params.d);
                          case "gaussmf":
                            return gaussmf(x, variable.params.mean, variable.params.sigma);
                          case "gauss2mf":
                            return gauss2mf(x, variable.params.mean1, variable.params.sigma1, variable.params.mean2, variable.params.sigma2);
                          case "sigmf":
                            return sigmf(x, variable.params.a, variable.params.c);
                          case "dsigmf":
                            return dsigmf(x, variable.params.a1, variable.params.c1, variable.params.a2, variable.params.c2);
                          case "psigmf":
                            return psigmf(x, variable.params.a1, variable.params.c1, variable.params.a2, variable.params.c2);
                          case "gbellmf":
                            return gbellmf(x, variable.params.a, variable.params.b, variable.params.c);
                          case "zmf":
                            return zmf(x, variable.params.a, variable.params.b);
                          case "smf":
                            return smf(x, variable.params.a, variable.params.b);
                          case "pimf":
                            return pimf(x, variable.params.a, variable.params.b, variable.params.c, variable.params.d);
                          default:
                            return 0;
                        }
                      }),
                      fill: false,
                      borderColor: "#1976d2",
                      tension: 0.1,
                    },
                  ],
                }}
              />
            </Grid>
            <Grid item xs={12}>
              {variable.sets.map((set, setIdx) => (
                <div key={setIdx} style={{ marginBottom: "10px", display: "flex", alignItems: "center" }}>
                  <div style={{ flex: 1 }}>
                    <Typography variant="body2">
                      {/* Nuevo input para editar el nombre del conjunto */}
                      <input
                        type="text"
                        value={set.name}
                        onChange={e => {
                          const newVars = [...variables];
                          newVars[idx].sets[setIdx].name = e.target.value;
                          setVariables(newVars);
                        }}
                        style={{ width: "120px", marginRight: "10px" }}
                        placeholder="Nombre del conjunto"
                      />
                      ({set.membershipType || "Sin función seleccionada"})
                    </Typography>
                    <select
                      value={set.membershipType}
                      onChange={(e) => {
                        const newVars = [...variables];
                        newVars[idx].sets[setIdx].membershipType = e.target.value;
                        // Reset params según el tipo de función
                        switch (e.target.value) {
                          case "trimf":
                            newVars[idx].sets[setIdx].params = { a: 0, b: 0.5, c: 1 };
                            break;
                          case "trapmf":
                            newVars[idx].sets[setIdx].params = { a: 0, b: 0.3, c: 0.7, d: 1 };
                            break;
                          case "gaussmf":
                            newVars[idx].sets[setIdx].params = { mean: 0.5, sigma: 0.2 };
                            break;
                          case "gauss2mf":
                            newVars[idx].sets[setIdx].params = { mean1: 0.3, sigma1: 0.1, mean2: 0.7, sigma2: 0.1 };
                            break;
                          case "sigmf":
                            newVars[idx].sets[setIdx].params = { a: 10, c: 0.5 };
                            break;
                          case "dsigmf":
                            newVars[idx].sets[setIdx].params = { a1: 10, c1: 0.3, a2: 10, c2: 0.7 };
                            break;
                          case "psigmf":
                            newVars[idx].sets[setIdx].params = { a1: 10, c1: 0.3, a2: 10, c2: 0.7 };
                            break;
                          case "gbellmf":
                            newVars[idx].sets[setIdx].params = { a: 0.2, b: 2, c: 0.5 };
                            break;
                          case "zmf":
                            newVars[idx].sets[setIdx].params = { a: 0.2, b: 0.8 };
                            break;
                          case "smf":
                            newVars[idx].sets[setIdx].params = { a: 0.2, b: 0.8 };
                            break;
                          case "pimf":
                            newVars[idx].sets[setIdx].params = { a: 0.1, b: 0.3, c: 0.7, d: 0.9 };
                            break;
                          default:
                            newVars[idx].sets[setIdx].params = {};
                        }
                        setVariables(newVars);
                      }}
                      style={{ marginRight: "10px", width: "150px" }}
                    >
                      <option value="">Seleccionar función...</option>
                      <option value="trimf">Triangular (trimf)</option>
                      <option value="trapmf">Trapezoidal (trapmf)</option>
                      <option value="gaussmf">Gaussiana simple (gaussmf)</option>
                      <option value="gauss2mf">Gaussiana doble (gauss2mf)</option>
                      <option value="sigmf">Sigmoidal simple (sigmf)</option>
                      <option value="dsigmf">Producto de dos sigmoides (dsigmf)</option>
                      <option value="psigmf">Diferencia de dos sigmoides (psigmf)</option>
                      <option value="gbellmf">Campana generalizada (gbellmf)</option>
                      <option value="zmf">Función Z (zmf)</option>
                      <option value="smf">Función S (smf)</option>
                      <option value="pimf">Función Pi (pimf)</option>
                    </select>
                    {/* Inputs de parámetros dinámicos */}
                    {set.membershipType === "trimf" && (
                      <>
                        <input
                          type="number"
                          value={set.params.a ?? ""}
                          onChange={e => {
                            const newVars = [...variables];
                            newVars[idx].sets[setIdx].params.a = parseFloat(e.target.value);
                            setVariables(newVars);
                          }}
                          style={{ width: "60px", marginRight: "5px" }}
                          placeholder="a"
                        />
                        <input
                          type="number"
                          value={set.params.b ?? ""}
                          onChange={e => {
                            const newVars = [...variables];
                            newVars[idx].sets[setIdx].params.b = parseFloat(e.target.value);
                            setVariables(newVars);
                          }}
                          style={{ width: "60px", marginRight: "5px" }}
                          placeholder="b"
                        />
                        <input
                          type="number"
                          value={set.params.c ?? ""}
                          onChange={e => {
                            const newVars = [...variables];
                            newVars[idx].sets[setIdx].params.c = parseFloat(e.target.value);
                            setVariables(newVars);
                          }}
                          style={{ width: "60px" }}
                          placeholder="c"
                        />
                      </>
                    )}
                    {set.membershipType === "trapmf" && (
                      <>
                        <input
                          type="number"
                          value={set.params.a ?? ""}
                          onChange={e => {
                            const newVars = [...variables];
                            newVars[idx].sets[setIdx].params.a = parseFloat(e.target.value);
                            setVariables(newVars);
                          }}
                          style={{ width: "60px", marginRight: "5px" }}
                          placeholder="a"
                        />
                        <input
                          type="number"
                          value={set.params.b ?? ""}
                          onChange={e => {
                            const newVars = [...variables];
                            newVars[idx].sets[setIdx].params.b = parseFloat(e.target.value);
                            setVariables(newVars);
                          }}
                          style={{ width: "60px", marginRight: "5px" }}
                          placeholder="b"
                        />
                        <input
                          type="number"
                          value={set.params.c ?? ""}
                          onChange={e => {
                            const newVars = [...variables];
                            newVars[idx].sets[setIdx].params.c = parseFloat(e.target.value);
                            setVariables(newVars);
                          }}
                          style={{ width: "60px", marginRight: "5px" }}
                          placeholder="c"
                        />
                        <input
                          type="number"
                          value={set.params.d ?? ""}
                          onChange={e => {
                            const newVars = [...variables];
                            newVars[idx].sets[setIdx].params.d = parseFloat(e.target.value);
                            setVariables(newVars);
                          }}
                          style={{ width: "60px" }}
                          placeholder="d"
                        />
                      </>
                    )}
                    {set.membershipType === "gaussmf" && (
                      <>
                        <input
                          type="number"
                          value={set.params.mean ?? ""}
                          onChange={e => {
                            const newVars = [...variables];
                            newVars[idx].sets[setIdx].params.mean = parseFloat(e.target.value);
                            setVariables(newVars);
                          }}
                          style={{ width: "60px", marginRight: "5px" }}
                          placeholder="mean"
                        />
                        <input
                          type="number"
                          value={set.params.sigma ?? ""}
                          onChange={e => {
                            const newVars = [...variables];
                            newVars[idx].sets[setIdx].params.sigma = parseFloat(e.target.value);
                            setVariables(newVars);
                          }}
                          style={{ width: "60px" }}
                          placeholder="sigma"
                        />
                      </>
                    )}
                    {set.membershipType === "gauss2mf" && (
                      <>
                        <input
                          type="number"
                          value={set.params.mean1 ?? ""}
                          onChange={e => {
                            const newVars = [...variables];
                            newVars[idx].sets[setIdx].params.mean1 = parseFloat(e.target.value);
                            setVariables(newVars);
                          }}
                          style={{ width: "60px", marginRight: "5px" }}
                          placeholder="mean1"
                        />
                        <input
                          type="number"
                          value={set.params.sigma1 ?? ""}
                          onChange={e => {
                            const newVars = [...variables];
                            newVars[idx].sets[setIdx].params.sigma1 = parseFloat(e.target.value);
                            setVariables(newVars);
                          }}
                          style={{ width: "60px", marginRight: "5px" }}
                          placeholder="sigma1"
                        />
                        <input
                          type="number"
                          value={set.params.mean2 ?? ""}
                          onChange={e => {
                            const newVars = [...variables];
                            newVars[idx].sets[setIdx].params.mean2 = parseFloat(e.target.value);
                            setVariables(newVars);
                          }}
                          style={{ width: "60px", marginRight: "5px" }}
                          placeholder="mean2"
                        />
                        <input
                          type="number"
                          value={set.params.sigma2 ?? ""}
                          onChange={e => {
                            const newVars = [...variables];
                            newVars[idx].sets[setIdx].params.sigma2 = parseFloat(e.target.value);
                            setVariables(newVars);
                          }}
                          style={{ width: "60px" }}
                          placeholder="sigma2"
                        />
                      </>
                    )}
                    {set.membershipType === "sigmf" && (
                      <>
                        <input
                          type="number"
                          value={set.params.a ?? ""}
                          onChange={e => {
                            const newVars = [...variables];
                            newVars[idx].sets[setIdx].params.a = parseFloat(e.target.value);
                            setVariables(newVars);
                          }}
                          style={{ width: "60px", marginRight: "5px" }}
                          placeholder="a"
                        />
                        <input
                          type="number"
                          value={set.params.c ?? ""}
                          onChange={e => {
                            const newVars = [...variables];
                            newVars[idx].sets[setIdx].params.c = parseFloat(e.target.value);
                            setVariables(newVars);
                          }}
                          style={{ width: "60px" }}
                          placeholder="c"
                        />
                      </>
                    )}
                    {set.membershipType === "dsigmf" && (
                      <>
                        <input
                          type="number"
                          value={set.params.a1 ?? ""}
                          onChange={e => {
                            const newVars = [...variables];
                            newVars[idx].sets[setIdx].params.a1 = parseFloat(e.target.value);
                            setVariables(newVars);
                          }}
                          style={{ width: "60px", marginRight: "5px" }}
                          placeholder="a1"
                        />
                        <input
                          type="number"
                          value={set.params.c1 ?? ""}
                          onChange={e => {
                            const newVars = [...variables];
                            newVars[idx].sets[setIdx].params.c1 = parseFloat(e.target.value);
                            setVariables(newVars);
                          }}
                          style={{ width: "60px", marginRight: "5px" }}
                          placeholder="c1"
                        />
                        <input
                          type="number"
                          value={set.params.a2 ?? ""}
                          onChange={e => {
                            const newVars = [...variables];
                            newVars[idx].sets[setIdx].params.a2 = parseFloat(e.target.value);
                            setVariables(newVars);
                          }}
                          style={{ width: "60px", marginRight: "5px" }}
                          placeholder="a2"
                        />
                        <input
                          type="number"
                          value={set.params.c2 ?? ""}
                          onChange={e => {
                            const newVars = [...variables];
                            newVars[idx].sets[setIdx].params.c2 = parseFloat(e.target.value);
                            setVariables(newVars);
                          }}
                          style={{ width: "60px" }}
                          placeholder="c2"
                        />
                      </>
                    )}
                    {set.membershipType === "psigmf" && (
                      <>
                        <input
                          type="number"
                          value={set.params.a1 ?? ""}
                          onChange={e => {
                            const newVars = [...variables];
                            newVars[idx].sets[setIdx].params.a1 = parseFloat(e.target.value);
                            setVariables(newVars);
                          }}
                          style={{ width: "60px", marginRight: "5px" }}
                          placeholder="a1"
                        />
                        <input
                          type="number"
                          value={set.params.c1 ?? ""}
                          onChange={e => {
                            const newVars = [...variables];
                            newVars[idx].sets[setIdx].params.c1 = parseFloat(e.target.value);
                            setVariables(newVars);
                          }}
                          style={{ width: "60px", marginRight: "5px" }}
                          placeholder="c1"
                        />
                        <input
                          type="number"
                          value={set.params.a2 ?? ""}
                          onChange={e => {
                            const newVars = [...variables];
                            newVars[idx].sets[setIdx].params.a2 = parseFloat(e.target.value);
                            setVariables(newVars);
                          }}
                          style={{ width: "60px", marginRight: "5px" }}
                          placeholder="a2"
                        />
                        <input
                          type="number"
                          value={set.params.c2 ?? ""}
                          onChange={e => {
                            const newVars = [...variables];
                            newVars[idx].sets[setIdx].params.c2 = parseFloat(e.target.value);
                            setVariables(newVars);
                          }}
                          style={{ width: "60px" }}
                          placeholder="c2"
                        />
                      </>
                    )}
                    {set.membershipType === "gbellmf" && (
                      <>
                        <input
                          type="number"
                          value={set.params.a ?? ""}
                          onChange={e => {
                            const newVars = [...variables];
                            newVars[idx].sets[setIdx].params.a = parseFloat(e.target.value);
                            setVariables(newVars);
                          }}
                          style={{ width: "60px", marginRight: "5px" }}
                          placeholder="a"
                        />
                        <input
                          type="number"
                          value={set.params.b ?? ""}
                          onChange={e => {
                            const newVars = [...variables];
                            newVars[idx].sets[setIdx].params.b = parseFloat(e.target.value);
                            setVariables(newVars);
                          }}
                          style={{ width: "60px", marginRight: "5px" }}
                          placeholder="b"
                        />
                        <input
                          type="number"
                          value={set.params.c ?? ""}
                          onChange={e => {
                            const newVars = [...variables];
                            newVars[idx].sets[setIdx].params.c = parseFloat(e.target.value);
                            setVariables(newVars);
                          }}
                          style={{ width: "60px" }}
                          placeholder="c"
                        />
                      </>
                    )}
                    {set.membershipType === "zmf" && (
                      <>
                        <input
                          type="number"
                          value={set.params.a ?? ""}
                          onChange={e => {
                            const newVars = [...variables];
                            newVars[idx].sets[setIdx].params.a = parseFloat(e.target.value);
                            setVariables(newVars);
                          }}
                          style={{ width: "60px", marginRight: "5px" }}
                          placeholder="a"
                        />
                        <input
                          type="number"
                          value={set.params.b ?? ""}
                          onChange={e => {
                            const newVars = [...variables];
                            newVars[idx].sets[setIdx].params.b = parseFloat(e.target.value);
                            setVariables(newVars);
                          }}
                          style={{ width: "60px" }}
                          placeholder="b"
                        />
                      </>
                    )}
                    {set.membershipType === "smf" && (
                      <>
                        <input
                          type="number"
                          value={set.params.a ?? ""}
                          onChange={e => {
                            const newVars = [...variables];
                            newVars[idx].sets[setIdx].params.a = parseFloat(e.target.value);
                            setVariables(newVars);
                          }}
                          style={{ width: "60px", marginRight: "5px" }}
                          placeholder="a"
                        />
                        <input
                          type="number"
                          value={set.params.b ?? ""}
                          onChange={e => {
                            const newVars = [...variables];
                            newVars[idx].sets[setIdx].params.b = parseFloat(e.target.value);
                            setVariables(newVars);
                          }}
                          style={{ width: "60px" }}
                          placeholder="b"
                        />
                      </>
                    )}
                    {set.membershipType === "pimf" && (
                      <>
                        <input
                          type="number"
                          value={set.params.a ?? ""}
                          onChange={e => {
                            const newVars = [...variables];
                            newVars[idx].sets[setIdx].params.a = parseFloat(e.target.value);
                            setVariables(newVars);
                          }}
                          style={{ width: "60px", marginRight: "5px" }}
                          placeholder="a"
                        />
                        <input
                          type="number"
                          value={set.params.b ?? ""}
                          onChange={e => {
                            const newVars = [...variables];
                            newVars[idx].sets[setIdx].params.b = parseFloat(e.target.value);
                            setVariables(newVars);
                          }}
                          style={{ width: "60px", marginRight: "5px" }}
                          placeholder="b"
                        />
                        <input
                          type="number"
                          value={set.params.c ?? ""}
                          onChange={e => {
                            const newVars = [...variables];
                            newVars[idx].sets[setIdx].params.c = parseFloat(e.target.value);
                            setVariables(newVars);
                          }}
                          style={{ width: "60px", marginRight: "5px" }}
                          placeholder="c"
                        />
                        <input
                          type="number"
                          value={set.params.d ?? ""}
                          onChange={e => {
                            const newVars = [...variables];
                            newVars[idx].sets[setIdx].params.d = parseFloat(e.target.value);
                            setVariables(newVars);
                          }}
                          style={{ width: "60px" }}
                          placeholder="d"
                        />
                      </>
                    )}
                    {(() => {
                      const errores = validarParametros(set.membershipType, set.params);
                      return (
                        <div style={{ minHeight: 18 }}>
                          {Object.entries(errores).map(([key, msg]) => (
                            <span key={key} style={{ color: "red", fontSize: 12, marginRight: 10 }}>{msg}</span>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                  <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    sx={{ ml: 2, minWidth: 32, width: 32, height: 32, fontWeight: "bold" }}
                    title="Eliminar conjunto"
                    onClick={() => {
                      const newVars = [...variables];
                      newVars[idx].sets = newVars[idx].sets.filter((_, i) => i !== setIdx);
                      setVariables(newVars);
                    }}
                    disabled={variable.sets.length <= 1}
                  >
                    ✕
                  </Button>
                </div>
              ))}
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  const newVars = [...variables];
                  newVars[idx].sets.push({
                    name: `Conjunto ${variable.sets.length + 1}`,
                    membershipType: "",
                    params: {},
                  });
                  setVariables(newVars);
                }}
              >
                Agregar conjunto
              </Button>
            </Grid>
          </Grid>
        </Paper>
      ))}
      {variables
  .filter(v => v.type === "output")
  .map((outputVar, idx) => {
    const { xValues, activacion, centroide } = inferirYDesfuzzificar(rules, variables, outputVar);
    return (
      <Paper key={idx} sx={{ p: 3, mb: 4, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Desfuzzificación — Variable de salida: <b>{outputVar.name}</b>
        </Typography>
        <Line
          data={{
            labels: xValues,
            datasets: [
              {
                label: "Función de membresía original",
                data: xValues.map(x => {
                  switch (outputVar.membershipType) {
                    case "trimf":
                      return trimf(x, outputVar.params.a, outputVar.params.b, outputVar.params.c);
                    case "trapmf":
                      return trapmf(x, outputVar.params.a, outputVar.params.b, outputVar.params.c, outputVar.params.d);
                    case "gaussmf":
                      return gaussmf(x, outputVar.params.mean, outputVar.params.sigma);
                    case "gauss2mf":
                      return gauss2mf(x, outputVar.params.mean1, outputVar.params.sigma1, outputVar.params.mean2, outputVar.params.sigma2);
                    case "sigmf":
                      return sigmf(x, outputVar.params.a, outputVar.params.c);
                    case "dsigmf":
                      return dsigmf(x, outputVar.params.a1, outputVar.params.c1, outputVar.params.a2, outputVar.params.c2);
                    case "psigmf":
                      return psigmf(x, outputVar.params.a1, outputVar.params.c1, outputVar.params.a2, outputVar.params.c2);
                    case "gbellmf":
                      return gbellmf(x, outputVar.params.a, outputVar.params.b, outputVar.params.c);
                    case "zmf":
                      return zmf(x, outputVar.params.a, outputVar.params.b);
                    case "smf":
                      return smf(x, outputVar.params.a, outputVar.params.b);
                    case "pimf":
                      return pimf(x, outputVar.params.a, outputVar.params.b, outputVar.params.c, outputVar.params.d);
                    default:
                      return 0;
                  }
                }),
                borderColor: "#888",
                borderDash: [6, 4],
                borderWidth: 2,
                fill: false,
                pointRadius: 0,
                tension: 0.1,
                order: 0,
              },
              {
                label: "Función de salida recortada (por reglas)",
                data: activacion,
                borderColor: "#1976d2",
                backgroundColor: "rgba(25, 118, 210, 0.2)",
                fill: true,
                pointRadius: 0,
                tension: 0.1,
                order: 1,
              },
              {
                label: "Centroide (salida desfuzzificada)",
                data: xValues.map(x => (Math.abs(x - centroide) < 0.005 ? 1.05 : null)),
                borderColor: "#d32f2f",
                backgroundColor: "#d32f2f",
                pointBorderColor: "#d32f2f",
                pointBackgroundColor: "#d32f2f",
                pointRadius: 7,
                type: "scatter",
                showLine: false,
                order: 2,
              },
            ],
          }}
          options={{
            plugins: {
              legend: { display: true, position: "top" },
              title: {
                display: true,
                text: `Desfuzzificación de "${outputVar.name}"`,
                font: { size: 16 }
              },
              tooltip: tooltipAvanzado
            },
            scales: {
              x: { title: { display: true, text: "Dominio (x)" } },
              y: { title: { display: true, text: "Grado de membresía" }, min: 0, max: 1.1 }
            }
          }}
        />
        <Typography sx={{ mt: 2 }}>
          <b>Centroide:</b> {centroide.toFixed(4)}
        </Typography>
      </Paper>
    );
  })}
    </Box>
  );
};

export default FuzzyLogic;

// --- VALIDACIÓN AVANZADA DE PARÁMETROS DE CONJUNTOS ---
function validarParametros(tipo, params) {
  let errores = {};
  switch (tipo) {
    case "trimf":
      if (
        params.a !== undefined &&
        params.b !== undefined &&
        params.c !== undefined &&
        !(params.a < params.b && params.b < params.c)
      ) {
        errores.b = "Debe cumplirse: a < b < c";
        errores.c = "Debe cumplirse: a < b < c";
      }
      break;
    case "trapmf":
      if (
        params.a !== undefined &&
        params.b !== undefined &&
        params.c !== undefined &&
        params.d !== undefined &&
        !(params.a < params.b && params.b < params.c && params.c < params.d)
      ) {
        errores.b = "Debe cumplirse: a < b < c < d";
        errores.c = "Debe cumplirse: a < b < c < d";
        errores.d = "Debe cumplirse: a < b < c < d";
      }
      break;
    case "gaussmf":
      if (params.sigma !== undefined && params.sigma <= 0) {
        errores.sigma = "Sigma debe ser > 0";
      }
      break;
    case "gauss2mf":
      if (params.sigma1 !== undefined && params.sigma1 <= 0) {
        errores.sigma1 = "Sigma1 debe ser > 0";
      }
      if (params.sigma2 !== undefined && params.sigma2 <= 0) {
        errores.sigma2 = "Sigma2 debe ser > 0";
      }
      break;
    case "gbellmf":
      if (params.a !== undefined && params.a <= 0) {
        errores.a = "a debe ser > 0";
      }
      if (params.b !== undefined && params.b <= 0) {
        errores.b = "b debe ser > 0";
      }
      break;
    case "zmf":
    case "smf":
      if (
        params.a !== undefined &&
        params.b !== undefined &&
        !(params.a < params.b)
      ) {
        errores.b = "Debe cumplirse: a < b";
      }
      break;
    case "pimf":
      if (
        params.a !== undefined &&
        params.b !== undefined &&
        params.c !== undefined &&
        params.d !== undefined &&
        !(params.a < params.b && params.b < params.c && params.c < params.d)
      ) {
        errores.b = "Debe cumplirse: a < b < c < d";
        errores.c = "Debe cumplirse: a < b < c < d";
        errores.d = "Debe cumplirse: a < b < c < d";
      }
      break;
    default:
      break;
  }
  return errores;
}

// Tooltip avanzado para todas las gráficas
const tooltipAvanzado = {
  enabled: true,
  callbacks: {
    label: function(context) {
      const x = context.parsed.x !== undefined ? context.parsed.x : context.dataIndex / 100;
      const y = context.parsed.y;
      return `x: ${x !== undefined ? x.toFixed(3) : "-"}, μ: ${y !== null && y !== undefined ? y.toFixed(3) : "-"}`;
    }
  }
};
