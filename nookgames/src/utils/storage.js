/**
 * storage.js
 *
 * Centralized localStorage persistence layer for Nook Games.
 *
 * Namespaced keys:
 *   nook-settings      – User preferences (theme, textSize, breakInterval)
 *   nook-progress      – Aggregate play/win counters and per-game history
 *   nook-last-played   – Most-recent game for the Home "resume" card
 *   nook-feedback-state – Whether the post-play feedback prompt has been acted on
 *
 * All functions are safe: they never throw — localStorage errors are silently
 * caught so the app remains fully functional without storage access.
 */

const PROGRESS_KEY = 'nook-progress';
const RESUME_KEY = 'nook-last-played';
const SETTINGS_KEY = 'nook-settings';
const FEEDBACK_KEY = 'nook-feedback-state';

// ─── Settings ─────────────────────────────────────────────────────────────────

/**
 * Returns the persisted user settings, or safe defaults if none are stored.
 * @returns {{ theme: string, textSize: string, breakInterval: number }}
 */
export function getStoredSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw
      ? JSON.parse(raw)
      : { theme: 'dark', textSize: 'medium', breakInterval: 30 };
  } catch {
    return { theme: 'dark', textSize: 'medium', breakInterval: 30 };
  }
}

/**
 * Persists user settings and immediately applies them to the DOM.
 * @param {{ theme: string, textSize: string, breakInterval: number }} settings
 */
export function saveStoredSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    applyThemeAndScale(settings.theme, settings.textSize);
  } catch {}
}

/**
 * Applies theme and text-scale attributes to <html> so CSS variables respond.
 * Safe to call on app boot without a prior localStorage read.
 *
 * @param {'dark'|'light'} theme
 * @param {'small'|'medium'|'large'} textSize
 */
export function applyThemeAndScale(theme = 'dark', textSize = 'medium') {
  const root = document.documentElement
  root.setAttribute('data-theme', theme)
  root.setAttribute('data-text-size', textSize)
  
  if (textSize === 'large') {
    root.style.setProperty('--font-scale', '1.12')
    root.style.fontSize = '18px'
  } else if (textSize === 'small') {
    root.style.setProperty('--font-scale', '0.92')
    root.style.fontSize = '14px'
  } else {
    root.style.setProperty('--font-scale', '1.0')
    root.style.fontSize = '16px'
  }
}

// ─── Progress ─────────────────────────────────────────────────────────────────

/**
 * Returns aggregate progress, or zeroed defaults.
 * @returns {{ gamesPlayed: number, gamesWon: number, byGame: Object }}
 */
export function getStoredProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw
      ? JSON.parse(raw)
      : { gamesPlayed: 0, gamesWon: 0, byGame: {} };
  } catch {
    return { gamesPlayed: 0, gamesWon: 0, byGame: {} };
  }
}

/**
 * Increments global and per-game counters for a completed session.
 * Call this when a game session ends (win or loss).
 *
 * @param {string}  gameId  – Matches the catalogue game id, e.g. 'sudoku'
 * @param {boolean} won     – Pass true only for a genuine win/completion
 */
export function recordGameSession(gameId, won = false) {
  try {
    const progress = getStoredProgress();

    progress.gamesPlayed = (progress.gamesPlayed || 0) + 1;
    if (won) progress.gamesWon = (progress.gamesWon || 0) + 1;

    if (!progress.byGame[gameId]) {
      progress.byGame[gameId] = { played: 0, won: 0, lastPlayed: Date.now() };
    }
    progress.byGame[gameId].played += 1;
    if (won) progress.byGame[gameId].won += 1;
    progress.byGame[gameId].lastPlayed = Date.now();

    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {}
}

// ─── Session Resume ────────────────────────────────────────────────────────────

/**
 * Persists the most-recently-active game so HomeScreen can offer a resume card.
 * Call this when the user enters a game's play screen.
 *
 * @param {string} gameId     – Catalogue game id, e.g. 'sudoku'
 * @param {string} gameName   – Human-readable title, e.g. 'Sudoku'
 * @param {string} suiteName  – Collection title, e.g. 'Logic'
 */
export function setLastActiveGame(gameId, gameName, suiteName) {
  try {
    localStorage.setItem(
      RESUME_KEY,
      JSON.stringify({ gameId, gameName, suiteName, timestamp: Date.now() })
    );
  } catch {}
}

/**
 * Returns the last-active game payload, or null if nothing has been stored yet.
 * @returns {{ gameId: string, gameName: string, suiteName: string, timestamp: number } | null}
 */
export function getLastActiveGame() {
  try {
    const raw = localStorage.getItem(RESUME_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ─── Feedback Gating ──────────────────────────────────────────────────────────

/**
 * Returns true when the in-app feedback prompt should be shown.
 * Criteria: user has played ≥ 5 sessions and has not yet acted on the prompt.
 *
 * @returns {boolean}
 */
export function shouldShowFeedbackPrompt() {
  try {
    const status = localStorage.getItem(FEEDBACK_KEY);
    if (status === 'resolved' || status === 'dismissed') return false;
    const progress = getStoredProgress();
    return progress.gamesPlayed >= 5;
  } catch {
    return false;
  }
}

/**
 * Mark the feedback prompt as resolved (user submitted feedback / rated the app).
 * Hides the prompt permanently.
 */
export function markFeedbackResolved() {
  try {
    localStorage.setItem(FEEDBACK_KEY, 'resolved');
  } catch {}
}

/**
 * Mark the feedback prompt as dismissed (user closed without acting).
 * Hides the prompt permanently.
 */
export function markFeedbackDismissed() {
  try {
    localStorage.setItem(FEEDBACK_KEY, 'dismissed');
  } catch {}
}

// ─── Full Reset ────────────────────────────────────────────────────────────────

/**
 * Clears all Nook Games data from localStorage.
 * Settings are intentionally preserved (the user's display preferences survive).
 * Call this from SettingsScreen → "Reset all data".
 */
export function resetAllData() {
  try {
    localStorage.removeItem(PROGRESS_KEY);
    localStorage.removeItem(RESUME_KEY);
    localStorage.removeItem(FEEDBACK_KEY);
  } catch {}
}

// ─── Mindful Break ────────────────────────────────────────────────────────────

/**
 * Returns true when the user's configured break interval has elapsed
 * since the session start timestamp, indicating a break reminder is due.
 *
 * @param {number} sessionStartMs  – Date.now() recorded when the session began
 * @returns {boolean}
 */
export function isBreakDue(sessionStartMs) {
  try {
    const { breakInterval } = getStoredSettings();
    if (!breakInterval || breakInterval <= 0) return false;
    const elapsedMinutes = (Date.now() - sessionStartMs) / 60_000;
    return elapsedMinutes >= breakInterval;
  } catch {
    return false;
  }
}
