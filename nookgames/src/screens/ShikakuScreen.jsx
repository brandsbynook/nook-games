import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Icon } from '../icons.jsx';
import { playTap, playChime } from '../utils/audio.js';
import {
  SHIKAKU_PUZZLES,
  getBounds,
  calcArea,
  validateRoom,
  checkWin,
  isClueCovered,
  getNextHintRoom,
} from '../utils/shikakuLogic.js';

export function ShikakuScreen({ onBack }) {
  const [difficulty, setDifficulty] = useState('easy');
  const puzzle = useMemo(() => SHIKAKU_PUZZLES[difficulty] || SHIKAKU_PUZZLES.easy, [difficulty]);

  // Committed rooms: array of { id, r1, r2, c1, c2, val, clue }
  const [committedRooms, setCommittedRooms] = useState([]);
  const [history, setHistory] = useState([]);

  // Selection state
  const [corner1, setCorner1] = useState(null); // { r, c }
  const [corner2, setCorner2] = useState(null); // { r, c } (hovered or drag target)
  const [isPointerDown, setIsPointerDown] = useState(false);
  const [hintedRoomId, setHintedRoomId] = useState(null);

  // Status & win state
  const [hasWon, setHasWon] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const gridRef = useRef(null);
  const pointerStartPosRef = useRef(null);
  const tappedRoomRef = useRef(null);
  const messageTimeoutRef = useRef(null);

  const showError = useCallback((msg) => {
    setErrorMsg(msg);
    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    messageTimeoutRef.current = setTimeout(() => {
      setErrorMsg('');
    }, 2500);
  }, []);

  // Reset when difficulty changes
  useEffect(() => {
    setCommittedRooms([]);
    setHistory([]);
    setCorner1(null);
    setCorner2(null);
    setIsPointerDown(false);
    setHasWon(false);
    setHintedRoomId(null);
    setErrorMsg('');
    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
  }, [difficulty]);

  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    };
  }, []);

  // Check win state whenever committed rooms change
  useEffect(() => {
    if (committedRooms.length > 0 && checkWin(puzzle.gridSize, committedRooms)) {
      setHasWon(true);
      playChime();
    } else {
      setHasWon(false);
    }
  }, [committedRooms, puzzle.gridSize]);

  // Commit a valid room
  const commitRoom = useCallback(
    (rect, clue) => {
      const newRoom = {
        id: `room-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        r1: rect.r1,
        r2: rect.r2,
        c1: rect.c1,
        c2: rect.c2,
        val: calcArea(rect),
        clue,
      };

      setHistory((prev) => [...prev, committedRooms]);
      setCommittedRooms((prev) => [...prev, newRoom]);
      playTap();
      setCorner1(null);
      setCorner2(null);
      setIsPointerDown(false);
    },
    [committedRooms]
  );

  // Remove a committed room
  const removeRoom = useCallback(
    (roomId) => {
      playTap();
      setHistory((prev) => [...prev, committedRooms]);
      setCommittedRooms((prev) => prev.filter((rm) => rm.id !== roomId));
      setCorner1(null);
      setCorner2(null);
      showError('Room removed.');
    },
    [committedRooms, showError]
  );

  // Undo
  const handleUndo = useCallback(() => {
    if (history.length === 0 || hasWon) return;
    playTap();
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setCommittedRooms(prev);
    setCorner1(null);
    setCorner2(null);
  }, [history, hasWon]);

  // Reset current puzzle
  const handleReset = useCallback(() => {
    playTap();
    setCommittedRooms([]);
    setHistory([]);
    setCorner1(null);
    setCorner2(null);
    setIsPointerDown(false);
    setHasWon(false);
    setErrorMsg('');
  }, []);

  // Hint
  const handleHint = useCallback(() => {
    if (hasWon) return;
    const nextRoom = getNextHintRoom(puzzle.solution, committedRooms);
    if (!nextRoom) {
      showError('All rooms are placed.');
      return;
    }

    playChime();
    // Remove any conflicting rooms
    const remainingRooms = committedRooms.filter(
      (rm) =>
        rm.r2 < nextRoom.r1 ||
        rm.r1 > nextRoom.r2 ||
        rm.c2 < nextRoom.c1 ||
        rm.c1 > nextRoom.c2
    );

    const hintId = `hint-${Date.now()}`;
    const newRoom = {
      id: hintId,
      r1: nextRoom.r1,
      r2: nextRoom.r2,
      c1: nextRoom.c1,
      c2: nextRoom.c2,
      val: nextRoom.val,
      clue: nextRoom.clue,
      isHint: true,
    };

    setHistory((prev) => [...prev, committedRooms]);
    setCommittedRooms([...remainingRooms, newRoom]);
    setHintedRoomId(hintId);
    setCorner1(null);
    setCorner2(null);

    setTimeout(() => {
      setHintedRoomId(null);
    }, 2000);
  }, [hasWon, puzzle.solution, committedRooms, showError]);

  // Cell from pointer coordinate
  const getCellFromCoords = useCallback(
    (clientX, clientY) => {
      if (!gridRef.current) return null;
      const rect = gridRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return null;

      const col = Math.floor((x / rect.width) * puzzle.gridSize);
      const row = Math.floor((y / rect.height) * puzzle.gridSize);
      return {
        r: Math.max(0, Math.min(puzzle.gridSize - 1, row)),
        c: Math.max(0, Math.min(puzzle.gridSize - 1, col)),
      };
    },
    [puzzle.gridSize]
  );

  // Pointer Down
  const handlePointerDown = useCallback(
    (e) => {
      if (hasWon) return;
      const cell = getCellFromCoords(e.clientX, e.clientY);
      if (!cell) return;

      pointerStartPosRef.current = { x: e.clientX, y: e.clientY };

      // Check if clicked an existing room
      const existing = committedRooms.find(
        (rm) => cell.r >= rm.r1 && cell.r <= rm.r2 && cell.c >= rm.c1 && cell.c <= rm.c2
      );
      if (existing) {
        tappedRoomRef.current = existing;
        return;
      }
      tappedRoomRef.current = null;

      // Two-tap mode: if corner 1 is already selected
      if (corner1) {
        if (corner1.r === cell.r && corner1.c === cell.c) {
          // Deselect
          setCorner1(null);
          setCorner2(null);
          return;
        }

        // Tap corner 2: commit if valid
        const bounds = getBounds(corner1, cell);
        const res = validateRoom(bounds, puzzle.clues, committedRooms);
        if (res.valid) {
          commitRoom(bounds, res.clue);
        } else {
          showError(res.error || 'Invalid room.');
          setCorner1(null);
          setCorner2(null);
        }
        return;
      }

      // Start selection
      setIsPointerDown(true);
      setCorner1(cell);
      setCorner2(cell);
      if (gridRef.current && gridRef.current.setPointerCapture) {
        try {
          gridRef.current.setPointerCapture(e.pointerId);
        } catch {
          // fallback
        }
      }
    },
    [hasWon, getCellFromCoords, committedRooms, corner1, puzzle.clues, commitRoom, showError]
  );

  // Pointer Move
  const handlePointerMove = useCallback(
    (e) => {
      if (hasWon) return;
      const cell = getCellFromCoords(e.clientX, e.clientY);
      if (!cell) return;

      if (isPointerDown && corner1) {
        setCorner2(cell);
      } else if (corner1 && !isPointerDown) {
        // Hovering while waiting for corner 2
        setCorner2(cell);
      }
    },
    [hasWon, getCellFromCoords, isPointerDown, corner1]
  );

  // Pointer Up
  const handlePointerUp = useCallback(
    (e) => {
      if (hasWon) return;

      const downPos = pointerStartPosRef.current;
      const dist = downPos
        ? Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y)
        : 0;

      // Tap on existing room removes it
      if (tappedRoomRef.current) {
        if (dist < 8) {
          removeRoom(tappedRoomRef.current.id);
        }
        tappedRoomRef.current = null;
        pointerStartPosRef.current = null;
        return;
      }

      if (isPointerDown && corner1) {
        const cell = getCellFromCoords(e.clientX, e.clientY) || corner2 || corner1;
        const isDragGesture = dist >= 12 || cell.r !== corner1.r || cell.c !== corner1.c;

        if (isDragGesture) {
          // Drag committed
          const bounds = getBounds(corner1, cell);
          const res = validateRoom(bounds, puzzle.clues, committedRooms);
          if (res.valid) {
            commitRoom(bounds, res.clue);
          } else {
            showError(res.error || 'Invalid room.');
          }
          setCorner1(null);
          setCorner2(null);
        } else {
          // First tap of two-tap mode
          setCorner1(cell);
          setCorner2(cell);
          playTap();
        }
        setIsPointerDown(false);
      }

      pointerStartPosRef.current = null;
    },
    [
      hasWon,
      isPointerDown,
      corner1,
      corner2,
      getCellFromCoords,
      puzzle.clues,
      committedRooms,
      commitRoom,
      showError,
      removeRoom,
    ]
  );

  // Active preview bounds and dimensions
  const activeRect = useMemo(() => {
    if (!corner1) return null;
    const target = corner2 || corner1;
    const bounds = getBounds(corner1, target);
    const width = bounds.c2 - bounds.c1 + 1;
    const height = bounds.r2 - bounds.r1 + 1;
    const area = width * height;
    const validation = validateRoom(bounds, puzzle.clues, committedRooms);

    return {
      bounds,
      width,
      height,
      area,
      valid: validation.valid,
    };
  }, [corner1, corner2, puzzle.clues, committedRooms]);

  // Back handler
  const handleBack = useCallback(() => {
    playTap();
    window.location.hash = '#/briefing/shikaku';
    if (typeof onBack === 'function') {
      onBack();
    }
  }, [onBack]);

  return (
    <div className="shk-page">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="shk-header">
        <button
          id="shk-back-btn"
          type="button"
          className="shk-btn-back"
          onClick={handleBack}
          aria-label="Back to Briefing"
        >
          <Icon name="back" size={18} />
          <span>Back</span>
        </button>

        <div className="shk-header-center">
          <h1 className="shk-title">SHIKAKU</h1>
        </div>

        <button
          id="shk-reset-btn"
          type="button"
          className="shk-btn-icon"
          onClick={handleReset}
          aria-label="Reset Board"
          title="Reset Board"
        >
          <Icon name="restart" size={18} />
        </button>
      </header>

      {/* ── Difficulty Tabs ───────────────────────────────────── */}
      <div className="shk-tabs-container">
        {[
          { key: 'easy', label: 'Easy (6×6)' },
          { key: 'medium', label: 'Medium (8×8)' },
          { key: 'hard', label: 'Hard (10×10)' },
        ].map((tab) => {
          const active = difficulty === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              className={`shk-tab-btn ${active ? 'shk-tab-btn--active' : ''}`}
              onClick={() => {
                if (difficulty !== tab.key) {
                  playTap();
                  setDifficulty(tab.key);
                }
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Status Pill & Error Bar ───────────────────────────── */}
      <div className="shk-status-bar">
        <div className="shk-pill">
          <span className="shk-pill-label">Rooms</span>
          <span className="shk-pill-val">
            {committedRooms.length} / {puzzle.clues.length}
          </span>
        </div>

        <div className="shk-feedback-text" aria-live="polite">
          {errorMsg || (corner1 ? 'Tap corner 2 to form room' : 'Tap corner 1 or drag to partition')}
        </div>
      </div>

      {/* ── Board Container ───────────────────────────────────── */}
      <div className="shk-board-outer">
        <div
          ref={gridRef}
          className="shk-board-grid"
          style={{
            '--grid-size': puzzle.gridSize,
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => {
            setIsPointerDown(false);
            setCorner1(null);
            setCorner2(null);
          }}
        >
          {/* Background Cells */}
          {Array.from({ length: puzzle.gridSize }).map((_, r) =>
            Array.from({ length: puzzle.gridSize }).map((__, c) => {
              const clue = puzzle.clues.find((cl) => cl.r === r && cl.c === c);
              const covered = clue ? isClueCovered(clue, committedRooms) : false;
              const isCorner1 = corner1 && corner1.r === r && corner1.c === c;

              return (
                <div
                  key={`${r}-${c}`}
                  className={`shk-cell ${isCorner1 ? 'shk-cell--active-corner' : ''}`}
                  data-r={r}
                  data-c={c}
                >
                  {clue && (
                    <span className={`shk-clue-number ${covered ? 'shk-clue--covered' : ''}`}>
                      {clue.val}
                    </span>
                  )}
                </div>
              );
            })
          )}

          {/* Committed Rooms */}
          {committedRooms.map((rm) => {
            const widthPct = ((rm.c2 - rm.c1 + 1) / puzzle.gridSize) * 100;
            const heightPct = ((rm.r2 - rm.r1 + 1) / puzzle.gridSize) * 100;
            const topPct = (rm.r1 / puzzle.gridSize) * 100;
            const leftPct = (rm.c1 / puzzle.gridSize) * 100;
            const isHint = rm.id === hintedRoomId;

            return (
              <div
                key={rm.id}
                className={`shk-committed-room ${isHint ? 'shk-room--hinted' : ''}`}
                style={{
                  top: `${topPct}%`,
                  left: `${leftPct}%`,
                  width: `${widthPct}%`,
                  height: `${heightPct}%`,
                }}
                title="Tap to remove room"
              />
            );
          })}

          {/* Active Selection Preview Box */}
          {activeRect && (
            <div
              className={`shk-preview-box ${activeRect.valid ? 'shk-preview--valid' : 'shk-preview--invalid'}`}
              style={{
                top: `${(activeRect.bounds.r1 / puzzle.gridSize) * 100}%`,
                left: `${(activeRect.bounds.c1 / puzzle.gridSize) * 100}%`,
                width: `${(activeRect.width / puzzle.gridSize) * 100}%`,
                height: `${(activeRect.height / puzzle.gridSize) * 100}%`,
              }}
            >
              <div className="shk-dimension-pill">
                {activeRect.width} × {activeRect.height} = {activeRect.area}
                {activeRect.valid && ' ✓'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Actions ────────────────────────────────────── */}
      <footer className="shk-toolbar">
        <button
          id="shk-undo-btn"
          type="button"
          className="shk-action-btn"
          onClick={handleUndo}
          disabled={history.length === 0 || hasWon}
          aria-label="Undo Room"
        >
          <Icon name="undo" size={16} />
          <span>Undo</span>
        </button>

        {corner1 && (
          <button
            type="button"
            className="shk-action-btn shk-cancel-btn"
            onClick={() => {
              playTap();
              setCorner1(null);
              setCorner2(null);
            }}
          >
            Cancel
          </button>
        )}

        <button
          id="shk-hint-btn"
          type="button"
          className="shk-action-btn"
          onClick={handleHint}
          disabled={hasWon || committedRooms.length === puzzle.clues.length}
          aria-label="Get Hint"
        >
          <Icon name="pencil" size={16} />
          <span>Hint</span>
        </button>
      </footer>

      {/* ── Calm Victory Dialog ───────────────────────────────── */}
      {hasWon && (
        <div className="shk-modal-backdrop">
          <div className="shk-modal-card">
            <div className="shk-modal-icon">❖</div>
            <h2 className="shk-modal-title">Grid in Harmony</h2>
            <p className="shk-modal-desc">
              All {puzzle.clues.length} rooms carved in pure proportion. Every cell balanced without overlap.
            </p>
            <div className="shk-modal-actions">
              {difficulty === 'easy' && (
                <button
                  type="button"
                  className="shk-modal-btn-primary"
                  onClick={() => {
                    playTap();
                    setDifficulty('medium');
                  }}
                >
                  Medium (8×8)
                </button>
              )}
              {difficulty === 'medium' && (
                <button
                  type="button"
                  className="shk-modal-btn-primary"
                  onClick={() => {
                    playTap();
                    setDifficulty('hard');
                  }}
                >
                  Hard (10×10)
                </button>
              )}
              {difficulty === 'hard' && (
                <button
                  type="button"
                  className="shk-modal-btn-primary"
                  onClick={handleReset}
                >
                  Replay Hard
                </button>
              )}
              <button
                type="button"
                className="shk-modal-btn-secondary"
                onClick={handleReset}
              >
                Replay Level
              </button>
              <button
                type="button"
                className="shk-modal-btn-tertiary"
                onClick={handleBack}
              >
                Briefing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShikakuScreen;
