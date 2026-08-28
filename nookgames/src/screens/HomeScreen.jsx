import { collections } from '../data/catalogue.js'
import { CollectionCard } from '../components/CollectionCard.jsx'
import { SectionLabel } from '../components/SectionLabel.jsx'

export function HomeScreen() {
  return (
    <div className="page">
      <section className="home-section" aria-labelledby="resume-label">
        <SectionLabel>
          <span id="resume-label">Pick up where you left off</span>
        </SectionLabel>
        <p className="empty-state">Nothing in progress yet.</p>
      </section>

      <section className="home-section" aria-labelledby="browse-label">
        <SectionLabel>
          <span id="browse-label">Browse by collection</span>
        </SectionLabel>
        <ul className="collection-list">
          {collections.map((collection) => (
            <li key={collection.id}>
              <CollectionCard collection={collection} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
