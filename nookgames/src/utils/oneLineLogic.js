/**
 * One Line (One Stroke / Eulerian Path) Game Engine & Puzzles
 * All puzzles are mathematically guaranteed to have an Eulerian path
 * (either 0 or 2 odd-degree vertices).
 */

export const DIFFICULTIES = {
  beginner: {
    id: 'beginner',
    label: 'Beginner',
    desc: '5–6 nodes with intuitive outlines.',
  },
  intermediate: {
    id: 'intermediate',
    label: 'Intermediate',
    desc: '7–9 nodes with intersecting diagonals.',
  },
  expert: {
    id: 'expert',
    label: 'Expert',
    desc: '10–12 nodes requiring strict edge planning.',
  },
};

/**
 * Normalizes an edge between node u and node v into a deterministic key.
 */
export function getEdgeKey(u, v) {
  const min = Math.min(u, v);
  const max = Math.max(u, v);
  return `${min}-${max}`;
}

export const PUZZLES = {
  beginner: [
    {
      id: 'b1',
      title: 'The House',
      difficulty: 'beginner',
      nodes: [
        { id: 0, x: 50, y: 15 },
        { id: 1, x: 20, y: 45 },
        { id: 2, x: 80, y: 45 },
        { id: 3, x: 20, y: 85 },
        { id: 4, x: 80, y: 85 },
      ],
      edges: [
        [0, 1],
        [0, 2],
        [1, 2],
        [1, 3],
        [2, 4],
        [3, 4],
        [1, 4],
        [2, 3],
      ],
    },
    {
      id: 'b2',
      title: 'The Envelope',
      difficulty: 'beginner',
      nodes: [
        { id: 0, x: 50, y: 15 },
        { id: 1, x: 20, y: 40 },
        { id: 2, x: 80, y: 40 },
        { id: 3, x: 50, y: 62 },
        { id: 4, x: 20, y: 85 },
        { id: 5, x: 80, y: 85 },
      ],
      edges: [
        [0, 1],
        [0, 2],
        [1, 2],
        [1, 4],
        [2, 5],
        [4, 5],
        [1, 3],
        [2, 3],
        [4, 3],
        [5, 3],
      ],
    },
    {
      id: 'b3',
      title: 'The Star',
      difficulty: 'beginner',
      nodes: [
        { id: 0, x: 50, y: 12 },
        { id: 1, x: 86, y: 38 },
        { id: 2, x: 72, y: 85 },
        { id: 3, x: 28, y: 85 },
        { id: 4, x: 14, y: 38 },
      ],
      edges: [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 0],
        [0, 2],
        [2, 4],
        [4, 1],
        [1, 3],
        [3, 0],
      ],
    },
  ],
  intermediate: [
    {
      id: 'i1',
      title: 'Double Diamond',
      difficulty: 'intermediate',
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
        [0, 1],
        [0, 2],
        [1, 2],
        [1, 3],
        [2, 3],
        [6, 4],
        [6, 5],
        [4, 5],
        [4, 3],
        [5, 3],
        [1, 4],
        [2, 5],
      ],
    },
    {
      id: 'i2',
      title: 'Criss-Cross Grid',
      difficulty: 'intermediate',
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
        [0, 1],
        [1, 2],
        [3, 4],
        [4, 5],
        [6, 7],
        [7, 8],
        [0, 3],
        [3, 6],
        [1, 4],
        [4, 7],
        [2, 5],
        [5, 8],
        [0, 4],
        [1, 3],
        [4, 8],
        [5, 7],
      ],
    },
  ],
  expert: [
    {
      id: 'e1',
      title: 'Hexagram Citadel',
      difficulty: 'expert',
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
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 5],
        [5, 0],
        [6, 7],
        [7, 8],
        [8, 9],
        [9, 10],
        [10, 11],
        [11, 6],
        [0, 6],
        [1, 7],
        [2, 8],
        [3, 9],
        [4, 10],
        [5, 11],
        [0, 7],
        [1, 8],
        [2, 9],
        [3, 10],
        [4, 11],
        [5, 6],
      ],
    },
    {
      id: 'e2',
      title: 'Decagon Web',
      difficulty: 'expert',
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
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 0],
        [5, 6],
        [6, 7],
        [7, 8],
        [8, 9],
        [9, 5],
        [0, 5],
        [1, 6],
        [2, 7],
        [3, 8],
        [4, 9],
        [0, 6],
        [1, 7],
        [2, 8],
        [3, 9],
        [4, 5],
      ],
    },
  ],
};

/**
 * Returns the puzzle for a given difficulty and index.
 */
export function getPuzzle(difficulty, index = 0) {
  const list = PUZZLES[difficulty] || PUZZLES.beginner;
  const safeIndex = Math.max(0, Math.min(index, list.length - 1));
  return list[safeIndex];
}

/**
 * Returns the number of puzzles available in a difficulty tier.
 */
export function getPuzzleCount(difficulty) {
  return (PUZZLES[difficulty] || []).length;
}

/**
 * Checks if an edge exists between u and v in the puzzle.
 */
export function hasEdge(u, v, puzzle) {
  const key = getEdgeKey(u, v);
  return puzzle.edges.some(([from, to]) => getEdgeKey(from, to) === key);
}

/**
 * Checks if moving from currentNodeId to targetNodeId is valid:
 * 1. An edge exists in the puzzle.
 * 2. That edge has not already been visited.
 */
export function canMove(currentNodeId, targetNodeId, visitedEdges, puzzle) {
  if (currentNodeId === targetNodeId) return false;
  if (!hasEdge(currentNodeId, targetNodeId, puzzle)) return false;
  const key = getEdgeKey(currentNodeId, targetNodeId);
  return !visitedEdges.has(key);
}

/**
 * Returns an array of node IDs that can be directly visited next from currentNodeId.
 */
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

/**
 * Returns true if all edges of the puzzle have been traversed.
 */
export function isCompleted(visitedEdges, puzzle) {
  return visitedEdges.size === puzzle.edges.length;
}

/**
 * Undoes the last move, returning updated { currentPath, visitedEdges }.
 */
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

/**
 * Diagnostic function to mathematically verify Eulerian path solvability.
 * Returns { isEulerian, oddDegreesCount, oddNodes, isConnected }
 */
export function validateEulerian(puzzle) {
  const degrees = {};
  puzzle.nodes.forEach((n) => (degrees[n.id] = 0));

  puzzle.edges.forEach(([u, v]) => {
    degrees[u] = (degrees[u] || 0) + 1;
    degrees[v] = (degrees[v] || 0) + 1;
  });

  const oddNodes = Object.entries(degrees)
    .filter(([, deg]) => deg % 2 !== 0)
    .map(([id]) => Number(id));

  // Verify connectedness using BFS from node 0
  const adj = {};
  puzzle.nodes.forEach((n) => (adj[n.id] = []));
  puzzle.edges.forEach(([u, v]) => {
    adj[u].push(v);
    adj[v].push(u);
  });

  const visited = new Set();
  const queue = [puzzle.nodes[0].id];
  visited.add(puzzle.nodes[0].id);

  while (queue.length > 0) {
    const curr = queue.shift();
    adj[curr].forEach((next) => {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    });
  }

  const isConnected = visited.size === puzzle.nodes.length;
  const isEulerian = isConnected && (oddNodes.length === 0 || oddNodes.length === 2);

  return {
    isEulerian,
    oddDegreesCount: oddNodes.length,
    oddNodes,
    isConnected,
    totalEdges: puzzle.edges.length,
  };
}
