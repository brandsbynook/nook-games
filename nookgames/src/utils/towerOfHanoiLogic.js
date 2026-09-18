// Tower of Hanoi Logic Engine for nookgames

export const TIERS = {
  gentle: {
    id: 'gentle',
    name: 'Gentle',
    subtitle: '3 Disks · 3 Pegs',
    disks: 3,
    pegs: 3,
    minMoves: 7,
    description: '3 disks on 3 pegs (optimal 7 moves)',
  },
  standard: {
    id: 'standard',
    name: 'Standard',
    subtitle: '4 Disks · 3 Pegs',
    disks: 4,
    pegs: 3,
    minMoves: 15,
    description: '4 disks on 3 pegs (optimal 15 moves)',
  },
  deep: {
    id: 'deep',
    name: 'Deep',
    subtitle: "Reve's · 4 Pegs",
    disks: 5,
    pegs: 4,
    minMoves: 13,
    description: "Reve's Puzzle / Frame-Stewart variant: 5 disks on 4 pegs (optimal 13 moves)",
  },
};

export const DIFFICULTY_PRESETS = [TIERS.gentle, TIERS.standard, TIERS.deep];

export function getTierPreset(tierKey = 'gentle') {
  return TIERS[tierKey] || TIERS.gentle;
}

/**
 * Creates the initial peg configuration: peg 0 has disks [numDisks..1], all other pegs are empty.
 */
export function createInitialPegs(numDisks = 3, numPegs = 3) {
  const initialStack = [];
  for (let i = numDisks; i >= 1; i--) {
    initialStack.push(i);
  }
  const pegs = [initialStack];
  for (let p = 1; p < numPegs; p++) {
    pegs.push([]);
  }
  return pegs;
}

/**
 * Strict move validation: moving disk must be smaller than top disk of destination peg.
 */
export function isValidMove(fromPeg, toPeg, pegs) {
  if (fromPeg === toPeg) return false;
  if (!pegs[fromPeg] || pegs[fromPeg].length === 0) return false;
  if (!pegs[toPeg]) return false;

  const sourceStack = pegs[fromPeg];
  const targetStack = pegs[toPeg];
  const movingDisk = sourceStack[sourceStack.length - 1];
  const targetTopDisk = targetStack.length > 0 ? targetStack[targetStack.length - 1] : Infinity;

  return movingDisk < targetTopDisk;
}

/**
 * Executes a disk transfer if valid, returning a copy of the pegs array.
 */
export function executeMove(fromPeg, toPeg, pegs) {
  if (!isValidMove(fromPeg, toPeg, pegs)) {
    return { success: false, pegs };
  }
  const nextPegs = pegs.map((stack) => [...stack]);
  const disk = nextPegs[fromPeg].pop();
  nextPegs[toPeg].push(disk);
  return { success: true, pegs: nextPegs, disk };
}

/**
 * Solved when all disks reach ANY non-origin peg (pegs 1, 2, or 3).
 */
export function isSolved(pegs, numDisks) {
  for (let p = 1; p < pegs.length; p++) {
    if (pegs[p].length === numDisks) {
      return true;
    }
  }
  return false;
}
