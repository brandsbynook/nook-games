/**
 * wordLadderPuzzles.js — Curated word ladder pairs & dictionary re-exports
 */

export {
  DICTIONARY_SET,
  isValidWord,
  countLetterDifferences,
  getDiffIndex,
} from './wordLadderDictionary.js'

export const WORD_LADDER_PUZZLES = [
  {
    id: 'cold-warm',
    start: 'COLD',
    target: 'WARM',
    length: 4,
    difficulty: 'Easy',
    optimalSteps: 4, // COLD -> CORD -> CARD -> WARD -> WARM (or COLD -> GOLD -> GOAD...)
    hint: 'Think of cords and cards.',
  },
  {
    id: 'lead-gold',
    start: 'LEAD',
    target: 'GOLD',
    length: 4,
    difficulty: 'Easy',
    optimalSteps: 3, // LEAD -> LOAD -> GOAD -> GOLD
    hint: 'Carry a heavy load along the way.',
  },
  {
    id: 'head-tail',
    start: 'HEAD',
    target: 'TAIL',
    length: 4,
    difficulty: 'Moderate',
    optimalSteps: 5, // HEAD -> HEAL -> TEAL -> TELL -> TALL -> TAIL
    hint: 'Heal the teal, tell a tall tale.',
  },
  {
    id: 'word-game',
    start: 'WORD',
    target: 'GAME',
    length: 4,
    difficulty: 'Moderate',
    optimalSteps: 5, // WORD -> WORM -> FORM -> FORE -> FARE -> FAME -> GAME
    hint: 'Worms form the fame of the game.',
  },
  {
    id: 'sleep-dream',
    start: 'SLEEP',
    target: 'DREAM',
    length: 5,
    difficulty: 'Moderate',
    optimalSteps: 6, // SLEEP -> BLEEP -> BLEED -> BREED -> BREAD -> DREAD -> DREAM
    hint: 'Bleep, bleed, breed, bread, dread.',
  },
  {
    id: 'stone-water',
    start: 'STONE',
    target: 'WATER',
    length: 5,
    difficulty: 'Peaceful',
    optimalSteps: 6,
    hint: 'Shone to share or cater.',
  },
]
