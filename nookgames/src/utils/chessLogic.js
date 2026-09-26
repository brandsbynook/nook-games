import { Chess } from 'chess.js';

export const PIECE_VALUES = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

export const CENTER_SQUARES = new Set(['d4', 'd5', 'e4', 'e5']);
export const EXTENDED_CENTER = new Set([
  'c3', 'c4', 'c5', 'c6',
  'd3', 'd6',
  'e3', 'e6',
  'f3', 'f4', 'f5', 'f6',
]);

export const UNICODE_PIECES = {
  w: {
    k: '♔',
    q: '♕',
    r: '♖',
    b: '♗',
    n: '♘',
    p: '♙',
  },
  b: {
    k: '♚',
    q: '♛',
    r: '♜',
    b: '♝',
    n: '♞',
    p: '♟',
  },
};

// Piece-Square positional bonus tables
// Orientation: Row 0 is Rank 8 (White promotion goal), Row 7 is Rank 1 (White home rank).
// For White pieces: index is r.
// For Black pieces: index is 7 - r.
const PST_PAWN = [
  [ 0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [ 5,  5, 10, 25, 25, 10,  5,  5],
  [ 0,  0,  0, 20, 20,  0,  0,  0],
  [ 5, -5,-10,  0,  0,-10, -5,  5],
  [ 5, 10, 10,-20,-20, 10, 10,  5],
  [ 0,  0,  0,  0,  0,  0,  0,  0]
];

const PST_KNIGHT = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50]
];

const PST_BISHOP = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5, 10, 10,  5,  0,-10],
  [-10,  5,  5, 10, 10,  5,  5,-10],
  [-10,  0, 10, 10, 10, 10,  0,-10],
  [-10, 10, 10, 10, 10, 10, 10,-10],
  [-10,  5,  0,  0,  0,  0,  5,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20]
];

const PST_ROOK = [
  [ 0,  0,  0,  0,  0,  0,  0,  0],
  [ 5, 10, 10, 10, 10, 10, 10,  5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [ 0,  0,  0,  5,  5,  0,  0,  0]
];

const PST_QUEEN = [
  [-20,-10,-10, -5, -5,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5,  5,  5,  5,  0,-10],
  [ -5,  0,  5,  5,  5,  5,  0, -5],
  [  0,  0,  5,  5,  5,  5,  0, -5],
  [-10,  5,  5,  5,  5,  5,  0,-10],
  [-10,  0,  5,  0,  0,  0,  0,-10],
  [-20,-10,-10, -5, -5,-10,-10,-20]
];

const PST_KING = [
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-20,-30,-30,-40,-40,-30,-30,-20],
  [-10,-20,-20,-20,-20,-20,-20,-10],
  [ 20, 20,  0,  0,  0,  0, 20, 20],
  [ 20, 30, 10,  0,  0, 10, 30, 20]
];

export function createGame(fen) {
  return fen ? new Chess(fen) : new Chess();
}

export function getValidMoves(gameInstance, square) {
  if (!gameInstance || !square) return [];
  try {
    const moves = gameInstance.moves({ square, verbose: true });
    return moves.map((m) => m.to);
  } catch {
    return [];
  }
}

export function makeMove(gameInstance, move) {
  if (!gameInstance || !move) {
    return { success: false, isCheck: false, isCheckmate: false, isDraw: false, inCheck: false, isGameOver: false, move: null };
  }
  try {
    const moveResult = gameInstance.move({
      from: move.from,
      to: move.to,
      promotion: move.promotion || 'q',
    });

    if (!moveResult) {
      return { success: false, isCheck: false, isCheckmate: false, isDraw: false, inCheck: false, isGameOver: false, move: null };
    }

    const inCheck = gameInstance.inCheck();
    const isCheckmate = gameInstance.isCheckmate();
    const isDraw = gameInstance.isDraw();
    const isGameOver = gameInstance.isGameOver();

    return {
      success: true,
      move: moveResult,
      isCheck: inCheck,
      inCheck,
      isCheckmate,
      isDraw,
      isGameOver,
    };
  } catch (err) {
    return { success: false, error: err.message, isCheck: false, isCheckmate: false, isDraw: false, inCheck: false, isGameOver: false, move: null };
  }
}

export function evaluateBoard(game, botColor) {
  if (game.isCheckmate()) {
    return game.turn() === botColor ? -100000 : 100000;
  }
  if (game.isDraw()) return 0;

  let score = 0;
  const board = game.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const val = PIECE_VALUES[piece.type] || 0;
      let posBonus = 0;

      const pRank = piece.color === 'w' ? r : 7 - r;

      if (piece.type === 'p') posBonus += PST_PAWN[pRank][c];
      else if (piece.type === 'n') posBonus += PST_KNIGHT[pRank][c];
      else if (piece.type === 'b') posBonus += PST_BISHOP[pRank][c];
      else if (piece.type === 'r') posBonus += PST_ROOK[pRank][c];
      else if (piece.type === 'q') posBonus += PST_QUEEN[pRank][c];
      else if (piece.type === 'k') posBonus += PST_KING[pRank][c];

      const pieceTotal = val + posBonus;

      if (piece.color === botColor) {
        score += pieceTotal;
      } else {
        score -= pieceTotal;
      }
    }
  }
  return score;
}

