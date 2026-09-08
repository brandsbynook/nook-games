import { useState, useEffect, useRef, useCallback } from 'react'
import { Icon } from '../icons.jsx'
import {
  createGame,
  getValidMoves,
  makeMove,
  getBotMove,
  UNICODE_PIECES,
} from '../utils/chessLogic.js'
import { playTap, playChime } from '../utils/audio.js'

export function ChessScreen({ onBack }) {
  // Game instance held in ref to avoid re-instantiation across renders
  const gameRef = useRef(null)
  if (!gameRef.current) {
    gameRef.current = createGame()
  }
  const game = gameRef.current

  const [fen, setFen] = useState(() => game.fen())
  const [difficulty, setDifficulty] = useState('standard')
  const [selectedSquare, setSelectedSquare] = useState(null)
  const [validMoves, setValidMoves] = useState([])
  const [isBotThinking, setIsBotThinking] = useState(false)
  const [lastMove, setLastMove] = useState(null)
  const [gameStatus, setGameStatus] = useState({
    inCheck: false,
    isCheckmate: false,
    isDraw: false,
    winner: null,
  })
  const [historyCount, setHistoryCount] = useState(0)
  const botTimerRef = useRef(null)

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (botTimerRef.current) clearTimeout(botTimerRef.current)
    }
  }, [])

  // Sync game status
  const updateGameStatus = useCallback(() => {
    const inCheck = game.inCheck()
    const isCheckmate = game.isCheckmate()
    const isDraw = game.isDraw()
    let winner = null

    if (isCheckmate) {
      // If white to move in checkmate, black (bot) won. If black to move, white (user) won.
      winner = game.turn() === 'w' ? 'b' : 'w'
      if (winner === 'w') {
        setTimeout(() => playChime(), 200)
      }
    }

    setGameStatus({
      inCheck,
      isCheckmate,
      isDraw,
      winner,
    })
    setHistoryCount(game.history().length)
  }, [game])

  // Back button handler
  const handleBack = () => {
    playTap()
    if (botTimerRef.current) clearTimeout(botTimerRef.current)
    if (onBack) {
      onBack()
    } else {
      window.location.hash = '#/briefing/chess'
    }
  }

  // Restart / Reset game
  const handleReset = () => {
    playTap()
    if (botTimerRef.current) clearTimeout(botTimerRef.current)
    gameRef.current = createGame()
    setFen(gameRef.current.fen())
    setSelectedSquare(null)
    setValidMoves([])
    setIsBotThinking(false)
    setLastMove(null)
    setGameStatus({
      inCheck: false,
      isCheckmate: false,
      isDraw: false,
      winner: null,
    })
    setHistoryCount(0)
  }

  // Changing difficulty resets the board cleanly
  const handleDifficultyChange = (newDiff) => {
    if (difficulty === newDiff) return
    playTap()
    setDifficulty(newDiff)
    if (botTimerRef.current) clearTimeout(botTimerRef.current)
    gameRef.current = createGame()
    setFen(gameRef.current.fen())
    setSelectedSquare(null)
    setValidMoves([])
    setIsBotThinking(false)
    setLastMove(null)
    setGameStatus({
      inCheck: false,
      isCheckmate: false,
      isDraw: false,
      winner: null,
    })
    setHistoryCount(0)
  }

  // Trigger bot's turn
  const triggerBotMove = useCallback(() => {
    setIsBotThinking(true)
    botTimerRef.current = setTimeout(() => {
      if (game.isGameOver()) {
        setIsBotThinking(false)
        updateGameStatus()
        return
      }

      const move = getBotMove(game, difficulty)
      if (move) {
        const result = makeMove(game, move)
        playTap()
        setFen(game.fen())
        setLastMove({ from: move.from, to: move.to })
        updateGameStatus()
      }
      setIsBotThinking(false)
    }, 400)
  }, [game, difficulty, updateGameStatus])

  // Handle square click
  const handleSquareClick = (square) => {
    if (isBotThinking || gameStatus.isCheckmate || gameStatus.isDraw) return

    const piece = game.get(square)
    const isCurrentTurnPiece = piece && piece.color === 'w'

    // If clicking on one of player's pieces
    if (isCurrentTurnPiece) {
      if (selectedSquare === square) {
        // Deselect
        setSelectedSquare(null)
        setValidMoves([])
      } else {
        // Select this piece and compute targets
        setSelectedSquare(square)
        setValidMoves(getValidMoves(game, square))
      }
      return
    }

    // If a piece is already selected and target square is a valid move
    if (selectedSquare && validMoves.includes(square)) {
      const move = {
        from: selectedSquare,
        to: square,
        promotion: 'q',
      }
      const result = makeMove(game, move)
      if (result.success) {
        playTap()
        setFen(game.fen())
        setLastMove({ from: selectedSquare, to: square })
        setSelectedSquare(null)
        setValidMoves([])
        updateGameStatus()

        // If game is not over, bot moves
        if (!result.isGameOver) {
          triggerBotMove()
        }
      }
      return
    }

    // Clicking elsewhere deselects
    if (selectedSquare) {
      setSelectedSquare(null)
      setValidMoves([])
    }
  }

  // Undo button handler: rolls back bot's move and user's move
  const handleUndo = () => {
    if (isBotThinking || historyCount === 0) return
    playTap()
    if (botTimerRef.current) clearTimeout(botTimerRef.current)

    // If it's user's turn (white) and at least 2 moves have been made, undo both bot and user
    if (game.turn() === 'w' && historyCount >= 2) {
      game.undo() // undo black (bot)
      game.undo() // undo white (user)
    } else {
      game.undo()
    }

    setFen(game.fen())
    setSelectedSquare(null)
    setValidMoves([])
    setIsBotThinking(false)

    // Restore previous move on Undo
    const history = game.history({ verbose: true })
    if (history.length > 0) {
      const last = history[history.length - 1]
      setLastMove({ from: last.from, to: last.to })
    } else {
      setLastMove(null)
    }

    updateGameStatus()
  }

  // Board layout 8x8: rank 8 down to 1 (r: 0..7), file a through h (c: 0..7)
  const rows = [0, 1, 2, 3, 4, 5, 6, 7]
  const cols = [0, 1, 2, 3, 4, 5, 6, 7]

  // Determine turn text
  let statusNotice = ''
  if (gameStatus.isCheckmate) {
    statusNotice = gameStatus.winner === 'w' ? 'Checkmate — Victory' : 'Checkmate — Defeat'
  } else if (gameStatus.isDraw) {
    statusNotice = 'Stalemate — Draw'
  } else if (gameStatus.inCheck) {
    statusNotice = game.turn() === 'w' ? 'Check — Your King is under attack' : 'Check!'
  }

  return (
    <div className="chess-page">
      {/* ── Top Bar ─────────────────────────────────────────── */}
      <header className="chess-top-bar">
        <button
          id="chess-back-btn"
          className="chess-icon-btn"
          onClick={handleBack}
          aria-label="Back to Briefing"
        >
          <Icon name="back" size={20} />
        </button>

        <h1 className="chess-title">CHESS</h1>

        <button
          id="chess-reset-btn"
          className="chess-icon-btn"
          onClick={handleReset}
          aria-label="Reset Game"
          title="Reset Game"
        >
          <Icon name="restart" size={18} />
        </button>
      </header>

      {/* ── Difficulty Selector ─────────────────────────────── */}
      <div className="chess-difficulty-bar" role="group" aria-label="Difficulty Level">
        {['casual', 'standard', 'master'].map((level) => (
          <button
            key={level}
            id={`chess-diff-${level}`}
            className={`chess-diff-btn ${difficulty === level ? 'chess-diff-btn--active' : ''}`}
            onClick={() => handleDifficultyChange(level)}
            aria-pressed={difficulty === level}
          >
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Status Bar ──────────────────────────────────────── */}
      <div className="chess-status-bar">
        <div
          className={`chess-turn-pill ${
            isBotThinking ? 'chess-turn-pill--thinking' : 'chess-turn-pill--player'
          }`}
        >
          <span className="chess-turn-dot" />
          <span className="chess-turn-text">
            {gameStatus.isCheckmate
              ? 'Game Over'
              : gameStatus.isDraw
              ? 'Draw'
              : isBotThinking
              ? 'Contemplating...'
              : 'Your Move'}
          </span>
        </div>

        {statusNotice && (
          <div
            className={`chess-notice ${
              gameStatus.isCheckmate
                ? gameStatus.winner === 'w'
                  ? 'chess-notice--victory'
                  : 'chess-notice--defeat'
                : 'chess-notice--check'
            }`}
          >
            {statusNotice}
          </div>
        )}
      </div>

      {/* ── 8x8 Chess Board ──────────────────────────────────── */}
      <div className="chess-board-wrap">
        <div
          className="chess-board"
          role="grid"
          aria-label="Chess 8x8 Board"
        >
          {rows.map((r) =>
            cols.map((c) => {
              const file = String.fromCharCode(97 + c)
              const rank = 8 - r
              const square = `${file}${rank}`
              const isLight = (r + c) % 2 === 0
              const isDark = !isLight
              const piece = game.get(square)
              const isSelected = selectedSquare === square
              const isTarget = validMoves.includes(square)
              const isCapture = isTarget && piece && piece.color !== 'w'
              const isLastMoveSquare =
                lastMove && (lastMove.from === square || lastMove.to === square)
              const isCheckedKing =
                gameStatus.inCheck &&
                piece &&
                piece.type === 'k' &&
                piece.color === game.turn()

              return (
                <button
                  key={square}
                  id={`chess-sq-${square}`}
                  className={`chess-square ${
                    isLight ? 'chess-square--light' : 'chess-square--dark'
                  } ${isSelected ? 'chess-square--selected' : ''} ${
                    isLastMoveSquare ? 'chess-square--last' : ''
                  } ${isCheckedKing ? 'chess-square--check' : ''}`}
                  onClick={() => handleSquareClick(square)}
                  aria-label={`${square}: ${
                    piece ? `${piece.color === 'w' ? 'White' : 'Black'} ${piece.type}` : 'Empty'
                  }`}
                >
                  {/* Subtle coordinate labels */}
                  {c === 0 && <span className="chess-coord chess-coord--rank">{rank}</span>}
                  {r === 7 && <span className="chess-coord chess-coord--file">{file}</span>}

                  {/* Piece glyph */}
                  {piece && (
                    <span
                      className={`chess-piece chess-piece--${piece.color} ${
                        isSelected ? 'chess-piece--selected' : ''
                      }`}
                    >
                      {UNICODE_PIECES[piece.color][piece.type]}
                    </span>
                  )}

                  {/* Move Hint: Subtle circle dot on empty reachable squares */}
                  {isTarget && !isCapture && <span className="chess-hint-dot" />}

                  {/* Move Hint: Distinct ring around squares with enemy pieces */}
                  {isCapture && <span className="chess-hint-ring" />}
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* ── Controls: Undo Button ────────────────────────────── */}
      <div className="chess-controls">
        <button
          id="chess-undo-btn"
          className="chess-undo-btn"
          onClick={handleUndo}
          disabled={isBotThinking || historyCount === 0}
          aria-label="Undo Move"
        >
          <Icon name="back" size={14} />
          <span>Undo Move</span>
        </button>
      </div>

      {/* ── Footer / Sanctuary Tagline ───────────────────────── */}
      <footer className="chess-footer">
        <p className="chess-quote">
          {gameStatus.isCheckmate
            ? gameStatus.winner === 'w'
              ? 'The system yields. Stillness restored.'
              : 'The system prevails. Return to quiet contemplation.'
            : 'The board remembers every intention.'}
        </p>
      </footer>
    </div>
  )
}
