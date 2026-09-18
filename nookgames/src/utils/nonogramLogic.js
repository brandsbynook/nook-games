/**
 * nonogramLogic.js — Core Game Engine & Curated Puzzles for Nonogram (Picross)
 * Supports 3 difficulty tiers: Beginner (5×5), Intermediate (10×10), Expert (15×15).
 */

export const CELL_STATES = {
  EMPTY: 0,
  FILLED: 1,
  CROSSED: 2, // User-flagged empty space with an 'X'
}

export const DIFFICULTY_TIERS = {
  beginner: {
    id: 'beginner',
    label: 'Beginner',
    size: 5,
    description: '5×5 grid with approachable deductive runs',
  },
  intermediate: {
    id: 'intermediate',
    label: 'Intermediate',
    size: 10,
    description: '10×10 grid with balanced multi-line deduction',
  },
  expert: {
    id: 'expert',
    label: 'Expert',
    size: 15,
    description: '15×15 grid with deep cross-referencing',
  },
}

/**
 * Computes consecutive run lengths for a single row or column.
 * An all-empty line returns [0].
 *
 * @param {number[]} line Array of 0s and 1s (or CELL_STATES)
 * @returns {number[]} Array of contiguous run lengths
 */
export function computeLineClues(line) {
  const clues = []
  let currentRun = 0

  for (let i = 0; i < line.length; i++) {
    const isFilled = line[i] === 1 || line[i] === CELL_STATES.FILLED
    if (isFilled) {
      currentRun++
    } else if (currentRun > 0) {
      clues.push(currentRun)
      currentRun = 0
    }
  }

  if (currentRun > 0) {
    clues.push(currentRun)
  }

  return clues.length > 0 ? clues : [0]
}

/**
 * Computes all row and column clues for a 2D solution grid.
 *
 * @param {number[][]} solution 2D array (rows x cols)
 * @returns {{ rowClues: number[][], colClues: number[][] }}
 */
export function generatePuzzleClues(solution) {
  const rowCount = solution.length
  const colCount = solution[0].length

  const rowClues = []
  for (let r = 0; r < rowCount; r++) {
    rowClues.push(computeLineClues(solution[r]))
  }

  const colClues = []
  for (let c = 0; c < colCount; c++) {
    const col = []
    for (let r = 0; r < rowCount; r++) {
      col.push(solution[r][c])
    }
    colClues.push(computeLineClues(col))
  }

  return { rowClues, colClues }
}

/**
 * Curated iconic and geometric puzzles for each tier.
 */
