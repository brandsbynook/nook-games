import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  startBrownNoise,
  stopBrownNoise,
  setAmbientVolume,
} from '../utils/ambientAudio.js';

const THEME_STORAGE_KEY = 'nook_active_theme';
const PATRON_STORAGE_KEY = 'nook_patron_status';
const AMBIENT_PLAYING_KEY = 'nook_ambient_playing';
const AMBIENT_VOL_KEY = 'nook_ambient_volume';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // ── Theme State ───────────────────────────────────────────────────────────
  const [activeTheme, setActiveThemeState] = useState(() => {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) || 'midnight';
    } catch {
      return 'midnight';
    }
  });

  // ── Patron State ──────────────────────────────────────────────────────────
  const [isPatron, setIsPatronState] = useState(() => {
    try {
      return localStorage.getItem(PATRON_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // ── Ambient Synthesizer State ─────────────────────────────────────────────
  const [isAmbientPlaying, setIsAmbientPlayingState] = useState(() => {
    try {
      return localStorage.getItem(AMBIENT_PLAYING_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [ambientVolume, setAmbientVolumeState] = useState(() => {
    try {
      const stored = localStorage.getItem(AMBIENT_VOL_KEY);
      return stored !== null ? parseFloat(stored) : 0.5;
    } catch {
      return 0.5;
    }
  });

  // ── Modal Visibility State ────────────────────────────────────────────────
  const [isAtmosphereOpen, setIsAtmosphereOpen] = useState(false);

  // ── Apply theme class to document.documentElement ─────────────────────────
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-midnight', 'theme-eink', 'theme-moss', 'theme-clay');
    root.classList.add(`theme-${activeTheme}`);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, activeTheme);
    } catch {}
  }, [activeTheme]);

  // ── Synchronize Procedural Brownian Noise ─────────────────────────────────
  useEffect(() => {
    if (isAmbientPlaying) {
      startBrownNoise();
      setAmbientVolume(ambientVolume);
    } else {
      stopBrownNoise();
    }

    try {
      localStorage.setItem(AMBIENT_PLAYING_KEY, String(isAmbientPlaying));
    } catch {}
  }, [isAmbientPlaying]);

  useEffect(() => {
    setAmbientVolume(ambientVolume);
    try {
      localStorage.setItem(AMBIENT_VOL_KEY, String(ambientVolume));
    } catch {}
  }, [ambientVolume]);

  // ── Setters & Actions ─────────────────────────────────────────────────────
  const setTheme = useCallback((theme) => {
    if (['midnight', 'eink', 'moss', 'clay'].includes(theme)) {
      setActiveThemeState(theme);
    }
  }, []);

  const setIsPatron = useCallback((val) => {
    const booleanVal = Boolean(val);
    setIsPatronState(booleanVal);
    try {
      localStorage.setItem(PATRON_STORAGE_KEY, String(booleanVal));
    } catch {}
  }, []);

  const toggleAmbient = useCallback(() => {
    setIsAmbientPlayingState((prev) => !prev);
  }, []);

  const setAmbientPlaying = useCallback((playing) => {
    setIsAmbientPlayingState(Boolean(playing));
  }, []);

  const setVolume = useCallback((vol) => {
    const clamped = Math.max(0, Math.min(1, parseFloat(vol) || 0));
    setAmbientVolumeState(clamped);
  }, []);

  const openAtmosphere = useCallback(() => setIsAtmosphereOpen(true), []);
  const closeAtmosphere = useCallback(() => setIsAtmosphereOpen(false), []);

  const value = {
    activeTheme,
    setTheme,
    isPatron,
    setIsPatron,
    isAmbientPlaying,
    toggleAmbient,
    setAmbientPlaying,
    ambientVolume,
    setVolume,
    isAtmosphereOpen,
    openAtmosphere,
    closeAtmosphere,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
