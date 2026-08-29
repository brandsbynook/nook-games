import { useState, useEffect, useCallback, useRef } from 'react'
import { Icon } from '../icons.jsx'
import {
  WORD_LADDER_PUZZLES,
  isValidWord,
  countLetterDifferences,
  getDiffIndex,
} from '../data/wordLadderPuzzles.js'
import { playTap, playChime } from '../utils/audio.js'

const QWERTY_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
]

export function WordLadderScreen() {
  const [puzzleIndex, setPuzzleIndex] = useState(0)
  const puzzle = WORD_LADDER_PUZZLES[puzzleIndex]

  // Ladder history array: starts with puzzle.start
  const [ladder, setLadder] = useState(() => [puzzle.start])
  // Current buffer being typed
  const [currentInput, setCurrentInput] = useState('')
  // Error message for soft feedback
  const [errorMessage, setErrorMessage] = useState('')
  // Shake trigger animation
  const [isShaking, setIsShaking] = useState(false)
  // Completion status
  const [isSolved, setIsSolved] = useState(false)
  // Toast notification
  const [showToast, setShowToast] = useState(false)

  const ladderEndRef = useRef(null)
  const middleScrollRef = useRef(null)

  // Reset when puzzle changes
  useEffect(() => {
    setLadder([puzzle.start])
    setCurrentInput('')
    setErrorMessage('')
    setIsShaking(false)
    setIsSolved(false)
    setShowToast(false)
  }, [puzzle])

  // Auto-scroll ladder middle container to bottom when steps or input change
  useEffect(() => {
    if (ladderEndRef.current) {
      ladderEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [ladder, currentInput, errorMessage])

  // Trigger soft error shake
  const triggerError = useCallback((msg) => {
    setErrorMessage(msg)
    setIsShaking(true)
    setTimeout(() => setIsShaking(false), 500)
  }, [])

  // Handle back to Briefing
  function handleBack(e) {
    e.preventDefault()
    playTap()
    window.location.hash = '/briefing/word-ladder'
  }

  // Handle restart
  function handleRestart() {
    playTap()
    setLadder([puzzle.start])
    setCurrentInput('')
    setErrorMessage('')
    setIsShaking(false)
    setIsSolved(false)
    setShowToast(false)
  }

  // Handle undo last step
  function handleUndo() {
    if (ladder.length <= 1 || isSolved) return
    playTap()
    setLadder((prev) => prev.slice(0, -1))
    setCurrentInput('')
    setErrorMessage('')
  }

  // Revert back to a specific previous step
  function handleRevertToStep(index) {
    if (index >= ladder.length - 1 || isSolved) return
    playTap()
    setLadder((prev) => prev.slice(0, index + 1))
    setCurrentInput('')
    setErrorMessage('')
  }

  // Handle letter typing
  const handleKeyPress = useCallback(
    (key) => {
      if (isSolved) return

      const upperKey = key.toUpperCase()

      if (upperKey === 'BACKSPACE') {
        if (currentInput.length > 0) {
          playTap()
          setCurrentInput((prev) => prev.slice(0, -1))
          setErrorMessage('')
        }
        return
      }

      if (upperKey === 'ENTER') {
        if (currentInput.length !== puzzle.length) {
          triggerError(`Enter a ${puzzle.length}-letter word`)
          return
        }

        const candidate = currentInput.toUpperCase()
        const lastWord = ladder[ladder.length - 1]

        // Check if word is already in the ladder
        if (ladder.includes(candidate)) {
          triggerError('Word already in ladder')
          return
        }

        // Check exactly 1 letter difference
        const diff = countLetterDifferences(candidate, lastWord)
        if (diff === 0) {
          triggerError('Word is unchanged')
          return
        }
        if (diff > 1) {
          triggerError('Change only 1 letter')
          return
        }

        // Check valid dictionary word
        if (!isValidWord(candidate) && candidate !== puzzle.target) {
          triggerError('Not in word list')
          return
        }

        // Valid word submission
        playTap()
        const nextLadder = [...ladder, candidate]
        setLadder(nextLadder)
        setCurrentInput('')
        setErrorMessage('')

        // Check if target reached
        if (candidate === puzzle.target) {
          setIsSolved(true)
          setTimeout(() => {
            playChime()
            setShowToast(true)
          }, 300)
        }
        return
      }

      // Alphabetical key
      if (/^[A-Z]$/.test(upperKey)) {
        if (currentInput.length < puzzle.length) {
          playTap()
          setCurrentInput((prev) => prev + upperKey)
          setErrorMessage('')
        }
      }
    },
    [currentInput, isSolved, ladder, puzzle.length, puzzle.target, triggerError]
  )

  // Physical keyboard listener
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Backspace') {
        handleKeyPress('BACKSPACE')
      } else if (e.key === 'Enter') {
        handleKeyPress('ENTER')
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleKeyPress(e.key)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyPress])

  return (
    <div className="wl-page">
      {/* ── Top Section (Fixed) ──────────────────────────────── */}
      <div className="wl-top-section">
        {/* Header Bar */}
        <div className="wl-header">
          <button
            id="wl-back-btn"
            className="wl-back-btn"
            onClick={handleBack}
            aria-label="Back to Briefing"
          >
            <Icon name="back" size={20} />
          </button>

          <div className="wl-header-center">
            <span className="wl-header-title">Word Ladder</span>
            <div className="wl-presets-bar">
              {WORD_LADDER_PUZZLES.map((p, idx) => (
                <button
                  key={p.id}
                  className={`wl-preset-btn${idx === puzzleIndex ? ' wl-preset-btn--active' : ''}`}
                  onClick={() => {
                    playTap()
                    setPuzzleIndex(idx)
                  }}
                >
                  {p.start} → {p.target}
                </button>
              ))}
            </div>
          </div>

          <div className="wl-header-actions">
            <button
              id="wl-restart-btn"
              className="wl-action-btn"
              onClick={handleRestart}
              aria-label="Restart puzzle"
              title="Restart"
            >
              <Icon name="restart" size={18} />
            </button>
          </div>
        </div>

        {/* Target Word Goal Banner */}
        <div className="wl-target-card">
          <span className="wl-target-label">TARGET WORD</span>
          <span className="wl-target-word">{puzzle.target}</span>
        </div>
      </div>

      {/* ── Middle Section (Scrollable History & Next Input) ── */}
      <div className="wl-middle-section" ref={middleScrollRef}>
        <div className="wl-ladder">
          {ladder.map((word, idx) => {
            const prevWord = idx > 0 ? ladder[idx - 1] : null
            const diffIdx = prevWord ? getDiffIndex(word, prevWord) : -1
            const isTarget = word === puzzle.target
            const isStart = idx === 0

            return (
              <div
                key={`step-${idx}-${word}`}
                className={`wl-ladder-step${isStart ? ' wl-ladder-step--start' : ''}${
                  isTarget ? ' wl-ladder-step--target' : ''
                }`}
                onClick={() => handleRevertToStep(idx)}
                title={idx < ladder.length - 1 ? 'Tap to revert to this step' : ''}
              >
                <span className="wl-step-num">{idx === 0 ? 'START' : `STEP ${idx}`}</span>
                <div className="wl-word-letters">
                  {word.split('').map((char, charIdx) => {
                    const isChanged = charIdx === diffIdx
                    return (
                      <span
                        key={`char-${charIdx}`}
                        className={`wl-letter-box${
                          isChanged ? ' wl-letter-box--changed' : ''
                        }${isTarget ? ' wl-letter-box--target' : ''}`}
                      >
                        {char}
                      </span>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* Current Input Row (if not solved) */}
          {!isSolved && (
            <div
              className={`wl-ladder-step wl-ladder-step--active${
                isShaking ? ' wl-ladder-step--shake' : ''
              }`}
            >
              <span className="wl-step-num">NEXT</span>
              <div className="wl-word-letters">
                {Array.from({ length: puzzle.length }).map((_, charIdx) => {
                  const char = currentInput[charIdx] || ''
                  const isCursor = currentInput.length === charIdx
                  return (
                    <span
                      key={`input-slot-${charIdx}`}
                      className={`wl-letter-box wl-letter-box--input${
                        char ? ' wl-letter-box--filled' : ''
                      }${isCursor ? ' wl-letter-box--cursor' : ''}`}
                    >
                      {char}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {/* Bottom scroll anchor */}
          <div ref={ladderEndRef} />
        </div>

        {/* Error Feedback Banner */}
        {errorMessage && (
          <div className="wl-error-banner" role="alert">
            {errorMessage}
          </div>
        )}
      </div>

      {/* ── Bottom Section (Fixed Keypad & Undo) ─────────────── */}
      <div className="wl-bottom-section">
        {/* Undo Action Bar */}
        {ladder.length > 1 && !isSolved && (
          <div className="wl-undo-bar">
            <button className="wl-undo-btn" onClick={handleUndo}>
              Undo Step ({ladder.length - 1})
            </button>
          </div>
        )}

        {/* On-Screen Keyboard */}
        <div className="wl-keyboard" role="group" aria-label="Keyboard">
          {QWERTY_ROWS.map((row, rowIdx) => (
            <div key={`row-${rowIdx}`} className="wl-kb-row">
              {row.map((key) => {
                const isSpecial = key === 'ENTER' || key === 'BACKSPACE'
                return (
                  <button
                    key={`key-${key}`}
                    className={`wl-kb-key${isSpecial ? ' wl-kb-key--special' : ''}`}
                    onClick={() => handleKeyPress(key)}
                    aria-label={key === 'BACKSPACE' ? 'Backspace' : key}
                  >
                    {key === 'BACKSPACE' ? '⌫' : key === 'ENTER' ? 'SUBMIT' : key}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ── Completion Toast ─────────────────────────────────── */}
      <div
        className={`wl-toast${showToast ? ' wl-toast--visible' : ''}`}
        role="status"
        aria-live="polite"
      >
        Meaning connected across words.
      </div>
    </div>
  )
}
