import { GameCard } from '../components/GameCard.jsx'
import { PageHeader } from '../components/PageHeader.jsx'

export function CollectionScreen({ collection }) {
  return (
    <div className="page">
      <PageHeader title={collection.title} backHref="#/" />
      <p className="page-description">{collection.description}</p>
      <ul className="game-list">
        {collection.games.map((game) => (
          <li key={game.id}>
            <GameCard game={game} />
          </li>
        ))}
      </ul>
    </div>
  )
}
