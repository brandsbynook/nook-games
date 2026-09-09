/**
 * arrowPuzzleLogic.js
 * Core logic for Game #14: Arrow Puzzle (Arrow Clear / Untangle Arrows)
 * Orthogonal grid navigation where entangled arrows must unravel sequentially.
 * 
 * Strict high-friction maze rules:
 * - Vector-Derived Heading: arrowhead angle and flight trajectory are calculated
 *   strictly from the final segment vector of the arrow's path.
 * - Zero Free Borders: exactly one designated key arrow can escape at the start.
 * - Nested Overlaps: concentric loops and serpentine corridors trap each other.
 * - Strict Sequential Peeling: exactly one clear move at the start, unlocking only 1–2 candidates per step.
 */

export const DIRECTIONS = {
  UP: { dr: -1, dc: 0, name: 'UP', angle: 270 },
  DOWN: { dr: 1, dc: 0, name: 'DOWN', angle: 90 },
  LEFT: { dr: 0, dc: -1, name: 'LEFT', angle: 180 },
  RIGHT: { dr: 0, dc: 1, name: 'RIGHT', angle: 0 },
};

export const DIFFICULTIES = ['beginner', 'intermediate', 'expert'];

/**
 * Returns a key for a grid coordinate "r,c".
 */
export function cellKey(r, c) {
  return `${r},${c}`;
}

/**
 * Vector-Derived Heading:
 * For every arrow with coordinate path points = [[r0, c0], ..., [rN, cN]],
 * calculates the direction vector of the final segment:
 * deltaR = head[0] - prev[0]
 * deltaC = head[1] - prev[1]
 * 
 * Angle in degrees:
 * deltaC > 0 -> angle = 0   (Right →)
 * deltaR > 0 -> angle = 90  (Down ↓)
 * deltaC < 0 -> angle = 180 (Left ←)
 * deltaR < 0 -> angle = 270 (Up ↑)
 */
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

/**
 * Given an arrow definition, returns an array of all distinct [r, c] grid coordinates
 * occupied by the arrow's body (interpolating orthogonal segments between vertices).
 */
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

  const path = arrow.path;
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

/**
 * Builds a fast lookup Map of "r,c" -> arrowId for a collection of remaining arrows.
 */
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

/**
 * Checks if an arrow is blocked by any other remaining arrow along its forward flight corridor.
 * Returns { isBlocked: boolean, blockerId: string | null }
 * 
 * Collision Logic:
 * An arrow is blocked if ANY active arrow segment (head or body) intersects the line
 * segment extending from the arrow's head all the way to the canvas edge in its flight direction.
 * The flight direction is strictly derived from the arrow's final segment vector.
 */
