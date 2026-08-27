export const collections = [
  {
    id: 'logic',
    title: 'Logic',
    description: 'Grid puzzles solved by quiet deduction.',
    icon: 'logic',
    games: [
      { id: 'sudoku', title: 'Sudoku' },
      { id: 'nonogram', title: 'Nonogram' },
      { id: 'kakuro', title: 'Kakuro' },
      { id: 'slitherlink', title: 'Slitherlink' },
      { id: 'shikaku', title: 'Shikaku' },
    ],
  },
  {
    id: 'spatial',
    title: 'Spatial',
    description: 'Path, arrangement and motion puzzles.',
    icon: 'spatial',
    games: [
      { id: 'untangle', title: 'Untangle' },
      { id: 'arrow-puzzle', title: 'Arrow Puzzle' },
      { id: 'one-line', title: 'One Line' },
      { id: '15-puzzle', title: '15 Puzzle' },
      { id: '2048', title: '2048' },
    ],
  },
  {
    id: 'strategy',
    title: 'Strategy',
    description: 'Turn-based games of position and patience.',
    icon: 'strategy',
    games: [
      { id: 'chess', title: 'Chess' },
      { id: 'knights-tour', title: "Knight's Tour" },
      { id: 'go', title: 'Go' },
      { id: 'reversi', title: 'Reversi' },
      { id: 'checkers', title: 'Checkers' },
    ],
  },
  {
    id: 'words-reasoning',
    title: 'Words & Reasoning',
    description: 'Language and stepwise reasoning puzzles.',
    icon: 'words',
    games: [
      { id: 'crossword', title: 'Crossword' },
      { id: 'anagrams', title: 'Anagrams' },
      { id: 'word-ladder', title: 'Word Ladder' },
      { id: 'reasoning-puzzles', title: 'Reasoning Puzzles' },
      { id: 'tower-of-hanoi', title: 'Tower of Hanoi' },
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
