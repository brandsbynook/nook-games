import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Icon } from '../icons.jsx';
import { playTap, playChime } from '../utils/audio.js';
import {
  KAKURO_PUZZLES,
  cloneGrid,
  validateRuns,
  checkWin,
  getNextHint
} from '../utils/kakuroLogic.js';

export function KakuroScreen({ onBack }) {
  const [difficulty, setDifficulty] = useState('intro');
  const puzzle = useMemo(() => KAKURO_PUZZLES[difficulty] || KAKURO_PUZZLES.intro, [difficulty]);

  const [grid, setGrid] = useState(() => cloneGrid(puzzle.grid));
  const [history, setHistory] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null); // { r, c }
  const [pencilMode, setPencilMode] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  // Validate runs whenever grid changes
  const validation = useMemo(() => validateRuns(grid), [grid]);

  // Reset state when difficulty changes
  useEffect(() => {
    setGrid(cloneGrid(puzzle.grid));
    setHistory([]);
    setSelectedCell(null);
    setHasWon(false);
    setPencilMode(false);
  }, [puzzle]);

  // Check victory condition
  useEffect(() => {
    if (checkWin(grid)) {
      setHasWon(true);
      playChime();
    } else {
      setHasWon(false);
    }
  }, [grid]);

  // Navigation back
  const handleBack = useCallback(() => {
    playTap();
    if (onBack) {
      onBack();
    } else {
      window.location.hash = '#/briefing/kakuro';
    }
  }, [onBack]);

  // Cell selection
  const handleSelectCell = useCallback((r, c) => {
    if (hasWon) return;
    const cell = grid[r][c];
    if (cell.type !== 'white') return;
    playTap();
    setSelectedCell({ r, c });
  }, [grid, hasWon]);

  // Number input
  const handleNumberInput = useCallback((num) => {
    if (!selectedCell || hasWon) return;
    const { r, c } = selectedCell;
    const cell = grid[r][c];
    if (cell.type !== 'white') return;

    playTap();
    setHistory((prev) => [...prev, cloneGrid(grid)]);

    setGrid((prevGrid) => {
      const nextGrid = cloneGrid(prevGrid);
      const target = nextGrid[r][c];

      if (pencilMode) {
        // Toggle note
        const currentNotes = new Set(target.notes || []);
        if (currentNotes.has(num)) {
          currentNotes.delete(num);
        } else {
          currentNotes.add(num);
        }
        target.notes = Array.from(currentNotes).sort((a, b) => a - b);
      } else {
        // Normal digit placement or toggle off
        target.val = target.val === num ? null : num;
        if (target.val !== null) {
          target.notes = [];
        }
      }

      return nextGrid;
    });
  }, [selectedCell, hasWon, grid, pencilMode]);

  // Erase/Clear active cell
  const handleClear = useCallback(() => {
    if (!selectedCell || hasWon) return;
    const { r, c } = selectedCell;
    const cell = grid[r][c];
    if (cell.type !== 'white' || (cell.val === null && (!cell.notes || cell.notes.length === 0))) return;

    playTap();
    setHistory((prev) => [...prev, cloneGrid(grid)]);

    setGrid((prevGrid) => {
      const nextGrid = cloneGrid(prevGrid);
      nextGrid[r][c].val = null;
      nextGrid[r][c].notes = [];
      return nextGrid;
    });
  }, [selectedCell, hasWon, grid]);

  // Undo
  const handleUndo = useCallback(() => {
    if (history.length === 0 || hasWon) return;
    playTap();
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, prev.length - 1));
    setGrid(previous);
  }, [history, hasWon]);

  // Reset
  const handleReset = useCallback(() => {
    playTap();
    setGrid(cloneGrid(puzzle.grid));
    setHistory([]);
    setSelectedCell(null);
    setHasWon(false);
  }, [puzzle.grid]);

  // Hint
  const handleHint = useCallback(() => {
    if (hasWon) return;
    const hint = getNextHint(grid);
    if (!hint) return;

    playTap();
    setHistory((prev) => [...prev, cloneGrid(grid)]);

    setGrid((prevGrid) => {
      const nextGrid = cloneGrid(prevGrid);
      nextGrid[hint.r][hint.c].val = hint.val;
      nextGrid[hint.r][hint.c].notes = [];
      return nextGrid;
    });
    setSelectedCell({ r: hint.r, c: hint.c });
  }, [hasWon, grid]);

  // Keyboard navigation & inputs
  useEffect(() => {
    function handleKeyDown(e) {
      if (hasWon) return;
      const key = e.key;

      if (key >= '1' && key <= '9') {
        handleNumberInput(parseInt(key, 10));
      } else if (key === 'Backspace' || key === 'Delete' || key === '0') {
        handleClear();
      } else if (key.toLowerCase() === 'p' || key.toLowerCase() === 'n') {
        playTap();
        setPencilMode((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
        e.preventDefault();
        const R = puzzle.size;
        const C = puzzle.size;
        let startR = selectedCell ? selectedCell.r : 0;
        let startC = selectedCell ? selectedCell.c : 0;
        const delta = {
          ArrowUp: [-1, 0],
          ArrowDown: [1, 0],
          ArrowLeft: [0, -1],
          ArrowRight: [0, 1]
        }[key];

        let currR = startR + delta[0];
        let currC = startC + delta[1];
        while (currR >= 0 && currR < R && currC >= 0 && currC < C) {
          if (grid[currR][currC].type === 'white') {
            setSelectedCell({ r: currR, c: currC });
            playTap();
            break;
          }
          currR += delta[0];
          currC += delta[1];
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNumberInput, handleClear, handleUndo, hasWon, selectedCell, puzzle.size, grid]);

  return (
    <div className="kkr-page">
      {/* ── Header ───────────────────────────────────────────── */}
      <header className="kkr-header">
        <button
          id="kkr-back-btn"
          type="button"
          className="kkr-btn-back"
          onClick={handleBack}
          aria-label="Back to Briefing"
        >
          <Icon name="back" size={14} />
          <span>Briefing</span>
        </button>

        <h1 className="kkr-title">KAKURO</h1>

        <button
          id="kkr-reset-btn"
          type="button"
          className="kkr-btn-icon"
          onClick={handleReset}
          aria-label="Reset Board"
        >
          <Icon name="refresh" size={16} />
        </button>
      </header>

      {/* ── Difficulty Tabs ─────────────────────────────────── */}
      <div className="kkr-tabs-container">
        {[
          { id: 'intro', label: 'Intro (4×4)' },
          { id: 'classic', label: 'Classic (6×6)' },
          { id: 'expert', label: 'Expert (8×8)' }
        ].map((tab) => (
          <button
            key={tab.id}
            id={`kkr-tab-${tab.id}`}
            type="button"
            className={`kkr-tab-btn${difficulty === tab.id ? ' kkr-tab-btn--active' : ''}`}
            onClick={() => {
              playTap();
              setDifficulty(tab.id);
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Status Bar ──────────────────────────────────────── */}
      <div className="kkr-status-bar">
        <div className="kkr-pill">
          <span className="kkr-pill-label">Runs:</span>
          <span className="kkr-pill-val">
            {validation.completedRuns} / {validation.totalRuns}
          </span>
        </div>

        <div className={`kkr-mode-badge${pencilMode ? ' kkr-mode-badge--pencil' : ''}`}>
          {pencilMode ? 'Pencil Mode' : 'Direct Fill'}
        </div>
      </div>

      {/* ── Grid Board ──────────────────────────────────────── */}
      <div className="kkr-board-outer">
        <div
          className="kkr-board-grid"
          style={{ '--kkr-grid-size': puzzle.size }}
          role="grid"
          aria-label="Kakuro Board"
        >
          {grid.map((row, r) =>
            row.map((cell, c) => {
              if (cell.type === 'block') {
                const hasClues = cell.across != null || cell.down != null;
                return (
                  <div
                    key={`cell-${r}-${c}`}
                    className={`kkr-cell-block${hasClues ? ' kkr-cell-clue' : ''}`}
                    aria-hidden="true"
                  >
                    {cell.down != null && (
                      <span className="kkr-clue-text kkr-clue-down" aria-label={`Down ${cell.down}`}>
                        {cell.down}
                      </span>
                    )}
                    {cell.across != null && (
                      <span className="kkr-clue-text kkr-clue-across" aria-label={`Across ${cell.across}`}>
                        {cell.across}
                      </span>
                    )}
                  </div>
                );
              }

              // White playable cell
              const isSelected = selectedCell?.r === r && selectedCell?.c === c;
              const isError = validation.errorCells.has(cell.id);
              const cellNotes = cell.notes || [];

              return (
                <div
                  key={`cell-${r}-${c}`}
                  id={`cell-${r}-${c}`}
                  role="gridcell"
                  tabIndex={0}
                  className={`kkr-cell-white${isSelected ? ' kkr-cell--selected' : ''}${
                    isError ? ' kkr-cell--error' : ''
                  }`}
                  onClick={() => handleSelectCell(r, c)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleSelectCell(r, c);
                    }
                  }}
                  aria-selected={isSelected}
                  aria-label={`Row ${r + 1} Col ${c + 1}, ${
                    cell.val != null ? `Value ${cell.val}` : 'Empty'
                  }${isError ? ', invalid' : ''}`}
                >
                  {cell.val != null ? (
                    <span className="kkr-cell-digit">{cell.val}</span>
                  ) : cellNotes.length > 0 ? (
                    <div className="kkr-notes-grid" aria-hidden="true">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                        <span key={`note-${n}`} className="kkr-note-digit">
                          {cellNotes.includes(n) ? n : ''}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Keypad & Controls ───────────────────────────────── */}
      <div className="kkr-controls">
        <div className="kkr-keypad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={`key-${num}`}
              id={`kkr-key-${num}`}
              type="button"
              className="kkr-key"
              onClick={() => handleNumberInput(num)}
              aria-label={`Digit ${num}`}
            >
              {num}
            </button>
          ))}
          <button
            id="kkr-key-clear"
            type="button"
            className="kkr-key kkr-key-action"
            onClick={handleClear}
            aria-label="Clear cell"
          >
            ⌫
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="kkr-toolbar">
          <button
            id="kkr-undo-btn"
            type="button"
            className="kkr-action-btn"
            onClick={handleUndo}
            disabled={history.length === 0 || hasWon}
            aria-label="Undo"
          >
            <Icon name="undo" size={14} />
            <span>Undo</span>
          </button>

          <button
            id="kkr-pencil-btn"
            type="button"
            className={`kkr-action-btn${pencilMode ? ' kkr-action-btn--active' : ''}`}
            onClick={() => {
              playTap();
              setPencilMode((prev) => !prev);
            }}
            aria-label="Toggle Pencil Mode"
          >
            <Icon name="pencil" size={14} />
            <span>{pencilMode ? 'Notes On' : 'Notes Off'}</span>
          </button>

          <button
            id="kkr-hint-btn"
            type="button"
            className="kkr-action-btn"
            onClick={handleHint}
            disabled={hasWon}
            aria-label="Hint"
          >
            <Icon name="info" size={14} />
            <span>Hint</span>
          </button>
        </div>
      </div>

      {/* ── Calm Victory Modal ───────────────────────────────── */}
      {hasWon && (
        <div className="kkr-modal-backdrop" role="dialog" aria-modal="true">
          <div className="kkr-modal-card">
            <div className="kkr-modal-icon">✦</div>
            <h2 className="kkr-modal-title">Sums in Harmony</h2>
            <p className="kkr-modal-desc">
              All cross-sums balanced without repetition. The sanctuary rests in equilibrium.
            </p>
            <div className="kkr-modal-actions">
              {difficulty === 'intro' && (
                <button
                  id="kkr-next-level-btn"
                  type="button"
                  className="kkr-modal-btn-primary"
                  onClick={() => {
                    playTap();
                    setDifficulty('classic');
                  }}
                >
                  Advance to Classic (6×6)
                </button>
              )}
              {difficulty === 'classic' && (
                <button
                  id="kkr-next-level-btn"
                  type="button"
                  className="kkr-modal-btn-primary"
                  onClick={() => {
                    playTap();
                    setDifficulty('expert');
                  }}
                >
                  Advance to Expert (8×8)
                </button>
              )}
              <button
                type="button"
                className="kkr-modal-btn-secondary"
                onClick={handleReset}
              >
                Replay Board
              </button>
              <button
                type="button"
                className="kkr-modal-btn-tertiary"
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

export default KakuroScreen;
