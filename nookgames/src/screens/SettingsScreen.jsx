import { useState } from 'react'
import { isMuted, toggleMute } from '../utils/audio.js'

function Toggle({ id, checked, onChange, label }) {
  return (
    <label
      className="st-toggle-label"
      htmlFor={id}
      aria-label={label}
    >
      <input
        type="checkbox"
        id={id}
        className="st-toggle-input"
        checked={checked}
        onChange={onChange}
        role="switch"
        aria-checked={checked}
      />
      <span className="st-toggle-track" aria-hidden="true">
        <span className="st-toggle-thumb" />
      </span>
    </label>
  )
}

function SettingsGroup({ label, children }) {
  return (
    <div className="st-group">
      <span className="st-group-label">{label}</span>
      <div className="st-group-card">
        {children}
      </div>
    </div>
  )
}

function SettingsRow({ label, trailing, divided = true, id }) {
  return (
    <div className={`st-row${divided ? ' st-row--divided' : ''}`} id={id}>
      <span className="st-row-label">{label}</span>
      <span className="st-row-trailing">{trailing}</span>
    </div>
  )
}

export function SettingsScreen() {
  // Sound Effects: wired to audio.js isMuted / toggleMute
  const [soundEnabled, setSoundEnabled] = useState(() => !isMuted())
  // Music: persisted in localStorage
  const [musicEnabled, setMusicEnabled] = useState(() => {
    try { return localStorage.getItem('nook-music') !== 'false' } catch { return true }
  })
  // Offline Mode
  const [offlineEnabled, setOfflineEnabled] = useState(() => {
    try { return localStorage.getItem('nook-offline') === 'true' } catch { return false }
  })

  function handleSoundToggle() {
    const newMuted = toggleMute()     // toggleMute flips the muted flag
    setSoundEnabled(!newMuted)         // soundEnabled is the inverse of muted
  }

  function handleMusicToggle() {
    const next = !musicEnabled
    setMusicEnabled(next)
    try { localStorage.setItem('nook-music', String(next)) } catch {}
  }

  function handleOfflineToggle() {
    const next = !offlineEnabled
    setOfflineEnabled(next)
    try { localStorage.setItem('nook-offline', String(next)) } catch {}
  }

  function handleResetProgress() {
    if (window.confirm('Reset all progress? This cannot be undone.')) {
      try {
        localStorage.removeItem('nook-progress')
      } catch {}
    }
  }

  return (
    <div className="page st-page">
      <h1 className="st-title">Settings</h1>

      {/* APPEARANCE */}
      <SettingsGroup label="APPEARANCE">
        <SettingsRow
          id="st-theme-row"
          label="Theme"
          trailing={<span className="st-value">Dark</span>}
        />
        <SettingsRow
          id="st-textsize-row"
          label="Text Size"
          trailing={
            <span className="st-value st-value--chevron">
              Medium <span className="st-chevron">›</span>
            </span>
          }
        />
      </SettingsGroup>

      {/* SOUND */}
      <SettingsGroup label="SOUND">
        <SettingsRow
          id="st-sound-row"
          label="Sound Effects"
          divided={false}
          trailing={
            <Toggle
              id="st-sound-toggle"
              checked={soundEnabled}
              onChange={handleSoundToggle}
              label="Toggle sound effects"
            />
          }
        />
        <SettingsRow
          id="st-music-row"
          label="Music"
          trailing={
            <Toggle
              id="st-music-toggle"
              checked={musicEnabled}
              onChange={handleMusicToggle}
              label="Toggle music"
            />
          }
        />
      </SettingsGroup>

      {/* GENERAL */}
      <SettingsGroup label="GENERAL">
        <SettingsRow
          id="st-offline-row"
          label="Offline Mode"
          divided={false}
          trailing={
            <Toggle
              id="st-offline-toggle"
              checked={offlineEnabled}
              onChange={handleOfflineToggle}
              label="Toggle offline mode"
            />
          }
        />
        <button
          id="st-reset-btn"
          className="st-row st-row--divided st-row--button"
          onClick={handleResetProgress}
        >
          <span className="st-row-label">Reset Progress</span>
          <span className="st-row-trailing st-chevron">›</span>
        </button>
        <SettingsRow
          id="st-about-row"
          label="About Nook"
          trailing={<span className="st-value st-value--muted">v1.0.0</span>}
        />
      </SettingsGroup>
    </div>
  )
}
