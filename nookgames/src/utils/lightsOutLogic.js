/**
 * lightsOutLogic.js — Core 5x5 Lights Out engine with guaranteed solvability
 */

export const GRID_SIZE = 5

export const DIFFICULTY_PRESETS = [
  { id: 'peaceful', label: 'Peaceful', moves: 3 },
  { id: 'easy', label: 'Easy', moves: 5 },
  { id: 'moderate', label: 'Moderate', moves: 8 },
]

/**
 * Creates an empty 5x5 grid (all lights off)
 */
export function createEmptyGrid() {
  return Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(false)
  )
}

/**
 * Toggles a cell and its 4 orthogonal neighbors
 */
export function toggleCell(grid, row, col) {
  const nextGrid = grid.map((r) => [...r])
  const deltas = [
    [0, 0],   // target cell
    [-1, 0],  // top
    [1, 0],   // bottom
    [0, -1],  // left
    [0, 1],   // right
  ]

  for (const [dr, dc] of deltas) {
    const nr = row + dr
    const nc = col + dc
    if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
      nextGrid[nr][nc] = !nextGrid[nr][nc]
    }
  }

  return nextGrid
}

/**
 * Checks if all 25 tiles are turned off
 */
export function isAllOff(grid) {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c]) return false
    }
  }
  return true
}

/**
 * Counts how many lights are currently on
 */
export function countActiveLights(grid) {
  let count = 0
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c]) count++
    }
  }
  return count
}

/**
 * Generates a 100% solvable puzzle by applying random clicks to an all-off grid
 */
export function generateSolvableGrid(moveCount = 5) {
  let grid = createEmptyGrid()
  const clickedCoords = []

  // Apply `moveCount` distinct random toggles
  while (clickedCoords.length < moveCount) {
    const r = Math.floor(Math.random() * GRID_SIZE)
    const c = Math.floor(Math.random() * GRID_SIZE)
    const key = `${r},${c}`

    // Avoid self-cancelling clicks in generation
    if (!clickedCoords.includes(key)) {
      clickedCoords.push(key)
      grid = toggleCell(grid, r, c)
    }
  }

  // If accidentally generated an already-solved board, retry
  if (isAllOff(grid)) {
    return generateSolvableGrid(moveCount)
  }

  return { grid, solutionSteps: clickedCoords }
}
