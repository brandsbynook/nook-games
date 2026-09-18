/**
 * checkersLogic.js - Standard Solo Draughts / Checkers vs System
 */

export const BOARD_SIZE = 8;

/**
 * Initializes the 8x8 checkers board.
 * Pieces placed only on dark squares where (r + c) % 2 === 1.
 * Black: rows 0, 1, 2
 * White: rows 5, 6, 7
 */
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

/**
 * Clones a 2D board matrix.
 */
export function cloneBoard(board) {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

/**
 * Returns available regular diagonal steps and jump captures for piece at (r, c).
 */
export function getValidMoves(board, r, c) {
  if (!board || r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) {
    return { steps: [], captures: [] };
  }

  const piece = board[r][c];
  if (!piece) return { steps: [], captures: [] };

  const steps = [];
  const captures = [];

  // Determine diagonal directions
  const dirs = [];
  if (piece.isKing) {
    dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
  } else if (piece.player === 'white') {
    dirs.push([-1, -1], [-1, 1]); // Moving up
  } else {
    dirs.push([1, -1], [1, 1]); // Moving down
  }

  for (const [dr, dc] of dirs) {
    const nr = r + dr;
    const nc = c + dc;

    // 1. Regular 1-square diagonal step
    if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
      if (board[nr][nc] === null) {
        steps.push({ r: nr, c: nc });
      } else if (board[nr][nc].player !== piece.player) {
        // 2. Jump capture over enemy piece
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

/**
 * Checks if the player has any mandatory jump opportunities on the board.
 */
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

/**
 * Returns all playable destination moves for a piece at (r, c), respecting
 * mandatory capture rules.
 */
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

/**
 * Applies a move from (from.r, from.c) to (to.r, to.c).
 * Handles jump removal, kinging, and detects if multi-jump is available.
 */
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

  // Kinging check
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

  // Multi-jump check: if jumped and wasn't just crowned King on this step
  let canMultiJump = false;
  if (isJump && !isKinged) {
    const { captures } = getValidMoves(nextBoard, to.r, to.c);
    if (captures.length > 0) {
      canMultiJump = true;
    }
  }

  return { nextBoard, captured, isKinged, canMultiJump };
}

/**
 * Counts pieces on the board.
 */
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

/**
 * Checks winner: 'player' | 'bot' | null
 */
export function checkWinner(board) {
  const counts = countPieces(board);
  if (counts.white === 0) return 'bot';
  if (counts.black === 0) return 'player';

  // Check mobility
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

/**
 * Intelligent Bot Move:
 * Evaluates legal moves for Black (System).
 * Prioritizes captures/multi-captures, king creation, central control, and safe advances.
 */
export function getBotMove(board, difficulty = 'standard') {
  const isCapturing = hasAnyCaptures(board, 'black');
  const candidateMoves = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c];
      if (piece && piece.player === 'black') {
        const { steps, captures } = getValidMoves(board, r, c);
        const movesToConsider = isCapturing ? captures : steps;

        for (const target of movesToConsider) {
          candidateMoves.push({
            from: { r, c },
            to: { r: target.r, c: target.c },
            isCapture: isCapturing,
            piece,
          });
        }
      }
    }
  }

  if (candidateMoves.length === 0) return null;

  // Level 1: Gentle — random pick with high jitter
  if (difficulty === 'gentle') {
    const randomMove = candidateMoves[Math.floor(Math.random() * candidateMoves.length)];
    return { from: randomMove.from, to: randomMove.to };
  }

  let bestMove = null;
  let bestScore = -Infinity;

  for (const move of candidateMoves) {
    let score = 0;

    // 1. Capture bonus
    if (move.isCapture) {
      score += 120;
    }

    // 2. King creation bonus
    if (!move.piece.isKing && move.to.r === 7) {
      score += 90;
    }

    // 3. Forward progression for regular men
    if (!move.piece.isKing) {
      score += (move.to.r - move.from.r) * 12;
    }

    // 4. Center control (columns 2, 3, 4, 5)
    if (move.to.c >= 2 && move.to.c <= 5) {
      score += 15;
    }

    // 5. Back row protection (don't vacate row 0 without good reason)
    if (move.from.r === 0 && !move.isCapture) {
      score -= 20;
    }

    // 6. Blunder check / opponent response simulation
    const { nextBoard } = applyMove(board, move.from, move.to);
    const oppHasCapture = hasAnyCaptures(nextBoard, 'white');
    if (oppHasCapture) {
      // Check if white can specifically jump our landed piece
      for (let wr = 0; wr < BOARD_SIZE; wr++) {
        for (let wc = 0; wc < BOARD_SIZE; wc++) {
          const wp = nextBoard[wr][wc];
          if (wp && wp.player === 'white') {
            const { captures } = getValidMoves(nextBoard, wr, wc);
            const capturesOurLanded = captures.find(
              (cap) => cap.jumpOverR === move.to.r && cap.jumpOverC === move.to.c
            );
            if (capturesOurLanded) {
              score -= move.piece.isKing ? 150 : 80;
            }
          }
        }
      }
    }

    // Level 3: Deep — lookahead evaluation on material balance
    if (difficulty === 'deep') {
      const countsAfter = countPieces(nextBoard);
      const materialAdvantage =
        (countsAfter.blackPieces + countsAfter.blackKings * 1.5) -
        (countsAfter.whitePieces + countsAfter.whiteKings * 1.5);
      score += materialAdvantage * 30;
      if (countsAfter.whitePieces === 0) score += 500;
    }

    // Subtle random jitter
    score += Math.random() * 6 - 3;

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove ? { from: bestMove.from, to: bestMove.to } : null;
}
