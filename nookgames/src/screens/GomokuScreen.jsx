import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Icon } from '../components/Icons'
import { GameHeader } from '../components/GameHeader.jsx'
import { DifficultyTabs } from '../components/DifficultyTabs.jsx'
import { GameFooterActions } from '../components/GameFooterActions.jsx'
import { GameCompletionModal } from '../components/GameCompletionModal.jsx'
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
  const [lastMove, setLastMove] = useState(null) // { r, c }
  const [winningLine, setWinningLine] = useState([]) // Array of { r, c }
  const [winner, setWinner] = useState(null) // 'player' | 'bot' | 'draw' | null
  const [isBotThinking, setIsBotThinking] = useState(false)

  // Snapshots for non-destructive history inspection
  const [snapshots, setSnapshots] = useState(() => [
    { board: createEmptyBoard(), lastMove: null, turn: 'B', winningLine: [] },
  ])
  const [historyIndex, setHistoryIndex] = useState(0)
  const isInspecting = historyIndex < snapshots.length - 1
  const displayedState =
    snapshots[historyIndex] || { board, lastMove, turn, winningLine }
  const displayBoard = displayedState.board
  const displayLastMove = displayedState.lastMove
  const displayWinningLine = displayedState.winningLine || []

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
    displayWinningLine.forEach((pt) => set.add(`${pt.r},${pt.c}`))
    return set
  }, [displayWinningLine])

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
    const initial = createEmptyBoard()
    setBoard(initial)
    setTurn('B')
    setLastMove(null)
    setWinningLine([])
    setWinner(null)
    setIsBotThinking(false)
    setSnapshots([{ board: initial, lastMove: null, turn: 'B', winningLine: [] }])
    setHistoryIndex(0)
  }, [])

  // Execute bot turn after a calm delay
  const executeBotTurn = useCallback(
    (currentBoard) => {
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
        const botMovePos = { r: move.r, c: move.c }

        const winResult = checkWin(nextBoard, move.r, move.c, 'W')
        if (winResult.won) {
          setBoard(nextBoard)
          setLastMove(botMovePos)
          setWinningLine(winResult.line)
          setWinner('bot')
          recordGameSession('gomoku', false)
          setIsBotThinking(false)

          setSnapshots((prev) => {
            const next = [
              ...prev,
              {
                board: nextBoard,
                lastMove: botMovePos,
                turn: 'W',
                winningLine: winResult.line,
              },
            ]
            setHistoryIndex(next.length - 1)
            return next
          })
        } else if (isBoardFull(nextBoard)) {
          setBoard(nextBoard)
          setLastMove(botMovePos)
          setWinner('draw')
          recordGameSession('gomoku', false)
          setIsBotThinking(false)

          setSnapshots((prev) => {
            const next = [
              ...prev,
              { board: nextBoard, lastMove: botMovePos, turn: 'W', winningLine: [] },
            ]
            setHistoryIndex(next.length - 1)
            return next
          })
        } else {
          setBoard(nextBoard)
          setLastMove(botMovePos)
          setTurn('B')
          setIsBotThinking(false)

          setSnapshots((prev) => {
            const next = [
              ...prev,
              { board: nextBoard, lastMove: botMovePos, turn: 'B', winningLine: [] },
            ]
            setHistoryIndex(next.length - 1)
            return next
          })
        }
      }, 420)
    },
    [difficulty]
  )

  // Handle player stone placement
  const handleCellClick = useCallback(
    (r, c) => {
      if (board[r][c] !== null || turn !== 'B' || isBotThinking || winner || isInspecting) {
        return
      }

      playTap()

      const nextBoard = cloneBoard(board)
      nextBoard[r][c] = 'B'
      const newLastMove = { r, c }

      const winResult = checkWin(nextBoard, r, c, 'B')
      if (winResult.won) {
        setBoard(nextBoard)
        setLastMove(newLastMove)
        setWinningLine(winResult.line)
        setWinner('player')
        recordGameSession('gomoku', true)
        setTimeout(() => playChime(), 200)

        setSnapshots((prev) => {
          const next = [
            ...prev.slice(0, historyIndex + 1),
            {
              board: nextBoard,
              lastMove: newLastMove,
              turn: 'B',
              winningLine: winResult.line,
            },
          ]
          setHistoryIndex(next.length - 1)
          return next
        })
        return
      }

      if (isBoardFull(nextBoard)) {
        setBoard(nextBoard)
        setLastMove(newLastMove)
        setWinner('draw')
        recordGameSession('gomoku', false)

        setSnapshots((prev) => {
          const next = [
            ...prev.slice(0, historyIndex + 1),
            {
              board: nextBoard,
              lastMove: newLastMove,
              turn: 'B',
              winningLine: [],
            },
          ]
          setHistoryIndex(next.length - 1)
          return next
        })
        return
      }

      setBoard(nextBoard)
      setLastMove(newLastMove)
      setTurn('W')

      setSnapshots((prev) => {
        const next = [
          ...prev.slice(0, historyIndex + 1),
          {
            board: nextBoard,
            lastMove: newLastMove,
            turn: 'W',
            winningLine: [],
          },
        ]
        setHistoryIndex(next.length - 1)
        return next
      })

      executeBotTurn(nextBoard)
    },
    [board, turn, isBotThinking, winner, isInspecting, historyIndex, executeBotTurn]
  )

  // Handle undo: reverts bot move and player move together
  const handleUndo = () => {
    if (isBotThinking || snapshots.length <= 1) return
    playTap()
    if (botTimerRef.current) clearTimeout(botTimerRef.current)

    const stepBackCount = snapshots.length >= 3 ? 2 : 1
    const newSnapshots = snapshots.slice(0, -stepBackCount)
    if (newSnapshots.length === 0) return

    const previousState = newSnapshots[newSnapshots.length - 1]
    setSnapshots(newSnapshots)
    setHistoryIndex(newSnapshots.length - 1)
    setBoard(previousState.board)
    setLastMove(previousState.lastMove)
    setTurn(previousState.turn)
    setWinningLine(previousState.winningLine || [])
    setWinner(null)
    setIsBotThinking(false)
  }

  const handleStepBack = () => {
    if (historyIndex > 0) {
      playTap()
      setHistoryIndex((prev) => prev - 1)
    }
  }

  const handleStepForward = () => {
    if (historyIndex < snapshots.length - 1) {
      playTap()
      setHistoryIndex((prev) => prev + 1)
    }
  }

  // Count total placed stones
  const moveCount = useMemo(() => {
    let count = 0
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (displayBoard[r][c] !== null) count++
      }
    }
    return count
  }, [displayBoard])

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
          {isInspecting ? (
            <span className="gmk-status-text">
              Inspecting Move {historyIndex + 1} of {snapshots.length}
            </span>
          ) : winner ? (
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
            {displayBoard.map((row, r) =>
              row.map((cell, c) => {
                const isWinning = winningSet.has(`${r},${c}`)
                const isLast = displayLastMove && displayLastMove.r === r && displayLastMove.c === c

                return (
                  <button
                    key={`cell-${r}-${c}`}
                    id={`gmk-cell-${r}-${c}`}
                    className={`gmk-cell ${cell ? 'gmk-cell--occupied' : ''}`}
                    onClick={() => handleCellClick(r, c)}
                    disabled={Boolean(cell || isBotThinking || winner || isInspecting)}
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
      <GameFooterActions
        onReset={restartGame}
        onUndo={handleUndo}
        canUndo={snapshots.length > 1 && !isBotThinking && !isInspecting}
        onStepBack={handleStepBack}
        onStepForward={handleStepForward}
        canStepBack={historyIndex > 0}
        canStepForward={historyIndex < snapshots.length - 1}
        stepIndicator={`${historyIndex + 1} / ${snapshots.length}`}
        isInspecting={isInspecting}
        onExitInspection={() => setHistoryIndex(snapshots.length - 1)}
        resetLabel="Reset"
        undoLabel="Undo"
      />

      {/* ── Victory / Defeat Modal ──────────────────────────── */}
      <GameCompletionModal
        isOpen={!!winner}
        title={
          winner === 'player'
            ? 'Five in Harmony'
            : winner === 'bot'
            ? 'Quiet Contemplation'
            : 'Balanced Stalemate'
        }
        subtitle={
          winner === 'player'
            ? 'You aligned five uninterrupted stones. Spatial intent brought into harmony.'
            : winner === 'bot'
            ? 'The system recognized an unbroken five-stone alignment first.'
            : 'All 121 intersections have been filled in total equilibrium.'
        }
        stats={[
          { label: 'Total Stones', value: moveCount },
          { label: 'Turns', value: Math.ceil(moveCount / 2) },
          { label: 'Difficulty', value: difficulty.toUpperCase() },
        ]}
        primaryAction={{
          label: 'Play Again',
          onClick: restartGame,
        }}
        secondaryAction={{
          label: 'Return to Strategy',
          onClick: handleBack,
        }}
        reviewLabel="Review Board"
      />
    </div>
  )
}

export default GomokuScreen

