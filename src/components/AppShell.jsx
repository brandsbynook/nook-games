import { Header } from './Header.jsx'
import { BottomNavigation } from './BottomNavigation.jsx'

export function AppShell({ navActive, children }) {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-main" id="main">
        {children}
      </main>
      <BottomNavigation active={navActive} />
    </div>
  )
}
