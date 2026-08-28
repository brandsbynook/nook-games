import { PageHeader } from '../components/PageHeader.jsx'

export function GamePlaceholderScreen({ game, collection }) {
  return (
    <div className="page">
      <PageHeader
        title={game.title}
        backHref={`#/collection/${collection.id}`}
      />
      <p className="page-description">Game not implemented yet.</p>
    </div>
  )
}