function orderMoves(moves) {
  return moves.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    // MVV-LVA for captures
    if (a.captured) {
      scoreA += (PIECE_VALUES[a.captured] || 100) * 10 - (PIECE_VALUES[a.piece] || 100);
    }
    if (b.captured) {
      scoreB += (PIECE_VALUES[b.captured] || 100) * 10 - (PIECE_VALUES[b.piece] || 100);
    }

    // Promotions
    if (a.promotion) scoreA += 800;
    if (b.promotion) scoreB += 800;

    // Center control
    if (CENTER_SQUARES.has(a.to)) scoreA += 30;
    if (CENTER_SQUARES.has(b.to)) scoreB += 30;

    return scoreB - scoreA;
  });
}

function quiescence(gameInstance, alpha, beta, isMaximizing, botColor, qDepth = 3) {
  const standPat = evaluateBoard(gameInstance, botColor);

  if (qDepth === 0 || gameInstance.isGameOver()) {
    return standPat;
  }

  if (isMaximizing) {
    if (standPat >= beta) return beta;
    if (standPat > alpha) alpha = standPat;

    const captureMoves = orderMoves(
      gameInstance.moves({ verbose: true }).filter((m) => m.captured || m.promotion)
    );

    for (const move of captureMoves) {
      gameInstance.move(move);
      const score = quiescence(gameInstance, alpha, beta, false, botColor, qDepth - 1);
      gameInstance.undo();

      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }
    return alpha;
  } else {
    if (standPat <= alpha) return alpha;
    if (standPat < beta) beta = standPat;

    const captureMoves = orderMoves(
      gameInstance.moves({ verbose: true }).filter((m) => m.captured || m.promotion)
    );

    for (const move of captureMoves) {
      gameInstance.move(move);
      const score = quiescence(gameInstance, alpha, beta, true, botColor, qDepth - 1);
      gameInstance.undo();

      if (score <= alpha) return alpha;
      if (score < beta) beta = score;
    }
    return beta;
  }
}

function minimax(gameInstance, depth, alpha, beta, isMaximizing, botColor, useQuiescence = true) {
  if (gameInstance.isGameOver()) {
    return evaluateBoard(gameInstance, botColor);
  }

  if (depth === 0) {
    if (useQuiescence) {
      return quiescence(gameInstance, alpha, beta, isMaximizing, botColor, 3);
    }
    return evaluateBoard(gameInstance, botColor);
  }

  const moves = orderMoves(gameInstance.moves({ verbose: true }));
  if (moves.length === 0) {
    return evaluateBoard(gameInstance, botColor);
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      gameInstance.move(move);
      const evalScore = minimax(gameInstance, depth - 1, alpha, beta, false, botColor, useQuiescence);
      gameInstance.undo();
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      gameInstance.move(move);
      const evalScore = minimax(gameInstance, depth - 1, alpha, beta, true, botColor, useQuiescence);
      gameInstance.undo();
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function getBestMoveAtDepth(gameInstance, depth, botColor, options = {}) {
  const { useQuiescence = true, jitter = 0 } = options;
  const moves = orderMoves(gameInstance.moves({ verbose: true }));
  if (moves.length === 0) return null;

  let bestMove = null;
  let bestScore = -Infinity;
  let alpha = -Infinity;
  const beta = Infinity;

  for (const move of moves) {
    gameInstance.move(move);
    let score = minimax(gameInstance, depth - 1, alpha, beta, false, botColor, useQuiescence);
    gameInstance.undo();

    if (jitter > 0) {
      score += (Math.random() * jitter * 2 - jitter);
    }

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
    alpha = Math.max(alpha, bestScore);
  }

  return bestMove ? { from: bestMove.from, to: bestMove.to, promotion: bestMove.promotion || 'q' } : null;
}

export function getBotMove(gameInstance, difficulty = 'standard') {
  if (!gameInstance || gameInstance.isGameOver()) return null;

  const diff = String(difficulty).toLowerCase();
  const botColor = gameInstance.turn();

  if (diff === 'casual') {
    return getBestMoveAtDepth(gameInstance, 2, botColor, { useQuiescence: false, jitter: 15 });
  } else if (diff === 'master') {
    return getBestMoveAtDepth(gameInstance, 4, botColor, { useQuiescence: true, jitter: 0 });
  } else {
    // standard difficulty (~1300 ELO)
    return getBestMoveAtDepth(gameInstance, 3, botColor, { useQuiescence: true, jitter: 2 });
  }
}
