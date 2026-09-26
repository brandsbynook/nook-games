import { useState } from 'react'
import { collections } from '../data/catalogue.js'
import { getDailyEssay } from '../data/essays.js'
import { CollectionCard } from '../components/CollectionCard.jsx'
import { SectionLabel } from '../components/SectionLabel.jsx'
import { Header } from '../components/Header.jsx'
import { Icon, BookIcon } from '../components/Icons'
import { playTap } from '../utils/audio.js'
import { getLastActiveGame } from '../utils/storage.js'

function getGameIcon(gameId) {
  if (!gameId) return 'book'
  for (const col of collections) {
    const found = col.games?.find((g) => g.id === gameId)
    if (found) return found.icon || found.id || col.icon
  }
  return 'book'
}

export function HomeScreen() {
  const essay = getDailyEssay()
  // Read once on mount — game screens update storage so next Home visit reflects it
  const [lastGame] = useState(() => getLastActiveGame())
  const gameIcon = lastGame?.gameId ? getGameIcon(lastGame.gameId) : 'book'

  function handleEditorsPick(e) {
    e.preventDefault()
    playTap()
    window.location.hash = '/editors-pick'
  }

  function handleResume(e) {
    e.preventDefault()
    playTap()
    window.location.hash = `/briefing/${lastGame.gameId}`
  }

  return (
    <div className="home-screen-root">
      {/* ── Sanctuary branding header ──────────────────────────── */}
      <Header />

      <div className="home-content-frame">
        {/* Pick up where you left off */}
        <section className="home-section home-section-scoped" aria-labelledby="resume-label">
          <SectionLabel>
            <span id="resume-label">Pick up where you left off</span>
          </SectionLabel>

          {lastGame ? (
            <a
              id="resume-card"
              className="home-card-scoped home-card-resume"
              href={`#/briefing/${lastGame.gameId}`}
              onClick={handleResume}
              aria-label={`Resume ${lastGame.gameName}`}
            >
              <div className="home-resume-thumb" aria-hidden="true">
                <Icon name={gameIcon} size={18} strokeWidth={1.5} />
              </div>
              <div className="home-card-body">
                <span className="home-card-title">{lastGame.gameName}</span>
                <span className="home-card-sub">{lastGame.suiteName}</span>
              </div>
              <span className="home-card-chevron-wrap" aria-hidden="true">›</span>
            </a>
          ) : (
            <p className="empty-state">Nothing in progress yet.</p>
          )}
        </section>

        {/* Browse by collection */}
        <section className="home-section home-section-scoped" aria-labelledby="browse-label">
          <SectionLabel>
            <span id="browse-label">Browse by collection</span>
          </SectionLabel>
          <ul className="collection-list home-collection-list">
            {collections.map((collection) => (
              <li key={collection.id}>
                <CollectionCard collection={collection} />
              </li>
            ))}
          </ul>
        </section>

        {/* Editor's Pick */}
        <section className="home-section home-section-scoped" aria-labelledby="ep-label">
          <SectionLabel>
            <span id="ep-label">Editor's Pick</span>
          </SectionLabel>
          <a
            id="editors-pick-card"
            className="ep-home-card"
            href="#/editors-pick"
            onClick={handleEditorsPick}
            aria-label={`Read: ${essay.title}`}
          >
            <div className="ep-home-thumb" aria-hidden="true">
              <BookIcon size={22} strokeWidth={1.5} />
            </div>
            <div className="ep-home-text">
              <span className="ep-home-title">{essay.title}</span>
              <span className="ep-home-sub">{essay.theme} · {essay.readTime}</span>
            </div>
            <span className="home-card-chevron-wrap" aria-hidden="true">›</span>
          </a>
        </section>
      </div>
    </div>
  )
}

export default HomeScreen


