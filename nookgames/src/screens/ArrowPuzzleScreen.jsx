import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { GameHeader } from '../components/GameHeader.jsx';
import { DifficultyTabs } from '../components/DifficultyTabs.jsx';
import { GameFooterActions } from '../components/GameFooterActions.jsx';
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
  const [flyingArrows, setFlyingArrows] = useState([]);
  const [recoilingArrowId, setRecoilingArrowId] = useState(null);
  const [hasWon, setHasWon] = useState(false);
  const [hoveredArrowId, setHoveredArrowId] = useState(null);

  const recoilTimeoutRef = useRef(null);
  const flightTimeoutsRef = useRef(new Map());

  useEffect(() => {
    setRemainingArrows(puzzle.arrows);
    setHistory([]);
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
    return new Set(getAvailableArrowIds(remainingArrows, puzzle.gridBounds));
  }, [remainingArrows, puzzle.gridBounds]);

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
    setFlyingArrows([]);
    setRecoilingArrowId(null);
    setHasWon(false);
  };

  const handleUndo = () => {
    if (history.length === 0 || hasWon) return;
    playTap();

    const { nextArrows, nextHistory } = undoMove(history, remainingArrows);
    setRemainingArrows(nextArrows);
    setHistory(nextHistory);

    const restoredArrow = history[history.length - 1];
    if (restoredArrow) {
      setFlyingArrows((prev) => prev.filter((f) => f.id !== restoredArrow.id));
      if (flightTimeoutsRef.current.has(restoredArrow.id)) {
        clearTimeout(flightTimeoutsRef.current.get(restoredArrow.id));
        flightTimeoutsRef.current.delete(restoredArrow.id);
      }
    }
  };

  const handleArrowClick = (arrow) => {
    if (hasWon) return;

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

    if (isWon) {
      setTimeout(() => {
        playChime();
        setHasWon(true);
        recordGameSession('arrow-puzzle', true);
      }, 350);
    }
  };

  const cellSize = 38;
  const padding = 22;
  const { rows, cols } = puzzle.gridBounds;
  const viewBoxWidth = cols * cellSize + 2 * padding;
  const viewBoxHeight = rows * cellSize + 2 * padding;

  const getCellCenter = (r, c) => ({
    x: padding + c * cellSize + cellSize / 2,
    y: padding + r * cellSize + cellSize / 2,
  });

  const getPathData = (path) => {
    if (!path || path.length === 0) return '';
    const start = getCellCenter(path[0][0], path[0][1]);
    let d = `M ${start.x} ${start.y}`;
    for (let i = 1; i < path.length; i++) {
      const pt = getCellCenter(path[i][0], path[i][1]);
      if (i === path.length - 1 && path.length >= 2) {
        const prev = getCellCenter(path[i - 1][0], path[i - 1][1]);
        const dx = Math.sign(pt.x - prev.x);
        const dy = Math.sign(pt.y - prev.y);
        d += ` L ${pt.x - dx * 3} ${pt.y - dy * 3}`;
      } else {
        d += ` L ${pt.x} ${pt.y}`;
      }
    }
    return d;
  };

  const getCanonicalHeadPoints = (center) => {
    const size = 9;
    return `${center.x},${center.y} ${center.x - size},${center.y - size * 0.55} ${center.x - size},${center.y + size * 0.55}`;
  };

  return (
    <div className="ap-page game-screen-container">
      <GameHeader title="Arrow Puzzle" onBack={handleBack} />

      <DifficultyTabs
        currentTier={difficulty}
        onSelectTier={handleDifficultyChange}
        tiers={[
          { id: 'gentle', label: 'Gentle', subtitle: '5×5' },
          { id: 'standard', label: 'Standard', subtitle: '6×6' },
          { id: 'deep', label: 'Deep', subtitle: '7×7' },
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
          <g className="ap-grid-dots">
            {Array.from({ length: rows }).map((_, r) =>
              Array.from({ length: cols }).map((__, c) => {
                const center = getCellCenter(r, c);
                return (
                  <circle
                    key={`dot-${r}-${c}`}
                    cx={center.x}
                    cy={center.y}
                    r={1.4}
                    className="ap-dot"
                  />
                );
              })
            )}
          </g>

          <g className="ap-arrows-layer">
            {remainingArrows.map((arrow) => {
              const points = arrow.points || arrow.path;
              const heading = getArrowVectorHeading(points);
              const head = points[points.length - 1];
              const center = getCellCenter(head[0], head[1]);
              const pathD = getPathData(points);
              const headPts = getCanonicalHeadPoints(center);
              const isUnblocked = availableArrowIds.has(arrow.id);
              const isRecoiling = recoilingArrowId === arrow.id;
              const isHovered = hoveredArrowId === arrow.id;

              return (
                <g
                  key={arrow.id}
                  className={`ap-arrow-group ${isUnblocked ? 'ap-arrow--unblocked' : 'ap-arrow--blocked'
                    } ${isRecoiling ? `ap-recoil-${heading.dir.toLowerCase()}` : ''} ${isHovered ? 'ap-arrow--hovered' : ''
                    }`}
                  onClick={() => handleArrowClick(arrow)}
                  onMouseEnter={() => setHoveredArrowId(arrow.id)}
                  onMouseLeave={() => setHoveredArrowId(null)}
                >
                  <path
                    d={pathD}
                    className="ap-arrow-hitbox"
                    strokeWidth={cellSize * 0.75}
                  />
                  <path d={pathD} className="ap-arrow-body" />
                  <polygon
                    points={headPts}
                    className="ap-arrow-head"
                    transform={`rotate(${heading.angle} ${center.x} ${center.y})`}
                  />
                </g>
              );
            })}
          </g>

          <g className="ap-flying-layer">
            {flyingArrows.map((arrow) => {
              const points = arrow.points || arrow.path;
              const heading = getArrowVectorHeading(points);
              const head = points[points.length - 1];
              const center = getCellCenter(head[0], head[1]);
              const pathD = getPathData(points);
              const headPts = getCanonicalHeadPoints(center);

              return (
                <g
                  key={`flying-${arrow.id}`}
                  className={`ap-arrow-group ap-arrow--flying ap-fly-${heading.dir.toLowerCase()}`}
                >
                  <path d={pathD} className="ap-arrow-body ap-arrow-body--flying" />
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
          {remainingArrows.length === 0
            ? 'All arrows have exited the labyrinth.'
            : 'Tap arrows with clear corridors to launch them.'}
        </div>
      </div>

      <GameFooterActions
        onReset={handleReset}
        onUndo={handleUndo}
        canUndo={history.length > 0 && !hasWon}
        resetLabel="Reset"
        undoLabel="Undo"
      >
        <div className="ap-counter" style={{ margin: '0 4px' }}>
          <span className="ap-counter-num">{remainingArrows.length}</span>
          <span className="ap-counter-label">left</span>
        </div>
      </GameFooterActions>

      {hasWon && (
        <div className="ap-modal-backdrop">
          <div className="ap-modal-card">
            <div className="ap-modal-icon">✓</div>
            <h2 className="ap-modal-title">Labyrinth Cleared</h2>
            <p className="ap-modal-desc">
              All {puzzle.arrows.length} entangled arrows successfully unraveled in harmonious sequence.
            </p>
            <div className="ap-modal-actions">
              <button
                type="button"
                className="ap-modal-btn-primary"
                onClick={handleNextLevel}
              >
                Next Level
              </button>
              <button
                type="button"
                className="ap-modal-btn-secondary"
                onClick={handleReset}
              >
                Replay Puzzle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ArrowPuzzleScreen;