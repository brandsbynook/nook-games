/**
 * gomokuLogic.js
 *
 * Core logic for 11×11 Gomoku (Five in a Row).
 * Calibrated 3-tier bot:
 * - Gentle: Relaxed play, blocks immediate 5-in-a-row but overlooks open 3s
 * - Standard: Responsive tactical heuristic (blocks 4s and open 3s)
 * - Deep: Minimax depth search across prioritized threat nodes
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

export function createEmptyBoard() {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
}

export function cloneBoard(board) {
  return board.map((row) => [...row]);
}

export function checkWin(board, r, c, color) {
  if (!color || r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) {
    return { won: false, line: [] };
  }

  for (const [dr, dc] of DIRECTIONS) {
    let count = 1;
    const line = [{ r, c }];

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

export function isBoardFull(board) {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === null) return false;
    }
  }
  return true;
}

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
      break;
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

  if (totalConsec >= 5) {
    return { score: 10000000, openThree: false, openFour: false };
  }
  if (totalConsec === 4) {
    if (openEnds === 2) return { score: 1000000, openThree: false, openFour: true };
    if (openEnds === 1) return { score: 100000, openThree: false, openFour: false };
  }
  if (totalConsec === 3) {
    if (openEnds === 2) return { score: 10000, openThree: true, openFour: false };
    if (openEnds === 1) return { score: 1200, openThree: false, openFour: false };
  }
  if (totalConsec === 2) {
    if (openEnds === 2) return { score: 350, openThree: false, openFour: false };
    if (openEnds === 1) return { score: 50, openThree: false, openFour: false };
  }
  if (totalConsec === 1 && openEnds === 2) {
    return { score: 15, openThree: false, openFour: false };
  }

  return { score: 0, openThree: false, openFour: false };
}

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

  if (openFourCount >= 2) totalScore += 800000;
  if (openThreeCount >= 2) totalScore += 200000;

  return totalScore;
}

export function getBotMove(board, difficulty = 'standard') {
  let bestScore = -Infinity;
  let bestMoves = [];
  const candidateScores = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== null) continue;

      const attack = evaluateMove(board, r, c, 'W');
      const defense = evaluateMove(board, r, c, 'B');

      if (attack >= 10000000) {
        return { r, c };
      }

      let moveScore = 0;
      if (defense >= 10000000) {
        moveScore = 5000000 + attack;
      } else if (attack >= 1000000) {
        moveScore = 2000000;
      } else if (defense >= 1000000) {
        moveScore = 1500000;
      } else if (defense >= 100000) {
        moveScore = 500000 + attack;
      } else if (attack >= 100000) {
        moveScore = 400000;
      } else {
        const defWeight = difficulty === 'deep' ? 1.5 : difficulty === 'gentle' ? 0.6 : 1.2;
        moveScore = attack + defense * defWeight;
      }

      const centerDist = Math.abs(r - 5) + Math.abs(c - 5);
      moveScore += (10 - centerDist) * 3;

      candidateScores.push({ r, c, score: moveScore });

      if (moveScore > bestScore) {
        bestScore = moveScore;
        bestMoves = [{ r, c }];
      } else if (moveScore === bestScore) {
        bestMoves.push({ r, c });
      }
    }
  }

  if (candidateScores.length === 0) return null;

  // Tier 1: Gentle — occasionally plays 2nd or 3rd best move
  if (difficulty === 'gentle' && bestScore < 1000000) {
    candidateScores.sort((a, b) => b.score - a.score);
    const pool = candidateScores.slice(0, Math.min(4, candidateScores.length));
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // Tier 3: Deep — lookahead 1 full turn across top candidate moves
  if (difficulty === 'deep' && bestScore < 1000000) {
    candidateScores.sort((a, b) => b.score - a.score);
    const topCandidates = candidateScores.slice(0, Math.min(5, candidateScores.length));

    let deepBestScore = -Infinity;
    let deepBestMove = topCandidates[0];

    for (const cand of topCandidates) {
      const simulatedBoard = cloneBoard(board);
      simulatedBoard[cand.r][cand.c] = 'W';

      let maxPlayerReply = 0;
      for (let pr = 0; pr < BOARD_SIZE; pr++) {
        for (let pc = 0; pc < BOARD_SIZE; pc++) {
          if (simulatedBoard[pr][pc] !== null) continue;
          const pScore = evaluateMove(simulatedBoard, pr, pc, 'B');
          if (pScore > maxPlayerReply) maxPlayerReply = pScore;
        }
      }

      const projectedScore = cand.score - maxPlayerReply * 0.7;
      if (projectedScore > deepBestScore) {
        deepBestScore = projectedScore;
        deepBestMove = cand;
      }
    }

    return { r: deepBestMove.r, c: deepBestMove.c };
  }

  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}