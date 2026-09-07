/**
 * mastermindLogic.js — Core Game Logic & Difficulty Tiers for Mastermind (Words & Reasoning)
 * Completely monochrome geometric symbol engine.
 */

export const MASTERMIND_SYMBOLS = [
  { id: 'circle', label: 'Circle' },
  { id: 'square', label: 'Square' },
  { id: 'triangle', label: 'Triangle' },
  { id: 'diamond', label: 'Diamond' },
  { id: 'plus', label: 'Plus' },
  { id: 'hexagon', label: 'Hexagon' },
  { id: 'star', label: 'Star' },
  { id: 'ring', label: 'Ring' },
]

export const SYMBOLS = MASTERMIND_SYMBOLS
export const SANCTUARY_COLORS = MASTERMIND_SYMBOLS // Backward compatibility

export const DIFFICULTY_PRESETS = {
  normal: {
    id: 'normal',
    label: 'Normal',
    slots: 4,
    paletteSize: 6,
    maxAttempts: 10,
    allowDuplicates: false,
  },
  hard: {
    id: 'hard',
    label: 'Hard',
    slots: 4,
    paletteSize: 6,
    maxAttempts: 8,
    allowDuplicates: true,
  },
  master: {
    id: 'master',
    label: 'Master',
    slots: 5,
    paletteSize: 8,
    maxAttempts: 8,
    allowDuplicates: true,
  },
  pro: {
    id: 'pro',
    label: 'Pro',
    slots: 4,
    paletteSize: 6,
    maxAttempts: 5,
    allowDuplicates: true,
  },
}

// Fallback constant for slot count
export const CODE_LENGTH = 4

// Aliases for compatibility
export const DIFFICULTIES = DIFFICULTY_PRESETS

/**
 * Returns symbol metadata by id.
 */
export function getSymbol(id) {
  return MASTERMIND_SYMBOLS.find((s) => s.id === id) || null
}

export const getColor = getSymbol // Backward compatibility

/**
 * Returns active symbol palette slice according to tier size (6 or 8).
 */
export function getPalette(paletteSize = 6) {
  return MASTERMIND_SYMBOLS.slice(0, paletteSize)
}

/**
 * Generates a secret code according to the chosen difficulty tier.
 * Respects slot count (4 or 5), palette bounds (6 or 8), and duplicate symbol rules.
 *
 * @param {string | object} difficulty 'normal' | 'hard' | 'master' | 'pro' or preset object
 * @returns {string[]} Array of symbol IDs
 */
export function generateSecretCode(difficulty = 'hard') {
  const config =
    typeof difficulty === 'object'
      ? difficulty
      : DIFFICULTY_PRESETS[difficulty] || DIFFICULTY_PRESETS.hard

  const availableSymbols = getPalette(config.paletteSize)
  const code = []

  if (!config.allowDuplicates) {
    // Pick distinct symbols without repetition
    const pool = [...availableSymbols]
    for (let i = 0; i < config.slots; i++) {
      const randomIndex = Math.floor(Math.random() * pool.length)
      code.push(pool[randomIndex].id)
      pool.splice(randomIndex, 1)
    }
  } else {
    // Pick with duplicates allowed
    for (let i = 0; i < config.slots; i++) {
      const randomIndex = Math.floor(Math.random() * availableSymbols.length)
      code.push(availableSymbols[randomIndex].id)
    }
  }

  return code
}

/**
 * Evaluates a guess against the secret code.
 * - exact: correct symbol in the exact position.
 * - misplaced: correct symbol in an incorrect position (duplicate symbols handled accurately).
 *
 * @param {string[]} secret Array of symbol IDs
 * @param {string[]} guess Array of symbol IDs
 * @returns {{ exact: number, misplaced: number, isWon: boolean }}
 */
export function evaluateGuess(secret, guess) {
  let exact = 0
  let misplaced = 0

  const secretRemaining = []
  const guessRemaining = []

  // 1. Identify exact matches first
  for (let i = 0; i < secret.length; i++) {
    if (secret[i] === guess[i]) {
      exact++
    } else {
      secretRemaining.push(secret[i])
      guessRemaining.push(guess[i])
    }
  }

  // 2. Identify misplaced matches among remaining symbols
  for (let i = 0; i < guessRemaining.length; i++) {
    const targetIdx = secretRemaining.indexOf(guessRemaining[i])
    if (targetIdx !== -1) {
      misplaced++
      // Remove to prevent double counting
      secretRemaining.splice(targetIdx, 1)
    }
  }

  return {
    exact,
    misplaced,
    isWon: exact === secret.length,
  }
}

/**
 * Provides a gentle deductive hint:
 * 1. Reveals an absent symbol from the active tier's palette, OR
 * 2. Reveals the correct symbol for an unrevealed slot.
 *
 * @param {string[]} secret
 * @param {string[]} eliminatedSymbols Array of symbol IDs already eliminated
 * @param {number[]} revealedSlots Array of slot indices already revealed
 * @param {number} paletteSize Number of active symbols (6 or 8)
 * @returns {{ type: 'elimination' | 'reveal', symbolId?: string, colorId?: string, slot?: number, label?: string, message: string }}
 */
export function getEliminationHint(
  secret,
  eliminatedSymbols = [],
  revealedSlots = [],
  paletteSize = 6
) {
  const secretSet = new Set(secret)
  const activePalette = getPalette(paletteSize)

  // 1. Check for absent symbols in the active palette that haven't been eliminated yet
  const availableAbsent = activePalette.filter(
    (s) => !secretSet.has(s.id) && !eliminatedSymbols.includes(s.id)
  )

  if (availableAbsent.length > 0) {
    const chosen = availableAbsent[Math.floor(Math.random() * availableAbsent.length)]
    return {
      type: 'elimination',
      symbolId: chosen.id,
      colorId: chosen.id,
      label: chosen.label,
      message: `${chosen.label} is absent from the secret sequence.`,
    }
  }

  // 2. Reveal a slot that hasn't been revealed yet
  const unrevealedSlotIndices = Array.from({ length: secret.length }, (_, i) => i).filter(
    (i) => !revealedSlots.includes(i)
  )

  if (unrevealedSlotIndices.length > 0) {
    const slotIdx = unrevealedSlotIndices[0]
    const symbol = getSymbol(secret[slotIdx])
    return {
      type: 'reveal',
      slot: slotIdx,
      symbolId: secret[slotIdx],
      colorId: secret[slotIdx],
      label: symbol.label,
      message: `Slot ${slotIdx + 1} is confirmed to be ${symbol.label}.`,
    }
  }

  return {
    type: 'reveal',
    slot: 0,
    symbolId: secret[0],
    colorId: secret[0],
    label: getSymbol(secret[0]).label,
    message: `All deductions resolved.`,
  }
}
