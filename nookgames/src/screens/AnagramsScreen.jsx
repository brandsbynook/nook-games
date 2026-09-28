import { useState, useCallback, useEffect, useRef } from 'react'
import { Icon } from '../components/Icons'
import { GameHeader } from '../components/GameHeader.jsx'
import { DifficultyTabs } from '../components/DifficultyTabs.jsx'
import { GameFooterActions } from '../components/GameFooterActions.jsx'
import { GameCompletionModal } from '../components/GameCompletionModal.jsx'
import {
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
  const [foundWordsHistory, setFoundWordsHistory] = useState(() => [[]])
  const [historyIndex, setHistoryIndex] = useState(0)
  // Notification / toast feedback
  const [feedback, setFeedback] = useState(null)
  const [isShaking, setIsShaking] = useState(false)
  const feedbackTimerRef = useRef(null)

  const isInspecting = historyIndex < foundWordsHistory.length - 1
  const displayedFoundWords = foundWordsHistory[historyIndex] || foundWords

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
    setFoundWordsHistory([[]])
    setHistoryIndex(0)
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
    setFoundWordsHistory([[]])
    setHistoryIndex(0)
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
      const nextHist = [...foundWordsHistory.slice(0, historyIndex + 1), newFound]
      setFoundWordsHistory(nextHist)
      setHistoryIndex(nextHist.length - 1)
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
  const targetsFoundCount = displayedFoundWords.filter((w) =>
    puzzle.targetWords.includes(w)
  ).length
  const bonusCount = displayedFoundWords.length - targetsFoundCount

  return (
    <div className="ag-page game-screen-container">
      {/* ── Top Header Bar ──────────────────────────────────── */}
      <GameHeader
        title="Anagrams"
        onBack={handleBack}
      />

      <div className="ag-status-sub">
        {targetsFoundCount} of {puzzle.targetWords.length} words found
        {bonusCount > 0 ? ` (+${bonusCount} bonus)` : ''}
      </div>

      {/* ── Segmented Difficulty Selector ───────────────────── */}
      <DifficultyTabs
        currentTier={tier}
        onSelectTier={(tierId) => handleTierChange(tierId)}
        tiers={[
          { id: 'beginner', label: 'Gentle', subtitle: '5-letter' },
          { id: 'intermediate', label: 'Standard', subtitle: '6-letter' },
          { id: 'master', label: 'Deep', subtitle: '7-letter' },
        ]}
      />

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
                  const isFound = displayedFoundWords.includes(targetWord)
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
                  disabled={isInspecting}
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
              disabled={selectedLetterIds.length === 0 || isInspecting}
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
              disabled={selectedLetterIds.length < 3 || isInspecting}
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
                disabled={isSelected || isInspecting}
                aria-label={`Letter ${item.char}${isSelected ? ' (used)' : ''}`}
              >
                {item.char}
              </button>
            )
          })}
        </div>

        <GameFooterActions
          onReset={handleReset}
          resetLabel="Reset"
          onStepBack={() => setHistoryIndex((prev) => Math.max(0, prev - 1))}
          onStepForward={() => setHistoryIndex((prev) => Math.min(foundWordsHistory.length - 1, prev + 1))}
          canStepBack={historyIndex > 0}
          canStepForward={historyIndex < foundWordsHistory.length - 1}
          stepIndicator={foundWordsHistory.length > 1 ? `Words ${historyIndex + 1}/${foundWordsHistory.length}` : null}
          isInspecting={isInspecting}
          onExitInspection={() => setHistoryIndex(foundWordsHistory.length - 1)}
        >
          <button
            id="ag-shuffle-btn"
            type="button"
            className="game-action-btn"
            onClick={handleShuffle}
            disabled={isInspecting}
            aria-label="Shuffle letters"
          >
            <Icon name="sparkles" size={16} />
            <span>Shuffle</span>
          </button>
        </GameFooterActions>
      </footer>

      {/* ── Universal Completion Modal ── */}
      <GameCompletionModal
        isOpen={isAllSolved}
        title="Words Unlocked"
        description={`Root word: ${puzzle.root}. You uncovered all target anagrams.`}
        stats={[{ label: 'Words Found', value: foundWords.length }]}
        onNext={handleNextPuzzle}
        nextLabel="Next Puzzle"
        onReplay={handleReset}
        replayLabel="Replay"
        reviewLabel="Review Words"
      />
    </div>
  )
}

export default AnagramsScreen