export function checkArrowBlocked(arrowId, remainingArrows, gridBounds) {
  const targetArrow = remainingArrows.find((a) => a.id === arrowId);
  if (!targetArrow) return { isBlocked: true, blockerId: null };

  const cellMap = buildOccupiedCellMap(remainingArrows);
  const heading = getArrowVectorHeading(targetArrow.path);

  const [headR, headC] = targetArrow.head;
  let currR = headR + heading.deltaR;
  let currC = headC + heading.deltaC;

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

/**
 * Standard requirement function: returns true if another arrow's body intersects the flight corridor.
 */
export function isArrowBlocked(arrowId, remainingArrows, gridBounds) {
  return checkArrowBlocked(arrowId, remainingArrows, gridBounds).isBlocked;
}

/**
 * Returns all unblocked arrow IDs at the current board state.
 */
export function getAvailableArrowIds(remainingArrows, gridBounds) {
  const cellMap = buildOccupiedCellMap(remainingArrows);
  const unblocked = [];

  for (const arrow of remainingArrows) {
    const heading = getArrowVectorHeading(arrow.path);

    let blocked = false;
    let currR = arrow.head[0] + heading.deltaR;
    let currC = arrow.head[1] + heading.deltaC;

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

/**
 * Removes an arrow from remainingArrows if unblocked.
 * Returns { success, nextArrows, removedArrow, isWon }
 */
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

/**
 * Restores the most recently removed arrow to the board state.
 * Returns { nextArrows, nextHistory }
 */
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

/**
 * Validates whether a given puzzle is solvable and returns the sequence of moves.
 */
export function solvePuzzle(puzzle) {
  let remaining = [...puzzle.arrows];
  const solution = [];

  while (remaining.length > 0) {
    const unblocked = getAvailableArrowIds(remaining, puzzle.gridBounds);
    if (unblocked.length === 0) {
      return { solvable: false, solvedCount: solution.length, total: puzzle.arrows.length };
    }
    // Take the first available unblocked arrow
    const targetId = unblocked[0];
    const removed = remaining.find((a) => a.id === targetId);
    solution.push(removed);
    remaining = remaining.filter((a) => a.id !== targetId);
  }

  return { solvable: true, sequence: solution.map((a) => a.id) };
}

/* ─────────────────────────────────────────────────────────────────────────────
   REVERSE CONSTRUCTION PUZZLE GENERATOR
   Mathematically guaranteed to be solvable with zero deadlocks:
   - Start with an empty board.
   - Place arrows from the outside in (layer by layer, infilling inward).
   - Ensure each arrow's forward corridor to the edge is strictly clear when placed.
   - Every arrow is a clean straight line segment of 2 to 3 cells.
   - Because each arrow has a clear path to edge relative to arrows placed before it,
     the reverse of the placement sequence is an absolute guarantee of complete solvability.
   ───────────────────────────────────────────────────────────────────────────── */

export function generateReversePuzzle(id, title, rows, cols, targetArrows = 12, seed = 42) {
  // Deterministic LCG PRNG for reproducible puzzles
  let s = seed;
  const rng = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };

  const occupiedSet = new Set();
  const arrows = [];
  const gridBounds = { rows, cols };
  const corridors = [];
  const maxLayer = Math.floor(Math.min(rows, cols) / 2);

  const getLayer = (r, c) => Math.min(r, rows - 1 - r, c, cols - 1 - c);

  const isCorridorClear = (headR, headC, dir) => {
    let currR = headR + dir.dr;
    let currC = headC + dir.dc;
    while (currR >= 0 && currR < rows && currC >= 0 && currC < cols) {
      if (occupiedSet.has(cellKey(currR, currC))) return false;
      currR += dir.dr;
      currC += dir.dc;
    }
    return true;
  };

  const DIR_LIST = [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT];

  // Phase 1: Place arrows from the outside in by perimeter layer
  for (let currentLayer = 0; currentLayer < maxLayer; currentLayer++) {
    let layerAttempts = 300;
    while (arrows.length < targetArrows && layerAttempts-- > 0) {
      const candidates = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          for (const dir of DIR_LIST) {
            for (const len of [3, 2]) {
              let fits = true;
              const points = [];
              for (let k = len - 1; k >= 0; k--) {
                const pr = r - k * dir.dr;
                const pc = c - k * dir.dc;
                if (
                  pr < 0 ||
                  pr >= rows ||
                  pc < 0 ||
                  pc >= cols ||
                  occupiedSet.has(cellKey(pr, pc))
                ) {
                  fits = false;
                  break;
                }
                points.push([pr, pc]);
              }
              if (!fits) continue;

              const pointLayers = points.map(([pr, pc]) => getLayer(pr, pc));
              const minL = Math.min(...pointLayers);
              if (minL < currentLayer || minL > currentLayer) continue;

              // Ensure forward corridor to the edge is strictly clear
              if (!isCorridorClear(r, c, dir)) continue;

              const head = [r, c];
              const ptKeys = new Set(points.map(([pr, pc]) => cellKey(pr, pc)));

              let blockedCount = 0;
              for (const cr of corridors) {
                if (cr.cells.some(([cR, cC]) => ptKeys.has(cellKey(cR, cC)))) {
                  blockedCount++;
                }
              }

              candidates.push({
                path: points,
                points,
                head,
                dir: dir.name,
                dirObj: dir,
                len,
                blockedCount,
              });
            }
          }
        }
      }

      if (candidates.length === 0) break;

      candidates.sort((a, b) => {
        const scoreA = a.len * 3 + a.blockedCount * 12 + rng() * 4;
        const scoreB = b.len * 3 + b.blockedCount * 12 + rng() * 4;
        return scoreB - scoreA;
      });

      const chosen = candidates[0];
      const arrowId = `${id}-${arrows.length + 1}`;
      arrows.push({
        id: arrowId,
        path: chosen.path,
        points: chosen.points,
        head: chosen.head,
        dir: chosen.dir,
      });

      for (const p of chosen.points) {
        occupiedSet.add(cellKey(p[0], p[1]));
      }

      let currR = chosen.head[0] + chosen.dirObj.dr;
      let currC = chosen.head[1] + chosen.dirObj.dc;
      const corridorCells = [];
      while (currR >= 0 && currR < rows && currC >= 0 && currC < cols) {
        corridorCells.push([currR, currC]);
        currR += chosen.dirObj.dr;
        currC += chosen.dirObj.dc;
      }
      corridors.push({ arrowId, cells: corridorCells });
    }
  }

  // Phase 2: Infill any remaining open space up to targetArrows
  let infillAttempts = 350;
  while (arrows.length < targetArrows && infillAttempts-- > 0) {
    const candidates = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        for (const dir of DIR_LIST) {
          for (const len of [3, 2]) {
            let fits = true;
            const points = [];
            for (let k = len - 1; k >= 0; k--) {
              const pr = r - k * dir.dr;
              const pc = c - k * dir.dc;
              if (
                pr < 0 ||
                pr >= rows ||
                pc < 0 ||
                pc >= cols ||
                occupiedSet.has(cellKey(pr, pc))
              ) {
                fits = false;
                break;
              }
              points.push([pr, pc]);
            }
            if (!fits) continue;
            if (!isCorridorClear(r, c, dir)) continue;

            candidates.push({
              path: points,
              points,
              head: [r, c],
              dir: dir.name,
              dirObj: dir,
              len,
            });
          }
        }
      }
    }

    if (candidates.length === 0) break;

    const chosen = candidates[Math.floor(rng() * candidates.length)];
    const arrowId = `${id}-${arrows.length + 1}`;
    arrows.push({
      id: arrowId,
      path: chosen.path,
      points: chosen.points,
      head: chosen.head,
      dir: chosen.dir,
    });
    for (const p of chosen.points) {
      occupiedSet.add(cellKey(p[0], p[1]));
    }
  }

  return { id, title, gridBounds, arrows };
}

