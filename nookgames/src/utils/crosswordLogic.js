// Crossword Logic Engine & Mini Puzzle Sets for nookgames

export const DIFFICULTIES = {
  beginner: {
    id: 'beginner',
    name: 'Beginner',
    label: '5×5 Mini',
    gridSize: { rows: 5, cols: 5 },
  },
  intermediate: {
    id: 'intermediate',
    name: 'Intermediate',
    label: '6×6 Mini',
    gridSize: { rows: 6, cols: 6 },
  },
  master: {
    id: 'master',
    name: 'Master',
    label: '7×7 Classic',
    gridSize: { rows: 7, cols: 7 },
  },
};

export const PUZZLES = {
  beginner: {
    id: 'beginner-1',
    difficulty: 'beginner',
    gridSize: { rows: 5, cols: 5 },
    // Grid Solution (# = black block)
    // # C A M P
    // C A R O L
    // A R E N A
    // M O N E Y
    // P L A Y #
    grid: [
      ['#', 'C', 'A', 'M', 'P'],
      ['C', 'A', 'R', 'O', 'L'],
      ['A', 'R', 'E', 'N', 'A'],
      ['M', 'O', 'N', 'E', 'Y'],
      ['P', 'L', 'A', 'Y', '#'],
    ],
    clues: {
      across: [
        { number: 1, row: 0, col: 1, answer: 'CAMP', clue: 'Outdoor sleeping spot with tents' },
        { number: 5, row: 1, col: 0, answer: 'CAROL', clue: 'Festive holiday song' },
        { number: 6, row: 2, col: 0, answer: 'ARENA', clue: 'Stadium for sports or concerts' },
        { number: 7, row: 3, col: 0, answer: 'MONEY', clue: 'Paper or metal currency' },
        { number: 8, row: 4, col: 0, answer: 'PLAY', clue: 'Theatrical performance or drama' },
      ],
      down: [
        { number: 1, row: 0, col: 1, answer: 'CAROL', clue: 'Festive holiday song' },
        { number: 2, row: 0, col: 2, answer: 'ARENA', clue: 'Stadium for sports or concerts' },
        { number: 3, row: 0, col: 3, answer: 'MONEY', clue: 'Paper or metal currency' },
        { number: 4, row: 0, col: 4, answer: 'PLAY', clue: 'Theatrical performance or drama' },
        { number: 5, row: 1, col: 0, answer: 'CAMP', clue: 'Outdoor sleeping spot with tents' },
      ],
    },
  },

  intermediate: {
    id: 'intermediate-1',
    difficulty: 'intermediate',
    gridSize: { rows: 6, cols: 6 },
    // Grid Solution (# = black block)
    // # S P A R K
    // C A P T O R
    // A L I G N S
    // M E N T O R
    // P I S T O N
    // S T O R E #
    grid: [
      ['#', 'S', 'P', 'A', 'R', 'K'],
      ['C', 'A', 'P', 'T', 'O', 'R'],
      ['A', 'L', 'I', 'G', 'N', 'S'],
      ['M', 'E', 'N', 'T', 'O', 'R'],
      ['P', 'I', 'S', 'T', 'O', 'N'],
      ['S', 'T', 'O', 'R', 'E', '#'],
    ],
    clues: {
      across: [
        { number: 1, row: 0, col: 1, answer: 'SPARK', clue: 'Flicker of flame or quick idea' },
        { number: 5, row: 1, col: 0, answer: 'CAPTOR', clue: 'One who holds a prisoner' },
        { number: 6, row: 2, col: 0, answer: 'ALIGNS', clue: 'Arranges in a straight line' },
        { number: 7, row: 3, col: 0, answer: 'MENTOR', clue: 'Trusted guide or advisor' },
        { number: 8, row: 4, col: 0, answer: 'PISTON', clue: 'Engine cylinder component' },
        { number: 9, row: 5, col: 0, answer: 'STORE', clue: 'Keep for later or retail shop' },
      ],
      down: [
        { number: 1, row: 0, col: 1, answer: 'SALES', clue: 'Transactions or retail discounts' },
        { number: 2, row: 0, col: 2, answer: 'PAINTS', clue: 'Pigments used by artists' },
        { number: 3, row: 0, col: 3, answer: 'ATLAS', clue: 'Book of geographic maps' },
        { number: 4, row: 0, col: 4, answer: 'REINS', clue: 'Harness straps to guide a horse' },
        { number: 5, row: 1, col: 0, answer: 'CAMPS', clue: 'Outdoor tent lodgings' },
        { number: 6, row: 0, col: 5, answer: 'KNOTS', clue: 'Fastenings tied in rope' },
      ],
    },
  },

  master: {
    id: 'master-1',
    difficulty: 'master',
    gridSize: { rows: 7, cols: 7 },
    // Grid Solution (# = black block)
    // # # C R A N E
    // # S P A R K S
    // P L A N E T S
    // A L I B I S #
    // C A S T L E #
    // E N D E D # #
    // S T E P # # #
    grid: [
      ['#', '#', 'C', 'R', 'A', 'N', 'E'],
      ['#', 'S', 'P', 'A', 'R', 'K', 'S'],
      ['P', 'L', 'A', 'N', 'E', 'T', 'S'],
      ['A', 'L', 'I', 'B', 'I', 'S', '#'],
      ['C', 'A', 'S', 'T', 'L', 'E', '#'],
      ['E', 'N', 'D', 'E', 'D', '#', '#'],
      ['S', 'T', 'E', 'P', '#', '#', '#'],
    ],
    clues: {
      across: [
        { number: 1, row: 0, col: 2, answer: 'CRANE', clue: 'Tall wading bird or hoisting machine' },
        { number: 5, row: 1, col: 1, answer: 'SPARKS', clue: 'Flickers of fire or brilliance' },
        { number: 6, row: 2, col: 0, answer: 'PLANETS', clue: 'Celestial bodies orbiting stars' },
        { number: 7, row: 3, col: 0, answer: 'ALIBIS', clue: 'Proofs of presence elsewhere' },
        { number: 8, row: 4, col: 0, answer: 'CASTLE', clue: 'Fortified medieval fortress' },
        { number: 9, row: 5, col: 0, answer: 'ENDED', clue: 'Finished or concluded' },
        { number: 10, row: 6, col: 0, answer: 'STEP', clue: 'Footfall or stride' },
      ],
      down: [
        { number: 1, row: 0, col: 2, answer: 'CAPITAL', clue: 'Primary city or seat of power' },
        { number: 2, row: 0, col: 3, answer: 'RANKS', clue: 'Hierarchical positions or rows' },
        { number: 3, row: 0, col: 4, answer: 'ARTIST', clue: 'Creative painter or sculptor' },
        { number: 4, row: 0, col: 5, answer: 'NESTS', clue: 'Bird dwellings built for eggs' },
        { number: 5, row: 1, col: 1, answer: 'SLANTS', clue: 'Leans or inclines to one side' },
        { number: 6, row: 2, col: 0, answer: 'PACES', clue: 'Walks at a steady speed' },
        { number: 7, row: 0, col: 6, answer: 'SEES', clue: 'Perceives with the eyes' },
      ],
    },
  },
};

