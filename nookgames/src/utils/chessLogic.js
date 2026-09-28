import { Chess } from 'chess.js'

export const PIECE_VALUES = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
}

export const CENTER_SQUARES = new Set(['d4', 'd5', 'e4', 'e5'])
export const EXTENDED_CENTER = new Set([
  'c3', 'c4', 'c5', 'c6',
  'd3', 'd6',
  'e3', 'e6',
  'f3', 'f4', 'f5', 'f6',
])

export const UNICODE_PIECES = {
  w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
  b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' },
}

// PST tables indexed from Rank 8 (row 0) to Rank 1 (row 7)
const PST_PAWN = [
  [ 0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [ 5,  5, 10, 25, 25, 10,  5,  5],
  [ 0,  0,  0, 20, 20,  0,  0,  0],
  [ 5, -5,-10,  0,  0,-10, -5,  5],
  [ 5, 10, 10,-20,-20, 10, 10,  5],
  [ 0,  0,  0,  0,  0,  0,  0,  0]
]

const PST_KNIGHT = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50]
]

const PST_BISHOP = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5, 10, 10,  5,  0,-10],
  [-10,  5,  5, 10, 10,  5,  5,-10],
  [-10,  0, 10, 10, 10, 10,  0,-10],
  [-10, 10, 10, 10, 10, 10, 10,-10],
  [-10,  5,  0,  0,  0,  0,  5,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20]
]

const PST_ROOK = [
  [ 0,  0,  0,  0,  0,  0,  0,  0],
  [ 5, 10, 10, 10, 10, 10, 10,  5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [ 0,  0,  0,  5,  5,  0,  0,  0]
]

const PST_QUEEN = [
  [-20,-10,-10, -5, -5,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5,  5,  5,  5,  0,-10],
  [ -5,  0,  5,  5,  5,  5,  0, -5],
  [  0,  0,  5,  5,  5,  5,  0, -5],
  [-10,  5,  5,  5,  5,  5,  0,-10],
  [-10,  0,  5,  0,  0,  0,  0,-10],
  [-20,-10,-10, -5, -5,-10,-10,-20]
]

const PST_KING = [
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-20,-30,-30,-40,-40,-30,-30,-20],
  [-10,-20,-20,-20,-20,-20,-20,-10],
  [ 20, 20,  0,  0,  0,  0, 20, 20],
  [ 20, 30, 10,  0,  0, 10, 30, 20]
]

export function createGame(fen) {
  return fen ? new Chess(fen) : new Chess()
}

export function getValidMoves(gameInstance, square) {
  if (!gameInstance || !square) return []
  try {
    const moves = gameInstance.moves({ square, verbose: true })
    return moves.map((m) => m.to)
  } catch {
    return []
  }
}

export function makeMove(gameInstance, move) {
  if (!gameInstance || !move) {
    return { success: false, isCheck: false, isCheckmate: false, isDraw: false, inCheck: false, isGameOver: false, move: null }
  }
  try {
    const moveResult = gameInstance.move({
      from: move.from,
      to: move.to,
      promotion: move.promotion || 'q',
    })
    if (!moveResult) {
      return { success: false, isCheck: false, isCheckmate: false, isDraw: false, inCheck: false, isGameOver: false, move: null }
    }
    const inCheck = gameInstance.inCheck()
    const isCheckmate = gameInstance.isCheckmate()
    const isDraw = gameInstance.isDraw()
    const isGameOver = gameInstance.isGameOver()
    return {
      success: true,
      move: moveResult,
      isCheck: inCheck,
      inCheck,
      isCheckmate,
      isDraw,
      isGameOver,
    }
  } catch (err) {
    return { success: false, error: err.message, isCheck: false, isCheckmate: false, isDraw: false, inCheck: false, isGameOver: false, move: null }
  }
}

