/**
 * reversiLogic.js — Core 8x8 Reversi game engine & calm AI companion
 */

export const BOARD_SIZE = 8

export const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1],
]

// Positional strategy weights for calm, deliberate AI companion
export const POSITION_WEIGHTS = [
  [120, -20,  20,   5,   5,  20, -20, 120],
  [-20, -40,  -5,  -5,  -5,  -5, -40, -20],
  [ 20,  -5,  15,   3,   3,  15,  -5,  20],
  [  5,  -5,   3,   3,   3,   3,  -5,   5],
  [  5,  -5,   3,   3,   3,   3,  -5,   5],
  [ 20,  -5,  15,   3,   3,  15,  -5,  20],
  [-20, -40,  -5,  -5,  -5,  -5, -40, -20],
  [120, -20,  20,   5,   5,  20, -20, 120],
]

/**
 * Creates an empty 8x8 board with standard 4 center stones.
 * 'W' = White (Player), 'B' = Dark (AI Companion), null = empty
 */
export function createInitialBoard() {
  const board = Array.from({ length: BOARD_SIZE }, () =>
    Array(BOARD_SIZE).fill(null)
  )
  board[3][3] = 'W'
  board[3][4] = 'B'
  board[4][3] = 'B'
  board[4][4] = 'W'
  return board
}

/**
 * Returns list of [row, col] coords of opponent stones to flip if player places at (row, col)
 */
export function getFlips(board, row, col, player) {
  if (board[row][col] !== null) return []
  const opponent = player === 'W' ? 'B' : 'W'
  const flips = []

  for (const [dr, dc] of DIRECTIONS) {
    const dirFlips = []
    let r = row + dr
    let c = col + dc

    while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === opponent) {
      dirFlips.push([r, c])
      r += dr
      c += dc
    }

    if (
      r >= 0 &&
      r < BOARD_SIZE &&
      c >= 0 &&
      c < BOARD_SIZE &&
      board[r][c] === player &&
      dirFlips.length > 0
    ) {
      flips.push(...dirFlips)
    }
  }

  return flips
}

/**
 * Returns all valid [row, col] moves for the given player
 */
export function getValidMoves(board, player) {
  const moves = []
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const flips = getFlips(board, r, c, player)
      if (flips.length > 0) {
        moves.push({ row: r, col: c, flips })
      }
    }
  }
  return moves
}

/**
 * Applies a move and returns a new board state along with flipped coordinates
 */
export function applyMove(board, row, col, player) {
  const flips = getFlips(board, row, col, player)
  if (flips.length === 0) return null

  const nextBoard = board.map((rowArr) => [...rowArr])
  nextBoard[row][col] = player
  for (const [fr, fc] of flips) {
    nextBoard[fr][fc] = player
  }

  return { nextBoard, flippedCoords: flips }
}

/**
 * Counts the stones on the board
 */
export function countStones(board) {
  let white = 0
  let dark = 0
  let empty = 0

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === 'W') white++
      else if (board[r][c] === 'B') dark++
      else empty++
    }
  }

  return { white, dark, empty }
}

/**
 * AI move selector: scores moves by board position weights, corner preference, and mobility
 */
export function getBestAiMove(board, aiPlayer = 'B') {
  const validMoves = getValidMoves(board, aiPlayer)
  if (validMoves.length === 0) return null

  let bestMove = validMoves[0]
  let bestScore = -Infinity

  for (const move of validMoves) {
    let score = POSITION_WEIGHTS[move.row][move.col]
    score += move.flips.length * 2

    // Prioritize corners
    if (
      (move.row === 0 || move.row === 7) &&
      (move.col === 0 || move.col === 7)
    ) {
      score += 100
    }

    if (score > bestScore) {
      bestScore = score
      bestMove = move
    }
  }

  return bestMove
}
