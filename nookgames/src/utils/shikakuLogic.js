/**
 * shikakuLogic.js — Core Game Logic & Curated Puzzles for Shikaku (Logic Suite)
 *
 * Rules:
 * - Divide the grid into rectangular rooms such that each room contains exactly
 *   one number clue, and the area of the room equals that number.
 * - Every cell on the grid must belong to a room, and rooms cannot overlap.
 */

export const SHIKAKU_PUZZLES = {
  easy: {
    id: 'easy',
    title: 'Easy',
    gridSize: 6,
    clues: [
      { r: 0, c: 0, val: 6 },
      { r: 0, c: 3, val: 4 },
      { r: 1, c: 5, val: 8 },
      { r: 3, c: 1, val: 6 },
      { r: 4, c: 4, val: 6 },
      { r: 5, c: 0, val: 6 },
    ],
    solution: [
      { id: 'sol-e-1', r1: 0, r2: 1, c1: 0, c2: 2, val: 6, clue: { r: 0, c: 0, val: 6 } },
      { id: 'sol-e-2', r1: 0, r2: 3, c1: 3, c2: 3, val: 4, clue: { r: 0, c: 3, val: 4 } },
      { id: 'sol-e-3', r1: 0, r2: 3, c1: 4, c2: 5, val: 8, clue: { r: 1, c: 5, val: 8 } },
      { id: 'sol-e-4', r1: 2, r2: 3, c1: 0, c2: 2, val: 6, clue: { r: 3, c: 1, val: 6 } },
      { id: 'sol-e-5', r1: 4, r2: 5, c1: 0, c2: 2, val: 6, clue: { r: 5, c: 0, val: 6 } },
      { id: 'sol-e-6', r1: 4, r2: 5, c1: 3, c2: 5, val: 6, clue: { r: 4, c: 4, val: 6 } },
    ],
  },
  medium: {
    id: 'medium',
    title: 'Medium',
    gridSize: 8,
    clues: [
      { r: 1, c: 1, val: 12 },
      { r: 0, c: 3, val: 8 },
      { r: 0, c: 6, val: 6 },
      { r: 3, c: 7, val: 6 },
      { r: 4, c: 0, val: 8 },
      { r: 5, c: 4, val: 4 },
      { r: 4, c: 7, val: 4 },
      { r: 6, c: 1, val: 3 },
      { r: 7, c: 2, val: 3 },
      { r: 6, c: 3, val: 2 },
      { r: 7, c: 4, val: 2 },
      { r: 7, c: 6, val: 6 },
    ],
    solution: [
      { id: 'sol-m-1', r1: 0, r2: 3, c1: 0, c2: 2, val: 12, clue: { r: 1, c: 1, val: 12 } },
      { id: 'sol-m-2', r1: 0, r2: 3, c1: 3, c2: 4, val: 8, clue: { r: 0, c: 3, val: 8 } },
      { id: 'sol-m-3', r1: 0, r2: 1, c1: 5, c2: 7, val: 6, clue: { r: 0, c: 6, val: 6 } },
      { id: 'sol-m-4', r1: 2, r2: 3, c1: 5, c2: 7, val: 6, clue: { r: 3, c: 7, val: 6 } },
      { id: 'sol-m-5', r1: 4, r2: 5, c1: 0, c2: 3, val: 8, clue: { r: 4, c: 0, val: 8 } },
      { id: 'sol-m-6', r1: 4, r2: 5, c1: 4, c2: 5, val: 4, clue: { r: 5, c: 4, val: 4 } },
      { id: 'sol-m-7', r1: 4, r2: 5, c1: 6, c2: 7, val: 4, clue: { r: 4, c: 7, val: 4 } },
      { id: 'sol-m-8', r1: 6, r2: 6, c1: 0, c2: 2, val: 3, clue: { r: 6, c: 1, val: 3 } },
      { id: 'sol-m-9', r1: 7, r2: 7, c1: 0, c2: 2, val: 3, clue: { r: 7, c: 2, val: 3 } },
      { id: 'sol-m-10', r1: 6, r2: 6, c1: 3, c2: 4, val: 2, clue: { r: 6, c: 3, val: 2 } },
      { id: 'sol-m-11', r1: 7, r2: 7, c1: 3, c2: 4, val: 2, clue: { r: 7, c: 4, val: 2 } },
      { id: 'sol-m-12', r1: 6, r2: 7, c1: 5, c2: 7, val: 6, clue: { r: 7, c: 6, val: 6 } },
    ],
  },
  hard: {
    id: 'hard',
    title: 'Hard',
    gridSize: 10,
    clues: [
      { r: 0, c: 1, val: 12 },
      { r: 0, c: 4, val: 8 },
      { r: 1, c: 8, val: 6 },
      { r: 3, c: 3, val: 6 },
      { r: 4, c: 6, val: 8 },
      { r: 2, c: 9, val: 6 },
      { r: 5, c: 7, val: 6 },
      { r: 6, c: 1, val: 9 },
      { r: 5, c: 3, val: 4 },
      { r: 7, c: 8, val: 10 },
      { r: 8, c: 0, val: 9 },
      { r: 8, c: 4, val: 4 },
      { r: 9, c: 3, val: 2 },
      { r: 9, c: 6, val: 6 },
      { r: 9, c: 9, val: 4 },
    ],
    solution: [
      { id: 'sol-h-1', r1: 0, r2: 3, c1: 0, c2: 2, val: 12, clue: { r: 0, c: 1, val: 12 } },
      { id: 'sol-h-2', r1: 0, r2: 1, c1: 3, c2: 6, val: 8, clue: { r: 0, c: 4, val: 8 } },
      { id: 'sol-h-3', r1: 0, r2: 1, c1: 7, c2: 9, val: 6, clue: { r: 1, c: 8, val: 6 } },
      { id: 'sol-h-4', r1: 2, r2: 4, c1: 3, c2: 4, val: 6, clue: { r: 3, c: 3, val: 6 } },
      { id: 'sol-h-5', r1: 2, r2: 5, c1: 5, c2: 6, val: 8, clue: { r: 4, c: 6, val: 8 } },
      { id: 'sol-h-6', r1: 2, r2: 3, c1: 7, c2: 9, val: 6, clue: { r: 2, c: 9, val: 6 } },
      { id: 'sol-h-7', r1: 4, r2: 5, c1: 7, c2: 9, val: 6, clue: { r: 5, c: 7, val: 6 } },
      { id: 'sol-h-8', r1: 4, r2: 6, c1: 0, c2: 2, val: 9, clue: { r: 6, c: 1, val: 9 } },
      { id: 'sol-h-9', r1: 5, r2: 6, c1: 3, c2: 4, val: 4, clue: { r: 5, c: 3, val: 4 } },
      { id: 'sol-h-10', r1: 6, r2: 7, c1: 5, c2: 9, val: 10, clue: { r: 7, c: 8, val: 10 } },
      { id: 'sol-h-11', r1: 7, r2: 9, c1: 0, c2: 2, val: 9, clue: { r: 8, c: 0, val: 9 } },
      { id: 'sol-h-12', r1: 7, r2: 8, c1: 3, c2: 4, val: 4, clue: { r: 8, c: 4, val: 4 } },
      { id: 'sol-h-13', r1: 9, r2: 9, c1: 3, c2: 4, val: 2, clue: { r: 9, c: 3, val: 2 } },
      { id: 'sol-h-14', r1: 8, r2: 9, c1: 5, c2: 7, val: 6, clue: { r: 9, c: 6, val: 6 } },
      { id: 'sol-h-15', r1: 8, r2: 9, c1: 8, c2: 9, val: 4, clue: { r: 9, c: 9, val: 4 } },
    ],
  },
};

