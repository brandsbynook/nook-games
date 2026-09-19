import { useState, useEffect, useCallback, useRef } from 'react'
import { GameHeader } from '../components/GameHeader.jsx'
import { DifficultyTabs } from '../components/DifficultyTabs.jsx'
import { GameFooterActions } from '../components/GameFooterActions.jsx'
import { GameCompletionModal } from '../components/GameCompletionModal.jsx'
import {
  createInitialBoard,
  cloneBoard,
  getValidMoves,
  applyMove,
  countStones,
  getBestAiMove,
} from '../utils/reversiLogic.js'
import { playTap, playChime } from '../utils/audio.js'
import { recordGameSession } from '../utils/storage.js'

export function ReversiScreen({ onBack }) {
  const [difficulty, setDifficulty] = useState('standard')
  const [board, setBoard] = useState(createInitialBoard)
  const [turn, setTurn] = useState('W') // 'W' = Player, 'B' = AI Companion
  const [isAiThinking, setIsAiThinking] = useState(false)
  const [lastMove, setLastMove] = useState(null)
  const [recentlyFlipped, setRecentlyFlipped] = useState([])
  const [statusMessage, setStatusMessage] = useState('')
  const [isGameOver, setIsGameOver] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [showToast, setShowToast] = useState(false)

  // Snapshots for non-destructive history inspection
  const [snapshots, setSnapshots] = useState(() => [
    { board: createInitialBoard(), turn: 'W', lastMove: null, recentlyFlipped: [] },
  ])
  const [historyIndex, setHistoryIndex] = useState(0)
  const isInspecting = historyIndex < snapshots.length - 1
  const displayedState = snapshots[historyIndex] || { board, turn, lastMove, recentlyFlipped }
  const displayBoard = displayedState.board
  const displayScores = countStones(displayBoard)
  const displayLastMove = displayedState.lastMove
  const displayRecentlyFlipped = displayedState.recentlyFlipped

  const aiTimerRef = useRef(null)

  const scores = countStones(board)
  const validMoves =
    turn === 'W' && !isGameOver && !isAiThinking && !isInspecting ? getValidMoves(board, 'W') : []
  const validMoveMap = new Set(validMoves.map((m) => `${m.row},${m.col}`))

  // Show temporary toast message
  const triggerToast = useCallback((msg, duration = 2400) => {
    setToastMessage(msg)
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
    }, duration)
  }, [])

  // Handle back to Briefing or parent
  const handleBack = (e) => {
    if (e?.preventDefault) e.preventDefault()
    playTap()
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current)
    if (typeof onBack === 'function') {
      onBack()
    } else {
      window.location.hash = '#/briefing/reversi'
    }
  }

  // Handle restart
  const handleRestart = useCallback(() => {
    playTap()
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current)
    const initial = createInitialBoard()
    setBoard(initial)
    setTurn('W')
    setIsAiThinking(false)
    setLastMove(null)
    setRecentlyFlipped([])
    setStatusMessage('')
    setIsGameOver(false)
    setShowToast(false)
    setSnapshots([{ board: initial, turn: 'W', lastMove: null, recentlyFlipped: [] }])
    setHistoryIndex(0)
  }, [])

  // Handle Undo
  const handleUndo = useCallback(() => {
    if (snapshots.length <= 1 || isAiThinking) return
    playTap()
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current)

    const stepBackCount = snapshots.length >= 3 ? 2 : 1
    const newSnapshots = snapshots.slice(0, -stepBackCount)
    if (newSnapshots.length === 0) return

    const restored = newSnapshots[newSnapshots.length - 1]
    setSnapshots(newSnapshots)
    setHistoryIndex(newSnapshots.length - 1)
    setBoard(restored.board)
    setTurn(restored.turn)
    setLastMove(restored.lastMove)
    setRecentlyFlipped(restored.recentlyFlipped)
    setIsAiThinking(false)
    setIsGameOver(false)
    setStatusMessage('')
    setShowToast(false)
  }, [snapshots, isAiThinking])

  // End game handler
  const checkGameOver = useCallback(
    (currentBoard) => {
      const whiteMoves = getValidMoves(currentBoard, 'W')
      const darkMoves = getValidMoves(currentBoard, 'B')

      if (whiteMoves.length === 0 && darkMoves.length === 0) {
        setIsGameOver(true)
        const finalCounts = countStones(currentBoard)
        const playerWon = finalCounts.white > finalCounts.dark
        recordGameSession('reversi', playerWon)

        let endMsg = `Balance achieved. White: ${finalCounts.white} - Dark: ${finalCounts.dark}`
        if (finalCounts.white > finalCounts.dark) {
          endMsg = `Territory resolved in quiet harmony. White: ${finalCounts.white} - Dark: ${finalCounts.dark}`
        } else if (finalCounts.dark > finalCounts.white) {
          endMsg = `Quiet Companion claims the board. Dark: ${finalCounts.dark} - White: ${finalCounts.white}`
        }
        setStatusMessage(endMsg)
        setTimeout(() => {
          playChime()
          triggerToast(endMsg, 4000)
        }, 400)
        return true
      }
      return false
    },
    [triggerToast]
  )

  const executeAiTurnRef = useRef(null)

  // AI turn execution
  const executeAiTurn = useCallback(
    (currentBoard) => {
      setIsAiThinking(true)

      aiTimerRef.current = setTimeout(() => {
        const aiMoves = getValidMoves(currentBoard, 'B')

        if (aiMoves.length === 0) {
          // AI passes
          setIsAiThinking(false)
          triggerToast('Quiet Companion passes turn.')
          setTurn('W')

          // Check if white has moves
          const whiteMoves = getValidMoves(currentBoard, 'W')
          if (whiteMoves.length === 0) {
            checkGameOver(currentBoard)
          }
          return
        }

        const bestMove = getBestAiMove(currentBoard, 'B', difficulty)
        if (bestMove) {
          const result = applyMove(currentBoard, bestMove.row, bestMove.col, 'B')
          if (result) {
            playTap()
            setBoard(result.nextBoard)
            const aiMovePos = { row: bestMove.row, col: bestMove.col }
            setLastMove(aiMovePos)
            setRecentlyFlipped(result.flippedCoords)
            setIsAiThinking(false)

            setSnapshots((prev) => {
              const next = [
                ...prev,
                {
                  board: result.nextBoard,
                  turn: 'W',
                  lastMove: aiMovePos,
                  recentlyFlipped: result.flippedCoords,
                },
              ]
              setHistoryIndex(next.length - 1)
              return next
            })

            // Check if game over or if white must pass
            if (!checkGameOver(result.nextBoard)) {
              const whiteMoves = getValidMoves(result.nextBoard, 'W')
              if (whiteMoves.length === 0) {
                triggerToast('White has no valid moves. Passing back to Companion.')
                // AI gets another turn
                executeAiTurnRef.current?.(result.nextBoard)
              } else {
                setTurn('W')
              }
            }
          }
        }
      }, 550)
    },
    [checkGameOver, difficulty, triggerToast]
  )

  useEffect(() => {
    executeAiTurnRef.current = executeAiTurn
  }, [executeAiTurn])

  // Clean up AI timer on unmount
  useEffect(() => {
    return () => {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current)
    }
  }, [])

  // Player Move Handler
  function handleCellClick(row, col) {
    if (turn !== 'W' || isAiThinking || isGameOver || isInspecting) return
    if (!validMoveMap.has(`${row},${col}`)) return

    const result = applyMove(board, row, col, 'W')
    if (!result) return

    playTap()
    setBoard(result.nextBoard)
    const playerMovePos = { row, col }
    setLastMove(playerMovePos)
    setRecentlyFlipped(result.flippedCoords)

    setSnapshots((prev) => {
      const next = [
        ...prev.slice(0, historyIndex + 1),
        {
          board: result.nextBoard,
          turn: 'B',
          lastMove: playerMovePos,
          recentlyFlipped: result.flippedCoords,
        },
      ]
      setHistoryIndex(next.length - 1)
      return next
    })

    // Check game over
    if (checkGameOver(result.nextBoard)) return

    // Pass turn to AI
    setTurn('B')
    executeAiTurn(result.nextBoard)
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

  return (
    <div className="rev-page game-screen-container">
      {/* ── Standard Game Header ─────────────────────────────── */}
      <GameHeader title="Reversi" onBack={handleBack} />

      {/* ── Standard Difficulty Tabs ─────────────────────────── */}
      <DifficultyTabs
        currentTier={difficulty}
        onSelectTier={(tier) => {
          setDifficulty(tier)
          handleRestart()
        }}
        tiers={[
          { id: 'gentle', label: 'Gentle' },
          { id: 'standard', label: 'Standard' },
          { id: 'deep', label: 'Deep' },
        ]}
      />

      {/* ── Score & Turn Header ──────────────────────────────── */}
      <div className="rev-status-card">
        <div className="rev-score-pills">
          <div className={`rev-pill rev-pill--white${turn === 'W' && !isGameOver ? ' rev-pill--active' : ''}`}>
            <span className="rev-pill-stone rev-pill-stone--white" />
            <span className="rev-pill-label">White</span>
            <span className="rev-pill-count">{displayScores.white}</span>
          </div>

          <div className={`rev-pill rev-pill--dark${turn === 'B' && !isGameOver ? ' rev-pill--active' : ''}`}>
            <span className="rev-pill-stone rev-pill-stone--dark" />
            <span className="rev-pill-label">Dark</span>
            <span className="rev-pill-count">{displayScores.dark}</span>
          </div>
        </div>

        <p className="rev-turn-tagline">
          {isInspecting
            ? `Inspecting (${historyIndex + 1}/${snapshots.length})`
            : isGameOver
            ? statusMessage
            : isAiThinking
            ? 'Quiet Companion is considering...'
            : turn === 'W'
            ? 'Your move (White)'
            : 'Quiet Companion’s turn'}
        </p>
      </div>

      {/* ── 8x8 Reversi Board Container ──────────────────────── */}
      <div className="rev-board-wrap">
        <div className="rev-board" role="grid" aria-label="Reversi 8x8 Board">
          {displayBoard.map((rowArr, r) => (
            <div key={`row-${r}`} className="rev-row" role="row">
              {rowArr.map((cell, c) => {
                const isValid = !isInspecting && validMoveMap.has(`${r},${c}`)
                const isLast = displayLastMove && displayLastMove.row === r && displayLastMove.col === c
                const isFlipped = displayRecentlyFlipped.some(([fr, fc]) => fr === r && fc === c)

                return (
                  <button
                    key={`cell-${r}-${c}`}
                    className={`rev-cell${isValid ? ' rev-cell--valid' : ''}`}
                    onClick={() => handleCellClick(r, c)}
                    disabled={!isValid || turn !== 'W' || isAiThinking || isGameOver || isInspecting}
                    aria-label={`Row ${r + 1}, Column ${c + 1}: ${
                      cell === 'W' ? 'White' : cell === 'B' ? 'Dark' : isValid ? 'Valid move' : 'Empty'
                    }`}
                  >
                    {cell && (
                      <div
                        className={`rev-stone rev-stone--${cell === 'W' ? 'white' : 'dark'}${
                          isLast ? ' rev-stone--last' : ''
                        }${isFlipped ? ' rev-stone--flip' : ''}`}
                      />
                    )}
                    {isValid && <div className="rev-dot" />}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer Actions & Contemplation Quote ─────────────── */}
      <GameFooterActions
        onReset={handleRestart}
        onUndo={handleUndo}
        canUndo={snapshots.length > 1 && !isAiThinking && !isInspecting}
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

      <div className="rev-footer">
        <span className="rev-footer-quote">
          {isGameOver
            ? 'Territory resolved in quiet harmony.'
            : 'To place is to transform.'}
        </span>
      </div>

      {/* ── Completion / Notification Toast ─────────────────── */}
      <div
        className={`rev-toast${showToast ? ' rev-toast--visible' : ''}`}
        role="status"
        aria-live="polite"
      >
        {toastMessage}
      </div>

      {/* ── Game Over Modal ─────────────────────────────────── */}
      <GameCompletionModal
        isOpen={isGameOver}
        title={
          scores.white > scores.dark
            ? 'HARMONY ACHIEVED'
            : scores.white === scores.dark
            ? 'PERFECT BALANCE'
            : 'TERRITORY RESOLVED'
        }
        subtitle={
          scores.white > scores.dark
            ? 'White stones have claimed tranquil dominion over the board.'
            : scores.white === scores.dark
            ? 'Equal stones rest across the board in timeless poise.'
            : 'Quiet Companion has claimed the board. Return to quiet contemplation.'
        }
        stats={[
          { label: 'White Stones', value: scores.white },
          { label: 'Dark Stones', value: scores.dark },
          { label: 'Difficulty', value: difficulty.toUpperCase() },
        ]}
        primaryAction={{
          label: 'Play Again',
          onClick: handleRestart,
        }}
        reviewLabel="Review Board"
      />
    </div>
  )
}

export default ReversiScreen

