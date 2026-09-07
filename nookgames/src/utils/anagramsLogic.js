/**
 * anagramsLogic.js — Core Engine & Word Lists for Anagrams (Words & Reasoning)
 * Supports Beginner (5-letter root), Intermediate (6-letter root), and Master (7-letter root).
 */

export const DIFFICULTY_TIERS = {
  beginner: {
    id: 'beginner',
    label: 'Beginner',
    rootLength: 5,
    minWords: 4,
    description: '5-letter root words with 5–8 discovery targets',
  },
  intermediate: {
    id: 'intermediate',
    label: 'Intermediate',
    rootLength: 6,
    minWords: 6,
    description: '6-letter root words with 7–10 discovery targets',
  },
  master: {
    id: 'master',
    label: 'Master',
    rootLength: 7,
    minWords: 8,
    description: '7-letter root words with 9–14 discovery targets',
  },
}

/**
 * Curated puzzles with verified valid English anagram sub-words.
 */
export const ANAGRAM_PUZZLES = {
  beginner: [
    {
      id: 'beg-heart',
      root: 'HEART',
      targets: ['ART', 'EAR', 'HAT', 'TEA', 'HEAR', 'HEAT', 'HATE', 'EARTH', 'HEART'],
      extras: ['ERA', 'RAT', 'TAR', 'EAT', 'ATE', 'HARE', 'TEAR', 'RATE'],
    },
    {
      id: 'beg-stone',
      root: 'STONE',
      targets: ['ONE', 'NOT', 'SON', 'SET', 'TOE', 'NOSE', 'NOTE', 'TONE', 'NEST', 'STONE'],
      extras: ['EON', 'TON', 'NET', 'TEN', 'SENT', 'TOES', 'ONSET'],
    },
    {
      id: 'beg-bread',
      root: 'BREAD',
      targets: ['BED', 'BAD', 'BAR', 'RED', 'EAR', 'BEAR', 'BARE', 'DEAR', 'DARE', 'READ', 'BREAD'],
      extras: ['ERA', 'BEAD', 'BARD', 'BEARD'],
    },
    {
      id: 'beg-plant',
      root: 'PLANT',
      targets: ['ANT', 'PAN', 'NAP', 'TAP', 'PLAN', 'PANT', 'PLANT'],
      extras: ['PAT', 'TAN', 'PLAT'],
    },
    {
      id: 'beg-ocean',
      root: 'OCEAN',
      targets: ['ACE', 'CAN', 'ONE', 'ACNE', 'CANE', 'CONE', 'ONCE', 'OCEAN'],
      extras: ['EON'],
    },
  ],

  intermediate: [
    {
      id: 'int-silver',
      root: 'SILVER',
      targets: ['SIR', 'LIE', 'VIE', 'EVIL', 'LIVE', 'VILE', 'VEIL', 'RISE', 'LIVER', 'SILVER'],
      extras: ['SIRE'],
    },
    {
      id: 'int-garden',
      root: 'GARDEN',
      targets: ['AGE', 'DEN', 'EAR', 'END', 'RED', 'DARE', 'DEAR', 'GEAR', 'NEAR', 'READ', 'DANGER', 'GARDEN'],
      extras: ['ERA', 'RAG', 'AND', 'EARN', 'RANG'],
    },
    {
      id: 'int-planet',
      root: 'PLANET',
      targets: ['ANT', 'LET', 'NET', 'PAN', 'PET', 'TAP', 'LANE', 'LATE', 'LEAP', 'NEAT', 'PALE', 'PLAN', 'TALE', 'PLANET'],
      extras: ['NAP', 'PAT', 'TAN', 'TEN', 'ATE', 'EAT', 'TEA', 'PANT', 'PLEA', 'LEAN'],
    },
    {
      id: 'int-castle',
      root: 'CASTLE',
      targets: ['ACT', 'ALE', 'CAT', 'LET', 'SEA', 'SET', 'CASE', 'CAST', 'EAST', 'LATE', 'SALE', 'SEAT', 'TALE', 'LEAST', 'SCALE', 'CASTLE'],
      extras: ['TEA', 'EAT', 'ATE', 'STALE'],
    },
    {
      id: 'int-spring',
      root: 'SPRING',
      targets: ['PIG', 'PIN', 'RIG', 'SIN', 'SIP', 'GRIP', 'PING', 'RING', 'SIGN', 'SING', 'SPIN', 'SPRING'],
      extras: ['NIP'],
    },
  ],

  master: [
    {
      id: 'mst-harvest',
      root: 'HARVEST',
      targets: ['ART', 'EAR', 'HAT', 'RAT', 'SEA', 'SET', 'TEA', 'HATE', 'HEAR', 'HEAT', 'REST', 'SAVE', 'STAR', 'TEAR', 'VASE', 'VEST', 'EARTH', 'HEART', 'SHARE', 'STARE', 'HARVEST'],
      extras: ['ERA', 'TAR', 'EAT', 'ATE', 'HARE', 'RATE'],
    },
    {
      id: 'mst-blossom',
      root: 'BLOSSOM',
      targets: ['BOO', 'LOB', 'MOO', 'SOB', 'BOOM', 'BOSS', 'LOOM', 'MOSS', 'SOLO', 'BLOOM', 'BLOSSOM'],
      extras: ['SLOB'],
    },
    {
      id: 'mst-miracle',
      root: 'MIRACLE',
      targets: ['AIM', 'ARM', 'EAR', 'ICE', 'LIE', 'RIM', 'ACRE', 'CALM', 'CARE', 'LIME', 'MALE', 'MILE', 'RACE', 'CLAIM', 'CLEAR', 'REALM', 'MIRACLE'],
      extras: ['ERA', 'CRAM'],
    },
    {
      id: 'mst-weather',
      root: 'WEATHER',
      targets: ['AWE', 'HAT', 'RAW', 'THE', 'WAR', 'WET', 'HARE', 'HATE', 'HEAR', 'HEAT', 'RATE', 'TEAR', 'WEAR', 'EARTH', 'HEART', 'WATER', 'WHEAT', 'WEATHER'],
      extras: ['EAR', 'ERA', 'ART', 'RAT', 'TAR', 'TEA', 'EAT', 'ATE'],
    },
  ],
}

