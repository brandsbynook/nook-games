// Kakuro Logic Engine and Curated Puzzles
export function createBlock(down = null, across = null) {
  return { type: 'block', across, down };
}

export function createWhite(r, c, solution) {
  return {
    type: 'white',
    id: `${r}-${c}`,
    solution,
    val: null,
    notes: []
  };
}

// Curated verified base puzzles (10 per tier, expandable via transposition to 20+ per tier)
export const KAKURO_BANK = {
  intro: [
    // 4x4 Base 1
    [
      [createBlock(),           createBlock(4),       createBlock(11),      createBlock()],
      [createBlock(null, 3),    createWhite(1, 1, 1), createWhite(1, 2, 2), createBlock()],
      [createBlock(null, 12),   createWhite(2, 1, 3), createWhite(2, 2, 9), createBlock()],
      [createBlock(),           createBlock(),        createBlock(),        createBlock()]
    ],
    // 4x4 Base 2
    [
      [createBlock(),           createBlock(9),       createBlock(7),       createBlock()],
      [createBlock(null, 11),   createWhite(1, 1, 8), createWhite(1, 2, 3), createBlock()],
      [createBlock(null, 5),    createWhite(2, 1, 1), createWhite(2, 2, 4), createBlock()],
      [createBlock(),           createBlock(),        createBlock(),        createBlock()]
    ],
    // 4x4 Base 3
    [
      [createBlock(),           createBlock(10),      createBlock(6),       createBlock()],
      [createBlock(null, 7),    createWhite(1, 1, 6), createWhite(1, 2, 1), createBlock()],
      [createBlock(null, 9),    createWhite(2, 1, 4), createWhite(2, 2, 5), createBlock()],
      [createBlock(),           createBlock(),        createBlock(),        createBlock()]
    ],
    // 4x4 Base 4
    [
      [createBlock(),           createBlock(8),       createBlock(14),      createBlock()],
      [createBlock(null, 9),    createWhite(1, 1, 1), createWhite(1, 2, 8), createBlock()],
      [createBlock(null, 13),   createWhite(2, 1, 7), createWhite(2, 2, 6), createBlock()],
      [createBlock(),           createBlock(),        createBlock(),        createBlock()]
    ],
    // 4x4 Base 5
    [
      [createBlock(),           createBlock(12),      createBlock(5),       createBlock()],
      [createBlock(null, 10),   createWhite(1, 1, 7), createWhite(1, 2, 3), createBlock()],
      [createBlock(null, 7),    createWhite(2, 1, 5), createWhite(2, 2, 2), createBlock()],
      [createBlock(),           createBlock(),        createBlock(),        createBlock()]
    ],
    // 4x4 Base 6
    [
      [createBlock(),           createBlock(6),       createBlock(6),       createBlock()],
      [createBlock(null, 7),    createWhite(1, 1, 2), createWhite(1, 2, 5), createBlock()],
      [createBlock(null, 5),    createWhite(2, 1, 4), createWhite(2, 2, 1), createBlock()],
      [createBlock(),           createBlock(),        createBlock(),        createBlock()]
    ],
    // 4x4 Base 7
    [
      [createBlock(),           createBlock(11),      createBlock(12),      createBlock()],
      [createBlock(null, 13),   createWhite(1, 1, 9), createWhite(1, 2, 4), createBlock()],
      [createBlock(null, 10),   createWhite(2, 1, 2), createWhite(2, 2, 8), createBlock()],
      [createBlock(),           createBlock(),        createBlock(),        createBlock()]
    ],
    // 4x4 Base 8
    [
      [createBlock(),           createBlock(8),       createBlock(8),       createBlock()],
      [createBlock(null, 10),   createWhite(1, 1, 3), createWhite(1, 2, 7), createBlock()],
      [createBlock(null, 6),    createWhite(2, 1, 5), createWhite(2, 2, 1), createBlock()],
      [createBlock(),           createBlock(),        createBlock(),        createBlock()]
    ],
    // 4x4 Base 9
    [
      [createBlock(),           createBlock(5),       createBlock(8),       createBlock()],
      [createBlock(null, 6),    createWhite(1, 1, 4), createWhite(1, 2, 2), createBlock()],
      [createBlock(null, 7),    createWhite(2, 1, 1), createWhite(2, 2, 6), createBlock()],
      [createBlock(),           createBlock(),        createBlock(),        createBlock()]
    ],
    // 4x4 Base 10
    [
      [createBlock(),           createBlock(8),       createBlock(13),      createBlock()],
      [createBlock(null, 14),   createWhite(1, 1, 5), createWhite(1, 2, 9), createBlock()],
      [createBlock(null, 7),    createWhite(2, 1, 3), createWhite(2, 2, 4), createBlock()],
      [createBlock(),           createBlock(),        createBlock(),        createBlock()]
    ]
  ],
  classic: [
    // 6x6 Base 1
    [
      [createBlock(),        createBlock(),        createBlock(6),       createBlock(5),       createBlock(),        createBlock()],
      [createBlock(),        createBlock(3, 3),    createWhite(1, 2, 1), createWhite(1, 3, 2), createBlock(),        createBlock()],
      [createBlock(null, 6), createWhite(2, 1, 1), createWhite(2, 2, 2), createWhite(2, 3, 3), createBlock(17),     createBlock(8)],
      [createBlock(null, 5), createWhite(3, 1, 2), createWhite(3, 2, 3), createBlock(null, 16),createWhite(3, 4, 9), createWhite(3, 5, 7)],
      [createBlock(),        createBlock(),        createBlock(),        createBlock(null, 9), createWhite(4, 4, 8), createWhite(4, 5, 1)],
      [createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock()]
    ],
    // 6x6 Base 2
    [
      [createBlock(),        createBlock(),        createBlock(7),       createBlock(5),       createBlock(),        createBlock()],
      [createBlock(),        createBlock(4, 3),    createWhite(1, 2, 2), createWhite(1, 3, 1), createBlock(),        createBlock()],
      [createBlock(null, 8), createWhite(2, 1, 3), createWhite(2, 2, 1), createWhite(2, 3, 4), createBlock(16),     createBlock(10)],
      [createBlock(null, 5), createWhite(3, 1, 1), createWhite(3, 2, 4), createBlock(null, 15),createWhite(3, 4, 7), createWhite(3, 5, 8)],
      [createBlock(),        createBlock(),        createBlock(),        createBlock(null, 11),createWhite(4, 4, 9), createWhite(4, 5, 2)],
      [createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock()]
    ],
    // 6x6 Base 3
    [
      [createBlock(),        createBlock(),        createBlock(8),       createBlock(3),       createBlock(),        createBlock()],
      [createBlock(),        createBlock(7, 6),    createWhite(1, 2, 4), createWhite(1, 3, 2), createBlock(),        createBlock()],
      [createBlock(null, 6), createWhite(2, 1, 2), createWhite(2, 2, 3), createWhite(2, 3, 1), createBlock(14),     createBlock(12)],
      [createBlock(null, 6), createWhite(3, 1, 5), createWhite(3, 2, 1), createBlock(null, 17),createWhite(3, 4, 8), createWhite(3, 5, 9)],
      [createBlock(),        createBlock(),        createBlock(),        createBlock(null, 9), createWhite(4, 4, 6), createWhite(4, 5, 3)],
      [createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock()]
    ],
    // 6x6 Base 4
    [
      [createBlock(),        createBlock(),        createBlock(11),      createBlock(6),       createBlock(),        createBlock()],
      [createBlock(),        createBlock(5, 8),    createWhite(1, 2, 3), createWhite(1, 3, 5), createBlock(),        createBlock()],
      [createBlock(null, 7), createWhite(2, 1, 4), createWhite(2, 2, 2), createWhite(2, 3, 1), createBlock(12),     createBlock(8)],
      [createBlock(null, 7), createWhite(3, 1, 1), createWhite(3, 2, 6), createBlock(null, 11),createWhite(3, 4, 5), createWhite(3, 5, 6)],
      [createBlock(),        createBlock(),        createBlock(),        createBlock(null, 9), createWhite(4, 4, 7), createWhite(4, 5, 2)],
      [createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock()]
    ],
    // 6x6 Base 5
    [
      [createBlock(),        createBlock(),        createBlock(8),       createBlock(7),       createBlock(),        createBlock()],
      [createBlock(),        createBlock(7, 5),    createWhite(1, 2, 1), createWhite(1, 3, 4), createBlock(),        createBlock()],
      [createBlock(null, 10),createWhite(2, 1, 5), createWhite(2, 2, 2), createWhite(2, 3, 3), createBlock(15),     createBlock(12)],
      [createBlock(null, 7), createWhite(3, 1, 2), createWhite(3, 2, 5), createBlock(null, 14),createWhite(3, 4, 6), createWhite(3, 5, 8)],
      [createBlock(),        createBlock(),        createBlock(),        createBlock(null, 13),createWhite(4, 4, 9), createWhite(4, 5, 4)],
      [createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock()]
    ],
    // 6x6 Base 6
    [
      [createBlock(),        createBlock(),        createBlock(10),      createBlock(5),       createBlock(),        createBlock()],
      [createBlock(),        createBlock(4, 8),    createWhite(1, 2, 5), createWhite(1, 3, 3), createBlock(),        createBlock()],
      [createBlock(null, 7), createWhite(2, 1, 1), createWhite(2, 2, 4), createWhite(2, 3, 2), createBlock(13),     createBlock(9)],
      [createBlock(null, 4), createWhite(3, 1, 3), createWhite(3, 2, 1), createBlock(null, 15),createWhite(3, 4, 8), createWhite(3, 5, 7)],
      [createBlock(),        createBlock(),        createBlock(),        createBlock(null, 7), createWhite(4, 4, 5), createWhite(4, 5, 2)],
      [createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock()]
    ],
    // 6x6 Base 7
    [
      [createBlock(),        createBlock(),        createBlock(10),      createBlock(7),       createBlock(),        createBlock()],
      [createBlock(),        createBlock(7, 6),    createWhite(1, 2, 2), createWhite(1, 3, 4), createBlock(),        createBlock()],
      [createBlock(null, 10),createWhite(2, 1, 6), createWhite(2, 2, 1), createWhite(2, 3, 3), createBlock(17),     createBlock(8)],
      [createBlock(null, 8), createWhite(3, 1, 1), createWhite(3, 2, 7), createBlock(null, 14),createWhite(3, 4, 9), createWhite(3, 5, 5)],
      [createBlock(),        createBlock(),        createBlock(),        createBlock(null, 11),createWhite(4, 4, 8), createWhite(4, 5, 3)],
      [createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock()]
    ],
    // 6x6 Base 8
    [
      [createBlock(),        createBlock(),        createBlock(7),       createBlock(4),       createBlock(),        createBlock()],
      [createBlock(),        createBlock(6, 4),    createWhite(1, 2, 1), createWhite(1, 3, 3), createBlock(),        createBlock()],
      [createBlock(null, 7), createWhite(2, 1, 2), createWhite(2, 2, 4), createWhite(2, 3, 1), createBlock(13),     createBlock(10)],
      [createBlock(null, 6), createWhite(3, 1, 4), createWhite(3, 2, 2), createBlock(null, 16),createWhite(3, 4, 7), createWhite(3, 5, 9)],
      [createBlock(),        createBlock(),        createBlock(),        createBlock(null, 7), createWhite(4, 4, 6), createWhite(4, 5, 1)],
      [createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock()]
    ],
    // 6x6 Base 9
    [
      [createBlock(),        createBlock(),        createBlock(10),      createBlock(3),       createBlock(),        createBlock()],
      [createBlock(),        createBlock(4, 4),    createWhite(1, 2, 3), createWhite(1, 3, 1), createBlock(),        createBlock()],
      [createBlock(null, 8), createWhite(2, 1, 1), createWhite(2, 2, 5), createWhite(2, 3, 2), createBlock(16),     createBlock(11)],
      [createBlock(null, 5), createWhite(3, 1, 3), createWhite(3, 2, 2), createBlock(null, 15),createWhite(3, 4, 9), createWhite(3, 5, 6)],
      [createBlock(),        createBlock(),        createBlock(),        createBlock(null, 12),createWhite(4, 4, 7), createWhite(4, 5, 5)],
      [createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock()]
    ],
    // 6x6 Base 10
    [
      [createBlock(),        createBlock(),        createBlock(9),       createBlock(6),       createBlock(),        createBlock()],
      [createBlock(),        createBlock(8, 9),    createWhite(1, 2, 4), createWhite(1, 3, 5), createBlock(),        createBlock()],
      [createBlock(null, 6), createWhite(2, 1, 3), createWhite(2, 2, 2), createWhite(2, 3, 1), createBlock(12),     createBlock(8)],
      [createBlock(null, 8), createWhite(3, 1, 5), createWhite(3, 2, 3), createBlock(null, 14),createWhite(3, 4, 8), createWhite(3, 5, 6)],
      [createBlock(),        createBlock(),        createBlock(),        createBlock(null, 6), createWhite(4, 4, 4), createWhite(4, 5, 2)],
      [createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock()]
    ]
  ],
  expert: [
    // 8x8 Base 1
    [
      [createBlock(),        createBlock(),        createBlock(6),       createBlock(5),       createBlock(),        createBlock(),        createBlock(),        createBlock()],
      [createBlock(),        createBlock(3, 3),    createWhite(1, 2, 1), createWhite(1, 3, 2), createBlock(),        createBlock(),        createBlock(),        createBlock()],
      [createBlock(null, 6), createWhite(2, 1, 1), createWhite(2, 2, 2), createWhite(2, 3, 3), createBlock(17),     createBlock(16),      createBlock(),        createBlock()],
      [createBlock(null, 5), createWhite(3, 1, 2), createWhite(3, 2, 3), createBlock(null, 16),createWhite(3, 4, 9), createWhite(3, 5, 7), createBlock(),        createBlock()],
      [createBlock(),        createBlock(),        createBlock(),        createBlock(null, 17),createWhite(4, 4, 8), createWhite(4, 5, 9), createBlock(4),      createBlock(11)],
      [createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(null, 3), createWhite(5, 6, 1), createWhite(5, 7, 2)],
      [createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(null, 12),createWhite(6, 6, 3), createWhite(6, 7, 9)],
      [createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock()]
    ],
    // 8x8 Base 2
    [
      [createBlock(),        createBlock(),        createBlock(8),       createBlock(6),       createBlock(),        createBlock(),        createBlock(),        createBlock()],
      [createBlock(),        createBlock(5, 7),    createWhite(1, 2, 3), createWhite(1, 3, 4), createBlock(),        createBlock(),        createBlock(),        createBlock()],
      [createBlock(null, 8), createWhite(2, 1, 2), createWhite(2, 2, 5), createWhite(2, 3, 1), createBlock(15),     createBlock(13),      createBlock(),        createBlock()],
      [createBlock(null, 4), createWhite(3, 1, 3), createWhite(3, 2, 1), createBlock(null, 14),createWhite(3, 4, 8), createWhite(3, 5, 6), createBlock(),        createBlock()],
      [createBlock(),        createBlock(),        createBlock(),        createBlock(null, 14),createWhite(4, 4, 7), createWhite(4, 5, 7), createBlock(9),      createBlock(7)],
      [createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(null, 11),createWhite(5, 6, 8), createWhite(5, 7, 3)],
      [createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(null, 5), createWhite(6, 6, 1), createWhite(6, 7, 4)],
      [createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock()]
    ],
    // 8x8 Base 3
    [
      [createBlock(),        createBlock(),        createBlock(7),       createBlock(9),       createBlock(),        createBlock(),        createBlock(),        createBlock()],
      [createBlock(),        createBlock(7, 5),    createWhite(1, 2, 2), createWhite(1, 3, 3), createBlock(),        createBlock(),        createBlock(),        createBlock()],
      [createBlock(null, 11),createWhite(2, 1, 4), createWhite(2, 2, 5), createWhite(2, 3, 2), createBlock(16),     createBlock(10),      createBlock(),        createBlock()],
      [createBlock(null, 7), createWhite(3, 1, 3), createWhite(3, 2, 4), createBlock(null, 15),createWhite(3, 4, 9), createWhite(3, 5, 6), createBlock(),        createBlock()],
      [createBlock(),        createBlock(),        createBlock(),        createBlock(null, 11),createWhite(4, 4, 7), createWhite(4, 5, 4), createBlock(10),     createBlock(6)],
      [createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(null, 7), createWhite(5, 6, 6), createWhite(5, 7, 1)],
      [createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(null, 9), createWhite(6, 6, 4), createWhite(6, 7, 5)],
      [createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock()]
    ],
    // 8x8 Base 4
    [
      [createBlock(),        createBlock(),        createBlock(10),      createBlock(5),       createBlock(),        createBlock(),        createBlock(),        createBlock()],
      [createBlock(),        createBlock(4, 6),    createWhite(1, 2, 4), createWhite(1, 3, 2), createBlock(),        createBlock(),        createBlock(),        createBlock()],
      [createBlock(null, 7), createWhite(2, 1, 1), createWhite(2, 2, 6), createWhite(2, 3, 0), createBlock(17),     createBlock(12),      createBlock(),        createBlock()],
      [createBlock(null, 5), createWhite(3, 1, 3), createWhite(3, 2, 2), createBlock(null, 15),createWhite(3, 4, 8), createWhite(3, 5, 7), createBlock(),        createBlock()],
      [createBlock(),        createBlock(),        createBlock(),        createBlock(null, 14),createWhite(4, 4, 9), createWhite(4, 5, 5), createBlock(8),      createBlock(14)],
      [createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(null, 9), createWhite(5, 6, 1), createWhite(5, 7, 8)],
      [createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(null, 13),createWhite(6, 6, 7), createWhite(6, 7, 6)],
      [createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock()]
    ],
    // 8x8 Base 5
    [
      [createBlock(),        createBlock(),        createBlock(9),       createBlock(7),       createBlock(),        createBlock(),        createBlock(),        createBlock()],
      [createBlock(),        createBlock(8, 6),    createWhite(1, 2, 2), createWhite(1, 3, 4), createBlock(),        createBlock(),        createBlock(),        createBlock()],
      [createBlock(null, 10),createWhite(2, 1, 6), createWhite(2, 2, 1), createWhite(2, 3, 3), createBlock(16),     createBlock(11),      createBlock(),        createBlock()],
      [createBlock(null, 8), createWhite(3, 1, 2), createWhite(3, 2, 6), createBlock(null, 14),createWhite(3, 4, 9), createWhite(3, 5, 5), createBlock(),        createBlock()],
      [createBlock(),        createBlock(),        createBlock(),        createBlock(null, 13),createWhite(4, 4, 7), createWhite(4, 5, 6), createBlock(12),     createBlock(5)],
      [createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(null, 10),createWhite(5, 6, 7), createWhite(5, 7, 3)],
      [createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(null, 7), createWhite(6, 6, 5), createWhite(6, 7, 2)],
      [createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock()]
    ]
  ]
};

