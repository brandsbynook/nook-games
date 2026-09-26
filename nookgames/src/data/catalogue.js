export const collections = [
  {
    id: 'strategy',
    title: 'Strategy',
    description: 'Plan ahead. Hold your ground.',
    tagline: 'Plan ahead. Hold your ground.',
    icon: 'strategy',
    games: [
      {
        id: 'chess',
        title: 'Chess',
        category: 'strategy',
        description: 'Classic strategy. Contemplate each move in quiet stillness against the system.',
        quote: 'The board remembers every intention.',
        about: "A two-player abstract game where you command sixteen pieces to checkmate the opponent's king.",
        bestFor: 'Deep strategic thinking and foresight.',
        origin: 'Originated in India around the 6th century CE as Chaturanga, reaching modern form in 15th-century Europe.',
        howToPlay: "Move pieces according to their unique rules. Threaten the opponent's king with inevitable capture.",
        difficulty: 'Hard',
        timeEstimate: '15–90 min',
        isPlayable: true,
      },
      {
        id: 'checkers',
        title: 'Checkers',
        category: 'strategy',
        description: 'Classic draughts. Maneuver across diagonals and crown your pieces in quiet focus.',
        quote: 'The diagonal world has its own laws.',
        about: 'Move pieces diagonally and jump over opponents. Reach the far side to become a King.',
        bestFor: 'Tactical captures and forward planning.',
        origin: 'Descended from Alquerque (Egypt, ~1400 BCE). Computationally solved by Jonathan Schaeffer in 2007.',
        howToPlay: 'Move diagonally forward. Capture by jumping over opponent pieces. Kings move in any diagonal direction.',
        difficulty: 'Easy',
        timeEstimate: '10–20 min',
        isPlayable: true,
      },
      {
        id: 'reversi',
        title: 'Reversi',
        category: 'strategy',
        quote: 'To place is to transform.',
        about: 'Place discs to flip all opponent discs flanked between yours. The player with most discs wins.',
        bestFor: 'Tactical thinking and positional awareness.',
        origin: 'Invented in England in 1883; repackaged as Othello in Japan in 1971.',
        howToPlay: 'Place a disc so it flanks opponent discs in a line. All flanked discs flip to your colour.',
        difficulty: 'Moderate',
        timeEstimate: '10–30 min',
        isPlayable: true,
      },
      {
        id: 'gomoku',
        title: 'Gomoku',
        category: 'strategy',
        description: 'Ancient five-in-a-row stone alignment. Align quiet intent on intersection lines.',
        quote: 'Five stones in harmony.',
        about: 'Place black and white stones on a grid. The first player to align five continuous stones horizontally, vertically, or diagonally wins.',
        bestFor: 'Spatial foresight and tactical pattern recognition.',
        origin: 'Originated in China as Wuziqi and refined in Japan since the Meiji era as Gomoku-Narabe.',
        howToPlay: 'Tap grid intersections to place your stone (Black). Connect 5 stones in an unbroken row before the system (White) does.',
        difficulty: 'Moderate',
        timeEstimate: '5–15 min',
        isPlayable: true,
      },
      {
        id: 'knights-tour',
        title: "Knight's Tour",
        category: 'strategy',
        description: 'Traverse every square on the board once and only once using pure knight jumps.',
        quote: 'Every square, visited once.',
        about: 'Move a chess knight to visit every square on the board exactly once — a Hamiltonian path problem.',
        bestFor: 'Algorithmic thinking and spatial memory.',
        origin: 'Recorded as early as the 9th century in Arabic manuscripts. Euler found a closed tour in 1759.',
        howToPlay: 'Place a knight and move it in L-shapes. Visit every square exactly once.',
        difficulty: 'Hard',
        timeEstimate: '15–40 min',
        isPlayable: true,
      },
    ],
  },
  {
    id: 'logic',
    title: 'Logic',
    description: 'Read the grid. Find the fit.',
    tagline: 'Read the grid. Find the fit.',
    icon: 'logic',
    games: [
      {
        id: 'sudoku',
        title: 'Sudoku',
        category: 'logic',
        quote: 'Every answer exists.',
        about: 'Fill the 9×9 grid so that every row, column, and 3×3 box contains the numbers 1 to 9 exactly once.',
        bestFor: 'Logic, focus, and problem solving.',
        origin: 'Switzerland, 18th century. Popularised as Number Place in the 1970s and as Sudoku in Japan in the 1980s.',
        howToPlay: 'Each row, column and 3×3 box must contain the digits 1–9 without repetition.',
        difficulty: 'Moderate',
        timeEstimate: '10–25 min',
        isPlayable: true,
      },
      {
        id: 'nonogram',
        title: 'Nonogram',
        category: 'logic',
        quote: 'The picture is in the numbers.',
        about: 'Fill or leave cells blank to reveal a hidden picture, guided only by number clues.',
        bestFor: 'Deductive reasoning.',
        origin: 'Japan, 1980s. Also known as Picross or Griddlers.',
        howToPlay: 'Each row and column clue lists the lengths of consecutive filled blocks in order.',
        difficulty: 'Moderate',
        timeEstimate: '5–15 min',
        isPlayable: true,
      },
      {
        id: 'kakuro',
        title: 'Kakuro',
        category: 'logic',
        quote: 'Sums that fit.',
        about: 'Fill white cells with digits 1–9 so that each run of cells sums to its clue and no digit repeats.',
        bestFor: 'Arithmetic reasoning and patience.',
        origin: 'First published in the US in 1966 as Cross Sums, then reintroduced to Japan by Nikoli in 1980.',
        howToPlay: 'Each horizontal and vertical run must sum to its clue number using unique digits 1–9.',
        difficulty: 'Hard',
        timeEstimate: '20–45 min',
        isPlayable: true,
      },
      {
        id: 'slitherlink',
        title: 'Slitherlink',
        category: 'logic',
        quote: 'One loop, perfectly closed.',
        about: 'Draw a single closed loop through the grid so every numbered cell has that many sides on the loop.',
        bestFor: 'Topological logic.',
        origin: 'Japan, published by Nikoli in 1989.',
        howToPlay: 'Connect dots to form a single non-crossing loop respecting all cell clues.',
        difficulty: 'Hard',
        timeEstimate: '20–50 min',
        isPlayable: true,
      },
      {
        id: 'shikaku',
        title: 'Shikaku',
        category: 'logic',
        quote: 'Rooms carved in pure proportion.',
        about: 'Divide the grid into rectangular rooms such that each room contains exactly one number clue equal to its area.',
        bestFor: 'Geometric deduction and spatial logic.',
        origin: 'Japan, published by Nikoli under the name Shikaku ni Kire (Cut into Rectangles).',
        howToPlay: 'Drag or select two corners to form rectangles. Each room must contain one number matching its total cells. Cover the entire board without overlapping.',
        difficulty: 'Moderate',
        timeEstimate: '5–15 min',
        isPlayable: true,
      },
    ],
  },
  {
    id: 'sequence',
    title: 'Sequence',
    description: 'Move with care. Find the flow.',
    tagline: 'Move with care. Find the flow.',
    icon: 'sequence',
    games: [
      {
        id: '15-puzzle',
        title: '15 Puzzle',
        category: 'sequence',
        quote: 'One space. Infinite paths.',
        about: 'Slide fifteen numbered tiles in a 4×4 grid using the single blank space to restore numerical order.',
        bestFor: 'Spatial thinking and sequential planning.',
        origin: 'A craze in 1880s North America, invented around 1874. Mathematicians proved half of all positions are unsolvable.',
        howToPlay: 'Slide tiles into the blank space. Arrange 1–15 left-to-right, top-to-bottom, blank in the bottom-right.',
        difficulty: 'Moderate',
        timeEstimate: '2–10 min',
        isPlayable: true,
      },
      {
        id: 'tower-of-hanoi',
        title: 'Tower of Hanoi',
        category: 'sequence',
        quote: 'Recursion made physical.',
        about: 'Move a stack of differently-sized discs from one rod to another, never placing a larger disc on a smaller one.',
        bestFor: 'Recursive thinking and problem decomposition.',
        origin: 'Invented by Édouard Lucas in 1883 with a legend of 64 golden discs marking the end of the world.',
        howToPlay: 'Move one disc at a time. Never place a larger disc on a smaller one. Complete in 2ⁿ − 1 moves.',
        difficulty: 'Moderate',
        timeEstimate: '5–15 min',
        isPlayable: true,
      },
      {
        id: 'one-line',
        title: 'One Line',
        category: 'sequence',
        quote: 'The stroke that cannot revisit.',
        about: 'Trace a single unbroken line that passes through every edge of the figure exactly once.',
        bestFor: 'Graph traversal intuition.',
        origin: "Rooted in Euler's 1736 Seven Bridges of Königsberg — the founding moment of graph theory.",
        howToPlay: 'Trace a path using each edge exactly once without lifting your finger.',
        difficulty: 'Easy',
        timeEstimate: '1–5 min',
        isPlayable: true,
      },
      {
        id: '2048',
        title: '2048',
        category: 'sequence',
        quote: 'Merge. Again. Always merge.',
        about: 'Slide tiles on a 4×4 grid to merge equal-value tiles and reach the 2048 tile.',
        bestFor: 'Strategic planning and quick decisions.',
        origin: 'Created by 19-year-old Gabriele Cirulli in March 2014 over a single weekend. It went viral immediately.',
        howToPlay: 'Swipe to slide all tiles. Matching tiles merge into their sum. Reach 2048 to win.',
        difficulty: 'Easy',
        timeEstimate: '5–30 min',
        isPlayable: true,
      },
      {
        id: 'untangle',
        title: 'Untangle',
        category: 'sequence',
        quote: 'Every knot has a geometry of release.',
        about: 'Drag nodes of a planar graph until no two edges cross.',
        bestFor: 'Spatial reasoning and graph intuition.',
        origin: "Created by John Tantalo in 2005, inspired by Euler's 1736 planar graph theory.",
        howToPlay: 'Drag nodes to new positions until every edge is crossing-free.',
        difficulty: 'Moderate',
        timeEstimate: '5–20 min',
        isPlayable: true,
      },
    ],
  },
  {
    id: 'cipher',
    title: 'Cipher',
    description: 'Crack the code. Find the word.',
    tagline: 'Crack the code. Find the word.',
    icon: 'cipher',
    games: [
      {
        id: 'word-ladder',
        title: 'Word Ladder',
        category: 'cipher',
        quote: 'One letter at a time.',
        about: 'Transform one word into another by changing a single letter at each step through valid words.',
        bestFor: 'Vocabulary breadth and lateral thinking.',
        origin: 'Invented by Lewis Carroll in 1877 and published as Doublets in Vanity Fair magazine.',
        howToPlay: 'Each step must be a valid word. Change exactly one letter per step.',
        difficulty: 'Easy',
        timeEstimate: '2–10 min',
        isPlayable: true,
      },
      {
        id: 'crossword',
        title: 'Crossword',
        category: 'cipher',
        quote: 'The intersection of knowledge and language.',
        about: 'Fill a grid of interlocking words using definitional or cryptic clues for Across and Down answers.',
        bestFor: 'Vocabulary, general knowledge, and wordplay.',
        origin: 'Invented by Arthur Wynne, published in the New York World on December 21, 1913.',
        howToPlay: 'Fill numbered cells with answers to Across and Down clues. Intersecting letters must agree.',
        difficulty: 'Moderate',
        timeEstimate: '10–30 min',
        isPlayable: true,
      },
      {
        id: 'anagrams',
        title: 'Anagrams',
        category: 'cipher',
        quote: 'Every word is hiding another word.',
        about: 'Rearrange a set of scrambled letters to discover all valid words hidden within them.',
        bestFor: 'Vocabulary and pattern recognition.',
        origin: 'Anagrams have been composed since ancient times in Greek and Hebrew scholarship.',
        howToPlay: 'Arrange the given letters to form valid dictionary words. Longer words score higher.',
        difficulty: 'Easy',
        timeEstimate: '2–10 min',
        isPlayable: true,
      },
      {
        id: 'mastermind',
        title: 'Mastermind',
        category: 'cipher',
        quote: 'Every deduction narrows the realm of possibility.',
        about: 'Crack the hidden 4-color code through stepwise feedback and logical elimination.',
        bestFor: 'Deductive elimination and combinatorial reasoning.',
        origin: 'Invented in 1970 by Mordecai Meirowitz, rooted in the traditional code game Bulls and Cows.',
        howToPlay: 'Guess the 4-peg color code. Solid pips mean right color in right position; hollow rings mean right color in wrong position.',
        difficulty: 'Moderate',
        timeEstimate: '3–10 min',
        isPlayable: true,
      },
      {
        id: 'lights-out',
        title: 'Lights Out',
        category: 'cipher',
        description: 'Toggle lanterns into serene darkness.',
        quote: 'Silence restored to the grid.',
        about: 'Toggle tiles to invert their state and adjacent neighbors until all lights are dark tranquility.',
        bestFor: 'Pattern logic and spatial deduction.',
        origin: 'Invented by Tiger Electronics in 1995. Grounded in modulo-2 linear algebra.',
        howToPlay: 'Tap any tile to toggle it and its orthogonal neighbors. Turn all lights off.',
        difficulty: 'Easy',
        timeEstimate: '2–10 min',
        isPlayable: true,
      },
    ],
  },
]

export function getCollection(id) {
  if (!id) return null
  const normalized = id.toLowerCase()
  if (normalized === 'spatial') {
    return collections.find((c) => c.id === 'sequence') ?? null
  }
  if (
    normalized === 'words' ||
    normalized === 'words-reasoning' ||
    normalized === 'word-reasoning' ||
    normalized === 'reasoning' ||
    normalized === 'deduction'
  ) {
    return collections.find((c) => c.id === 'cipher') ?? null
  }
  return collections.find((collection) => collection.id === normalized) ?? null
}

export function getGame(id) {
  for (const collection of collections) {
    const game = collection.games.find((entry) => entry.id === id)
    if (game) {
      return { game, collection }
    }
  }
  return null
}

export function getGameById(id) {
  for (const collection of collections) {
    const game = collection.games.find((entry) => entry.id === id)
    if (game) {
      return game
    }
  }
  return null
}

