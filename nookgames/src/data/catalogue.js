export const collections = [
  {
    id: 'logic',
    title: 'Logic',
    description: 'Grid puzzles solved by quiet deduction.',
    icon: 'logic',
    games: [
      {
        id: 'sudoku',
        title: 'Sudoku',
        category: 'logic',
        quote: 'Order emerges from constraint.',
        about:
          'Sudoku is a number-placement puzzle played on a 9×9 grid divided into nine 3×3 boxes. Each row, column, and box must contain every digit from 1 to 9 exactly once. No arithmetic is involved — only pure logical deduction.',
        origin:
          'Popularised worldwide by Japanese publisher Nikoli in 1984 under the name 数独 (sūdoku, "single number"), the puzzle format traces its roots to 18th-century Latin Squares studied by mathematician Leonhard Euler.',
        howToPlay:
          'Fill every empty cell with a digit 1–9. Each row, each column, and each 3×3 box must contain all nine digits with no repetition. Start with cells that have only one legal candidate and expand outward.',
        difficulty: 'Moderate',
        timeEstimate: '10–25 min',
        isPlayable: true,
      },
      {
        id: 'nonogram',
        title: 'Nonogram',
        category: 'logic',
        quote: 'A picture hidden in numbers.',
        about:
          'Nonograms are picture logic puzzles where you paint cells in a grid to reveal a hidden pixel image. Clue numbers on the edges of each row and column describe the lengths of consecutive filled blocks, in order.',
        origin:
          'Independently invented by Non Ishida and Tetsuya Nishio in Japan in 1987. Non Ishida won a competition with a design inspired by skyscraper windows, giving the puzzle its Japanese name "お絵かきロジック" (logic art).',
        howToPlay:
          'For each row and column, the number clues tell you how many consecutive filled cells appear, in sequence. Use logic to determine which cells must be filled and which must be empty. When every row and column matches its clues, the image is revealed.',
        difficulty: 'Moderate',
        timeEstimate: '15–40 min',
        isPlayable: false,
      },
      {
        id: 'kakuro',
        title: 'Kakuro',
        category: 'logic',
        quote: 'Sums that demand precision.',
        about:
          'Kakuro is a crossword-style number puzzle. White cells must be filled with digits 1–9 so that consecutive groups sum to the value shown in their clue cell, and no digit repeats within a single sum.',
        origin:
          'First published in 1966 in the US as "Cross Sums" by Dell Magazines, Kakuro was reintroduced to Japan by Nikoli in 1980 where it became widely popular under its current name, derived from 加算クロス (kasan kurosu, "addition cross").',
        howToPlay:
          'Place digits 1–9 in white cells so each horizontal and vertical run sums to its clue number. No digit may repeat in a single run. Clue numbers appear in grey cells — above the diagonal for the vertical run, below for the horizontal run.',
        difficulty: 'Hard',
        timeEstimate: '20–45 min',
        isPlayable: false,
      },
      {
        id: 'slitherlink',
        title: 'Slitherlink',
        category: 'logic',
        quote: 'Draw the loop that completes itself.',
        about:
          'Slitherlink asks you to draw a single unbroken loop through a grid of dots. Numbers inside cells indicate exactly how many of that cell\'s four sides the loop must pass through — and the loop must never cross or branch.',
        origin:
          'Created by Nikoli and first published in 1989. The puzzle is also known as Fences, Loop the Loop, and Loopy. Its elegant constraint — a single closed loop — gives it a meditative quality that has made it a classic logic genre.',
        howToPlay:
          'Connect adjacent dots with horizontal or vertical line segments to form a single closed loop. Each numbered cell must have exactly that many of its sides on the loop. Empty cells may have any number of sides on the loop.',
        difficulty: 'Hard',
        timeEstimate: '20–50 min',
        isPlayable: false,
      },
      {
        id: 'shikaku',
        title: 'Shikaku',
        category: 'logic',
        quote: 'Partition the space without remainder.',
        about:
          'Shikaku is a spatial division puzzle. A rectangular grid contains numbered cells; you must partition the entire grid into non-overlapping rectangles such that each rectangle contains exactly one number, and that number equals the rectangle\'s area.',
        origin:
          'Published by Nikoli in 2005, Shikaku (四角に切れ, meaning "divide into squares") is one of Nikoli\'s more recent classic puzzles. Its clean rules and satisfying geometry have earned it a dedicated following.',
        howToPlay:
          'Divide the grid into rectangles. Every rectangle must contain exactly one number clue, and its area (width × height in cells) must equal that number. All cells must belong to exactly one rectangle.',
        difficulty: 'Easy',
        timeEstimate: '5–15 min',
        isPlayable: false,
      },
    ],
  },
  {
    id: 'spatial',
    title: 'Spatial',
    description: 'Path, arrangement and motion puzzles.',
    icon: 'spatial',
    games: [
      {
        id: '15-puzzle',
        title: '15 Puzzle',
        category: 'spatial',
        quote: 'One space. Infinite paths. One solution.',
        about:
          'The 15 Puzzle is a classic sliding tile puzzle consisting of fifteen numbered tiles arranged in a 4×4 grid with one blank space. By sliding tiles into the blank, you must reach a target ordered arrangement.',
        origin:
          'Invented in the 1870s, possibly by Sam Loyd or Noyes Palmer Chapman. It became a craze in 1880, captivating the public across North America and Europe. Mathematicians proved that exactly half of all scrambled states are solvable.',
        howToPlay:
          'Slide tiles horizontally or vertically into the empty space. Rearrange all 15 numbered tiles into numerical order (1–15 left-to-right, top-to-bottom) with the blank in the bottom-right corner.',
        difficulty: 'Moderate',
        timeEstimate: '2–10 min',
        isPlayable: true,
      },
      {
        id: 'untangle',
        title: 'Untangle',
        category: 'spatial',
        quote: 'Every knot has a geometry of release.',
        about:
          'Untangle presents a planar graph with nodes and edges drawn in a tangled configuration. Your task is to drag nodes to new positions until no two edges cross, revealing the graph\'s true planar embedding.',
        origin:
          'Untangle (also known as Planarity) was created by John Tantalo in 2005 as a web game, inspired by the mathematical concept of planar graphs studied since Euler\'s Seven Bridges of Königsberg problem in 1736.',
        howToPlay:
          'Drag the coloured nodes around the canvas. The goal is to position every node so that no two edges cross each other. A crossing edge turns red; a clean edge is white. The puzzle is solved when all edges are uncrossed.',
        difficulty: 'Moderate',
        timeEstimate: '5–20 min',
        isPlayable: false,
      },
      {
        id: 'arrow-puzzle',
        title: 'Arrow Puzzle',
        category: 'spatial',
        quote: 'Every arrow knows where it wants to point.',
        about:
          'Arrow Puzzle presents a grid of cells, each containing an arrow pointing in one of eight directions. Rotate the arrows by clicking or tapping to create a valid flow — every arrow must point toward the next step in a chain that covers the whole board.',
        origin:
          'Arrow puzzles exist across many traditions under names like "Lights Out" variants and directional flow puzzles, popularised in the mobile gaming era of the early 2010s for their intuitive yet deeply challenging mechanic.',
        howToPlay:
          'Tap each cell to rotate its arrow. Arrange all arrows so that following the direction of each arrow eventually connects every cell in a single coherent path or network as specified by the puzzle rules.',
        difficulty: 'Easy',
        timeEstimate: '5–15 min',
        isPlayable: false,
      },
      {
        id: 'one-line',
        title: 'One Line',
        category: 'spatial',
        quote: 'The stroke that cannot revisit.',
        about:
          'One Line (also known as Eulerian Path puzzles) challenges you to draw a single unbroken line that passes through every edge of a given figure exactly once, without lifting your finger or revisiting an edge.',
        origin:
          'Rooted in Leonhard Euler\'s 1736 solution to the Seven Bridges of Königsberg problem — the founding moment of graph theory. Euler proved that such a path exists only when a graph has exactly zero or two nodes of odd degree.',
        howToPlay:
          'Trace a path starting from any node. Your line must travel along each edge exactly once. You may revisit nodes but never an edge. The puzzle is complete when every edge has been drawn.',
        difficulty: 'Easy',
        timeEstimate: '1–5 min',
        isPlayable: false,
      },
      {
        id: '2048',
        title: '2048',
        category: 'spatial',
        quote: 'Merge. Again. Always merge.',
        about:
          '2048 is a single-player sliding tile game on a 4×4 grid. Tiles bearing powers of two slide and merge when they collide with equal-value tiles. The goal is to create a tile bearing the number 2048.',
        origin:
          'Created by 19-year-old Italian developer Gabriele Cirulli in March 2014 in a single weekend, as an experiment in JavaScript. It went viral within days and became one of the most-cloned browser games in history.',
        howToPlay:
          'Swipe (or use arrow keys) to slide all tiles in one direction. Tiles with the same value merge into their sum. A new tile (2 or 4) appears after each move. Reach the 2048 tile to win — or keep going for a higher score.',
        difficulty: 'Easy',
        timeEstimate: '5–30 min',
        isPlayable: false,
      },
    ],
  },
  {
    id: 'strategy',
    title: 'Strategy',
    description: 'Turn-based games of position and patience.',
    icon: 'strategy',
    games: [
      {
        id: 'knights-tour',
        title: "Knight's Tour",
        category: 'strategy',
        quote: 'Every square, visited once, never twice.',
        about:
          "The Knight's Tour is a chess puzzle in which a knight must visit every square of the board exactly once. It is a special case of the Hamiltonian path problem in mathematics, with deep connections to graph theory.",
        origin:
          "Recorded as early as the 9th century in Arabic manuscripts. The problem fascinated mathematicians from Euler (who found a closed tour in 1759) to Warnsdorff, whose 1823 heuristic still bears his name and guides most efficient solutions today.",
        howToPlay:
          "Place a knight on any square and move it according to chess rules (L-shapes: two squares in one direction, one perpendicular). Visit every square on the board exactly once. A closed tour returns to the starting square; an open tour ends anywhere.",
        difficulty: 'Hard',
        timeEstimate: '15–40 min',
        isPlayable: false,
      },
      {
        id: 'chess',
        title: 'Chess',
        category: 'strategy',
        quote: 'The board remembers every intention.',
        about:
          'Chess is a two-player abstract strategy game played on an 8×8 grid. Each player commands sixteen pieces of different types with unique movement rules. The objective is to checkmate the opponent\'s king — to threaten it with inevitable capture.',
        origin:
          'Originating in India around the 6th century CE as Chaturanga, chess spread through Persia as Shatranj before taking its modern form in 15th-century Europe. It remains the most studied strategy game in the world.',
        howToPlay:
          'Players alternate turns moving one piece at a time. Each piece type has unique movement: pawns advance and capture diagonally, rooks move in straight lines, bishops diagonally, knights in L-shapes, queens any direction, kings one square. Capture the opponent\'s king to win.',
        difficulty: 'Hard',
        timeEstimate: '15–90 min',
        isPlayable: false,
      },
      {
        id: 'go',
        title: 'Go',
        category: 'strategy',
        quote: 'The oldest game still searching for its end.',
        about:
          'Go is a two-player abstract strategy board game originating in China over 2,500 years ago. Players alternately place black and white stones on the intersections of a 19×19 grid, aiming to surround and capture more territory than the opponent.',
        origin:
          'The oldest board game still widely played, Go (围棋, Wéiqí) dates to at least 500 BCE in China. It spread to Korea and Japan, where it became deeply embedded in culture. AlphaGo\'s 2016 victory over human champions shocked the world.',
        howToPlay:
          'Place stones on intersections of the grid on your turn. A group of stones with no liberties (empty adjacent intersections) is captured and removed. The player who surrounds the most territory wins. Simple rules, boundless depth.',
        difficulty: 'Very Hard',
        timeEstimate: '30–120 min',
        isPlayable: false,
      },
      {
        id: 'reversi',
        title: 'Reversi',
        category: 'strategy',
        quote: 'To place is to transform.',
        about:
          'Reversi (marketed as Othello) is a two-player strategy game on an 8×8 board. Placing a disc flanks one or more of the opponent\'s discs in a straight line, flipping them to your colour. The player with the most discs at the end wins.',
        origin:
          'Invented in England in 1883, simultaneously by Lewis Waterman and John W. Mollett. It was repackaged and popularised as Othello by Goro Hasegawa in Japan in 1971, and remains one of the most widely-played abstract strategy games.',
        howToPlay:
          'Place a disc of your colour so that it flanks at least one row, column, or diagonal of opponent discs between it and another of your discs. All flanked discs flip to your colour. You must always play a valid move if one exists.',
        difficulty: 'Moderate',
        timeEstimate: '10–30 min',
        isPlayable: false,
      },
      {
        id: 'checkers',
        title: 'Checkers',
        category: 'strategy',
        quote: 'The diagonal world has its own laws.',
        about:
          'Checkers (Draughts) is a two-player board game on an 8×8 grid. Pieces move diagonally and capture by jumping over opponent pieces. A piece reaching the far side becomes a King, gaining the ability to move backwards.',
        origin:
          'Descended from an ancient game called Alquerque played in Egypt as early as 1400 BCE. The modern diagonal form on a chessboard appears in 12th-century France. Checkers was solved computationally in 2007 by Jonathan Schaeffer.',
        howToPlay:
          'Move your pieces diagonally forward. Capture opponent pieces by jumping over them to an empty square. Multiple jumps in one turn are mandatory if available. King pieces can move and jump diagonally in any direction. Capture all opponent pieces or block them completely to win.',
        difficulty: 'Easy',
        timeEstimate: '10–20 min',
        isPlayable: false,
      },
    ],
  },
  {
    id: 'words-reasoning',
    title: 'Words & Reasoning',
    description: 'Language and stepwise reasoning puzzles.',
    icon: 'words',
    games: [
      {
        id: 'word-ladder',
        title: 'Word Ladder',
        category: 'words-reasoning',
        quote: 'From one word to another, one letter at a time.',
        about:
          'Word Ladder challenges you to transform one word into another by changing a single letter at each step. Every intermediate step must be a valid word. The puzzle is a graph traversal problem dressed in language.',
        origin:
          'Invented by Lewis Carroll (author of Alice in Wonderland) in 1877 and originally called "Doublets." Carroll published a regular Doublets column in Vanity Fair magazine from 1879 to 1881. It was one of the first published word puzzles of its kind.',
        howToPlay:
          'Start with the given word. Change exactly one letter to form a new valid word. Repeat until you reach the target word. Try to complete the transformation in as few steps as possible.',
        difficulty: 'Easy',
        timeEstimate: '2–10 min',
        isPlayable: false,
      },
      {
        id: 'crossword',
        title: 'Crossword',
        category: 'words-reasoning',
        quote: 'The intersection of knowledge and language.',
        about:
          'Crossword puzzles present a grid of white and black squares. Numbered white squares are the starting points for Across and Down answers. Clues — definitional, cryptic, or thematic — guide you to the correct words that interlock across the grid.',
        origin:
          'The modern crossword was invented by journalist Arthur Wynne and published in the New York World on December 21, 1913, making 2023 its 110th anniversary. The New York Times began publishing its famous crossword in 1942.',
        howToPlay:
          'Read each Across and Down clue and type the answer into the correspondingly numbered cells. Letters at the intersections of Across and Down answers must agree. The grid is complete when all cells are correctly filled.',
        difficulty: 'Moderate',
        timeEstimate: '10–30 min',
        isPlayable: false,
      },
      {
        id: 'anagrams',
        title: 'Anagrams',
        category: 'words-reasoning',
        quote: 'Every word is hiding another word.',
        about:
          'Anagrams rearrange the letters of a word or phrase to form a new word or phrase using exactly the same letters. The game presents scrambled letters; you must discover all valid anagrammatic words hidden within them.',
        origin:
          'Anagrams have been composed since ancient times — Greek and Hebrew scholars found mystical significance in rearranged letters. The word "anagram" itself comes from the Greek ana- (back, again) + gramma (letter).',
        howToPlay:
          'You are given a set of scrambled letters. Arrange all of them (or a subset) to form valid dictionary words. Points are awarded for each valid anagram found, with longer words scoring higher.',
        difficulty: 'Easy',
        timeEstimate: '2–10 min',
        isPlayable: false,
      },
      {
        id: 'reasoning-puzzles',
        title: 'Reasoning Puzzles',
        category: 'words-reasoning',
        quote: 'The clue is always present. Only attention is required.',
        about:
          'Reasoning Puzzles are a collection of logic riddles and deductive brainteasers — from classic river-crossing dilemmas and truth-teller/liar paradoxes to Einstein\'s Zebra puzzle and grid-based logic grids. Each puzzle rewards careful, systematic thinking.',
        origin:
          'Logic riddles appear in the oldest known written records. The Riddle of the Sphinx appears in ancient Greek myth. Medieval European scholars formulated river-crossing puzzles. Raymond Smullyan formalised truth-teller logic in the 20th century.',
        howToPlay:
          'Read the puzzle and its clues carefully. Use process of elimination and deductive reasoning to arrive at the unique solution. Some puzzles benefit from a grid or chart to track known and excluded possibilities.',
        difficulty: 'Hard',
        timeEstimate: '5–20 min',
        isPlayable: false,
      },
      {
        id: 'tower-of-hanoi',
        title: 'Tower of Hanoi',
        category: 'words-reasoning',
        quote: 'Recursion made physical.',
        about:
          'The Tower of Hanoi is a mathematical puzzle with three rods and a set of discs of different sizes stacked in ascending order on one rod. The objective is to move the entire stack to another rod, following strict rules about which disc may be placed on which.',
        origin:
          'Invented by French mathematician Édouard Lucas in 1883, accompanied by a legend of a Hindu temple housing a puzzle of 64 golden discs — when completed by monks, the world would end. At optimal pace, the 64-disc puzzle would take over 580 billion years.',
        howToPlay:
          'Move the entire stack of discs from the left rod to the right rod. Only one disc may be moved at a time. A disc may only be placed on an empty rod or on a larger disc. Never place a larger disc on a smaller one. Try to complete in the minimum 2ⁿ − 1 moves.',
        difficulty: 'Moderate',
        timeEstimate: '5–15 min',
        isPlayable: false,
      },
    ],
  },
]

export function getCollection(id) {
  return collections.find((collection) => collection.id === id) ?? null
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