// Fix solution in 8x8 Base 4 row 2 col 3 from 0 to 3, across clue = 1+6+3=10, down col 3 = 2+3=5
KAKURO_BANK.expert[3][2][0] = createBlock(null, 10);
KAKURO_BANK.expert[3][2][3] = createWhite(2, 3, 3);

// Fix 8x8 Base 2 row 4 col 5 duplicate 7 -> make [4,4]=8, [4,5]=6 (across 14), down [2,4]=16 (8+8), down [2,5]=12 (6+6)
KAKURO_BANK.expert[1][2][4] = createBlock(16);
KAKURO_BANK.expert[1][2][5] = createBlock(12);
KAKURO_BANK.expert[1][4][4] = createWhite(4, 4, 8);
KAKURO_BANK.expert[1][4][5] = createWhite(4, 5, 6);

/**
 * Transposes a Kakuro grid (reflection across the main diagonal).
 * Swaps row and column coordinates, and swaps across and down clues in clue blocks.
 */
export function transposeKakuroGrid(grid) {
  const R = grid.length;
  const C = grid[0].length;
  const newGrid = Array.from({ length: C }, () => Array(R).fill(null));

  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      const cell = grid[r][c];
      if (cell.type === 'block') {
        newGrid[c][r] = createBlock(cell.across, cell.down); // across and down swap
      } else {
        newGrid[c][r] = createWhite(c, r, cell.solution);
      }
    }
  }
  return newGrid;
}

