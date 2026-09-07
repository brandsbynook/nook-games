/**
 * untangleLogic.js — Planar graph generation and intersection detection for Untangle
 */

export const DIFFICULTY_PRESETS = [
  { id: 'easy', label: 'Easy', nodeCount: 5, edgeCount: 6, minCrossings: 2 },
  { id: 'medium', label: 'Medium', nodeCount: 7, edgeCount: 10, minCrossings: 4 },
  { id: 'hard', label: 'Hard', nodeCount: 9, edgeCount: 14, minCrossings: 6 },
]

const EPS = 1e-7

/**
 * 2D vector cross product of (b - a) and (c - a).
 * Positive if counter-clockwise turn, negative if clockwise turn, ~0 if collinear.
 */
export function crossProduct(a, b, c) {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)
}

/**
 * Checks if two line segments (p1, p2) and (p3, p4) strictly cross each other in their interior.
 * Segments that share endpoints or are strictly collinear do NOT count as interior crossings.
 */
export function segmentsIntersect(p1, p2, p3, p4) {
  const cp1 = crossProduct(p1, p2, p3)
  const cp2 = crossProduct(p1, p2, p4)
  const cp3 = crossProduct(p3, p4, p1)
  const cp4 = crossProduct(p3, p4, p2)

  // Strictly opposite signs relative to line (p1, p2)
  const straddles1 = (cp1 > EPS && cp2 < -EPS) || (cp1 < -EPS && cp2 > EPS)
  // Strictly opposite signs relative to line (p3, p4)
  const straddles2 = (cp3 > EPS && cp4 < -EPS) || (cp3 < -EPS && cp4 > EPS)

  return straddles1 && straddles2
}

/**
 * Evaluates all edge pairs in the graph for strictly interior intersections.
 *
 * @param {Array<{x: number, y: number}>} nodes
 * @param {Array<{u: number, v: number}>} edges
 * @returns {{ count: number, intersectingEdges: Set<number>, isSolved: boolean }}
 */
export function checkIntersections(nodes, edges) {
  const intersectingEdges = new Set()
  let count = 0

  for (let i = 0; i < edges.length; i++) {
    for (let j = i + 1; j < edges.length; j++) {
      const e1 = edges[i]
      const e2 = edges[j]

      // Edges sharing a vertex do not intersect in their interior
      if (e1.u === e2.u || e1.u === e2.v || e1.v === e2.u || e1.v === e2.v) {
        continue
      }

      const p1 = nodes[e1.u]
      const p2 = nodes[e1.v]
      const p3 = nodes[e2.u]
      const p4 = nodes[e2.v]

      if (segmentsIntersect(p1, p2, p3, p4)) {
        count++
        intersectingEdges.add(i)
        intersectingEdges.add(j)
      }
    }
  }

  return {
    count,
    intersectingEdges,
    isSolved: count === 0,
  }
}

/**
 * Checks if two chords (a, b) and (c, d) on an N-gon circle cross each other.
 * Assumes a < b and c < d.
 */
function chordsCross(a, b, c, d) {
  return (a < c && c < b && (d < a || d > b)) || (c < a && a < d && (b < c || b > d))
}

/**
 * Shuffles an array in place using Fisher-Yates.
 */
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * Generates a solvable planar graph:
 * 1. Place N nodes on a circle, connect perimeter cycle.
 * 2. Add non-crossing chords until target edgeCount is reached.
 * 3. Scramble node positions within the arena [padding, size - padding] ensuring minimum distance.
 *
 * @param {object} options
 * @param {number} options.nodeCount
 * @param {number} options.edgeCount
 * @param {number} options.minCrossings
 * @param {number} [options.size=400]
 * @param {number} [options.padding=48]
 * @param {number} [options.minDistance=54]
 * @returns {{
 *   nodes: Array<{id: number, x: number, y: number}>,
 *   edges: Array<{u: number, v: number, id: string}>,
 *   solvedPositions: Array<{x: number, y: number}>,
 *   initialPositions: Array<{x: number, y: number}>,
 *   initialCrossings: number
 * }}
 */
