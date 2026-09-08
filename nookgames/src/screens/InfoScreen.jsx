import { PageHeader } from '../components/PageHeader.jsx'

export function InfoScreen() {
  return (
    <div className="page info-page">
      <PageHeader title="Info" />

      <div className="info-body">

        {/* ── The Philosophy ──────────────────────────────────── */}
        <div className="info-card">
          <div className="info-card-icon" aria-hidden="true">
            {/* Leaf / calm glyph */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 21C12 21 4 15 4 9a8 8 0 0 1 16 0c0 6-8 12-8 12z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <line x1="12" y1="21" x2="12" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="info-card-body">
            <h2 className="info-card-title">The Philosophy</h2>
            <p className="info-card-text">
              Nook is built on a single principle: low-stimulation, quiet problem-solving.
              There are no algorithmic feeds, no push notifications, no timers pressuring
              your decisions. Every game is a self-contained space designed for genuine
              focus — a sanctuary from the noise, not another source of it.
            </p>
          </div>
        </div>

        {/* ── Offline & Private ────────────────────────────────── */}
        <div className="info-card">
          <div className="info-card-icon" aria-hidden="true">
            {/* Lock glyph */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M8 11V7a4 4 0 0 1 8 0v4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <circle cx="12" cy="16" r="1.25" fill="currentColor" />
            </svg>
          </div>
          <div className="info-card-body">
            <h2 className="info-card-title">Offline &amp; Private</h2>
            <p className="info-card-text">
              100% of your gameplay, progress, settings, and daily essays live entirely
              on your device. There are no accounts, no servers, no analytics, and no
              third-party trackers of any kind. Nook has never transmitted a single byte
              of your data anywhere. It works fully offline from day one.
            </p>
          </div>
        </div>

        {/* ── System ───────────────────────────────────────────── */}
        <div className="info-card info-card--system">
          <div className="info-card-icon" aria-hidden="true">
            {/* Terminal glyph */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
              <polyline
                points="7,9 11,12 7,15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line x1="13" y1="15" x2="17" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="info-card-body">
            <h2 className="info-card-title">System</h2>
            <div className="info-system-rows">
              <div className="info-system-row">
                <span className="info-system-key">Version</span>
                <span className="info-system-val">1.0.0</span>
              </div>
              <div className="info-system-row">
                <span className="info-system-key">Stack</span>
                <span className="info-system-val">React · Vite · Client-Side</span>
              </div>
              <div className="info-system-row">
                <span className="info-system-key">Storage</span>
                <span className="info-system-val">localStorage · On-device only</span>
              </div>
              <div className="info-system-row">
                <span className="info-system-key">Network</span>
                <span className="info-system-val">None required</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
