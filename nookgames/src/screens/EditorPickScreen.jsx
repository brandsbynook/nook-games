import { getDailyEssay } from '../data/essays.js'
import { playTap } from '../utils/audio.js'
import { BackButton } from '../components/BackButton.jsx'

export function EditorPickScreen() {
  const essay = getDailyEssay()

  function handleCompanion(e) {
    e.preventDefault()
    playTap()
    window.location.hash = `/briefing/${essay.companionGameId}`
  }

  return (
    <div className="ep-page">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="ep-header">
        <BackButton
          id="ep-back-btn"
          className="ep-back-btn"
          to="#/home"
          ariaLabel="Back to Home"
          title="Back to Home"
        />
        <span className="ep-header-title">Editor's Pick</span>
        <span className="ep-header-spacer" aria-hidden="true" />
      </div>

      {/* ── Scrollable body ─────────────────────────────────────── */}
      <div className="ep-body">

        {/* Meta strip: theme badge + read time */}
        <div className="ep-meta">
          <span className="ep-theme-badge">{essay.theme}</span>
          <span className="ep-read-time">{essay.readTime} read</span>
        </div>

        {/* Article title */}
        <h1 className="ep-article-title">{essay.title}</h1>

        {/* Body paragraphs */}
        <div className="ep-article-body">
          {essay.paragraphs.map((paragraph, i) => (
            <p key={i} className="ep-article-paragraph">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Companion game link */}
        {essay.companionGameId && (
          <div className="ep-companion">
            <span className="ep-companion-label">Play the companion game</span>
            <a
              id="ep-companion-link"
              className="ep-companion-link"
              href={`#/briefing/${essay.companionGameId}`}
              onClick={handleCompanion}
              aria-label={`Play ${essay.companionName}`}
            >
              <span className="ep-companion-name">{essay.companionName}</span>
              <span className="ep-companion-arrow" aria-hidden="true">→</span>
            </a>
          </div>
        )}

        {/* Breathing room at the bottom */}
        <div className="ep-end-space" aria-hidden="true" />
      </div>
    </div>
  )
}

export default EditorPickScreen
