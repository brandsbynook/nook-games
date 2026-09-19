import { useState, useEffect, useCallback, useRef } from 'react'
import { Icon } from '../icons.jsx'
import { BackButton } from '../components/BackButton.jsx'
import { DifficultyTabs } from '../components/DifficultyTabs.jsx'
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
  const [activeNodeId, setActiveNodeId] = useState(null)
  const [moveCount, setMoveCount] = useState(0)
  const [isSolved, setIsSolved] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const svgRef = useRef(null)
  const activeNodeIdRef = useRef(null)
  const pointerTargetRef = useRef(null)
  const pointerIdRef = useRef(null)
  const nodesRef = useRef(nodes)
  const dragStartPos = useRef(null)
  const animFrameRef = useRef(null)

  // Keep nodesRef in sync with latest nodes state
  useEffect(() => {
    nodesRef.current = nodes
  }, [nodes])

  // Stop animation on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [])

  // Start new puzzle on difficulty change or "New Puzzle"
  const startNewPuzzle = useCallback((diffKey) => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
    const preset = DIFFICULTY_PRESETS.find((p) => p.id === diffKey) || DIFFICULTY_PRESETS[0]
    const newGraph = generatePlanarGraph(preset)
    setGraphData(newGraph)
    setNodes(newGraph.nodes)
    activeNodeIdRef.current = null
    setActiveNodeId(null)
    setMoveCount(0)
    setIsSolved(false)
    setShowToast(false)
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
    const resetNodes = graphData.initialPositions.map((p) => ({ ...p }))
    setNodes(resetNodes)
    activeNodeIdRef.current = null
    setActiveNodeId(null)
    setMoveCount(0)
    setIsSolved(false)
    setShowToast(false)
    setIsAnimating(false)
  }

  // Handle new random puzzle
  function handleNewGame() {
    playTap()
    startNewPuzzle(difficulty)
  }

  // Calculate intersections for current node layout
  const intersectionResult = checkIntersections(nodes, graphData.edges)
  const { count: crossingCount, intersectingEdges, isSolved: currentIsSolved } = intersectionResult

  // Check for newly solved state
  useEffect(() => {
    if (currentIsSolved && !isSolved) {
      setIsSolved(true)
      const timer = setTimeout(() => {
        playChime()
        setShowToast(true)
      }, 250)
      return () => clearTimeout(timer)
    }
  }, [currentIsSolved, isSolved])

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
    if (isSolved || isAnimating) return
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
    if (activeNodeIdRef.current === null) return
    e.preventDefault()

    const raw = getSvgCoordinates(e)
    const clamped = clampToCircle(raw.x, raw.y)

    setNodes((prevNodes) =>
      prevNodes.map((n) =>
        n.id === activeNodeIdRef.current ? { ...n, x: clamped.x, y: clamped.y } : n
      )
    )
  }, [getSvgCoordinates])

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
        setMoveCount((prev) => prev + 1)
        playTap()
      }
    }
    dragStartPos.current = null
  }, [])

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
    if (isSolved || isAnimating) return
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
        setMoveCount((m) => m + 1)
      }
    }

    animFrameRef.current = requestAnimationFrame(step)
  }

  // Show Solution / Reveal Harmony: smoothly animate all nodes to untangled positions
  const handleShowSolution = () => {
    if (isSolved || isAnimating) return
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
      }
    }

    animFrameRef.current = requestAnimationFrame(step)
  }

  const currentPreset = DIFFICULTY_PRESETS.find((p) => p.id === difficulty) || DIFFICULTY_PRESETS[0]

  return (
    <div className="unt-page">
      {/* ── Top Bar ─────────────────────────────────────────── */}
      <div className="unt-top-bar">
        <BackButton
          id="unt-back-btn"
          className="unt-back-btn"
          onClick={handleBack}
          ariaLabel="Back to Briefing"
          title="Back to Briefing"
        />

        <div className="unt-header-center">
          <h1 className="unt-title">Untangle</h1>
        </div>

        <button
          id="unt-restart-btn"
          className="unt-restart-btn"
          onClick={handleRestart}
          aria-label="Reset Puzzle"
          title="Reset"
          disabled={isAnimating}
        >
          <Icon name="restart" size={18} />
        </button>
      </div>

      {/* ── Standard Difficulty Tabs ─────────────────────────── */}
      <DifficultyTabs
        currentTier={difficulty}
        onSelectTier={handleDifficultyChange}
        tiers={DIFFICULTY_PRESETS}
      />

      {/* ── Status & Info Header ─────────────────────────────── */}
      <div className="unt-status-card">
        <div className="unt-stat-pills">
          <div className={`unt-pill${isSolved ? ' unt-pill--solved' : ''}`}>
            <span className="unt-pill-label">Crossings</span>
            <span className="unt-pill-val">
              {isSolved ? '0 (Untangled)' : `${crossingCount} remaining`}
            </span>
          </div>
          <div className="unt-pill">
            <span className="unt-pill-label">Moves</span>
            <span className="unt-pill-val">{moveCount}</span>
          </div>
        </div>
        <p className="unt-status-tagline">
          {isSolved
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
          disabled={isSolved || isAnimating}
          title="Animate one tangled node toward its calm position"
        >
          <Icon name="pencil" size={13} />
          <span>Hint</span>
        </button>
        <button
          id="unt-solution-btn"
          className="unt-helper-btn unt-helper-btn--solution"
          onClick={handleShowSolution}
          disabled={isSolved || isAnimating}
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
            className={`unt-svg${isSolved ? ' unt-svg--solved' : ''}`}
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
                const p1 = nodes.find((n) => n.id === edge.u)
                const p2 = nodes.find((n) => n.id === edge.v)
                if (!p1 || !p2) return null

                const isConflicted = !isSolved && intersectingEdges.has(index)

                return (
                  <line
                    key={edge.id}
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    className={`unt-edge ${
                      isSolved
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
              {nodes.map((node) => {
                const isDragging = activeNodeId === node.id

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    className={`unt-node-group ${
                      isSolved
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
                      filter={isSolved ? 'url(#unt-glow)' : undefined}
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

      {/* ── Microcopy below board ── */}
      <div className="unt-microcopy-wrap">
        <p className="unt-board-microcopy">
          {isSolved
            ? 'Every knot has a geometry of release.'
            : 'Amber lines cross. Move nodes until every line turns white.'}
        </p>
      </div>

      {/* ── Footer ──────────────────────────────────────────── */}
      <div className="unt-footer">
        {isSolved ? (
          <button id="unt-next-btn" className="unt-next-btn" onClick={handleNewGame}>
            New Puzzle
          </button>
        ) : (
          <span className="unt-footer-quote">
            Euler’s planar harmony — separate the tangled lines into quiet clarity.
          </span>
        )}
      </div>

      {/* ── Completion Toast ─────────────────────────────────── */}
      <div
        className={`unt-toast${showToast ? ' unt-toast--visible' : ''}`}
        role="status"
        aria-live="polite"
      >
        Every knot has a geometry of release.
      </div>
    </div>
  )
}

export default UntangleScreen
