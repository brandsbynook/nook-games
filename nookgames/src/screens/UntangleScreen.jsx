import { useState, useEffect, useCallback, useRef } from 'react'
import { Icon } from '../components/Icons'
import { GameHeader } from '../components/GameHeader.jsx'
import { DifficultyTabs } from '../components/DifficultyTabs.jsx'
import { GameFooterActions } from '../components/GameFooterActions.jsx'
import { GameCompletionModal } from '../components/GameCompletionModal.jsx'
import {
  DIFFICULTY_PRESETS,
  generatePlanarGraph,
  checkIntersections,
} from '../utils/untangleLogic.js'
import { playTap, playChime } from '../utils/audio.js'

/**
 * Clamps coordinates to the inner bounds of a circular canvas container.
 * Center (200, 200), maxRadius 166 (leaves comfortable margin inside 400x400 SVG frame).
 */
function clampToCircle(x, y, cx = 200, cy = 200, maxRadius = 166) {
  const dx = x - cx
  const dy = y - cy
  const dist = Math.hypot(dx, dy)
  if (dist <= maxRadius) {
    return { x: Math.round(x), y: Math.round(y) }
  }
  const factor = maxRadius / dist
  return {
    x: Math.round(cx + dx * factor),
    y: Math.round(cy + dy * factor),
  }
}

