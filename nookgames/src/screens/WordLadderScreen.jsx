import { useState, useEffect, useCallback, useRef } from 'react'
import { Icon } from '../components/Icons'
import { BackButton } from '../components/BackButton.jsx'
import { GameCompletionModal } from '../components/GameCompletionModal.jsx'
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

function findLadderPath(fromWord, targetWord) {
  const queue = [[fromWord]]
  const visited = new Set([fromWord])

  while (queue.length > 0) {
    const path = queue.shift()
    const current = path[path.length - 1]
    if (current === targetWord) return path

    for (let i = 0; i < current.length; i++) {
      for (let c = 65; c <= 90; c++) {
        const char = String.fromCharCode(c)
        if (char === current[i]) continue
        const candidate = current.slice(0, i) + char + current.slice(i + 1)
        if ((isValidWord(candidate) || candidate === targetWord) && !visited.has(candidate)) {
          visited.add(candidate)
          queue.push([...path, candidate])
        }
      }
    }
  }
  return null
}

export function WordLadderScreen() {
  const [puzzleIndex, setPuzzleIndex] = useState(() => Math.floor(Math.random() * WORD_LADDER_PUZZLES.length))
  const puzzle = WORD_LADDER_PUZZLES[puzzleIndex]

  // Ladder history array: starts with puzzle.start
  const [ladder, setLadder] = useState(() => [puzzle.start])
  const [historyIndex, setHistoryIndex] = useState(0)
  // Current buffer being typed
  const [currentInput, setCurrentInput] = useState('')
  // Error message for soft feedback
  const [errorMessage, setErrorMessage] = useState('')
  // Shake trigger animation
  const [isShaking, setIsShaking] = useState(false)
  // Completion status
  const [isSolved, setIsSolved] = useState(false)

  const isInspecting = historyIndex < ladder.length - 1
  const displayedLadder = ladder.slice(0, historyIndex + 1)

  const ladderEndRef = useRef(null)
  const middleScrollRef = useRef(null)

  // Reset when puzzle changes
  useEffect(() => {
    setLadder([puzzle.start])
    setHistoryIndex(0)
    setCurrentInput('')
    setErrorMessage('')
    setIsShaking(false)
    setIsSolved(false)
  }, [puzzle])

  // Auto-scroll ladder middle container to bottom when steps or input change
  useEffect(() => {
    if (ladderEndRef.current) {
      ladderEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [displayedLadder, currentInput, errorMessage])

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
    setHistoryIndex(0)
    setCurrentInput('')
    setErrorMessage('')
    setIsShaking(false)
    setIsSolved(false)
  }

  const pickRandomPuzzle = useCallback(() => {
    playTap()
    setPuzzleIndex((prev) => {
      if (WORD_LADDER_PUZZLES.length <= 1) return 0
      let next = prev
      while (next === prev) {
        next = Math.floor(Math.random() * WORD_LADDER_PUZZLES.length)
      }
      return next
    })
  }, [])

  const handleHint = () => {
    if (isSolved || isInspecting) return
    const current = ladder[ladder.length - 1]
    let path = findLadderPath(current, puzzle.target)
    if (!path || path.length < 2) {
      path = findLadderPath(puzzle.start, puzzle.target)
    }
    if (path && path.length >= 2) {
      playTap()
      const nextWord = path[1]
      const nextLadder = [...ladder, nextWord]
      setLadder(nextLadder)
      setHistoryIndex(nextLadder.length - 1)
      setCurrentInput('')
      setErrorMessage('')
      if (nextWord === puzzle.target) {
        setIsSolved(true)
        playChime()
      }
    } else {
      triggerError('No valid path from here — undo a step')
    }
  }

  const handleReveal = () => {
    if (isSolved || isInspecting) return
    playTap()
    const current = ladder[ladder.length - 1]
    let path = findLadderPath(current, puzzle.target)
    if (!path || path.length < 2) {
      path = findLadderPath(puzzle.start, puzzle.target)
    }
    if (path) {
      const completeLadder = [...ladder, ...path.slice(1)]
      setLadder(completeLadder)
      setHistoryIndex(completeLadder.length - 1)
      setCurrentInput('')
      setErrorMessage('')
      setIsSolved(true)
      playChime()
    }
  }

  // Handle undo last step
  function handleUndo() {
    if (ladder.length <= 1 || isSolved) return
    playTap()
    setLadder((prev) => {
      const next = prev.slice(0, -1)
      setHistoryIndex(next.length - 1)
      return next
    })
    setCurrentInput('')
    setErrorMessage('')
  }

  // Revert back to a specific previous step
  function handleRevertToStep(index) {
    if (index >= ladder.length - 1 || isSolved) return
    playTap()
    setHistoryIndex(index)
    setLadder((prev) => prev.slice(0, index + 1))
    setCurrentInput('')
    setErrorMessage('')
  }

  // Handle letter typing
  const handleKeyPress = useCallback(
    (key) => {
      if (isSolved || isInspecting) return

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
        setHistoryIndex(nextLadder.length - 1)
        setCurrentInput('')
        setErrorMessage('')

        // Check if target reached
        if (candidate === puzzle.target) {
          setIsSolved(true)
          playChime()
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
    [currentInput, isSolved, isInspecting, ladder, puzzle.length, puzzle.target, triggerError]
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
          <BackButton
            id="wl-back-btn"
            className="wl-back-btn"
            onClick={handleBack}
            ariaLabel="Back to Briefing"
            title="Back to Briefing"
          />

          <div className="wl-header-center">
            <h1 className="wl-title">Word Ladder</h1>
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
          {displayedLadder.map((word, idx) => {
            const prevWord = idx > 0 ? displayedLadder[idx - 1] : null
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

          {/* Current Input Row (if not solved and not inspecting past) */}
          {!isSolved && !isInspecting && (
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

      {/* ── Bottom Section (Fixed Keypad & Actions) ─────────────── */}
      <div className="wl-bottom-section">
        <div className="wl-dock-controls-bar">
          <button
            id="wl-restart-btn"
            type="button"
            className="wl-bar-btn"
            onClick={handleRestart}
            aria-label="Restart ladder"
            title="Restart"
          >
            <Icon name="restart" size={15} />
            <span>Restart</span>
          </button>

          {ladder.length > 1 && (
            <div className="wl-bar-stepper">
              <button
                type="button"
                className="wl-bar-stepper-btn"
                onClick={() => setHistoryIndex((prev) => Math.max(0, prev - 1))}
                disabled={historyIndex <= 0}
                aria-label="Previous step"
              >
                ‹
              </button>
              <button
                type="button"
                className="wl-bar-stepper-btn"
                onClick={() => setHistoryIndex((prev) => Math.min(ladder.length - 1, prev + 1))}
                disabled={historyIndex >= ladder.length - 1}
                aria-label="Next step"
              >
                ›
              </button>
            </div>
          )}

          <button
            id="wl-undo-btn"
            type="button"
            className="wl-bar-btn"
            onClick={handleUndo}
            disabled={ladder.length <= 1 || isSolved || isInspecting}
            aria-label="Undo step"
            title="Undo"
          >
            <Icon name="undo" size={15} />
            <span>Undo</span>
          </button>

          <button
            id="wl-hint-btn"
            type="button"
            className="wl-bar-btn"
            onClick={handleHint}
            disabled={isSolved || isInspecting}
            aria-label="Get hint"
            title="Hint"
          >
            <Icon name="hint" size={15} />
            <span>Hint</span>
          </button>

          <button
            id="wl-shuffle-btn"
            type="button"
            className="wl-bar-btn"
            onClick={pickRandomPuzzle}
            aria-label="Next random puzzle"
            title="Shuffle"
          >
            <Icon name="shuffle" size={15} />
            <span>Shuffle</span>
          </button>
        </div>

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
                    disabled={isSolved || isInspecting}
                  >
                    {key === 'BACKSPACE' ? '⌫' : key === 'ENTER' ? 'SUBMIT' : key}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ── Universal Completion Modal ──────────────────────── */}
      <GameCompletionModal
        isOpen={isSolved}
        title="Ladder Complete"
        description={`Meaning connected from "${puzzle.start}" to "${puzzle.target}" in ${ladder.length - 1} steps.`}
        stats={[{ label: 'Total Steps', value: ladder.length - 1 }]}
        onNext={pickRandomPuzzle}
        nextLabel="Next Ladder"
        onReplay={handleRestart}
        replayLabel="Replay"
        reviewLabel="Review Words"
      />
    </div>
  )
}

export default WordLadderScreen
