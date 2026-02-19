import { Munkres } from "munkres-js";

/*
  Función para asignar las tareas
  @param {Array} matrix - Matriz de costos
*/

function assignMax(matrix) {
  // Copiamos la matriz original para no modificarla
  const matrixCopy = matrix.map((row) => row.slice());

  // Convertimos la matriz de costos a una matriz de ganancias o pérdidas
  const max = Math.max(...matrixCopy.flat());

  for (let i = 0; i < matrixCopy.length; i++) {
    for (let j = 0; j < matrixCopy[i].length; j++) {
      matrixCopy[i][j] = -1 * matrixCopy[i][j] + max;
    }
  }
  // console.log(max);
  // console.log(matrixCopy);
  // Creamos la instancia del algoritmo munkres
  const munkres = new Munkres();

  // Ejecutamos el algoritmo munkres sobre la matriz de ganancias o pérdidas
  const indexes = munkres.compute(matrixCopy);
  // console.log(indexes);

  // Obtenemos el costo total de la asignación
  let totalCost = 0;
  for (let i = 0; i < indexes.length; i++) {
    const row = indexes[i][0];
    const col = indexes[i][1];
    // console.log("totlaCost", totalCost);
    totalCost += matrix[row][col];
  }

  return totalCost;
}

export default assignMax;
