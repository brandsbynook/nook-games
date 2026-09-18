import { useState, useEffect, useCallback, useRef } from 'react'
import { GameHeader } from '../components/GameHeader.jsx'
import { DifficultyTabs } from '../components/DifficultyTabs.jsx'
import { GameFooterActions } from '../components/GameFooterActions.jsx'
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
  const [history, setHistory] = useState([])
  const [statusMessage, setStatusMessage] = useState('')
  const [isGameOver, setIsGameOver] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [showToast, setShowToast] = useState(false)

  const aiTimerRef = useRef(null)

  const scores = countStones(board)
  const validMoves = turn === 'W' && !isGameOver && !isAiThinking ? getValidMoves(board, 'W') : []
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
    setBoard(createInitialBoard())
    setTurn('W')
    setIsAiThinking(false)
    setLastMove(null)
    setRecentlyFlipped([])
    setHistory([])
    setStatusMessage('')
    setIsGameOver(false)
    setShowToast(false)
  }, [])

  // Handle Undo
  const handleUndo = useCallback(() => {
    if (history.length === 0 || isAiThinking) return
    playTap()
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current)

    const lastState = history[history.length - 1]
    setHistory((prev) => prev.slice(0, -1))
    setBoard(lastState.board)
    setTurn(lastState.turn)
    setLastMove(lastState.lastMove)
    setRecentlyFlipped(lastState.recentlyFlipped)
    setIsAiThinking(false)
    setIsGameOver(false)
    setStatusMessage('')
    setShowToast(false)
  }, [history, isAiThinking])

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

        let endMsg = `Balance achieved. White: ${finalCounts.white} — Dark: ${finalCounts.dark}`
        if (finalCounts.white > finalCounts.dark) {
          endMsg = `Territory resolved in quiet harmony. White: ${finalCounts.white} — Dark: ${finalCounts.dark}`
        } else if (finalCounts.dark > finalCounts.white) {
          endMsg = `Quiet Companion claims the board. Dark: ${finalCounts.dark} — White: ${finalCounts.white}`
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
            setLastMove({ row: bestMove.row, col: bestMove.col })
            setRecentlyFlipped(result.flippedCoords)
            setIsAiThinking(false)

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
    if (turn !== 'W' || isAiThinking || isGameOver) return
    if (!validMoveMap.has(`${row},${col}`)) return

    // Save snapshot before player's move for undo
    setHistory((prev) => [
      ...prev.slice(-30),
      {
        board: cloneBoard(board),
        turn: 'W',
        lastMove,
        recentlyFlipped,
      },
    ])

    const result = applyMove(board, row, col, 'W')
    if (!result) return

    playTap()
    setBoard(result.nextBoard)
    setLastMove({ row, col })
    setRecentlyFlipped(result.flippedCoords)

    // Check game over
    if (checkGameOver(result.nextBoard)) return

    // Pass turn to AI
    setTurn('B')
    executeAiTurn(result.nextBoard)
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
            <span className="rev-pill-count">{scores.white}</span>
          </div>

          <div className={`rev-pill rev-pill--dark${turn === 'B' && !isGameOver ? ' rev-pill--active' : ''}`}>
            <span className="rev-pill-stone rev-pill-stone--dark" />
            <span className="rev-pill-label">Dark</span>
            <span className="rev-pill-count">{scores.dark}</span>
          </div>
        </div>

        <p className="rev-turn-tagline">
          {isGameOver
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
          {board.map((rowArr, r) => (
            <div key={`row-${r}`} className="rev-row" role="row">
              {rowArr.map((cell, c) => {
                const isValid = validMoveMap.has(`${r},${c}`)
                const isLast = lastMove && lastMove.row === r && lastMove.col === c
                const isFlipped = recentlyFlipped.some(([fr, fc]) => fr === r && fc === c)

                return (
                  <button
                    key={`cell-${r}-${c}`}
                    className={`rev-cell${isValid ? ' rev-cell--valid' : ''}`}
                    onClick={() => handleCellClick(r, c)}
                    disabled={!isValid || turn !== 'W' || isAiThinking || isGameOver}
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
        canUndo={history.length > 0 && !isAiThinking}
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
    </div>
  )
}

export default ReversiScreen
