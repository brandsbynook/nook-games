import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Icon } from '../components/Icons';
import { GameHeader } from '../components/GameHeader.jsx';
import { DifficultyTabs } from '../components/DifficultyTabs.jsx';
import { GameFooterActions } from '../components/GameFooterActions.jsx';
import { GameCompletionModal } from '../components/GameCompletionModal.jsx';
import { playTap, playChime } from '../utils/audio.js';
import { recordGameSession } from '../utils/storage.js';
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
  const [history, setHistory] = useState(() => [cloneGrid(puzzle.grid)]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedCell, setSelectedCell] = useState(null); // { r, c }
  const [pencilMode, setPencilMode] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  const isInspecting = historyIndex < history.length - 1;
  const displayedGrid = history[historyIndex] || grid;

  // Validate runs whenever displayedGrid changes
  const validation = useMemo(() => validateRuns(displayedGrid), [displayedGrid]);

  // Reset state when difficulty changes
  useEffect(() => {
    const init = cloneGrid(puzzle.grid);
    setGrid(init);
    setHistory([init]);
    setHistoryIndex(0);
    setSelectedCell(null);
    setHasWon(false);
    setPencilMode(false);
  }, [puzzle]);

  // Check victory condition
  useEffect(() => {
    if (checkWin(grid)) {
      if (!hasWon) {
        setHasWon(true);
        playChime();
        recordGameSession('kakuro', true);
      }
    } else {
      setHasWon(false);
    }
  }, [grid, hasWon]);

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
    if (hasWon || isInspecting) return;
    const cell = grid[r][c];
    if (cell.type !== 'white') return;
    playTap();
    setSelectedCell({ r, c });
  }, [grid, hasWon, isInspecting]);

  // Number input
  const handleNumberInput = useCallback((num) => {
    if (!selectedCell || hasWon || isInspecting) return;
    const { r, c } = selectedCell;
    const cell = grid[r][c];
    if (cell.type !== 'white') return;

    playTap();

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

      setHistory((prev) => {
        const nextHist = [...prev.slice(0, historyIndex + 1), nextGrid];
        setHistoryIndex(nextHist.length - 1);
        return nextHist;
      });

      return nextGrid;
    });
  }, [selectedCell, hasWon, isInspecting, grid, pencilMode, historyIndex]);

  // Erase/Clear active cell
  const handleClear = useCallback(() => {
    if (!selectedCell || hasWon || isInspecting) return;
    const { r, c } = selectedCell;
    const cell = grid[r][c];
    if (cell.type !== 'white' || (cell.val === null && (!cell.notes || cell.notes.length === 0))) return;

    playTap();

    setGrid((prevGrid) => {
      const nextGrid = cloneGrid(prevGrid);
      nextGrid[r][c].val = null;
      nextGrid[r][c].notes = [];

      setHistory((prev) => {
        const nextHist = [...prev.slice(0, historyIndex + 1), nextGrid];
        setHistoryIndex(nextHist.length - 1);
        return nextHist;
      });

      return nextGrid;
    });
  }, [selectedCell, hasWon, isInspecting, grid, historyIndex]);

  // Reset
  const handleReset = useCallback(() => {
    playTap();
    const init = cloneGrid(puzzle.grid);
    setGrid(init);
    setHistory([init]);
    setHistoryIndex(0);
    setSelectedCell(null);
    setHasWon(false);
  }, [puzzle.grid]);

  // Hint
  const handleHint = useCallback(() => {
    if (hasWon || isInspecting) return;
    const hint = getNextHint(grid);
    if (!hint) return;

    playTap();

    setGrid((prevGrid) => {
      const nextGrid = cloneGrid(prevGrid);
      nextGrid[hint.r][hint.c].val = hint.val;
      nextGrid[hint.r][hint.c].notes = [];

      setHistory((prev) => {
        const nextHist = [...prev.slice(0, historyIndex + 1), nextGrid];
        setHistoryIndex(nextHist.length - 1);
        return nextHist;
      });

      return nextGrid;
    });
    setSelectedCell({ r: hint.r, c: hint.c });
  }, [hasWon, isInspecting, grid, historyIndex]);

  // Keyboard navigation & inputs
  useEffect(() => {
    function handleKeyDown(e) {
      if (hasWon || isInspecting) return;
      const key = e.key;

      if (key >= '1' && key <= '9') {
        handleNumberInput(parseInt(key, 10));
      } else if (key === 'Backspace' || key === 'Delete' || key === '0') {
        handleClear();
      } else if (key.toLowerCase() === 'p' || key.toLowerCase() === 'n') {
        playTap();
        setPencilMode((prev) => !prev);
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
  }, [handleNumberInput, handleClear, hasWon, isInspecting, selectedCell, puzzle.size, grid]);

  const difficultyNames = {
    intro: 'Gentle (4×4)',
    classic: 'Standard (6×6)',
    expert: 'Deep (8×8)',
  };

  const nextTierMap = {
    intro: 'classic',
    classic: 'expert',
    expert: 'intro',
  };

  return (
    <div className="kkr-page game-screen-container">
      {/* ── Header ───────────────────────────────────────────── */}
      <GameHeader title="Kakuro" onBack={handleBack} />

      {/* ── Difficulty Tabs ─────────────────────────────────── */}
      <DifficultyTabs
        currentTier={difficulty}
        onSelectTier={(diff) => setDifficulty(diff)}
        tiers={[
          { id: 'intro', label: 'Gentle', subtitle: '4×4' },
          { id: 'classic', label: 'Standard', subtitle: '6×6' },
          { id: 'expert', label: 'Deep', subtitle: '8×8' },
        ]}
      />

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
          {displayedGrid.map((row, r) =>
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
                  ) : cellNotes.length > 0 && !isInspecting ? (
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
              disabled={isInspecting || hasWon}
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
            disabled={isInspecting || hasWon}
          >
            ⌫
          </button>
        </div>

        {/* Action Toolbar */}
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
            id="kkr-pencil-btn"
            type="button"
            className={`game-action-btn${pencilMode ? ' game-action-btn--active' : ''}`}
            onClick={() => {
              playTap();
              setPencilMode((prev) => !prev);
            }}
            aria-label="Toggle Pencil Mode"
            disabled={isInspecting || hasWon}
          >
            <Icon name="pencil" size={16} />
            <span>{pencilMode ? 'Notes On' : 'Notes Off'}</span>
          </button>
        </GameFooterActions>
      </div>

      {/* ── Universal Completion Modal ── */}
      <GameCompletionModal
        isOpen={hasWon}
        title="Sums in Harmony"
        description="All cross-sums balanced without repetition. The sanctuary rests in equilibrium."
        icon="✓"
        stats={[
          { label: 'Tier', value: difficultyNames[difficulty] || difficulty },
          { label: 'Moves', value: `${history.length - 1}` },
        ]}
        onNext={() => setDifficulty(nextTierMap[difficulty] || 'intro')}
        nextLabel="Next Tier"
        onReplay={handleReset}
        replayLabel="Replay"
        reviewLabel="Review Grid"
      />
    </div>
  );
}

export default KakuroScreen;
