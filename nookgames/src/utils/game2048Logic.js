/**
 * game2048Logic.js — Clean 4x4 grid engine for 2048
 * Handles sliding, merging, random spawning, and game-over / win checks.
 */

export const GRID_SIZE = 4

/**
 * Creates an empty 4x4 grid.
 */
export function createEmptyGrid() {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0))
}

/**
 * Spawns a random tile (2 with 90% chance, 4 with 10% chance) in an empty cell.
 * Returns { grid, spawnedCell: { r, c, val } | null }
 */
export function spawnRandomTile(grid) {
  const emptyCells = []
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === 0) {
        emptyCells.push({ r, c })
      }
    }
  }

  if (emptyCells.length === 0) {
    return { grid, spawnedCell: null }
  }

  const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)]
  const val = Math.random() < 0.9 ? 2 : 4

  const nextGrid = grid.map((row) => [...row])
  nextGrid[randomCell.r][randomCell.c] = val

  return {
    grid: nextGrid,
    spawnedCell: { r: randomCell.r, c: randomCell.c, val },
  }
}

/**
 * Initializes a new 2048 game grid with 2 random tiles.
 */
export function initGameGrid() {
  const empty = createEmptyGrid()
  const res1 = spawnRandomTile(empty)
  const res2 = spawnRandomTile(res1.grid)
  return {
    grid: res2.grid,
    spawnedCells: [res1.spawnedCell, res2.spawnedCell].filter(Boolean),
  }
}

/**
 * Compresses and merges a single 4-element line.
 */
function mergeLine(line) {
  const nonZero = line.filter((v) => v !== 0)
  const newLine = []
  const mergedIndices = []
  let scoreGained = 0
  let i = 0

  while (i < nonZero.length) {
    if (i + 1 < nonZero.length && nonZero[i] === nonZero[i + 1]) {
      const mergedVal = nonZero[i] * 2
      newLine.push(mergedVal)
      scoreGained += mergedVal
      mergedIndices.push(newLine.length - 1)
      i += 2
    } else {
      newLine.push(nonZero[i])
      i++
    }
  }

  while (newLine.length < GRID_SIZE) {
    newLine.push(0)
  }

  const changed = line.some((v, idx) => v !== newLine[idx])
  return { newLine, scoreGained, changed, mergedIndices }
}

/**
 * Moves grid in direction: 'left', 'right', 'up', 'down'.
 * Returns { grid, scoreGained, changed, mergedCells }
 */
export function moveGrid(grid, direction) {
  const nextGrid = createEmptyGrid()
  let totalScoreGained = 0
  let hasChanged = false
  const mergedCells = [] // Array of { r, c } where a merge occurred

  if (direction === 'left') {
    for (let r = 0; r < GRID_SIZE; r++) {
      const line = grid[r]
      const { newLine, scoreGained, changed, mergedIndices } = mergeLine(line)
      nextGrid[r] = newLine
      totalScoreGained += scoreGained
      if (changed) hasChanged = true
      mergedIndices.forEach((c) => mergedCells.push({ r, c }))
    }
  } else if (direction === 'right') {
    for (let r = 0; r < GRID_SIZE; r++) {
      const line = [...grid[r]].reverse()
      const { newLine, scoreGained, changed, mergedIndices } = mergeLine(line)
      nextGrid[r] = [...newLine].reverse()
      totalScoreGained += scoreGained
      if (changed) hasChanged = true
      mergedIndices.forEach((c) => mergedCells.push({ r, c: GRID_SIZE - 1 - c }))
    }
  } else if (direction === 'up') {
    for (let c = 0; c < GRID_SIZE; c++) {
      const line = [grid[0][c], grid[1][c], grid[2][c], grid[3][c]]
      const { newLine, scoreGained, changed, mergedIndices } = mergeLine(line)
      for (let r = 0; r < GRID_SIZE; r++) {
        nextGrid[r][c] = newLine[r]
      }
      totalScoreGained += scoreGained
      if (changed) hasChanged = true
      mergedIndices.forEach((r) => mergedCells.push({ r, c }))
    }
  } else if (direction === 'down') {
    for (let c = 0; c < GRID_SIZE; c++) {
      const line = [grid[3][c], grid[2][c], grid[1][c], grid[0][c]]
      const { newLine, scoreGained, changed, mergedIndices } = mergeLine(line)
      for (let r = 0; r < GRID_SIZE; r++) {
        nextGrid[GRID_SIZE - 1 - r][c] = newLine[r]
      }
      totalScoreGained += scoreGained
      if (changed) hasChanged = true
      mergedIndices.forEach((r) => mergedCells.push({ r: GRID_SIZE - 1 - r, c }))
    }
  }

  return {
    grid: nextGrid,
    scoreGained: totalScoreGained,
    changed: hasChanged,
    mergedCells,
  }
}

/**
 * Checks if any valid moves remain on the grid.
 */
export function hasValidMoves(grid) {
  // Check for any empty cell
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === 0) return true
    }
  }

  // Check horizontal neighbors
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE - 1; c++) {
      if (grid[r][c] === grid[r][c + 1]) return true
    }
  }

  // Check vertical neighbors
  for (let r = 0; r < GRID_SIZE - 1; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === grid[r + 1][c]) return true
    }
  }

  return false
}

