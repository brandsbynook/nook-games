import { Icon } from './Icons'
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
      {/* Small icon square */}
      <span className="game-card-icon" aria-hidden="true">
        <Icon name={game.id} size={20} />
      </span>

      {/* Title + meta */}
      <span className="game-card-body">
        <span className="game-card-title">{game.title}</span>
        <span className="game-card-meta">
          {game.difficulty} · {game.timeEstimate}
        </span>
      </span>

      {/* Chevron */}
      <span className="game-card-chevron" aria-hidden="true">
        <Icon name="chevron" size={18} />
      </span>
    </a>
  )
}
