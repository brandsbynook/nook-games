import { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext.jsx';
import { playTap } from '../utils/audio.js';

const PALETTES = [
  {
    id: 'midnight',
    name: 'Midnight',
    tagline: 'Deep sanctuary',
    bg: '#0e0e11',
    card: '#16161b',
    text: '#e4e4e7',
    border: 'rgba(255, 255, 255, 0.1)',
  },
  {
    id: 'eink',
    name: 'E-Ink',
    tagline: 'Paper contrast',
    bg: '#f4f3ef',
    card: '#e9e7e1',
    text: '#18181b',
    border: 'rgba(0, 0, 0, 0.15)',
  },
  {
    id: 'moss',
    name: 'Moss',
    tagline: 'Forest calm',
    bg: '#0e1410',
    card: '#16201a',
    text: '#e2ece4',
    border: 'rgba(160, 210, 180, 0.15)',
  },
  {
    id: 'clay',
    name: 'Clay',
    tagline: 'Warm terracotta',
    bg: '#14100e',
    card: '#1f1916',
    text: '#eee4df',
    border: 'rgba(230, 180, 160, 0.15)',
  },
];

export function AtmosphereModal() {
  const {
    activeTheme,
    setTheme,
    isPatron,
    setIsPatron,
    isAmbientPlaying,
    toggleAmbient,
    ambientVolume,
    setVolume,
    isAtmosphereOpen,
    closeAtmosphere,
  } = useTheme();

  // Close on Escape key
  useEffect(() => {
    if (!isAtmosphereOpen) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        closeAtmosphere();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAtmosphereOpen, closeAtmosphere]);

  if (!isAtmosphereOpen) return null;

  function handleSelectPalette(id) {
    playTap();
    setTheme(id);
  }

  function handleToggleAmbient() {
    playTap();
    toggleAmbient();
  }

  function handlePatronToggle() {
    playTap();
    setIsPatron(!isPatron);
  }

  return (
    <div
      className="atmo-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="atmo-title"
      onClick={closeAtmosphere}
    >
      <div
        className="atmo-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="atmo-header">
          <div>
            <h2 id="atmo-title" className="atmo-title">Atmosphere</h2>
            <p className="atmo-subtitle">Sanctuary aesthetics & soundscape</p>
          </div>
          <button
            className="atmo-close-btn"
            onClick={closeAtmosphere}
            aria-label="Close atmosphere settings"
          >
            ✕
          </button>
        </div>

        {/* Palettes Section */}
        <section className="atmo-section" aria-labelledby="atmo-palettes-heading">
          <div className="atmo-section-header">
            <span id="atmo-palettes-heading" className="atmo-section-title">Visual Palettes</span>
            {isPatron && <span className="atmo-badge">Patron Sanctuary</span>}
          </div>

          <div className="atmo-palettes-grid">
            {PALETTES.map((palette) => {
              const isSelected = activeTheme === palette.id;
              return (
                <button
                  key={palette.id}
                  className={`atmo-palette-btn${isSelected ? ' is-selected' : ''}`}
                  onClick={() => handleSelectPalette(palette.id)}
                  aria-pressed={isSelected}
                  style={{
                    backgroundColor: palette.bg,
                    borderColor: isSelected ? palette.text : palette.border,
                  }}
                >
                  <div
                    className="atmo-palette-preview"
                    style={{ backgroundColor: palette.card, borderColor: palette.border }}
                  >
                    <div
                      className="atmo-palette-line"
                      style={{ backgroundColor: palette.text }}
                    />
                    <div
                      className="atmo-palette-subline"
                      style={{ backgroundColor: palette.text, opacity: 0.5 }}
                    />
                  </div>

                  <div className="atmo-palette-info">
                    <span
                      className="atmo-palette-name"
                      style={{ color: palette.text }}
                    >
                      {palette.name}
                    </span>
                    <span
                      className="atmo-palette-tagline"
                      style={{ color: palette.text, opacity: 0.7 }}
                    >
                      {palette.tagline}
                    </span>
                  </div>

                  {isSelected && (
                    <span
                      className="atmo-selected-indicator"
                      style={{ color: palette.text }}
                      aria-hidden="true"
                    >
                      ●
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Ambient Synthesizer Section */}
        <section className="atmo-section" aria-labelledby="atmo-sound-heading">
          <div className="atmo-section-header">
            <span id="atmo-sound-heading" className="atmo-section-title">Soundscape</span>
            <span className="atmo-status-tag">
              {isAmbientPlaying ? 'Playing' : 'Quiet'}
            </span>
          </div>

          <div className="atmo-sound-card">
            <div className="atmo-sound-row">
              <div className="atmo-sound-info">
                <span className="atmo-sound-label">Background Brown Noise</span>
                <span className="atmo-sound-desc">
                  Deep procedural Brownian frequencies for calm focus
                </span>
              </div>
              <label
                className="st-toggle-label atmo-toggle"
                htmlFor="atmo-brown-toggle"
                aria-label="Toggle background brown noise"
              >
                <input
                  type="checkbox"
                  id="atmo-brown-toggle"
                  className="st-toggle-input"
                  checked={isAmbientPlaying}
                  onChange={handleToggleAmbient}
                  role="switch"
                  aria-checked={isAmbientPlaying}
                />
                <span className="st-toggle-track" aria-hidden="true">
                  <span className="st-toggle-thumb" />
                </span>
              </label>
            </div>

            {/* Volume slider */}
            <div className={`atmo-volume-row${!isAmbientPlaying ? ' is-muted' : ''}`}>
              <div className="atmo-vol-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M11 5L6 9H2v6h4l5 4V5z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M15.54 8.46a5 5 0 010 7.07" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M19.07 4.93a10 10 0 010 14.14" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={ambientVolume}
                onChange={(e) => setVolume(e.target.value)}
                className="atmo-slider"
                id="atmo-volume-slider"
                aria-label="Brown noise ambient volume"
                disabled={!isAmbientPlaying}
              />
              <span className="atmo-volume-value">
                {Math.round(ambientVolume * 100)}%
              </span>
            </div>
          </div>
        </section>

        {/* Patron Sanctuary Note & Test Toggle */}
        <section className="atmo-patron-section">
          <div className="atmo-patron-card">
            <p className="atmo-patron-note">
              “nook — a quiet corner of the internet. Twenty classic logic games built for quiet focus. Zero ads, zero tracking, zero algorithmic pressure.”
            </p>
            <button
              type="button"
              className={`atmo-patron-btn${isPatron ? ' is-active' : ''}`}
              onClick={handlePatronToggle}
              id="atmo-patron-toggle-btn"
            >
              {isPatron ? 'Become a Patron — $3.99 (Active ✓)' : 'Become a Patron — $3.99'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
