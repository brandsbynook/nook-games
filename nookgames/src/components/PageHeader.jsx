import { BackButton } from './BackButton.jsx'

export function PageHeader({ title, backHref, onBack }) {
  return (
    <header className="page-header subscreen-header" role="banner">
      {backHref || onBack ? (
        <BackButton backHref={backHref} onClick={onBack} ariaLabel="Back" />
      ) : (
        <span className="page-header-back-spacer" />
      )}
      <h1 className="page-header-title">{title}</h1>
      <span className="page-header-back-spacer" />
    </header>
  )
}

export default PageHeader