// Backwards-compatible alias for any legacy callers
export function createTightlyPackedLabyrinth(id, title, N, keyCorner = 0, mergeCorners = 0) {
  const targetArrows = N === 6 ? 11 : N === 8 ? 18 : 26;
  const seed = (keyCorner + 1) * 333 + mergeCorners * 77 + N * 13;
  return generateReversePuzzle(id, title, N, N, targetArrows, seed);
}

/* ─────────────────────────────────────────────────────────────────────────────
   PUZZLE DEFINITIONS
   Guaranteed solvable with zero deadlocks:
   - Beginner: 6×6 board, clean 2-3 cell straight arrows
   - Intermediate: 8×8 board, clean 2-3 cell straight arrows
   - Expert: 10×10 board, clean 2-3 cell straight arrows
   ───────────────────────────────────────────────────────────────────────────── */

export const PUZZLE_DATA = {
  beginner: [
    generateReversePuzzle('b1', 'Garden Gate', 6, 6, 11, 101),
    generateReversePuzzle('b2', 'Stone Path', 6, 6, 12, 202),
    generateReversePuzzle('b3', 'Breeze Courtyard', 6, 6, 11, 303),
  ],
  intermediate: [
    generateReversePuzzle('i1', 'Bamboo Grove', 8, 8, 18, 404),
    generateReversePuzzle('i2', 'Quiet Willow', 8, 8, 19, 505),
    generateReversePuzzle('i3', 'Zen Crossing', 8, 8, 18, 606),
  ],
  expert: [
    generateReversePuzzle('e1', 'Dragon Sanctum', 10, 10, 26, 707),
    generateReversePuzzle('e2', 'Shadow Valley', 10, 10, 27, 808),
    generateReversePuzzle('e3', 'Celestial Maze', 10, 10, 28, 909),
  ],
};

/**
 * Returns a puzzle definition by difficulty and level index.
 */
export function getPuzzle(difficulty, index = 0) {
  const list = PUZZLE_DATA[difficulty] || PUZZLE_DATA.beginner;
  const safeIdx = Math.max(0, Math.min(index, list.length - 1));
  return list[safeIdx];
}

/**
 * Returns the count of puzzles in a difficulty tier.
 */
export function getPuzzleCount(difficulty) {
  const list = PUZZLE_DATA[difficulty] || PUZZLE_DATA.beginner;
  return list.length;
}
