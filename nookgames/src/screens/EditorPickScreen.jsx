import { editorsPick } from '../data/editorial.js'
import { playTap } from '../utils/audio.js'

export function EditorPickScreen() {
  function handleBack(e) {
    e.preventDefault()
    playTap()
    window.location.hash = '/'
  }

  return (
    <div className="ep-page">
      {/* Header */}
      <div className="ep-header">
        <button
          id="ep-back-btn"
          className="ep-back-btn"
          onClick={handleBack}
          aria-label="Back to Home"
        >
          ←
        </button>
        <span className="ep-header-title">Editor's Pick</span>
        <span className="ep-header-spacer" aria-hidden="true" />
      </div>

      {/* Scrollable content */}
      <div className="ep-body">
        {/* Feature image card */}
        <div className="ep-feature-card" aria-hidden="true">
          <span className="ep-feature-label">FEATURED</span>
        </div>

        {/* Article */}
        <h1 className="ep-article-title">{editorsPick.title}</h1>
        <p className="ep-article-subtitle">{editorsPick.subtitle}</p>

        <div className="ep-article-body">
          {editorsPick.body.map((paragraph, i) => (
            <p key={i} className="ep-article-paragraph">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}
