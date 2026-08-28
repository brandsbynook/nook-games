import { useState } from 'react'
import { Icon } from '../icons.jsx'
import { playTap, playChime } from '../utils/audio.js'

export function BriefingScreen({ game, collection }) {
  const [notice, setNotice] = useState(false)

  function handleBack(e) {
    e.preventDefault()
    playTap()
    window.location.hash = `/collection/${collection.id}`
  }

  function handlePlay(e) {
    e.preventDefault()
    playTap()
    if (game.isPlayable) {
      playChime()
      window.location.hash = `/game/${game.id}`
    } else {
      setNotice(true)
      setTimeout(() => setNotice(false), 2800)
    }
  }

  return (
    <div className="briefing-page" role="main">
      {/* ── Top nav bar ─────────────────────────────── */}
      <div className="briefing-nav">
        <button
          id="briefing-back-btn"
          className="briefing-back-btn"
          onClick={handleBack}
          aria-label={`Back to ${collection.title}`}
        >
          <Icon name="back" size={20} />
        </button>
        <span className="briefing-nav-label">{collection.title}</span>
        <span className="briefing-nav-spacer" aria-hidden="true" />
      </div>

      {/* ── Scrollable body ──────────────────────────── */}
      <div className="briefing-body">
        {/* Hero */}
        <div className="briefing-hero" aria-hidden="true">
          <div className="briefing-icon-wrap">
            <Icon name={game.id} size={48} />
          </div>
        </div>
        <h1 className="briefing-title">{game.title}</h1>
        <p className="briefing-quote">"{game.quote}"</p>

        {/* Text blocks */}
        <div className="briefing-blocks">
          <div className="briefing-block">
            <h2 className="briefing-block-label">About</h2>
            <p className="briefing-block-text">{game.about}</p>
          </div>
          <div className="briefing-block">
            <h2 className="briefing-block-label">Origin</h2>
            <p className="briefing-block-text">{game.origin}</p>
          </div>
          <div className="briefing-block">
            <h2 className="briefing-block-label">How to Play</h2>
            <p className="briefing-block-text">{game.howToPlay}</p>
          </div>
        </div>

        {/* Chips */}
        <div className="briefing-chips" aria-label="Game details">
          <span className="briefing-chip">
            <span className="briefing-chip-label">Difficulty</span>
            <span className="briefing-chip-value">{game.difficulty}</span>
          </span>
          <span className="briefing-chip">
            <span className="briefing-chip-label">Time</span>
            <span className="briefing-chip-value">{game.timeEstimate}</span>
          </span>
        </div>

        {/* Play button */}
        <div className="briefing-play-wrap">
          <button
            id="briefing-play-btn"
            className="briefing-play-btn"
            onClick={handlePlay}
            aria-label={game.isPlayable ? `Play ${game.title}` : `${game.title} is in development`}
          >
            Play
          </button>
          <div
            className={`briefing-ambient-notice${notice ? ' is-visible' : ''}`}
            aria-live="polite"
            aria-atomic="true"
          >
            In Sanctum Development
          </div>
        </div>
      </div>
    </div>
  )
}
