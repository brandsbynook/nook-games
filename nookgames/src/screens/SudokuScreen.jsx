import { useState, useEffect, useCallback } from 'react'
import { Icon } from '../icons.jsx'
import { SUDOKU_PRESETS, isSudokuComplete } from '../data/sudokuPuzzles.js'
import { playTap, playChime } from '../utils/audio.js'
import { recordGameSession } from '../utils/storage.js'

export function SudokuScreen() {
  const [presetIndex, setPresetIndex] = useState(0) // Default: Easy
  const activePreset = SUDOKU_PRESETS[presetIndex]

  // Board state: array of 81 numbers (0 = empty)
  const [board, setBoard] = useState(() => [...activePreset.initial])
  // Pencil notes: map of cell index -> Set of numbers (1..9)
  const [notes, setNotes] = useState(() => Array.from({ length: 81 }, () => new Set()))
  // Selected cell index (0..80)
  const [selectedIndex, setSelectedIndex] = useState(null)
  // Pencil mode flag
  const [pencilMode, setPencilMode] = useState(false)
  // Completion status
  const [isSolved, setIsSolved] = useState(false)
  // Toast notification
  const [showToast, setShowToast] = useState(false)

  // Reset board when preset changes
  useEffect(() => {
    setBoard([...activePreset.initial])
    setNotes(Array.from({ length: 81 }, () => new Set()))
    setSelectedIndex(null)
    setIsSolved(false)
    setShowToast(false)
  }, [activePreset])

  // Handle back to Briefing screen
  function handleBack(e) {
    e.preventDefault()
    playTap()
    window.location.hash = '/briefing/sudoku'
  }

  // Cell selection
  function handleSelectCell(index) {
    playTap()
    setSelectedIndex(index)
  }

  // Handle number input (from keypad or physical keyboard)
  const handleNumberInput = useCallback(
    (num) => {
      if (selectedIndex === null || isSolved) return

      // Fixed starting clues cannot be modified
      if (activePreset.initial[selectedIndex] !== 0) return

      playTap()

      if (pencilMode) {
        // Toggle note in pencil mode
        setNotes((prevNotes) => {
          const nextNotes = prevNotes.map((set) => new Set(set))
          const currentCellNotes = nextNotes[selectedIndex]
          if (currentCellNotes.has(num)) {
            currentCellNotes.delete(num)
          } else {
            currentCellNotes.add(num)
          }
          return nextNotes
        })
      } else {
        // Normal number placement
        setBoard((prevBoard) => {
          const nextBoard = [...prevBoard]
          // Toggle off if same number pressed, otherwise place number
          nextBoard[selectedIndex] = nextBoard[selectedIndex] === num ? 0 : num

          // Clear pencil notes for this cell upon filling
          if (nextBoard[selectedIndex] !== 0) {
            setNotes((prevNotes) => {
              const nextNotes = prevNotes.map((set) => new Set(set))
              nextNotes[selectedIndex].clear()
              return nextNotes
            })
          }

          // Check for completion
          if (isSudokuComplete(nextBoard)) {
            setIsSolved(true)
            recordGameSession('sudoku', true)
            setTimeout(() => {
              playChime()
              setShowToast(true)
            }, 250)
          }

          return nextBoard
        })
      }
    },
    [selectedIndex, isSolved, activePreset.initial, pencilMode]
  )

  // Erase active cell
  const handleErase = useCallback(() => {
    if (selectedIndex === null || isSolved) return
    if (activePreset.initial[selectedIndex] !== 0) return

    playTap()

    setBoard((prevBoard) => {
      const nextBoard = [...prevBoard]
      nextBoard[selectedIndex] = 0
      return nextBoard
    })

    setNotes((prevNotes) => {
      const nextNotes = prevNotes.map((set) => new Set(set))
      nextNotes[selectedIndex].clear()
      return nextNotes
    })
  }, [selectedIndex, isSolved, activePreset.initial])

  // Restart current puzzle
  function handleRestart() {
    playTap()
    setBoard([...activePreset.initial])
    setNotes(Array.from({ length: 81 }, () => new Set()))
    setSelectedIndex(null)
    setIsSolved(false)
    setShowToast(false)
  }

  // Switch difficulty preset
  function handlePresetChange(nextIdx) {
    playTap()
    setPresetIndex(nextIdx)
  }

  // Physical keyboard listener
  useEffect(() => {
    function handleKeyDown(e) {
      if (isSolved) return
      const key = e.key

      if (key >= '1' && key <= '9') {
        handleNumberInput(parseInt(key, 10))
      } else if (key === 'Backspace' || key === 'Delete' || key === '0') {
        handleErase()
      } else if (key.toLowerCase() === 'p' || key.toLowerCase() === 'n') {
        playTap()
        setPencilMode((prev) => !prev)
      } else if (key === 'ArrowUp' && selectedIndex !== null) {
        e.preventDefault()
        setSelectedIndex((prev) => (prev >= 9 ? prev - 9 : prev))
      } else if (key === 'ArrowDown' && selectedIndex !== null) {
        e.preventDefault()
        setSelectedIndex((prev) => (prev <= 71 ? prev + 9 : prev))
      } else if (key === 'ArrowLeft' && selectedIndex !== null) {
        e.preventDefault()
        setSelectedIndex((prev) => (prev % 9 > 0 ? prev - 1 : prev))
      } else if (key === 'ArrowRight' && selectedIndex !== null) {
        e.preventDefault()
        setSelectedIndex((prev) => (prev % 9 < 8 ? prev + 1 : prev))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNumberInput, handleErase, selectedIndex, isSolved])

  // Selected cell coordinates & value for contextual highlight
  const selectedRow = selectedIndex !== null ? Math.floor(selectedIndex / 9) : null
  const selectedCol = selectedIndex !== null ? selectedIndex % 9 : null
  const selectedBlockRow = selectedRow !== null ? Math.floor(selectedRow / 3) : null
  const selectedBlockCol = selectedCol !== null ? Math.floor(selectedCol / 3) : null
  const selectedValue = selectedIndex !== null ? board[selectedIndex] : null

  return (
    <div className="sdk-page">
      {/* ── Top Bar ─────────────────────────────────────────── */}
      <div className="sdk-header">
        <button
          id="sdk-back-btn"
          className="sdk-back-btn"
          onClick={handleBack}
          aria-label="Back to Briefing"
        >
          <Icon name="back" size={20} />
        </button>

        <div className="sdk-header-center">
          <span className="sdk-header-title">Sudoku</span>
        </div>

        <div className="sdk-header-actions">
          <button
            id="sdk-restart-btn"
            className="sdk-action-btn"
            onClick={handleRestart}
            aria-label="Restart puzzle"
            title="Restart"
          >
            <Icon name="restart" size={18} />
          </button>
        </div>
      </div>

      <div className="sdk-difficulty-bar">
        {SUDOKU_PRESETS.map((p, idx) => (
          <button
            key={p.id}
            className={`sdk-preset-btn${idx === presetIndex ? ' sdk-preset-btn--active' : ''}`}
            onClick={() => handlePresetChange(idx)}
          >
            {p.difficulty}
          </button>
        ))}
      </div>

      {/* ── Main Game Content ───────────────────────────────── */}
      <div className="sdk-body">
        {/* 9x9 Sudoku Grid */}
        <div className="sdk-grid-wrap">
          <div
            className="sdk-grid"
            role="grid"
            aria-label="Sudoku 9x9 grid"
          >
            {board.map((cellValue, idx) => {
              const row = Math.floor(idx / 9)
              const col = idx % 9
              const blockRow = Math.floor(row / 3)
              const blockCol = Math.floor(col / 3)

              const isInitial = activePreset.initial[idx] !== 0
              const isSelected = selectedIndex === idx
              const isSameRowOrCol = selectedRow === row || selectedCol === col
              const isSameBlock =
                selectedBlockRow === blockRow && selectedBlockCol === blockCol
              const isSameNumber =
                selectedValue !== 0 && selectedValue !== null && cellValue === selectedValue

              // Class calculation for 3x3 block borders
              const isRightBorder = col === 2 || col === 5
              const isBottomBorder = row === 2 || row === 5

              const cellClasses = [
                'sdk-cell',
                isInitial ? 'sdk-cell--initial' : 'sdk-cell--user',
                isSelected ? 'sdk-cell--selected' : '',
                !isSelected && isSameNumber ? 'sdk-cell--matching' : '',
                !isSelected && !isSameNumber && (isSameRowOrCol || isSameBlock)
                  ? 'sdk-cell--related'
                  : '',
                isRightBorder ? 'sdk-cell--border-right' : '',
                isBottomBorder ? 'sdk-cell--border-bottom' : '',
              ]
                .filter(Boolean)
                .join(' ')

              const cellNotes = notes[idx]

              return (
                <button
                  key={`sdk-cell-${idx}`}
                  className={cellClasses}
                  onClick={() => handleSelectCell(idx)}
                  aria-label={`Row ${row + 1} Column ${col + 1}${
                    cellValue ? `, value ${cellValue}` : ', empty'
                  }`}
                  tabIndex={0}
                >
                  {cellValue !== 0 ? (
                    <span className="sdk-cell-val">{cellValue}</span>
                  ) : cellNotes.size > 0 ? (
                    <div className="sdk-notes-grid" aria-hidden="true">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                        <span
                          key={n}
                          className={`sdk-note${cellNotes.has(n) ? ' sdk-note--visible' : ''}`}
                        >
                          {cellNotes.has(n) ? n : ''}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Keypad & Controls ───────────────────────────────── */}
        <div className="sdk-controls">
          {/* Action Row: Pencil Mode Toggle & Erase */}
          <div className="sdk-action-row">
            <button
              id="sdk-pencil-btn"
              className={`sdk-mode-btn${pencilMode ? ' sdk-mode-btn--active' : ''}`}
              onClick={() => {
                playTap()
                setPencilMode((prev) => !prev)
              }}
              aria-label="Toggle Pencil Notes"
            >
              <Icon name="pencil" size={16} />
              <span>Notes {pencilMode ? 'On' : 'Off'}</span>
            </button>

            <button
              id="sdk-erase-btn"
              className="sdk-mode-btn"
              onClick={handleErase}
              aria-label="Erase cell"
            >
              <Icon name="erase" size={16} />
              <span>Erase</span>
            </button>
          </div>

          {/* Number Pad (1 through 9) */}
          <div className="sdk-keypad">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={`key-${num}`}
                className="sdk-key"
                onClick={() => handleNumberInput(num)}
                aria-label={`Digit ${num}`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Completion Toast ─────────────────────────────────── */}
      <div
        className={`sdk-toast${showToast ? ' sdk-toast--visible' : ''}`}
        role="status"
        aria-live="polite"
      >
        Pattern resolved in silence.
      </div>
    </div>
  )
}
