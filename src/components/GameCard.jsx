export function GameCard({ game }) {
  return (
    <a className="game-card" href={`#/game/${game.id}`}>
      <span className="game-card-title">{game.title}</span>
      <span className="game-card-status">Not playable yet</span>
    </a>
  )
}