/**
 * Shuffles an array of letters with the Fisher-Yates algorithm.
 * Guarantees that the shuffled order does not match the exact input if length > 1.
 *
 * @param {string[] | string} letters
 * @returns {string[]}
 */
export function shuffleLetters(letters) {
  const arr = Array.isArray(letters) ? [...letters] : letters.split('')
  if (arr.length <= 1) return arr

  const originalStr = arr.join('')
  let attempts = 0

  do {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = arr[i]
      arr[i] = arr[j]
      arr[j] = temp
    }
    attempts++
  } while (arr.join('') === originalStr && attempts < 10)

  return arr
}

/**
 * Groups a list of words by their character length.
 *
 * @param {string[]} words
 * @returns {Record<number, string[]>}
 */
export function groupWordsByLength(words) {
  const groups = {}
  for (const word of words) {
    const len = word.length
    if (!groups[len]) {
      groups[len] = []
    }
    groups[len].push(word)
  }
  // Sort words inside each group alphabetically
  for (const len in groups) {
    groups[len].sort((a, b) => a.localeCompare(b))
  }
  return groups
}

/**
 * Generates a puzzle for the chosen difficulty tier.
 *
 * @param {string} tier 'beginner' | 'intermediate' | 'master'
 * @param {number} puzzleIndex
 * @returns {object} puzzle metadata
 */
export function generatePuzzle(tier = 'beginner', puzzleIndex = 0) {
  const tierPuzzles = ANAGRAM_PUZZLES[tier] || ANAGRAM_PUZZLES.beginner
  const safeIdx = Math.max(0, Math.min(puzzleIndex, tierPuzzles.length - 1))
  const data = tierPuzzles[safeIdx]

  const root = data.root.toUpperCase()
  const targetWords = [...data.targets].map((w) => w.toUpperCase())
  const extraWords = (data.extras || []).map((w) => w.toUpperCase())
  const allValidWords = new Set([...targetWords, ...extraWords])

  // Initial scrambled root letters
  const scrambledLetters = shuffleLetters(root)

  return {
    id: data.id,
    root,
    tier,
    index: safeIdx,
    totalInTier: tierPuzzles.length,
    scrambledLetters,
    targetWords,
    groupedTargets: groupWordsByLength(targetWords),
    allValidWords: Array.from(allValidWords),
  }
}

/**
 * Validates a submitted word guess.
 *
 * @param {string} guess Player's submitted string
 * @param {string[]} targetWords Curated target words to uncover
 * @param {string[]} foundWords Words already discovered
 * @param {string[]} allValidWords All words accepted (including extras)
 * @returns {{ status: 'too_short' | 'already_found' | 'valid_target' | 'valid_extra' | 'invalid', word: string, message: string }}
 */
export function validateGuess(guess, targetWords = [], foundWords = [], allValidWords = []) {
  const normalized = String(guess || '').trim().toUpperCase()

  if (normalized.length < 3) {
    return {
      status: 'too_short',
      word: normalized,
      message: 'Words must be at least 3 letters.',
    }
  }

  if (foundWords.includes(normalized)) {
    return {
      status: 'already_found',
      word: normalized,
      message: `${normalized} already discovered.`,
    }
  }

  if (targetWords.includes(normalized)) {
    return {
      status: 'valid_target',
      word: normalized,
      message: `Discovered ${normalized}!`,
    }
  }

  if (allValidWords.includes(normalized)) {
    return {
      status: 'valid_extra',
      word: normalized,
      message: `${normalized} is a valid bonus word!`,
    }
  }

  return {
    status: 'invalid',
    word: normalized,
    message: `${normalized} is not in the puzzle word list.`,
  }
}
