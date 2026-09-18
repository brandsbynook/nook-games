import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Icon } from '../icons.jsx';
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
  const [history, setHistory] = useState([]);
  const [drawMode, setDrawMode] = useState('line'); // 'line' | 'cross'
  const [hasWon, setHasWon] = useState(false);

  // Safe edges memoized: guarantees dimensions always match puzzle.size
  const activeEdges = useMemo(() => {
    if (
      edges?.hEdges?.length === puzzle.size + 1 &&
      edges?.vEdges?.length === puzzle.size &&
      edges?.hEdges?.[0]?.length === puzzle.size &&
      edges?.vEdges?.[0]?.length === puzzle.size + 1
    ) {
      return edges;
    }
    return createEmptyEdges(puzzle.size);
  }, [edges, puzzle.size]);

  // Synchronize edges when puzzle size changes
  useEffect(() => {
    setEdges(createEmptyEdges(puzzle.size));
    setHistory([]);
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
    setDifficulty(nextDiff);
    setPuzzle(nextPuzzle);
    setEdges(createEmptyEdges(nextPuzzle.size));
    setHistory([]);
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
      if (hasWon) return;
      playTap();

      setHistory((prev) => [...prev, cloneEdges(activeEdges)]);

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

        return next;
      });
    },
    [hasWon, activeEdges, drawMode, puzzle.size]
  );

  // Right-click / context menu to place cross
  const handleContextMenu = useCallback(
    (e, type, r, c) => {
      e.preventDefault();
      handleEdgeAction(type, r, c, true);
    },
    [handleEdgeAction]
  );

  // Undo
  const handleUndo = useCallback(() => {
    if (history.length === 0 || hasWon) return;
    playTap();
    const prev = history[history.length - 1];
    setHistory((prevHist) => prevHist.slice(0, prevHist.length - 1));
    setEdges(prev);
  }, [history, hasWon]);


  // Reset with fresh reflection transform
  const handleReset = useCallback(() => {
    playTap();
    const newPuzzle = getTransformedSlitherlink(SLITHERLINK_PUZZLES[difficulty] || SLITHERLINK_PUZZLES.intro);
    setPuzzle(newPuzzle);
    setEdges(createEmptyEdges(newPuzzle.size));
    setHistory([]);
    setHasWon(false);
  }, [difficulty]);

  // Hint
  const handleHint = useCallback(() => {
    if (hasWon) return;
    const hint = getNextHint(puzzle.clues, activeEdges, puzzle.solution);
    if (!hint) return;

    playTap();
    setHistory((prev) => [...prev, cloneEdges(activeEdges)]);

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
      return next;
    });
  }, [hasWon, puzzle, activeEdges]);

  // Keyboard shortcut listener
  useEffect(() => {
    function handleKeyDown(e) {
      if (hasWon) return;
      const key = e.key.toLowerCase();

      if (key === 'x') {
        playTap();
        setDrawMode((prev) => (prev === 'line' ? 'cross' : 'line'));
      } else if ((e.ctrlKey || e.metaKey) && key === 'z') {
        e.preventDefault();
        handleUndo();
      } else if (key === 'r' && !e.ctrlKey && !e.metaKey) {
        handleReset();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasWon, handleUndo, handleReset]);

  // Geometry calculations for SVG
  const N = puzzle.size;
  const SVG_SIZE = 1000;
  const PADDING = 80;
  const CELL_STEP = (SVG_SIZE - PADDING * 2) / N;
  const DOT_RADIUS = N >= 6 ? 4.5 : 5.5;

  return (
    <div className="slk-page">
      {/* ── Header ───────────────────────────────────────────── */}
      <header className="slk-header">
        <button
          id="slk-back-btn"
          type="button"
          className="slk-btn-back"
          onClick={handleBack}
          aria-label="Back to Briefing"
        >
          <Icon name="back" size={14} />
          <span>Briefing</span>
        </button>

        <h1 className="slk-title">Slitherlink</h1>

        <button
          id="slk-reset-btn"
          type="button"
          className="slk-btn-icon"
          onClick={handleReset}
          aria-label="Reset Board"
        >
          <Icon name="refresh" size={16} />
        </button>
      </header>

      {/* ── Difficulty Tabs ─────────────────────────────────── */}
      <div className="slk-tabs-container">
        {[
          { id: 'intro', label: 'Intro (4×4)' },
          { id: 'classic', label: 'Classic (5×5)' },
          { id: 'hard', label: 'Hard (6×6)' }
        ].map((tab) => (
          <button
            key={tab.id}
            id={`slk-tab-${tab.id}`}
            type="button"
            className={`slk-tab-btn${difficulty === tab.id ? ' slk-tab-btn--active' : ''}`}
            onClick={() => handleDifficultyChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

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
        <div className="slk-toolbar">
          <button
            id="slk-undo-btn"
            type="button"
            className="slk-action-btn"
            onClick={handleUndo}
            disabled={history.length === 0 || hasWon}
            aria-label="Undo"
          >
            <Icon name="undo" size={14} />
            <span>Undo</span>
          </button>

          <button
            id="slk-mode-btn"
            type="button"
            className={`slk-action-btn${
              drawMode === 'cross'
                ? ' slk-action-btn--cross-active'
                : ' slk-action-btn--active'
            }`}
            onClick={() => {
              playTap();
              setDrawMode((prev) => (prev === 'line' ? 'cross' : 'line'));
            }}
            aria-label="Toggle Draw vs Cross Mode"
          >
            <Icon name="pencil" size={14} />
            <span>{drawMode === 'line' ? 'Draw Line' : 'Mark (×)'}</span>
          </button>

          <button
            id="slk-hint-btn"
            type="button"
            className="slk-action-btn"
            onClick={handleHint}
            disabled={hasWon}
            aria-label="Get Hint"
          >
            <Icon name="info" size={14} />
            <span>Hint</span>
          </button>
        </div>

        <div className="slk-help-hint">
          Tip: Tap to place edge. Press 'X' or toggle button to switch to cross mode. Right-click to cross.
        </div>
      </div>

      {/* ── Calm Victory Modal ───────────────────────────────── */}
      {hasWon && (
        <div className="slk-modal-backdrop" role="dialog" aria-modal="true">
          <div className="slk-modal-card">
            <div className="slk-modal-icon">❖</div>
            <h2 className="slk-modal-title">Loop in Harmony</h2>
            <p className="slk-modal-desc">
              The single unbroken loop closes in perfect equilibrium. All clues verified.
            </p>
            <div className="slk-modal-actions">
              {difficulty === 'intro' && (
                <button
                  id="slk-next-level-btn"
                  type="button"
                  className="slk-modal-btn-primary"
                  onClick={() => handleDifficultyChange('classic')}
                >
                  Advance to Classic (5×5)
                </button>
              )}
              {difficulty === 'classic' && (
                <button
                  id="slk-next-level-btn"
                  type="button"
                  className="slk-modal-btn-primary"
                  onClick={() => handleDifficultyChange('hard')}
                >
                  Advance to Hard (6×6)
                </button>
              )}
              <button
                type="button"
                className="slk-modal-btn-secondary"
                onClick={handleReset}
              >
                Replay Board
              </button>
              <button
                type="button"
                className="slk-modal-btn-tertiary"
                onClick={handleBack}
              >
                Return to Briefing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SlitherlinkScreen;
