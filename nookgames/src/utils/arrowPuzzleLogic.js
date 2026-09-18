/**
 * arrowPuzzleLogic.js
 * High-friction entangled orthogonal arrow maze generator.
 */

export const DIRECTIONS = {
  UP: { dr: -1, dc: 0, name: 'UP', angle: 270 },
  DOWN: { dr: 1, dc: 0, name: 'DOWN', angle: 90 },
  LEFT: { dr: 0, dc: -1, name: 'LEFT', angle: 180 },
  RIGHT: { dr: 0, dc: 1, name: 'RIGHT', angle: 0 },
};

export const DIFFICULTIES = ['gentle', 'standard', 'deep'];

export function cellKey(r, c) {
  return `${r},${c}`;
}

export function getArrowVectorHeading(pathOrArrow) {
  const points = Array.isArray(pathOrArrow)
    ? pathOrArrow
    : (pathOrArrow?.points || pathOrArrow?.path || []);
  if (!points || points.length < 2) {
    return { angle: 0, dir: 'RIGHT', deltaR: 0, deltaC: 1 };
  }
  const prev = points[points.length - 2];
  const head = points[points.length - 1];
  const deltaR = head[0] - prev[0];
  const deltaC = head[1] - prev[1];

  if (deltaC > 0) return { angle: 0, dir: 'RIGHT', deltaR: 0, deltaC: 1 };
  if (deltaR > 0) return { angle: 90, dir: 'DOWN', deltaR: 1, deltaC: 0 };
  if (deltaC < 0) return { angle: 180, dir: 'LEFT', deltaR: 0, deltaC: -1 };
  if (deltaR < 0) return { angle: 270, dir: 'UP', deltaR: -1, deltaC: 0 };

  return { angle: 0, dir: 'RIGHT', deltaR: 0, deltaC: 1 };
}

export function getArrowOccupiedCells(arrow) {
  const cells = [];
  const visited = new Set();

  const addCell = (r, c) => {
    const key = cellKey(r, c);
    if (!visited.has(key)) {
      visited.add(key);
      cells.push([r, c]);
    }
  };

  const path = arrow.points || arrow.path;
  if (!path || path.length === 0) return cells;

  addCell(path[0][0], path[0][1]);

  for (let i = 1; i < path.length; i++) {
    const [r1, c1] = path[i - 1];
    const [r2, c2] = path[i];

    const dr = Math.sign(r2 - r1);
    const dc = Math.sign(c2 - c1);

    let currR = r1;
    let currC = c1;

    while (currR !== r2 || currC !== c2) {
      if (dr !== 0) currR += dr;
      if (dc !== 0) currC += dc;
      addCell(currR, currC);
    }
  }

  return cells;
}

export function buildOccupiedCellMap(remainingArrows) {
  const cellMap = new Map();
  for (const arrow of remainingArrows) {
    const occupied = getArrowOccupiedCells(arrow);
    for (const [r, c] of occupied) {
      cellMap.set(cellKey(r, c), arrow.id);
    }
  }
  return cellMap;
}

export function checkArrowBlocked(arrowId, remainingArrows, gridBounds) {
  const targetArrow = remainingArrows.find((a) => a.id === arrowId);
  if (!targetArrow) return { isBlocked: true, blockerId: null };

  const cellMap = buildOccupiedCellMap(remainingArrows);
  const heading = getArrowVectorHeading(targetArrow);

  const head = targetArrow.head || targetArrow.path[targetArrow.path.length - 1];
  let currR = head[0] + heading.deltaR;
  let currC = head[1] + heading.deltaC;

  while (
    currR >= 0 &&
    currR < gridBounds.rows &&
    currC >= 0 &&
    currC < gridBounds.cols
  ) {
    const occupyingId = cellMap.get(cellKey(currR, currC));
    if (occupyingId && occupyingId !== arrowId) {
      return { isBlocked: true, blockerId: occupyingId };
    }
    currR += heading.deltaR;
    currC += heading.deltaC;
  }

  return { isBlocked: false, blockerId: null };
}

