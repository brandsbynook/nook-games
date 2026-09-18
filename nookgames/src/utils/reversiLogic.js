/**
 * reversiLogic.js — Core 8x8 Reversi game engine & multi-tiered AI companion
 * Tiers:
 *  - Gentle: Depth 1, basic positional evaluation
 *  - Standard: Depth 2, corner/edge weighting with minimax
 *  - Deep: Depth 4, mobility and stability analysis with alpha-beta minimax
 */

export const BOARD_SIZE = 8

export const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1],
]

// Positional strategy weights for 8x8 Reversi board
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

const CORNERS = [
  [0, 0], [0, 7], [7, 0], [7, 7],
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
 * Clones the 8x8 board state
 */
export function cloneBoard(board) {
  return board.map((row) => [...row])
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
 * Evaluates board state from the perspective of aiPlayer
 */
export function evaluateBoard(board, aiPlayer, difficulty = 'standard') {
  const opponent = aiPlayer === 'W' ? 'B' : 'W'
  let aiScore = 0
  let oppScore = 0

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c]
      if (piece === aiPlayer) {
        aiScore += POSITION_WEIGHTS[r][c]
      } else if (piece === opponent) {
        oppScore += POSITION_WEIGHTS[r][c]
      }
    }
  }

  let totalScore = aiScore - oppScore

  // Corner weighting
  let cornerScore = 0
  for (const [cr, cc] of CORNERS) {
    if (board[cr][cc] === aiPlayer) cornerScore += 120
    else if (board[cr][cc] === opponent) cornerScore -= 120
  }
  totalScore += cornerScore

  // Deep tier: incorporate mobility and stability analysis
  if (difficulty === 'deep') {
    const aiMoves = getValidMoves(board, aiPlayer).length
    const oppMoves = getValidMoves(board, opponent).length
    if (aiMoves + oppMoves > 0) {
      totalScore += 16 * (aiMoves - oppMoves)
    }

    // Stability: count stable corner-connected edge discs
    let stabilityBonus = 0
    const cornerRays = [
      { cr: 0, cc: 0, dirs: [[0, 1], [1, 0]] },
      { cr: 0, cc: 7, dirs: [[0, -1], [1, 0]] },
      { cr: 7, cc: 0, dirs: [[0, 1], [-1, 0]] },
      { cr: 7, cc: 7, dirs: [[0, -1], [-1, 0]] },
    ]

    for (const { cr, cc, dirs } of cornerRays) {
      const cornerPiece = board[cr][cc]
      if (cornerPiece) {
        const mult = cornerPiece === aiPlayer ? 1 : -1
        for (const [dr, dc] of dirs) {
          let r = cr + dr
          let c = cc + dc
          while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === cornerPiece) {
            stabilityBonus += 20 * mult
            r += dr
            c += dc
          }
        }
      }
    }
    totalScore += stabilityBonus
  }

  return totalScore
}

/**
 * Minimax algorithm with Alpha-Beta pruning
 */
function minimax(board, depth, alpha, beta, isMaximizing, aiPlayer, difficulty) {
  const opponent = aiPlayer === 'W' ? 'B' : 'W'
  const currentPlayer = isMaximizing ? aiPlayer : opponent
  const moves = getValidMoves(board, currentPlayer)

  if (moves.length === 0) {
    const oppMoves = getValidMoves(board, isMaximizing ? opponent : aiPlayer)
    if (oppMoves.length === 0 || depth === 0) {
      const { white, dark } = countStones(board)
      const aiStones = aiPlayer === 'W' ? white : dark
      const oppStones = opponent === 'W' ? white : dark
      if (moves.length === 0 && oppMoves.length === 0) {
        return (aiStones - oppStones) * 1000
      }
      return evaluateBoard(board, aiPlayer, difficulty)
    }
    // Turn passes to other player
    return minimax(board, depth - 1, alpha, beta, !isMaximizing, aiPlayer, difficulty)
  }

  if (depth === 0) {
    return evaluateBoard(board, aiPlayer, difficulty)
  }

  if (isMaximizing) {
    let maxEval = -Infinity
    for (const move of moves) {
      const outcome = applyMove(board, move.row, move.col, aiPlayer)
      if (!outcome) continue
      const evaluation = minimax(outcome.nextBoard, depth - 1, alpha, beta, false, aiPlayer, difficulty)
      maxEval = Math.max(maxEval, evaluation)
      alpha = Math.max(alpha, evaluation)
      if (beta <= alpha) break
    }
    return maxEval
  } else {
    let minEval = Infinity
    for (const move of moves) {
      const outcome = applyMove(board, move.row, move.col, opponent)
      if (!outcome) continue
      const evaluation = minimax(outcome.nextBoard, depth - 1, alpha, beta, true, aiPlayer, difficulty)
      minEval = Math.min(minEval, evaluation)
      beta = Math.min(beta, evaluation)
      if (beta <= alpha) break
    }
    return minEval
  }
}

/**
 * AI move selector:
 *  - Gentle: Depth 1, basic positional evaluation
 *  - Standard: Depth 2, corner/edge weighting with minimax
 *  - Deep: Depth 4, mobility and stability analysis with alpha-beta minimax
 */
export function getBestAiMove(board, aiPlayer = 'B', difficulty = 'standard') {
  const validMoves = getValidMoves(board, aiPlayer)
  if (validMoves.length === 0) return null

  // Tier 1: Gentle — depth 1 basic positional evaluation
  if (difficulty === 'gentle') {
    let bestScore = -Infinity
    let bestMove = validMoves[0]
    for (const move of validMoves) {
      let score = POSITION_WEIGHTS[move.row][move.col] + move.flips.length * 2
      score += (Math.random() * 4 - 2)
      if (score > bestScore) {
        bestScore = score
        bestMove = move
      }
    }
    return bestMove
  }

  // Tier 2: Standard (depth 2) or Tier 3: Deep (depth 4)
  const maxDepth = difficulty === 'deep' ? 4 : 2
  let bestScore = -Infinity
  let bestMove = validMoves[0]
  let alpha = -Infinity
  const beta = Infinity

  for (const move of validMoves) {
    const outcome = applyMove(board, move.row, move.col, aiPlayer)
    if (!outcome) continue

    const score = minimax(outcome.nextBoard, maxDepth - 1, alpha, beta, false, aiPlayer, difficulty)
    const jitteredScore = score + (Math.random() * 0.4 - 0.2)

    if (jitteredScore > bestScore) {
      bestScore = jitteredScore
      bestMove = move
    }
    alpha = Math.max(alpha, score)
  }

  return bestMove
}