/**
 * Computes bounding rectangle coordinates for two cell points.
 * @param {{ r: number, c: number }} p1
 * @param {{ r: number, c: number }} p2
 * @returns {{ r1: number, r2: number, c1: number, c2: number }}
 */
export function getBounds(p1, p2) {
  if (!p1 || !p2) return null;
  return {
    r1: Math.min(p1.r, p2.r),
    r2: Math.max(p1.r, p2.r),
    c1: Math.min(p1.c, p2.c),
    c2: Math.max(p1.c, p2.c),
  };
}

/**
 * Calculates total cell area of a rectangle.
 * @param {{ r1: number, r2: number, c1: number, c2: number }} rect
 * @returns {number}
 */
export function calcArea(rect) {
  if (!rect) return 0;
  return (rect.r2 - rect.r1 + 1) * (rect.c2 - rect.c1 + 1);
}

/**
 * Checks whether two rectangles intersect.
 */
export function rectanglesOverlap(rectA, rectB) {
  return !(
    rectA.r2 < rectB.r1 ||
    rectA.r1 > rectB.r2 ||
    rectA.c2 < rectB.c1 ||
    rectA.c1 > rectB.c2
  );
}

/**
 * Validates a potential room against number clues and existing committed rooms.
 * @param {{ r1: number, r2: number, c1: number, c2: number }} rect
 * @param {Array<{ r: number, c: number, val: number }>} clues
 * @param {Array<object>} existingRooms
 * @returns {{ valid: boolean, clue: object | null, error?: string }}
 */
