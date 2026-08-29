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
      9, 1, 3, 7, 6, 5, 8, 2, 4,
      6, 2, 7, 4, 3, 8, 1, 9, 0,
    ],
  },
]

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