export const PUZZLES = {
  beginner: [
    {
      id: 'beg-heart',
      title: 'Heart',
      size: 5,
      solution: [
        [0, 1, 0, 1, 0],
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
        [0, 1, 1, 1, 0],
        [0, 0, 1, 0, 0],
      ],
    },
    {
      id: 'beg-smile',
      title: 'Smile',
      size: 5,
      solution: [
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [0, 0, 0, 0, 0],
        [1, 0, 0, 0, 1],
        [0, 1, 1, 1, 0],
      ],
    },
    {
      id: 'beg-arrow',
      title: 'Arrow',
      size: 5,
      solution: [
        [0, 0, 1, 0, 0],
        [0, 1, 1, 1, 0],
        [1, 0, 1, 0, 1],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
      ],
    },
    {
      id: 'beg-tree',
      title: 'Pine Tree',
      size: 5,
      solution: [
        [0, 0, 1, 0, 0],
        [0, 1, 1, 1, 0],
        [1, 1, 1, 1, 1],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
      ],
    },
    {
      id: 'beg-diamond',
      title: 'Diamond',
      size: 5,
      solution: [
        [0, 0, 1, 0, 0],
        [0, 1, 0, 1, 0],
        [1, 0, 0, 0, 1],
        [0, 1, 0, 1, 0],
        [0, 0, 1, 0, 0],
      ],
    },
  ],

  intermediate: [
    {
      id: 'int-anchor',
      title: 'Anchor',
      size: 10,
      solution: [
        [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
        [1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
        [1, 1, 0, 0, 1, 1, 0, 0, 1, 1],
        [0, 1, 1, 0, 1, 1, 0, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
      ],
    },
    {
      id: 'int-mushroom',
      title: 'Mushroom',
      size: 10,
      solution: [
        [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 0, 1, 1, 0, 1, 1, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
      ],
    },
    {
      id: 'int-cup',
      title: 'Tea Cup',
      size: 10,
      solution: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 1, 1, 1, 1, 1, 1, 0, 1, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],
    },
    {
      id: 'int-key',
      title: 'Skeleton Key',
      size: 10,
      solution: [
        [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
      ],
    },
    {
      id: 'int-hourglass',
      title: 'Hourglass',
      size: 10,
      solution: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      ],
    },
  ],

  expert: [
    {
      id: 'exp-sword',
      title: 'Broadsword',
      size: 15,
      solution: [
        [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
      ],
    },
    {
      id: 'exp-castle',
      title: 'Castle Fortress',
      size: 15,
      solution: [
        [0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0],
        [0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0],
        [0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0],
        [0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0],
        [0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
        [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
        [1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      ],
    },
    {
      id: 'exp-sailboat',
      title: 'Sailboat',
      size: 15,
      solution: [
        [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1],
      ],
    },
    {
      id: 'exp-cat',
      title: 'Midnight Cat',
      size: 15,
      solution: [
        [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
        [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
        [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
        [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
        [1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1],
        [0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0],
      ],
    },
  ],
}

/**
 * Creates an empty grid of given dimensions.
 */
export function createEmptyGrid(size) {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => CELL_STATES.EMPTY)
  )
}

/**
 * Loads a puzzle with pre-computed clues, optionally applying symmetry reflections
 * (horizontal / vertical flip) to generate fresh solvable variations.
 *
 * @param {string} tier 'beginner' | 'intermediate' | 'expert'
 * @param {number} puzzleIndex index within tier
 * @param {{ transform?: boolean }} options
 * @returns {object} puzzle data with rowClues, colClues, etc.
 */
export function loadPuzzle(tier = 'beginner', puzzleIndex = 0, { transform = true } = {}) {
  const tierPuzzles = PUZZLES[tier] || PUZZLES.beginner
  const safeIndex = Math.max(0, Math.min(puzzleIndex, tierPuzzles.length - 1))
  const puzzle = tierPuzzles[safeIndex]

  let solution = puzzle.solution.map((row) => [...row])
  if (transform) {
    if (Math.random() < 0.5) {
      solution = solution.map((row) => [...row].reverse())
    }
    if (Math.random() < 0.5) {
      solution = [...solution].reverse()
    }
  }

  const { rowClues, colClues } = generatePuzzleClues(solution)

  return {
    ...puzzle,
    solution,
    tier,
    index: safeIndex,
    totalInTier: tierPuzzles.length,
    rowClues,
    colClues,
  }
}

/**
 * Validates whether the player's grid matches the solution.
 * Ignores CROSSED vs EMPTY non-solution cells.
 *
 * @param {number[][]} currentGrid Player grid
 * @param {number[][]} solutionGrid True solution grid
 * @returns {boolean} true if all filled cells match solution exactly
 */
export function isPuzzleSolved(currentGrid, solutionGrid) {
  const rows = solutionGrid.length
  const cols = solutionGrid[0].length

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isTargetFilled = solutionGrid[r][c] === 1
      const isUserFilled = currentGrid[r][c] === CELL_STATES.FILLED

      if (isTargetFilled !== isUserFilled) {
        return false
      }
    }
  }

  return true
}

/**
 * Deductive check assistant: validates whether currently placed filled cells
 * contradict the solution (pure logic assistance, no unearned reveals).
 *
 * @param {number[][]} currentGrid
 * @param {number[][]} solutionGrid
 * @returns {{ hasErrors: boolean, count: number, errorCells: Array<{r: number, c: number}>, message: string }}
 */
export function checkDeductiveErrors(currentGrid, solutionGrid) {
  const errorCells = []
  const rows = solutionGrid.length
  const cols = solutionGrid[0].length

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // If user marked as FILLED, but solution has 0 -> error
      if (currentGrid[r][c] === CELL_STATES.FILLED && solutionGrid[r][c] === 0) {
        errorCells.push({ r, c })
      }
    }
  }

  if (errorCells.length === 0) {
    return {
      hasErrors: false,
      count: 0,
      errorCells: [],
      message: 'All filled tiles are consistent with the clues.',
    }
  }

  return {
    hasErrors: true,
    count: errorCells.length,
    errorCells,
    message: `${errorCells.length} misplaced ${
      errorCells.length === 1 ? 'tile contradicts' : 'tiles contradict'
    } the clues.`,
  }
}

/**
 * Checks whether a row or column's current FILLED runs match the target clues.
 *
 * @param {number[]} line Array of CELL_STATES
 * @param {number[]} targetClues Array of numbers (e.g. [1, 3])
 * @returns {boolean}
 */
export function isLineSatisfied(line, targetClues) {
  const currentClues = computeLineClues(line)
  if (currentClues.length !== targetClues.length) return false
  for (let i = 0; i < currentClues.length; i++) {
    if (currentClues[i] !== targetClues[i]) return false
  }
  return true
}
