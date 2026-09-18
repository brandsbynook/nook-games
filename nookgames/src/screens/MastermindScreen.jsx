import { useState, useCallback } from 'react'
import { Icon } from '../icons.jsx'
import { GameHeader } from '../components/GameHeader.jsx'
import { DifficultyTabs } from '../components/DifficultyTabs.jsx'
import { GameFooterActions } from '../components/GameFooterActions.jsx'
import {
  DIFFICULTIES,
  DIFFICULTY_PRESETS,
  CODE_LENGTH,
  getSymbol,
  getColor,
  getPalette,
  generateSecretCode,
  evaluateGuess,
  getEliminationHint,
} from '../utils/mastermindLogic.js'
import { playTap, playChime } from '../utils/audio.js'

/**
 * Clean geometric stroke SVGs (monochrome #eaeaea, fill: none).
 * Base 6: circle, square, triangle, diamond, plus, hexagon
 * Master tier extra 2: star, ring
 */
function SymbolIcon({ id, size = 18, strokeWidth = 1.8 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: '#eaeaea',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    style: { display: 'block' },
  }

  switch (id) {
    case 'circle':
      return (
        <svg {...common} strokeWidth={strokeWidth}>
          <circle cx="12" cy="12" r="7" />
        </svg>
      )
    case 'square':
      return (
        <svg {...common} strokeWidth={strokeWidth}>
          <rect x="5.5" y="5.5" width="13" height="13" rx="1.5" />
        </svg>
      )
    case 'triangle':
      return (
        <svg {...common} strokeWidth={strokeWidth}>
          <polygon points="12,5 19.5,18 4.5,18" />
        </svg>
      )
    case 'diamond':
      return (
        <svg {...common} strokeWidth={strokeWidth}>
          <polygon points="12,4.5 19.5,12 12,19.5 4.5,12" />
        </svg>
      )
    case 'plus':
      return (
        <svg {...common} strokeWidth={strokeWidth + 0.3}>
          <path d="M12 6v12M6 12h12" />
        </svg>
      )
    case 'hexagon':
      return (
        <svg {...common} strokeWidth={strokeWidth}>
          <polygon points="12,4.5 18.5,8.25 18.5,15.75 12,19.5 5.5,15.75 5.5,8.25" />
        </svg>
      )
    case 'star':
      return (
        <svg {...common} strokeWidth={strokeWidth - 0.2}>
          <polygon points="12,4 14.3,9.5 20,9.9 15.7,13.8 17,19.5 12,16.4 7,19.5 8.3,13.8 4,9.9 9.7,9.5" />
        </svg>
      )
    case 'ring':
      return (
        <svg {...common} strokeWidth={strokeWidth - 0.2}>
          <circle cx="12" cy="12" r="7.5" />
          <circle cx="12" cy="12" r="3.2" />
        </svg>
      )
    default:
      return null
  }
}

