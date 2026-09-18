import { playTap } from '../utils/audio.js'

export const STANDARD_TIERS = [
  { id: 'gentle', label: 'Gentle' },
  { id: 'standard', label: 'Standard' },
  { id: 'deep', label: 'Deep' },
]

export function DifficultyTabs({
  currentTier,
  onSelectTier,
  tiers = STANDARD_TIERS,
  className = '',
}) {
  return (
    <div className={`game-diff-bar ${className}`.trim()} role="tablist" aria-label="Difficulty Level">
      {tiers.map((tier, idx) => {
        const id = typeof tier === 'string' ? tier.toLowerCase() : tier.id
        const label = typeof tier === 'string' ? tier : tier.label
        const subtitle = typeof tier === 'object' ? tier.subtitle : null

        const currentTierId = typeof currentTier === 'string' ? currentTier.toLowerCase() : currentTier
        const isActive = currentTierId === id || currentTier === idx

        return (
          <button
            key={id || idx}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`game-diff-tab${isActive ? ' game-diff-tab--active' : ''}`}
            onClick={() => {
              playTap()
              onSelectTier(id, idx, tier)
            }}
          >
            <span className="game-diff-tab-label">{label}</span>
            {subtitle && <span className="game-diff-tab-sub">{subtitle}</span>}
          </button>
        )
      })}
    </div>
  )
}
