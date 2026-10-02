const assert = require('assert');

// Full maze layout & simulation
const MAZE_MAP = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
  [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 2, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

// BFS shortest path solver
function findPath(start, goal, allowDoor = false) {
  const queue = [[start[0], start[1], []]];
  const visited = new Set([start[0] + ',' + start[1]]);
  while (queue.length > 0) {
    const [x, y, path] = queue.shift();
    if (x === goal[0] && y === goal[1]) return path;

    for (const [dx, dy, dirName] of [[0, 1, 'DOWN'], [0, -1, 'UP'], [1, 0, 'RIGHT'], [-1, 0, 'LEFT']]) {
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && nx < 15 && ny >= 0 && ny < 10) {
        const val = MAZE_MAP[ny][nx];
        const canWalk = (val === 0) || (allowDoor && val === 2);
        if (canWalk && !visited.has(nx + ',' + ny)) {
          visited.add(nx + ',' + ny);
          queue.push([nx, ny, [...path, [dx, dy, dirName]]]);
        }
      }
    }
  }
  return null;
}

const pathToKey = findPath([1, 1], [13, 1], false);
console.log('Path to Key found! Step count:', pathToKey.length);

const pathToDoor = findPath([13, 1], [9, 8], false);
console.log('Path from Key to Door found! Step count:', pathToDoor.length);

const pathThroughDoorToThor = findPath([9, 8], [13, 8], true);
console.log('Path from Door to Thor found! Step count:', pathThroughDoorToThor.length);

assert.ok(pathToKey.length > 0, "Key must be reachable");
assert.ok(pathToDoor.length > 0, "Door must be reachable");
assert.ok(pathThroughDoorToThor.length > 0, "Thor must be reachable through unlocked door");

console.log("\n=== FULL MAZE PLAYTHROUGH MATHEMATICALLY VERIFIED ===");
