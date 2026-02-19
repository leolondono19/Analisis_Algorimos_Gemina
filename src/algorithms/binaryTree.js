export const generateTreeFromList = (list, rootCoordinates) => {
  const coordinates = [];
  const labels = [];
  const parent = [];
  const queue = [...list];
  const root = {
    coordinates: rootCoordinates,
    label: queue.shift(),
    left: null,
    right: null,
    parent: null,
  };
  const loop = true;
  coordinates.push(rootCoordinates);
  labels.push(root.label);
  parent.push(root.parent);
  while (queue.length > 0) {
    const node = queue.shift();
    let currentNode = root;
    while (loop) {
      if (node < currentNode.label) {
        if (currentNode.left === null) {
          currentNode.left = {
            coordinates: [
              currentNode.coordinates[0] -
                (currentNode.label == root.label ? 200 : 100),
              currentNode.coordinates[1] + 100,
            ],
            label: node,
            left: null,
            right: null,
            parent: currentNode.label,
          };
          coordinates.push(currentNode.left.coordinates);
          labels.push(currentNode.left.label);
          parent.push(currentNode.left.parent);
          break;
        } else {
          currentNode = currentNode.left;
        }
      } else {
        if (currentNode.right === null) {
          currentNode.right = {
            coordinates: [
              currentNode.coordinates[0] +
                (currentNode.label == root.label ? 200 : 100),
              currentNode.coordinates[1] + 100,
            ],
            label: node,
            left: null,
            right: null,
            parent: currentNode.label,
          };
          coordinates.push(currentNode.right.coordinates);
          labels.push(currentNode.right.label);
          parent.push(currentNode.right.parent);
          break;
        } else {
          currentNode = currentNode.right;
        }
      }
    }
  }
  const binaryTree = [];
  for (let i = 0; i < coordinates.length; i++) {
    binaryTree.push({
      x: coordinates[i][0],
      y: coordinates[i][1],
      label: labels[i],
      parent: parent[i],
    });
  }
  // if there are two overlapping nodes, move the second node to the right
  for (let i = 0; i < binaryTree.length; i++) {
    for (let j = i + 1; j < binaryTree.length; j++) {
      if (
        binaryTree[i].x === binaryTree[j].x &&
        binaryTree[i].y === binaryTree[j].y
      ) {
        binaryTree[j].x += 100;
      }
    }
  }
  // console.table(binaryTree);
  // console.log(root);
  return { root, binaryTree };
};

export const generateListFromOrders = (preOrder, inOrder) => {
  const list = [];
  const preOrderQueue = [...preOrder];
  const inOrderQueue = [...inOrder];
  while (preOrderQueue.length > 0) {
    const node = preOrderQueue.shift();
    if (inOrderQueue.includes(node)) {
      list.push(node);
    }
  }
  return list;
};

export const generateListFromPostInOrders = (postOrder, inOrder) => {
  if (!postOrder.length || !inOrder.length) return [];
  const root = postOrder[postOrder.length - 1];
  const rootIndex = inOrder.indexOf(root);

  const leftInOrder = inOrder.slice(0, rootIndex);
  const rightInOrder = inOrder.slice(rootIndex + 1);

  const leftPostOrder = postOrder.slice(0, leftInOrder.length);
  const rightPostOrder = postOrder.slice(leftInOrder.length, postOrder.length - 1);

  // El orden correcto de inserción para un ABB es: root, ...left, ...right
  return [
    root,
    ...generateListFromPostInOrders(leftPostOrder, leftInOrder),
    ...generateListFromPostInOrders(rightPostOrder, rightInOrder),
  ];
};

export const getOrdersFromList = (list) => {
  const preOrder = [];
  const inOrder = [];
  const postOrder = [];

  if (list.length === 0) {
    return { preOrder, inOrder, postOrder };
  }

  const { root } = generateTreeFromList(list, [0, 0]);
  // Pre order start from root
  const preOrderStack = [root];
  while (preOrderStack.length > 0) {
    const node = preOrderStack.pop();
    preOrder.push(node.label);
    if (node.right !== null) {
      preOrderStack.push(node.right);
    }
    if (node.left !== null) {
      preOrderStack.push(node.left);
    }
  }
  // In order is the ascending order of the list
  inOrder.push(...list);
  inOrder.sort((a, b) => a - b);
  // Post order is the reverse of pre order
  postOrder.push(...constructPostorder(inOrder, preOrder));

  return { preOrder, inOrder, postOrder };
};

function constructPostorder(inorder, preorder) {
  if (inorder.length === 0 || preorder.length === 0) {
    return [];
  }

  const rootValue = preorder[0];
  const rootIndex = inorder.indexOf(rootValue);

  const leftSubtreeInorder = inorder.slice(0, rootIndex);
  const rightSubtreeInorder = inorder.slice(rootIndex + 1);

  const leftSubtreePreorder = preorder.slice(1, rootIndex + 1);
  const rightSubtreePreorder = preorder.slice(rootIndex + 1);

  const leftSubtreePostorder = constructPostorder(
    leftSubtreeInorder,
    leftSubtreePreorder
  );
  const rightSubtreePostorder = constructPostorder(
    rightSubtreeInorder,
    rightSubtreePreorder
  );

  const postorder = leftSubtreePostorder.concat(
    rightSubtreePostorder,
    rootValue
  );
  return postorder;
}
