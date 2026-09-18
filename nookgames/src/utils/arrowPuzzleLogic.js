/**
 * arrowPuzzleLogic.js
 * Unified maze-lattice labyrinths — contiguous space-filling orthogonal corridors.
 * 100% grid occupancy, verified solvable without deadlocks.
 *
 * Tiers:
 *   Gentle   10×10  12–22 long serpentine paths  (avg 6–12 cells)
 *   Standard 12×12  18–36 interlocking ribbons    (avg 4–10 cells)
 *   Deep     14×14  24–52 dense labyrinth paths   (avg 3–8 cells)
 */

export const DIRECTIONS = {
  UP:    { dr: -1, dc:  0, name: 'UP',    angle: 270 },
  DOWN:  { dr:  1, dc:  0, name: 'DOWN',  angle: 90  },
  LEFT:  { dr:  0, dc: -1, name: 'LEFT',  angle: 180 },
  RIGHT: { dr:  0, dc:  1, name: 'RIGHT', angle: 0   },
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
  const deltaR = Math.sign(head[0] - prev[0]);
  const deltaC = Math.sign(head[1] - prev[1]);

  if (deltaC > 0) return { angle: 0,   dir: 'RIGHT', deltaR: 0,  deltaC: 1  };
  if (deltaR > 0) return { angle: 90,  dir: 'DOWN',  deltaR: 1,  deltaC: 0  };
  if (deltaC < 0) return { angle: 180, dir: 'LEFT',  deltaR: 0,  deltaC: -1 };
  if (deltaR < 0) return { angle: 270, dir: 'UP',    deltaR: -1, deltaC: 0  };
  return { angle: 0, dir: 'RIGHT', deltaR: 0, deltaC: 1 };
}

export function getArrowOccupiedCells(arrow) {
  const cells   = [];
  const visited = new Set();

  const addCell = (r, c) => {
    const key = cellKey(r, c);
    if (!visited.has(key)) { visited.add(key); cells.push([r, c]); }
  };

  const path = arrow.points || arrow.path || arrow;
  if (!path || path.length === 0) return cells;

  addCell(path[0][0], path[0][1]);

  for (let i = 1; i < path.length; i++) {
    const [r1, c1] = path[i - 1];
    const [r2, c2] = path[i];
    const dr = Math.sign(r2 - r1);
    const dc = Math.sign(c2 - c1);
    let currR = r1, currC = c1;
    while (currR !== r2 || currC !== c2) {
      if (dr !== 0) currR += dr; else currC += dc;
      addCell(currR, currC);
    }
  }

  return cells;
}

export function buildOccupiedCellMap(remainingArrows) {
  const cellMap = new Map();
  for (const arrow of remainingArrows) {
    const occupied = getArrowOccupiedCells(arrow);
    for (const [r, c] of occupied) cellMap.set(cellKey(r, c), arrow.id);
  }
  return cellMap;
}

export function checkArrowBlocked(arrowId, remainingArrows, gridBounds) {
  const targetArrow = remainingArrows.find((a) => a.id === arrowId);
  if (!targetArrow) return { isBlocked: true, blockerId: null };

  const heading = getArrowVectorHeading(targetArrow);
  if (heading.deltaR === 0 && heading.deltaC === 0) return { isBlocked: false, blockerId: null };

  const cellMap = buildOccupiedCellMap(remainingArrows);
  const path    = targetArrow.points || targetArrow.path;
  const head    = targetArrow.head   || path[path.length - 1];

  let currR = head[0] + heading.deltaR;
  let currC = head[1] + heading.deltaC;

  while (currR >= 0 && currR < gridBounds.rows && currC >= 0 && currC < gridBounds.cols) {
    const occupyingId = cellMap.get(cellKey(currR, currC));
    if (occupyingId && occupyingId !== arrowId) return { isBlocked: true, blockerId: occupyingId };
    currR += heading.deltaR;
    currC += heading.deltaC;
  }

  return { isBlocked: false, blockerId: null };
}

export function isArrowBlocked(arrowId, remainingArrows, gridBounds) {
  return checkArrowBlocked(arrowId, remainingArrows, gridBounds).isBlocked;
}

