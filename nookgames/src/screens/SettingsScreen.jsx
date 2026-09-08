import { useState, useEffect } from 'react'
import { isMuted, toggleMute } from '../utils/audio.js'
import { PageHeader } from '../components/PageHeader.jsx'
import {
  getStoredSettings,
  saveStoredSettings,
  resetAllData,
} from '../utils/storage.js'

// ── Helpers ──────────────────────────────────────────────────────────────────

const THEMES = ['dark', 'oled']
const THEME_LABELS = { dark: 'Dark', oled: 'OLED Black' }

const TEXT_SIZES = ['medium', 'large']
const TEXT_LABELS = { medium: 'Normal', large: 'Large' }

const BREAK_INTERVALS = [0, 20, 30, 45]
const BREAK_LABELS = { 0: 'Off', 20: '20 min', 30: '30 min', 45: '45 min' }

function cycleNext(arr, current) {
  const idx = arr.indexOf(current)
  return arr[(idx + 1) % arr.length]
}

// ── Sub-components ───────────────────────────────────────────────────────────

function Toggle({ id, checked, onChange, label }) {
  return (
    <label className="st-toggle-label" htmlFor={id} aria-label={label}>
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
      <div className="st-group-card">{children}</div>
    </div>
  )
}

function SettingsRow({ label, trailing, divided = true, id, onClick }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      className={`st-row${divided ? ' st-row--divided' : ''}${onClick ? ' st-row--button' : ''}`}
      id={id}
      onClick={onClick}
    >
      <span className="st-row-label">{label}</span>
      <span className="st-row-trailing">{trailing}</span>
    </Tag>
  )
}

// ── Screen ───────────────────────────────────────────────────────────────────

export function SettingsScreen() {
  // ── Initialise from storage ───────────────────────────────────────────────
  const [settings, setSettings] = useState(() => getStoredSettings())

  // Sound Effects: wired to audio.js
  const [soundEnabled, setSoundEnabled] = useState(() => !isMuted())
  // Music: persisted in localStorage (separate simple key)
  const [musicEnabled, setMusicEnabled] = useState(() => {
    try { return localStorage.getItem('nook-music') !== 'false' } catch { return true }
  })

  // Apply stored settings on first mount (theme + text scale)
  useEffect(() => {
    saveStoredSettings(settings)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Helpers ───────────────────────────────────────────────────────────────

  function updateSettings(patch) {
    const next = { ...settings, ...patch }
    setSettings(next)
    saveStoredSettings(next)
  }

  // ── Handlers ─────────────────────────────────────────────────────────────

  function handleThemeClick() {
    updateSettings({ theme: cycleNext(THEMES, settings.theme) })
  }

  function handleTextSizeClick() {
    updateSettings({ textSize: cycleNext(TEXT_SIZES, settings.textSize ?? 'medium') })
  }

  function handleBreakClick() {
    updateSettings({ breakInterval: cycleNext(BREAK_INTERVALS, settings.breakInterval ?? 30) })
  }

  function handleSoundToggle() {
    const newMuted = toggleMute()
    setSoundEnabled(!newMuted)
  }

  function handleMusicToggle() {
    const next = !musicEnabled
    setMusicEnabled(next)
    try { localStorage.setItem('nook-music', String(next)) } catch { }
  }

  function handleResetProgress() {
    if (window.confirm('Reset all progress and session history? This cannot be undone.')) {
      resetAllData()
      alert('All progress has been reset.')
    }
  }

  // ── Derived display values ────────────────────────────────────────────────

  const themeLabel = THEME_LABELS[settings.theme] ?? 'Dark'
  const textLabel = TEXT_LABELS[settings.textSize ?? 'medium'] ?? 'Normal'
  const breakLabel = BREAK_LABELS[settings.breakInterval ?? 30] ?? '30 min'

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="page st-page">
      <PageHeader title="Settings" />

      <div className="st-groups">
        {/* APPEARANCE */}
        <SettingsGroup label="APPEARANCE">
          <SettingsRow
            id="st-theme-row"
            label="Theme"
            onClick={handleThemeClick}
            trailing={
              <span className="st-value st-value--chevron">
                {themeLabel} <span className="st-chevron">›</span>
              </span>
            }
          />
          <SettingsRow
            id="st-textsize-row"
            label="Text Size"
            onClick={handleTextSizeClick}
            trailing={
              <span className="st-value st-value--chevron">
                {textLabel} <span className="st-chevron">›</span>
              </span>
            }
          />
          <SettingsRow
            id="st-break-row"
            label="Break Reminder"
            divided={false}
            onClick={handleBreakClick}
            trailing={
              <span className="st-value st-value--chevron">
                {breakLabel} <span className="st-chevron">›</span>
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
          <button
            id="st-reset-btn"
            className="st-row st-row--divided st-row--button st-row--danger"
            onClick={handleResetProgress}
          >
            <span className="st-row-label">Reset Progress</span>
            <span className="st-row-trailing st-chevron">›</span>
          </button>
        </SettingsGroup>
      </div>
    </div>
  )
}