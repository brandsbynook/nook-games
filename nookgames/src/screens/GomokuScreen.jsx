import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Icon } from '../icons.jsx'
import { GameHeader } from '../components/GameHeader.jsx'
import { DifficultyTabs } from '../components/DifficultyTabs.jsx'
import { GameFooterActions } from '../components/GameFooterActions.jsx'
import {
  BOARD_SIZE,
  STAR_POINTS,
  createEmptyBoard,
  cloneBoard,
  checkWin,
  isBoardFull,
  getBotMove,
} from '../utils/gomokuLogic.js'
import { playTap, playChime } from '../utils/audio.js'
import { recordGameSession, setLastActiveGame } from '../utils/storage.js'

export function GomokuScreen({ onBack }) {
  const [board, setBoard] = useState(createEmptyBoard)
  const [difficulty, setDifficulty] = useState('standard')
  const [turn, setTurn] = useState('B') // 'B' (Player - Black) | 'W' (System - White)
  const [history, setHistory] = useState([]) // array of { board, lastMove, turn }
  const [lastMove, setLastMove] = useState(null) // { r, c }
  const [winningLine, setWinningLine] = useState([]) // Array of { r, c }
  const [winner, setWinner] = useState(null) // 'player' | 'bot' | 'draw' | null
  const [isBotThinking, setIsBotThinking] = useState(false)

  const botTimerRef = useRef(null)

  // Track session resume on mount
  useEffect(() => {
    setLastActiveGame('gomoku', 'Gomoku', 'Strategy')
    return () => {
      if (botTimerRef.current) clearTimeout(botTimerRef.current)
    }
  }, [])

  // Check if a coordinate is winning
  const winningSet = useMemo(() => {
    const set = new Set()
    winningLine.forEach((pt) => set.add(`${pt.r},${pt.c}`))
    return set
  }, [winningLine])

  const handleBack = () => {
    playTap()
    if (onBack) {
      onBack()
    } else {
      window.location.hash = '#/collection/strategy'
    }
  }

  const restartGame = useCallback(() => {
    if (botTimerRef.current) clearTimeout(botTimerRef.current)
    playTap()
    setBoard(createEmptyBoard())
    setTurn('B')
    setHistory([])
    setLastMove(null)
    setWinningLine([])
    setWinner(null)
    setIsBotThinking(false)
  }, [])

  // Execute bot turn after a calm delay
  const executeBotTurn = useCallback((currentBoard) => {
    setIsBotThinking(true)

    botTimerRef.current = setTimeout(() => {
      const move = getBotMove(currentBoard, difficulty)
      if (!move) {
        setWinner('draw')
        recordGameSession('gomoku', false)
        setIsBotThinking(false)
        return
      }

      playTap()
      const nextBoard = cloneBoard(currentBoard)
      nextBoard[move.r][move.c] = 'W'

      const winResult = checkWin(nextBoard, move.r, move.c, 'W')
      if (winResult.won) {
        setBoard(nextBoard)
        setLastMove({ r: move.r, c: move.c })
        setWinningLine(winResult.line)
        setWinner('bot')
        recordGameSession('gomoku', false)
        setIsBotThinking(false)
      } else if (isBoardFull(nextBoard)) {
        setBoard(nextBoard)
        setLastMove({ r: move.r, c: move.c })
        setWinner('draw')
        recordGameSession('gomoku', false)
        setIsBotThinking(false)
      } else {
        setBoard(nextBoard)
        setLastMove({ r: move.r, c: move.c })
        setTurn('B')
        setIsBotThinking(false)
      }
    }, 420)
  }, [difficulty])

  // Handle player stone placement
  const handleCellClick = useCallback((r, c) => {
    if (board[r][c] !== null || turn !== 'B' || isBotThinking || winner) {
      return
    }

    playTap()

    // Save snapshot for undo
    const snapshot = {
      board: cloneBoard(board),
      lastMove,
      turn: 'B',
    }

    const nextBoard = cloneBoard(board)
    nextBoard[r][c] = 'B'
    const newLastMove = { r, c }

    const winResult = checkWin(nextBoard, r, c, 'B')
    if (winResult.won) {
      setHistory((prev) => [...prev, snapshot])
      setBoard(nextBoard)
      setLastMove(newLastMove)
      setWinningLine(winResult.line)
      setWinner('player')
      recordGameSession('gomoku', true)
      setTimeout(() => playChime(), 200)
      return
    }

    if (isBoardFull(nextBoard)) {
      setHistory((prev) => [...prev, snapshot])
      setBoard(nextBoard)
      setLastMove(newLastMove)
      setWinner('draw')
      recordGameSession('gomoku', false)
      return
    }

    setHistory((prev) => [...prev, snapshot])
    setBoard(nextBoard)
    setLastMove(newLastMove)
    setTurn('W')

    executeBotTurn(nextBoard)
  }, [board, turn, isBotThinking, winner, lastMove, executeBotTurn])

  // Handle undo: reverts bot move and player move together
  const handleUndo = () => {
    if (isBotThinking || history.length === 0) return
    playTap()
    if (botTimerRef.current) clearTimeout(botTimerRef.current)

    const previousState = history[history.length - 1]
    setHistory((prev) => prev.slice(0, -1))
    setBoard(previousState.board)
    setLastMove(previousState.lastMove)
    setTurn(previousState.turn)
    setWinningLine([])
    setWinner(null)
    setIsBotThinking(false)
  }

  // Count total placed stones
  const moveCount = useMemo(() => {
    let count = 0
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (board[r][c] !== null) count++
      }
    }
    return count
  }, [board])

  return (
    <div className="gmk-page game-screen-container">
      {/* ── Top Bar ─────────────────────────────────────────── */}
      <GameHeader title="Gomoku" onBack={handleBack} />

      {/* ── Difficulty Tabs ─────────────────────────────────── */}
      <DifficultyTabs
        currentTier={difficulty}
        onSelectTier={(diff) => {
          setDifficulty(diff)
          restartGame()
        }}
        tiers={[
          { id: 'gentle', label: 'Gentle', subtitle: 'Casual' },
          { id: 'standard', label: 'Standard', subtitle: 'Tactical' },
          { id: 'deep', label: 'Deep', subtitle: 'Master' },
        ]}
      />

      {/* ── Status Indicator ─────────────────────────────────── */}
      <div className="gmk-status-bar">
        <div className="gmk-status-pill">
          {winner ? (
            winner === 'player' ? (
              <span className="gmk-status-text gmk-status-text--win">Five in harmony · Black wins</span>
            ) : winner === 'bot' ? (
              <span className="gmk-status-text gmk-status-text--loss">System aligned five · White wins</span>
            ) : (
              <span className="gmk-status-text">Stalemate · Balance achieved</span>
            )
          ) : isBotThinking ? (
            <>
              <span className="gmk-stone-pip gmk-stone-pip--white gmk-pulse" />
              <span className="gmk-status-text">System contemplating...</span>
            </>
          ) : (
            <>
              <span className="gmk-stone-pip gmk-stone-pip--black" />
              <span className="gmk-status-text">Your turn (Black)</span>
            </>
          )}
        </div>
      </div>

      {/* ── Gomoku Board ────────────────────────────────────── */}
      <main className="gmk-board-container">
        <div className="gmk-board" role="grid" aria-label="Gomoku 11 by 11 board">
          {/* Crisp background SVG grid lines and star points */}
          <svg
            className="gmk-grid-svg"
            viewBox="0 0 110 110"
            aria-hidden="true"
          >
            {/* Grid lines: 11 horizontal and 11 vertical */}
            {Array.from({ length: 11 }).map((_, i) => (
              <g key={`lines-${i}`}>
                {/* Horizontal line from center of col 0 to center of col 10 */}
                <line
                  x1="5"
                  y1={5 + i * 10}
                  x2="105"
                  y2={5 + i * 10}
                  className="gmk-line"
                />
                {/* Vertical line from center of row 0 to center of row 10 */}
                <line
                  x1={5 + i * 10}
                  y1="5"
                  x2={5 + i * 10}
                  y2="105"
                  className="gmk-line"
                />
              </g>
            ))}

            {/* Traditional Star Points (hoshi) */}
            {STAR_POINTS.map((sp, idx) => (
              <circle
                key={`star-${idx}`}
                cx={5 + sp.c * 10}
                cy={5 + sp.r * 10}
                r="1.7"
                className="gmk-star-point"
              />
            ))}
          </svg>

          {/* Interactive 11×11 intersection overlay */}
          <div className="gmk-intersections-grid">
            {board.map((row, r) =>
              row.map((cell, c) => {
                const isWinning = winningSet.has(`${r},${c}`)
                const isLast = lastMove && lastMove.r === r && lastMove.c === c

                return (
                  <button
                    key={`cell-${r}-${c}`}
                    id={`gmk-cell-${r}-${c}`}
                    className={`gmk-cell ${cell ? 'gmk-cell--occupied' : ''}`}
                    onClick={() => handleCellClick(r, c)}
                    disabled={Boolean(cell || isBotThinking || winner)}
                    aria-label={`Intersection ${r + 1}, ${c + 1}${
                      cell === 'B' ? ': Black stone' : cell === 'W' ? ': White stone' : ': Empty'
                    }`}
                  >
                    {cell && (
                      <span
                        className={`gmk-stone gmk-stone--${cell === 'B' ? 'black' : 'white'} ${
                          isWinning ? 'gmk-stone--win' : ''
                        } ${isLast ? 'gmk-stone--last' : ''}`}
                      >
                        {isLast && <span className="gmk-stone-marker" />}
                      </span>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      </main>

      {/* ── Control Actions ─────────────────────────────────── */}
      {/* ── Control Actions ─────────────────────────────────── */}
      <GameFooterActions
        onReset={restartGame}
        onUndo={handleUndo}
        canUndo={history.length > 0 && !isBotThinking}
        resetLabel="Reset"
        undoLabel="Undo"
      />

      {/* ── Victory / Defeat Modal ──────────────────────────── */}
      {winner && (
        <div className="gmk-modal-backdrop" role="dialog" aria-modal="true" aria-label="Game complete">
          <div className="gmk-modal-card">
            <div
              className={`gmk-modal-badge ${
                winner === 'player' ? 'gmk-modal-badge--win' : 'gmk-modal-badge--loss'
              }`}
            >
              {winner === 'player' ? '✦' : '•'}
            </div>

            <h2 className="gmk-modal-title">
              {winner === 'player'
                ? 'Five in Harmony'
                : winner === 'bot'
                ? 'Quiet Contemplation'
                : 'Balanced Stalemate'}
            </h2>

            <p className="gmk-modal-desc">
              {winner === 'player'
                ? 'You aligned five uninterrupted stones. Spatial intent brought into harmony.'
                : winner === 'bot'
                ? 'The system recognized an unbroken five-stone alignment first.'
                : 'All 121 intersections have been filled in total equilibrium.'}
            </p>

            <div className="gmk-modal-stats">
              <div className="gmk-modal-stat">
                <span className="gmk-stat-label">Total Stones</span>
                <span className="gmk-stat-value">{moveCount}</span>
              </div>
              <div className="gmk-modal-stat">
                <span className="gmk-stat-label">Turns</span>
                <span className="gmk-stat-value">{Math.ceil(moveCount / 2)}</span>
              </div>
            </div>

            <div className="gmk-modal-actions">
              <button
                id="gmk-modal-restart-btn"
                className="gmk-modal-primary-btn"
                onClick={restartGame}
              >
                Play Again
              </button>
              <button
                id="gmk-modal-back-btn"
                className="gmk-modal-secondary-btn"
                onClick={handleBack}
              >
                Return to Strategy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GomokuScreen
