import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Icon } from '../components/Icons';
import { GameHeader } from '../components/GameHeader.jsx';
import { DifficultyTabs } from '../components/DifficultyTabs.jsx';
import { GameFooterActions } from '../components/GameFooterActions.jsx';
import { GameCompletionModal } from '../components/GameCompletionModal.jsx';
import { playTap, playChime } from '../utils/audio.js';
import { recordGameSession } from '../utils/storage.js';
import {
  SLITHERLINK_PUZZLES,
  getTransformedSlitherlink,
  createEmptyEdges,
  cloneEdges,
  validateSlitherlink,
  getCellEdgeCount,
  getNextHint
} from '../utils/slitherlinkLogic.js';

export function SlitherlinkScreen({ onBack }) {
  const [difficulty, setDifficulty] = useState('intro');
  const [puzzle, setPuzzle] = useState(() => getTransformedSlitherlink(SLITHERLINK_PUZZLES.intro));

  const [edges, setEdges] = useState(() => createEmptyEdges(puzzle.size));
  const [history, setHistory] = useState(() => [createEmptyEdges(puzzle.size)]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [drawMode, setDrawMode] = useState('line'); // 'line' | 'cross'
  const [hasWon, setHasWon] = useState(false);

  const isInspecting = historyIndex < history.length - 1;

  // Safe edges memoized: guarantees dimensions always match puzzle.size
  const activeEdges = useMemo(() => {
    const current = isInspecting ? (history[historyIndex] || edges) : edges;
    if (
      current?.hEdges?.length === puzzle.size + 1 &&
      current?.vEdges?.length === puzzle.size &&
      current?.hEdges?.[0]?.length === puzzle.size &&
      current?.vEdges?.[0]?.length === puzzle.size + 1
    ) {
      return current;
    }
    return createEmptyEdges(puzzle.size);
  }, [edges, history, historyIndex, isInspecting, puzzle.size]);

  // Synchronize edges when puzzle size changes
  useEffect(() => {
    const init = createEmptyEdges(puzzle.size);
    setEdges(init);
    setHistory([init]);
    setHistoryIndex(0);
    setHasWon(false);
    setDrawMode('line');
  }, [puzzle.size]);

  // Validate current edges against clues
  const validation = useMemo(
    () => validateSlitherlink(puzzle.clues, activeEdges.hEdges, activeEdges.vEdges),
    [puzzle.clues, activeEdges]
  );

  // Check victory condition
  useEffect(() => {
    if (validation.isWin) {
      if (!hasWon) {
        setHasWon(true);
        playChime();
        recordGameSession('slitherlink', true);
      }
    } else {
      setHasWon(false);
    }
  }, [validation.isWin, hasWon]);

  // Switch difficulty safely
  const handleDifficultyChange = useCallback((nextDiff) => {
    playTap();
    const nextPuzzle = getTransformedSlitherlink(SLITHERLINK_PUZZLES[nextDiff] || SLITHERLINK_PUZZLES.intro);
    const init = createEmptyEdges(nextPuzzle.size);
    setDifficulty(nextDiff);
    setPuzzle(nextPuzzle);
    setEdges(init);
    setHistory([init]);
    setHistoryIndex(0);
    setHasWon(false);
    setDrawMode('line');
  }, []);

  // Back navigation
  const handleBack = useCallback(() => {
    playTap();
    if (onBack) {
      onBack();
    } else {
      window.location.hash = '#/briefing/slitherlink';
    }
  }, [onBack]);

  // Handle edge interaction
  const handleEdgeAction = useCallback(
    (type, r, c, isSecondary = false) => {
      if (hasWon || isInspecting) return;
      playTap();

      setEdges((prevEdges) => {
        const base = (
          prevEdges?.hEdges?.length === puzzle.size + 1 &&
          prevEdges?.vEdges?.length === puzzle.size
        ) ? prevEdges : createEmptyEdges(puzzle.size);

        const next = cloneEdges(base);
        const matrix = type === 'h' ? next.hEdges : next.vEdges;
        if (!matrix[r] || matrix[r][c] === undefined) return base;

        const current = matrix[r][c];

        if (isSecondary || drawMode === 'cross') {
          // Toggle cross
          matrix[r][c] = current === 'cross' ? 'none' : 'cross';
        } else {
          // Toggle line
          matrix[r][c] = current === 'line' ? 'none' : 'line';
        }

        setHistory((hPrev) => {
          const nextHist = [...hPrev.slice(0, historyIndex + 1), next];
          setHistoryIndex(nextHist.length - 1);
          return nextHist;
        });

        return next;
      });
    },
    [hasWon, isInspecting, drawMode, puzzle.size, historyIndex]
  );

  // Right-click / context menu to place cross
  const handleContextMenu = useCallback(
    (e, type, r, c) => {
      e.preventDefault();
      handleEdgeAction(type, r, c, true);
    },
    [handleEdgeAction]
  );

  // Reset with fresh reflection transform
  const handleReset = useCallback(() => {
    playTap();
    const newPuzzle = getTransformedSlitherlink(SLITHERLINK_PUZZLES[difficulty] || SLITHERLINK_PUZZLES.intro);
    const init = createEmptyEdges(newPuzzle.size);
    setPuzzle(newPuzzle);
    setEdges(init);
    setHistory([init]);
    setHistoryIndex(0);
    setHasWon(false);
  }, [difficulty]);

  // Hint
  const handleHint = useCallback(() => {
    if (hasWon || isInspecting) return;
    const hint = getNextHint(puzzle.clues, activeEdges, puzzle.solution);
    if (!hint) return;

    playTap();

    setEdges((prevEdges) => {
      const base = (
        prevEdges?.hEdges?.length === puzzle.size + 1 &&
        prevEdges?.vEdges?.length === puzzle.size
      ) ? prevEdges : createEmptyEdges(puzzle.size);

      const next = cloneEdges(base);
      if (hint.type === 'h') {
        if (next.hEdges[hint.r]) next.hEdges[hint.r][hint.c] = hint.target;
      } else {
        if (next.vEdges[hint.r]) next.vEdges[hint.r][hint.c] = hint.target;
      }

      setHistory((hPrev) => {
        const nextHist = [...hPrev.slice(0, historyIndex + 1), next];
        setHistoryIndex(nextHist.length - 1);
        return nextHist;
      });

      return next;
    });
  }, [hasWon, isInspecting, puzzle, activeEdges, historyIndex]);

  // Keyboard shortcut listener
  useEffect(() => {
    function handleKeyDown(e) {
      if (hasWon || isInspecting) return;
      const key = e.key.toLowerCase();

      if (key === 'x') {
        playTap();
        setDrawMode((prev) => (prev === 'line' ? 'cross' : 'line'));
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasWon, isInspecting]);

  // Geometry calculations for SVG
  const N = puzzle.size;
  const SVG_SIZE = 1000;
  const PADDING = 80;
  const CELL_STEP = (SVG_SIZE - PADDING * 2) / N;
  const DOT_RADIUS = N >= 6 ? 4.5 : 5.5;

  const difficultyLabels = {
    intro: 'Intro (4×4)',
    classic: 'Classic (5×5)',
    hard: 'Hard (6×6)',
  };

  const nextTierMap = {
    intro: 'classic',
    classic: 'hard',
    hard: 'intro',
  };

  return (
    <div className="slk-page game-screen-container">
      {/* ── Header ───────────────────────────────────────────── */}
      <GameHeader title="Slitherlink" onBack={handleBack} />

      {/* ── Difficulty Tabs ─────────────────────────────────── */}
      <DifficultyTabs
        currentTier={difficulty}
        onSelectTier={(d) => handleDifficultyChange(d)}
        tiers={[
          { id: 'intro', label: 'Intro', subtitle: '4×4' },
          { id: 'classic', label: 'Classic', subtitle: '5×5' },
          { id: 'hard', label: 'Hard', subtitle: '6×6' },
        ]}
      />

      {/* ── Status Bar ──────────────────────────────────────── */}
      <div className="slk-status-bar">
        <div className="slk-pill">
          <span className="slk-pill-label">Loop:</span>
          <span className="slk-pill-val">{validation.activeEdgeCount} segments</span>
        </div>

        <div
          className={`slk-mode-badge${
            drawMode === 'cross' ? ' slk-mode-badge--cross' : ''
          }`}
        >
          {drawMode === 'cross' ? 'Cross Mode (×)' : 'Line Draw Mode'}
        </div>
      </div>

      {/* ── Board Outer & Interactive SVG ───────────────────── */}
      <div className="slk-board-outer">
        <div className="slk-board-wrapper">
          <svg
            className="slk-svg-board"
            viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
            role="grid"
            aria-label="Slitherlink Grid Board"
          >
            {/* 1. Cell Clues & Background */}
            {puzzle.clues.map((row, r) =>
              row.map((clue, c) => {
                if (clue === null || clue === undefined) return null;
                const cx = PADDING + (c + 0.5) * CELL_STEP;
                const cy = PADDING + (r + 0.5) * CELL_STEP;
                const currentCount = getCellEdgeCount(activeEdges.hEdges, activeEdges.vEdges, r, c);
                const isSatisfied = currentCount === clue;
                const isExceeded = currentCount > clue;

                let clueClass = 'slk-clue-text slk-clue--active';
                if (isExceeded) {
                  clueClass = 'slk-clue-text slk-clue--exceeded';
                } else if (isSatisfied) {
                  clueClass = 'slk-clue-text slk-clue--satisfied';
                }

                return (
                  <text
                    key={`clue-${r}-${c}`}
                    x={cx}
                    y={cy}
                    fontSize={CELL_STEP * 0.46}
                    className={clueClass}
                  >
                    {clue}
                  </text>
                );
              })
            )}

            {/* 2. Horizontal Edges */}
            {Array.from({ length: N + 1 }).map((_, r) =>
              Array.from({ length: N }).map((_, c) => {
                const state = activeEdges.hEdges?.[r]?.[c] ?? 'none';
                const x1 = PADDING + c * CELL_STEP;
                const y1 = PADDING + r * CELL_STEP;
                const x2 = PADDING + (c + 1) * CELL_STEP;
                const y2 = y1;
                const midX = (x1 + x2) / 2;
                const midY = y1;
                const crossSize = 6.5;

                return (
                  <g key={`h-edge-${r}-${c}`}>
                    {/* Inactive guide */}
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      className="slk-edge-guide"
                    />

                    {/* Active line */}
                    {state === 'line' && (
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        className="slk-edge-line"
                      />
                    )}

                    {/* Marked cross */}
                    {state === 'cross' && (
                      <g className="slk-edge-cross">
                        <line
                          x1={midX - crossSize}
                          y1={midY - crossSize}
                          x2={midX + crossSize}
                          y2={midY + crossSize}
                        />
                        <line
                          x1={midX - crossSize}
                          y1={midY + crossSize}
                          x2={midX + crossSize}
                          y2={midY - crossSize}
                        />
                      </g>
                    )}

                    {/* Generous touch hitbox */}
                    <line
                      id={`h-edge-${r}-${c}`}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      className="slk-edge-hitbox"
                      onClick={() => handleEdgeAction('h', r, c)}
                      onContextMenu={(e) => handleContextMenu(e, 'h', r, c)}
                    />
                  </g>
                );
              })
            )}

            {/* 3. Vertical Edges */}
            {Array.from({ length: N }).map((_, r) =>
              Array.from({ length: N + 1 }).map((_, c) => {
                const state = activeEdges.vEdges?.[r]?.[c] ?? 'none';
                const x1 = PADDING + c * CELL_STEP;
                const y1 = PADDING + r * CELL_STEP;
                const x2 = x1;
                const y2 = PADDING + (r + 1) * CELL_STEP;
                const midX = x1;
                const midY = (y1 + y2) / 2;
                const crossSize = 6.5;

                return (
                  <g key={`v-edge-${r}-${c}`}>
                    {/* Inactive guide */}
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      className="slk-edge-guide"
                    />

                    {/* Active line */}
                    {state === 'line' && (
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        className="slk-edge-line"
                      />
                    )}

                    {/* Marked cross */}
                    {state === 'cross' && (
                      <g className="slk-edge-cross">
                        <line
                          x1={midX - crossSize}
                          y1={midY - crossSize}
                          x2={midX + crossSize}
                          y2={midY + crossSize}
                        />
                        <line
                          x1={midX - crossSize}
                          y1={midY + crossSize}
                          x2={midX + crossSize}
                          y2={midY - crossSize}
                        />
                      </g>
                    )}

                    {/* Generous touch hitbox */}
                    <line
                      id={`v-edge-${r}-${c}`}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      className="slk-edge-hitbox"
                      onClick={() => handleEdgeAction('v', r, c)}
                      onContextMenu={(e) => handleContextMenu(e, 'v', r, c)}
                    />
                  </g>
                );
              })
            )}

            {/* 4. Dots (Vertices) */}
            {Array.from({ length: N + 1 }).map((_, r) =>
              Array.from({ length: N + 1 }).map((_, c) => {
                const x = PADDING + c * CELL_STEP;
                const y = PADDING + r * CELL_STEP;
                const isViolation = validation.vertexViolations.has(`${r}-${c}`);

                return (
                  <circle
                    key={`dot-${r}-${c}`}
                    cx={x}
                    cy={y}
                    r={isViolation ? DOT_RADIUS * 1.3 : DOT_RADIUS}
                    className={`slk-dot${isViolation ? ' slk-dot--violation' : ''}`}
                  />
                );
              })
            )}
          </svg>
        </div>
      </div>

      {/* ── Footer Controls & Toolbar ───────────────────────── */}
      <div className="slk-controls">
        <GameFooterActions
          onReset={handleReset}
          onHint={handleHint}
          canHint={!hasWon && !isInspecting}
          resetLabel="Reset"
          hintLabel="Hint"
          onStepBack={() => setHistoryIndex((prev) => Math.max(0, prev - 1))}
          onStepForward={() => setHistoryIndex((prev) => Math.min(history.length - 1, prev + 1))}
          canStepBack={historyIndex > 0}
          canStepForward={historyIndex < history.length - 1}
          stepIndicator={history.length > 1 ? `Move ${historyIndex}/${history.length - 1}` : null}
          isInspecting={isInspecting}
          onExitInspection={() => setHistoryIndex(history.length - 1)}
        >
          <button
            id="slk-mode-btn"
            type="button"
            className={`game-action-btn${
              drawMode === 'cross' ? ' game-action-btn--active' : ''
            }`}
            onClick={() => {
              playTap();
              setDrawMode((prev) => (prev === 'line' ? 'cross' : 'line'));
            }}
            aria-label="Toggle Draw vs Cross Mode"
            disabled={isInspecting || hasWon}
          >
            <Icon name="pencil" size={16} />
            <span>{drawMode === 'line' ? 'Draw Line' : 'Mark (×)'}</span>
          </button>
        </GameFooterActions>
      </div>

      {/* ── Universal Completion Modal ── */}
      <GameCompletionModal
        isOpen={hasWon}
        title="Loop in Harmony"
        description="The single unbroken loop closes in perfect equilibrium. All clues verified."
        icon="❖"
        stats={[
          { label: 'Tier', value: difficultyLabels[difficulty] || difficulty },
          { label: 'Segments', value: `${validation.activeEdgeCount}` },
          { label: 'Moves', value: `${history.length - 1}` },
        ]}
        onNext={() => handleDifficultyChange(nextTierMap[difficulty] || 'intro')}
        nextLabel="Next Tier"
        onReplay={handleReset}
        replayLabel="Replay"
        reviewLabel="Review Loop"
      />
    </div>
  );
}

export default SlitherlinkScreen;
