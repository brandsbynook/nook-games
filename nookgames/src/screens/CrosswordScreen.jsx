import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Icon } from '../components/Icons';
import { GameHeader } from '../components/GameHeader.jsx';
import { DifficultyTabs } from '../components/DifficultyTabs.jsx';
import { GameFooterActions } from '../components/GameFooterActions.jsx';
import { GameCompletionModal } from '../components/GameCompletionModal.jsx';
import { playTap, playChime } from '../utils/audio.js';
import { recordGameSession } from '../utils/storage.js';
import {
  getPuzzle,
  getPuzzleCount,
  createPlayerGrid,
  isSolved,
  isClueSolved,
  getClueCells,
  getNextCell,
  getPrevCell,
  getHintCell,
  getSolutionGrid,
  DIFFICULTIES,
} from '../utils/crosswordLogic';

export function CrosswordScreen({ onBack }) {
  const [difficulty, setDifficulty] = useState('gentle');
  const [levelIndex, setLevelIndex] = useState(0);

  const puzzle = useMemo(() => getPuzzle(difficulty, levelIndex), [difficulty, levelIndex]);
  const totalLevels = useMemo(() => getPuzzleCount(difficulty), [difficulty]);

  const [playerGrid, setPlayerGrid] = useState(() => createPlayerGrid(puzzle));
  const [history, setHistory] = useState(() => [createPlayerGrid(puzzle)]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedCell, setSelectedCell] = useState(() => {
    let first = { r: 0, c: 0 };
    if (puzzle && puzzle.gridSize && puzzle.grid) {
      for (let r = 0; r < puzzle.gridSize.rows; r++) {
        for (let c = 0; c < puzzle.gridSize.cols; c++) {
          if (puzzle.grid[r] && puzzle.grid[r][c] !== '#') {
            first = { r, c };
            break;
          }
        }
        if (puzzle.grid[first.r] && puzzle.grid[first.r][first.c] !== '#') break;
      }
    }
    return first;
  });
  const [direction, setDirection] = useState('across'); // 'across' | 'down'
  const [hasWon, setHasWon] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isCluesDrawerOpen, setIsCluesDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState('across'); // 'across' | 'down'
  const [isRevealModalOpen, setIsRevealModalOpen] = useState(false);
  const [hintedCell, setHintedCell] = useState(null); // { r, c } | null

  const hintTimeoutRef = useRef(null);
  const isInspecting = historyIndex < history.length - 1;
  const currentGrid = history[historyIndex] || playerGrid;

  // Clear hint timer on unmount
  useEffect(() => {
    return () => {
      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current);
      }
    };
  }, []);

  const resetForPuzzle = (p) => {
    if (hintTimeoutRef.current) {
      clearTimeout(hintTimeoutRef.current);
    }
    const initialGrid = createPlayerGrid(p);
    setPlayerGrid(initialGrid);
    setHistory([initialGrid]);
    setHistoryIndex(0);
    setHasWon(false);
    setIsRevealed(false);
    setHintedCell(null);
    setIsCluesDrawerOpen(false);
    setIsRevealModalOpen(false);

    let firstCell = { r: 0, c: 0 };
    if (p && p.gridSize && p.grid) {
      for (let r = 0; r < p.gridSize.rows; r++) {
        for (let c = 0; c < p.gridSize.cols; c++) {
          if (p.grid[r] && p.grid[r][c] !== '#') {
            firstCell = { r, c };
            break;
          }
        }
        if (p.grid[firstCell.r] && p.grid[firstCell.r][firstCell.c] !== '#') break;
      }
    }
    setSelectedCell(firstCell);
    setDirection('across');
  };

  const handleDifficultyChange = (newDiff) => {
    playTap();
    setDifficulty(newDiff);
    setLevelIndex(0);
    const newP = getPuzzle(newDiff, 0);
    resetForPuzzle(newP);
  };

  const handlePrevLevel = () => {
    if (levelIndex > 0) {
      playTap();
      const newIdx = levelIndex - 1;
      setLevelIndex(newIdx);
      const newP = getPuzzle(difficulty, newIdx);
      resetForPuzzle(newP);
    }
  };

  const handleNextLevel = () => {
    if (levelIndex < totalLevels - 1) {
      playTap();
      const newIdx = levelIndex + 1;
      setLevelIndex(newIdx);
      const newP = getPuzzle(difficulty, newIdx);
      resetForPuzzle(newP);
    }
  };

  const commitGrid = useCallback(
    (newGrid) => {
      const nextHistory = history.slice(0, historyIndex + 1);
      nextHistory.push(newGrid);
      setHistory(nextHistory);
      setHistoryIndex(nextHistory.length - 1);
      setPlayerGrid(newGrid);
    },
    [history, historyIndex]
  );

  const handleReset = () => {
    if (!puzzle) return;
    playTap();
    if (hintTimeoutRef.current) {
      clearTimeout(hintTimeoutRef.current);
    }
    const initialGrid = createPlayerGrid(puzzle);
    setPlayerGrid(initialGrid);
    setHistory([initialGrid]);
    setHistoryIndex(0);
    setHasWon(false);
    setIsRevealed(false);
    setHintedCell(null);
  };

  const handleBack = (e) => {
    if (e) e.preventDefault();
    playTap();
    if (typeof onBack === 'function') {
      onBack();
    } else {
      window.location.hash = '';
    }
  };

  // Safe active clue evaluation
  const activeClue = useMemo(() => {
    if (!puzzle || !puzzle.cellClues) return null;
    const key = `${selectedCell.r}-${selectedCell.c}`;
    const cellInfo = puzzle.cellClues[key];
    if (!cellInfo) return null;
    return cellInfo[direction] || cellInfo[direction === 'across' ? 'down' : 'across'] || null;
  }, [selectedCell, direction, puzzle]);

  // Active word cells
  const activeWordCells = useMemo(() => {
    if (!activeClue) return [];
    return getClueCells(activeClue, direction);
  }, [activeClue, direction]);

  const activeWordSet = useMemo(() => {
    const set = new Set();
    activeWordCells.forEach((cell) => set.add(`${cell.r}-${cell.c}`));
    return set;
  }, [activeWordCells]);

  // Crossing word cells
  const crossingDir = direction === 'across' ? 'down' : 'across';
  const crossingClue = useMemo(() => {
    if (!puzzle || !puzzle.cellClues) return null;
    const key = `${selectedCell.r}-${selectedCell.c}`;
    const cellInfo = puzzle.cellClues[key];
    if (!cellInfo) return null;
    return cellInfo[crossingDir] || null;
  }, [selectedCell, crossingDir, puzzle]);

  const crossingWordCells = useMemo(() => {
    if (!crossingClue) return [];
    return getClueCells(crossingClue, crossingDir);
  }, [crossingClue, crossingDir]);

  const crossingWordSet = useMemo(() => {
    const set = new Set();
    crossingWordCells.forEach((cell) => set.add(`${cell.r}-${cell.c}`));
    return set;
  }, [crossingWordCells]);

  // Handle cell selection & direction toggle
  const handleCellClick = (r, c) => {
    if (!puzzle || !puzzle.grid || !puzzle.grid[r] || puzzle.grid[r][c] === '#') return;
    playTap();

    if (selectedCell.r === r && selectedCell.c === c) {
      const key = `${r}-${c}`;
      const cellInfo = puzzle.cellClues ? puzzle.cellClues[key] : null;
      const otherDir = direction === 'across' ? 'down' : 'across';
      if (cellInfo && cellInfo[otherDir]) {
        setDirection(otherDir);
      }
    } else {
      setSelectedCell({ r, c });
      const key = `${r}-${c}`;
      const cellInfo = puzzle.cellClues ? puzzle.cellClues[key] : null;
      if (cellInfo && !cellInfo[direction]) {
        setDirection(cellInfo.across ? 'across' : 'down');
      }
    }
  };

  // Handle typing a character
  const handleInputChar = useCallback(
    (char) => {
      if (hasWon || isRevealed || !puzzle || !puzzle.grid) return;

      playTap();

      const upper = char.toUpperCase();
      const { r, c } = selectedCell;

      if (!puzzle.grid[r] || puzzle.grid[r][c] === '#') return;

      const baseGrid = history[historyIndex] || playerGrid;
      const newGrid = baseGrid.map((rowArr, rowIdx) =>
        rowArr.map((val, colIdx) => (rowIdx === r && colIdx === c ? upper : val))
      );

      commitGrid(newGrid);

      if (isSolved(newGrid, puzzle)) {
        setHasWon(true);
        playChime();
        recordGameSession('crossword', true);
        return;
      }

      const next = getNextCell(r, c, direction, puzzle);
      if (next && (next.r !== r || next.c !== c)) {
        setSelectedCell(next);
      }
    },
    [hasWon, isRevealed, selectedCell, puzzle, history, historyIndex, playerGrid, commitGrid, direction]
  );

  // Handle Backspace
  const handleBackspace = useCallback(() => {
    if (hasWon || isRevealed || !playerGrid) return;

    playTap();

    const { r, c } = selectedCell;
    const baseGrid = history[historyIndex] || playerGrid;
    const currentVal = baseGrid[r]?.[c];

    if (currentVal !== '') {
      const newGrid = baseGrid.map((rowArr, rowIdx) =>
        rowArr.map((val, colIdx) => (rowIdx === r && colIdx === c ? '' : val))
      );
      commitGrid(newGrid);
    } else {
      const prev = getPrevCell(r, c, direction, puzzle);
      if (prev && (prev.r !== r || prev.c !== c)) {
        const newGrid = baseGrid.map((rowArr, rowIdx) =>
          rowArr.map((val, colIdx) => (rowIdx === prev.r && colIdx === prev.c ? '' : val))
        );
        commitGrid(newGrid);
        setSelectedCell(prev);
      }
    }
  }, [hasWon, isRevealed, selectedCell, history, historyIndex, playerGrid, commitGrid, direction, puzzle]);

  // Handle Clear active word
  const handleClearWord = useCallback(() => {
    if (!activeClue || hasWon || isRevealed || !playerGrid) return;
    playTap();
    const cellsToClear = getClueCells(activeClue, direction);
    const baseGrid = history[historyIndex] || playerGrid;
    const newGrid = baseGrid.map((rowArr, r) =>
      rowArr.map((val, c) =>
        cellsToClear.some((cell) => cell.r === r && cell.c === c) ? '' : val
      )
    );
    commitGrid(newGrid);
  }, [activeClue, direction, hasWon, isRevealed, history, historyIndex, playerGrid, commitGrid]);

  // Handle Hint
  const handleHint = useCallback(() => {
    if (hasWon || isRevealed || !puzzle || !puzzle.grid) return;

    const baseGrid = history[historyIndex] || playerGrid;
    const hint = getHintCell(baseGrid, puzzle, selectedCell, direction);
    if (!hint) return;

    playTap();

    const { r, c, char } = hint;
    const newGrid = baseGrid.map((rowArr, rowIdx) =>
      rowArr.map((val, colIdx) => (rowIdx === r && colIdx === c ? char : val))
    );

    commitGrid(newGrid);
    setSelectedCell({ r, c });
    setHintedCell({ r, c });

    if (hintTimeoutRef.current) {
      clearTimeout(hintTimeoutRef.current);
    }
    hintTimeoutRef.current = setTimeout(() => {
      setHintedCell(null);
    }, 1200);

    if (isSolved(newGrid, puzzle)) {
      setHasWon(true);
      playChime();
      recordGameSession('crossword', true);
    }
  }, [hasWon, isRevealed, puzzle, history, historyIndex, playerGrid, selectedCell, direction, commitGrid]);

  // Handle Reveal Solution
  const handleOpenRevealModal = () => {
    if (hasWon || isRevealed) return;
    playTap();
    setIsRevealModalOpen(true);
  };

  const handleConfirmReveal = () => {
    if (!puzzle) return;
    playTap();
    const solution = getSolutionGrid(puzzle);
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(solution);
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
    setPlayerGrid(solution);
    setIsRevealed(true);
    setIsRevealModalOpen(false);
  };

  // Cycle clues
  const handleNextClue = useCallback(() => {
    if (!puzzle || !puzzle.clues) return;
    const list = puzzle.clues[direction];
    if (!list || list.length === 0) return;

    const currentNum = activeClue?.num || activeClue?.number;
    const currentIndex = list.findIndex((c) => (c.num || c.number) === currentNum);
    const nextIndex = (currentIndex + 1) % list.length;
    const nextClue = list[nextIndex];

    if (nextClue) {
      const cells = getClueCells(nextClue, direction);
      const firstEmpty = cells.find((cell) => !currentGrid[cell.r]?.[cell.c]) || cells[0];
      setSelectedCell(firstEmpty);
    }
  }, [puzzle, direction, activeClue, currentGrid]);

  const handlePrevClue = useCallback(() => {
    if (!puzzle || !puzzle.clues) return;
    const list = puzzle.clues[direction];
    if (!list || list.length === 0) return;

    const currentNum = activeClue?.num || activeClue?.number;
    const currentIndex = list.findIndex((c) => (c.num || c.number) === currentNum);
    const prevIndex = (currentIndex - 1 + list.length) % list.length;
    const prevClue = list[prevIndex];

    if (prevClue) {
      const cells = getClueCells(prevClue, direction);
      const firstEmpty = cells.find((cell) => !currentGrid[cell.r]?.[cell.c]) || cells[0];
      setSelectedCell(firstEmpty);
    }
  }, [puzzle, direction, activeClue, currentGrid]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (hasWon || isRevealed || !puzzle || !puzzle.gridSize) return;

      if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        handleInputChar(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape') {
        if (isCluesDrawerOpen) {
          e.preventDefault();
          setIsCluesDrawerOpen(false);
        } else if (isRevealModalOpen) {
          e.preventDefault();
          setIsRevealModalOpen(false);
        }
      } else if (!isCluesDrawerOpen && !isRevealModalOpen) {
        if (e.key === 'Tab' || e.key === ' ') {
          e.preventDefault();
          const key = `${selectedCell.r}-${selectedCell.c}`;
          const cellInfo = puzzle.cellClues ? puzzle.cellClues[key] : null;
          const otherDir = direction === 'across' ? 'down' : 'across';
          if (cellInfo && cellInfo[otherDir]) {
            setDirection(otherDir);
          }
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          let nextC = (selectedCell.c + 1) % puzzle.gridSize.cols;
          while (puzzle.grid[selectedCell.r][nextC] === '#' && nextC !== selectedCell.c) {
            nextC = (nextC + 1) % puzzle.gridSize.cols;
          }
          setSelectedCell({ r: selectedCell.r, c: nextC });
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          let prevC = (selectedCell.c - 1 + puzzle.gridSize.cols) % puzzle.gridSize.cols;
          while (puzzle.grid[selectedCell.r][prevC] === '#' && prevC !== selectedCell.c) {
            prevC = (prevC - 1 + puzzle.gridSize.cols) % puzzle.gridSize.cols;
          }
          setSelectedCell({ r: selectedCell.r, c: prevC });
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          let nextR = (selectedCell.r + 1) % puzzle.gridSize.rows;
          while (puzzle.grid[nextR][selectedCell.c] === '#' && nextR !== selectedCell.r) {
            nextR = (nextR + 1) % puzzle.gridSize.rows;
          }
          setSelectedCell({ r: nextR, c: selectedCell.c });
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          let prevR = (selectedCell.r - 1 + puzzle.gridSize.rows) % puzzle.gridSize.rows;
          while (puzzle.grid[prevR][selectedCell.c] === '#' && prevR !== selectedCell.r) {
            prevR = (prevR - 1 + puzzle.gridSize.rows) % puzzle.gridSize.rows;
          }
          setSelectedCell({ r: prevR, c: selectedCell.c });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    hasWon,
    isRevealed,
    isCluesDrawerOpen,
    isRevealModalOpen,
    handleInputChar,
    handleBackspace,
    selectedCell,
    puzzle,
    direction,
  ]);

  const handleSelectClueFromDrawer = (clue, dir) => {
    playTap();
    const cells = getClueCells(clue, dir);
    const firstEmpty = cells.find((cell) => !currentGrid[cell.r]?.[cell.c]) || cells[0];
    setSelectedCell(firstEmpty);
    setDirection(dir);
    setIsCluesDrawerOpen(false);
  };

  const keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
  ];

  if (!puzzle || !puzzle.grid) {
    return (
      <div className="cw-container game-screen-container">
        <GameHeader title="Crossword" onBack={handleBack} />
        <div style={{ padding: '24px', textAlign: 'center', color: '#8e8e99' }}>
          Loading puzzle...
        </div>
      </div>
    );
  }

  const clueNum = activeClue?.num || activeClue?.number || '';
  const clueAnsLen = activeClue?.answer?.length ? ` (${activeClue.answer.length})` : '';

  return (
    <div className="cw-container game-screen-container">
      <GameHeader title="Crossword" onBack={handleBack} />

      <DifficultyTabs
        currentTier={difficulty}
        onSelectTier={(tierId) => handleDifficultyChange(tierId)}
        tiers={[
          { id: 'gentle', label: 'Gentle', subtitle: DIFFICULTIES.gentle?.subtitle || '5×5' },
          { id: 'standard', label: 'Standard', subtitle: DIFFICULTIES.standard?.subtitle || '7×7' },
          { id: 'deep', label: 'Deep', subtitle: DIFFICULTIES.deep?.subtitle || '9×9' },
        ]}
      />

      <div className="cw-level-bar">
        <button
          type="button"
          className="cw-level-nav-btn"
          onClick={handlePrevLevel}
          disabled={levelIndex <= 0}
          aria-label="Previous Level"
        >
          ‹
        </button>
        <div className="cw-level-info">
          <span className="cw-level-name">{puzzle.title || 'Crossword'}</span>
          <span className="cw-level-indicator">
            Level {levelIndex + 1} of {totalLevels}
          </span>
        </div>
        <button
          type="button"
          className="cw-level-nav-btn"
          onClick={handleNextLevel}
          disabled={levelIndex >= totalLevels - 1}
          aria-label="Next Level"
        >
          ›
        </button>
      </div>

      {isRevealed && (
        <div className="cw-revealed-indicator" role="status">
          <Icon name="eye" size={14} />
          <span>Solution Revealed &bull; Peaceful Study Mode</span>
        </div>
      )}

      <div
        className="cw-grid"
        style={{
          '--cols': puzzle.gridSize.cols,
          '--rows': puzzle.gridSize.rows,
        }}
      >
        {puzzle.grid.map((rowArr, r) =>
          rowArr.map((cellType, c) => {
            const isBlack = cellType === '#';
            const isSelected = selectedCell.r === r && selectedCell.c === c;
            const inActiveWord = activeWordSet.has(`${r}-${c}`);
            const inCrossingWord = crossingWordSet.has(`${r}-${c}`);
            const cellNum = puzzle.cellNumbers ? puzzle.cellNumbers[`${r}-${c}`] : null;
            const val = currentGrid[r]?.[c] || '';
            const isHinted = hintedCell?.r === r && hintedCell?.c === c;

            if (isBlack) {
              return (
                <div
                  key={`${r}-${c}`}
                  className="cw-cell cw-cell--black"
                  aria-hidden="true"
                />
              );
            }

            let cellClass = 'cw-cell';
            if (isSelected) {
              cellClass += ' cw-cell--focused';
            } else if (inActiveWord) {
              cellClass += ' cw-cell--active-word';
            } else if (inCrossingWord) {
              cellClass += ' cw-cell--crossing-word';
            }
            if (isHinted) {
              cellClass += ' cw-cell--hint-flash';
            }

            return (
              <button
                key={`${r}-${c}`}
                type="button"
                onClick={() => handleCellClick(r, c)}
                className={cellClass}
              >
                {cellNum && <span className="cw-cell-number">{cellNum}</span>}
                <span className="cw-cell-letter">{val}</span>
              </button>
            );
          })
        )}
      </div>

      <div className="cw-clue-bar">
        <button
          type="button"
          onClick={handlePrevClue}
          className="cw-clue-nav-btn"
          aria-label="Previous Clue"
        >
          ‹
        </button>

        <button
          type="button"
          onClick={() => {
            playTap();
            setDrawerTab(direction);
            setIsCluesDrawerOpen(true);
          }}
          className="cw-clue-content"
          aria-label="Open Full Clues List"
        >
          {activeClue ? (
            <>
              <span className="cw-clue-badge">
                {clueNum} {direction}{clueAnsLen}
              </span>
              <span className="cw-clue-text">{activeClue.clue}</span>
            </>
          ) : (
            <span className="cw-clue-text">Tap to view all clues</span>
          )}
        </button>

        <button
          type="button"
          onClick={handleNextClue}
          className="cw-clue-nav-btn"
          aria-label="Next Clue"
        >
          ›
        </button>

        <button
          type="button"
          onClick={() => {
            playTap();
            setDrawerTab(direction);
            setIsCluesDrawerOpen(true);
          }}
          className="cw-clue-all-btn"
          aria-label="Open Full Clues List"
          title="All Clues"
        >
          <Icon name="list" size={16} />
          <span>Clues</span>
        </button>
      </div>

      <div className="cw-keyboard">
        {keyboardRows.map((row, rowIdx) => (
          <div key={rowIdx} className="cw-keyboard-row">
            {rowIdx === 2 && (
              <button
                type="button"
                onClick={handleClearWord}
                className="cw-key-btn cw-key-btn--special"
                title="Clear current word"
                disabled={isRevealed || isInspecting}
              >
                Clear
              </button>
            )}

            {row.map((char) => (
              <button
                key={char}
                type="button"
                onClick={() => handleInputChar(char)}
                className="cw-key-btn"
                disabled={isRevealed || isInspecting}
              >
                {char}
              </button>
            ))}

            {rowIdx === 2 && (
              <button
                type="button"
                onClick={handleBackspace}
                className="cw-key-btn cw-key-btn--special"
                title="Backspace"
                disabled={isRevealed || isInspecting}
              >
                ⌫
              </button>
            )}
          </div>
        ))}
      </div>

      <GameFooterActions
        onReset={handleReset}
        resetLabel="Reset"
        onHint={handleHint}
        hintLabel="Hint"
        canHint={!hasWon && !isRevealed && !isInspecting}
        onStepBack={() => setHistoryIndex((prev) => Math.max(0, prev - 1))}
        onStepForward={() => setHistoryIndex((prev) => Math.min(history.length - 1, prev + 1))}
        canStepBack={historyIndex > 0}
        canStepForward={historyIndex < history.length - 1}
        stepIndicator={history.length > 1 ? `${historyIndex + 1}/${history.length}` : null}
        isInspecting={isInspecting}
        onExitInspection={() => setHistoryIndex(history.length - 1)}
      >
        <button
          type="button"
          className="game-action-btn"
          onClick={handleOpenRevealModal}
          disabled={hasWon || isRevealed}
          aria-label="Reveal Solution"
        >
          <Icon name="eye" size={16} />
          <span>Reveal</span>
        </button>
      </GameFooterActions>

      {/* ── Full Clue Drawer / Modal ── */}
      {isCluesDrawerOpen && (
        <div
          className="cw-drawer-backdrop"
          onClick={() => {
            playTap();
            setIsCluesDrawerOpen(false);
          }}
        >
          <div
            className="cw-drawer"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="All Clues"
          >
            <div className="cw-drawer-header">
              <div className="cw-drawer-header-left">
                <Icon name="list" size={16} />
                <h3 className="cw-drawer-title">All Clues</h3>
              </div>
              <button
                type="button"
                className="cw-drawer-close-btn"
                onClick={() => {
                  playTap();
                  setIsCluesDrawerOpen(false);
                }}
                aria-label="Close clues drawer"
              >
                ✕
              </button>
            </div>

            <div className="cw-drawer-tabs">
              <button
                type="button"
                onClick={() => {
                  playTap();
                  setDrawerTab('across');
                }}
                className={`cw-drawer-tab-btn ${drawerTab === 'across' ? 'active' : ''}`}
              >
                Across ({puzzle.clues?.across?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => {
                  playTap();
                  setDrawerTab('down');
                }}
                className={`cw-drawer-tab-btn ${drawerTab === 'down' ? 'active' : ''}`}
              >
                Down ({puzzle.clues?.down?.length || 0})
              </button>
            </div>

            <div className="cw-drawer-clues-list">
              {(puzzle.clues?.[drawerTab] || []).map((clue) => {
                const isSolvedItem = isClueSolved(clue, drawerTab, currentGrid);
                const cNum = clue.num || clue.number;
                const aNum = activeClue?.num || activeClue?.number;
                const isSelectedClue = aNum === cNum && direction === drawerTab;
                const ansLen = clue.answer?.length || 0;

                return (
                  <button
                    key={`${cNum}-${drawerTab}`}
                    type="button"
                    onClick={() => handleSelectClueFromDrawer(clue, drawerTab)}
                    className={`cw-drawer-clue-item ${isSelectedClue ? 'active' : ''} ${
                      isSolvedItem ? 'solved' : ''
                    }`}
                  >
                    <span className="cw-drawer-clue-num">{cNum}.</span>
                    <span className="cw-drawer-clue-text">
                      {clue.clue} <span className="cw-drawer-clue-len">({ansLen})</span>
                    </span>
                    {isSolvedItem && (
                      <span className="cw-drawer-clue-check" aria-label="Completed">
                        <Icon name="check" size={14} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Reveal Confirmation Modal ── */}
      {isRevealModalOpen && (
        <div
          className="cw-modal-backdrop"
          onClick={() => {
            playTap();
            setIsRevealModalOpen(false);
          }}
        >
          <div
            className="cw-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="reveal-modal-title"
          >
            <div className="cw-modal-icon">
              <Icon name="eye" size={20} />
            </div>
            <h2 id="reveal-modal-title" className="cw-modal-title">
              Reveal Solution?
            </h2>
            <p className="cw-modal-desc">
              This will populate the full grid with all correct solution letters for peaceful study.
            </p>
            <button
              type="button"
              onClick={handleConfirmReveal}
              className="cw-modal-btn-primary"
            >
              Reveal All
            </button>
            <button
              type="button"
              onClick={() => {
                playTap();
                setIsRevealModalOpen(false);
              }}
              className="cw-modal-btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Universal Victory / Completion Modal ── */}
      <GameCompletionModal
        isOpen={hasWon && !isRevealed}
        title="Grid Solved"
        description={`You completed "${puzzle.title || 'Crossword'}" cleanly.`}
        icon="✓"
        onNext={
          levelIndex < totalLevels - 1
            ? handleNextLevel
            : () => {
                const nextDiff =
                  difficulty === 'gentle'
                    ? 'standard'
                    : difficulty === 'standard'
                      ? 'deep'
                      : 'gentle';
                handleDifficultyChange(nextDiff);
              }
        }
        nextLabel={levelIndex < totalLevels - 1 ? 'Next Level' : 'Next Difficulty'}
        onReplay={handleReset}
        replayLabel="Replay Puzzle"
        reviewLabel="Review Grid"
      />
    </div>
  );
}

export default CrosswordScreen;