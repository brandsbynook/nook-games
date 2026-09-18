/**
 * sudokuPuzzles.js — Pre-validated 9x9 Sudoku puzzles
 * Each puzzle has guaranteed unique solution and clean deduction paths.
 */

export const SUDOKU_PRESETS = [
  {
    id: 'easy-1',
    difficulty: 'Easy',
    subtitle: 'Gentle deduction',
    initial: [
      5, 3, 0, 0, 7, 0, 0, 0, 0,
      6, 0, 0, 1, 9, 5, 0, 0, 0,
      0, 9, 8, 0, 0, 0, 0, 6, 0,
      8, 0, 0, 0, 6, 0, 0, 0, 3,
      4, 0, 0, 8, 0, 3, 0, 0, 1,
      7, 0, 0, 0, 2, 0, 0, 0, 6,
      0, 6, 0, 0, 0, 0, 2, 8, 0,
      0, 0, 0, 4, 1, 9, 0, 0, 5,
      0, 0, 0, 0, 8, 0, 0, 7, 9,
    ],
    solution: [
      5, 3, 4, 6, 7, 8, 9, 1, 2,
      6, 7, 2, 1, 9, 5, 3, 4, 8,
      1, 9, 8, 3, 4, 2, 5, 6, 7,
      8, 5, 9, 7, 6, 1, 4, 2, 3,
      4, 2, 6, 8, 5, 3, 7, 9, 1,
      7, 1, 3, 9, 2, 4, 8, 5, 6,
      9, 6, 1, 5, 3, 7, 2, 8, 4,
      2, 8, 7, 4, 1, 9, 6, 3, 5,
      3, 4, 5, 2, 8, 6, 1, 7, 9,
    ],
  },
  {
    id: 'peaceful-1',
    difficulty: 'Peaceful',
    subtitle: 'Harmonious flow',
    initial: [
      0, 0, 0, 2, 6, 0, 7, 0, 1,
      6, 8, 0, 0, 7, 0, 0, 9, 0,
      1, 9, 0, 0, 0, 4, 5, 0, 0,
      8, 2, 0, 1, 0, 0, 0, 4, 0,
      0, 0, 4, 6, 0, 2, 9, 0, 0,
      0, 5, 0, 0, 0, 3, 0, 2, 8,
      0, 0, 9, 3, 0, 0, 0, 7, 4,
      0, 4, 0, 0, 5, 0, 0, 3, 6,
      7, 0, 3, 0, 1, 8, 0, 0, 0,
    ],
    solution: [
      4, 3, 5, 2, 6, 9, 7, 8, 1,
      6, 8, 2, 5, 7, 1, 4, 9, 3,
      1, 9, 7, 8, 3, 4, 5, 6, 2,
      8, 2, 6, 1, 9, 5, 3, 4, 7,
      3, 7, 4, 6, 8, 2, 9, 1, 5,
      9, 5, 1, 7, 4, 3, 6, 2, 8,
      5, 1, 9, 3, 2, 6, 8, 7, 4,
      2, 4, 8, 9, 5, 7, 1, 3, 6,
      7, 6, 3, 4, 1, 8, 2, 5, 9,
    ],
  },
  {
    id: 'moderate-1',
    difficulty: 'Moderate',
    subtitle: 'Quiet focus',
    initial: [
      0, 0, 0, 6, 0, 0, 4, 0, 0,
      7, 0, 0, 0, 0, 3, 6, 0, 0,
      0, 0, 0, 0, 9, 1, 0, 8, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 5, 0, 1, 8, 0, 0, 0, 3,
      0, 0, 0, 3, 0, 6, 0, 4, 5,
      0, 4, 0, 2, 0, 0, 0, 6, 0,
      9, 0, 3, 0, 0, 0, 0, 0, 0,
      0, 2, 0, 0, 0, 0, 1, 0, 0,
    ],
    solution: [
      5, 8, 1, 6, 7, 2, 4, 3, 9,
      7, 9, 2, 8, 4, 3, 6, 5, 1,
      3, 6, 4, 5, 9, 1, 7, 8, 2,
      4, 3, 8, 9, 5, 7, 2, 1, 6,
      2, 5, 6, 1, 8, 4, 9, 7, 3,
      1, 7, 9, 3, 2, 6, 8, 4, 5,
      8, 4, 5, 2, 1, 9, 3, 6, 7,
      9, 1, 3, 7, 6, 8, 5, 2, 4,
      6, 2, 7, 4, 3, 5, 1, 9, 8,
    ],
  },
]

