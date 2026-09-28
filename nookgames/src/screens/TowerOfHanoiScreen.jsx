import { useState, useCallback, useEffect } from 'react';
import { GameHeader } from '../components/GameHeader.jsx';
import { DifficultyTabs } from '../components/DifficultyTabs.jsx';
import { GameFooterActions } from '../components/GameFooterActions.jsx';
import { GameCompletionModal } from '../components/GameCompletionModal.jsx';
import { Icon } from '../components/Icons';
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
  const [history, setHistory] = useState(() => [createInitialPegs(activePreset.disks, activePreset.pegs)]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedPeg, setSelectedPeg] = useState(null);
  const [isSolved, setIsSolved] = useState(false);
  const [invalidPeg, setInvalidPeg] = useState(null);

  const isInspecting = historyIndex < history.length - 1;
  const displayedPegs = history[historyIndex] || pegs;

  const resetGame = useCallback((targetTier = tier) => {
    const preset = getTierPreset(targetTier);
    const init = createInitialPegs(preset.disks, preset.pegs);
    setPegs(init);
    setHistory([init]);
    setHistoryIndex(0);
    setSelectedPeg(null);
    setIsSolved(false);
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
      window.location.hash = '#/briefing/tower-of-hanoi';
    }
  }, [onBack]);

  const handleRestart = () => {
    playTap();
    resetGame(tier);
  };

  // Peg interaction
  const handlePegClick = useCallback((pegIndex) => {
    if (isSolved || isInspecting) return;

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
      const res = executeMove(selectedPeg, pegIndex, pegs);
      setPegs(res.pegs);
      setHistory((prev) => {
        const nextHist = [...prev.slice(0, historyIndex + 1), res.pegs];
        setHistoryIndex(nextHist.length - 1);
        return nextHist;
      });
      setSelectedPeg(null);

      // Win Condition: all disks stacked on any non-origin peg
      if (checkSolved(res.pegs, activePreset.disks)) {
        setIsSolved(true);
        setTimeout(() => {
          playChime();
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
  }, [isSolved, isInspecting, selectedPeg, pegs, historyIndex, activePreset]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isSolved || isInspecting) return;
      if (e.key === 'r') {
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
  }, [isSolved, isInspecting, handlePegClick, activePreset]);

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

  const nextTierMap = {
    gentle: 'standard',
    standard: 'deep',
    deep: 'gentle',
  };

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
            <span className="toh-pill-val">{history.length - 1}</span>
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
          {displayedPegs.map((pegStack, pegIdx) => {
            const isSelected = selectedPeg === pegIdx && !isInspecting;
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
      <div className="toh-footer-controls">
        <GameFooterActions
          onReset={handleRestart}
          resetLabel="Restart"
          onStepBack={() => setHistoryIndex((prev) => Math.max(0, prev - 1))}
          onStepForward={() => setHistoryIndex((prev) => Math.min(history.length - 1, prev + 1))}
          canStepBack={historyIndex > 0}
          canStepForward={historyIndex < history.length - 1}
          stepIndicator={history.length > 1 ? `Move ${historyIndex}/${history.length - 1}` : null}
          isInspecting={isInspecting}
          onExitInspection={() => setHistoryIndex(history.length - 1)}
        />
      </div>

      {/* ── Universal Completion Modal ── */}
      <GameCompletionModal
        isOpen={isSolved}
        title="Order Restored"
        description="Every disk rests in quiet harmony on the pillar."
        icon="✓"
        stats={[
          { label: 'Tier', value: TIERS[tier]?.label || tier },
          { label: 'Moves', value: `${history.length - 1}` },
          { label: 'Optimal', value: `${activePreset.minMoves}` },
        ]}
        onNext={() => handleTierChange(nextTierMap[tier] || 'gentle')}
        nextLabel="Next Tier"
        onReplay={handleRestart}
        replayLabel="Replay"
        reviewLabel="Review Pillars"
      />
    </div>
  );
}

export default TowerOfHanoiScreen;
