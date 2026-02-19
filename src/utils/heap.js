export class Heap {
  constructor() {
    this.heap = [];
  }

  getParentIndex(index) {
    return Math.floor((index - 1) / 2);
  }

  getLeftChildIndex(index) {
    return 2 * index + 1;
  }

  getRightChildIndex(index) {
    return 2 * index + 2;
  }

  swap(index1, index2) {
    [this.heap[index1], this.heap[index2]] = [
      this.heap[index2],
      this.heap[index1],
    ];
  }

  insert(value) {
    this.heap.push(value);
    this.heapifyUp();
  }

  heapifyUp() {
    let currentIndex = this.heap.length - 1;

    while (currentIndex > 0) {
      const parentIndex = this.getParentIndex(currentIndex);

      if (this.heap[parentIndex] > this.heap[currentIndex]) {
        this.swap(parentIndex, currentIndex);
        currentIndex = parentIndex;
      } else {
        break;
      }
    }
  }

  extractMin() {
    if (this.heap.length === 0) {
      return null;
    }

    if (this.heap.length === 1) {
      return this.heap.pop();
    }

    const minValue = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.heapifyDown();
    return minValue;
  }

  heapifyDown() {
    let currentIndex = 0;

    while (true) {
      const leftChildIndex = this.getLeftChildIndex(currentIndex);
      const rightChildIndex = this.getRightChildIndex(currentIndex);
      let smallestIndex = currentIndex;

      if (
        leftChildIndex < this.heap.length &&
        this.heap[leftChildIndex] < this.heap[smallestIndex]
      ) {
        smallestIndex = leftChildIndex;
      }

      if (
        rightChildIndex < this.heap.length &&
        this.heap[rightChildIndex] < this.heap[smallestIndex]
      ) {
        smallestIndex = rightChildIndex;
      }

      if (smallestIndex === currentIndex) {
        break;
      }

      this.swap(currentIndex, smallestIndex);
      currentIndex = smallestIndex;
    }
  }

  preOrderTraversal(index = 0) {
    if (index >= this.heap.length) {
      return [];
    }

    const value = this.heap[index];
    const leftChildIndex = this.getLeftChildIndex(index);
    const rightChildIndex = this.getRightChildIndex(index);

    const leftSubtree = this.preOrderTraversal(leftChildIndex);
    const rightSubtree = this.preOrderTraversal(rightChildIndex);

    return [value, ...leftSubtree, ...rightSubtree];
  }

  inOrderTraversal(index = 0) {
    if (index >= this.heap.length) {
      return [];
    }

    const leftChildIndex = this.getLeftChildIndex(index);
    const rightChildIndex = this.getRightChildIndex(index);

    const leftSubtree = this.inOrderTraversal(leftChildIndex);
    const value = this.heap[index];
    const rightSubtree = this.inOrderTraversal(rightChildIndex);

    return [...leftSubtree, value, ...rightSubtree];
  }

  postOrderTraversal(index = 0) {
    if (index >= this.heap.length) {
      return [];
    }

    const leftChildIndex = this.getLeftChildIndex(index);
    const rightChildIndex = this.getRightChildIndex(index);

    const leftSubtree = this.postOrderTraversal(leftChildIndex);
    const rightSubtree = this.postOrderTraversal(rightChildIndex);
    const value = this.heap[index];

    return [...leftSubtree, ...rightSubtree, value];
  }
}
