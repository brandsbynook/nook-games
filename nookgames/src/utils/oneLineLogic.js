/**
 * One Line (Eulerian Path) Engine & Handcrafted Geometries
 * Mathematically proven: graphs have exactly 0 or 2 odd-degree vertices.
 */

export const DIFFICULTIES = {
  gentle: {
    id: 'gentle',
    label: 'Gentle',
    subtitle: '5–6 Nodes',
  },
  standard: {
    id: 'standard',
    label: 'Standard',
    subtitle: '7–9 Nodes',
  },
  deep: {
    id: 'deep',
    label: 'Deep',
    subtitle: '10–12 Nodes',
  },
};

export function getEdgeKey(u, v) {
  const min = Math.min(u, v);
  const max = Math.max(u, v);
  return `${min}-${max}`;
}

export const PUZZLES = {
  gentle: [
    {
      id: 'g1',
      title: 'The House',
      difficulty: 'gentle',
      nodes: [
        { id: 0, x: 50, y: 15 },
        { id: 1, x: 20, y: 45 },
        { id: 2, x: 80, y: 45 },
        { id: 3, x: 20, y: 85 },
        { id: 4, x: 80, y: 85 },
      ],
      edges: [
        [0, 1], [0, 2],
        [1, 2],
        [1, 3], [2, 4],
        [3, 4],
        [1, 4], [2, 3],
      ],
    },
    {
      id: 'g2',
      title: 'The Envelope',
      difficulty: 'gentle',
      nodes: [
        { id: 0, x: 50, y: 15 },
        { id: 1, x: 20, y: 40 },
        { id: 2, x: 80, y: 40 },
        { id: 3, x: 50, y: 62 },
        { id: 4, x: 20, y: 85 },
        { id: 5, x: 80, y: 85 },
      ],
      edges: [
        [0, 1], [0, 2],
        [1, 2],
        [1, 4], [2, 5],
        [4, 5],
        [1, 3], [2, 3],
        [4, 3], [5, 3],
      ],
    },
    {
      id: 'g3',
      title: 'Pentagram Star',
      difficulty: 'gentle',
      nodes: [
        { id: 0, x: 50, y: 12 },
        { id: 1, x: 86, y: 38 },
        { id: 2, x: 72, y: 85 },
        { id: 3, x: 28, y: 85 },
        { id: 4, x: 14, y: 38 },
      ],
      edges: [
        [0, 1], [1, 2], [2, 3], [3, 4], [4, 0],
        [0, 2], [2, 4], [4, 1], [1, 3], [3, 0],
      ],
    },
  ],
  standard: [
    {
      id: 's1',
      title: 'Double Diamond',
      difficulty: 'standard',
      nodes: [
        { id: 0, x: 50, y: 10 },
        { id: 1, x: 25, y: 35 },
        { id: 2, x: 75, y: 35 },
        { id: 3, x: 50, y: 50 },
        { id: 4, x: 25, y: 65 },
        { id: 5, x: 75, y: 65 },
        { id: 6, x: 50, y: 90 },
      ],
      edges: [
        [0, 1], [0, 2],
        [1, 2],
        [1, 3], [2, 3],
        [6, 4], [6, 5],
        [4, 5],
        [4, 3], [5, 3],
        [1, 4], [2, 5],
      ],
    },
    {
      id: 's2',
      title: 'Criss-Cross Lattice',
      difficulty: 'standard',
      nodes: [
        { id: 0, x: 20, y: 20 },
        { id: 1, x: 50, y: 20 },
        { id: 2, x: 80, y: 20 },
        { id: 3, x: 20, y: 50 },
        { id: 4, x: 50, y: 50 },
        { id: 5, x: 80, y: 50 },
        { id: 6, x: 20, y: 80 },
        { id: 7, x: 50, y: 80 },
        { id: 8, x: 80, y: 80 },
      ],
      edges: [
        [0, 1], [1, 2],
        [3, 4], [4, 5],
        [6, 7], [7, 8],
        [0, 3], [3, 6],
        [1, 4], [4, 7],
        [2, 5], [5, 8],
        [0, 4], [1, 3],
        [4, 8], [5, 7],
      ],
    },
    {
      id: 's3',
      title: 'Shield Gate',
      difficulty: 'standard',
      nodes: [
        { id: 0, x: 50, y: 15 },
        { id: 1, x: 20, y: 35 },
        { id: 2, x: 80, y: 35 },
        { id: 3, x: 50, y: 45 },
        { id: 4, x: 20, y: 75 },
        { id: 5, x: 80, y: 75 },
        { id: 6, x: 50, y: 92 },
      ],
      edges: [
        [0, 1], [0, 2], [1, 2],
        [1, 3], [2, 3],
        [1, 4], [2, 5],
        [4, 6], [5, 6],
        [3, 4], [3, 5],
      ],
    },
  ],
  deep: [
    {
      id: 'd1',
      title: 'Hexagram Citadel',
      difficulty: 'deep',
      nodes: [
        { id: 0, x: 50, y: 10 },
        { id: 1, x: 85, y: 30 },
        { id: 2, x: 85, y: 70 },
        { id: 3, x: 50, y: 90 },
        { id: 4, x: 15, y: 70 },
        { id: 5, x: 15, y: 30 },
        { id: 6, x: 50, y: 30 },
        { id: 7, x: 67, y: 40 },
        { id: 8, x: 67, y: 60 },
        { id: 9, x: 50, y: 70 },
        { id: 10, x: 33, y: 60 },
        { id: 11, x: 33, y: 40 },
      ],
      edges: [
        [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0],
        [6, 7], [7, 8], [8, 9], [9, 10], [10, 11], [11, 6],
        [0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11],
        [0, 7], [1, 8], [2, 9], [3, 10], [4, 11], [5, 6],
      ],
    },
    {
      id: 'd2',
      title: 'Decagon Web',
      difficulty: 'deep',
      nodes: [
        { id: 0, x: 50, y: 10 },
        { id: 1, x: 88, y: 38 },
        { id: 2, x: 74, y: 82 },
        { id: 3, x: 26, y: 82 },
        { id: 4, x: 12, y: 38 },
        { id: 5, x: 50, y: 30 },
        { id: 6, x: 69, y: 44 },
        { id: 7, x: 62, y: 66 },
        { id: 8, x: 38, y: 66 },
        { id: 9, x: 31, y: 44 },
      ],
      edges: [
        [0, 1], [1, 2], [2, 3], [3, 4], [4, 0],
        [5, 6], [6, 7], [7, 8], [8, 9], [9, 5],
        [0, 5], [1, 6], [2, 7], [3, 8], [4, 9],
        [0, 6], [1, 7], [2, 8], [3, 9], [4, 5],
      ],
    },
    {
      id: 'd3',
      title: 'The Great Labyrinth',
      difficulty: 'deep',
      nodes: [
        { id: 0, x: 20, y: 15 },
        { id: 1, x: 50, y: 15 },
        { id: 2, x: 80, y: 15 },
        { id: 3, x: 35, y: 40 },
        { id: 4, x: 65, y: 40 },
        { id: 5, x: 20, y: 60 },
        { id: 6, x: 50, y: 60 },
        { id: 7, x: 80, y: 60 },
        { id: 8, x: 50, y: 88 },
      ],
      edges: [
        [0, 1], [1, 2],
        [0, 3], [2, 4],
        [3, 4],
        [3, 6], [4, 6],
        [0, 5], [2, 7],
        [5, 6], [6, 7],
        [5, 8], [7, 8],
        [1, 6], [6, 8],
      ],
    },
  ],
};

