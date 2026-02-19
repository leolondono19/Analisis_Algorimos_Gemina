// const data = {
//     "algorithm": "assignment-min",
//     "numRows": 3,
//     "numColumns": 3,
//     "matrix": [
//         ["", "1", "2", "3", ""],
//         ["a", "7", "3", "2", ""],
//         ["b", "2", "4", "6", ""],
//         ["c", "2", "7", "4", ""],
//         ["", "", "", "", "", ""]
//     ]
// };

// const data = {
//     "algorithm": "assignment-max",
//     "numRows": 4,
//     "numColumns": 4,
//     "matrix": [
//         ["", "1", "2", "3", "4", ""],
//         ["a", "6", "2", "6", "6", ""],
//         ["b", "6", "1", "4", "2", ""],
//         ["c", "8", "1", "5", "3", ""],
//         ["d", "7", "1", "4", "2", ""],
//         ["", "", "", "", "", ""]
//     ]
// };

// const data = {
//     "algorithm": "assignment-max",
//     "numRows": 4,
//     "numColumns": 4,
//     "matrix": [
//         ["", "1", "2", "3", "4", ""],
//         ["a", "9", "2", "6", "6", ""],
//         ["b", "6", "1", "4", "2", ""],
//         ["c", "8", "7", "5", "6", ""],
//         ["d", "7", "8", "4", "2", ""],
//         ["", "", "", "", "", ""]
//     ]
// };

export const assignmentAlgorithm = ({
  algorithm,
  numRows,
  numColumns,
  matrix,
}) => {
  validation(numRows, numColumns, matrix);
  // Create array of the cost matrix
  const cost = Array.from(matrix.slice(1, numRows + 1), (row) =>
    Array.from(row.slice(1, numColumns + 1), (val) => parseInt(val))
  );
  // Ceate a copy of the cost matrix
  const costCopy = cost.map((row) => row.slice());

  // Initialize the comparison function
  if (algorithm === "assignment-max") {
    // We get the maximum value from the cost matrix
    const max = Math.max(...cost.map((row) => Math.max(...row)));
    // Subtract the maximum value from each element in the cost matrix
    cost.forEach((row) => row.forEach((val, i) => (row[i] = max - val)));
  }
  // We subtract the minimum value from each row
  cost.forEach((row) => {
    const min = Math.min(...row);
    row.forEach((val, i) => (row[i] = val - min));
  });
  // We subtract the minimum value from each column
  cost[0].forEach((_, i) => {
    const min = Math.min(...cost.map((row) => row[i]));
    cost.forEach((row) => (row[i] -= min));
  });
  // We create a zero matrix, in order to create additional zeros for iterations
  for (;;) {
    // We create an array to count the number of zeros
    let rowZeros = [];
    let colZeros = [];
    let k = 0;
    // We create a Copy of the cost matrix
    const costAux = cost.map((row) => row.slice());
    for (let i = 0; i < numRows; i++) {
      rowZeros = costAux.map((row) => row.filter((val) => val === 0).length);
      colZeros = costAux[0].map(
        (_, i) => costAux.map((row) => row[i]).filter((val) => val === 0).length
      );
      // Count the total number of zeros
      const totalZeros = rowZeros.reduce((acc, val) => acc + val, 0);
      if (totalZeros === 0) {
        k = i;
        break;
      }
      // We find the index that contains the maximum number of zeros
      if (Math.max(...rowZeros) > Math.max(...colZeros)) {
        // We convert all the zeros in the row to null
        costAux[rowZeros.indexOf(Math.max(...rowZeros))].forEach((_val, i) => {
          costAux[rowZeros.indexOf(Math.max(...rowZeros))][i] = null;
        });
      }
      // We find the index that contains the maximum number of zeros
      else {
        costAux.forEach((row) => {
          row[colZeros.indexOf(Math.max(...colZeros))] = null;
        });
      }
    }
    // If k is 0 it means the optimal assignment has been found
    if (k === 0) break;
    // We find the minimum value in the costAux matrix
    const min = Math.min(
      ...costAux.map((row) => Math.min(...row.filter((val) => val !== null)))
    );
    // We replace all the non-null values in the costAux matrix with the minimum value
    costAux.forEach((row) =>
      row.forEach((val, i) => {
        if (val !== null) row[i] = min;
      })
    );
    // We update the cost matrix subtracting the non-null values in the costAux matrix
    cost.forEach((row, i) =>
      row.forEach((_val, j) => {
        if (costAux[i][j] !== null) cost[i][j] -= costAux[i][j];
      })
    );
  }
  // Once optimal assignment has been found, we need to select the appropriate zeros
  // Create an matrix of null values
  const assignmentMatrix = Array.from({ length: numRows }, () =>
    Array.from({ length: numColumns }, () => null)
  );
  // Create an array of null values to show the occupied columns
  const occupiedColumns = Array.from({ length: numColumns }, () => null);
  for (let i = 0; i < numRows; i++) {
    // Find the column which i index contains a zero, and it has the less number of zeros in the column
    let minZeros = Infinity;
    let colIndex = 0;
    const colZeros = cost[0].map(
      (_, i) => cost.map((row) => row[i]).filter((val) => val === 0).length
    );
    for (let j = 0; j < numColumns; j++) {
      if (
        cost[i][j] === 0 &&
        colZeros[j] < minZeros &&
        occupiedColumns[j] === null
      ) {
        colIndex = j;
        minZeros = colZeros[j];
      }
    }
    // We assign zero to the corresponding row and column
    assignmentMatrix[i][colIndex] = 0;
    // We mark the column as occupied
    occupiedColumns[colIndex] = 0;
    // We convert all the i row to null
    cost[i].forEach((_val, j) => {
      cost[i][j] = null;
    });
  }
  // console.table(assignment);
  const totalCost = getTotalCost(costCopy, assignmentMatrix);
  return { assignmentMatrix: assignmentMatrix, totalCost: totalCost };
};

function getTotalCost(cost, assignmentMatrix) {
  let totalCost = 0;
  for (let i = 0; i < cost.length; i++) {
    for (let j = 0; j < cost[i].length; j++) {
      if (assignmentMatrix[i][j] === 0) {
        totalCost += cost[i][j];
      }
    }
  }
  return totalCost;
}

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
  // Check if the cost matrix is square
  if (cost.length !== cost[0].length)
    throw new Error("La matriz de costos debe ser cuadrada");
}