/**
 * Checks if the board contains a tile with value >= 2048.
 */
export function hasReached2048(grid) {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] >= 2048) return true
    }
  }
  return false
}

let tileCounter = 1

export function getNextTileId() {
  return tileCounter++
}

export function resetTileId(val = 1) {
  tileCounter = val
}

export function tilesToGrid(tiles) {
  const grid = createEmptyGrid()
  for (const t of tiles) {
    if (!t.isDeleting) {
      grid[t.r][t.c] = t.val
    }
  }
  return grid
}

export function initGameTiles() {
  resetTileId(1)
  const pos1 = { r: Math.floor(Math.random() * GRID_SIZE), c: Math.floor(Math.random() * GRID_SIZE) }
  let pos2
  do {
    pos2 = { r: Math.floor(Math.random() * GRID_SIZE), c: Math.floor(Math.random() * GRID_SIZE) }
  } while (pos2.r === pos1.r && pos2.c === pos1.c)

  const t1 = {
    id: getNextTileId(),
    val: Math.random() < 0.9 ? 2 : 4,
    r: pos1.r,
    c: pos1.c,
    previousPosition: null,
    isNew: true,
  }
  const t2 = {
    id: getNextTileId(),
    val: Math.random() < 0.9 ? 2 : 4,
    r: pos2.r,
    c: pos2.c,
    previousPosition: null,
    isNew: true,
  }
  return [t1, t2]
}

export function spawnRandomTileInTiles(tiles) {
  const occupied = new Set(
    tiles.filter((t) => !t.isDeleting).map((t) => `${t.r},${t.c}`)
  )
  const empty = []
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (!occupied.has(`${r},${c}`)) {
        empty.push({ r, c })
      }
    }
  }

  if (empty.length === 0) {
    return { nextTiles: tiles, spawnedTile: null }
  }

  const randomCell = empty[Math.floor(Math.random() * empty.length)]
  const val = Math.random() < 0.9 ? 2 : 4
  const spawnedTile = {
    id: getNextTileId(),
    val,
    r: randomCell.r,
    c: randomCell.c,
    previousPosition: null,
    isNew: true,
  }

  return {
    nextTiles: [...tiles, spawnedTile],
    spawnedTile,
  }
}

export function moveTiles(currentTiles, direction) {
  // Discard any leftover deleting tiles from a previous animation step
  const cleanTiles = currentTiles
    .filter((t) => !t.isDeleting)
    .map((t) => ({
      ...t,
      previousPosition: { r: t.r, c: t.c },
      isNew: false,
      isMerged: false,
    }))

  const nextTiles = []
  let totalScoreGained = 0
  let hasChanged = false

  const isHorizontal = direction === 'left' || direction === 'right'
  const isForward = direction === 'left' || direction === 'up' // starts at 0, goes to GRID_SIZE - 1

  for (let lineIdx = 0; lineIdx < GRID_SIZE; lineIdx++) {
    const lineTiles = cleanTiles.filter((t) =>
      isHorizontal ? t.r === lineIdx : t.c === lineIdx
    )

    lineTiles.sort((a, b) => {
      const coordA = isHorizontal ? a.c : a.r
      const coordB = isHorizontal ? b.c : b.r
      return isForward ? coordA - coordB : coordB - coordA
    })

    let targetCoord = isForward ? 0 : GRID_SIZE - 1
    const step = isForward ? 1 : -1
    let i = 0

    while (i < lineTiles.length) {
      const current = lineTiles[i]
      const next = i + 1 < lineTiles.length ? lineTiles[i + 1] : null

      if (next && current.val === next.val) {
        const targetR = isHorizontal ? lineIdx : targetCoord
        const targetC = isHorizontal ? targetCoord : lineIdx

        hasChanged = true
        const mergedVal = current.val * 2
        totalScoreGained += mergedVal

        // Parent tile 1 slides to destination and deletes
        current.r = targetR
        current.c = targetC
        current.isDeleting = true
        nextTiles.push(current)

        // Parent tile 2 slides to destination and deletes
        next.r = targetR
        next.c = targetC
        next.isDeleting = true
        nextTiles.push(next)

        // New merged tile created at destination with pop effect
        const mergedTile = {
          id: getNextTileId(),
          val: mergedVal,
          r: targetR,
          c: targetC,
          previousPosition: null,
          isMerged: true,
          isNew: false,
        }
        nextTiles.push(mergedTile)

        targetCoord += step
        i += 2
      } else {
        const targetR = isHorizontal ? lineIdx : targetCoord
        const targetC = isHorizontal ? targetCoord : lineIdx

        if (current.r !== targetR || current.c !== targetC) {
          hasChanged = true
        }

        current.r = targetR
        current.c = targetC
        nextTiles.push(current)

        targetCoord += step
        i++
      }
    }
  }

  return {
    nextTiles,
    scoreGained: totalScoreGained,
    changed: hasChanged,
  }
}

