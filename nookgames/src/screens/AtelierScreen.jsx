import { useState, useEffect } from 'react'
import { PageHeader } from '../components/PageHeader.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { playTap } from '../utils/audio.js'
import {
  purchasePatron,
  restorePurchases,
  checkPatronStatus,
} from '../services/revenuecat.js'

const PALETTES = [
  {
    id: 'midnight',
    name: 'Midnight',
    tagline: 'Deep sanctuary',
    bg: '#0e0e11',
    card: '#16161b',
    text: '#e4e4e7',
    border: 'rgba(255, 255, 255, 0.1)',
    free: true,
  },
  {
    id: 'eink',
    name: 'E-Ink',
    tagline: 'Paper contrast',
    bg: '#f4f3ef',
    card: '#e9e7e1',
    text: '#18181b',
    border: 'rgba(0, 0, 0, 0.15)',
    free: false,
  },
  {
    id: 'moss',
    name: 'Moss',
    tagline: 'Forest calm',
    bg: '#0e1410',
    card: '#16201a',
    text: '#e2ece4',
    border: 'rgba(160, 210, 180, 0.15)',
    free: false,
  },
  {
    id: 'clay',
    name: 'Clay',
    tagline: 'Warm terracotta',
    bg: '#14100e',
    card: '#1f1916',
    text: '#eee4df',
    border: 'rgba(230, 180, 160, 0.15)',
    free: false,
  },
]

export function AtelierScreen({ onBack }) {
  const {
    activeTheme,
    setTheme,
    isPatron,
    setIsPatron,
    isAmbientPlaying,
    toggleAmbient,
    ambientVolume,
    setVolume,
  } = useTheme()

  const [isProcessing, setIsProcessing] = useState(false)
  const [feedbackMsg, setFeedbackMsg] = useState(null)

  // Verify entitlement status on mount
  useEffect(() => {
    async function verify() {
      const active = await checkPatronStatus()
      if (active) {
        setIsPatron(true)
      }
    }
    verify()
  }, [setIsPatron])

  function showMessage(msg) {
    setFeedbackMsg(msg)
    setTimeout(() => {
      setFeedbackMsg(null)
    }, 3500)
  }

  function handleSelectPalette(palette) {
    playTap()
    if (!palette.free && !isPatron) {
      showMessage('Patron membership unlocks all sanctuary palettes.')
      return
    }
    setTheme(palette.id)
  }

  async function handlePurchase() {
    playTap()
    setIsProcessing(true)
    try {
      const res = await purchasePatron()
      if (res.success) {
        setIsPatron(true)
        showMessage('Patron status activated. Thank you for your support!')
      } else if (res.error?.message) {
        showMessage(res.error.message)
      }
    } catch {
      showMessage('Unable to complete purchase at this time.')
    } finally {
      setIsProcessing(false)
    }
  }

  async function handleRestore() {
    playTap()
    setIsProcessing(true)
    try {
      const res = await restorePurchases()
      if (res.isPatron) {
        setIsPatron(true)
        showMessage('Purchases restored. Welcome back, Patron!')
      } else {
        showMessage('No previous Patron purchases found.')
      }
    } catch {
      showMessage('Unable to restore purchases. Please check your network connection.')
    } finally {
      setIsProcessing(false)
    }
  }

  function handleBack() {
    playTap()
    if (typeof onBack === 'function') {
      onBack()
    } else {
      window.location.hash = '#/settings'
    }
  }

  return (
    <div className="page atelier-page st-page">
      <PageHeader title="Atelier" onBack={handleBack} />

      <div className="st-groups atelier-content">
        {/* Patron Status / Subscription Card */}
        <div className="st-group">
          <span className="st-group-label">PATRON SANCTUARY</span>
          {isPatron ? (
            <div className="atelier-patron-active-card">
              <div className="atelier-patron-badge-row">
                <span className="atelier-patron-active-pill">Patron Active ✓</span>
              </div>
              <h3 className="atelier-patron-active-title">Sanctuary Unlocked</h3>
              <p className="atelier-patron-active-desc">
                Thank you for supporting independent game craft. You have unlimited lifetime access to all visual palettes and soundscapes.
              </p>
            </div>
          ) : (
            <div className="atelier-patron-card">
              <p className="atelier-patron-desc">
                “nook — a quiet corner of the internet. Twenty classic logic games built for quiet focus. Zero ads, zero tracking, zero algorithmic pressure.”
              </p>
              <button
                type="button"
                className="atelier-buy-btn"
                onClick={handlePurchase}
                disabled={isProcessing}
                id="atelier-patron-purchase-btn"
              >
                {isProcessing ? 'Connecting...' : 'Become a Patron — $3.99'}
              </button>
              <button
                type="button"
                className="atelier-restore-btn"
                onClick={handleRestore}
                disabled={isProcessing}
                id="atelier-restore-btn"
              >
                Restore Purchases
              </button>
            </div>
          )}
        </div>

        {/* Visual Palettes */}
        <div className="st-group">
          <div className="atelier-section-header">
            <span className="st-group-label">VISUAL PALETTES</span>
            {isPatron && <span className="atmo-badge">All Unlocked</span>}
          </div>

          <div className="atmo-palettes-grid atelier-palettes-grid">
            {PALETTES.map((palette) => {
              const isSelected = activeTheme === palette.id
              const isLocked = !palette.free && !isPatron

              return (
                <button
                  key={palette.id}
                  type="button"
                  className={`atmo-palette-btn${isSelected ? ' is-selected' : ''}${
                    isLocked ? ' is-locked' : ''
                  }`}
                  onClick={() => handleSelectPalette(palette)}
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
                      {isLocked ? 'Patron Only 🔒' : palette.tagline}
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
              )
            })}
          </div>
        </div>

        {/* Soundscape Section */}
        <div className="st-group">
          <span className="st-group-label">SOUNDSCAPE SYNTHESIZER</span>
          <div className="atmo-sound-card atelier-sound-card">
            <div className="atmo-sound-row">
              <div className="atmo-sound-info">
                <span className="atmo-sound-label">Background Brown Noise</span>
                <span className="atmo-sound-desc">
                  Deep procedural Brownian frequencies for calm focus
                </span>
              </div>
              <label
                className="st-toggle-label atmo-toggle"
                htmlFor="atelier-brown-toggle"
                aria-label="Toggle background brown noise"
              >
                <input
                  type="checkbox"
                  id="atelier-brown-toggle"
                  className="st-toggle-input"
                  checked={isAmbientPlaying}
                  onChange={() => {
                    playTap()
                    toggleAmbient()
                  }}
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
                id="atelier-volume-slider"
                aria-label="Brown noise ambient volume"
                disabled={!isAmbientPlaying}
              />
              <span className="atmo-volume-value">
                {Math.round(ambientVolume * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Toast Notification */}
      {feedbackMsg && (
        <div className="lo-toast lo-toast--visible" role="status" aria-live="polite">
          {feedbackMsg}
        </div>
      )}
    </div>
  )
}

export default AtelierScreen