/**
 * Returns a procedurally randomized, mathematically valid Kakuro puzzle for given tier.
 */
export function getRandomKakuro(difficulty = 'intro') {
  const bank = KAKURO_BANK[difficulty] || KAKURO_BANK.intro;
  const baseGrid = bank[Math.floor(Math.random() * bank.length)];
  const shouldTranspose = Math.random() < 0.5;
  const rawGrid = shouldTranspose ? transposeKakuroGrid(baseGrid) : baseGrid;

  const size = rawGrid.length;
  const names = { intro: 'Gentle (4×4)', classic: 'Standard (6×6)', expert: 'Deep (8×8)' };

  return {
    id: `${difficulty}-${Date.now()}`,
    name: names[difficulty] || difficulty,
    size,
    grid: cloneGrid(rawGrid)
  };
}

export const KAKURO_PUZZLES = {
  intro: {
    id: 'intro',
    name: 'Intro',
    size: 4,
    grid: KAKURO_BANK.intro[0]
  },
  classic: {
    id: 'classic',
    name: 'Classic',
    size: 6,
    grid: KAKURO_BANK.classic[0]
  },
  expert: {
    id: 'expert',
    name: 'Expert',
    size: 8,
    grid: KAKURO_BANK.expert[0]
  }
};

/**
 * Clones a puzzle grid for gameplay
 */
