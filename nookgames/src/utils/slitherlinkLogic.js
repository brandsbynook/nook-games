// Slitherlink Logic & Verification Engine

export const SLITHERLINK_PUZZLES = {
  intro: {
    id: 'intro',
    name: 'Intro (4×4)',
    size: 4,
    clues: [
      [0,    null, null, null],
      [null, null, 0,    1   ],
      [0,    3,    null, 1   ],
      [null, null, null, null]
    ],
    solution: {
      hEdges: [
        ['none', 'none', 'line', 'line'],
        ['none', 'line', 'none', 'none'],
        ['none', 'line', 'none', 'none'],
        ['none', 'line', 'none', 'none'],
        ['none', 'line', 'line', 'line']
      ],
      vEdges: [
        ['none', 'none', 'line', 'none', 'line'],
        ['none', 'line', 'none', 'none', 'line'],
        ['none', 'none', 'line', 'none', 'line'],
        ['none', 'line', 'none', 'none', 'line']
      ]
    }
  },
  classic: {
    id: 'classic',
    name: 'Classic (5×5)',
    size: 5,
    clues: [
      [null, 2,    null, null, null],
      [null, 0,    2,    null, 0   ],
      [1,    null, 0,    null, null],
      [1,    1,    null, null, null],
      [null, null, null, 0,    null]
    ],
    solution: {
      hEdges: [
        ['line', 'line', 'none', 'none', 'none'],
        ['none', 'none', 'line', 'none', 'none'],
        ['none', 'none', 'none', 'line', 'none'],
        ['none', 'none', 'none', 'line', 'none'],
        ['none', 'line', 'line', 'none', 'none'],
        ['line', 'none', 'none', 'none', 'none']
      ],
      vEdges: [
        ['line', 'none', 'line', 'none', 'none', 'none'],
        ['line', 'none', 'none', 'line', 'none', 'none'],
        ['line', 'none', 'none', 'none', 'line', 'none'],
        ['line', 'none', 'none', 'line', 'none', 'none'],
        ['line', 'line', 'none', 'none', 'none', 'none']
      ]
    }
  },
  hard: {
    id: 'hard',
    name: 'Hard (6×6)',
    size: 6,
    clues: [
      [null, null, null, 2,    null, 3   ],
      [3,    3,    2,    1,    null, null],
      [2,    null, null, null, 1,    null],
      [null, null, null, 1,    1,    2   ],
      [1,    null, null, 0,    null, 3   ],
      [0,    null, null, 3,    null, null]
    ],
    solution: {
      hEdges: [
        ['none', 'none', 'none', 'none', 'line', 'line'],
        ['line', 'none', 'line', 'line', 'none', 'line'],
        ['none', 'line', 'none', 'none', 'none', 'none'],
        ['line', 'line', 'line', 'none', 'none', 'none'],
        ['none', 'line', 'line', 'none', 'none', 'line'],
        ['none', 'line', 'line', 'none', 'line', 'line'],
        ['none', 'none', 'none', 'line', 'none', 'none']
      ],
      vEdges: [
        ['none', 'none', 'none', 'none', 'line', 'none', 'line'],
        ['line', 'line', 'line', 'none', 'none', 'line', 'none'],
        ['line', 'none', 'none', 'none', 'none', 'line', 'none'],
        ['none', 'none', 'none', 'line', 'none', 'line', 'none'],
        ['none', 'line', 'none', 'none', 'none', 'none', 'line'],
        ['none', 'none', 'none', 'line', 'line', 'none', 'none']
      ]
    }
  }
};

/**
 * Creates empty edge state matrices for an N x N grid.
 * Horizontal: (N + 1) rows x N columns
 * Vertical: N rows x (N + 1) columns
 */
export function createEmptyEdges(N) {
  const hEdges = Array.from({ length: N + 1 }, () => Array(N).fill('none'));
  const vEdges = Array.from({ length: N }, () => Array(N + 1).fill('none'));
  return { hEdges, vEdges };
}

/**
 * Deep clones the edge state structure.
 */
export function cloneEdges(edges) {
  return {
    hEdges: edges.hEdges.map((row) => [...row]),
    vEdges: edges.vEdges.map((row) => [...row])
  };
}

/**
 * Cycles or toggles edge state:
 * Primary: 'none' -> 'line' -> 'cross' -> 'none'
 * Secondary (or direct cross mode): toggles 'cross' vs 'none'
 */
export function toggleEdge(edgeType, r, c, currentState, isSecondaryClick = false) {
  if (isSecondaryClick) {
    return currentState === 'cross' ? 'none' : 'cross';
  }

  // Primary cycle
  if (currentState === 'none') return 'line';
  if (currentState === 'line') return 'cross';
  return 'none';
}

/**
 * Counts active 'line' edges surrounding a given cell (r, c).
 */
export function getCellEdgeCount(hEdges, vEdges, r, c) {
  if (!hEdges || !vEdges) return 0;
  let count = 0;
  if (hEdges[r]?.[c] === 'line') count++;
  if (hEdges[r + 1]?.[c] === 'line') count++;
  if (vEdges[r]?.[c] === 'line') count++;
  if (vEdges[r]?.[c + 1] === 'line') count++;
  return count;
}

/**
 * Validates the current Slitherlink board state.
 * 1. Cell Clues Check: every numbered cell matches its active line count.
 * 2. Degree Check: every vertex/dot has degree 0 or 2.
 * 3. Single Loop Check: all active lines form a single unbroken cycle.
 * Returns { isWin, cellViolations, vertexViolations, activeEdgeCount }.
 */