export function evaluateBoard(game, botColor) {
  if (game.isCheckmate()) {
    return game.turn() === botColor ? -100000 : 100000
  }
  if (game.isDraw()) return 0

  let score = 0
  const board = game.board()

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c]
      if (!piece) continue

      const val = PIECE_VALUES[piece.type] || 0
      let posBonus = 0

      // In chess.js, row 0 is Rank 8, row 7 is Rank 1.
      // White moves upwards from row 7 to row 0.
      // Black moves downwards from row 0 to row 7.
      const tableRow = piece.color === 'w' ? r : 7 - r

      if (piece.type === 'p') posBonus += PST_PAWN[tableRow][c]
      else if (piece.type === 'n') posBonus += PST_KNIGHT[tableRow][c]
      else if (piece.type === 'b') posBonus += PST_BISHOP[tableRow][c]
      else if (piece.type === 'r') posBonus += PST_ROOK[tableRow][c]
      else if (piece.type === 'q') posBonus += PST_QUEEN[tableRow][c]
      else if (piece.type === 'k') posBonus += PST_KING[tableRow][c]

      const square = String.fromCharCode(97 + c) + (8 - r)
      if (CENTER_SQUARES.has(square)) posBonus += 20
      else if (EXTENDED_CENTER.has(square)) posBonus += 8

      const totalVal = val + posBonus
      if (piece.color === botColor) {
        score += totalVal
      } else {
        score -= totalVal
      }
    }
  }
  return score
}

function orderMoves(moves) {
  return moves.sort((a, b) => {
    let scoreA = 0
    let scoreB = 0
    if (a.captured) scoreA += (PIECE_VALUES[a.captured] || 100) * 10 - (PIECE_VALUES[a.piece] || 100)
    if (b.captured) scoreB += (PIECE_VALUES[b.captured] || 100) * 10 - (PIECE_VALUES[b.piece] || 100)
    if (a.promotion) scoreA += 800
    if (b.promotion) scoreB += 800
    if (CENTER_SQUARES.has(a.to)) scoreA += 25
    if (CENTER_SQUARES.has(b.to)) scoreB += 25
    return scoreB - scoreA
  })
}

function minimax(gameInstance, depth, alpha, beta, isMaximizing, botColor) {
  if (depth === 0 || gameInstance.isGameOver()) {
    return evaluateBoard(gameInstance, botColor)
  }

  const moves = orderMoves(gameInstance.moves({ verbose: true }))
  if (moves.length === 0) return evaluateBoard(gameInstance, botColor)

  if (isMaximizing) {
    let maxEval = -Infinity
    for (const move of moves) {
      gameInstance.move(move)
      const evalScore = minimax(gameInstance, depth - 1, alpha, beta, false, botColor)
      gameInstance.undo()
      maxEval = Math.max(maxEval, evalScore)
      alpha = Math.max(alpha, evalScore)
      if (beta <= alpha) break
    }
    return maxEval
  } else {
    let minEval = Infinity
    for (const move of moves) {
      gameInstance.move(move)
      const evalScore = minimax(gameInstance, depth - 1, alpha, beta, true, botColor)
      gameInstance.undo()
      minEval = Math.min(minEval, evalScore)
      beta = Math.min(beta, evalScore)
      if (beta <= alpha) break
    }
    return minEval
  }
}

function getBestMove(gameInstance, depth, botColor, jitter = 0) {
  const moves = orderMoves(gameInstance.moves({ verbose: true }))
  if (moves.length === 0) return null

  let bestMove = null
  let bestScore = -Infinity
  let alpha = -Infinity
  const beta = Infinity

  for (const move of moves) {
    gameInstance.move(move)
    let score = minimax(gameInstance, depth - 1, alpha, beta, false, botColor)
    gameInstance.undo()

    if (jitter > 0) {
      score += (Math.random() * jitter * 2 - jitter)
    }

    if (score > bestScore) {
      bestScore = score
      bestMove = move
    }
    alpha = Math.max(alpha, bestScore)
  }

  return bestMove ? { from: bestMove.from, to: bestMove.to, promotion: 'q' } : null
}

export function getBotMove(gameInstance, difficulty = 'standard') {
  if (!gameInstance || gameInstance.isGameOver()) return null

  const diff = String(difficulty).toLowerCase()
  const botColor = gameInstance.turn()

  if (diff === 'casual') {
    // Fast depth 1 with friendly variance (±25) for beginners
    return getBestMove(gameInstance, 1, botColor, 25)
  } else if (diff === 'master') {
    // Depth 4 search with 0 jitter/noise for tactical depth
    return getBestMove(gameInstance, 4, botColor, 0)
  } else {
    // Depth 3 search with light jitter (±2) to prevent blunders with instant response
    return getBestMove(gameInstance, 3, botColor, 2)
  }
}
