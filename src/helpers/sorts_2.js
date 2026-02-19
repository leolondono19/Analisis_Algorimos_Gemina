export function generarListaAleatoria(n) {
  var lista = [];
  for (var i = 0; i < n; i++) {
    lista.push(Math.floor(Math.random() * 100450));
  }
  return lista;
}

export function mergeSort(arr) {
  let numSteps = 0; // Contador para las operaciones
  let steps = []; // Array para registrar los pasos

  function merge(left, right) {
    const result = [];
    let il = 0;
    let ir = 0;

    // Registrar el estado inicial de la fusión
    steps.push({
      arrayState: [...left, ...right],
      highlightIndices: [],
      description: `Fusionando: ${left} y ${right}`,
    });
    numSteps++; // Contar esta operación

    while (il < left.length && ir < right.length) {
      if (left[il] < right[ir]) {
        result.push(left[il++]);
      } else {
        result.push(right[ir++]);
      }

      // Registrar cada comparación
      steps.push({
        arrayState: [...result, ...left.slice(il), ...right.slice(ir)],
        highlightIndices: [result.length - 1],
        description: `Comparación: ${left[il - 1] || "N/A"} y ${
          right[ir - 1] || "N/A"
        }`,
      });
      numSteps++; // Contar esta operación
    }

    // Registrar el estado final de la fusión
    steps.push({
      arrayState: [...result, ...left.slice(il), ...right.slice(ir)],
      highlightIndices: [],
      description: `Fusión completada: ${[
        ...result,
        ...left.slice(il),
        ...right.slice(ir),
      ]}`,
    });
    numSteps++; // Contar esta operación

    return result.concat(left.slice(il)).concat(right.slice(ir));
  }

  function mergeSortHelper(arr) {
    if (arr.length <= 1) {
      return arr;
    }
    const mid = Math.floor(arr.length / 2);
    const left = arr.slice(0, mid);
    const right = arr.slice(mid);

    // Registrar la división
    steps.push({
      arrayState: [...arr],
      highlightIndices: [],
      description: `Dividiendo: ${arr} en ${left} y ${right}`,
    });
    numSteps++; // Contar esta operación

    return merge(mergeSortHelper(left), mergeSortHelper(right));
  }

  const t0 = performance.now();
  const sortedArray = mergeSortHelper(arr);
  const t1 = performance.now();
  const runtime = t1 - t0;

  return {
    sortedArray,
    numOperations: numSteps, // Número total de operaciones
    runtime: parseFloat(runtime.toFixed(10)),
    steps, // Pasos registrados para la visualización
  };
}

export function shellSort(arr, initialGap) {
  const n = arr.length;
  let gap = initialGap; // Usar el intervalo inicial proporcionado por el usuario
  let contador = 0;
  let steps = []; // Array para registrar los pasos

  const start = performance.now();

  while (gap > 0) {
    for (let i = gap; i < n; i++) {
      const temp = arr[i];
      let j = i;

      // Registrar el estado inicial del paso
      steps.push({
        arrayState: [...arr],
        highlightIndices: [i],
        description: `Inicio de la iteración con gap ${gap}: comparando el elemento ${temp}`,
      });

      while (j >= gap && arr[j - gap] > temp) {
        arr[j] = arr[j - gap];

        // Registrar el desplazamiento
        steps.push({
          arrayState: [...arr],
          highlightIndices: [j, j - gap],
          description: `Desplazamiento: el elemento ${arr[j - gap]} se mueve a la posición ${j}`,
        });

        j -= gap;
        contador++;
      }

      arr[j] = temp;

      // Registrar la inserción
      steps.push({
        arrayState: [...arr],
        highlightIndices: [j],
        description: `Inserción: el elemento ${temp} se coloca en la posición ${j}`,
      });
      contador++;
    }

    gap = Math.floor(gap / 2); // Reducir el intervalo a la mitad

    // Registrar el cambio de gap
    steps.push({
      arrayState: [...arr],
      highlightIndices: [],
      description: `Cambio de gap a ${gap}`,
    });
  }

  const end = performance.now();
  const runtime = end - start;

  return {
    sortedArray: arr,
    numOperations: contador,
    runtime: parseFloat(runtime.toFixed(10)),
    steps, // Pasos registrados para la visualización
  };
}

