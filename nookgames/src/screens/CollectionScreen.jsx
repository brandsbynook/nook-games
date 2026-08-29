import { Icon } from '../icons.jsx'
import { GameCard } from '../components/GameCard.jsx'
import { playTap } from '../utils/audio.js'

export function CollectionScreen({ collection }) {
  function handleBack(e) {
    e.preventDefault()
    playTap()
    window.location.hash = '/'
  }

  return (
    <div className="cs-page">
      {/* ── Top bar: Simple left chevron back button + category title ── */}
      <div className="cs-header">
        <button
          id="cs-back-btn"
          className="cs-back-btn"
          onClick={handleBack}
          aria-label="Back to Home"
        >
          <Icon name="back" size={20} />
        </button>
        <span className="cs-header-title">{collection.title}</span>
        <span className="cs-header-spacer" aria-hidden="true" />
      </div>

      {/* ── Scrollable Body with natural flow & crucial bottom negative space ── */}
      <div className="cs-body">
        {/* Category Hero Section: 32px top, 28px bottom margin */}
        <div className="cs-hero">
          <div className="cs-hero-icon" aria-hidden="true">
            <Icon name={collection.icon} size={40} />
          </div>
          <p className="cs-hero-tagline">{collection.tagline}</p>
        </div>

        {/* Section Label + Game Cards */}
        <div className="cs-games-section">
          <span className="cs-games-label">GAMES</span>
          <div className="cs-game-list">
            {collection.games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </div>

        {/* Bottom 35-45% calm, unhurried negative space */}
        <div className="cs-negative-space" aria-hidden="true" />
      </div>
    </div>
  )
}
