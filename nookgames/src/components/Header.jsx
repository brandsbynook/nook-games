import { Icon } from '../icons.jsx'

export function Header() {
  return (
    <header className="app-header">
      <span className="app-header-side" />
      <p className="wordmark">nook</p>
      <span className="app-header-side app-header-profile" aria-hidden="true">
        <Icon name="profile" size={20} />
      </span>
    </header>
  )
}
