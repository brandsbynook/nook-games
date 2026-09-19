import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GameHeader } from '../components/GameHeader.jsx';
import { DifficultyTabs } from '../components/DifficultyTabs.jsx';
import { GameFooterActions } from '../components/GameFooterActions.jsx';
import { GameCompletionModal } from '../components/GameCompletionModal.jsx';
import { playTap, playChime } from '../utils/audio.js';
import { recordGameSession } from '../utils/storage.js';
import {
  getPuzzle,
  getPuzzleCount,
  getEdgeKey,
  canMove,
  getAvailableNeighbors,
  isCompleted,
} from '../utils/oneLineLogic.js';

export function OneLineScreen({ onBack }) {
  const [difficulty, setDifficulty] = useState('gentle');
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [currentPath, setCurrentPath] = useState([]);
  const [history, setHistory] = useState([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [hasWon, setHasWon] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const svgRef = useRef(null);
  const puzzle = useMemo(() => getPuzzle(difficulty, puzzleIndex), [difficulty, puzzleIndex]);
  const puzzleCount = useMemo(() => getPuzzleCount(difficulty), [difficulty]);

  const isInspecting = historyIndex < history.length - 1;
  const displayedPath = history[historyIndex] || currentPath;

  // Derive visited edges from displayed path
  const displayedVisitedEdges = useMemo(() => {
    const visited = new Set();
    for (let i = 0; i < displayedPath.length - 1; i++) {
      visited.add(getEdgeKey(displayedPath[i], displayedPath[i + 1]));
    }
    return visited;
  }, [displayedPath]);

  // Actual active visited edges
  const activeVisitedEdges = useMemo(() => {
    const visited = new Set();
    for (let i = 0; i < currentPath.length - 1; i++) {
      visited.add(getEdgeKey(currentPath[i], currentPath[i + 1]));
    }
    return visited;
  }, [currentPath]);

  useEffect(() => {
    setCurrentPath([]);
    setHistory([[]]);
    setHistoryIndex(0);
    setHasWon(false);
    setIsDragging(false);
  }, [difficulty, puzzleIndex]);

  const handleDifficultyChange = (newDiff) => {
    if (newDiff === difficulty) return;
    playTap();
    setDifficulty(newDiff);
    setPuzzleIndex(0);
  };

  const handlePrevLevel = () => {
    playTap();
    setPuzzleIndex((prev) => (prev > 0 ? prev - 1 : puzzleCount - 1));
  };

  const handleNextLevel = () => {
    playTap();
    setPuzzleIndex((prev) => (prev + 1) % puzzleCount);
  };

  const handleReset = () => {
    playTap();
    setCurrentPath([]);
    setHistory([[]]);
    setHistoryIndex(0);
    setHasWon(false);
    setIsDragging(false);
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

  const currentNodeId = displayedPath.length > 0 ? displayedPath[displayedPath.length - 1] : null;

  const availableNeighbors = useMemo(() => {
    if (hasWon || isInspecting) return [];
    if (currentPath.length === 0) {
      return puzzle.nodes.map((n) => n.id);
    }
    const head = currentPath[currentPath.length - 1];
    return getAvailableNeighbors(head, activeVisitedEdges, puzzle);
  }, [currentPath, activeVisitedEdges, puzzle, hasWon, isInspecting]);

  const availableNeighborSet = useMemo(() => new Set(availableNeighbors), [availableNeighbors]);

  const tryMoveToNode = useCallback(
    (targetId) => {
      if (hasWon || isInspecting) return false;

      if (currentPath.length === 0) {
        playTap();
        const next = [targetId];
        setCurrentPath(next);
        setHistory((prev) => {
          const nextHist = [...prev.slice(0, historyIndex + 1), next];
          setHistoryIndex(nextHist.length - 1);
          return nextHist;
        });
        return true;
      }

      const headId = currentPath[currentPath.length - 1];
      if (targetId === headId) return false;

      if (currentPath.length > 1 && targetId === currentPath[currentPath.length - 2]) {
        // Backtrack one step
        playTap();
        const next = currentPath.slice(0, -1);
        setCurrentPath(next);
        setHistory((prev) => {
          const nextHist = [...prev.slice(0, historyIndex + 1), next];
          setHistoryIndex(nextHist.length - 1);
          return nextHist;
        });
        return true;
      }

      if (canMove(headId, targetId, activeVisitedEdges, puzzle)) {
        playTap();
        const edgeKey = getEdgeKey(headId, targetId);
        const nextVisited = new Set(activeVisitedEdges);
        nextVisited.add(edgeKey);
        const nextPath = [...currentPath, targetId];

        setCurrentPath(nextPath);
        setHistory((prev) => {
          const nextHist = [...prev.slice(0, historyIndex + 1), nextPath];
          setHistoryIndex(nextHist.length - 1);
          return nextHist;
        });

        if (isCompleted(nextVisited, puzzle)) {
          setHasWon(true);
          setIsDragging(false);
          playChime();
          recordGameSession('one-line', true);
        }
        return true;
      }

      return false;
    },
    [hasWon, isInspecting, currentPath, activeVisitedEdges, historyIndex, puzzle]
  );

  const getSvgCoordinates = useCallback((clientX, clientY) => {
    if (!svgRef.current) return null;
    const pt = svgRef.current.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svgRef.current.getScreenCTM();
    if (!ctm) return null;
    return pt.matrixTransform(ctm.inverse());
  }, []);

  const handlePointerDown = (e, nodeId) => {
    e.preventDefault();
    if (hasWon || isInspecting) return;
    setIsDragging(true);
    tryMoveToNode(nodeId);
  };

  const handlePointerMove = useCallback(
    (e) => {
      if (!isDragging || hasWon || isInspecting) return;
      const coords = getSvgCoordinates(e.clientX, e.clientY);
      if (!coords) return;

      for (const node of puzzle.nodes) {
        const dx = coords.x - node.x;
        const dy = coords.y - node.y;
        const dist = Math.hypot(dx, dy);

        if (dist <= 11) {
          tryMoveToNode(node.id);
          break;
        }
      }
    },
    [isDragging, hasWon, isInspecting, getSvgCoordinates, puzzle, tryMoveToNode]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    return () => {
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [handlePointerUp]);

  const nodeMap = useMemo(() => {
    const map = {};
    puzzle.nodes.forEach((n) => {
      map[n.id] = n;
    });
    return map;
  }, [puzzle]);

  const activePathD = useMemo(() => {
    if (displayedPath.length < 2) return '';
    return displayedPath.reduce((acc, nodeId, idx) => {
      const node = nodeMap[nodeId];
      if (!node) return acc;
      return idx === 0 ? `M ${node.x} ${node.y}` : `${acc} L ${node.x} ${node.y}`;
    }, '');
  }, [displayedPath, nodeMap]);

  const tierNames = {
    gentle: 'Gentle',
    standard: 'Standard',
    deep: 'Deep',
  };

  return (
    <div className="ol-container game-screen-container">
      <GameHeader title="One Line" onBack={handleBack} />

      <DifficultyTabs
        currentTier={difficulty}
        onSelectTier={handleDifficultyChange}
        tiers={[
          { id: 'gentle', label: 'Gentle', subtitle: '5–6 Nodes' },
          { id: 'standard', label: 'Standard', subtitle: '7–9 Nodes' },
          { id: 'deep', label: 'Deep', subtitle: '10–12 Nodes' },
        ]}
      />

      <div className="ol-level-bar">
        <button
          type="button"
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
            Edges: {displayedVisitedEdges.size} / {puzzle.edges.length}
          </span>
        </div>

        <button
          type="button"
          onClick={handleNextLevel}
          className="ol-level-nav-btn"
          title="Next Level"
          aria-label="Next Level"
        >
          ›
        </button>
      </div>

      <div className="ol-canvas-card">
        <svg
          ref={svgRef}
          viewBox="0 0 100 100"
          className="ol-svg"
          onPointerMove={handlePointerMove}
          style={{ touchAction: 'none' }}
        >
          <g className="ol-unvisited-edges">
            {puzzle.edges.map(([u, v]) => {
              const nodeU = nodeMap[u];
              const nodeV = nodeMap[v];
              if (!nodeU || !nodeV) return null;
              const key = getEdgeKey(u, v);
              const isVisited = displayedVisitedEdges.has(key);

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

          {activePathD && (
            <path
              d={activePathD}
              className="ol-active-stroke"
            />
          )}

          <g className="ol-nodes">
            {puzzle.nodes.map((node) => {
              const isCurrentHead = currentNodeId === node.id;
              const isAvailable = availableNeighborSet.has(node.id);
              const isVisitedNode = displayedPath.includes(node.id);

              return (
                <g
                  key={node.id}
                  className="ol-node-group"
                  onPointerDown={(e) => handlePointerDown(e, node.id)}
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={14}
                    className="ol-node-hitbox"
                  />

                  {isAvailable && !hasWon && !isInspecting && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={7}
                      className="ol-node-halo"
                    />
                  )}

                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isCurrentHead ? 5 : isVisitedNode ? 4 : 3}
                    className={`ol-node-dot ${isCurrentHead
                      ? 'ol-node-dot--head'
                      : isAvailable && !isInspecting
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
          {displayedPath.length === 0
            ? 'Tap any node to begin your stroke.'
            : hasWon
              ? 'Eulerian path complete.'
              : isDragging
                ? 'Connect adjacent nodes without crossing back.'
                : 'Trace each edge once without repetition.'}
        </div>
      </div>

      <div className="ol-footer-controls">
        <GameFooterActions
          onReset={handleReset}
          resetLabel="Reset"
          onStepBack={() => setHistoryIndex((prev) => Math.max(0, prev - 1))}
          onStepForward={() => setHistoryIndex((prev) => Math.min(history.length - 1, prev + 1))}
          canStepBack={historyIndex > 0}
          canStepForward={historyIndex < history.length - 1}
          stepIndicator={history.length > 1 ? `Step ${historyIndex}/${history.length - 1}` : null}
          isInspecting={isInspecting}
          onExitInspection={() => setHistoryIndex(history.length - 1)}
        />
      </div>

      {/* ── Universal Completion Modal ── */}
      <GameCompletionModal
        isOpen={hasWon}
        title="One Line Complete"
        description={`Every edge of ${puzzle.title} traversed in a single continuous stroke.`}
        icon="✓"
        stats={[
          { label: 'Tier', value: tierNames[difficulty] || difficulty },
          { label: 'Level', value: `${puzzleIndex + 1} of ${puzzleCount}` },
          { label: 'Edges', value: `${puzzle.edges.length}` },
        ]}
        onNext={handleNextLevel}
        nextLabel="Next Level"
        onReplay={handleReset}
        replayLabel="Replay"
        reviewLabel="Review Stroke"
      />
    </div>
  );
}

export default OneLineScreen;