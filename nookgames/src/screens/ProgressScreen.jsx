import { useState, useEffect } from 'react'
import { PageHeader } from '../components/PageHeader.jsx'
import { collections } from '../data/catalogue.js'
import { getStoredProgress } from '../utils/storage.js'

// ── Helpers ──────────────────────────────────────────────────────────────────

function winRate(played, won) {
  if (!played) return '—'
  return `${Math.round((won / played) * 100)}%`
}

function exploredCount(byGame) {
  return Object.values(byGame).filter((g) => g.played > 0).length
}

// ── Sub-components ───────────────────────────────────────────────────────────

function MetricCard({ label, value, sub }) {
  return (
    <div className="prg-metric-card">
      <span className="prg-metric-value">{value}</span>
      <span className="prg-metric-label">{label}</span>
      {sub && <span className="prg-metric-sub">{sub}</span>}
    </div>
  )
}

const ADVERSARIAL_GAME_IDS = new Set(['chess', 'checkers', 'gomoku', 'reversi'])

function GameRow({ game, stats, isLast }) {
  const totalPlays = stats?.played ?? 0
  const wins = stats?.won ?? 0
  const losses = Math.max(0, totalPlays - wins)
  const clears = wins
  const hasPlayed = totalPlays > 0
  const hasWon = wins > 0
  const isAdversarial = ADVERSARIAL_GAME_IDS.has(game.id)
  const gameName = game.name || game.title

  return (
    <div className={`prg-game-row${isLast ? '' : ' prg-game-row--divided'}`}>
      <div className="prg-game-info">
        <span className={`prg-game-name${hasPlayed ? '' : ' prg-game-name--untouched'}`}>
          {gameName}
        </span>
        <span className="prg-game-meta">
          {totalPlays > 0 ? `${totalPlays} ${totalPlays === 1 ? 'session' : 'sessions'}` : 'Unplayed'}
        </span>
      </div>
      <div className="prg-game-stats-cluster">
        {isAdversarial ? (
          <span className="prg-game-record">
            {totalPlays > 0 ? `${wins}W · ${losses}L` : '—'}
          </span>
        ) : (
          <span className="prg-game-record">
            {clears > 0 ? `${clears} cleared` : '—'}
          </span>
        )}
        <div
          className={`prg-game-badge ${hasPlayed ? (hasWon ? 'prg-game-badge--won' : 'prg-game-badge--played') : 'prg-game-badge--none'}`}
          aria-label={hasWon ? 'Won' : hasPlayed ? 'Played' : 'Not yet played'}
        >
          {hasWon ? '✓' : hasPlayed ? '·' : ''}
        </div>
      </div>
    </div>
  )
}

function SuiteSection({ collection, byGame }) {
  return (
    <div className="prg-suite">
      <span className="prg-suite-label">{collection.title.toUpperCase()}</span>
      <div className="prg-suite-card">
        {collection.games.map((game, idx) => (
          <GameRow
            key={game.id}
            game={game}
            stats={byGame[game.id]}
            isLast={idx === collection.games.length - 1}
          />
        ))}
      </div>
    </div>
  )
}

// ── Screen ───────────────────────────────────────────────────────────────────

export function ProgressScreen() {
  const [progress, setProgress] = useState(() => getStoredProgress())

  // Refresh whenever the tab becomes visible (user may have played since last visit)
  useEffect(() => {
    function refresh() {
      setProgress(getStoredProgress())
    }
    document.addEventListener('visibilitychange', refresh)
    return () => document.removeEventListener('visibilitychange', refresh)
  }, [])

  const { gamesPlayed = 0, gamesWon = 0, byGame = {} } = progress

  const isEmpty = gamesPlayed === 0

  return (
    <div className="page prg-page">
      <PageHeader title="Progress" />

      {isEmpty ? (
        /* ── Empty state ────────────────────────────────────── */
        <div className="prg-empty">
          <div className="prg-empty-icon" aria-hidden="true">
            {/* Subtle hourglass / leaf glyph */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 21C12 21 4 15 4 9a8 8 0 0 1 16 0c0 6-8 12-8 12z"
                stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"
              />
              <line x1="12" y1="21" x2="12" y2="10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </div>
          <p className="prg-empty-text">
            Take your time. Your practices will quietly gather here as you play.
          </p>
        </div>
      ) : (
        <>
          {/* ── Aggregate metrics ──────────────────────────── */}
          <div className="prg-metrics">
            <MetricCard label="Played" value={gamesPlayed} />
            <MetricCard label="Win Rate" value={winRate(gamesPlayed, gamesWon)} />
            <MetricCard
              label="Explored"
              value={`${exploredCount(byGame)} / 20`}
            />
          </div>

          {/* ── Per-suite game breakdown ───────────────────── */}
          <div className="prg-suites">
            {collections.map((col) => (
              <SuiteSection key={col.id} collection={col} byGame={byGame} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