export function isArrowBlocked(arrowId, remainingArrows, gridBounds) {
  return checkArrowBlocked(arrowId, remainingArrows, gridBounds).isBlocked;
}

export function getAvailableArrowIds(remainingArrows, gridBounds) {
  const cellMap = buildOccupiedCellMap(remainingArrows);
  const unblocked = [];

  for (const arrow of remainingArrows) {
    const heading = getArrowVectorHeading(arrow);
    const head = arrow.head || arrow.path[arrow.path.length - 1];

    let blocked = false;
    let currR = head[0] + heading.deltaR;
    let currC = head[1] + heading.deltaC;

    while (
      currR >= 0 &&
      currR < gridBounds.rows &&
      currC >= 0 &&
      currC < gridBounds.cols
    ) {
      const occId = cellMap.get(cellKey(currR, currC));
      if (occId && occId !== arrow.id) {
        blocked = true;
        break;
      }
      currR += heading.deltaR;
      currC += heading.deltaC;
    }

    if (!blocked) {
      unblocked.push(arrow.id);
    }
  }

  return unblocked;
}

export function removeArrow(arrowId, remainingArrows, gridBounds) {
  if (isArrowBlocked(arrowId, remainingArrows, gridBounds)) {
    return { success: false, nextArrows: remainingArrows, removedArrow: null, isWon: false };
  }

  const removedArrow = remainingArrows.find((a) => a.id === arrowId);
  const nextArrows = remainingArrows.filter((a) => a.id !== arrowId);
  const isWon = nextArrows.length === 0;

  return {
    success: true,
    nextArrows,
    removedArrow,
    isWon,
  };
}

export function undoMove(history, remainingArrows) {
  if (!history || history.length === 0) {
    return { nextArrows: remainingArrows, nextHistory: history };
  }

  const nextHistory = [...history];
  const lastArrow = nextHistory.pop();
  const nextArrows = [...remainingArrows, lastArrow];

  return {
    nextArrows,
    nextHistory,
  };
}

