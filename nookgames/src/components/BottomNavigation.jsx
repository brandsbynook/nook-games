import { Icon } from './Icons'

const tabs = [
  { id: 'home', label: 'Home', href: '#/' },
  { id: 'progress', label: 'Progress', href: '#/progress' },
  { id: 'info', label: 'Info', href: '#/info' },
  { id: 'settings', label: 'Settings', href: '#/settings' },
]

export function BottomNavigation({ active }) {
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {tabs.map((tab) => {
        const isActive = tab.id === active
        return (
          <a
            key={tab.id}
            href={tab.href}
            className={`bottom-nav-item${isActive ? ' is-active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon name={tab.id} size={20} />
            <span>{tab.label}</span>
          </a>
        )
      })}
    </nav>
  )
}