/**
 * Pre-computes cell numbers, word spans, and lookup tables for a puzzle.
 */
export function getPuzzle(difficulty = 'beginner') {
  const puzzle = PUZZLES[difficulty] || PUZZLES.beginner;
  const { rows, cols } = puzzle.gridSize;

  // Build cell numbers map (key: "r-c", val: number)
  const cellNumbers = {};
  const allClues = [...puzzle.clues.across, ...puzzle.clues.down];
  allClues.forEach((clue) => {
    cellNumbers[`${clue.row}-${clue.col}`] = clue.number;
  });

  // Map cells to active Across and Down clues
  const cellClues = {};
  puzzle.clues.across.forEach((clue) => {
    for (let c = clue.col; c < clue.col + clue.answer.length; c++) {
      const key = `${clue.row}-${c}`;
      if (!cellClues[key]) cellClues[key] = {};
      cellClues[key].across = clue;
    }
  });

  puzzle.clues.down.forEach((clue) => {
    for (let r = clue.row; r < clue.row + clue.answer.length; r++) {
      const key = `${r}-${clue.col}`;
      if (!cellClues[key]) cellClues[key] = {};
      cellClues[key].down = clue;
    }
  });

  return {
    ...puzzle,
    cellNumbers,
    cellClues,
  };
}

/**
 * Creates an empty player grid initialized with empty strings for playable cells and '#' for black cells.
 */
export function createPlayerGrid(puzzle) {
  const { rows, cols } = puzzle.gridSize;
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => (puzzle.grid[r][c] === '#' ? '#' : ''))
  );
}

/**
 * Checks if the player's grid completely matches the puzzle solution.
 */
export function isSolved(playerGrid, puzzle) {
  const { rows, cols } = puzzle.gridSize;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (puzzle.grid[r][c] === '#') continue;
      const playerChar = (playerGrid[r]?.[c] || '').toUpperCase();
      const solutionChar = (puzzle.grid[r][c] || '').toUpperCase();
      if (playerChar !== solutionChar) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Checks if a specific clue is fully and correctly answered by the player.
 */
export function isClueSolved(clue, direction, playerGrid) {
  const { row, col, answer } = clue;
  for (let i = 0; i < answer.length; i++) {
    const r = direction === 'across' ? row : row + i;
    const c = direction === 'across' ? col + i : col;
    const char = (playerGrid[r]?.[c] || '').toUpperCase();
    if (char !== answer[i].toUpperCase()) return false;
  }
  return true;
}

/**
 * Gets cells that belong to a specific clue.
 */
export function getClueCells(clue, direction) {
  const cells = [];
  const { row, col, answer } = clue;
  for (let i = 0; i < answer.length; i++) {
    const r = direction === 'across' ? row : row + i;
    const c = direction === 'across' ? col + i : col;
    cells.push({ r, c });
  }
  return cells;
}

/**
 * Finds next playable cell in current direction.
 */
export function getNextCell(r, c, direction, puzzle) {
  const clue = puzzle.cellClues[`${r}-${c}`]?.[direction];
  if (!clue) return { r, c };

  const clueCells = getClueCells(clue, direction);
  const currentIndex = clueCells.findIndex((cell) => cell.r === r && cell.c === c);

  if (currentIndex !== -1 && currentIndex < clueCells.length - 1) {
    return clueCells[currentIndex + 1];
  }
  return { r, c };
}

/**
 * Finds previous playable cell in current direction.
 */
export function getPrevCell(r, c, direction, puzzle) {
  const clue = puzzle.cellClues[`${r}-${c}`]?.[direction];
  if (!clue) return { r, c };

  const clueCells = getClueCells(clue, direction);
  const currentIndex = clueCells.findIndex((cell) => cell.r === r && cell.c === c);

  if (currentIndex > 0) {
    return clueCells[currentIndex - 1];
  }
  return { r, c };
}
