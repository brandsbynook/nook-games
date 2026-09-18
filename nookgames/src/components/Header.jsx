import { useTheme } from '../context/ThemeContext.jsx'
import { Icon } from '../icons.jsx'

export function Header() {
  const { openAtmosphere } = useTheme()

  return (
    <header className="home-brand-header">
      <button
        type="button"
        id="home-atmo-trigger"
        className="home-atmo-btn"
        onClick={openAtmosphere}
        aria-label="Open atmosphere and sound settings"
        title="Atmosphere & Ambient Sound"
      >
        <Icon name="leaf" size={17} />
      </button>
      <h1 className="home-brand-title">nook games.</h1>
      <p className="home-brand-tagline">quiet play for focused minds</p>
    </header>
  )
}

