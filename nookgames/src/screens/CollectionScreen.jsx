import { Icon } from '../icons.jsx'
import { GameCard } from '../components/GameCard.jsx'
import { playTap } from '../utils/audio.js'

export function CollectionScreen({ collection, category = collection }) {
  const activeCategory = category || collection || {}

  function handleBack(e) {
    e.preventDefault()
    playTap()
    window.location.hash = '#/'
  }

  return (
    <div className="cs-page">
      {/* ── Top Navigation Bar ───────────────────────────────── */}
      <header
        className="collection-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '12px 16px',
          boxSizing: 'border-box',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          background: '#000000',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <button
          onClick={handleBack}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '8px',
          }}
          aria-label="Go back"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <span
          style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '18px',
            fontWeight: 600,
            color: '#ffffff',
            textTransform: 'capitalize',
            letterSpacing: '0.02em',
          }}
        >
          {activeCategory.title || activeCategory.name}
        </span>

        <div style={{ width: '40px' }} aria-hidden="true" />
      </header>

      {/* ── Scrollable Body with Hero, Games, and Negative Space ── */}
      <div className="cs-body">
        {/* Category Hero Section: Centered glyph + contemplative subtitle */}
        <div className="cs-hero">
          <div className="cs-hero-icon" aria-hidden="true">
            <Icon name={activeCategory.icon || 'logic'} size={40} />
          </div>
          <p className="cs-hero-tagline">{activeCategory.tagline}</p>
        </div>

        {/* Section Label + Game Cards */}
        <div className="cs-games-section">
          <span className="cs-games-label">GAMES</span>
          <div className="cs-game-list">
            {(activeCategory.games || []).map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </div>

        {/* Calm, unhurried negative space */}
        <div className="cs-negative-space" aria-hidden="true" />
      </div>
    </div>
  )
}
