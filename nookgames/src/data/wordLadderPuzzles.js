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
  // ── Easy (4 Letters, 3-4 Steps) ──────────────────────────────
  {
    id: 'cold-warm',
    start: 'COLD',
    target: 'WARM',
    length: 4,
    difficulty: 'Easy',
    optimalSteps: 4,
    hint: 'Navigate through cord and card to reach warmth.',
  },
  {
    id: 'lead-gold',
    start: 'LEAD',
    target: 'GOLD',
    length: 4,
    difficulty: 'Easy',
    optimalSteps: 3,
    hint: 'Carry a heavy load before turning to gold.',
  },
  {
    id: 'dark-dawn',
    start: 'DARK',
    target: 'DAWN',
    length: 4,
    difficulty: 'Easy',
    optimalSteps: 4,
    hint: 'A quick dart through the dirt until light breaks.',
  },
  {
    id: 'poor-rich',
    start: 'POOR',
    target: 'RICH',
    length: 4,
    difficulty: 'Easy',
    optimalSteps: 4,
    hint: 'Pass by the boor and the book to find riches.',
  },

  // ── Moderate (4-5 Letters, 4-5 Steps) ────────────────────────
  {
    id: 'head-tail',
    start: 'HEAD',
    target: 'TAIL',
    length: 4,
    difficulty: 'Moderate',
    optimalSteps: 5,
    hint: 'Heal your step, then speak tall.',
  },
  {
    id: 'word-poem',
    start: 'WORD',
    target: 'POEM',
    length: 4,
    difficulty: 'Moderate',
    optimalSteps: 5,
    hint: 'Worn paths lead to poetic form.',
  },
  {
    id: 'fire-calm',
    start: 'FIRE',
    target: 'CALM',
    length: 4,
    difficulty: 'Moderate',
    optimalSteps: 5,
    hint: 'From the sparks of fame into tranquil quiet.',
  },
  {
    id: 'walk-stay',
    start: 'WALK',
    target: 'STAY',
    length: 4,
    difficulty: 'Moderate',
    optimalSteps: 5,
    hint: 'Conversations slow down to remaining present.',
  },

  // ── Deep (5 Letters, 5-6 Steps) ──────────────────────────────
  {
    id: 'sleep-dream',
    start: 'SLEEP',
    target: 'DREAM',
    length: 5,
    difficulty: 'Deep',
    optimalSteps: 6,
    hint: 'A quiet bridge passing through memory and awakening.',
  },
  {
    id: 'stone-water',
    start: 'STONE',
    target: 'WATER',
    length: 5,
    difficulty: 'Deep',
    optimalSteps: 6,
    hint: 'The slow erosion of rock toward fluid motion.',
  },
  {
    id: 'flame-smoke',
    start: 'FLAME',
    target: 'SMOKE',
    length: 5,
    difficulty: 'Deep',
    optimalSteps: 5,
    hint: 'Words spoken soften into drifting air.',
  },
  {
    id: 'peace-still',
    start: 'PEACE',
    target: 'STILL',
    length: 5,
    difficulty: 'Deep',
    optimalSteps: 6,
    hint: 'Finding a grounded place where everything pauses.',
  },
]
