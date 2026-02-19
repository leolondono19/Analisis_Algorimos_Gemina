// const data = {
//     "algorithm": "transport-min",
//     "numRows": 3,
//     "numColumns": 4,
//     "matrix": [
//         ["", "1", "2", "3", "4", ""],
//         ["a", "3", "2", "8", "9", "6"],
//         ["b", "7", "3", "2", "6", "5"],
//         ["c", "7", "3", "3", "3", "3"],
//         ["", "2", "6", "5", "1", ""]
//     ]
// };

// const data = {
//     "algorithm": "transport-min",
//     "numRows": 3,
//     "numColumns": 4,
//     "matrix": [
//         ["", "1", "2", "3", "4", ""],
//         ["a", "3", "2", "6", "8", "6"],
//         ["b", "6", "3", "3", "9", "6"],
//         ["c", "2", "6", "4", "2", "7"],
//         ["", "2", "6", "10", "1", ""]
//     ]
// };

// const data = {
//     "algorithm": "transport-max",
//     "numRows": 4,
//     "numColumns": 4,
//     "matrix": [
//         ["", "1", "2", "3", "4", ""],
//         ["a", "3", "2", "8", "9", "1"],
//         ["b", "7", "3", "2", "6", "8"],
//         ["c", "7", "3", "3", "5", "3"],
//         ["d", "2", "6", "4", "2", "7"],
//         ["", "4", "5", "5", "5", ""]
//     ]
// };

export const transportAlgorithm = ({
  algorithm,
  numRows,
  numColumns,
  matrix,
}) => {
  validation(numRows, numColumns, matrix);

  // Crear arrays para oferta, demanda y costos
  let supply = Array.from(matrix.slice(1, numRows + 1), (row) =>
    parseInt(row[numColumns + 1])
  );
  let demand = Array.from(
    matrix[numRows + 1].slice(1, numColumns + 1),
    (val) => parseInt(val)
  );
  let cost = Array.from(matrix.slice(1, numRows + 1), (row) =>
    Array.from(row.slice(1, numColumns + 1), (val) => parseInt(val))
  );

  // Manejo de casos desbalanceados
  const sumSupply = supply.reduce((acc, val) => acc + val, 0);
  const sumDemand = demand.reduce((acc, val) => acc + val, 0);

  if (sumSupply > sumDemand) {
    // Verificar si ya existe una columna ficticia
    if (!demand.includes(sumSupply - sumDemand)) {
      demand.push(sumSupply - sumDemand);
      cost.forEach((row) => row.push(0));
      numColumns++;
      console.warn("Se agregó una columna ficticia para balancear la demanda con la oferta.");
    }
  } else if (sumDemand > sumSupply) {
    // Verificar si ya existe una fila ficticia
    if (!supply.includes(sumDemand - sumSupply)) {
      supply.push(sumDemand - sumSupply);
      cost.push(Array.from({ length: numColumns }, () => 0));
      numRows++;
      console.warn("Se agregó una fila ficticia para balancear la oferta con la demanda.");
    }
  }

  // Crear matriz de asignación
  const allocationMatrix = Array.from({ length: numRows }, () =>
    Array.from({ length: numColumns }, () => null)
  );

  // Copia de la matriz de costos
  const costCopy = cost.map((row) => row.slice());

  // Inicializar la función de comparación
  if (algorithm === "transport-max") {
    const max = Math.max(...cost.map((row) => Math.max(...row)));
    cost.forEach((row) => row.forEach((val, i) => (row[i] = max - val)));
  }

  // Algoritmo de esquina noroeste
  let i = 0; // Fila actual
  let j = 0; // Columna actual
  while (
    supply.reduce((a, b) => a + b) !== 0 &&
    demand.reduce((a, b) => a + b) !== 0
  ) {
    if (supply[i] > demand[j]) {
      allocationMatrix[i][j] = demand[j];
      supply[i] -= demand[j];
      demand[j] = 0;
      j++;
    } else if (supply[i] < demand[j]) {
      allocationMatrix[i][j] = supply[i];
      demand[j] -= supply[i];
      supply[i] = 0;
      i++;
    } else {
      allocationMatrix[i][j] = supply[i];
      supply[i] = 0;
      demand[j] = 0;
      i++;
    }
  }

  // Verificar si la solución es óptima y optimizar si es necesario
  let isOptimal = false;
  let totalCost = Infinity;
  let copyAllocationMatrix;
  while (!isOptimal) {
    const optimalSol = optimalSolution(numRows, numColumns, cost, allocationMatrix);
    isOptimal = optimalSol.isOptimal;
    if (!isOptimal) {
      const path = getLoopPath(
        numRows,
        numColumns,
        allocationMatrix,
        optimalSol.i[0],
        optimalSol.j[0]
      );
      const alpha = Math.min(
        ...path
          .filter((_, idx) => idx % 2 !== 0)
          .map(([x, y]) => allocationMatrix[x][y])
      );
      path.forEach(([x, y], idx) => {
        if (idx % 2 === 0) {
          allocationMatrix[x][y] += alpha;
        } else {
          allocationMatrix[x][y] -= alpha;
        }
      });
    }
    totalCost = getTotalCost(costCopy, allocationMatrix);
    copyAllocationMatrix = allocationMatrix.map((row) => row.slice());
  }

  // Generar descripción textual de la solución
  const textualSolution = [];
  for (let i = 0; i < allocationMatrix.length; i++) {
    for (let j = 0; j < allocationMatrix[i].length; j++) {
      if (
        allocationMatrix[i][j] !== null &&
        allocationMatrix[i][j] > 0 &&
        matrix[i + 1][0] !== "Ficticia" && // Excluir filas ficticias
        matrix[0][j + 1] !== "Ficticia"   // Excluir columnas ficticias
      ) {
        const from = matrix[i + 1][0]; // Nombre de la fila (ej. "A")
        const to = matrix[0][j + 1];   // Nombre de la columna (ej. "1")
        textualSolution.push(
          `De "${from}" a "${to}" la solución es ${allocationMatrix[i][j]}`
        );
      }
    }
  }

  return { allocationMatrix: copyAllocationMatrix, totalCost, textualSolution };
};

