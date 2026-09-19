import { useState, useEffect, useCallback, useRef } from 'react'
import { Icon } from '../components/Icons'
import { GameHeader } from '../components/GameHeader.jsx'
import { DifficultyTabs } from '../components/DifficultyTabs.jsx'
import { GameFooterActions } from '../components/GameFooterActions.jsx'
import { GameCompletionModal } from '../components/GameCompletionModal.jsx'
import { SUDOKU_PRESETS, generateTransformedPreset, isSudokuComplete } from '../data/sudokuPuzzles.js'
import { playTap, playChime } from '../utils/audio.js'
import { recordGameSession } from '../utils/storage.js'

export function SudokuScreen({ onBack }) {
  const initialIndex = useRef(Math.floor(Math.random() * SUDOKU_PRESETS.length))
  const [presetIndex, setPresetIndex] = useState(initialIndex.current)
  const [activePreset, setActivePreset] = useState(() => generateTransformedPreset(SUDOKU_PRESETS[initialIndex.current]))

  const [board, setBoard] = useState(() => [...activePreset.initial])
  const [history, setHistory] = useState(() => [[...activePreset.initial]])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [notes, setNotes] = useState(() => Array.from({ length: 81 }, () => new Set()))
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [pencilMode, setPencilMode] = useState(false)
  const [isSolved, setIsSolved] = useState(false)

  const isInspecting = historyIndex < history.length - 1
  const displayedBoard = history[historyIndex] || board

  useEffect(() => {
    const init = [...activePreset.initial]
    setBoard(init)
    setHistory([init])
    setHistoryIndex(0)
    setNotes(Array.from({ length: 81 }, () => new Set()))
    setSelectedIndex(null)
    setIsSolved(false)
  }, [activePreset])

  function handleBack(e) {
    if (e) e.preventDefault()
    playTap()
    if (typeof onBack === 'function') {
      onBack()
    } else {
      window.location.hash = ''
    }
  }

  function handleSelectCell(index) {
    if (isInspecting) return
    playTap()
    setSelectedIndex(index)
  }

  const handleNumberInput = useCallback(
    (num) => {
      if (selectedIndex === null || isSolved || isInspecting) return
      if (activePreset.initial[selectedIndex] !== 0) return

      playTap()

      if (pencilMode) {
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
        setBoard((prevBoard) => {
          const nextBoard = [...prevBoard]
          nextBoard[selectedIndex] = nextBoard[selectedIndex] === num ? 0 : num

          if (nextBoard[selectedIndex] !== 0) {
            setNotes((prevNotes) => {
              const nextNotes = prevNotes.map((set) => new Set(set))
              nextNotes[selectedIndex].clear()
              return nextNotes
            })
          }

          setHistory((prev) => {
            const nextHistory = [...prev.slice(0, historyIndex + 1), nextBoard]
            setHistoryIndex(nextHistory.length - 1)
            return nextHistory
          })

          if (isSudokuComplete(nextBoard)) {
            setIsSolved(true)
            recordGameSession('sudoku', true)
            setTimeout(() => {
              playChime()
            }, 250)
          }

          return nextBoard
        })
      }
    },
    [selectedIndex, isSolved, isInspecting, activePreset.initial, pencilMode, historyIndex]
  )

  const handleErase = useCallback(() => {
    if (selectedIndex === null || isSolved || isInspecting) return
    if (activePreset.initial[selectedIndex] !== 0) return

    playTap()

    setBoard((prevBoard) => {
      const nextBoard = [...prevBoard]
      nextBoard[selectedIndex] = 0

      setHistory((prev) => {
        const nextHistory = [...prev.slice(0, historyIndex + 1), nextBoard]
        setHistoryIndex(nextHistory.length - 1)
        return nextHistory
      })

      return nextBoard
    })

    setNotes((prevNotes) => {
      const nextNotes = prevNotes.map((set) => new Set(set))
      nextNotes[selectedIndex].clear()
      return nextNotes
    })
  }, [selectedIndex, isSolved, isInspecting, activePreset.initial, historyIndex])

  function handleRestart() {
    playTap()
    setActivePreset(generateTransformedPreset(SUDOKU_PRESETS[presetIndex]))
  }

  function handlePresetChange(nextIdx) {
    playTap()
    setPresetIndex(nextIdx)
    setActivePreset(generateTransformedPreset(SUDOKU_PRESETS[nextIdx]))
  }

  useEffect(() => {
    function handleKeyDown(e) {
      if (isSolved || isInspecting) return
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
  }, [handleNumberInput, handleErase, selectedIndex, isSolved, isInspecting])

  const selectedRow = selectedIndex !== null ? Math.floor(selectedIndex / 9) : null
  const selectedCol = selectedIndex !== null ? selectedIndex % 9 : null
  const selectedBlockRow = selectedRow !== null ? Math.floor(selectedRow / 3) : null
  const selectedBlockCol = selectedCol !== null ? Math.floor(selectedCol / 3) : null
  const selectedValue = selectedIndex !== null ? displayedBoard[selectedIndex] : null

  const tierNames = ['Gentle', 'Standard', 'Deep']

  return (
    <div className="sdk-page game-screen-container">
      <GameHeader title="Sudoku" onBack={handleBack} />

      <DifficultyTabs
        currentTier={presetIndex}
        onSelectTier={(_, idx) => handlePresetChange(idx)}
        tiers={[
          { id: 'gentle', label: 'Gentle', subtitle: 'Easy' },
          { id: 'standard', label: 'Standard', subtitle: 'Peaceful' },
          { id: 'deep', label: 'Deep', subtitle: 'Moderate' },
        ]}
      />

      <div className="sdk-body">
        <div className="sdk-grid-wrap">
          <div
            className="sdk-grid"
            role="grid"
            aria-label="Sudoku 9x9 grid"
          >
            {displayedBoard.map((cellValue, idx) => {
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
                  aria-label={`Row ${row + 1} Column ${col + 1}${cellValue ? `, value ${cellValue}` : ', empty'
                    }`}
                  tabIndex={0}
                  disabled={isInspecting}
                >
                  {cellValue !== 0 ? (
                    <span className="sdk-cell-val">{cellValue}</span>
                  ) : cellNotes.size > 0 && !isInspecting ? (
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

        <div className="sdk-controls">
          <GameFooterActions
            onReset={handleRestart}
            resetLabel="Reset"
            onStepBack={() => setHistoryIndex((prev) => Math.max(0, prev - 1))}
            onStepForward={() => setHistoryIndex((prev) => Math.min(history.length - 1, prev + 1))}
            canStepBack={historyIndex > 0}
            canStepForward={historyIndex < history.length - 1}
            stepIndicator={history.length > 1 ? `Move ${historyIndex}/${history.length - 1}` : null}
            isInspecting={isInspecting}
            onExitInspection={() => setHistoryIndex(history.length - 1)}
          >
            <button
              id="sdk-pencil-btn"
              type="button"
              className={`game-action-btn${pencilMode ? ' game-action-btn--active' : ''}`}
              onClick={() => {
                playTap()
                setPencilMode((prev) => !prev)
              }}
              aria-label="Toggle Pencil Notes"
              disabled={isInspecting || isSolved}
            >
              <Icon name="pencil" size={16} />
              <span>Notes {pencilMode ? 'On' : 'Off'}</span>
            </button>

            <button
              id="sdk-erase-btn"
              type="button"
              className="game-action-btn"
              onClick={handleErase}
              aria-label="Erase cell"
              disabled={isInspecting || isSolved}
            >
              <Icon name="erase" size={16} />
              <span>Erase</span>
            </button>
          </GameFooterActions>

          <div className="sdk-keypad">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={`key-${num}`}
                className="sdk-key"
                onClick={() => handleNumberInput(num)}
                aria-label={`Digit ${num}`}
                disabled={isInspecting || isSolved}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>

      <GameCompletionModal
        isOpen={isSolved}
        title="Harmonious Grid"
        description="Every row, column, and cell rests in perfect harmony."
        icon="✓"
        stats={[
          { label: 'Difficulty', value: tierNames[presetIndex] || 'Standard' },
          { label: 'Total Moves', value: `${history.length - 1}` },
        ]}
        onNext={() => handlePresetChange((presetIndex + 1) % SUDOKU_PRESETS.length)}
        nextLabel="Next Puzzle"
        onReplay={handleRestart}
        replayLabel="Replay"
        reviewLabel="Review Grid"
      />
    </div>
  )
}

export default SudokuScreen