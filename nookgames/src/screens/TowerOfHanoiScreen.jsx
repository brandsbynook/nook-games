import { useState, useCallback, useEffect } from 'react';
import { GameHeader } from '../components/GameHeader.jsx';
import { DifficultyTabs } from '../components/DifficultyTabs.jsx';
import { GameFooterActions } from '../components/GameFooterActions.jsx';
import { Icon } from '../icons.jsx';
import { playTap, playChime } from '../utils/audio.js';
import { recordGameSession } from '../utils/storage.js';
import {
  TIERS,
  getTierPreset,
  createInitialPegs,
  isValidMove,
  executeMove,
  isSolved as checkSolved,
} from '../utils/towerOfHanoiLogic.js';

export function TowerOfHanoiScreen({ onBack }) {
  const [tier, setTier] = useState('gentle');
  const activePreset = getTierPreset(tier);

  const [pegs, setPegs] = useState(() => createInitialPegs(activePreset.disks, activePreset.pegs));
  const [selectedPeg, setSelectedPeg] = useState(null);
  const [moveCount, setMoveCount] = useState(0);
  const [history, setHistory] = useState([]);
  const [isSolved, setIsSolved] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [invalidPeg, setInvalidPeg] = useState(null);

  const resetGame = useCallback((targetTier = tier) => {
    const preset = getTierPreset(targetTier);
    setPegs(createInitialPegs(preset.disks, preset.pegs));
    setSelectedPeg(null);
    setMoveCount(0);
    setHistory([]);
    setIsSolved(false);
    setShowToast(false);
    setInvalidPeg(null);
  }, [tier]);

  // Handle tier switch
  const handleTierChange = (newTier) => {
    if (newTier === tier) return;
    playTap();
    setTier(newTier);
    resetGame(newTier);
  };

  const handleBack = useCallback((e) => {
    if (e) e.preventDefault();
    playTap();
    if (typeof onBack === 'function') {
      onBack();
    } else {
      window.location.hash = '';
    }
  }, [onBack]);

  const handleRestart = () => {
    playTap();
    resetGame(tier);
  };

  const handleUndo = useCallback(() => {
    if (history.length === 0 || isSolved) return;
    playTap();
    const prevPegs = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setPegs(prevPegs);
    setSelectedPeg(null);
    setMoveCount((prev) => Math.max(0, prev - 1));
  }, [history, isSolved]);

  // Peg interaction
  const handlePegClick = useCallback((pegIndex) => {
    if (isSolved) return;

    // Case 1: No peg selected yet -> Lift top disk if peg not empty
    if (selectedPeg === null) {
      if (!pegs[pegIndex] || pegs[pegIndex].length === 0) return;
      playTap();
      setSelectedPeg(pegIndex);
      return;
    }

    // Case 2: Tap the same peg -> Deselect / drop disk back down
    if (selectedPeg === pegIndex) {
      playTap();
      setSelectedPeg(null);
      return;
    }

    // Case 3: Target peg selected -> Attempt move
    if (isValidMove(selectedPeg, pegIndex, pegs)) {
      playTap();
      setHistory((prev) => [...prev, pegs]);
      const res = executeMove(selectedPeg, pegIndex, pegs);
      setPegs(res.pegs);
      setSelectedPeg(null);
      const nextMoves = moveCount + 1;
      setMoveCount(nextMoves);

      // Win Condition: all disks stacked on any non-origin peg
      if (checkSolved(res.pegs, activePreset.disks)) {
        setIsSolved(true);
        setTimeout(() => {
          playChime();
          setShowToast(true);
          recordGameSession('tower-of-hanoi', true);
        }, 300);
      }
    } else {
      // Invalid move: gentle visual feedback
      setInvalidPeg(pegIndex);
      setTimeout(() => {
        setInvalidPeg(null);
      }, 400);
    }
  }, [isSolved, selectedPeg, pegs, moveCount, activePreset]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isSolved) return;
      if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleUndo();
      } else if (e.key === 'r') {
        e.preventDefault();
        handleRestart();
      } else if (['1', '2', '3', '4'].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        if (idx < activePreset.pegs) {
          e.preventDefault();
          handlePegClick(idx);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSolved, handleUndo, handlePegClick, activePreset]);

  // Disk visual attributes
  const getDiskStyle = (diskSize, isLifted) => {
    const numDisks = activePreset.disks;
    const minW = activePreset.pegs === 4 ? 30 : 36;
    const maxW = activePreset.pegs === 4 ? 94 : 98;
    const width = numDisks > 1 ? minW + ((diskSize - 1) / (numDisks - 1)) * (maxW - minW) : minW;

    const t = numDisks > 1 ? (diskSize - 1) / (numDisks - 1) : 0;
    const lightness = Math.round(96 - t * 68); // 96% -> 28%
    const background = `hsl(0, 0%, ${lightness}%)`;
    const borderColor = t > 0.4 ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.4)';

    return {
      width: `${width}%`,
      background,
      borderColor,
      transform: isLifted ? 'translateY(-26px) scale(1.02)' : 'none',
      boxShadow: isLifted
        ? '0 10px 24px rgba(255, 255, 255, 0.22), 0 0 14px rgba(255, 255, 255, 0.15)'
        : '0 2px 5px rgba(0, 0, 0, 0.6)',
      zIndex: isLifted ? 20 : 10 - diskSize,
    };
  };

  const pegLabels = ['A', 'B', 'C', 'D'].slice(0, activePreset.pegs);

  return (
    <div className="toh-page game-screen-container">
      <GameHeader title="Tower of Hanoi" onBack={handleBack} />

      <DifficultyTabs
        currentTier={tier}
        onSelectTier={handleTierChange}
        tiers={[
          { id: 'gentle', label: 'Gentle', subtitle: TIERS.gentle.subtitle },
          { id: 'standard', label: 'Standard', subtitle: TIERS.standard.subtitle },
          { id: 'deep', label: 'Deep', subtitle: TIERS.deep.subtitle },
        ]}
      />

      {/* ── Status Header ───────────────────────────────────── */}
      <div className="toh-status-card">
        <div className="toh-stat-pills">
          <div className="toh-pill">
            <span className="toh-pill-label">MOVES</span>
            <span className="toh-pill-val">{moveCount}</span>
          </div>
          <div className="toh-pill">
            <span className="toh-pill-label">MINIMUM</span>
            <span className="toh-pill-val">{activePreset.minMoves}</span>
          </div>
        </div>
        <p className="toh-status-tagline">
          {isSolved
            ? 'Order restored across the pillars.'
            : selectedPeg !== null
              ? 'Choose a target pillar to place the disk.'
              : `Transfer the stack to any other rod in ${activePreset.minMoves} moves.`}
        </p>
      </div>

      {/* ── Play Area ───────────────────────────────────────── */}
      <div className="toh-play-area">
        <div
          className="toh-pillars-container"
          style={{
            gridTemplateColumns: `repeat(${activePreset.pegs}, 1fr)`,
          }}
        >
          {pegs.map((pegStack, pegIdx) => {
            const isSelected = selectedPeg === pegIdx;
            const isInvalid = invalidPeg === pegIdx;

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
                    e.preventDefault();
                    handlePegClick(pegIdx);
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
                    const isTopDisk = idx === pegStack.length - 1;
                    const isLifted = isTopDisk && isSelected;
                    const style = getDiskStyle(diskSize, isLifted);

                    return (
                      <div
                        key={`disk-${diskSize}`}
                        className={`toh-disk${isLifted ? ' toh-disk--lifted' : ''}`}
                        style={style}
                        aria-label={`Disk ${diskSize}`}
                      >
                        <span className="toh-disk-shine" />
                      </div>
                    );
                  })}
                </div>

                {/* Pillar Label */}
                <div className="toh-pillar-label">{pegLabels[pegIdx]}</div>
              </div>
            );
          })}
        </div>

        {/* Base Bar */}
        <div className="toh-base-bar" />
      </div>

      {/* ── Action Controls & Footer ──────────────────────────── */}
      <GameFooterActions
        onReset={handleRestart}
        resetLabel="Restart"
        onUndo={history.length > 0 && !isSolved ? handleUndo : undefined}
        undoLabel="Undo"
      >
        {isSolved ? (
          <button
            type="button"
            className="game-action-btn game-action-btn--primary"
            onClick={() => {
              const nextTier =
                tier === 'gentle' ? 'standard' : tier === 'standard' ? 'deep' : 'gentle';
              handleTierChange(nextTier);
            }}
          >
            <Icon name="arrow-right" size={16} />
            <span>Next Tier</span>
          </button>
        ) : null}
      </GameFooterActions>

      {/* ── Completion Toast ─────────────────────────────────── */}
      <div
        className={`toh-toast${showToast ? ' toh-toast--visible' : ''}`}
        role="status"
        aria-live="polite"
      >
        Order restored across the pillars.
      </div>
    </div>
  );
}

export default TowerOfHanoiScreen;
