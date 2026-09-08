/**
 * gomokuLogic.js
 *
 * Core logic for 11×11 Gomoku (Five in a Row).
 * Includes board state utilities, 5-in-a-row detection with winning line tracking,
 * and an intelligent heuristic AI opponent for White with offensive/defensive tactical evaluation.
 */

export const BOARD_SIZE = 11;

export const STAR_POINTS = [
  { r: 3, c: 3 },
  { r: 3, c: 7 },
  { r: 7, c: 3 },
  { r: 7, c: 7 },
  { r: 5, c: 5 },
];

export const DIRECTIONS = [
  [0, 1],   // horizontal
  [1, 0],   // vertical
  [1, 1],   // diagonal \
  [1, -1],  // diagonal /
];

/**
 * Returns a fresh 11×11 grid filled with null.
 */
export function createEmptyBoard() {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
}

/**
 * Deep clones an 11×11 board.
 */
export function cloneBoard(board) {
  return board.map((row) => [...row]);
}

/**
 * Checks if the last move at (r, c) by color resulted in 5 or more in a row.
 * Returns { won: boolean, line: Array<{r, c}> }
 */
export function checkWin(board, r, c, color) {
  if (!color || r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) {
    return { won: false, line: [] };
  }

  for (const [dr, dc] of DIRECTIONS) {
    let count = 1;
    const line = [{ r, c }];

    // Positive direction
    let step = 1;
    while (true) {
      const nr = r + dr * step;
      const nc = c + dc * step;
      if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) break;
      if (board[nr][nc] !== color) break;
      count++;
      line.push({ r: nr, c: nc });
      step++;
    }

    // Negative direction
    step = 1;
    while (true) {
      const nr = r - dr * step;
      const nc = c - dc * step;
      if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) break;
      if (board[nr][nc] !== color) break;
      count++;
      line.push({ r: nr, c: nc });
      step++;
    }

    if (count >= 5) {
      return { won: true, line };
    }
  }

  return { won: false, line: [] };
}

/**
 * Checks if the board is completely filled.
 */
export function isBoardFull(board) {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === null) return false;
    }
  }
  return true;
}

/**
 * Evaluates line potential in a specific direction if `color` places a stone at (r, c).
 */
function evaluateDirection(board, r, c, color, dr, dc) {
  let consec1 = 0;
  let empty1 = 0;
  let step = 1;
  while (step <= 4) {
    const nr = r + dr * step;
    const nc = c + dc * step;
    if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) break;
    if (board[nr][nc] === color) {
      if (empty1 === 0) consec1++;
      else break;
    } else if (board[nr][nc] === null) {
      empty1++;
      break;
    } else {
      break; // Opponent stone
    }
    step++;
  }

  let consec2 = 0;
  let empty2 = 0;
  step = 1;
  while (step <= 4) {
    const nr = r - dr * step;
    const nc = c - dc * step;
    if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) break;
    if (board[nr][nc] === color) {
      if (empty2 === 0) consec2++;
      else break;
    } else if (board[nr][nc] === null) {
      empty2++;
      break;
    } else {
      break;
    }
    step++;
  }

  const totalConsec = 1 + consec1 + consec2;
  const openEnds = (empty1 > 0 ? 1 : 0) + (empty2 > 0 ? 1 : 0);

  // Check if at least 5 spaces are available in this direction
  let maxPotential = totalConsec;
  step = consec1 + 1;
  while (step <= 4) {
    const nr = r + dr * step;
    const nc = c + dc * step;
    if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) break;
    if (board[nr][nc] === color || board[nr][nc] === null) maxPotential++;
    else break;
    step++;
  }
  step = consec2 + 1;
  while (step <= 4) {
    const nr = r - dr * step;
    const nc = c - dc * step;
    if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) break;
    if (board[nr][nc] === color || board[nr][nc] === null) maxPotential++;
    else break;
    step++;
  }

  if (maxPotential < 5) return { score: 0, openThree: false, openFour: false };

  // 5 in a row: Win
  if (totalConsec >= 5) {
    return { score: 10000000, openThree: false, openFour: false };
  }
  // 4 in a row
  if (totalConsec === 4) {
    if (openEnds === 2) return { score: 1000000, openThree: false, openFour: true };
    if (openEnds === 1) return { score: 100000, openThree: false, openFour: false };
  }
  // 3 in a row
  if (totalConsec === 3) {
    if (openEnds === 2) return { score: 10000, openThree: true, openFour: false };
    if (openEnds === 1) return { score: 1000, openThree: false, openFour: false };
  }
  // 2 in a row
  if (totalConsec === 2) {
    if (openEnds === 2) return { score: 300, openThree: false, openFour: false };
    if (openEnds === 1) return { score: 40, openThree: false, openFour: false };
  }
  // 1 stone with room
  if (totalConsec === 1 && openEnds === 2) {
    return { score: 10, openThree: false, openFour: false };
  }

  return { score: 0, openThree: false, openFour: false };
}

/**
 * Calculates aggregate heuristic value of placing `color` at (r, c).
 */
export function evaluateMove(board, r, c, color) {
  let totalScore = 0;
  let openThreeCount = 0;
  let openFourCount = 0;

  for (const [dr, dc] of DIRECTIONS) {
    const res = evaluateDirection(board, r, c, color, dr, dc);
    totalScore += res.score;
    if (res.openThree) openThreeCount++;
    if (res.openFour) openFourCount++;
  }

  // Tactical multi-threat bonuses
  if (openFourCount >= 2) totalScore += 800000;
  if (openThreeCount >= 2) totalScore += 200000;

  return totalScore;
}

/**
 * Intelligent AI opponent for White:
 * - Executes immediate winning lines (5-in-a-row, open 4)
 * - Blocks player's winning lines and open 3s/4s
 * - Builds harmonious connected structures with central weighting
 */
export function getBotMove(board) {
  let bestScore = -Infinity;
  let bestMoves = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== null) continue;

      const attack = evaluateMove(board, r, c, 'W');
      const defense = evaluateMove(board, r, c, 'B');

      // Immediate win takes ultimate priority
      if (attack >= 10000000) {
        return { r, c };
      }

      let moveScore = 0;
      if (defense >= 10000000) {
        // Must block imminent 5
        moveScore = 5000000 + attack;
      } else if (attack >= 1000000) {
        // AI creates Open 4 (unblockable)
        moveScore = 2000000;
      } else if (defense >= 1000000) {
        // Must block Player Open 4
        moveScore = 1500000;
      } else if (defense >= 100000) {
        // Must block Player Half-open 4
        moveScore = 500000 + attack;
      } else if (attack >= 100000) {
        // AI makes 4
        moveScore = 400000;
      } else {
        // Balanced tactical evaluation (defensive weight 1.25 to neutralize player's first-move advantage)
        moveScore = attack + defense * 1.25;
      }

      // Proximity to center bonus (encourages active play rather than corner drifting)
      const centerDist = Math.abs(r - 5) + Math.abs(c - 5);
      const centerBonus = (10 - centerDist) * 2;
      moveScore += centerBonus;

      if (moveScore > bestScore) {
        bestScore = moveScore;
        bestMoves = [{ r, c }];
      } else if (moveScore === bestScore) {
        bestMoves.push({ r, c });
      }
    }
  }

  if (bestMoves.length === 0) return null;
  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}