export function getAvailableArrowIds(remainingArrows, gridBounds) {
  const cellMap  = buildOccupiedCellMap(remainingArrows);
  const unblocked = [];

  for (const arrow of remainingArrows) {
    const heading = getArrowVectorHeading(arrow);
    if (heading.deltaR === 0 && heading.deltaC === 0) { unblocked.push(arrow.id); continue; }

    const path = arrow.points || arrow.path;
    const head = arrow.head   || path[path.length - 1];

    let blocked = false;
    let currR   = head[0] + heading.deltaR;
    let currC   = head[1] + heading.deltaC;

    while (currR >= 0 && currR < gridBounds.rows && currC >= 0 && currC < gridBounds.cols) {
      const occId = cellMap.get(cellKey(currR, currC));
      if (occId && occId !== arrow.id) { blocked = true; break; }
      currR += heading.deltaR;
      currC += heading.deltaC;
    }

    if (!blocked) unblocked.push(arrow.id);
  }

  return unblocked;
}

export function removeArrow(arrowId, remainingArrows, gridBounds) {
  if (isArrowBlocked(arrowId, remainingArrows, gridBounds)) {
    return { success: false, nextArrows: remainingArrows, removedArrow: null, isWon: false };
  }
  const removedArrow = remainingArrows.find((a) => a.id === arrowId);
  const nextArrows   = remainingArrows.filter((a) => a.id !== arrowId);
  return { success: true, nextArrows, removedArrow, isWon: nextArrows.length === 0 };
}

export function undoMove(history, remainingArrows) {
  if (!history || history.length === 0) return { nextArrows: remainingArrows, nextHistory: history };
  const nextHistory = [...history];
  const lastArrow   = nextHistory.pop();
  return { nextArrows: [...remainingArrows, lastArrow], nextHistory };
}

