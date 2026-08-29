import { Icon } from '../icons.jsx'
import { playTap } from '../utils/audio.js'

export function CollectionCard({ collection }) {
  function handleClick() {
    playTap()
  }

  return (
    <a
      className="collection-card"
      href={`#/collection/${collection.id}`}
      onClick={handleClick}
      aria-label={`Browse ${collection.title} collection`}
    >
      <span className="collection-card-icon" aria-hidden="true">
        <Icon name={collection.icon} size={20} />
      </span>
      <div className="collection-card-body">
        <span className="collection-card-title">{collection.title}</span>
        <span className="collection-card-sub">{collection.description}</span>
      </div>
      <span className="collection-card-chevron" aria-hidden="true">
        <Icon name="chevron" size={18} />
      </span>
    </a>
  )
}
