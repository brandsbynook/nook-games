import { BackButton } from './BackButton.jsx'

export function GameHeader({ title, onBack, backHref, rightAction, action }) {
  const headerAction = action || rightAction
  return (
    <header className="page-header subscreen-header game-screen-header" role="banner">
      <BackButton
        className="page-header-back game-header-back-btn"
        onClick={onBack}
        backHref={backHref}
        ariaLabel="Back"
      />

      <h1 className="page-header-title game-header-title">{title}</h1>

      <div className="game-header-actions-slot">
        {headerAction || <span className="page-header-back-spacer" />}
      </div>
    </header>
  )
}

export default GameHeader
