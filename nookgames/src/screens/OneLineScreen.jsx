import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Icon } from '../icons.jsx';
import {
  DIFFICULTIES,
  PUZZLES,
  getPuzzle,
  getPuzzleCount,
  getEdgeKey,
  canMove,
  getAvailableNeighbors,
  isCompleted,
  undoLastMove,
} from '../utils/oneLineLogic';

export function OneLineScreen({ onBack }) {
  const [difficulty, setDifficulty] = useState('beginner');
  const [puzzleIndex, setPuzzleIndex] = useState(() => Math.floor(Math.random() * getPuzzleCount('beginner')));
  const [currentPath, setCurrentPath] = useState([]);
  const [visitedEdges, setVisitedEdges] = useState(() => new Set());
  const [hasWon, setHasWon] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const svgRef = useRef(null);
  const puzzle = useMemo(() => getPuzzle(difficulty, puzzleIndex), [difficulty, puzzleIndex]);
  const puzzleCount = useMemo(() => getPuzzleCount(difficulty), [difficulty]);

  // Reset when difficulty or puzzle changes
  useEffect(() => {
    setCurrentPath([]);
    setVisitedEdges(new Set());
    setHasWon(false);
    setIsDragging(false);
  }, [difficulty, puzzleIndex]);

  const handleDifficultyChange = (newDiff) => {
    if (newDiff === difficulty) return;
    playTap();
    setDifficulty(newDiff);
    const count = getPuzzleCount(newDiff);
    setPuzzleIndex(Math.floor(Math.random() * count));
  };

  const handlePrevLevel = () => {
    setPuzzleIndex((prev) => (prev > 0 ? prev - 1 : puzzleCount - 1));
  };

  const handleNextLevel = () => {
    setPuzzleIndex((prev) => (prev + 1) % puzzleCount);
  };

  const handleReset = () => {
    setCurrentPath([]);
    setVisitedEdges(new Set());
    setHasWon(false);
    setIsDragging(false);
  };

  const handleUndo = () => {
    if (currentPath.length === 0 || hasWon) return;
    const { currentPath: nextPath, visitedEdges: nextEdges } = undoLastMove(currentPath, visitedEdges);
    setCurrentPath(nextPath);
    setVisitedEdges(nextEdges);
  };

  const handleBack = () => {
    if (typeof onBack === 'function') {
      onBack();
    } else {
      window.location.hash = '#/briefing/one-line';
    }
  };

  const currentNodeId = currentPath.length > 0 ? currentPath[currentPath.length - 1] : null;

  // Available adjacent neighbors for the current node
  const availableNeighbors = useMemo(() => {
    if (hasWon) return [];
    if (currentNodeId === null) {
      // If path hasn't started, all nodes can be starting nodes
      return puzzle.nodes.map((n) => n.id);
    }
    return getAvailableNeighbors(currentNodeId, visitedEdges, puzzle);
  }, [currentNodeId, visitedEdges, puzzle, hasWon]);

  const availableNeighborSet = useMemo(() => new Set(availableNeighbors), [availableNeighbors]);

  // Attempt to step to a target node
  const tryMoveToNode = useCallback(
    (targetId) => {
      if (hasWon) return false;

      // If no start node is chosen, initialize path with target
      if (currentPath.length === 0) {
        setCurrentPath([targetId]);
        return true;
      }

      const headId = currentPath[currentPath.length - 1];

      // Tapping the head node: no-op
      if (targetId === headId) return false;

      // Undo shortcut: tapping the immediate previous node
      if (currentPath.length > 1 && targetId === currentPath[currentPath.length - 2]) {
        handleUndo();
        return true;
      }

      // Check if valid unvisited edge exists
      if (canMove(headId, targetId, visitedEdges, puzzle)) {
        const edgeKey = getEdgeKey(headId, targetId);
        const nextVisited = new Set(visitedEdges);
        nextVisited.add(edgeKey);
        const nextPath = [...currentPath, targetId];

        setCurrentPath(nextPath);
        setVisitedEdges(nextVisited);

        if (isCompleted(nextVisited, puzzle)) {
          setHasWon(true);
          setIsDragging(false);
        }
        return true;
      }

      return false;
    },
    [hasWon, currentPath, visitedEdges, puzzle]
  );

  // Convert screen coordinates to SVG viewBox (0-100)
  const getSvgCoordinates = useCallback((clientX, clientY) => {
    if (!svgRef.current) return null;
    const pt = svgRef.current.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svgRef.current.getScreenCTM();
    if (!ctm) return null;
    return pt.matrixTransform(ctm.inverse());
  }, []);

  // Pointer drag handling
  const handlePointerDown = (e, nodeId) => {
    e.preventDefault();
    if (hasWon) return;
    setIsDragging(true);
    tryMoveToNode(nodeId);
  };

  const handlePointerMove = useCallback(
    (e) => {
      if (!isDragging || hasWon) return;
      const coords = getSvgCoordinates(e.clientX, e.clientY);
      if (!coords) return;

      // Find if pointer is close to any node (proximity threshold: 10 units in 0-100 scale)
      for (const node of puzzle.nodes) {
        const dx = coords.x - node.x;
        const dy = coords.y - node.y;
        const dist = Math.hypot(dx, dy);

        if (dist <= 10) {
          tryMoveToNode(node.id);
          break;
        }
      }
    },
    [isDragging, hasWon, getSvgCoordinates, puzzle, tryMoveToNode]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Global pointerup listener
  useEffect(() => {
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    return () => {
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [handlePointerUp]);

  // Physical keyboard controls (Z = undo, R = reset, Space/Enter = next level when won)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'z' || e.key === 'Z' || e.key === 'Backspace') {
        e.preventDefault();
        handleUndo();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleReset();
      } else if ((e.key === ' ' || e.key === 'Enter') && hasWon) {
        e.preventDefault();
        handleNextLevel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasWon, currentPath, visitedEdges]);

  // Map of node ID to coordinates
  const nodeMap = useMemo(() => {
    const map = {};
    puzzle.nodes.forEach((n) => {
      map[n.id] = n;
    });
    return map;
  }, [puzzle]);

  // Build SVG path data for continuous visited line
  const activePathD = useMemo(() => {
    if (currentPath.length < 2) return '';
    return currentPath.reduce((acc, nodeId, idx) => {
      const node = nodeMap[nodeId];
      if (!node) return acc;
      return idx === 0 ? `M ${node.x} ${node.y}` : `${acc} L ${node.x} ${node.y}`;
    }, '');
  }, [currentPath, nodeMap]);

  return (
    <div className="ol-container">
      {/* ── 1. Header Bar ──────────────────────────────────── */}
      <header className="ol-header">
        <button
          onClick={handleBack}
          className="ol-icon-btn"
          aria-label="Back"
          title="Back to Briefing"
        >
          <Icon name="back" size={20} />
        </button>

        <h1 className="ol-title">One Line</h1>

        <div className="ol-header-actions">
          <button
            onClick={handleUndo}
            disabled={currentPath.length === 0 || hasWon}
            className="ol-icon-btn"
            aria-label="Undo move"
            title="Undo (Z / Backspace)"
          >
            <Icon name="undo" size={18} />
          </button>
          <button
            onClick={handleReset}
            className="ol-icon-btn"
            aria-label="Reset Level"
            title="Reset (R)"
          >
            <Icon name="restart" size={18} />
          </button>
        </div>
      </header>

      {/* ── 2. Unified Difficulty Pill Selector ─────────────── */}
      <div className="ol-difficulty-selector">
        {Object.values(DIFFICULTIES).map((tier) => (
          <button
            key={tier.id}
            onClick={() => handleDifficultyChange(tier.id)}
            className={`ol-diff-btn ${difficulty === tier.id ? 'active' : ''}`}
          >
            {tier.label}
          </button>
        ))}
      </div>

      {/* ── 3. Level Info & Progress Bar ─────────────────────── */}
      <div className="ol-level-bar">
        <button
          onClick={handlePrevLevel}
          className="ol-level-nav-btn"
          title="Previous Level"
          aria-label="Previous Level"
        >
          ‹
        </button>

        <div className="ol-level-info">
          <span className="ol-level-title">{puzzle.title}</span>
          <span className="ol-level-progress">
            Edges: {visitedEdges.size} / {puzzle.edges.length}
          </span>
        </div>

        <button
          onClick={handleNextLevel}
          className="ol-level-nav-btn"
          title="Next Level"
          aria-label="Next Level"
        >
          ›
        </button>
      </div>

      {/* ── 4. Interactive SVG Canvas ─────────────────────────── */}
      <div className="ol-canvas-card">
        <svg
          ref={svgRef}
          viewBox="0 0 100 100"
          className="ol-svg"
          onPointerMove={handlePointerMove}
          touch-action="none"
        >
          <defs>
            {/* Active stroke glowing filter */}
            <filter id="ol-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background unvisited edges */}
          <g className="ol-unvisited-edges">
            {puzzle.edges.map(([u, v]) => {
              const nodeU = nodeMap[u];
              const nodeV = nodeMap[v];
              if (!nodeU || !nodeV) return null;
              const key = getEdgeKey(u, v);
              const isVisited = visitedEdges.has(key);

              return (
                <line
                  key={key}
                  x1={nodeU.x}
                  y1={nodeU.y}
                  x2={nodeV.x}
                  y2={nodeV.y}
                  className={`ol-edge ${isVisited ? 'ol-edge--visited' : 'ol-edge--idle'}`}
                />
              );
            })}
          </g>

          {/* Active continuous path stroke */}
          {activePathD && (
            <path
              d={activePathD}
              className="ol-active-stroke"
              filter="url(#ol-glow)"
            />
          )}

          {/* Nodes */}
          <g className="ol-nodes">
            {puzzle.nodes.map((node) => {
              const isCurrentHead = currentNodeId === node.id;
              const isAvailable = availableNeighborSet.has(node.id);
              const isVisitedNode = currentPath.includes(node.id);

              return (
                <g
                  key={node.id}
                  className="ol-node-group"
                  onPointerDown={(e) => handlePointerDown(e, node.id)}
                >
                  {/* Invisible wide touch hit target */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={12}
                    className="ol-node-hitbox"
                  />

                  {/* Pulsing halo ring for available target nodes */}
                  {isAvailable && !hasWon && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={6}
                      className="ol-node-halo"
                    />
                  )}

                  {/* Visible node circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isCurrentHead ? 4.5 : isVisitedNode ? 3.5 : 3}
                    className={`ol-node-dot ${
                      isCurrentHead
                        ? 'ol-node-dot--head'
                        : isAvailable
                        ? 'ol-node-dot--available'
                        : isVisitedNode
                        ? 'ol-node-dot--visited'
                        : 'ol-node-dot--idle'
                    }`}
                  />
                </g>
              );
            })}
          </g>
        </svg>

        <div className="ol-hint-text">
          {currentPath.length === 0
            ? 'Tap any node to begin your stroke.'
            : hasWon
            ? 'Eulerian path complete.'
            : isDragging
            ? 'Slide to connect adjacent nodes.'
            : 'Trace each edge once without crossing back.'}
        </div>
      </div>

      {/* ── 5. Quiet Solve Overlay ───────────────────────────── */}
      {hasWon && (
        <div className="ol-modal-backdrop">
          <div className="ol-modal-card">
            <div className="ol-modal-icon">✓</div>
            <h2 className="ol-modal-title">One Line Complete</h2>
            <p className="ol-modal-desc">
              Every edge of <em>{puzzle.title}</em> traversed in a single continuous stroke.
            </p>
            <div className="ol-modal-actions">
              <button
                type="button"
                onClick={handleNextLevel}
                className="ol-modal-btn-primary"
              >
                Next Level
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="ol-modal-btn-secondary"
              >
                Replay Stroke
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OneLineScreen;
