import { Icon } from '../components/Icons'
import { BackButton } from '../components/BackButton.jsx'
import { GameCard } from '../components/GameCard.jsx'

export function CollectionScreen({ collection, category = collection }) {
  const activeCategory = category || collection || {}

  return (
    <div className="cs-page page">
      {/* ── Top Navigation Bar ───────────────────────────────── */}
      <header className="cs-header category-header">
        <BackButton
          id="category-back-btn"
          className="cs-back-btn"
          to="#/home"
          ariaLabel="Back to home"
          title="Back to home"
        />

        <span className="cs-header-title">
          {activeCategory.title || activeCategory.name}
        </span>

        <div className="cs-header-spacer" aria-hidden="true" />
      </header>

      {/* ── Scrollable Body with Hero, Games, and Negative Space ── */}
      <div className="cs-body page-content">
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
          <div className="cs-game-list games-list">
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

export default CollectionScreen
