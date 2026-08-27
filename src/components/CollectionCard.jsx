import { Icon } from '../icons.jsx'

export function CollectionCard({ collection }) {
  return (
    <a className="collection-card" href={`#/collection/${collection.id}`}>
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
