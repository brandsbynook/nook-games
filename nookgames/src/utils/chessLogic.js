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

/**
 * Creates a new Chess instance.
 */
export function createGame(fen) {
  return fen ? new Chess(fen) : new Chess();
}

/**
 * Returns an array of valid target square notations (e.g. ['e3', 'e4']) for a given square.
 */
export function getValidMoves(gameInstance, square) {
  if (!gameInstance || !square) return [];
  try {
    const moves = gameInstance.moves({ square, verbose: true });
    return moves.map((m) => m.to);
  } catch {
    return [];
  }
}

/**
 * Executes a move on the gameInstance: { from, to, promotion = 'q' }.
 * Returns { success, isCheck, isCheckmate, isDraw, inCheck, isGameOver, move }
 */
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

/**
 * Evaluates board position for a given bot color.
 */
/**
 * Evaluates board position for a given bot color with positional heuristics.
 */
export function evaluateBoard(game, botColor) {
  if (game.isCheckmate()) {
    return game.turn() === botColor ? -100000 : 100000;
  }
  if (game.isDraw()) return 0;

  let score = 0;
  const board = game.board();
  const isBlack = botColor === 'b';

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;
      const val = PIECE_VALUES[piece.type] || 0;
      const square = String.fromCharCode(97 + c) + (8 - r);
      let posBonus = 0;

      // Center control
      if (CENTER_SQUARES.has(square)) posBonus += 35;
      else if (EXTENDED_CENTER.has(square)) posBonus += 15;
      else if (square[0] === 'd' || square[0] === 'e') posBonus += 10;

      // Development bonus for minor pieces (knights, bishops)
      if (piece.type === 'n' || piece.type === 'b') {
        const homeRank = piece.color === 'b' ? 0 : 7;
        if (r !== homeRank) posBonus += 20;
      }

      // King safety in early/mid game
      if (piece.type === 'k') {
        if (piece.color === 'b') {
          if (r === 0 && (c === 6 || c === 2)) posBonus += 25; // Castled positions
        } else {
          if (r === 7 && (c === 6 || c === 2)) posBonus += 25;
        }
      }

      if (piece.color === botColor) {
        score += val + posBonus;
      } else {
        score -= (val + posBonus);
      }
    }
  }
  return score;
}

/**
 * Casual Bot:
 * Plays valid random moves with a 40% bias toward free captures or pawn advances.
 */
function getCasualMove(gameInstance) {
  const moves = gameInstance.moves({ verbose: true });
  if (moves.length === 0) return null;

  // 40% bias toward free captures or pawn advances
  const biasedMoves = moves.filter((m) => m.captured || m.piece === 'p');
  if (Math.random() < 0.4 && biasedMoves.length > 0) {
    const chosen = biasedMoves[Math.floor(Math.random() * biasedMoves.length)];
    return { from: chosen.from, to: chosen.to, promotion: 'q' };
  }

  const chosen = moves[Math.floor(Math.random() * moves.length)];
  return { from: chosen.from, to: chosen.to, promotion: 'q' };
}

/**
 * Standard Bot:
 * 1-ply evaluation with capture weighting, piece-square tables (controlling center files d/e),
 * and basic blunder checks so it avoids sacrificing pieces for free.
 */
function getStandardMove(gameInstance) {
  const moves = gameInstance.moves({ verbose: true });
  if (moves.length === 0) return null;

  let bestMove = null;
  let bestScore = -Infinity;

  for (const move of moves) {
    let score = 0;

    // Capture weighting
    if (move.captured) {
      score += (PIECE_VALUES[move.captured] || 0) * 1.25;
    }

    // Controlling center files d and e & center squares
    if (CENTER_SQUARES.has(move.to)) {
      score += 45;
    } else if (move.to[0] === 'd' || move.to[0] === 'e') {
      score += 25;
    } else if (EXTENDED_CENTER.has(move.to)) {
      score += 15;
    }

    // Developing knights and bishops
    if (move.piece === 'n' || move.piece === 'b') {
      if (move.from.endsWith('8') || move.from.endsWith('1')) {
        score += 25;
      }
    }

    // Basic blunder check: simulate move and check if opponent can immediately capture piece
    gameInstance.move(move);

    if (gameInstance.isCheckmate()) {
      score += 100000;
    } else if (gameInstance.inCheck()) {
      score += 25;
    } else {
      const oppReplies = gameInstance.moves({ verbose: true });
      // If an opponent reply captures the piece on move.to
      const directAttacker = oppReplies.find((om) => om.to === move.to);
      if (directAttacker) {
        // Penalty for losing the piece
        score -= (PIECE_VALUES[move.piece] || 100);
      }
    }

    gameInstance.undo();

    // Natural jitter
    score += (Math.random() * 8 - 4);

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove ? { from: bestMove.from, to: bestMove.to, promotion: 'q' } : null;
}

/**
 * Master Bot:
 * 2-ply minimax evaluation with alpha-beta pruning.
 * Prioritizes king safety, piece development, and tactical trades.
 */
function getMasterMove(gameInstance) {
  const moves = gameInstance.moves({ verbose: true });
  if (moves.length === 0) return null;

  const botColor = gameInstance.turn();
  let bestMove = null;
  let bestScore = -Infinity;

  // Move ordering: captures and center moves first to maximize alpha-beta cutoffs
  moves.sort((a, b) => {
    const scoreA = (a.captured ? PIECE_VALUES[a.captured] : 0) + (CENTER_SQUARES.has(a.to) ? 30 : 0);
    const scoreB = (b.captured ? PIECE_VALUES[b.captured] : 0) + (CENTER_SQUARES.has(b.to) ? 30 : 0);
    return scoreB - scoreA + (Math.random() * 4 - 2);
  });

  for (const move of moves) {
    gameInstance.move(move);

    let moveScore;
    if (gameInstance.isCheckmate()) {
      moveScore = 100000;
    } else if (gameInstance.isDraw()) {
      moveScore = -150;
    } else {
      const oppMoves = gameInstance.moves({ verbose: true });
      if (oppMoves.length === 0) {
        moveScore = 0;
      } else {
        // Opponent minimizes bot's score
        oppMoves.sort((a, b) => (b.captured ? 1 : 0) - (a.captured ? 1 : 0));
        let worstOppReply = Infinity;

        for (const oppMove of oppMoves) {
          gameInstance.move(oppMove);
          const evalScore = evaluateBoard(gameInstance, botColor);
          gameInstance.undo();

          if (evalScore < worstOppReply) {
            worstOppReply = evalScore;
          }
          if (worstOppReply <= bestScore) {
            break; // Beta cutoff
          }
        }
        moveScore = worstOppReply;
      }
    }

    gameInstance.undo();

    if (moveScore > bestScore) {
      bestScore = moveScore;
      bestMove = move;
    }
  }

  return bestMove ? { from: bestMove.from, to: bestMove.to, promotion: 'q' } : null;
}

/**
 * Selects a bot move based on difficulty: 'casual', 'standard', or 'master'.
 */
export function getBotMove(gameInstance, difficulty = 'standard') {
  if (!gameInstance || gameInstance.isGameOver()) return null;

  const diff = String(difficulty).toLowerCase();
  if (diff === 'casual') {
    return getCasualMove(gameInstance);
  } else if (diff === 'master') {
    return getMasterMove(gameInstance);
  } else {
    return getStandardMove(gameInstance);
  }
}