export const PUZZLE_DATA = {
  gentle: [
    {
      id: 'g1',
      title: 'Perimeter Gate',
      gridBounds: { rows: 5, cols: 5 },
      arrows: [
        { id: 'a1', path: [[1, 1], [1, 2], [1, 3]], head: [1, 3], dir: 'RIGHT' },
        { id: 'a2', path: [[2, 3], [3, 3], [4, 3]], head: [4, 3], dir: 'DOWN' },
        { id: 'a3', path: [[3, 2], [3, 1], [3, 0]], head: [3, 0], dir: 'LEFT' },
        { id: 'a4', path: [[2, 1], [1, 1], [0, 1]], head: [0, 1], dir: 'UP' },
        { id: 'a5', path: [[2, 2], [2, 4]], head: [2, 4], dir: 'RIGHT' },
      ],
    },
    {
      id: 'g2',
      title: 'Four Winds',
      gridBounds: { rows: 5, cols: 5 },
      arrows: [
        { id: 'b1', path: [[0, 2], [1, 2], [2, 2]], head: [2, 2], dir: 'DOWN' },
        { id: 'b2', path: [[2, 4], [2, 3]], head: [2, 3], dir: 'LEFT' },
        { id: 'b3', path: [[4, 2], [3, 2]], head: [3, 2], dir: 'UP' },
        { id: 'b4', path: [[2, 0], [2, 1]], head: [2, 1], dir: 'RIGHT' },
        { id: 'b5', path: [[1, 4], [0, 4]], head: [0, 4], dir: 'UP' },
        { id: 'b6', path: [[3, 0], [4, 0]], head: [4, 0], dir: 'DOWN' },
      ],
    },
  ],
  standard: [
    {
      id: 's1',
      title: 'Bamboo Helix',
      gridBounds: { rows: 6, cols: 6 },
      arrows: [
        { id: 'c1', path: [[1, 1], [1, 4]], head: [1, 4], dir: 'RIGHT' },
        { id: 'c2', path: [[1, 4], [4, 4]], head: [4, 4], dir: 'DOWN' },
        { id: 'c3', path: [[4, 4], [4, 1]], head: [4, 1], dir: 'LEFT' },
        { id: 'c4', path: [[4, 1], [2, 1]], head: [2, 1], dir: 'UP' },
        { id: 'c5', path: [[2, 2], [2, 3]], head: [2, 3], dir: 'RIGHT' },
        { id: 'c6', path: [[3, 3], [3, 2]], head: [3, 2], dir: 'LEFT' },
        { id: 'c7', path: [[0, 5], [5, 5]], head: [5, 5], dir: 'DOWN' },
        { id: 'c8', path: [[5, 0], [0, 0]], head: [0, 0], dir: 'UP' },
      ],
    },
    {
      id: 's2',
      title: 'Stone Crossing',
      gridBounds: { rows: 6, cols: 6 },
      arrows: [
        { id: 'd1', path: [[2, 0], [2, 2]], head: [2, 2], dir: 'RIGHT' },
        { id: 'd2', path: [[0, 2], [1, 2]], head: [1, 2], dir: 'DOWN' },
        { id: 'd3', path: [[3, 5], [3, 3]], head: [3, 3], dir: 'LEFT' },
        { id: 'd4', path: [[5, 3], [4, 3]], head: [4, 3], dir: 'UP' },
        { id: 'd5', path: [[1, 4], [1, 5]], head: [1, 5], dir: 'RIGHT' },
        { id: 'd6', path: [[4, 1], [4, 0]], head: [4, 0], dir: 'LEFT' },
        { id: 'd7', path: [[0, 3], [0, 1]], head: [0, 1], dir: 'LEFT' },
        { id: 'd8', path: [[5, 2], [5, 4]], head: [5, 4], dir: 'RIGHT' },
      ],
    },
  ],
  deep: [
    {
      id: 'e1',
      title: 'Dragon Sanctum',
      gridBounds: { rows: 7, cols: 7 },
      arrows: [
        { id: 'f1', path: [[1, 1], [1, 5]], head: [1, 5], dir: 'RIGHT' },
        { id: 'f2', path: [[2, 5], [5, 5]], head: [5, 5], dir: 'DOWN' },
        { id: 'f3', path: [[5, 4], [5, 1]], head: [5, 1], dir: 'LEFT' },
        { id: 'f4', path: [[4, 1], [2, 1]], head: [2, 1], dir: 'UP' },
        { id: 'f5', path: [[2, 2], [2, 4]], head: [2, 4], dir: 'RIGHT' },
        { id: 'f6', path: [[3, 4], [4, 4]], head: [4, 4], dir: 'DOWN' },
        { id: 'f7', path: [[4, 3], [4, 2]], head: [4, 2], dir: 'LEFT' },
        { id: 'f8', path: [[3, 2], [3, 3]], head: [3, 3], dir: 'RIGHT' },
        { id: 'f9', path: [[0, 6], [6, 6]], head: [6, 6], dir: 'DOWN' },
        { id: 'f10', path: [[6, 0], [0, 0]], head: [0, 0], dir: 'UP' },
        { id: 'f11', path: [[0, 1], [0, 5]], head: [0, 5], dir: 'RIGHT' },
        { id: 'f12', path: [[6, 5], [6, 1]], head: [6, 1], dir: 'LEFT' },
      ],
    },
  ],
};

export function getPuzzle(difficulty, index = 0) {
  const tierKey = (difficulty === 'beginner' || difficulty === 'gentle')
    ? 'gentle'
    : (difficulty === 'expert' || difficulty === 'deep')
      ? 'deep'
      : 'standard';

  const list = PUZZLE_DATA[tierKey] || PUZZLE_DATA.gentle;
  const safeIdx = Math.max(0, Math.min(index, list.length - 1));
  return list[safeIdx];
}

export function getPuzzleCount(difficulty) {
  const tierKey = (difficulty === 'beginner' || difficulty === 'gentle')
    ? 'gentle'
    : (difficulty === 'expert' || difficulty === 'deep')
      ? 'deep'
      : 'standard';
  return (PUZZLE_DATA[tierKey] || []).length;
}