export function validateSlitherlink(gridClues, hEdges, vEdges) {
  const emptyRes = {
    isWin: false,
    cellViolations: new Set(),
    vertexViolations: new Set(),
    activeEdgeCount: 0
  };

  if (!gridClues || !hEdges || !vEdges) return emptyRes;

  const N = gridClues.length;
  // Guard against mismatched dimensions
  if (hEdges.length !== N + 1 || vEdges.length !== N) {
    return emptyRes;
  }

  const cellViolations = new Set();
  const vertexViolations = new Set();

  let activeEdgeCount = 0;

  // 1. Cell Clues Check
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const clue = gridClues[r][c];
      const count = getCellEdgeCount(hEdges, vEdges, r, c);

      if (clue !== null && clue !== undefined) {
        if (count !== clue) {
          cellViolations.add(`${r}-${c}`);
        }
      }
    }
  }

  // 2. Vertex Degree Check
  const degrees = Array.from({ length: N + 1 }, () => Array(N + 1).fill(0));

  for (let r = 0; r <= N; r++) {
    for (let c = 0; c < N; c++) {
      if (hEdges[r]?.[c] === 'line') {
        degrees[r][c]++;
        degrees[r][c + 1]++;
        activeEdgeCount++;
      }
    }
  }

  for (let r = 0; r < N; r++) {
    for (let c = 0; c <= N; c++) {
      if (vEdges[r]?.[c] === 'line') {
        degrees[r][c]++;
        degrees[r + 1][c]++;
        activeEdgeCount++;
      }
    }
  }

  for (let r = 0; r <= N; r++) {
    for (let c = 0; c <= N; c++) {
      const deg = degrees[r][c];
      if (deg !== 0 && deg !== 2) {
        vertexViolations.add(`${r}-${c}`);
      }
    }
  }

  if (activeEdgeCount === 0 || vertexViolations.size > 0 || cellViolations.size > 0) {
    return {
      isWin: false,
      cellViolations,
      vertexViolations,
      activeEdgeCount
    };
  }

  // 3. Single Loop Check (Traversal)
  let start = null;
  for (let r = 0; r <= N; r++) {
    for (let c = 0; c <= N; c++) {
      if (degrees[r][c] === 2) {
        start = { r, c };
        break;
      }
    }
    if (start) break;
  }

  if (!start) {
    return { isWin: false, cellViolations, vertexViolations, activeEdgeCount };
  }

  let visitedEdges = 0;
  let curr = { ...start };
  let prev = null;

  while (true) {
    const neighbors = [];
    // Up
    if (curr.r > 0 && vEdges[curr.r - 1]?.[curr.c] === 'line') {
      neighbors.push({ r: curr.r - 1, c: curr.c });
    }
    // Down
    if (curr.r < N && vEdges[curr.r]?.[curr.c] === 'line') {
      neighbors.push({ r: curr.r + 1, c: curr.c });
    }
    // Left
    if (curr.c > 0 && hEdges[curr.r]?.[curr.c - 1] === 'line') {
      neighbors.push({ r: curr.r, c: curr.c - 1 });
    }
    // Right
    if (curr.c < N && hEdges[curr.r]?.[curr.c] === 'line') {
      neighbors.push({ r: curr.r, c: curr.c + 1 });
    }

    const next = neighbors.find((n) => !prev || n.r !== prev.r || n.c !== prev.c);
    if (!next) break;

    visitedEdges++;
    prev = curr;
    curr = next;

    if (curr.r === start.r && curr.c === start.c) {
      break;
    }
  }

  const isWin = visitedEdges === activeEdgeCount && visitedEdges >= 4;

  return {
    isWin,
    cellViolations,
    vertexViolations,
    activeEdgeCount
  };
}

/**
 * Returns a hint edge { type: 'h' | 'v', r, c, target: 'line' | 'cross' }
 * finding an edge that differs from the verified solution.
 */
export function getNextHint(gridClues, currentEdges, solutionEdges) {
  const N = gridClues.length;
  if (!solutionEdges) return null;

  // Check horizontal edges first
  for (let r = 0; r <= N; r++) {
    for (let c = 0; c < N; c++) {
      const sol = solutionEdges.hEdges[r][c];
      const cur = currentEdges.hEdges[r][c];
      if (sol === 'line' && cur !== 'line') {
        return { type: 'h', r, c, target: 'line' };
      }
      if (sol === 'none' && cur === 'line') {
        return { type: 'h', r, c, target: 'none' };
      }
    }
  }

  // Check vertical edges
  for (let r = 0; r < N; r++) {
    for (let c = 0; c <= N; c++) {
      const sol = solutionEdges.vEdges[r][c];
      const cur = currentEdges.vEdges[r][c];
      if (sol === 'line' && cur !== 'line') {
        return { type: 'v', r, c, target: 'line' };
      }
      if (sol === 'none' && cur === 'line') {
        return { type: 'v', r, c, target: 'none' };
      }
    }
  }

  return null;
}

/**
 * Applies random horizontal/vertical reflections to a Slitherlink puzzle,
 * preserving exact loop topology, edge connections, and clue counts.
 */
export function getTransformedSlitherlink(puzzle) {
  if (!puzzle) return puzzle;
  let clues = puzzle.clues.map((row) => [...row]);
  let hEdges = puzzle.solution.hEdges.map((row) => [...row]);
  let vEdges = puzzle.solution.vEdges.map((row) => [...row]);

  if (Math.random() < 0.5) {
    clues = clues.map((row) => [...row].reverse());
    hEdges = hEdges.map((row) => [...row].reverse());
    vEdges = vEdges.map((row) => [...row].reverse());
  }

  if (Math.random() < 0.5) {
    clues = [...clues].reverse();
    hEdges = [...hEdges].reverse();
    vEdges = [...vEdges].reverse();
  }

  return {
    ...puzzle,
    clues,
    solution: {
      hEdges,
      vEdges,
    },
  };
}

