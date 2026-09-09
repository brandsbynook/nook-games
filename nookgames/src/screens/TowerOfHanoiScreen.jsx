import { useState, useCallback, useEffect } from 'react'
import { Icon } from '../icons.jsx'
import { playTap, playChime } from '../utils/audio.js'

const DIFFICULTY_PRESETS = [
  { disks: 3, label: '3', name: 'Peaceful', minMoves: 7 },
  { disks: 4, label: '4', name: 'Easy', minMoves: 15 },
  { disks: 5, label: '5', name: 'Moderate', minMoves: 31 },
]

function createInitialPegs(numDisks) {
  // Peg 0 holds disks [numDisks, ..., 1] from bottom to top
  const initialStack = []
  for (let i = numDisks; i >= 1; i--) {
    initialStack.push(i)
  }
  return [initialStack, [], []]
}

export function TowerOfHanoiScreen() {
  const [numDisks, setNumDisks] = useState(3)
  const [pegs, setPegs] = useState(() => createInitialPegs(3))
  const [selectedPeg, setSelectedPeg] = useState(null)
  const [moveCount, setMoveCount] = useState(0)
  const [isSolved, setIsSolved] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [invalidPeg, setInvalidPeg] = useState(null)

  const activePreset = DIFFICULTY_PRESETS.find((p) => p.disks === numDisks) || DIFFICULTY_PRESETS[0]
  const minMoves = Math.pow(2, numDisks) - 1

  const resetGame = useCallback((disks = numDisks) => {
    setPegs(createInitialPegs(disks))
    setSelectedPeg(null)
    setMoveCount(0)
    setIsSolved(false)
    setShowToast(false)
    setInvalidPeg(null)
  }, [numDisks])

  // Handle difficulty switch
  function handlePresetChange(disks) {
    if (disks === numDisks) return
    playTap()
    setNumDisks(disks)
    resetGame(disks)
  }

  // Back button
  function handleBack(e) {
    e.preventDefault()
    playTap()
    window.location.hash = '/briefing/tower-of-hanoi'
  }

  // Restart
  function handleRestart() {
    playTap()
    resetGame(numDisks)
  }

  // Peg interaction
  function handlePegClick(pegIndex) {
    if (isSolved) return

    // Case 1: No peg selected yet -> Lift top disk if peg not empty
    if (selectedPeg === null) {
      if (pegs[pegIndex].length === 0) return // Empty peg, nothing to lift
      playTap()
      setSelectedPeg(pegIndex)
      return
    }

    // Case 2: Tap the same peg -> Deselect / drop disk back down
    if (selectedPeg === pegIndex) {
      playTap()
      setSelectedPeg(null)
      return
    }

    // Case 3: Target peg selected -> Attempt move
    const sourceStack = pegs[selectedPeg]
    const targetStack = pegs[pegIndex]
    const movingDisk = sourceStack[sourceStack.length - 1]
    const targetTopDisk = targetStack.length > 0 ? targetStack[targetStack.length - 1] : Infinity

    // Check validity: smaller disk on larger disk, or empty peg
    if (movingDisk < targetTopDisk) {
      playTap()
      const newPegs = pegs.map((p) => [...p])
      newPegs[selectedPeg].pop()
      newPegs[pegIndex].push(movingDisk)
      setPegs(newPegs)
      setSelectedPeg(null)
      const nextMoves = moveCount + 1
      setMoveCount(nextMoves)

      // Win Condition: all disks stacked on Peg 1 (B) or Peg 2 (C)
      if (newPegs[1].length === numDisks || newPegs[2].length === numDisks) {
        setIsSolved(true)
        setTimeout(() => {
          playChime()
          setShowToast(true)
        }, 300)
      }
    } else {
      // Invalid move: gentle visual cue without harsh buzzing
      setInvalidPeg(pegIndex)
      setTimeout(() => {
        setInvalidPeg(null)
      }, 400)
    }
  }

  // Disk visual attributes
  function getDiskStyle(diskSize, isLifted) {
    // Width calculation from 36px to 96px
    const minW = 38
    const maxW = 98
    const width = numDisks > 1 ? minW + ((diskSize - 1) / (numDisks - 1)) * (maxW - minW) : minW

    // Soft color grading from pure white (size 1) down to deep charcoal (max size)
    const t = numDisks > 1 ? (diskSize - 1) / (numDisks - 1) : 0
    const lightness = Math.round(96 - t * 68) // 96% -> 28%
    const background = `hsl(0, 0%, ${lightness}%)`
    const borderColor = t > 0.4 ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.4)'

    return {
      width: `${width}%`,
      background,
      borderColor,
      transform: isLifted ? 'translateY(-26px) scale(1.02)' : 'none',
      boxShadow: isLifted
        ? '0 10px 24px rgba(255, 255, 255, 0.22), 0 0 14px rgba(255, 255, 255, 0.15)'
        : '0 2px 5px rgba(0, 0, 0, 0.6)',
      zIndex: isLifted ? 20 : 10 - diskSize,
    }
  }

  return (
    <div className="toh-page">
      {/* ── Top Bar ─────────────────────────────────────────── */}
      <div className="toh-top-bar">
        <button
          id="toh-back-btn"
          className="toh-back-btn"
          onClick={handleBack}
          aria-label="Back to Briefing"
        >
          <Icon name="back" size={20} />
        </button>

        <div className="toh-header-center">
          <h1 className="toh-title">Tower of Hanoi</h1>
        </div>

        <button
          id="toh-restart-btn"
          className="toh-restart-btn"
          onClick={handleRestart}
          aria-label="Restart Puzzle"
          title="Restart"
        >
          <Icon name="restart" size={18} />
        </button>
      </div>

      <div className="toh-presets-bar" role="radiogroup" aria-label="Disk Count Selector">
        {DIFFICULTY_PRESETS.map((p) => (
          <button
            key={p.disks}
            id={`toh-preset-${p.disks}`}
            className={`toh-preset-btn${p.disks === numDisks ? ' toh-preset-btn--active' : ''}`}
            onClick={() => handlePresetChange(p.disks)}
            aria-label={`${p.disks} Disks (${p.name})`}
            aria-checked={p.disks === numDisks}
            role="radio"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* ── Status Header ───────────────────────────────────── */}
      <div className="toh-status-card">
        <div className="toh-stat-pills">
          <div className="toh-pill">
            <span className="toh-pill-label">MOVES</span>
            <span className="toh-pill-val">{moveCount}</span>
          </div>
          <div className="toh-pill">
            <span className="toh-pill-label">MINIMUM</span>
            <span className="toh-pill-val">{minMoves}</span>
          </div>
        </div>
        <p className="toh-status-tagline">
          {isSolved
            ? 'Order restored across the pillars.'
            : selectedPeg !== null
            ? 'Choose a pillar to place the disk.'
            : `Rebuild the pillar on another rod in ${minMoves} moves.`}
        </p>
      </div>

      {/* ── Play Area ───────────────────────────────────────── */}
      <div className="toh-play-area">
        <div className="toh-pillars-container">
          {[0, 1, 2].map((pegIdx) => {
            const pegStack = pegs[pegIdx]
            const isSelected = selectedPeg === pegIdx
            const isInvalid = invalidPeg === pegIdx
            const pegLabels = ['A', 'B', 'C']

            return (
              <div
                key={`peg-${pegIdx}`}
                id={`toh-peg-${pegIdx}`}
                className={`toh-peg-zone${isSelected ? ' toh-peg-zone--selected' : ''}${
                  isInvalid ? ' toh-peg-zone--invalid' : ''
                }`}
                onClick={() => handlePegClick(pegIdx)}
                role="button"
                tabIndex={0}
                aria-label={`Pillar ${pegLabels[pegIdx]}, contains ${pegStack.length} disks`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handlePegClick(pegIdx)
                  }
                }}
              >
                {/* Rod Indicator / Interactive Highlight */}
                <div className="toh-rod-track">
                  <div className={`toh-rod${isSelected ? ' toh-rod--active' : ''}`} />
                </div>

                {/* Disk Stack */}
                <div className="toh-disk-stack">
                  {pegStack.map((diskSize, idx) => {
                    const isTopDisk = idx === pegStack.length - 1
                    const isLifted = isTopDisk && isSelected
                    const style = getDiskStyle(diskSize, isLifted)

                    return (
                      <div
                        key={`disk-${diskSize}`}
                        className={`toh-disk${isLifted ? ' toh-disk--lifted' : ''}`}
                        style={style}
                        aria-label={`Disk ${diskSize}`}
                      >
                        <span className="toh-disk-shine" />
                      </div>
                    )
                  })}
                </div>

                {/* Pillar Label */}
                <div className="toh-pillar-label">{pegLabels[pegIdx]}</div>
              </div>
            )
          })}
        </div>

        {/* Base Bar */}
        <div className="toh-base-bar" />
      </div>

      {/* ── Footer ──────────────────────────────────────────── */}
      <div className="toh-footer">
        {isSolved ? (
          <button className="toh-next-btn" onClick={() => resetGame(numDisks)}>
            Play Again
          </button>
        ) : (
          <span className="toh-footer-quote">
            Never place a larger disk atop a smaller one.
          </span>
        )}
      </div>

      {/* ── Completion Toast ─────────────────────────────────── */}
      <div
        className={`toh-toast${showToast ? ' toh-toast--visible' : ''}`}
        role="status"
        aria-live="polite"
      >
        Order restored across the pillars.
      </div>
    </div>
  )
}