export function UntangleScreen({ onBack } = {}) {
  const [difficulty, setDifficulty] = useState('easy')
  const [graphData, setGraphData] = useState(() => {
    const preset = DIFFICULTY_PRESETS[0]
    return generatePlanarGraph(preset)
  })
  const [nodes, setNodes] = useState(() => graphData.nodes)
  const [history, setHistory] = useState(() => [graphData.nodes.map((n) => ({ ...n }))])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [activeNodeId, setActiveNodeId] = useState(null)
  const [isSolved, setIsSolved] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const isInspecting = historyIndex < history.length - 1
  const displayedNodes = isInspecting && history[historyIndex] ? history[historyIndex] : nodes

  const svgRef = useRef(null)
  const activeNodeIdRef = useRef(null)
  const pointerTargetRef = useRef(null)
  const pointerIdRef = useRef(null)
  const nodesRef = useRef(nodes)
  const dragStartPos = useRef(null)
  const animFrameRef = useRef(null)
  const modalTimerRef = useRef(null)

  // Keep nodesRef in sync with latest nodes state
  useEffect(() => {
    nodesRef.current = nodes
  }, [nodes])

  // Stop animation and clear pending timers on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      if (modalTimerRef.current) clearTimeout(modalTimerRef.current)
    }
  }, [])

  // Start new puzzle on difficulty change or "New Puzzle"
  const startNewPuzzle = useCallback((diffKey) => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
    if (modalTimerRef.current) {
      clearTimeout(modalTimerRef.current)
      modalTimerRef.current = null
    }
    const preset = DIFFICULTY_PRESETS.find((p) => p.id === diffKey) || DIFFICULTY_PRESETS[0]
    const newGraph = generatePlanarGraph(preset)
    setGraphData(newGraph)
    setNodes(newGraph.nodes)
    setHistory([newGraph.nodes.map((n) => ({ ...n }))])
    setHistoryIndex(0)
    activeNodeIdRef.current = null
    setActiveNodeId(null)
    setIsSolved(false)
    setShowModal(false)
    setIsAnimating(false)
  }, [])

  // Handle difficulty switch
  function handleDifficultyChange(diffKey) {
    if (diffKey === difficulty || isAnimating) return
    playTap()
    setDifficulty(diffKey)
    startNewPuzzle(diffKey)
  }

  // Handle back to Briefing
  function handleBack(e) {
    if (e) e.preventDefault()
    playTap()
    if (typeof onBack === 'function') {
      onBack()
    } else {
      window.location.hash = '/briefing/untangle'
    }
  }

  // Handle restart (reset current graph back to its initial scrambled layout)
  function handleRestart() {
    if (isAnimating) return
    playTap()
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
    if (modalTimerRef.current) {
      clearTimeout(modalTimerRef.current)
      modalTimerRef.current = null
    }
    const resetNodes = graphData.initialPositions.map((p) => ({ ...p }))
    setNodes(resetNodes)
    setHistory([resetNodes])
    setHistoryIndex(0)
    activeNodeIdRef.current = null
    setActiveNodeId(null)
    setIsSolved(false)
    setShowModal(false)
    setIsAnimating(false)
  }

  // Handle new random puzzle
  function handleNewGame() {
    playTap()
    startNewPuzzle(difficulty)
  }

  // Calculate intersections for displayed node layout
  const intersectionResult = checkIntersections(displayedNodes, graphData.edges)
  const { count: crossingCount, intersectingEdges } = intersectionResult

  // Check for newly solved state with an 800ms breathing pause before showing modal
  useEffect(() => {
    if (crossingCount === 0 && !isSolved && !isInspecting && activeNodeId === null && !isAnimating) {
      setIsSolved(true)
      playChime()
      if (modalTimerRef.current) clearTimeout(modalTimerRef.current)
      modalTimerRef.current = setTimeout(() => {
        setShowModal(true)
      }, 120)
    }
  }, [crossingCount, isSolved, isInspecting, activeNodeId, isAnimating])

  // Coordinate projection from client pointer event into SVG coordinate space
  const getSvgCoordinates = useCallback((e) => {
    const svgEl = svgRef.current
    if (!svgEl) return { x: 200, y: 200 }

    try {
      if (svgEl.getScreenCTM) {
        const ctm = svgEl.getScreenCTM()
        if (ctm) {
          const pt = svgEl.createSVGPoint()
          pt.x = e.clientX
          pt.y = e.clientY
          const transformed = pt.matrixTransform(ctm.inverse())
          if (Number.isFinite(transformed.x) && Number.isFinite(transformed.y)) {
            return {
              x: transformed.x,
              y: transformed.y,
            }
          }
        }
      }
    } catch {
      // Fallback
    }

    const rect = svgEl.getBoundingClientRect()
    const scaleX = 400 / (rect.width || 400)
    const scaleY = 400 / (rect.height || 400)
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }, [])

  // Pointer down on a node
  const handlePointerDown = (e, nodeId) => {
    if (isSolved || isAnimating || isInspecting) return
    e.preventDefault()
    e.stopPropagation()

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
      setIsAnimating(false)
    }

    try {
      e.target.setPointerCapture(e.pointerId)
      pointerTargetRef.current = e.target
      pointerIdRef.current = e.pointerId
    } catch {
      // Ignore if setPointerCapture fails on certain browsers
    }

    activeNodeIdRef.current = nodeId
    setActiveNodeId(nodeId)
    const node = nodesRef.current.find((n) => n.id === nodeId)
    if (node) {
      dragStartPos.current = { x: node.x, y: node.y }
    }
  }

  // Pointer move handler (recalculates intersections in real time)
  const handlePointerMove = useCallback((e) => {
    if (activeNodeIdRef.current === null || isInspecting) return
    e.preventDefault()

    const raw = getSvgCoordinates(e)
    const clamped = clampToCircle(raw.x, raw.y)

    setNodes((prevNodes) =>
      prevNodes.map((n) =>
        n.id === activeNodeIdRef.current ? { ...n, x: clamped.x, y: clamped.y } : n
      )
    )
  }, [getSvgCoordinates, isInspecting])

  // Pointer up handler
  const handlePointerUp = useCallback(() => {
    if (activeNodeIdRef.current === null) return
    const draggedId = activeNodeIdRef.current
    activeNodeIdRef.current = null
    setActiveNodeId(null)

    if (pointerTargetRef.current && pointerIdRef.current !== null) {
      try {
        if (pointerTargetRef.current.hasPointerCapture(pointerIdRef.current)) {
          pointerTargetRef.current.releasePointerCapture(pointerIdRef.current)
        }
      } catch {
        // Ignore
      }
      pointerTargetRef.current = null
      pointerIdRef.current = null
    }

    if (dragStartPos.current) {
      const curr = nodesRef.current.find((n) => n.id === draggedId)
      if (curr && Math.hypot(curr.x - dragStartPos.current.x, curr.y - dragStartPos.current.y) > 6) {
        playTap()
        setHistory((prev) => {
          const nextHist = [...prev.slice(0, historyIndex + 1), nodesRef.current.map((n) => ({ ...n }))]
          setHistoryIndex(nextHist.length - 1)
          return nextHist
        })
      }
    }
    dragStartPos.current = null
  }, [historyIndex])

  // Global window pointer listeners as a reliable fallback for high-speed multi-touch/mouse moves
  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove, { passive: false })
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [handlePointerMove, handlePointerUp])

  // Hint button: pick one node causing crossings and animate toward its solved coordinate
  const handleHint = () => {
    if (isSolved || isAnimating || isInspecting) return
    playTap()

    const solutions = graphData.solutionPositions || graphData.solvedPositions || []
    if (solutions.length === 0) return

    // Find nodes involved in current crossings
    const conflictedNodeIds = new Set()
    for (const edgeIdx of intersectingEdges) {
      const edge = graphData.edges[edgeIdx]
      if (edge) {
        conflictedNodeIds.add(edge.u)
        conflictedNodeIds.add(edge.v)
      }
    }

    // Find conflicted nodes that aren't yet at their solution coordinate
    const candidates = Array.from(conflictedNodeIds).filter((id) => {
      const cur = nodesRef.current.find((n) => n.id === id)
      const sol = solutions.find((s) => s.id === id)
      if (!cur || !sol) return false
      return Math.hypot(cur.x - sol.x, cur.y - sol.y) > 12
    })

    // If no conflicted node needs moving, choose any displaced node
    const targetNodeId =
      candidates.length > 0
        ? candidates[Math.floor(Math.random() * candidates.length)]
        : nodesRef.current.find((n) => {
            const sol = solutions.find((s) => s.id === n.id)
            return sol && Math.hypot(n.x - sol.x, n.y - sol.y) > 12
          })?.id

    if (targetNodeId === undefined) return

    const startNode = nodesRef.current.find((n) => n.id === targetNodeId)
    const targetPos = solutions.find((s) => s.id === targetNodeId)
    if (!startNode || !targetPos) return

    setIsAnimating(true)
    const startX = startNode.x
    const startY = startNode.y
    const startTime = performance.now()
    const duration = 480 // ms

    function step(now) {
      const elapsed = now - startTime
      const progress = Math.min(1, elapsed / duration)
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3)

      const curX = Math.round(startX + (targetPos.x - startX) * ease)
      const curY = Math.round(startY + (targetPos.y - startY) * ease)

      setNodes((prev) =>
        prev.map((n) => (n.id === targetNodeId ? { ...n, x: curX, y: curY } : n))
      )

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(step)
      } else {
        animFrameRef.current = null
        setIsAnimating(false)
        setHistory((prev) => {
          const nextHist = [...prev.slice(0, historyIndex + 1), nodesRef.current.map((n) => ({ ...n }))]
          setHistoryIndex(nextHist.length - 1)
          return nextHist
        })
      }
    }

    animFrameRef.current = requestAnimationFrame(step)
  }

  // Show Solution / Reveal Harmony: smoothly animate all nodes to untangled positions
  const handleShowSolution = () => {
    if (isSolved || isAnimating || isInspecting) return
    playTap()

    const solutions = graphData.solutionPositions || graphData.solvedPositions || []
    if (solutions.length === 0) return

    setIsAnimating(true)
    const startPositions = nodesRef.current.map((n) => ({ id: n.id, x: n.x, y: n.y }))
    const targetMap = new Map(solutions.map((s) => [s.id, s]))

    const startTime = performance.now()
    const duration = 700 // ms

    function step(now) {
      const elapsed = now - startTime
      const progress = Math.min(1, elapsed / duration)
      const ease = 1 - Math.pow(1 - progress, 3)

      setNodes(() =>
        startPositions.map((start) => {
          const target = targetMap.get(start.id)
          if (!target) return start
          return {
            id: start.id,
            x: Math.round(start.x + (target.x - start.x) * ease),
            y: Math.round(start.y + (target.y - start.y) * ease),
          }
        })
      )

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(step)
      } else {
        animFrameRef.current = null
        setIsAnimating(false)
        setHistory((prev) => {
          const nextHist = [...prev.slice(0, historyIndex + 1), nodesRef.current.map((n) => ({ ...n }))]
          setHistoryIndex(nextHist.length - 1)
          return nextHist
        })
      }
    }

    animFrameRef.current = requestAnimationFrame(step)
  }

  const currentPreset = DIFFICULTY_PRESETS.find((p) => p.id === difficulty) || DIFFICULTY_PRESETS[0]

  return (
    <div className="unt-page game-screen-container">
      {/* ── Top Bar ─────────────────────────────────────────── */}
      <GameHeader title="Untangle" onBack={handleBack} />

      {/* ── Standard Difficulty Tabs ─────────────────────────── */}
      <DifficultyTabs
        currentTier={difficulty}
        onSelectTier={handleDifficultyChange}
        tiers={DIFFICULTY_PRESETS}
      />

      {/* ── Status & Info Header ─────────────────────────────── */}
      <div className="unt-status-card">
        <div className="unt-stat-pills">
          <div className={`unt-pill${crossingCount === 0 ? ' unt-pill--solved' : ''}`}>
            <span className="unt-pill-label">Crossings</span>
            <span className="unt-pill-val">
              {crossingCount === 0 ? '0 (Untangled)' : `${crossingCount} remaining`}
            </span>
          </div>
          <div className="unt-pill">
            <span className="unt-pill-label">Moves</span>
            <span className="unt-pill-val">{history.length - 1}</span>
          </div>
        </div>
        <p className="unt-status-tagline">
          {crossingCount === 0
            ? 'Every knot has a geometry of release.'
            : 'Amber lines cross. Move any node anywhere until every line turns white.'}
        </p>
      </div>

      {/* ── Helper Action Buttons (Hint & Reveal Harmony) ─────── */}
      <div className="unt-helpers-bar">
        <button
          id="unt-hint-btn"
          className="unt-helper-btn"
          onClick={handleHint}
          disabled={isSolved || isAnimating || isInspecting}
          title="Animate one tangled node toward its calm position"
        >
          <Icon name="pencil" size={13} />
          <span>Hint</span>
        </button>
        <button
          id="unt-solution-btn"
          className="unt-helper-btn unt-helper-btn--solution"
          onClick={handleShowSolution}
          disabled={isSolved || isAnimating || isInspecting}
          title="Smoothly untangle all nodes to reveal planar harmony"
        >
          <Icon name="spatial" size={13} />
          <span>Reveal Harmony</span>
        </button>
      </div>

      {/* ── Interactive SVG Board ───────────────────────────── */}
      <div className="unt-board-wrap">
        <div className="unt-board-frame">
          <svg
            ref={svgRef}
            className={`unt-svg${crossingCount === 0 ? ' unt-svg--solved' : ''}`}
            viewBox="0 0 400 400"
            role="application"
            style={{ touchAction: 'none' }}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            aria-label={`Untangle graph with ${currentPreset.nodeCount} nodes and ${currentPreset.edgeCount} edges`}
          >
            <defs>
              {/* Subtle radial glow for resolved state */}
              <filter id="unt-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Circular canvas boundary guide */}
            <circle cx="200" cy="200" r="166" className="unt-bg-guide unt-bg-guide--boundary" />
            <circle cx="200" cy="200" r="100" className="unt-bg-guide" />

            {/* Edges Layer */}
            <g className="unt-edges-group">
              {graphData.edges.map((edge, index) => {
                const p1 = displayedNodes.find((n) => n.id === edge.u)
                const p2 = displayedNodes.find((n) => n.id === edge.v)
                if (!p1 || !p2) return null

                const isConflicted = crossingCount > 0 && intersectingEdges.has(index)

                return (
                  <line
                    key={edge.id}
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    className={`unt-edge ${
                      crossingCount === 0
                        ? 'unt-edge--solved'
                        : isConflicted
                        ? 'unt-edge--conflicted'
                        : 'unt-edge--resolved'
                    }`}
                  />
                )
              })}
            </g>

            {/* Nodes Layer */}
            <g className="unt-nodes-group">
              {displayedNodes.map((node) => {
                const isDragging = activeNodeId === node.id

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    className={`unt-node-group ${
                      crossingCount === 0
                        ? 'unt-node-group--solved'
                        : isDragging
                        ? 'unt-node-group--dragging'
                        : ''
                    }`}
                    style={{ touchAction: 'none' }}
                    onPointerDown={(e) => handlePointerDown(e, node.id)}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                  >
                    {/* Expanded invisible hit target for seamless touch & mouse grabbing */}
                    <circle r="26" className="unt-node-hit" />

                    {/* Outer node body */}
                    <circle
                      r={isDragging ? 15 : 13}
                      className="unt-node-body"
                      filter={crossingCount === 0 ? 'url(#unt-glow)' : undefined}
                    />

                    {/* Minimalist central core pip */}
                    <circle r={isDragging ? 4 : 3} className="unt-node-core" />
                  </g>
                )
              })}
            </g>
          </svg>
        </div>
      </div>

      {/* ── Footer Actions & Stepper ──────────────────────────── */}
      <div className="unt-footer-controls">
        <GameFooterActions
          onReset={isSolved ? handleNewGame : handleRestart}
          resetLabel={isSolved ? 'Next Graph' : 'Restart'}
          resetIcon={isSolved ? 'sparkles' : 'restart'}
          onStepBack={() => setHistoryIndex((prev) => Math.max(0, prev - 1))}
          onStepForward={() => setHistoryIndex((prev) => Math.min(history.length - 1, prev + 1))}
          canStepBack={historyIndex > 0}
          canStepForward={historyIndex < history.length - 1}
          stepIndicator={history.length > 1 ? `Move ${historyIndex}/${history.length - 1}` : null}
          isInspecting={isInspecting}
          onExitInspection={() => setHistoryIndex(history.length - 1)}
        />
      </div>

      {/* ── Universal Completion Modal ── */}
      <GameCompletionModal
        key={`untangle-complete-${graphData?.edges?.length}-${history.length}`}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Planar Harmony"
        description="Every tangled knot has found its geometry of release."
        icon="✓"
        stats={[
          { label: 'Tier', value: currentPreset.label },
          { label: 'Nodes', value: `${currentPreset.nodeCount}` },
          { label: 'Moves', value: `${history.length - 1}` },
        ]}
        onNext={handleNewGame}
        nextLabel="Next Graph"
        onReplay={handleRestart}
        replayLabel="Replay"
        reviewLabel="Review Graph"
      />
    </div>
  )
}

export default UntangleScreen
