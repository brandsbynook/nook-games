// Kakuro Logic Engine and Curated Puzzles

function createBlock(down = null, across = null) {
  return { type: 'block', across, down };
}

function createWhite(r, c, solution) {
  return {
    type: 'white',
    id: `${r}-${c}`,
    solution,
    val: null,
    notes: []
  };
}

// Curated boards:
// 1. intro (4x4)
// 2. classic (6x6)
// 3. expert (8x8)

export const KAKURO_PUZZLES = {
  intro: {
    id: 'intro',
    name: 'Intro',
    size: 4,
    grid: [
      [createBlock(),           createBlock(4),      createBlock(11),     createBlock()],
      [createBlock(null, 3),    createWhite(1, 1, 1), createWhite(1, 2, 2), createBlock()],
      [createBlock(null, 12),   createWhite(2, 1, 3), createWhite(2, 2, 9), createBlock()],
      [createBlock(),           createBlock(),       createBlock(),       createBlock()]
    ]
  },
  classic: {
    id: 'classic',
    name: 'Classic',
    size: 6,
    grid: [
      [createBlock(),        createBlock(),        createBlock(6),       createBlock(5),       createBlock(),        createBlock()],
      [createBlock(),        createBlock(3, 3),    createWhite(1, 2, 1), createWhite(1, 3, 2), createBlock(),        createBlock()],
      [createBlock(null, 6), createWhite(2, 1, 1), createWhite(2, 2, 2), createWhite(2, 3, 3), createBlock(17),     createBlock(8)],
      [createBlock(null, 5), createWhite(3, 1, 2), createWhite(3, 2, 3), createBlock(null, 16),createWhite(3, 4, 9), createWhite(3, 5, 7)],
      [createBlock(),        createBlock(),        createBlock(),        createBlock(null, 9), createWhite(4, 4, 8), createWhite(4, 5, 1)],
      [createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock()]
    ]
  },
  expert: {
    id: 'expert',
    name: 'Expert',
    size: 8,
    grid: [
      [createBlock(),        createBlock(),        createBlock(6),       createBlock(5),       createBlock(),        createBlock(),        createBlock(),        createBlock()],
      [createBlock(),        createBlock(3, 3),    createWhite(1, 2, 1), createWhite(1, 3, 2), createBlock(),        createBlock(),        createBlock(),        createBlock()],
      [createBlock(null, 6), createWhite(2, 1, 1), createWhite(2, 2, 2), createWhite(2, 3, 3), createBlock(17),     createBlock(16),      createBlock(),        createBlock()],
      [createBlock(null, 5), createWhite(3, 1, 2), createWhite(3, 2, 3), createBlock(null, 16),createWhite(3, 4, 9), createWhite(3, 5, 7), createBlock(),        createBlock()],
      [createBlock(),        createBlock(),        createBlock(),        createBlock(null, 17),createWhite(4, 4, 8), createWhite(4, 5, 9), createBlock(4),      createBlock(11)],
      [createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(null, 3), createWhite(5, 6, 1), createWhite(5, 7, 2)],
      [createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(null, 12),createWhite(6, 6, 3), createWhite(6, 7, 9)],
      [createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock(),        createBlock()]
    ]
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
