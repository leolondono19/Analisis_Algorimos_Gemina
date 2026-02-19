export const competAlgorithm = (coordinates) => {
  let centroid = null;
  coordinates = sortClockwise(coordinates);
  if (isConvex(coordinates)) {
    centroid = getCentroid(coordinates);
  }
  return centroid;
};

function sortClockwise(coordinates) {
  const centerX =
    coordinates.reduce((sum, p) => sum + p[0], 0) / coordinates.length;
  const centerY =
    coordinates.reduce((sum, p) => sum + p[1], 0) / coordinates.length;
  // Calculate the angle between each point and the center point
  const angles = coordinates.map((p) =>
    Math.atan2(p[1] - centerY, p[0] - centerX)
  );
  // Sort the points based on their angle relative to the center point
  return coordinates.sort(
    (a, b) => angles[coordinates.indexOf(a)] - angles[coordinates.indexOf(b)]
  );
}

function isConvex(coordinates) {
  // if the polygon has less than 3 points, it is not convex
  if (coordinates.length < 3) {
    return false;
  }
  let n = coordinates.length;
  let sign = 0;
  // check each set of 3 adjacent points, looking for angles > 180
  for (let i = 0; i < n; i++) {
    let dx1 = coordinates[(i + 2) % n][0] - coordinates[(i + 1) % n][0];
    let dy1 = coordinates[(i + 2) % n][1] - coordinates[(i + 1) % n][1];
    let dx2 = coordinates[i][0] - coordinates[(i + 1) % n][0];
    let dy2 = coordinates[i][1] - coordinates[(i + 1) % n][1];
    let delta = dx1 * dy2 - dy1 * dx2;
    if (sign === 0) {
      sign = delta;
    } else if (delta * sign < 0) {
      return false;
    }
  }
  return true;
}

function getCentroid(coordinates) {
  let cx = 0;
  let cy = 0;
  let area = 0;
  let n = coordinates.length;
  for (let i = 0; i < n; i++) {
    let x1 = coordinates[i][0];
    let y1 = coordinates[i][1];
    let x2 = coordinates[(i + 1) % n][0];
    let y2 = coordinates[(i + 1) % n][1];
    let a = x1 * y2 - x2 * y1;
    area += a;
    cx += (x1 + x2) * a;
    cy += (y1 + y2) * a;
  }
  area = area / 2;
  cx = cx / (6 * area);
  cy = cy / (6 * area);
  return [cx, cy];
}
