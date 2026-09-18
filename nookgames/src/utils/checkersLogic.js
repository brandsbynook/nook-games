/**
 * checkersLogic.js - Standard Solo Draughts / Checkers vs System
 * Calibrated AI scaling:
 * - Gentle: Random legal move with basic survival instinct
 * - Standard: 1-ply tactical evaluation (captures, promotion, blunder checking)
 * - Deep: 2-ply Minimax lookahead with material and positional evaluation
 */

export const BOARD_SIZE = 8;

export function initBoard() {
  const board = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    const row = [];
    for (let c = 0; c < BOARD_SIZE; c++) {
      const isDark = (r + c) % 2 === 1;
      if (isDark && r < 3) {
        row.push({ player: 'black', isKing: false });
      } else if (isDark && r > 4) {
        row.push({ player: 'white', isKing: false });
      } else {
        row.push(null);
      }
    }
    board.push(row);
  }
  return board;
}

export function cloneBoard(board) {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

export function getValidMoves(board, r, c) {
  if (!board || r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) {
    return { steps: [], captures: [] };
  }

  const piece = board[r][c];
  if (!piece) return { steps: [], captures: [] };

  const steps = [];
  const captures = [];

  const dirs = [];
  if (piece.isKing) {
    dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
  } else if (piece.player === 'white') {
    dirs.push([-1, -1], [-1, 1]);
  } else {
    dirs.push([1, -1], [1, 1]);
  }

  for (const [dr, dc] of dirs) {
    const nr = r + dr;
    const nc = c + dc;

    if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
      if (board[nr][nc] === null) {
        steps.push({ r: nr, c: nc });
      } else if (board[nr][nc].player !== piece.player) {
        const landR = r + 2 * dr;
        const landC = c + 2 * dc;
        if (
          landR >= 0 &&
          landR < BOARD_SIZE &&
          landC >= 0 &&
          landC < BOARD_SIZE &&
          board[landR][landC] === null
        ) {
          captures.push({
            r: landR,
            c: landC,
            jumpOverR: nr,
            jumpOverC: nc,
          });
        }
      }
    }
  }

  return { steps, captures };
}

export function hasAnyCaptures(board, player) {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c];
      if (piece && piece.player === player) {
        const { captures } = getValidMoves(board, r, c);
        if (captures.length > 0) return true;
      }
    }
  }
  return false;
}

export function getAllLegalMoves(board, player) {
  const mustCapture = hasAnyCaptures(board, player);
  const moves = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c];
      if (piece && piece.player === player) {
        const { steps, captures } = getValidMoves(board, r, c);
        const activeTargets = mustCapture ? captures : steps;
        for (const target of activeTargets) {
          moves.push({
            from: { r, c },
            to: { r: target.r, c: target.c },
            isCapture: mustCapture,
            piece,
          });
        }
      }
    }
  }

  return moves;
}

export function getLegalMovesForPiece(board, r, c) {
  const piece = board[r][c];
  if (!piece) return { steps: [], captures: [] };

  const { steps, captures } = getValidMoves(board, r, c);
  const playerMustCapture = hasAnyCaptures(board, piece.player);

  if (playerMustCapture) {
    return { steps: [], captures };
  }

  return { steps, captures: [] };
}

export function applyMove(board, from, to) {
  const nextBoard = cloneBoard(board);
  const piece = nextBoard[from.r][from.c];
  if (!piece) return { nextBoard: board, captured: null, isKinged: false, canMultiJump: false };

  nextBoard[from.r][from.c] = null;

  const isJump = Math.abs(to.r - from.r) === 2 && Math.abs(to.c - from.c) === 2;
  let captured = null;

  if (isJump) {
    const midR = (from.r + to.r) / 2;
    const midC = (from.c + to.c) / 2;
    captured = { r: midR, c: midC };
    nextBoard[midR][midC] = null;
  }

  let isKinged = false;
  if (!piece.isKing) {
    if (piece.player === 'white' && to.r === 0) {
      piece.isKing = true;
      isKinged = true;
    } else if (piece.player === 'black' && to.r === 7) {
      piece.isKing = true;
      isKinged = true;
    }
  }

  nextBoard[to.r][to.c] = piece;

  let canMultiJump = false;
  if (isJump && !isKinged) {
    const { captures } = getValidMoves(nextBoard, to.r, to.c);
    if (captures.length > 0) {
      canMultiJump = true;
    }
  }

  return { nextBoard, captured, isKinged, canMultiJump };
}

