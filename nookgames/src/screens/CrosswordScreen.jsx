import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Icon } from '../icons.jsx';
import { GameHeader } from '../components/GameHeader.jsx';
import { DifficultyTabs } from '../components/DifficultyTabs.jsx';
import { GameFooterActions } from '../components/GameFooterActions.jsx';
import { playTap, playChime } from '../utils/audio.js';
import { recordGameSession } from '../utils/storage.js';
import {
  DIFFICULTIES,
  getPuzzle,
  createPlayerGrid,
  isSolved,
  isClueSolved,
  getClueCells,
  getNextCell,
  getPrevCell,
} from '../utils/crosswordLogic';

export function CrosswordScreen({ onBack }) {
  const [difficulty, setDifficulty] = useState('beginner');
  const [puzzle, setPuzzle] = useState(() => getPuzzle('beginner'));
  const [playerGrid, setPlayerGrid] = useState(() => createPlayerGrid(getPuzzle('beginner')));
  const [selectedCell, setSelectedCell] = useState({ r: 0, c: 1 });
  const [direction, setDirection] = useState('across'); // 'across' | 'down'
  const [hasWon, setHasWon] = useState(false);
  const [activeTab, setActiveTab] = useState('across'); // 'across' | 'down' for full clues list
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [scratchText, setScratchText] = useState('');

  // Re-initialize when difficulty changes
  const handleDifficultyChange = (newDiff) => {
    setDifficulty(newDiff);
    const newPuzzle = getPuzzle(newDiff);
    setPuzzle(newPuzzle);
    setPlayerGrid(createPlayerGrid(newPuzzle));
    setHasWon(false);
    setScratchText('');

    let firstCell = { r: 0, c: 0 };
    if (newPuzzle && newPuzzle.gridSize && newPuzzle.grid) {
      for (let r = 0; r < newPuzzle.gridSize.rows; r++) {
        for (let c = 0; c < newPuzzle.gridSize.cols; c++) {
          if (newPuzzle.grid[r] && newPuzzle.grid[r][c] !== '#') {
            firstCell = { r, c };
            break;
          }
        }
        if (newPuzzle.grid[firstCell.r] && newPuzzle.grid[firstCell.r][firstCell.c] !== '#') break;
      }
    }
    setSelectedCell(firstCell);
    setDirection('across');
  };

  const handleReset = () => {
    if (!puzzle) return;
    setPlayerGrid(createPlayerGrid(puzzle));
    setHasWon(false);
    setScratchText('');
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

  // Handle cell selection & direction toggle
  const handleCellClick = (r, c) => {
    if (!puzzle || !puzzle.grid || !puzzle.grid[r] || puzzle.grid[r][c] === '#') return;
    playTap();

    if (selectedCell.r === r && selectedCell.c === c) {
      setDirection((prev) => (prev === 'across' ? 'down' : 'across'));
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
      if (hasWon || !puzzle || !puzzle.grid) return;

      playTap();

      if (isScratchpadOpen) {
        setScratchText((prev) => (prev.length >= 15 ? prev : prev + char.toUpperCase()));
        return;
      }

      const upper = char.toUpperCase();
      const { r, c } = selectedCell;

      if (!puzzle.grid[r] || puzzle.grid[r][c] === '#') return;

      const newGrid = playerGrid.map((rowArr, rowIdx) =>
        rowArr.map((val, colIdx) => (rowIdx === r && colIdx === c ? upper : val))
      );

      setPlayerGrid(newGrid);

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
    [hasWon, isScratchpadOpen, selectedCell, puzzle, playerGrid, direction]
  );

  // Handle Backspace
  const handleBackspace = useCallback(() => {
    if (hasWon || !playerGrid) return;

    playTap();

    if (isScratchpadOpen) {
      setScratchText((prev) => prev.slice(0, -1));
      return;
    }

    const { r, c } = selectedCell;
    const currentVal = playerGrid[r]?.[c];

    if (currentVal !== '') {
      const newGrid = playerGrid.map((rowArr, rowIdx) =>
        rowArr.map((val, colIdx) => (rowIdx === r && colIdx === c ? '' : val))
      );
      setPlayerGrid(newGrid);
    } else {
      const prev = getPrevCell(r, c, direction, puzzle);
      if (prev && (prev.r !== r || prev.c !== c)) {
        const newGrid = playerGrid.map((rowArr, rowIdx) =>
          rowArr.map((val, colIdx) => (rowIdx === prev.r && colIdx === prev.c ? '' : val))
        );
        setPlayerGrid(newGrid);
        setSelectedCell(prev);
      }
    }
  }, [hasWon, isScratchpadOpen, selectedCell, playerGrid, direction, puzzle]);

  // Handle Clear active word
  const handleClearWord = useCallback(() => {
    if (!activeClue || hasWon || !playerGrid) return;
    const cellsToClear = getClueCells(activeClue, direction);
    const newGrid = playerGrid.map((rowArr, r) =>
      rowArr.map((val, c) =>
        cellsToClear.some((cell) => cell.r === r && cell.c === c) ? '' : val
      )
    );
    setPlayerGrid(newGrid);
  }, [activeClue, direction, hasWon, playerGrid]);

  // Transfer rough word from scratchpad
  const handleTransferScratchpad = useCallback(() => {
    if (!activeClue || !scratchText || hasWon || !playerGrid || !puzzle) return;

    const cellsToFill = getClueCells(activeClue, direction);
    const chars = scratchText.toUpperCase().split('');

    const newGrid = playerGrid.map((rowArr, r) =>
      rowArr.map((val, c) => {
        const charIdx = cellsToFill.findIndex((cell) => cell.r === r && cell.c === c);
        if (charIdx !== -1 && charIdx < chars.length) {
          return chars[charIdx];
        }
        return val;
      })
    );

    setPlayerGrid(newGrid);

    if (isSolved(newGrid, puzzle)) {
      setHasWon(true);
      playChime();
      recordGameSession('crossword', true);
    }

    setScratchText('');
    setIsScratchpadOpen(false);
  }, [activeClue, direction, scratchText, hasWon, playerGrid, puzzle]);

  // Cycle clues
  const handleNextClue = useCallback(() => {
    if (!puzzle || !puzzle.clues) return;
    const list = puzzle.clues[direction];
    if (!list || list.length === 0) return;

    const currentIndex = list.findIndex((c) => c.number === activeClue?.number);
    const nextIndex = (currentIndex + 1) % list.length;
    const nextClue = list[nextIndex];

    if (nextClue) {
      setSelectedCell({ r: nextClue.row, c: nextClue.col });
    }
  }, [puzzle, direction, activeClue]);

  const handlePrevClue = useCallback(() => {
    if (!puzzle || !puzzle.clues) return;
    const list = puzzle.clues[direction];
    if (!list || list.length === 0) return;

    const currentIndex = list.findIndex((c) => c.number === activeClue?.number);
    const prevIndex = (currentIndex - 1 + list.length) % list.length;
    const prevClue = list[prevIndex];

    if (prevClue) {
      setSelectedCell({ r: prevClue.row, c: prevClue.col });
    }
  }, [puzzle, direction, activeClue]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (hasWon || !puzzle || !puzzle.gridSize) return;

      if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        handleInputChar(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape') {
        if (isScratchpadOpen) {
          e.preventDefault();
          setIsScratchpadOpen(false);
        }
      } else if (e.key === 'Enter') {
        if (isScratchpadOpen && scratchText.length > 0) {
          e.preventDefault();
          handleTransferScratchpad();
        }
      } else if (!isScratchpadOpen) {
        if (e.key === 'Tab' || e.key === ' ') {
          e.preventDefault();
          setDirection((prev) => (prev === 'across' ? 'down' : 'across'));
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
    isScratchpadOpen,
    scratchText,
    handleInputChar,
    handleBackspace,
    handleTransferScratchpad,
    selectedCell,
    puzzle,
  ]);

  const handleSelectClue = (clue, dir) => {
    setSelectedCell({ r: clue.row, c: clue.col });
    setDirection(dir);
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

  return (
    <div className="cw-container game-screen-container">
      <GameHeader title="Crossword" onBack={handleBack} />

      <DifficultyTabs
        currentTier={difficulty}
        onSelectTier={(tierId) => handleDifficultyChange(tierId)}
        tiers={[
          { id: 'beginner', label: 'Gentle', subtitle: '5×5' },
          { id: 'intermediate', label: 'Standard', subtitle: '6×6' },
          { id: 'master', label: 'Deep', subtitle: '7×7' },
        ]}
      />

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
            const cellNum = puzzle.cellNumbers ? puzzle.cellNumbers[`${r}-${c}`] : null;
            const val = playerGrid[r]?.[c] || '';

            if (isBlack) {
              return (
                <div
                  key={`${r}-${c}`}
                  className="cw-cell cw-cell--black"
                  aria-hidden="true"
                />
              );
            }

            return (
              <button
                key={`${r}-${c}`}
                type="button"
                onClick={() => handleCellClick(r, c)}
                className={`cw-cell ${isSelected
                  ? 'cw-cell--focused'
                  : inActiveWord
                    ? 'cw-cell--active-word'
                    : ''
                  }`}
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

        <div
          onClick={() => setDirection((prev) => (prev === 'across' ? 'down' : 'across'))}
          className="cw-clue-content"
        >
          {activeClue ? (
            <>
              <span className="cw-clue-badge">
                {activeClue.number} {direction}
              </span>
              <span className="cw-clue-text">{activeClue.clue}</span>
            </>
          ) : (
            <span className="cw-clue-text">Tap a cell to view clue</span>
          )}
        </div>

        <button
          type="button"
          onClick={handleNextClue}
          className="cw-clue-nav-btn"
          aria-label="Next Clue"
        >
          ›
        </button>
      </div>

      {isScratchpadOpen && (
        <div className="cw-scratchpad">
          <span className="cw-scratchpad-label">ROUGH:</span>
          <div className="cw-scratchpad-display">
            {scratchText ? (
              <span className="cw-scratchpad-text">{scratchText}</span>
            ) : (
              <span className="cw-scratchpad-placeholder">Type to test...</span>
            )}
            <span className="cw-scratchpad-cursor" />
          </div>
          {scratchText.length > 0 && (
            <button
              type="button"
              onClick={() => setScratchText('')}
              className="cw-scratchpad-clear-btn"
              title="Clear rough text"
              aria-label="Clear rough text"
            >
              ×
            </button>
          )}
          <button
            type="button"
            onClick={handleTransferScratchpad}
            disabled={!scratchText || !activeClue}
            className="cw-scratchpad-transfer-btn"
            title="Transfer to current grid word"
          >
            Transfer
          </button>
        </div>
      )}

      <div className="cw-keyboard">
        {keyboardRows.map((row, rowIdx) => (
          <div key={rowIdx} className="cw-keyboard-row">
            {rowIdx === 2 && (
              <button
                type="button"
                onClick={isScratchpadOpen ? () => setScratchText('') : handleClearWord}
                className="cw-key-btn cw-key-btn--special"
                title={isScratchpadOpen ? 'Clear rough text' : 'Clear current word'}
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
              >
                ⌫
              </button>
            )}
          </div>
        ))}
      </div>

      <GameFooterActions onReset={handleReset} resetLabel="Reset">
        <button
          type="button"
          className={`game-action-btn ${isScratchpadOpen ? 'game-action-btn--active' : ''}`}
          onClick={() => setIsScratchpadOpen((prev) => !prev)}
          aria-label="Notes / Scratchpad"
        >
          <Icon name="pencil" size={16} />
          <span>Notes</span>
        </button>
        <button
          type="button"
          className="game-action-btn"
          onClick={handleClearWord}
          aria-label="Clear Word"
        >
          <Icon name="erase" size={16} />
          <span>Clear</span>
        </button>
      </GameFooterActions>

      <div className="cw-clues-section">
        <div className="cw-clues-tabs">
          <button
            type="button"
            onClick={() => setActiveTab('across')}
            className={`cw-clues-tab-btn ${activeTab === 'across' ? 'active' : ''}`}
          >
            Across ({puzzle.clues?.across?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('down')}
            className={`cw-clues-tab-btn ${activeTab === 'down' ? 'active' : ''}`}
          >
            Down ({puzzle.clues?.down?.length || 0})
          </button>
        </div>

        <div className="cw-clues-list">
          {(puzzle.clues?.[activeTab] || []).map((clue) => {
            const isSolvedItem = isClueSolved(clue, activeTab, playerGrid);
            const isSelectedClue =
              activeClue?.number === clue.number && direction === activeTab;

            return (
              <div
                key={`${clue.number}-${activeTab}`}
                onClick={() => handleSelectClue(clue, activeTab)}
                className={`cw-clue-item ${isSelectedClue ? 'active' : ''} ${isSolvedItem ? 'solved' : ''
                  }`}
              >
                <span className="cw-clue-num">{clue.number}.</span>
                <span className="cw-clue-text-item">{clue.clue}</span>
              </div>
            );
          })}
        </div>
      </div>

      {hasWon && (
        <div className="cw-modal-backdrop">
          <div className="cw-modal-card">
            <div className="cw-modal-icon">✓</div>
            <h2 className="cw-modal-title">Grid Solved</h2>
            <p className="cw-modal-desc">
              You completed the {puzzle.difficulty || 'mini'} crossword puzzle cleanly.
            </p>
            <button
              type="button"
              onClick={() => {
                const nextDiff =
                  difficulty === 'beginner'
                    ? 'intermediate'
                    : difficulty === 'intermediate'
                      ? 'master'
                      : 'beginner';
                handleDifficultyChange(nextDiff);
              }}
              className="cw-modal-btn-primary"
            >
              Next Difficulty
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="cw-modal-btn-secondary"
            >
              Replay Puzzle
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CrosswordScreen;