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
    >
      <span className="collection-card-icon">
        <Icon name={collection.icon} size={20} />
      </span>
      <span className="collection-card-title">{collection.title}</span>
      <span className="collection-card-chevron" aria-hidden="true">
        <Icon name="chevron" size={18} />
      </span>
    </a>
  )
}