export function validateRoom(rect, clues = [], existingRooms = []) {
  if (!rect) {
    return { valid: false, clue: null, error: 'Invalid room bounds.' };
  }

  const area = calcArea(rect);

  // Clues strictly within rect
  const enclosed = clues.filter(
    (c) =>
      c.r >= rect.r1 &&
      c.r <= rect.r2 &&
      c.c >= rect.c1 &&
      c.c <= rect.c2
  );

  if (enclosed.length === 0) {
    return { valid: false, clue: null, error: 'Room must contain exactly one number clue.' };
  }

  if (enclosed.length > 1) {
    return { valid: false, clue: null, error: 'Room cannot contain multiple clues.' };
  }

  const clue = enclosed[0];

  if (clue.val !== area) {
    return {
      valid: false,
      clue,
      error: `Room area ${area} does not match clue ${clue.val}.`,
    };
  }

  for (const existing of existingRooms) {
    if (rectanglesOverlap(rect, existing)) {
      return {
        valid: false,
        clue,
        error: 'Room overlaps with an existing room.',
      };
    }
  }

  return { valid: true, clue };
}

/**
 * Returns true if total cells in committed rooms equals size * size without overlaps.
 * @param {number} size
 * @param {Array<object>} rooms
 * @returns {boolean}
 */
export function checkWin(size, rooms = []) {
  if (!size || !rooms || rooms.length === 0) return false;

  const totalArea = rooms.reduce((sum, rm) => sum + calcArea(rm), 0);
  if (totalArea !== size * size) return false;

  const grid = Array.from({ length: size }, () => Array(size).fill(false));
  for (const rm of rooms) {
    for (let r = rm.r1; r <= rm.r2; r++) {
      for (let c = rm.c1; c <= rm.c2; c++) {
        if (grid[r][c]) return false;
        grid[r][c] = true;
      }
    }
  }

  return true;
}

/**
 * Returns whether a clue is enclosed in a committed room.
 */
export function isClueCovered(clue, rooms = []) {
  return rooms.some(
    (rm) =>
      clue.r >= rm.r1 &&
      clue.r <= rm.r2 &&
      clue.c >= rm.c1 &&
      clue.c <= rm.c2
  );
}

/**
 * Finds next uncommitted room from solution.
 */
export function getNextHintRoom(solution = [], rooms = []) {
  for (const solRoom of solution) {
    const committed = rooms.some(
      (rm) =>
        rm.r1 === solRoom.r1 &&
        rm.r2 === solRoom.r2 &&
        rm.c1 === solRoom.c1 &&
        rm.c2 === solRoom.c2
    );
    if (!committed) {
      return solRoom;
    }
  }
  return null;
}
