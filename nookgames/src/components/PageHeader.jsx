import { Icon } from '../icons.jsx'

export function PageHeader({ title, backHref }) {
  return (
    <header className="page-header subscreen-header" role="banner">
      {backHref ? (
        <a className="page-header-back" href={backHref} aria-label="Back">
          <Icon name="back" size={20} />
        </a>
      ) : (
        <span className="page-header-back-spacer" />
      )}
      <h1 className="page-header-title">{title}</h1>
      <span className="page-header-back-spacer" />
    </header>
  )
}
