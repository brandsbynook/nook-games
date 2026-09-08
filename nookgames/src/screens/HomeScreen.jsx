import { collections } from '../data/catalogue.js'
import { getDailyEssay } from '../data/essays.js'
import { CollectionCard } from '../components/CollectionCard.jsx'
import { SectionLabel } from '../components/SectionLabel.jsx'
import { playTap } from '../utils/audio.js'

export function HomeScreen() {
  const essay = getDailyEssay()

  function handleEditorsPick(e) {
    e.preventDefault()
    playTap()
    window.location.hash = '/editors-pick'
  }

  return (
    <div className="page">
      {/* Pick up where you left off */}
      <section className="home-section" aria-labelledby="resume-label">
        <SectionLabel>
          <span id="resume-label">Pick up where you left off</span>
        </SectionLabel>
        <p className="empty-state">Nothing in progress yet.</p>
      </section>

      {/* Browse by collection */}
      <section className="home-section" aria-labelledby="browse-label">
        <SectionLabel>
          <span id="browse-label">Browse by collection</span>
        </SectionLabel>
        <ul className="collection-list">
          {collections.map((collection) => (
            <li key={collection.id}>
              <CollectionCard collection={collection} />
            </li>
          ))}
        </ul>
      </section>

      {/* Editor's Pick */}
      <section className="home-section" aria-labelledby="ep-label">
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
            {/* Book / essay glyph */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
              <line x1="7" y1="8" x2="17" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="7" y1="12" x2="17" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="7" y1="16" x2="13" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="ep-home-text">
            <span className="ep-home-title">{essay.title}</span>
            <span className="ep-home-sub">{essay.theme} · {essay.readTime}</span>
          </div>
          <span className="ep-home-chevron" aria-hidden="true">›</span>
        </a>
      </section>
    </div>
  )
}