function optimalSolution(numRows, numColumns, cost, allocationMatrix) {
  // Let's check this using the MODI method (UV method).
  // We will use two arrays to store the U and V values.
  const u = Array.from({ length: numRows }, () => null);
  const v = Array.from({ length: numColumns }, () => null);
  // We will use a while loop to calculate the U and V values.
  // The loop will continue until all the U and V values are calculated.
  // Initialize the U value with the minimum/maximum cost value in the cost matrix
  u[0] = Math.min(...cost.map((row) => Math.min(...row)));
  // We will use a while loop to calculate the U and V values.
  // The loop will continue until all the U and V values are calculated.
  let k = 0;
  while (u.includes(null) || v.includes(null)) {
    // Loop through the cost matrix
    for (let i = 0; i < numRows; i++) {
      for (let j = 0; j < numColumns; j++) {
        // If the current cell is not empty
        if (allocationMatrix[i][j] !== null) {
          // If the U value at the current row is not null
          if (u[i] !== null) {
            // If the V value at the current column is null
            if (v[j] === null) {
              // Calculate the V value at the current column
              v[j] = cost[i][j] - u[i];
            }
          }
          // If the V value at the current column is not null
          else if (v[j] !== null) {
            // If the U value at the current row is null
            if (u[i] === null) {
              // Calculate the U value at the current row
              u[i] = cost[i][j] - v[j];
            }
          }
        }
      }
    }
    k++;
    if (u[k] === null) {
      u[k] = u[0];
    }
  }
  // Create a new matrix that follows the rules of the MODI method
  const cMatrix = Array.from({ length: numRows }, () =>
    Array.from({ length: numColumns }, () => null)
  );
  // Loop through the cost matrix
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numColumns; j++) {
      cMatrix[i][j] = u[i] + v[j];
    }
  }
  // Subtract the cost matrix from the MODI matrix
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numColumns; j++) {
      cMatrix[i][j] = cost[i][j] - cMatrix[i][j];
    }
  }
  // Return the position where the minimum value is negative
  let values = [];
  let isOptimal = true;
  for (let k = 0; k < numRows; k++) {
    for (let l = 0; l < numColumns; l++) {
      if (cMatrix[k][l] < 0) {
        // we push an array with the value, row and column
        values.push([cMatrix[k][l], k, l]);
        isOptimal = false;
      }
    }
  }
  // sort the min array from the smallest to the largest value, note that the first element is the minimum value
  values.sort((a, b) => a[0] - b[0]);
  // Get the row and column of the minimum value
  let i = [];
  let j = [];
  for (let k = 0; k < values.length; k++) {
    i.push(values[k][1]);
    j.push(values[k][2]);
  }
  // If the minimum value is negative, the solution is not optimal
  return {
    isOptimal: isOptimal,
    i: i,
    j: j,
  };
}