export function generatePlanarGraph({
  nodeCount = 5,
  edgeCount = 6,
  minCrossings = 2,
  size = 400,
  padding = 48,
  minDistance = 54,
} = {}) {
  // 1. Generate Solved Circle Positions
  const center = size / 2
  const radius = (size - padding * 2) / 2
  const solvedPositions = []

  for (let i = 0; i < nodeCount; i++) {
    const angle = (2 * Math.PI * i) / nodeCount - Math.PI / 2
    solvedPositions.push({
      x: Math.round(center + radius * Math.cos(angle)),
      y: Math.round(center + radius * Math.sin(angle)),
    })
  }

  // 2. Build Planar Edges (Perimeter Cycle + Non-Crossing Chords)
  const edges = []
  const edgeSet = new Set()

  const addEdge = (u, v) => {
    const [from, to] = u < v ? [u, v] : [v, u]
    const key = `${from}-${to}`
    if (!edgeSet.has(key)) {
      edgeSet.add(key)
      edges.push({ u: from, v: to, id: key })
    }
  }

  // Connect perimeter cycle
  for (let i = 0; i < nodeCount; i++) {
    addEdge(i, (i + 1) % nodeCount)
  }

  // Possible chords
  const candidateChords = []
  for (let u = 0; u < nodeCount; u++) {
    for (let v = u + 2; v < nodeCount; v++) {
      // Exclude perimeter edges (0, N-1)
      if (u === 0 && v === nodeCount - 1) continue
      candidateChords.push([u, v])
    }
  }

  shuffleArray(candidateChords)

  const chords = []
  for (const [u, v] of candidateChords) {
    if (edges.length >= edgeCount) break

    // Check if (u, v) crosses any already chosen chord
    let crosses = false
    for (const [cu, cv] of chords) {
      if (chordsCross(u, v, cu, cv)) {
        crosses = true
        break
      }
    }

    if (!crosses) {
      chords.push([u, v])
      addEdge(u, v)
    }
  }

  // 3. Scramble node positions
  const boundsMin = padding
  const boundsMax = size - padding
  let bestScramble = null
  let maxCrossingsFound = -1

  for (let attempt = 0; attempt < 250; attempt++) {
    const candidatePositions = []
    let validSeparation = true

    // Generate random positions with minimum distance separation
    for (let i = 0; i < nodeCount; i++) {
      let placed = false
      for (let pAttempt = 0; pAttempt < 60; pAttempt++) {
        const cx = boundsMin + Math.random() * (boundsMax - boundsMin)
        const cy = boundsMin + Math.random() * (boundsMax - boundsMin)

        const tooClose = candidatePositions.some((p) => {
          const dx = p.x - cx
          const dy = p.y - cy
          return Math.sqrt(dx * dx + dy * dy) < minDistance
        })

        if (!tooClose) {
          candidatePositions.push({ id: i, x: Math.round(cx), y: Math.round(cy) })
          placed = true
          break
        }
      }

      if (!placed) {
        validSeparation = false
        break
      }
    }

    if (!validSeparation) continue

    const { count } = checkIntersections(candidatePositions, edges)

    if (count > maxCrossingsFound) {
      maxCrossingsFound = count
      bestScramble = candidatePositions
    }

    if (count >= minCrossings) {
      bestScramble = candidatePositions
      maxCrossingsFound = count
      break
    }
  }

  // Fallback if random placement failed to satisfy min distance:
  // Randomly permute the circular positions and add light jitter
  if (!bestScramble || maxCrossingsFound === 0) {
    const permutedIndices = shuffleArray([...Array(nodeCount).keys()])
    bestScramble = permutedIndices.map((origIdx, i) => {
      const p = solvedPositions[i]
      return {
        id: origIdx,
        x: p.x + Math.round((Math.random() - 0.5) * 20),
        y: p.y + Math.round((Math.random() - 0.5) * 20),
      }
    })
    // Sort back by node id
    bestScramble.sort((a, b) => a.id - b.id)
    const { count } = checkIntersections(bestScramble, edges)
    maxCrossingsFound = count
  }

  // Clone initial scrambled positions
  const initialPositions = bestScramble.map((p) => ({ ...p }))
  const solutionPositions = solvedPositions.map((p, i) => ({ id: i, x: p.x, y: p.y }))

  return {
    nodes: bestScramble,
    edges,
    solvedPositions,
    solutionPositions,
    initialPositions,
    initialCrossings: maxCrossingsFound,
  }
}