export const PUZZLE_DATA = {
  "gentle": [
    {
      "id": "g1",
      "title": "Serpentine Gate",
      "gridBounds": {
        "rows": 10,
        "cols": 10
      },
      "arrows": [
        {
          "id": "g1_1",
          "path": [
            [
              0,
              0
            ],
            [
              0,
              6
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "g1_2",
          "path": [
            [
              0,
              7
            ],
            [
              0,
              9
            ],
            [
              1,
              9
            ],
            [
              1,
              7
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "g1_3",
          "path": [
            [
              1,
              6
            ],
            [
              1,
              0
            ],
            [
              2,
              0
            ],
            [
              2,
              3
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "g1_4",
          "path": [
            [
              2,
              4
            ],
            [
              2,
              9
            ],
            [
              3,
              9
            ],
            [
              3,
              5
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "g1_5",
          "path": [
            [
              3,
              4
            ],
            [
              3,
              0
            ],
            [
              4,
              0
            ],
            [
              4,
              4
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "g1_6",
          "path": [
            [
              4,
              5
            ],
            [
              4,
              9
            ],
            [
              5,
              9
            ],
            [
              5,
              6
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "g1_7",
          "path": [
            [
              5,
              5
            ],
            [
              5,
              0
            ],
            [
              6,
              0
            ]
          ],
          "dir": "DOWN"
        },
        {
          "id": "g1_8",
          "path": [
            [
              6,
              1
            ],
            [
              6,
              8
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "g1_9",
          "path": [
            [
              6,
              9
            ],
            [
              7,
              9
            ],
            [
              7,
              2
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "g1_10",
          "path": [
            [
              7,
              1
            ],
            [
              7,
              0
            ],
            [
              8,
              0
            ],
            [
              8,
              4
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "g1_11",
          "path": [
            [
              8,
              5
            ],
            [
              8,
              9
            ],
            [
              9,
              9
            ],
            [
              9,
              8
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "g1_12",
          "path": [
            [
              9,
              7
            ],
            [
              9,
              3
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "g1_13",
          "path": [
            [
              9,
              2
            ],
            [
              9,
              0
            ]
          ],
          "dir": "LEFT"
        }
      ]
    },
    {
      "id": "g2",
      "title": "Emerald Spiral",
      "gridBounds": {
        "rows": 10,
        "cols": 10
      },
      "arrows": [
        {
          "id": "g2_1",
          "path": [
            [
              0,
              0
            ],
            [
              0,
              8
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "g2_2",
          "path": [
            [
              0,
              9
            ],
            [
              1,
              9
            ],
            [
              1,
              0
            ],
            [
              2,
              0
            ]
          ],
          "dir": "DOWN"
        },
        {
          "id": "g2_3",
          "path": [
            [
              2,
              1
            ],
            [
              2,
              9
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "g2_4",
          "path": [
            [
              3,
              9
            ],
            [
              3,
              4
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "g2_5",
          "path": [
            [
              3,
              3
            ],
            [
              3,
              0
            ],
            [
              4,
              0
            ],
            [
              4,
              4
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "g2_6",
          "path": [
            [
              4,
              5
            ],
            [
              4,
              9
            ],
            [
              5,
              9
            ],
            [
              5,
              7
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "g2_7",
          "path": [
            [
              5,
              6
            ],
            [
              5,
              0
            ],
            [
              6,
              0
            ],
            [
              6,
              4
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "g2_8",
          "path": [
            [
              6,
              5
            ],
            [
              6,
              9
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "g2_9",
          "path": [
            [
              7,
              9
            ],
            [
              7,
              3
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "g2_10",
          "path": [
            [
              7,
              2
            ],
            [
              7,
              0
            ],
            [
              8,
              0
            ],
            [
              8,
              3
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "g2_11",
          "path": [
            [
              8,
              4
            ],
            [
              8,
              9
            ],
            [
              9,
              9
            ],
            [
              9,
              4
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "g2_12",
          "path": [
            [
              9,
              3
            ],
            [
              9,
              0
            ]
          ],
          "dir": "LEFT"
        }
      ]
    }
  ],
  "standard": [
    {
      "id": "s1",
      "title": "Bamboo Helix",
      "gridBounds": {
        "rows": 12,
        "cols": 12
      },
      "arrows": [
        {
          "id": "s1_1",
          "path": [
            [
              0,
              0
            ],
            [
              0,
              6
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "s1_2",
          "path": [
            [
              0,
              7
            ],
            [
              0,
              11
            ],
            [
              1,
              11
            ],
            [
              1,
              7
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "s1_3",
          "path": [
            [
              1,
              6
            ],
            [
              1,
              1
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "s1_4",
          "path": [
            [
              1,
              0
            ],
            [
              2,
              0
            ],
            [
              2,
              8
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "s1_5",
          "path": [
            [
              2,
              9
            ],
            [
              2,
              11
            ],
            [
              3,
              11
            ],
            [
              3,
              7
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "s1_6",
          "path": [
            [
              3,
              6
            ],
            [
              3,
              0
            ],
            [
              4,
              0
            ],
            [
              4,
              1
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "s1_7",
          "path": [
            [
              4,
              2
            ],
            [
              4,
              7
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "s1_8",
          "path": [
            [
              4,
              8
            ],
            [
              4,
              11
            ],
            [
              5,
              11
            ],
            [
              5,
              7
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "s1_9",
          "path": [
            [
              5,
              6
            ],
            [
              5,
              0
            ],
            [
              6,
              0
            ],
            [
              6,
              1
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "s1_10",
          "path": [
            [
              6,
              2
            ],
            [
              6,
              9
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "s1_11",
          "path": [
            [
              6,
              10
            ],
            [
              6,
              11
            ],
            [
              7,
              11
            ],
            [
              7,
              7
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "s1_12",
          "path": [
            [
              7,
              6
            ],
            [
              7,
              0
            ],
            [
              8,
              0
            ],
            [
              8,
              2
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "s1_13",
          "path": [
            [
              8,
              3
            ],
            [
              8,
              6
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "s1_14",
          "path": [
            [
              8,
              7
            ],
            [
              8,
              11
            ],
            [
              9,
              11
            ],
            [
              9,
              9
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "s1_15",
          "path": [
            [
              9,
              8
            ],
            [
              9,
              0
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "s1_16",
          "path": [
            [
              10,
              0
            ],
            [
              10,
              6
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "s1_17",
          "path": [
            [
              10,
              7
            ],
            [
              10,
              11
            ],
            [
              11,
              11
            ]
          ],
          "dir": "DOWN"
        },
        {
          "id": "s1_18",
          "path": [
            [
              11,
              10
            ],
            [
              11,
              7
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "s1_19",
          "path": [
            [
              11,
              6
            ],
            [
              11,
              0
            ]
          ],
          "dir": "LEFT"
        }
      ]
    },
    {
      "id": "s2",
      "title": "Stone Crossing",
      "gridBounds": {
        "rows": 12,
        "cols": 12
      },
      "arrows": [
        {
          "id": "s2_1",
          "path": [
            [
              0,
              0
            ],
            [
              0,
              4
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "s2_2",
          "path": [
            [
              0,
              5
            ],
            [
              0,
              9
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "s2_3",
          "path": [
            [
              0,
              10
            ],
            [
              0,
              11
            ],
            [
              1,
              11
            ],
            [
              1,
              5
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "s2_4",
          "path": [
            [
              1,
              4
            ],
            [
              1,
              0
            ],
            [
              2,
              0
            ],
            [
              2,
              2
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "s2_5",
          "path": [
            [
              2,
              3
            ],
            [
              2,
              9
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "s2_6",
          "path": [
            [
              2,
              10
            ],
            [
              2,
              11
            ],
            [
              3,
              11
            ],
            [
              3,
              8
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "s2_7",
          "path": [
            [
              3,
              7
            ],
            [
              3,
              4
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "s2_8",
          "path": [
            [
              3,
              3
            ],
            [
              3,
              0
            ],
            [
              4,
              0
            ],
            [
              4,
              3
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "s2_9",
          "path": [
            [
              4,
              4
            ],
            [
              4,
              8
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "s2_10",
          "path": [
            [
              4,
              9
            ],
            [
              4,
              11
            ],
            [
              5,
              11
            ],
            [
              5,
              7
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "s2_11",
          "path": [
            [
              5,
              6
            ],
            [
              5,
              2
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "s2_12",
          "path": [
            [
              5,
              1
            ],
            [
              5,
              0
            ],
            [
              6,
              0
            ],
            [
              6,
              2
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "s2_13",
          "path": [
            [
              6,
              3
            ],
            [
              6,
              11
            ],
            [
              7,
              11
            ]
          ],
          "dir": "DOWN"
        },
        {
          "id": "s2_14",
          "path": [
            [
              7,
              10
            ],
            [
              7,
              5
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "s2_15",
          "path": [
            [
              7,
              4
            ],
            [
              7,
              0
            ],
            [
              8,
              0
            ],
            [
              8,
              3
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "s2_16",
          "path": [
            [
              8,
              4
            ],
            [
              8,
              8
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "s2_17",
          "path": [
            [
              8,
              9
            ],
            [
              8,
              11
            ],
            [
              9,
              11
            ],
            [
              9,
              5
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "s2_18",
          "path": [
            [
              9,
              4
            ],
            [
              9,
              0
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "s2_19",
          "path": [
            [
              10,
              0
            ],
            [
              10,
              7
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "s2_20",
          "path": [
            [
              10,
              8
            ],
            [
              10,
              11
            ],
            [
              11,
              11
            ]
          ],
          "dir": "DOWN"
        },
        {
          "id": "s2_21",
          "path": [
            [
              11,
              10
            ],
            [
              11,
              3
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "s2_22",
          "path": [
            [
              11,
              2
            ],
            [
              11,
              0
            ]
          ],
          "dir": "LEFT"
        }
      ]
    }
  ],
  "deep": [
    {
      "id": "d1",
      "title": "Dragon Sanctum",
      "gridBounds": {
        "rows": 14,
        "cols": 14
      },
      "arrows": [
        {
          "id": "d1_1",
          "path": [
            [
              0,
              0
            ],
            [
              0,
              4
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "d1_2",
          "path": [
            [
              0,
              5
            ],
            [
              0,
              9
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "d1_3",
          "path": [
            [
              0,
              10
            ],
            [
              0,
              12
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "d1_4",
          "path": [
            [
              0,
              13
            ],
            [
              1,
              13
            ],
            [
              1,
              11
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "d1_5",
          "path": [
            [
              1,
              10
            ],
            [
              1,
              8
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "d1_6",
          "path": [
            [
              1,
              7
            ],
            [
              1,
              1
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "d1_7",
          "path": [
            [
              1,
              0
            ],
            [
              2,
              0
            ],
            [
              2,
              1
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "d1_8",
          "path": [
            [
              2,
              2
            ],
            [
              2,
              5
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "d1_9",
          "path": [
            [
              2,
              6
            ],
            [
              2,
              11
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "d1_10",
          "path": [
            [
              2,
              12
            ],
            [
              2,
              13
            ],
            [
              3,
              13
            ],
            [
              3,
              8
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "d1_11",
          "path": [
            [
              3,
              7
            ],
            [
              3,
              1
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "d1_12",
          "path": [
            [
              3,
              0
            ],
            [
              4,
              0
            ],
            [
              4,
              6
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "d1_13",
          "path": [
            [
              4,
              7
            ],
            [
              4,
              13
            ],
            [
              5,
              13
            ]
          ],
          "dir": "DOWN"
        },
        {
          "id": "d1_14",
          "path": [
            [
              5,
              12
            ],
            [
              5,
              8
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "d1_15",
          "path": [
            [
              5,
              7
            ],
            [
              5,
              5
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "d1_16",
          "path": [
            [
              5,
              4
            ],
            [
              5,
              0
            ],
            [
              6,
              0
            ],
            [
              6,
              2
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "d1_17",
          "path": [
            [
              6,
              3
            ],
            [
              6,
              8
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "d1_18",
          "path": [
            [
              6,
              9
            ],
            [
              6,
              13
            ],
            [
              7,
              13
            ]
          ],
          "dir": "DOWN"
        },
        {
          "id": "d1_19",
          "path": [
            [
              7,
              12
            ],
            [
              7,
              10
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "d1_20",
          "path": [
            [
              7,
              9
            ],
            [
              7,
              5
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "d1_21",
          "path": [
            [
              7,
              4
            ],
            [
              7,
              0
            ],
            [
              8,
              0
            ],
            [
              8,
              1
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "d1_22",
          "path": [
            [
              8,
              2
            ],
            [
              8,
              4
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "d1_23",
          "path": [
            [
              8,
              5
            ],
            [
              8,
              11
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "d1_24",
          "path": [
            [
              8,
              12
            ],
            [
              8,
              13
            ],
            [
              9,
              13
            ],
            [
              9,
              12
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "d1_25",
          "path": [
            [
              9,
              11
            ],
            [
              9,
              5
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "d1_26",
          "path": [
            [
              9,
              4
            ],
            [
              9,
              0
            ],
            [
              10,
              0
            ],
            [
              10,
              1
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "d1_27",
          "path": [
            [
              10,
              2
            ],
            [
              10,
              5
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "d1_28",
          "path": [
            [
              10,
              6
            ],
            [
              10,
              9
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "d1_29",
          "path": [
            [
              10,
              10
            ],
            [
              10,
              13
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "d1_30",
          "path": [
            [
              11,
              13
            ],
            [
              11,
              7
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "d1_31",
          "path": [
            [
              11,
              6
            ],
            [
              11,
              0
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "d1_32",
          "path": [
            [
              12,
              0
            ],
            [
              12,
              6
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "d1_33",
          "path": [
            [
              12,
              7
            ],
            [
              12,
              12
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "d1_34",
          "path": [
            [
              12,
              13
            ],
            [
              13,
              13
            ],
            [
              13,
              10
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "d1_35",
          "path": [
            [
              13,
              9
            ],
            [
              13,
              7
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "d1_36",
          "path": [
            [
              13,
              6
            ],
            [
              13,
              3
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "d1_37",
          "path": [
            [
              13,
              2
            ],
            [
              13,
              0
            ]
          ],
          "dir": "LEFT"
        }
      ]
    },
    {
      "id": "d2",
      "title": "Celestial Labyrinth",
      "gridBounds": {
        "rows": 14,
        "cols": 14
      },
      "arrows": [
        {
          "id": "d2_1",
          "path": [
            [
              0,
              0
            ],
            [
              0,
              7
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "d2_2",
          "path": [
            [
              0,
              8
            ],
            [
              0,
              10
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "d2_3",
          "path": [
            [
              0,
              11
            ],
            [
              0,
              13
            ],
            [
              1,
              13
            ],
            [
              1,
              10
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "d2_4",
          "path": [
            [
              1,
              9
            ],
            [
              1,
              7
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "d2_5",
          "path": [
            [
              1,
              6
            ],
            [
              1,
              0
            ],
            [
              2,
              0
            ]
          ],
          "dir": "DOWN"
        },
        {
          "id": "d2_6",
          "path": [
            [
              2,
              1
            ],
            [
              2,
              7
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "d2_7",
          "path": [
            [
              2,
              8
            ],
            [
              2,
              10
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "d2_8",
          "path": [
            [
              2,
              11
            ],
            [
              2,
              13
            ],
            [
              3,
              13
            ],
            [
              3,
              10
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "d2_9",
          "path": [
            [
              3,
              9
            ],
            [
              3,
              6
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "d2_10",
          "path": [
            [
              3,
              5
            ],
            [
              3,
              0
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "d2_11",
          "path": [
            [
              4,
              0
            ],
            [
              4,
              3
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "d2_12",
          "path": [
            [
              4,
              4
            ],
            [
              4,
              8
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "d2_13",
          "path": [
            [
              4,
              9
            ],
            [
              4,
              11
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "d2_14",
          "path": [
            [
              4,
              12
            ],
            [
              4,
              13
            ],
            [
              5,
              13
            ],
            [
              5,
              9
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "d2_15",
          "path": [
            [
              5,
              8
            ],
            [
              5,
              3
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "d2_16",
          "path": [
            [
              5,
              2
            ],
            [
              5,
              0
            ],
            [
              6,
              0
            ],
            [
              6,
              1
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "d2_17",
          "path": [
            [
              6,
              2
            ],
            [
              6,
              8
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "d2_18",
          "path": [
            [
              6,
              9
            ],
            [
              6,
              13
            ],
            [
              7,
              13
            ],
            [
              7,
              11
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "d2_19",
          "path": [
            [
              7,
              10
            ],
            [
              7,
              5
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "d2_20",
          "path": [
            [
              7,
              4
            ],
            [
              7,
              0
            ],
            [
              8,
              0
            ]
          ],
          "dir": "DOWN"
        },
        {
          "id": "d2_21",
          "path": [
            [
              8,
              1
            ],
            [
              8,
              4
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "d2_22",
          "path": [
            [
              8,
              5
            ],
            [
              8,
              8
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "d2_23",
          "path": [
            [
              8,
              9
            ],
            [
              8,
              11
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "d2_24",
          "path": [
            [
              8,
              12
            ],
            [
              8,
              13
            ],
            [
              9,
              13
            ]
          ],
          "dir": "DOWN"
        },
        {
          "id": "d2_25",
          "path": [
            [
              9,
              12
            ],
            [
              9,
              5
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "d2_26",
          "path": [
            [
              9,
              4
            ],
            [
              9,
              0
            ],
            [
              10,
              0
            ]
          ],
          "dir": "DOWN"
        },
        {
          "id": "d2_27",
          "path": [
            [
              10,
              1
            ],
            [
              10,
              5
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "d2_28",
          "path": [
            [
              10,
              6
            ],
            [
              10,
              9
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "d2_29",
          "path": [
            [
              10,
              10
            ],
            [
              10,
              13
            ],
            [
              11,
              13
            ],
            [
              11,
              12
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "d2_30",
          "path": [
            [
              11,
              11
            ],
            [
              11,
              5
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "d2_31",
          "path": [
            [
              11,
              4
            ],
            [
              11,
              2
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "d2_32",
          "path": [
            [
              11,
              1
            ],
            [
              11,
              0
            ],
            [
              12,
              0
            ],
            [
              12,
              4
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "d2_33",
          "path": [
            [
              12,
              5
            ],
            [
              12,
              11
            ]
          ],
          "dir": "RIGHT"
        },
        {
          "id": "d2_34",
          "path": [
            [
              12,
              12
            ],
            [
              12,
              13
            ],
            [
              13,
              13
            ],
            [
              13,
              12
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "d2_35",
          "path": [
            [
              13,
              11
            ],
            [
              13,
              6
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "d2_36",
          "path": [
            [
              13,
              5
            ],
            [
              13,
              3
            ]
          ],
          "dir": "LEFT"
        },
        {
          "id": "d2_37",
          "path": [
            [
              13,
              2
            ],
            [
              13,
              0
            ]
          ],
          "dir": "LEFT"
        }
      ]
    }
  ]
};

export function getPuzzle(difficulty, index = 0) {
  const tierKey = (difficulty === 'beginner' || difficulty === 'gentle')
    ? 'gentle'
    : (difficulty === 'expert' || difficulty === 'deep')
      ? 'deep'
      : 'standard';
  const list    = PUZZLE_DATA[tierKey] || PUZZLE_DATA.gentle;
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