export function getPuzzle(difficulty, index = 0) {
  const tierKey = (difficulty === 'beginner' || difficulty === 'gentle')
    ? 'gentle'
    : (difficulty === 'deep' || difficulty === 'expert' || difficulty === 'master')
      ? 'deep'
      : 'standard';

  const list = PUZZLES[tierKey] || PUZZLES.gentle;
  const safeIndex = Math.max(0, Math.min(index, list.length - 1));
  return list[safeIndex];
}

export function getPuzzleCount(difficulty) {
  const tierKey = (difficulty === 'beginner' || difficulty === 'gentle')
    ? 'gentle'
    : (difficulty === 'deep' || difficulty === 'expert' || difficulty === 'master')
      ? 'deep'
      : 'standard';
  return (PUZZLES[tierKey] || []).length;
}

export function hasEdge(u, v, puzzle) {
  const key = getEdgeKey(u, v);
  return puzzle.edges.some(([from, to]) => getEdgeKey(from, to) === key);
}

export function canMove(currentNodeId, targetNodeId, visitedEdges, puzzle) {
  if (currentNodeId === targetNodeId) return false;
  if (!hasEdge(currentNodeId, targetNodeId, puzzle)) return false;
  const key = getEdgeKey(currentNodeId, targetNodeId);
  return !visitedEdges.has(key);
}

export function getAvailableNeighbors(currentNodeId, visitedEdges, puzzle) {
  if (currentNodeId === null || currentNodeId === undefined) return [];
  const neighbors = [];
  puzzle.nodes.forEach((node) => {
    if (canMove(currentNodeId, node.id, visitedEdges, puzzle)) {
      neighbors.push(node.id);
    }
  });
  return neighbors;
}

export function isCompleted(visitedEdges, puzzle) {
  return visitedEdges.size === puzzle.edges.length;
}

export function undoLastMove(currentPath, visitedEdges) {
  if (currentPath.length <= 1) {
    return {
      currentPath: [],
      visitedEdges: new Set(),
    };
  }

  const lastNode = currentPath[currentPath.length - 1];
  const prevNode = currentPath[currentPath.length - 2];
  const edgeKey = getEdgeKey(prevNode, lastNode);

  const nextVisited = new Set(visitedEdges);
  nextVisited.delete(edgeKey);

  return {
    currentPath: currentPath.slice(0, -1),
    visitedEdges: nextVisited,
  };
}