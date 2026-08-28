import { playTap } from '../utils/audio.js'

export function GameCard({ game }) {
  function handleClick() {
    playTap()
  }

  return (
    <a
      className="game-card"
      href={`#/briefing/${game.id}`}
      onClick={handleClick}
    >
      <span className="game-card-title">{game.title}</span>
      <span className={`game-card-status${game.isPlayable ? ' is-ready' : ''}`}>
        {game.isPlayable ? 'Ready' : 'Coming soon'}
      </span>
    </a>
  )
}
