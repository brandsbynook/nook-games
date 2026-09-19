import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { GameHeader } from '../components/GameHeader.jsx';
import { DifficultyTabs } from '../components/DifficultyTabs.jsx';
import { GameFooterActions } from '../components/GameFooterActions.jsx';
import { GameCompletionModal } from '../components/GameCompletionModal.jsx';
import { playTap, playChime } from '../utils/audio.js';
import { recordGameSession } from '../utils/storage.js';
import {
  getPuzzle,
  getPuzzleCount,
  isArrowBlocked,
  getAvailableArrowIds,
  removeArrow,
  undoMove,
  getArrowVectorHeading,
} from '../utils/arrowPuzzleLogic.js';

export function ArrowPuzzleScreen({ onBack }) {
  const [difficulty, setDifficulty] = useState('gentle');
  const [levelIndex, setLevelIndex] = useState(0);

  const puzzle = useMemo(() => getPuzzle(difficulty, levelIndex), [difficulty, levelIndex]);
  const totalLevels = useMemo(() => getPuzzleCount(difficulty), [difficulty]);

  const [remainingArrows, setRemainingArrows] = useState(() => puzzle.arrows);
  const [history, setHistory] = useState([]);
  const [snapshots, setSnapshots] = useState(() => [puzzle.arrows]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [flyingArrows, setFlyingArrows] = useState([]);
  const [recoilingArrowId, setRecoilingArrowId] = useState(null);
  const [hasWon, setHasWon] = useState(false);
  const [hoveredArrowId, setHoveredArrowId] = useState(null);

  const isInspecting = historyIndex < snapshots.length - 1;
  const displayedArrows = snapshots[historyIndex] || remainingArrows;

  const recoilTimeoutRef = useRef(null);
  const flightTimeoutsRef = useRef(new Map());

  useEffect(() => {
    setRemainingArrows(puzzle.arrows);
    setHistory([]);
    setSnapshots([puzzle.arrows]);
    setHistoryIndex(0);
    setFlyingArrows([]);
    setRecoilingArrowId(null);
    setHasWon(false);
    setHoveredArrowId(null);

    if (recoilTimeoutRef.current) clearTimeout(recoilTimeoutRef.current);
    flightTimeoutsRef.current.forEach((t) => clearTimeout(t));
    flightTimeoutsRef.current.clear();
  }, [puzzle]);

  useEffect(() => {
    return () => {
      if (recoilTimeoutRef.current) clearTimeout(recoilTimeoutRef.current);
      flightTimeoutsRef.current.forEach((t) => clearTimeout(t));
      flightTimeoutsRef.current.clear();
    };
  }, []);

  const availableArrowIds = useMemo(() => {
    return new Set(getAvailableArrowIds(displayedArrows, puzzle.gridBounds));
  }, [displayedArrows, puzzle.gridBounds]);

  const handleBack = useCallback((e) => {
    if (e) e.preventDefault();
    playTap();
    if (typeof onBack === 'function') {
      onBack();
    } else {
      window.location.hash = '';
    }
  }, [onBack]);

  const handleDifficultyChange = (newDiff) => {
    if (newDiff === difficulty) return;
    playTap();
    setDifficulty(newDiff);
    setLevelIndex(0);
  };

  const handlePrevLevel = () => {
    playTap();
    setLevelIndex((prev) => (prev > 0 ? prev - 1 : totalLevels - 1));
  };

  const handleNextLevel = () => {
    playTap();
    setLevelIndex((prev) => (prev + 1) % totalLevels);
  };

  const handleReset = () => {
    playTap();
    setRemainingArrows(puzzle.arrows);
    setHistory([]);
    setSnapshots([puzzle.arrows]);
    setHistoryIndex(0);
    setFlyingArrows([]);
    setRecoilingArrowId(null);
    setHasWon(false);
  };

  const handleUndo = () => {
    if (history.length === 0 || hasWon || isInspecting) return;
    playTap();

    const { nextArrows, nextHistory } = undoMove(history, remainingArrows);
    setRemainingArrows(nextArrows);
    setHistory(nextHistory);
    setSnapshots((prev) => {
      const next = prev.slice(0, -1);
      setHistoryIndex(next.length - 1);
      return next;
    });

    const restoredArrow = history[history.length - 1];
    if (restoredArrow) {
      setFlyingArrows((prev) => prev.filter((f) => f.id !== restoredArrow.id));
      if (flightTimeoutsRef.current.has(restoredArrow.id)) {
        clearTimeout(flightTimeoutsRef.current.get(restoredArrow.id));
        flightTimeoutsRef.current.delete(restoredArrow.id);
      }
    }
  };

  const handleStepBack = () => {
    if (historyIndex > 0) {
      playTap();
      setHistoryIndex((prev) => prev - 1);
    }
  };

  const handleStepForward = () => {
    if (historyIndex < snapshots.length - 1) {
      playTap();
      setHistoryIndex((prev) => prev + 1);
    }
  };

  const handleArrowClick = (arrow) => {
    if (hasWon || isInspecting) return;

    const blocked = isArrowBlocked(arrow.id, remainingArrows, puzzle.gridBounds);

    if (blocked) {
      playTap();
      setRecoilingArrowId(arrow.id);
      if (recoilTimeoutRef.current) clearTimeout(recoilTimeoutRef.current);
      recoilTimeoutRef.current = setTimeout(() => {
        setRecoilingArrowId(null);
      }, 350);
      return;
    }

    playTap();
    setFlyingArrows((prev) => [...prev, arrow]);

    const t = setTimeout(() => {
      setFlyingArrows((prev) => prev.filter((f) => f.id !== arrow.id));
      flightTimeoutsRef.current.delete(arrow.id);
    }, 500);
    flightTimeoutsRef.current.set(arrow.id, t);

    const { nextArrows, removedArrow, isWon } = removeArrow(
      arrow.id,
      remainingArrows,
      puzzle.gridBounds
    );

    setHistory((prev) => [...prev, removedArrow]);
    setRemainingArrows(nextArrows);
    setSnapshots((prev) => {
      const next = [...prev.slice(0, historyIndex + 1), nextArrows];
      setHistoryIndex(next.length - 1);
      return next;
    });

    if (isWon) {
      setTimeout(() => {
        playChime();
        setHasWon(true);
        recordGameSession('arrow-puzzle', true);
      }, 350);
    }
  };

  // Dynamic cell size so large grids (14×14) still fit cleanly
  const BASE_CELL = 32;
  const cellSize  = BASE_CELL;
  const padding   = 14;
  const { rows, cols } = puzzle.gridBounds;
  const viewBoxWidth   = cols * cellSize + 2 * padding;
  const viewBoxHeight  = rows * cellSize + 2 * padding;

  const getCellCenter = (r, c) => ({
    x: padding + c * cellSize + cellSize / 2,
    y: padding + r * cellSize + cellSize / 2,
  });

  // Build SVG path data from compressed waypoints.
  // Stop slightly short of the last point so the arrowhead doesn't overlap the line.
  const getPathData = (path) => {
    if (!path || path.length === 0) return '';
    const start = getCellCenter(path[0][0], path[0][1]);
    let d = `M ${start.x} ${start.y}`;
    for (let i = 1; i < path.length; i++) {
      const pt   = getCellCenter(path[i][0], path[i][1]);
      if (i === path.length - 1 && path.length >= 2) {
        const prev = getCellCenter(path[i - 1][0], path[i - 1][1]);
        const dx   = Math.sign(pt.x - prev.x);
        const dy   = Math.sign(pt.y - prev.y);
        d += ` L ${pt.x - dx * 3} ${pt.y - dy * 3}`;
      } else {
        d += ` L ${pt.x} ${pt.y}`;
      }
    }
    return d;
  };

  // Arrowhead polygon — a small, sharp triangle at the head cell
  const getHeadPoints = (center) => {
    const s = 8;
    return `${center.x},${center.y} ${center.x - s},${center.y - s * 0.5} ${center.x - s},${center.y + s * 0.5}`;
  };

  return (
    <div className="ap-page game-screen-container">
      <GameHeader title="Arrow Puzzle" onBack={handleBack} />

      <DifficultyTabs
        currentTier={difficulty}
        onSelectTier={handleDifficultyChange}
        tiers={[
          { id: 'gentle',   label: 'Gentle',   subtitle: '10×10' },
          { id: 'standard', label: 'Standard',  subtitle: '12×12' },
          { id: 'deep',     label: 'Deep',      subtitle: '14×14' },
        ]}
      />

      <div className="ap-level-bar">
        <button
          type="button"
          className="ap-level-nav-btn"
          onClick={handlePrevLevel}
          aria-label="Previous Level"
        >
          ‹
        </button>
        <div className="ap-level-info">
          <span className="ap-level-name">{puzzle.title}</span>
          <span className="ap-level-indicator">
            Level {levelIndex + 1} of {totalLevels}
          </span>
        </div>
        <button
          type="button"
          className="ap-level-nav-btn"
          onClick={handleNextLevel}
          aria-label="Next Level"
        >
          ›
        </button>
      </div>

      <div className="ap-grid-card">
        <svg
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          className="ap-svg"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* ── Static arrows layer ── */}
          <g className="ap-arrows-layer">
            {displayedArrows.map((arrow) => {
              const points     = arrow.points || arrow.path;
              const heading    = getArrowVectorHeading(points);
              const head       = points[points.length - 1];
              const center     = getCellCenter(head[0], head[1]);
              const pathD      = getPathData(points);
              const headPts    = getHeadPoints(center);
              const isUnblocked = !isInspecting && availableArrowIds.has(arrow.id);
              const isRecoiling = !isInspecting && recoilingArrowId === arrow.id;
              const isHovered   = !isInspecting && hoveredArrowId   === arrow.id;

              return (
                <g
                  key={arrow.id}
                  className={[
                    'ap-arrow-group',
                    isUnblocked ? 'ap-arrow--unblocked' : 'ap-arrow--blocked',
                    isRecoiling ? `ap-recoil-${heading.dir.toLowerCase()}` : '',
                    isHovered   ? 'ap-arrow--hovered' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => handleArrowClick(arrow)}
                  onMouseEnter={() => setHoveredArrowId(arrow.id)}
                  onMouseLeave={() => setHoveredArrowId(null)}
                >
                  {/* Wide invisible hitbox for easy touch/click */}
                  <path
                    d={pathD}
                    className="ap-arrow-hitbox"
                    strokeWidth={17}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  {/* Visible conduit line */}
                  <path
                    d={pathD}
                    className="ap-arrow-body"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  {/* Arrowhead */}
                  <polygon
                    points={headPts}
                    className="ap-arrow-head"
                    transform={`rotate(${heading.angle} ${center.x} ${center.y})`}
                  />
                </g>
              );
            })}
          </g>

          {/* ── Flying-away arrows layer ── */}
          <g className="ap-flying-layer">
            {flyingArrows.map((arrow) => {
              const points  = arrow.points || arrow.path;
              const heading = getArrowVectorHeading(points);
              const head    = points[points.length - 1];
              const center  = getCellCenter(head[0], head[1]);
              const pathD   = getPathData(points);
              const headPts = getHeadPoints(center);

              return (
                <g
                  key={`flying-${arrow.id}`}
                  className={`ap-arrow-group ap-arrow--flying ap-fly-${heading.dir.toLowerCase()}`}
                >
                  <path
                    d={pathD}
                    className="ap-arrow-body ap-arrow-body--flying"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  <polygon
                    points={headPts}
                    className="ap-arrow-head ap-arrow-head--flying"
                    transform={`rotate(${heading.angle} ${center.x} ${center.y})`}
                  />
                </g>
              );
            })}
          </g>
        </svg>

        <div className="ap-hint-bar">
          {isInspecting
            ? `Inspecting Move (${historyIndex + 1}/${snapshots.length})`
            : displayedArrows.length === 0
            ? 'All arrows have exited the labyrinth.'
            : 'Tap arrows with clear corridors to launch them.'}
        </div>
      </div>

      <GameFooterActions
        onReset={handleReset}
        onUndo={handleUndo}
        canUndo={history.length > 0 && !hasWon && !isInspecting}
        onStepBack={handleStepBack}
        onStepForward={handleStepForward}
        canStepBack={historyIndex > 0}
        canStepForward={historyIndex < snapshots.length - 1}
        stepIndicator={`${historyIndex + 1} / ${snapshots.length}`}
        isInspecting={isInspecting}
        onExitInspection={() => setHistoryIndex(snapshots.length - 1)}
        resetLabel="Reset"
        undoLabel="Undo"
      >
        <div className="ap-counter" style={{ margin: '0 4px' }}>
          <span className="ap-counter-num">{displayedArrows.length}</span>
          <span className="ap-counter-label">left</span>
        </div>
      </GameFooterActions>

      <GameCompletionModal
        isOpen={hasWon}
        title="LABYRINTH CLEARED"
        subtitle={`All ${puzzle.arrows.length} entangled arrows successfully unraveled in harmonious sequence.`}
        stats={[
          { label: 'Level', value: `${levelIndex + 1} / ${totalLevels}` },
          { label: 'Difficulty', value: difficulty.toUpperCase() },
          { label: 'Moves', value: history.length },
        ]}
        primaryAction={{
          label: 'Next Level',
          onClick: handleNextLevel,
        }}
        secondaryAction={{
          label: 'Replay Puzzle',
          onClick: handleReset,
        }}
        reviewLabel="Review Grid"
      />
    </div>
  );
}

export default ArrowPuzzleScreen;