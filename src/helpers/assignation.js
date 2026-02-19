import { Munkres } from "munkres-js";

/*
  Función para asignar las tareas
  @param {Array} matrix - Matriz de costos
  @returns {Object} - Objeto con la matriz de asignación y el costo total
*/

function assign(matrix) {
  // Copiamos la matriz original para no modificarla
  const matrixCopy = matrix.map((row) => row.slice());

  // Convertimos la matriz de costos a una matriz de ganancias o pérdidas
  const max = Math.max(...matrixCopy.flat()) + 1;
  for (let i = 0; i < matrixCopy.length; i++) {
    for (let j = 0; j < matrixCopy[i].length; j++) {
      matrixCopy[i][j] = matrixCopy[i][j] - max;
    }
  }

  // Creamos la instancia del algoritmo munkres
  const munkres = new Munkres();

  // Ejecutamos el algoritmo munkres sobre la matriz de ganancias o pérdidas
  const indexes = munkres.compute(matrixCopy);

  // Obtenemos el costo total de la asignación
  let totalCost = 0;
  for (let i = 0; i < indexes.length; i++) {
    const row = indexes[i][0];
    const col = indexes[i][1];
    totalCost += matrixCopy[row][col] + max;
  }

  return totalCost;
}

export default assign;
