import { useState, useCallback, useEffect, useRef } from 'react'
import { Icon } from '../icons.jsx'
import {
  DIFFICULTY_TIERS,
  ANAGRAM_PUZZLES,
  generatePuzzle,
  validateGuess,
  shuffleLetters,
} from '../utils/anagramsLogic.js'
import { playTap, playChime } from '../utils/audio.js'

export function AnagramsScreen({ onBack } = {}) {
  const initialIndex = useRef(
    Math.floor(Math.random() * (ANAGRAM_PUZZLES?.beginner?.length || 1))
  )
  const [tier, setTier] = useState('beginner') // 'beginner' | 'intermediate' | 'master'
  const [puzzleIndex, setPuzzleIndex] = useState(initialIndex.current)

  // Current puzzle data
  const [puzzle, setPuzzle] = useState(() => generatePuzzle('beginner', initialIndex.current))
  // Dock letter arrangement (array of { id: string, char: string })
  const [dockLetters, setDockLetters] = useState(() =>
    generatePuzzle('beginner', initialIndex.current).scrambledLetters.map((char, idx) => ({
      id: `${char}-${idx}`,
      char,
    }))
  )
  // Selected letter token IDs in input order
  const [selectedLetterIds, setSelectedLetterIds] = useState([])
  // Words discovered by player
  const [foundWords, setFoundWords] = useState([])
  // Notification / toast feedback
  const [feedback, setFeedback] = useState(null)
  const [isShaking, setIsShaking] = useState(false)
  const feedbackTimerRef = useRef(null)

  // Load new puzzle or switch tier
  const initPuzzle = useCallback((newTier, newIndex) => {
    const p = generatePuzzle(newTier, newIndex)
    setPuzzle(p)
    setDockLetters(
      p.scrambledLetters.map((char, idx) => ({
        id: `${char}-${idx}`,
        char,
      }))
    )
    setSelectedLetterIds([])
    setFoundWords([])
    setFeedback(null)
  }, [])

  const handleTierChange = (newTier) => {
    if (newTier === tier) return
    playTap()
    setTier(newTier)
    const count = ANAGRAM_PUZZLES[newTier]?.length || 1
    const randIdx = Math.floor(Math.random() * count)
    setPuzzleIndex(randIdx)
    initPuzzle(newTier, randIdx)
  }

  const handlePrevPuzzle = () => {
    playTap()
    const nextIdx = (puzzleIndex - 1 + puzzle.totalInTier) % puzzle.totalInTier
    setPuzzleIndex(nextIdx)
    initPuzzle(tier, nextIdx)
  }

  const handleNextPuzzle = () => {
    playTap()
    const nextIdx = (puzzleIndex + 1) % puzzle.totalInTier
    setPuzzleIndex(nextIdx)
    initPuzzle(tier, nextIdx)
  }

  const handleReset = () => {
    playTap()
    setSelectedLetterIds([])
    setFoundWords([])
    setFeedback(null)
    setDockLetters(
      puzzle.scrambledLetters.map((char, idx) => ({
        id: `${char}-${idx}`,
        char,
      }))
    )
  }

  // Shuffle unselected dock letters
  const handleShuffle = () => {
    playTap()
    const unselected = dockLetters.filter((item) => !selectedLetterIds.includes(item.id))
    const selected = dockLetters.filter((item) => selectedLetterIds.includes(item.id))

    const shuffledChars = shuffleLetters(unselected.map((u) => u.char))
    const newUnselected = unselected.map((item, idx) => ({
      ...item,
      char: shuffledChars[idx],
    }))

    setDockLetters([...selected, ...newUnselected])
  }

  // Select a letter token from the dock
  const handleSelectDockLetter = (letterItem) => {
    if (selectedLetterIds.includes(letterItem.id)) return
    playTap()
    setSelectedLetterIds((prev) => [...prev, letterItem.id])
    setFeedback(null)
  }

  // Remove letter from active input (by index in input)
  const handleRemoveInputLetter = (indexToRemove) => {
    playTap()
    setSelectedLetterIds((prev) => prev.filter((_, idx) => idx !== indexToRemove))
    setFeedback(null)
  }

  // Backspace (remove last entered letter)
  const handleBackspace = () => {
    if (selectedLetterIds.length === 0) return
    playTap()
    setSelectedLetterIds((prev) => prev.slice(0, -1))
    setFeedback(null)
  }

  // Clear all input
  const handleClear = () => {
    if (selectedLetterIds.length === 0) return
    playTap()
    setSelectedLetterIds([])
    setFeedback(null)
  }

  // Show transient feedback message
  const triggerFeedback = (msg, type = 'info') => {
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current)
    setFeedback({ message: msg, type })
    feedbackTimerRef.current = setTimeout(() => {
      setFeedback(null)
    }, 2400)
  }

  // Submit current word guess
  const handleSubmit = () => {
    const currentWord = selectedLetterIds
      .map((id) => dockLetters.find((l) => l.id === id)?.char)
      .join('')

    const result = validateGuess(
      currentWord,
      puzzle.targetWords,
      foundWords,
      puzzle.allValidWords,
      puzzle.root
    )

    if (result.status === 'valid_target' || result.status === 'valid_extra') {
      playTap()
      const newFound = [...foundWords, result.word]
      setFoundWords(newFound)
      setSelectedLetterIds([])
      triggerFeedback(result.message, 'success')

      // Check for victory
      const allTargetsFound = puzzle.targetWords.every((w) => newFound.includes(w))
      if (allTargetsFound) {
        setTimeout(() => {
          playChime()
        }, 200)
      }
    } else {
      playTap()
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 400)
      triggerFeedback(result.message, 'error')
    }
  }

  // Physical keyboard listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return

      if (e.key === 'Backspace') {
        e.preventDefault()
        handleBackspace()
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (selectedLetterIds.length >= 3) {
          handleSubmit()
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        handleClear()
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        const char = e.key.toUpperCase()
        // Find first unselected dock letter matching this char
        const availableItem = dockLetters.find(
          (item) => item.char === char && !selectedLetterIds.includes(item.id)
        )
        if (availableItem) {
          handleSelectDockLetter(availableItem)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [dockLetters, selectedLetterIds, handleSubmit, handleBackspace, handleClear])

  const handleBack = useCallback(
    (e) => {
      if (e) e.preventDefault()
      playTap()
      if (typeof onBack === 'function') {
        onBack()
      } else {
        window.location.hash = '#/briefing/anagrams'
      }
    },
    [onBack]
  )

  const isAllSolved = puzzle.targetWords.every((w) => foundWords.includes(w))
  const currentInputWord = selectedLetterIds
    .map((id) => dockLetters.find((l) => l.id === id)?.char)
    .join('')

  return (
    <div className="ag-page">
      {/* ── Top Header Bar ──────────────────────────────────── */}
      <header className="ag-top-bar">
        <button
          id="ag-back-btn"
          className="ag-action-btn"
          onClick={handleBack}
          aria-label="Back to Briefing"
          title="Back to Briefing"
        >
          <Icon name="back" size={20} />
        </button>

        <div className="ag-header-center">
          <h1 className="ag-title">Anagrams</h1>
        </div>

        <div className="ag-top-actions">
          <button
            id="ag-shuffle-btn"
            className="ag-action-btn"
            onClick={handleShuffle}
            aria-label="Shuffle letters"
            title="Shuffle"
          >
            <Icon name="restart" size={17} />
          </button>
          <button
            id="ag-reset-btn"
            className="ag-action-btn"
            onClick={handleReset}
            aria-label="Reset puzzle"
            title="Restart"
          >
            <Icon name="undo" size={17} />
          </button>
        </div>
      </header>

      <div className="ag-status-sub">
        {foundWords.length} of {puzzle.totalWords ?? puzzle.targetWords.length} words found
      </div>

      {/* ── Segmented Difficulty Selector ───────────────────── */}
      <div className="ag-difficulty-bar" role="tablist" aria-label="Difficulty Mode">
        {Object.values(DIFFICULTY_TIERS).map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={t.id === tier}
            className={`ag-diff-btn${t.id === tier ? ' ag-diff-btn--active' : ''}`}
            onClick={() => handleTierChange(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Puzzle Navigator ─────────────────────────────────── */}
      <div className="ag-puzzle-nav">
        <button
          className="ag-nav-arrow"
          onClick={handlePrevPuzzle}
          aria-label="Previous puzzle"
        >
          ‹
        </button>
        <div className="ag-puzzle-info">
          <span className="ag-puzzle-title">
            Level {puzzleIndex + 1}
          </span>
          <span className="ag-puzzle-progress">
            {puzzle.root.length}-letter root
          </span>
        </div>
        <button
          className="ag-nav-arrow"
          onClick={handleNextPuzzle}
          aria-label="Next puzzle"
        >
          ›
        </button>
      </div>

      {/* ── Discovery Board (Target Words Grouped by Length) ─── */}
      <div className="ag-discovery-board">
        {Object.entries(puzzle.groupedTargets).map(([lengthStr, wordsList]) => {
          const len = Number(lengthStr)
          return (
            <div key={`group-${len}`} className="ag-word-group">
              <div className="ag-group-label">{len}-Letter Words</div>
              <div className="ag-word-tokens-row">
                {wordsList.map((targetWord) => {
                  const isFound = foundWords.includes(targetWord)
                  return (
                    <div
                      key={`word-${targetWord}`}
                      className={`ag-word-slot${isFound ? ' ag-word-slot--found' : ''}`}
                      aria-label={isFound ? targetWord : `${len} letters hidden`}
                    >
                      {isFound
                        ? targetWord
                        : Array.from({ length: len }).map((_, i) => (
                            <span key={i} className="ag-letter-dash">
                              •
                            </span>
                          ))}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Bottom Interactive Zone (Input + Letter Dock) ─────── */}
      <footer className="ag-dock-container">
        {/* Transient Feedback Banner */}
        <div className="ag-feedback-container" aria-live="polite">
          {feedback && (
            <div
              className={`ag-feedback-pill ag-feedback-pill--${feedback.type}`}
            >
              {feedback.message}
            </div>
          )}
        </div>

        {isAllSolved ? (
          <div className="ag-victory-card">
            <div className="ag-victory-info">
              <span className="ag-victory-tag">Complete</span>
              <h2 className="ag-victory-title">Root Word: {puzzle.root}</h2>
            </div>
            <button
              id="ag-next-btn"
              className="ag-next-btn"
              onClick={handleNextPuzzle}
            >
              Next Puzzle
            </button>
          </div>
        ) : (
          <>
            {/* Active Input Row */}
            <div
              className={`ag-input-row${isShaking ? ' ag-input-row--shake' : ''}`}
            >
              <div className="ag-input-letters">
                {selectedLetterIds.map((id, index) => {
                  const item = dockLetters.find((l) => l.id === id)
                  return (
                    <button
                      key={`input-${id}-${index}`}
                      type="button"
                      className="ag-input-tile"
                      onClick={() => handleRemoveInputLetter(index)}
                      title="Tap to return letter"
                    >
                      {item?.char}
                    </button>
                  )
                })}
                {selectedLetterIds.length === 0 && (
                  <span className="ag-input-placeholder">Tap letters below</span>
                )}
                <span className="ag-cursor" aria-hidden="true" />
              </div>

              <div className="ag-input-actions">
                <button
                  type="button"
                  className="ag-action-text-btn"
                  onClick={handleClear}
                  disabled={selectedLetterIds.length === 0}
                  aria-label="Clear input"
                >
                  Clear
                </button>
                <button
                  id="ag-submit-btn"
                  type="button"
                  className={`ag-submit-btn${
                    selectedLetterIds.length >= 3 ? ' ag-submit-btn--ready' : ''
                  }`}
                  onClick={handleSubmit}
                  disabled={selectedLetterIds.length < 3}
                  aria-label="Submit word"
                >
                  Enter
                </button>
              </div>
            </div>

            {/* Circular Letter Dock */}
            <div className="ag-letter-dock" role="group" aria-label="Available Letters">
              {dockLetters.map((item) => {
                const isSelected = selectedLetterIds.includes(item.id)
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`ag-letter-btn${isSelected ? ' ag-letter-btn--selected' : ''}`}
                    onClick={() => handleSelectDockLetter(item)}
                    disabled={isSelected}
                    aria-label={`Letter ${item.char}${isSelected ? ' (used)' : ''}`}
                  >
                    {item.char}
                  </button>
                )
              })}
            </div>
          </>
        )}
      </footer>
    </div>
  )
}

export default AnagramsScreen
