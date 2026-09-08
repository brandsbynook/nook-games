/**
 * knightsTourLogic.js - Logic engine for Knight's Tour
 */

export const KNIGHT_DELTAS = [
  [-2, -1],
  [-2, 1],
  [-1, -2],
  [-1, 2],
  [1, -2],
  [1, 2],
  [2, -1],
  [2, 1],
];

export const BOARD_TIERS = {
  '5x5': { id: '5x5', label: '5×5', name: 'Intro', size: 5, totalSquares: 25 },
  '6x6': { id: '6x6', label: '6×6', name: 'Classic', size: 6, totalSquares: 36 },
  '8x8': { id: '8x8', label: '8×8', name: 'Master', size: 8, totalSquares: 64 },
};

/**
 * Creates an empty board of size N×N.
 * Each square: { r, c, stepNumber: null, isCurrent: false }
 */
export function initTour(size) {
  const board = [];
  for (let r = 0; r < size; r++) {
    const row = [];
    for (let c = 0; c < size; c++) {
      row.push({
        r,
        c,
        stepNumber: null,
        isCurrent: false,
      });
    }
    board.push(row);
  }
  return board;
}

/**
 * Returns unvisited target coordinates inside bounds for a knight at (r, c).
 * visitedSet: Set of 'r,c' strings
 */
export function getKnightMoves(r, c, size, visitedSet) {
  if (r === null || c === null || r === undefined || c === undefined) return [];
  const moves = [];

  for (const [dr, dc] of KNIGHT_DELTAS) {
    const nr = r + dr;
    const nc = c + dc;

    if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
      const key = `${nr},${nc}`;
      if (!visitedSet || !visitedSet.has(key)) {
        moves.push({ r: nr, c: nc });
      }
    }
  }

  return moves;
}

/**
 * Warnsdorff's heuristic:
 * Among all valid next jumps, pick the move that has the fewest subsequent available exits.
 * Returns { r, c } or null.
 */
export function warnsdorffHint(currentPos, size, visitedSet) {
  if (!currentPos) return null;

  const validMoves = getKnightMoves(currentPos.r, currentPos.c, size, visitedSet);
  if (validMoves.length === 0) return null;

  let bestMove = null;
  let minDegree = Infinity;

  // Clone visited set and simulate each move
  for (const move of validMoves) {
    const nextVisited = new Set(visitedSet);
    nextVisited.add(`${move.r},${move.c}`);

    const subsequentMoves = getKnightMoves(move.r, move.c, size, nextVisited);
    const degree = subsequentMoves.length;

    // If degree is 0, it is only acceptable if it completes the tour (last square)
    const isLastSquare = nextVisited.size === size * size;
    const effectiveDegree = degree === 0 && !isLastSquare ? 999 : degree;

    if (effectiveDegree < minDegree) {
      minDegree = effectiveDegree;
      bestMove = move;
    }
  }

  return bestMove;
}

/**
 * Evaluates game status: 'won' | 'trapped' | 'playing'
 */
export function checkGameStatus(visitedCount, totalSquares, validMovesCount) {
  if (visitedCount === totalSquares) {
    return 'won';
  }
  if (validMovesCount === 0 && visitedCount < totalSquares) {
    return 'trapped';
  }
  return 'playing';
}
