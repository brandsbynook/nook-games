import { collections } from '../data/catalogue.js'
import { editorsPick } from '../data/editorial.js'
import { CollectionCard } from '../components/CollectionCard.jsx'
import { SectionLabel } from '../components/SectionLabel.jsx'
import { playTap } from '../utils/audio.js'

export function HomeScreen() {
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
          aria-label={`Read: ${editorsPick.title}`}
        >
          <div className="ep-home-thumb" aria-hidden="true">
            {/* Mountain/landscape icon placeholder matching reference */}
            <svg width="28" height="20" viewBox="0 0 28 20" fill="none" aria-hidden="true">
              <path d="M0 20L8 8l5 7 4-5 11 10H0z" fill="currentColor" opacity="0.5" />
              <path d="M17 7l11 13H6L17 7z" fill="currentColor" opacity="0.3" />
            </svg>
          </div>
          <div className="ep-home-text">
            <span className="ep-home-title">{editorsPick.title}</span>
            <span className="ep-home-sub">{editorsPick.subtitle}</span>
          </div>
          <span className="ep-home-chevron" aria-hidden="true">›</span>
        </a>
      </section>
    </div>
  )
}