export function insertionSort(arr) {
  let contador = 0; // Contador para las operaciones
  let steps = []; // Array para registrar los pasos
  const start = performance.now();

  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;

    // Registrar el inicio de la inserción
    steps.push({
      arrayState: [...arr],
      highlightIndex: i,
      description: `Inicio de la inserción del elemento ${key}`,
    });
    contador++; // Contar el inicio de la inserción

    while (j >= 0) {
      // Registrar cada comparación
      steps.push({
        arrayState: [...arr],
        highlightIndex: j,
        description: `Comparación: el elemento ${arr[j]} con ${key}`,
      });
      contador++; // Contar la comparación

      if (arr[j] > key) {
        arr[j + 1] = arr[j];

        // Registrar el desplazamiento
        steps.push({
          arrayState: [...arr],
          highlightIndex: j + 1,
          description: `Desplazamiento: el elemento ${arr[j]} se mueve a la posición ${j + 1}`,
        });
        contador++; // Contar el desplazamiento
      } else {
        break; // Salir del bucle si no hay más desplazamientos
      }
      j--;
    }

    arr[j + 1] = key;

    // Registrar la inserción
    steps.push({
      arrayState: [...arr],
      highlightIndex: j + 1,
      description: `Inserción: el elemento ${key} se coloca en la posición ${j + 1}`,
    });
    contador++; // Contar la inserción
  }

  const end = performance.now();
  const runtime = (end - start) / 1000;

  return {
    sortedArray: arr,
    numOperations: contador, // Número total de operaciones
    runtime: runtime, // Tiempo de ejecución
    steps, // Pasos registrados para la visualización
  };
}

export function selectionSort(arr) {
  let contador = 0; // Contador para las operaciones
  let steps = []; // Array para registrar los pasos
  const start = performance.now();

  for (let i = 0; i < arr.length - 1; i++) {
    let minIndex = i;

    // Registrar el estado inicial del paso
    steps.push({
      arrayState: [...arr],
      highlightIndices: [i],
      description: `Inicio de la iteración ${i + 1}: buscando el mínimo desde la posición ${i}`,
    });
    contador++; // Contar esta operación

    for (let j = i + 1; j < arr.length; j++) {
      // Registrar cada comparación
      steps.push({
        arrayState: [...arr],
        highlightIndices: [i, j],
        description: `Comparando: ${arr[j]} con el mínimo actual ${arr[minIndex]}`,
      });
      contador++; // Contar esta operación

      if (arr[j] < arr[minIndex]) {
        minIndex = j;

        // Registrar el cambio del índice mínimo
        steps.push({
          arrayState: [...arr],
          highlightIndices: [i, minIndex],
          description: `Nuevo mínimo encontrado: ${arr[minIndex]} en la posición ${minIndex}`,
        });
        contador++; // Contar esta operación
      }
    }

    if (minIndex !== i) {
      const temp = arr[i];
      arr[i] = arr[minIndex];
      arr[minIndex] = temp;

      // Registrar el intercambio
      steps.push({
        arrayState: [...arr],
        highlightIndices: [i, minIndex],
        description: `Intercambio: ${arr[i]} con ${arr[minIndex]}`,
      });
      contador++; // Contar esta operación
    }
  }

  const end = performance.now();
  const runtime = end - start;

  return {
    sortedArray: arr,
    numOperations: contador, // Número total de operaciones
    runtime: parseFloat(runtime.toFixed(10)),
    steps, // Pasos registrados para la visualización
  };
}
