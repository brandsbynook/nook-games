import { Icon } from '../icons.jsx'
import { playTap } from '../utils/audio.js'

export function GameHeader({ title, onBack, backHref, rightAction }) {
  const handleBack = (e) => {
    playTap()
    if (onBack) {
      e?.preventDefault?.()
      onBack()
    } else if (backHref) {
      e?.preventDefault?.()
      window.location.hash = backHref.startsWith('#') ? backHref : `#${backHref}`
    } else if (window.history.length > 1) {
      e?.preventDefault?.()
      window.history.back()
    } else {
      window.location.hash = '#/'
    }
  }

  return (
    <header className="page-header subscreen-header game-screen-header" role="banner">
      <button
        type="button"
        className="page-header-back game-header-back-btn"
        onClick={handleBack}
        aria-label="Back"
      >
        <Icon name="back" size={20} />
      </button>

      <h1 className="page-header-title game-header-title">{title}</h1>

      <div className="game-header-actions-slot">
        {rightAction || <span className="page-header-back-spacer" />}
      </div>
    </header>
  )
}
