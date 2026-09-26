import { getDailyEssay } from '../data/essays.js'
import { collections } from '../data/catalogue.js'
import { playTap } from '../utils/audio.js'
import { BackButton } from '../components/BackButton.jsx'
import { Icon } from '../components/Icons'

function getCompanionGame(gameId) {
  if (!gameId) return null
  for (const col of collections) {
    const found = col.games?.find((g) => g.id === gameId)
    if (found) {
      return {
        ...found,
        suiteTitle: col.title,
        iconName: found.icon || found.id || col.icon || 'book',
      }
    }
  }
  return null
}

export function EditorPickScreen() {
  const essay = getDailyEssay()
  const companionGame = getCompanionGame(essay.companionGameId)
  const companionName = essay.companionName || companionGame?.title || 'Game'
  const companionSub = companionGame?.suiteTitle || companionGame?.category || essay.theme || 'Sanctuary'
  const companionIcon = companionGame?.iconName || essay.companionGameId || 'book'

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
            <div
              id="ep-companion-card"
              className="ep-companion-card"
              role="button"
              tabIndex={0}
              onClick={handleCompanion}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleCompanion(e)
                }
              }}
              aria-label={`Play ${companionName}`}
            >
              <div className="ep-companion-left">
                <div className="ep-companion-icon-frame" aria-hidden="true">
                  <Icon name={companionIcon} size={18} strokeWidth={1.5} className="ep-companion-icon" />
                </div>
                <div className="ep-companion-info">
                  <span className="ep-companion-name">{companionName}</span>
                  <span className="ep-companion-sub">{companionSub}</span>
                </div>
              </div>
              <span className="ep-companion-chevron" aria-hidden="true">›</span>
            </div>
          </div>
        )}

        {/* Breathing room at the bottom */}
        <div className="ep-end-space" aria-hidden="true" />
      </div>
    </div>
  )
}

export default EditorPickScreen