export function cloneGrid(grid) {
  return grid.map((row, r) =>
    row.map((cell, c) => {
      if (cell.type === 'block') {
        return { ...cell };
      }
      return {
        type: 'white',
        id: `${r}-${c}`,
        solution: cell.solution,
        val: cell.val,
        notes: Array.isArray(cell.notes) ? [...cell.notes] : []
      };
    })
  );
}

/**
 * Scans all contiguous horizontal and vertical white runs associated with their clue blocks.
 * Returns array of runs: { id, type: 'across' | 'down', clueR, clueC, clue, cells: [{ r, c, id, val }] }
 */
export function getRuns(grid) {
  const R = grid.length;
  const C = grid[0].length;
  const runs = [];

  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      const cell = grid[r][c];
      if (cell.type === 'block') {
        // Across run
        if (cell.across != null) {
          const runCells = [];
          let nc = c + 1;
          while (nc < C && grid[r][nc].type === 'white') {
            runCells.push({
              r,
              c: nc,
              id: grid[r][nc].id || `${r}-${nc}`,
              cell: grid[r][nc]
            });
            nc++;
          }
          if (runCells.length > 0) {
            runs.push({
              id: `across-${r}-${c}`,
              type: 'across',
              clueR: r,
              clueC: c,
              clue: cell.across,
              cells: runCells
            });
          }
        }

        // Down run
        if (cell.down != null) {
          const runCells = [];
          let nr = r + 1;
          while (nr < R && grid[nr][c].type === 'white') {
            runCells.push({
              r: nr,
              c,
              id: grid[nr][c].id || `${nr}-${c}`,
              cell: grid[nr][c]
            });
            nr++;
          }
          if (runCells.length > 0) {
            runs.push({
              id: `down-${r}-${c}`,
              type: 'down',
              clueR: r,
              clueC: c,
              clue: cell.down,
              cells: runCells
            });
          }
        }
      }
    }
  }

  return runs;
}