export function countPieces(board) {
  let white = 0;
  let black = 0;
  let whiteKings = 0;
  let blackKings = 0;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const p = board[r][c];
      if (p) {
        if (p.player === 'white') {
          white++;
          if (p.isKing) whiteKings++;
        } else {
          black++;
          if (p.isKing) blackKings++;
        }
      }
    }
  }

  return { white, black, whiteKings, blackKings };
}

export function checkWinner(board) {
  const counts = countPieces(board);
  if (counts.white === 0) return 'bot';
  if (counts.black === 0) return 'player';

  let whiteHasMove = false;
  let blackHasMove = false;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const p = board[r][c];
      if (p) {
        const { steps, captures } = getValidMoves(board, r, c);
        if (steps.length > 0 || captures.length > 0) {
          if (p.player === 'white') whiteHasMove = true;
          else blackHasMove = true;
        }
      }
    }
  }

  if (!whiteHasMove) return 'bot';
  if (!blackHasMove) return 'player';

  return null;
}

function evaluateBoardStatic(board) {
  const counts = countPieces(board);
  let score = (counts.black * 100 + counts.blackKings * 175) -
    (counts.white * 100 + counts.whiteKings * 175);

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const p = board[r][c];
      if (!p) continue;
      if (p.player === 'black') {
        if (!p.isKing) score += r * 4;
        if (c >= 2 && c <= 5) score += 6;
        if (r === 0) score += 10;
      } else {
        if (!p.isKing) score -= (7 - r) * 4;
        if (c >= 2 && c <= 5) score -= 6;
        if (r === 7) score -= 10;
      }
    }
  }
  return score;
}

export function getBotMove(board, difficulty = 'standard') {
  const legalMoves = getAllLegalMoves(board, 'black');
  if (legalMoves.length === 0) return null;

  // Tier 1: Gentle (Casual / Playful)
  if (difficulty === 'gentle') {
    const captures = legalMoves.filter((m) => m.isCapture);
    if (captures.length > 0) {
      return captures[Math.floor(Math.random() * captures.length)];
    }
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }

  // Tier 2: Standard (Heuristic 1-ply tactical)
  if (difficulty === 'standard') {
    let bestScore = -Infinity;
    let bestMove = legalMoves[0];

    for (const move of legalMoves) {
      let score = 0;
      if (move.isCapture) score += 120;
      if (!move.piece.isKing && move.to.r === 7) score += 90;
      if (!move.piece.isKing) score += (move.to.r - move.from.r) * 10;
      if (move.to.c >= 2 && move.to.c <= 5) score += 12;
      if (move.from.r === 0 && !move.isCapture) score -= 25;

      const { nextBoard } = applyMove(board, move.from, move.to);
      const oppCaptures = hasAnyCaptures(nextBoard, 'white');
      if (oppCaptures) score -= 90;

      score += Math.random() * 8 - 4;

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    return { from: bestMove.from, to: bestMove.to };
  }

  // Tier 3: Deep (2-ply Minimax lookahead)
  let bestScore = -Infinity;
  let bestMove = legalMoves[0];

  for (const move of legalMoves) {
    const { nextBoard } = applyMove(board, move.from, move.to);
    const whiteReplies = getAllLegalMoves(nextBoard, 'white');

    let worstWhiteResponse = Infinity;

    if (whiteReplies.length === 0) {
      worstWhiteResponse = 10000;
    } else {
      for (const wMove of whiteReplies) {
        const { nextBoard: finalBoard } = applyMove(nextBoard, wMove.from, wMove.to);
        const evalScore = evaluateBoardStatic(finalBoard);
        if (evalScore < worstWhiteResponse) {
          worstWhiteResponse = evalScore;
        }
      }
    }

    const totalScore = worstWhiteResponse + (move.isCapture ? 40 : 0) + (Math.random() * 4);

    if (totalScore > bestScore) {
      bestScore = totalScore;
      bestMove = move;
    }
  }

  return { from: bestMove.from, to: bestMove.to };
}