function getLoopPath(numRows, numColumns, allocationMatrix, i, j) {
  // Create an empty list to store the coordinates of the cells in the path
  const path = [];
  // Start from the pivot cell
  let currentCell = [i, j, ""];
  // Add the current cell to the path
  path.push(currentCell);
  // Create a matrix with falses in order to keep track of the cells that doesn't make a loop
  const visited = Array.from({ length: numRows }, () =>
    Array.from({ length: numColumns }, () => false)
  );
  // Count the not null cells
  const count = allocationMatrix.reduce((accumulator, row) => {
    return accumulator + row.filter((column) => column !== null).length;
  }, 0);

  for (let k = 0; k < count; k++) {
    let flag = false;
    let ii = currentCell[0];
    let jj = currentCell[1];
    // Move the cursor from i to 0 (Up)
    for (let k = ii - 1; k >= 0; k--) {
      if (currentCell[2] === "down") break; // Don't go back to the cell from which you came
      if (allocationMatrix[k][jj] !== null && !visited[k][jj]) {
        currentCell = [k, jj, "up"];
        path.push(currentCell);
        flag = true;
        break;
      }
    }
    if (currentCell[0] === i && currentCell[1] === j && path.length > 1) break;
    if (flag) continue;
    // Move the cursor from j to numColumns - 1 (Right)
    for (let k = jj + 1; k < numColumns; k++) {
      if (currentCell[2] === "left") break; // Don't go back to the cell from which you came
      if (allocationMatrix[ii][k] !== null && !visited[ii][k]) {
        currentCell = [ii, k, "right"];
        path.push(currentCell);
        flag = true;
        break;
      }
    }
    if (currentCell[0] === i && currentCell[1] === j && path.length > 1) break;
    if (flag) continue;
    // Move the cursor from i to numRows - 1 (Down)
    for (let k = ii + 1; k < numRows; k++) {
      if (currentCell[2] === "up") break; // Don't go back to the cell from which you came
      if (allocationMatrix[k][jj] !== null && !visited[k][jj]) {
        currentCell = [k, jj, "down"];
        path.push(currentCell);
        flag = true;
        break;
      }
    }
    if (currentCell[0] === i && currentCell[1] === j && path.length > 1) break;
    if (flag) continue;
    // Move the cursor from j to 0 (Left)
    for (let k = jj - 1; k >= 0; k--) {
      if (currentCell[2] === "right") break; // Don't go back to the cell from which you came
      if (allocationMatrix[ii][k] !== null && !visited[ii][k]) {
        currentCell = [ii, k, "left"];
        path.push(currentCell);
        flag = true;
        break;
      }
    }
    if (currentCell[0] === i && currentCell[1] === j && path.length > 1) break;
    if (flag) continue;
    // If we reach this point, then the node is not connected to the pivot cell
    visited[currentCell[0]][currentCell[1]] = true;
    // Remove the last cell from the path
    path.pop();
    // Set the last cell of the path as the current cell
    currentCell = path[path.length - 1];
    k--;
  }
  // If we find two consecutive moves in the same direction, then we have to remove the first one
  for (let k = 0; k < path.length - 1; k++) {
    if (path[k][2] === path[k + 1][2]) {
      path.splice(k, 1);
      k--;
    }
  }
  return path;
}

function getTotalCost(cost, allocationMatrix) {
  let totalCost = 0;
  for (let i = 0; i < cost.length; i++) {
    for (let j = 0; j < cost[i].length; j++) {
      totalCost += cost[i][j] * allocationMatrix[i][j];
    }
  }
  return totalCost;
}

// TODO: SOLVE WHEN WE GET A REPEATED NEGATIVE VALUE IN THE MODI MATRIX
// FIND A WAY TO CHOOSE THE RIGHT PATH WHEN WE HAVE MULTIPLE NEGATIVE VALUES

function validation(numRows, numColumns, matrix) {
  // Check if the cost matrix contains only numbers greater or equal to 0
  const cost = Array.from(matrix.slice(1, numRows + 1), (row) =>
    Array.from(row.slice(1, numColumns + 1), (val) => parseInt(val))
  );
  cost.forEach((row) =>
    row.forEach((val) => {
      if (isNaN(val))
        throw new Error("La matriz de costos debe contener solo números");
      if (val === null || val === "")
        throw new Error("La matriz de costos debe contener solo números");
      if (val < 0)
        throw new Error(
          "La matriz de costos debe contener solo números mayores o iguales a 0"
        );
    })
  );

  // Check if the supply and demand arrays contain only numbers greater or equal to 0
  const supply = Array.from(matrix.slice(1, numRows + 1), (row) =>
    parseInt(row[numColumns + 1])
  );
  supply.forEach((val) => {
    if (val < 0)
      throw new Error(
        "El vector de disponibilidad debe contener solo números mayores o iguales a 0"
      );
    if (isNaN(val))
      throw new Error("El vector de disponibilidad debe contener solo números");
    if (val === null || val === "")
      throw new Error("El vector de disponibilidad debe contener solo números");
  });

  const demand = Array.from(
    matrix[numRows + 1].slice(1, numColumns + 1),
    (val) => parseInt(val)
  );
  demand.forEach((val) => {
    if (val < 0)
      throw new Error(
        "El vector de demanda debe contener solo números mayores o iguales a 0"
      );
    if (isNaN(val))
      throw new Error("El vector de demanda debe contener solo números");
    if (val === null || val === "")
      throw new Error("El vector de demanda debe contener solo números");
  });

  // Eliminar la validación de balance entre oferta y demanda
  // La lógica de balance ya se maneja en el algoritmo principal
}