/**
 * Transforms a Sudoku preset into an isomorphic, fresh layout:
 * - Digit relabelling (random permutation of numbers 1–9)
 * - Symmetries: horizontal flip, vertical flip, diagonal transposition
 * - Row swaps within 3×3 blocks
 * - Column swaps within 3×3 blocks
 */
export function generateTransformedPreset(preset) {
  let initial = [...preset.initial]
  let solution = [...preset.solution]

  // 1. Permute digits 1-9
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[digits[i], digits[j]] = [digits[j], digits[i]]
  }
  const mapDigit = (val) => (val === 0 ? 0 : digits[val - 1])
  initial = initial.map(mapDigit)
  solution = solution.map(mapDigit)

  // 2. Convert to 9x9 grid
  let initGrid = []
  let solGrid = []
  for (let r = 0; r < 9; r++) {
    initGrid.push(initial.slice(r * 9, r * 9 + 9))
    solGrid.push(solution.slice(r * 9, r * 9 + 9))
  }

  // 3. Row swapping within blocks (rows 0..2, 3..5, 6..8)
  for (let block = 0; block < 3; block++) {
    const indices = [0, 1, 2]
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[indices[i], indices[j]] = [indices[j], indices[i]]
    }
    const base = block * 3
    const subInit = [initGrid[base + indices[0]], initGrid[base + indices[1]], initGrid[base + indices[2]]]
    const subSol = [solGrid[base + indices[0]], solGrid[base + indices[1]], solGrid[base + indices[2]]]
    initGrid[base] = subInit[0]
    initGrid[base + 1] = subInit[1]
    initGrid[base + 2] = subInit[2]
    solGrid[base] = subSol[0]
    solGrid[base + 1] = subSol[1]
    solGrid[base + 2] = subSol[2]
  }

  // 4. Column swapping within blocks (cols 0..2, 3..5, 6..8)
  for (let block = 0; block < 3; block++) {
    const indices = [0, 1, 2]
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[indices[i], indices[j]] = [indices[j], indices[i]]
    }
    const base = block * 3
    for (let r = 0; r < 9; r++) {
      const origInit = [initGrid[r][base], initGrid[r][base + 1], initGrid[r][base + 2]]
      const origSol = [solGrid[r][base], solGrid[r][base + 1], solGrid[r][base + 2]]
      initGrid[r][base] = origInit[indices[0]]
      initGrid[r][base + 1] = origInit[indices[1]]
      initGrid[r][base + 2] = origInit[indices[2]]
      solGrid[r][base] = origSol[indices[0]]
      solGrid[r][base + 1] = origSol[indices[1]]
      solGrid[r][base + 2] = origSol[indices[2]]
    }
  }

  // 5. Random reflections / transpositions
  if (Math.random() < 0.5) {
    initGrid = initGrid.map((row) => [...row].reverse())
    solGrid = solGrid.map((row) => [...row].reverse())
  }
  if (Math.random() < 0.5) {
    initGrid = [...initGrid].reverse()
    solGrid = [...solGrid].reverse()
  }
  if (Math.random() < 0.5) {
    const transInit = []
    const transSol = []
    for (let c = 0; c < 9; c++) {
      transInit.push(initGrid.map((row) => row[c]))
      transSol.push(solGrid.map((row) => row[c]))
    }
    initGrid = transInit
    solGrid = transSol
  }

  return {
    ...preset,
    initial: initGrid.flat(),
    solution: solGrid.flat(),
  }
}

// Fallback solution checker that works mathematically for any 9x9 Sudoku board
export function isSudokuComplete(grid) {
  if (!grid || grid.length !== 81) return false
  for (let i = 0; i < 81; i++) {
    if (grid[i] < 1 || grid[i] > 9) return false
  }

  // Check rows
  for (let r = 0; r < 9; r++) {
    const seen = new Set()
    for (let c = 0; c < 9; c++) {
      const v = grid[r * 9 + c]
      if (seen.has(v)) return false
      seen.add(v)
    }
  }

  // Check columns
  for (let c = 0; c < 9; c++) {
    const seen = new Set()
    for (let r = 0; r < 9; r++) {
      const v = grid[r * 9 + c]
      if (seen.has(v)) return false
      seen.add(v)
    }
  }

  // Check 3x3 blocks
  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      const seen = new Set()
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const v = grid[(br * 3 + r) * 9 + (bc * 3 + c)]
          if (seen.has(v)) return false
          seen.add(v)
        }
      }
    }
  }

  return true
}