export function MastermindScreen({ onBack } = {}) {
  const [difficulty, setDifficulty] = useState('standard') // Default tier: Standard
  const activePresets = DIFFICULTIES || DIFFICULTY_PRESETS
  const difficultyConfig = activePresets[difficulty] || activePresets.standard
  const currentPreset = difficultyConfig
  const slotsCount = difficultyConfig.slots || CODE_LENGTH

  const [secret, setSecret] = useState(() => generateSecretCode(difficultyConfig))
  const [history, setHistory] = useState([]) // Array of { guess: string[], exact: number, misplaced: number }
  const [currentGuess, setCurrentGuess] = useState([]) // Array of symbol IDs
  const [status, setStatus] = useState('in_progress') // 'in_progress' | 'won' | 'lost'
  const [hint, setHint] = useState(null) // { message: string, symbolId?: string, slot?: number }
  const [eliminatedSymbols, setEliminatedSymbols] = useState([]) // Symbol IDs known to be absent
  const [revealedSlots, setRevealedSlots] = useState([]) // Slot indices revealed by hint
  const [showToast, setShowToast] = useState(false)

  // Start new game with specified or current tier
  const startNewGame = useCallback((diffKey = difficulty) => {
    playTap()
    const config = (DIFFICULTIES || DIFFICULTY_PRESETS)[diffKey] || (DIFFICULTIES || DIFFICULTY_PRESETS).hard
    setSecret(generateSecretCode(config))
    setHistory([])
    setCurrentGuess([])
    setStatus('in_progress')
    setHint(null)
    setEliminatedSymbols([])
    setRevealedSlots([])
    setShowToast(false)
  }, [difficulty])

  // Difficulty switch handler
  const handleDifficultyChange = (diffKey) => {
    if (diffKey === difficulty) return
    setDifficulty(diffKey)
    startNewGame(diffKey)
  }

  // Back button handler
  const handleBack = useCallback(
    (e) => {
      if (e) e.preventDefault()
      playTap()
      if (typeof onBack === 'function') {
        onBack()
      } else {
        window.location.hash = '/briefing/mastermind'
      }
    },
    [onBack]
  )

  // Add symbol to current guess
  const handleSelectSymbol = (symbolId) => {
    if (status !== 'in_progress' || currentGuess.length >= difficultyConfig.slots) return
    playTap()
    setCurrentGuess((prev) => [...prev, symbolId])
  }

  // Remove specific symbol from active row
  const handleRemoveSlot = (index) => {
    if (status !== 'in_progress') return
    playTap()
    setCurrentGuess((prev) => prev.filter((_, i) => i !== index))
  }

  // Backspace (remove last placed symbol)
  const handleBackspace = () => {
    if (status !== 'in_progress' || currentGuess.length === 0) return
    playTap()
    setCurrentGuess((prev) => prev.slice(0, -1))
  }

  // Submit current guess
  const handleSubmit = () => {
    if (status !== 'in_progress' || currentGuess.length !== difficultyConfig.slots) return
    playTap()

    const result = evaluateGuess(secret, currentGuess)
    const newHistory = [
      ...history,
      {
        guess: [...currentGuess],
        exact: result.exact,
        misplaced: result.misplaced,
      },
    ]

    setHistory(newHistory)
    setCurrentGuess([])

    if (result.isWon) {
      setStatus('won')
      setTimeout(() => {
        playChime()
        setShowToast(true)
      }, 250)
    } else if (newHistory.length >= difficultyConfig.maxAttempts) {
      setStatus('lost')
      setTimeout(() => {
        setShowToast(true)
      }, 250)
    }
  }

  // Hint button handler
  const handleHint = () => {
    if (status !== 'in_progress') return
    playTap()

    const hintResult = getEliminationHint(
      secret,
      eliminatedSymbols,
      revealedSlots,
      difficultyConfig.paletteSize
    )
    setHint(hintResult)

    const absentId = hintResult.symbolId || hintResult.colorId
    if (hintResult.type === 'elimination' && absentId) {
      setEliminatedSymbols((prev) =>
        prev.includes(absentId) ? prev : [...prev, absentId]
      )
    } else if (hintResult.type === 'reveal' && typeof hintResult.slot === 'number') {
      setRevealedSlots((prev) =>
        prev.includes(hintResult.slot) ? prev : [...prev, hintResult.slot]
      )
    }
  }

  const currentRow = history.length
  const isGameOver = status !== 'in_progress'
  const activePalette = getPalette(difficultyConfig.paletteSize)

  return (
    <div className="mm-page game-screen-container">
      {/* ── Top Header Bar ──────────────────────────────────── */}
      <GameHeader title="Mastermind" onBack={handleBack} />

      {/* ── Segmented Difficulty Selector ───────────────────── */}
      <DifficultyTabs
        currentTier={difficulty}
        onSelectTier={(tierId) => handleDifficultyChange(tierId)}
        tiers={[
          { id: 'gentle', label: 'Gentle', subtitle: '4 slots' },
          { id: 'standard', label: 'Standard', subtitle: '4 slots' },
          { id: 'deep', label: 'Deep', subtitle: '5 slots' },
        ]}
      />

      {/* ── Secret Code Mystery Banner ───────────────────────── */}
      <div className="mm-secret-banner">
        <div className="mm-secret-row" aria-label="Secret Code">
          {secret.map((symbolId, i) => {
            const isRevealed = isGameOver || revealedSlots.includes(i)

            return (
              <div
                key={`secret-${i}`}
                className={`mm-secret-slot${isRevealed ? ' mm-secret-slot--revealed' : ''}`}
              >
                {isRevealed ? (
                  <SymbolIcon id={symbolId} size={18} />
                ) : (
                  <span className="mm-mystery-glyph">?</span>
                )}
              </div>
            )
          })}
        </div>
        <p className="mm-status-tagline">
          {status === 'won'
            ? `Code cracked in ${history.length} ${history.length === 1 ? 'attempt' : 'attempts'}.`
            : status === 'lost'
            ? 'The secret sequence is revealed. Order awaits another attempt.'
            : `Attempt ${currentRow + 1} of ${difficultyConfig.maxAttempts} — ${difficultyConfig.slots} slots, ${difficultyConfig.paletteSize} symbols${difficultyConfig.allowDuplicates ? ' (repeats allowed)' : ' (unique)'}.`}
        </p>

        {hint && (
          <div className="mm-hint-pill" role="status">
            <span className="mm-hint-text">{hint.message}</span>
            <button
              className="mm-hint-close"
              onClick={() => setHint(null)}
              aria-label="Dismiss hint"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* ── Vertical Decoding Board (Dynamic Rows & Slots) ─────── */}
      <div className="mm-board-scroll">
        <div className="mm-board" role="region" aria-label="Decoding Rows">
          {Array.from({ length: difficultyConfig.maxAttempts }).map((_, rIndex) => {
            const isPast = rIndex < history.length
            const isActive = rIndex === currentRow && !isGameOver
            const rowData = isPast ? history[rIndex] : null

            return (
              <div
                key={`row-${rIndex}`}
                className={`mm-row${isActive ? ' mm-row--active' : ''}${
                  isPast ? ' mm-row--past' : ''
                }`}
              >
                {/* Row Number */}
                <span className="mm-row-num">
                  {String(rIndex + 1).padStart(2, '0')}
                </span>

                {/* Symbol Slots (4 or 5 slots based on active tier) */}
                <div className="mm-slots-cluster">
                  {Array.from({ length: difficultyConfig.slots }).map((_, sIndex) => {
                    let slotSymbolId = null
                    let isCurrentActiveSlot = false

                    if (isPast && rowData) {
                      slotSymbolId = rowData.guess[sIndex]
                    } else if (isActive) {
                      slotSymbolId = currentGuess[sIndex] || null
                      isCurrentActiveSlot = sIndex === currentGuess.length
                    }

                    const symbol = slotSymbolId ? getSymbol(slotSymbolId) : null

                    return (
                      <button
                        key={`slot-${rIndex}-${sIndex}`}
                        type="button"
                        className={`mm-slot${
                          difficultyConfig.slots === 5 ? ' mm-slot--5' : ''
                        }${slotSymbolId ? ' mm-slot--filled' : ' mm-slot--empty'}${
                          isCurrentActiveSlot ? ' mm-slot--next' : ''
                        }`}
                        onClick={() => {
                          if (isActive && slotSymbolId) {
                            handleRemoveSlot(sIndex)
                          }
                        }}
                        disabled={!isActive || !slotSymbolId}
                        aria-label={
                          symbol
                            ? `Slot ${sIndex + 1}: ${symbol.label}`
                            : `Slot ${sIndex + 1}: empty`
                        }
                      >
                        {slotSymbolId ? (
                          <SymbolIcon
                            id={slotSymbolId}
                            size={difficultyConfig.slots === 5 ? 15 : 17}
                          />
                        ) : isActive && isCurrentActiveSlot ? (
                          <span className="mm-slot-indicator" />
                        ) : null}
                      </button>
                    )
                  })}
                </div>

                {/* Feedback Indicator Pips (Monochrome) */}
                <div
                  className={`mm-feedback-box${
                    difficultyConfig.slots === 5 ? ' mm-feedback-box--5' : ''
                  }`}
                  aria-label={
                    rowData
                      ? `${rowData.exact} exact, ${rowData.misplaced} misplaced`
                      : 'No feedback'
                  }
                >
                  {Array.from({ length: difficultyConfig.slots }).map((_, pIndex) => {
                    let pipClass = 'mm-pip--empty'
                    if (rowData) {
                      if (pIndex < rowData.exact) {
                        pipClass = 'mm-pip--exact' // Solid white dot
                      } else if (pIndex < rowData.exact + rowData.misplaced) {
                        pipClass = 'mm-pip--misplaced' // Hollow ring
                      }
                    }

                    return <span key={`pip-${pIndex}`} className={`mm-pip ${pipClass}`} />
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Bottom Symbol Selection Dock & Actions ─────────────── */}
      <footer className="mm-dock">
        {isGameOver ? (
          <div className="mm-gameover-actions">
            <button
              id="mm-next-btn"
              className="mm-next-btn"
              onClick={() => startNewGame(difficulty)}
            >
              New Code
            </button>
          </div>
        ) : (
          <div className="mm-input-panel">
            {/* Dynamic Symbol Palette Tokens (6 or 8) */}
            <div
              className={`mm-colors-row mm-symbols-row${
                activePalette.length === 8 ? ' mm-colors-row--8 mm-symbols-row--8' : ''
              }`}
              role="group"
              aria-label="Symbol Palette"
            >
              {activePalette.map((s) => {
                const isEliminated = eliminatedSymbols.includes(s.id)

                return (
                  <button
                    key={s.id}
                    type="button"
                    className={`mm-color-btn mm-symbol-btn${
                      activePalette.length === 8 ? ' mm-color-btn--8 mm-symbol-btn--8' : ''
                    }${isEliminated ? ' mm-color-btn--eliminated mm-symbol-btn--eliminated' : ''}`}
                    onClick={() => handleSelectSymbol(s.id)}
                    aria-label={`Select ${s.label}${
                      isEliminated ? ' (Likely absent)' : ''
                    }`}
                    title={s.label}
                  >
                    <SymbolIcon id={s.id} size={activePalette.length === 8 ? 16 : 19} />
                    {isEliminated && <span className="mm-eliminated-mark">×</span>}
                  </button>
                )
              })}
            </div>

            {/* Bottom Actions: Backspace + Submit Guess */}
            <div className="mm-actions-row">
              <button
                id="mm-undo-btn"
                type="button"
                className="mm-undo-btn"
                onClick={handleBackspace}
                disabled={currentGuess.length === 0}
                aria-label="Remove last symbol"
                title="Backspace"
              >
                <Icon name="undo" size={17} />
                <span>Undo</span>
              </button>

              <button
                id="mm-submit-btn"
                type="button"
                className={`mm-submit-btn${
                  currentGuess.length === difficultyConfig.slots ? ' mm-submit-btn--ready' : ''
                }`}
                onClick={handleSubmit}
                disabled={currentGuess.length !== difficultyConfig.slots}
                aria-label={`Submit ${difficultyConfig.slots}-symbol guess`}
              >
                Submit Guess
              </button>
            </div>
          </div>
        )}
      </footer>

      {/* ── Completion Toast ──────────────────────────────────── */}
      <div
        className={`mm-toast${showToast ? ' mm-toast--visible' : ''}`}
        role="status"
        aria-live="polite"
      >
        {status === 'won'
          ? 'Silence restored. Code deduced with clarity.'
          : 'Every attempt is an exercise in deduction.'}
      </div>
    </div>
  )
}

export default MastermindScreen
