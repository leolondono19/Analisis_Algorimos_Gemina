import munkres from "munkres-js";

function assignWithMunkres(matrix, minimize = true) {
  // Copiamos la matriz original para no modificarla
  const matrixCopy = matrix.map((row) => row.slice());

  // Convertimos la matriz de costos a una matriz de ganancias o viceversa dependiendo de si se debe maximizar o minimizar
  const coef = minimize ? 1 : -1;
  const matrixTransformed = matrixCopy.map((row) => row.map((val) => coef * val));

  // Obtenemos la matriz de asignación
  const assignments = munkres(matrixTransformed);

  // Creamos la matriz de asignaciones
  const n = matrixTransformed.length;
  const assignedMatrix = new Array(n).fill(0).map(() => new Array(n).fill(0));

  // Iteramos sobre las asignaciones para obtener la matriz asignada y las posiciones de los elementos
  const positions = new Array(n).fill(0).map(() => new Array(n).fill(0));
  for (let i = 0; i < assignments.length; i++) {
    const [row, col] = assignments[i];
    assignedMatrix[row][col] = 1;
    positions[row][col] = 1;
  }

  // Creamos la matriz de posiciones de los elementos
  const originalPositions = new Array(n).fill(0).map(() => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (positions[i][j] === 1) {
        originalPositions[i][j] = 1;
      } else {
        originalPositions[i][j] = 0;
      }
    }
  }

  return originalPositions;
}

export default assignWithMunkres;
