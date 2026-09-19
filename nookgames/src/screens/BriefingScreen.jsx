import { useState, useCallback } from 'react'
import { Icon } from '../icons.jsx'
import { BackButton } from '../components/BackButton.jsx'
import { ZenSplash } from '../components/ZenSplash.jsx'
import { playTap } from '../utils/audio.js'
import { setLastActiveGame } from '../utils/storage.js'

export function BriefingScreen({ game, collection }) {
  const [showZen, setShowZen] = useState(false)

  function handlePlay(e) {
    e.preventDefault()
    playTap()
    if (game.isPlayable) {
      setShowZen(true)
    }
  }

  const handleZenDone = useCallback(() => {
    // Persist to storage so the Home resume card reflects the last game played
    setLastActiveGame(game.id, game.title, collection?.title ?? '')
    window.location.hash = `#/play/${game.id}`
  }, [game.id, game.title, collection])

  if (showZen) {
    return <ZenSplash game={game} onDone={handleZenDone} />
  }

  return (
    <div className="bs-page">
      {/* ── Top bar: Left slim back chevron + centered game title ── */}
      <div className="bs-topbar">
        <BackButton
          id="bs-back-btn"
          className="bs-back-btn"
          to={`#/collection/${collection.id}`}
          ariaLabel={`Back to ${collection.title}`}
          title={`Back to ${collection.title}`}
        />
        <div className="bs-topbar-center">
          <span className="bs-topbar-title">{game.title}</span>
        </div>
        <span className="bs-topbar-spacer" aria-hidden="true" />
      </div>

      {/* ── Body: Strict mobile frame height, space-between layout ── */}
      <div className="bs-body">
        {/* ── Top Block: Hero Icon + Metadata Blocks ── */}
        <div className="bs-top-block">
          {/* Hero Icon: 48px centered white glyph with 28px margin top/bottom */}
          <div className="bs-hero-section">
            <div className="bs-hero" aria-hidden="true">
              <Icon name={game.id} size={48} />
            </div>
          </div>

          {/* Metadata Blocks: ABOUT, BEST FOR, ORIGIN, HOW TO PLAY */}
          <div className="bs-essence">
            <div className="bs-essence-row">
              <span className="bs-essence-label">ABOUT {game.title.toUpperCase()}</span>
              <p className="bs-essence-value">{game.about}</p>
            </div>
            <div className="bs-essence-row">
              <span className="bs-essence-label">BEST FOR</span>
              <p className="bs-essence-value">{game.bestFor}</p>
            </div>
            <div className="bs-essence-row">
              <span className="bs-essence-label">ORIGIN</span>
              <p className="bs-essence-value">{game.origin}</p>
            </div>
            <div className="bs-essence-row">
              <span className="bs-essence-label">HOW TO PLAY</span>
              <p className="bs-essence-value">{game.howToPlay}</p>
            </div>
          </div>
        </div>

        {/* ── Bottom Cluster: 2-column info cards + Play Button ── */}
        <div className="bs-bottom-block">
          {/* Info cards: DIFFICULTY & TIME with 12px gap */}
          <div className="bs-stats">
            <div className="bs-stat-card">
              <span className="bs-stat-label">DIFFICULTY</span>
              <span className="bs-stat-value">{game.difficulty}</span>
            </div>
            <div className="bs-stat-card">
              <span className="bs-stat-label">TIME</span>
              <span className="bs-stat-value">{game.timeEstimate}</span>
            </div>
          </div>

          {/* Full-width white pill Play button: 52px height, bold black text */}
          <button
            id="bs-play-btn"
            className={`bs-play-btn${game.isPlayable ? '' : ' bs-play-btn--unplayable'}`}
            onClick={handlePlay}
            aria-label={game.isPlayable ? `Play ${game.title}` : `${game.title} arriving in future release`}
          >
            {game.isPlayable ? '▶  Play' : 'Arriving in future release'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default BriefingScreen
