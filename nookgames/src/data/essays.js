/**
 * essays.js
 *
 * A 20-essay dataset mapped 1-to-1 with the 20 games in catalogue.js.
 * Each essay is a short, self-contained read that illuminates the history,
 * mathematics, psychology, or culture behind its companion game.
 *
 * Exports:
 *   ESSAYS           – Full dataset array (ordered for deterministic rotation)
 *   getDailyEssay()  – Returns today's essay via day-of-year % 20 (offline, no network)
 *   getEssayById(id) – Lookup by essay id; falls back to first essay
 */

export const ESSAYS = [
  {
    id: '15-puzzle-mania',
    title: 'The 1880s Slider Mania',
    theme: 'History & Mathematics',
    readTime: '1 min',
    paragraphs: [
      'In 1880, America was gripped by a sudden craze over the 15-Puzzle. Offices banned it during work hours, train conductors missed stops, and newspapers offered bounties for solutions.',
      'Mathematicians soon proved that starting from an odd permutation—swapping just the 14 and 15 tiles—made reaching the solved state physically impossible. The craze demonstrated how powerfully the human mind seeks complete alignment, even when the math quietly forbids it.',
    ],
    companionGameId: '15-puzzle',
    companionName: '15 Puzzle',
  },
  {
    id: 'gomoku-five-stones',
    title: 'The Art of Five Stones in a Row',
    theme: 'Ancient Strategy',
    readTime: '1 min',
    paragraphs: [
      'Originating in ancient China as Wuziqi and refined over centuries into Gomoku, the game of five stones reduces strategic conflict to pure spatial harmony.',
      'With neither captures nor piece values to distract the eye, victory hinges entirely on constructing open four-in-a-row alignments and double-threat forks before the opponent senses the geometric trap.',
    ],
    companionGameId: 'gomoku',
    companionName: 'Gomoku',
  },
  {
    id: 'chess-olympics',
    title: "Why Chess Isn't in the Olympic Games",
    theme: 'Culture & Sports',
    readTime: '1 min',
    paragraphs: [
      'The International Olympic Committee formally recognized Chess as a sport in 1999, yet it has never appeared in the Olympic Games.',
      'The barrier remains Olympic Charter Rule 1.2, which mandates physical athletic exertion. Elite players burn thousands of calories during high-stakes tournaments through cardiovascular and metabolic stress, but the Games maintain their strict boundary: athletic competition requires bodily movement.',
    ],
    companionGameId: 'chess',
    companionName: 'Chess',
  },
  {
    id: 'dopamine-reset',
    title: 'The Closed-Loop Dopamine Reset',
    theme: 'Neuroscience',
    readTime: '1 min',
    paragraphs: [
      'Infinite algorithmic feeds trigger erratic dopamine spikes through unpredictable stimulation, exhausting the prefrontal cortex.',
      'Structured number grids like Sudoku provide the opposite: closed-loop deductive clarity. There are no surprise feeds or hidden variables. Completing a deterministic grid gives the brain a clean, grounded hit of completion dopamine—quieting noise through orderly resolution.',
    ],
    companionGameId: 'sudoku',
    companionName: 'Sudoku',
  },
  {
    id: 'euler-walk',
    title: "Euler's Walk and the Birth of Topology",
    theme: 'Mathematics',
    readTime: '1 min',
    paragraphs: [
      'In 1736, the citizens of Königsberg tried to determine if they could stroll through town crossing each of their seven river bridges exactly once.',
      'Mathematician Leonhard Euler proved it was impossible without measuring a single bridge. By discarding physical distances and reducing the problem to land points and bridge lines, he founded graph theory and topology. When drawing continuous paths, connectivity matters far more than geometry.',
    ],
    companionGameId: 'one-line',
    companionName: 'One Line',
  },
  {
    id: 'reversi-dispute',
    title: 'The Victorian Feud Behind Reversi',
    theme: 'Game Lore',
    readTime: '1 min',
    paragraphs: [
      'In the late 19th century, two London inventors—Lewis Waterman and John W. Mollett—engaged in a bitter public feud, each accusing the other of pirating the game Reversi.',
      'The dispute filled column inches and triggered threats of legal action against retailers. The enduring mechanic that sparked the controversy was sandwiching opponent discs between your own—turning an entire row of dominant color in a single quiet maneuver.',
    ],
    companionGameId: 'reversi',
    companionName: 'Reversi',
  },
  {
    id: 'negative-space',
    title: 'Negative Space and Carving the Void',
    theme: 'Deduction',
    readTime: '1 min',
    paragraphs: [
      'Sculptors shape form not by adding stone, but by methodically carving away whatever is superfluous. Deductive grid puzzles rely on this exact discipline.',
      'Beginners exhaust their focus hunting for confirmed filled squares. Experienced solvers search for what cannot exist, eliminating impossibilities until the correct pattern reveals itself. Stillness arrives when the impossible is cleanly crossed out.',
    ],
    companionGameId: 'nonogram',
    companionName: 'Nonogram',
  },
  {
    id: 'rudrata-verse',
    title: "The 9th-Century Kashmiri Verse",
    theme: 'Poetics & Math',
    readTime: '1 min',
    paragraphs: [
      "The Knight is the only chess piece whose movement jumps over obstacles in an angular stride. In the 9th century, Kashmiri rhetorician Rudrata composed Sanskrit verse that doubled as a Knight's Tour solution.",
      'When the poem syllables were mapped onto an 8×4 grid, reading them in the sequence of valid knight jumps reproduced the verse in reverse order—a stunning historical intersection of poetics and board geometry.',
    ],
    companionGameId: 'knights-tour',
    companionName: "Knight's Tour",
  },
  {
    id: 'hanoi-lucas',
    title: 'Édouard Lucas and the Temple Myth',
    theme: 'Mathematical Fiction',
    readTime: '1 min',
    paragraphs: [
      'In 1883, French mathematician Édouard Lucas invented the Tower of Hanoi, marketing it under the pen name "Prof. N. Claus de Siam."',
      'To enchant players, Lucas invented the myth of a Benares temple where priests moved 64 golden disks whose transfer would mark the end of time. Lucas calculated the duration himself: at one move per second, the 2\u2076\u2074 \u2212 1 required moves would take roughly 585 billion years.',
    ],
    companionGameId: 'tower-of-hanoi',
    companionName: 'Tower of Hanoi',
  },
  {
    id: 'planar-graphs',
    title: 'Planar Graphs and Untangling Knots',
    theme: 'Topology',
    readTime: '1 min',
    paragraphs: [
      "In graph theory, Kuratowski's theorem defines the precise mathematical conditions under which interconnected webs can lie flat without any lines intersecting.",
      'The tactile satisfaction of dragging nodes apart until no lines cross taps directly into spatial cognition. The brain naturally seeks visual equilibrium, releasing tension as overlapping lines resolve into an open, orderly layout.',
    ],
    companionGameId: 'untangle',
    companionName: 'Untangle',
  },
  {
    id: 'nikoli-craft',
    title: 'Nikoli and the Human Touch',
    theme: 'Craft & Philosophy',
    readTime: '1 min',
    paragraphs: [
      'While modern software uses automated algorithms to spit out endless procedural puzzle grids, legendary Japanese publisher Nikoli still insists its grids be designed and tested by hand.',
      'Their editorial philosophy argues that while code can verify mathematical validity, only a human constructor designs an emotional narrative—moments of tension, gentle misdirection, and the quiet satisfaction of unlocking a deduction.',
    ],
    companionGameId: 'slitherlink',
    companionName: 'Slitherlink',
  },
  {
    id: 'scrabble-letters',
    title: 'The Architect Who Counted Letters',
    theme: 'Word History',
    readTime: '1 min',
    paragraphs: [
      'In 1938, during the Great Depression, unemployed architect Alfred Mosher Butts decided to design a word game based on statistical frequency.',
      'He manually tallied how often individual letters appeared on the front pages of The New York Times and The Saturday Evening Post. That manual inventory established the exact tile distributions and point values that still anchor anagram and word puzzles today.',
    ],
    companionGameId: 'anagrams',
    companionName: 'Anagrams',
  },
  {
    id: 'magic-squares',
    title: 'The Magic Squares of the Luo River',
    theme: 'Ancient Logic',
    readTime: '1 min',
    paragraphs: [
      'Kakuro traces its conceptual lineage back thousands of years to ancient magic squares.',
      'Chinese legend told of a divine turtle emerging from the Luo River with a 3\xd73 grid pattern on its shell, where every row, column, and diagonal summed to fifteen. Ancient cultures treated numerical equilibrium as a symbol of balance: numbers that balance equally in all directions cannot be destabilized.',
    ],
    companionGameId: 'kakuro',
    companionName: 'Kakuro',
  },
  {
    id: 'mastermind-cryptography',
    title: 'The Cryptographic Roots of Mastermind',
    theme: 'Information Theory',
    readTime: '1 min',
    paragraphs: [
      'Mastermind was created in 1970 by Mordecai Meirowitz, an Israeli telecommunications expert who pitched the game to dismissive toy executives for years before finding a publisher.',
      'It captured global attention because it simulated the raw tension of cryptanalysis: testing a hypothesis, receiving binary feedback, and systematically dismantling uncertainty step by step.',
    ],
    companionGameId: 'mastermind',
    companionName: 'Mastermind',
  },
  {
    id: 'carroll-doublets',
    title: "Lewis Carroll's Christmas Word Game",
    theme: 'Literature',
    readTime: '1 min',
    paragraphs: [
      'Lewis Carroll, author of Alice in Wonderland, was primarily a mathematician and logician at Oxford University.',
      'On Christmas Day in 1877, to entertain two bored children, he invented the "Doublet"—transforming one word into another by swapping a single letter per step. Published later in Vanity Fair, the puzzle demonstrated that language could be navigated with the clean rigor of arithmetic.',
    ],
    companionGameId: 'word-ladder',
    companionName: 'Word Ladder',
  },
  {
    id: 'shikaku-rooms',
    title: 'The Psychology of Carving Space',
    theme: 'Perception',
    readTime: '1 min',
    paragraphs: [
      'Dividing undefined space into tidy, coherent rooms is an innate human instinct. In Shikaku, players partition a grid into clean rectangles guided by single numeric clues.',
      'Cognitive researchers note that human pattern recognition experiences relief when ambiguous open territory is brought into order—a quiet satisfaction inherited from our primal need for structured shelter.',
    ],
    companionGameId: 'shikaku',
    companionName: 'Shikaku',
  },
  {
    id: 'lights-out-mod2',
    title: 'Linear Algebra and Grid State Inversions',
    theme: 'Discrete Mathematics',
    readTime: '1 min',
    paragraphs: [
      'Every button press in a toggle grid acts as an addition in the binary field GF(2).',
      'Because every toggle is commutative and its own inverse, the order of moves never matters — only the set of cells activated. Lights Out illustrates how linear algebra turns chaotic cascading toggles into a solvable system of equations.',
    ],
    companionGameId: 'lights-out',
    companionName: 'Lights Out',
  },
  {
    id: 'checkers-forced-jumps',
    title: 'The Power of Forced Jumps',
    theme: 'Game Theory',
    readTime: '1 min',
    paragraphs: [
      'In traditional checkers, capturing an opposing piece when available is strictly mandatory. That single rule elevates a simple pastime into deep strategic territory.',
      'Mastery revolves around deliberately sacrificing pieces, compelling the opponent into compromised positions to open lanes for decisive multi-jump breakthroughs.',
    ],
    companionGameId: 'checkers',
    companionName: 'Checkers',
  },
  {
    id: 'crossword-origins',
    title: 'The Accidental Holiday Word Grid',
    theme: 'Print History',
    readTime: '1 min',
    paragraphs: [
      'In December 1913, Liverpool-born journalist Arthur Wynne needed a holiday filler feature for the New York World Sunday supplement.',
      'He designed a diamond-shaped grid titled "Word-Cross." Readers flooded the paper with letters demanding more, turning a last-minute newsroom filler into a timeless daily mental ritual.',
    ],
    companionGameId: 'crossword',
    companionName: 'Crossword',
  },
  {
    id: 'powers-of-two',
    title: 'The Geometric Rhythm of Powers of Two',
    theme: 'Number Flow',
    readTime: '1 min',
    paragraphs: [
      'The satisfaction of sliding tiles in 2048 comes from exponential doubling: 2, 4, 8, 16, and onward. Each step demands twice the work of the last.',
      'Because grid space shrinks as numbers climb, victory relies on keeping a stable corner anchor and maintaining clean directional flow—turning elementary arithmetic into an exercise in spatial preservation.',
    ],
    companionGameId: '2048',
    companionName: '2048',
  },
]

/**
 * Returns the essay for today, deterministically derived from the day-of-year.
 * Fully offline — no network, no localStorage required.
 * Rotates through all 20 essays in order, cycling annually.
 */
export function getDailyEssay() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((now - start) / 86_400_000)
  return ESSAYS[dayOfYear % ESSAYS.length]
}

/**
 * Look up an essay by its id string.
 * Falls back to the first essay if no match is found.
 *
 * @param {string} id
 * @returns {object} essay
 */
export function getEssayById(id) {
  return ESSAYS.find((e) => e.id === id) || ESSAYS[0]
}
