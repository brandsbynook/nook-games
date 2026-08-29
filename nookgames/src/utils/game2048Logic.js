/**
 * game2048Logic.js — Core engine for 2048 with coordinate-based tile tracking
 * Supports fluid sliding transitions, merge tracking, and solvability checks.
 */

export const GRID_SIZE = 4
let _nextTileId = 1

export function getNextTileId() {
  return _nextTileId++
}

export function resetTileIdCounter(start = 1) {
  _nextTileId = start
}

/**
 * Returns a 4x4 representation of current non-merged tiles.
 */
export function tilesToGrid(tiles) {
  const grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0))
  for (const tile of tiles) {
    if (!tile.mergedInto) {
      grid[tile.row][tile.col] = tile.value
    }
  }
  return grid
}

/**
 * Finds all empty coordinate pairs (r, c) on the board.
 */
export function getEmptyCoordinates(tiles) {
  const occupied = new Set()
  for (const tile of tiles) {
    if (!tile.mergedInto) {
      occupied.add(`${tile.row},${tile.col}`)
    }
  }

  const empty = []
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (!occupied.has(`${r},${c}`)) {
        empty.push({ row: r, col: c })
      }
    }
  }
  return empty
}

/**
 * Spawns a random tile (2 with 90% chance, 4 with 10% chance) in an empty cell.
 */
export function spawnTile(tiles) {
  const emptyCoords = getEmptyCoordinates(tiles)
  if (emptyCoords.length === 0) return { tiles, spawnedTile: null }

  const randomCoord = emptyCoords[Math.floor(Math.random() * emptyCoords.length)]
  const value = Math.random() < 0.9 ? 2 : 4
  const spawnedTile = {
    id: getNextTileId(),
    value,
    row: randomCoord.row,
    col: randomCoord.col,
    isNew: true,
  }

  return {
    tiles: [...tiles, spawnedTile],
    spawnedTile,
  }
}

/**
 * Creates 2 initial tiles on a clean board.
 */
export function initTiles() {
  resetTileIdCounter(1)
  const first = spawnTile([])
  const second = spawnTile(first.tiles)
  return second.tiles
}

/**
 * Moves tiles in the chosen direction ('left', 'right', 'up', 'down').
 * Maintains source tile IDs for sliding animation, creates new merged tiles,
 * and marks merged source tiles with `mergedInto`.
 */
export function moveTiles(currentTiles, direction) {
  // Only process active tiles (not already merged)
  const activeTiles = currentTiles.filter((t) => !t.mergedInto).map((t) => ({
    ...t,
    isNew: false,
    isMerged: false,
    prevRow: t.row,
    prevCol: t.col,
  }))

  const nextTiles = []
  let scoreGained = 0
  let changed = false

  const isHorizontal = direction === 'left' || direction === 'right'
  const isForward = direction === 'right' || direction === 'down'

  // Process 4 rows (horizontal) or 4 columns (vertical)
  for (let lineIdx = 0; lineIdx < GRID_SIZE; lineIdx++) {
    // Collect tiles in this line
    const lineTiles = activeTiles.filter((t) =>
      isHorizontal ? t.row === lineIdx : t.col === lineIdx
    )

    // Sort in order of movement leading edge
    lineTiles.sort((a, b) => {
      const posA = isHorizontal ? a.col : a.row
      const posB = isHorizontal ? b.col : b.row
      return isForward ? posB - posA : posA - posB
    })

    let targetIdx = isForward ? GRID_SIZE - 1 : 0
    const step = isForward ? -1 : 1

    let i = 0
    while (i < lineTiles.length) {
      const curr = lineTiles[i]
      const next = lineTiles[i + 1]

      if (next && curr.value === next.value) {
        // Merge curr and next into a new tile at targetIdx
        const targetRow = isHorizontal ? lineIdx : targetIdx
        const targetCol = isHorizontal ? targetIdx : lineIdx

        // Check if any tile actually changed position
        if (curr.row !== targetRow || curr.col !== targetCol) changed = true
        if (next.row !== targetRow || next.col !== targetCol) changed = true
        changed = true // Merge is always a change

        const mergedValue = curr.value * 2
        scoreGained += mergedValue
        const mergedId = getNextTileId()

        // Move source tiles to target and mark them merged
        curr.row = targetRow
        curr.col = targetCol
        curr.mergedInto = mergedId

        next.row = targetRow
        next.col = targetCol
        next.mergedInto = mergedId

        // Create new merged tile
        const mergedTile = {
          id: mergedId,
          value: mergedValue,
          row: targetRow,
          col: targetCol,
          isMerged: true,
        }

        nextTiles.push(curr, next, mergedTile)
        targetIdx += step
        i += 2
      } else {
        // Move curr to targetIdx
        const targetRow = isHorizontal ? lineIdx : targetIdx
        const targetCol = isHorizontal ? targetIdx : lineIdx

        if (curr.row !== targetRow || curr.col !== targetCol) {
          changed = true
        }

        curr.row = targetRow
        curr.col = targetCol
        nextTiles.push(curr)

        targetIdx += step
        i += 1
      }
    }
  }

  return {
    tiles: nextTiles,
    scoreGained,
    changed,
  }
}

/**
 * Removes tiles that merged away and clears animation flags.
 */
export function cleanMergedTiles(tiles) {
  return tiles
    .filter((t) => !t.mergedInto)
    .map((t) => ({
      id: t.id,
      value: t.value,
      row: t.row,
      col: t.col,
    }))
}

/**
 * Checks if any valid moves remain on the board.
 */
export function hasValidMoves(tiles) {
  const grid = tilesToGrid(tiles)

  // 1. Any empty cell?
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === 0) return true
    }
  }

  // 2. Horizontal equal neighbor?
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE - 1; c++) {
      if (grid[r][c] === grid[r][c + 1]) return true
    }
  }

  // 3. Vertical equal neighbor?
  for (let r = 0; r < GRID_SIZE - 1; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === grid[r + 1][c]) return true
    }
  }

  return false
}

/**
 * Checks if any tile on the board has reached 2048.
 */
export function hasReached2048(tiles) {
  return tiles.some((t) => !t.mergedInto && t.value >= 2048)
}