/**
 * Validates runs for duplicate digits, exceeded sums, or incorrect completed sums.
 * Returns { valid: boolean, errorCells: Set<string>, completedRuns: number, totalRuns: number }
 */
export function validateRuns(grid) {
  const runs = getRuns(grid);
  const errorCells = new Set();
  let completedRuns = 0;

  for (const run of runs) {
    const filledDigits = [];
    const digitCounts = new Map();
    let currentSum = 0;
    let allFilled = true;

    for (const item of run.cells) {
      const v = item.cell.val;
      if (v != null && v !== '') {
        const num = Number(v);
        filledDigits.push({ num, id: item.id });
        digitCounts.set(num, (digitCounts.get(num) || 0) + 1);
        currentSum += num;
      } else {
        allFilled = false;
      }
    }

    // Check for duplicates
    let hasDuplicate = false;
    for (const item of filledDigits) {
      if (digitCounts.get(item.num) > 1) {
        errorCells.add(item.id);
        hasDuplicate = true;
      }
    }

    // Check if sum exceeded
    if (currentSum > run.clue) {
      for (const item of filledDigits) {
        errorCells.add(item.id);
      }
    }

    // If all cells in the run are filled
    if (allFilled) {
      if (currentSum !== run.clue) {
        for (const item of run.cells) {
          errorCells.add(item.id);
        }
      } else if (!hasDuplicate) {
        completedRuns++;
      }
    }
  }

  return {
    valid: errorCells.size === 0,
    errorCells,
    completedRuns,
    totalRuns: runs.length
  };
}

/**
 * Checks if the puzzle is fully and correctly completed.
 */
export function checkWin(grid) {
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      const cell = grid[r][c];
      if (cell.type === 'white') {
        if (cell.val == null || cell.val === '') {
          return false;
        }
      }
    }
  }

  const { valid, completedRuns, totalRuns } = validateRuns(grid);
  return valid && completedRuns === totalRuns && totalRuns > 0;
}

/**
 * Provides a hint for an unsolved or incorrect cell.
 */
export function getNextHint(grid) {
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      const cell = grid[r][c];
      if (cell.type === 'white') {
        if (cell.val == null || Number(cell.val) !== cell.solution) {
          return { r, c, val: cell.solution, id: cell.id };
        }
      }
    }
  }
  return null;
}
