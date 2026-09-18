import React from 'react'

/**
 * Tile.jsx — Individual 2048 Tile Component
 * Percentage-based dynamic transform strictly aligning with background slots.
 * Tracks previousPosition and newPosition.
 * Animates transform: translate(x, y) over 150ms ease-in-out curve.
 * Triggers pop-scale effect on merge and scale-up from 0 on spawn.
 */
export function Tile({
  tile,
  size = 4,
  val: propVal,
  r: propR,
  c: propC,
  previousPosition: propPrev,
  newPosition: propNew,
  isNew: propIsNew,
  isMerged: propIsMerged,
  isDeleting: propIsDeleting,
}) {
  // Support either passing a whole `tile` object or individual props
  const val = tile?.val ?? propVal ?? 0
  const r = tile?.r ?? propNew?.r ?? propR ?? 0
  const c = tile?.c ?? propNew?.c ?? propC ?? 0
  const previousPosition = tile?.previousPosition ?? propPrev ?? null
  const newPosition = tile ? { r: tile.r, c: tile.c } : (propNew ?? { r, c })
  const isNew = tile?.isNew ?? propIsNew ?? false
  const isMerged = tile?.isMerged ?? propIsMerged ?? false
  const isDeleting = tile?.isDeleting ?? propIsDeleting ?? false

  const tileClass = `g2048-slot g2048-tile g2048-tile--${val <= 2048 ? val : 'super'}${
    isMerged ? ' g2048-tile--merged' : ''
  }${isNew ? ' g2048-tile--new' : ''}`

  return (
    <div
      className={`g2048-tile-wrapper${isDeleting ? ' g2048-tile-wrapper--deleting' : ''}`}
      style={{
        '--r': r,
        '--c': c,
        '--grid-size': size,
        position: 'absolute',
        top: '10px',
        left: '10px',
        width: `calc((100% - 20px - (${size} - 1) * var(--gap, 10px)) / ${size})`,
        height: `calc((100% - 20px - (${size} - 1) * var(--gap, 10px)) / ${size})`,
        transform:
          'translate(calc(var(--c) * (100% + var(--gap, 10px))), calc(var(--r) * (100% + var(--gap, 10px))))',
        transition: 'transform 150ms ease-in-out',
        zIndex: isMerged ? 10 : isDeleting ? 1 : 5,
      }}
      data-r={r}
      data-c={c}
      data-prev-r={previousPosition?.r}
      data-prev-c={previousPosition?.c}
      data-new-r={newPosition?.r}
      data-new-c={newPosition?.c}
    >
      <div
        className={tileClass}
        role="gridcell"
        aria-label={`Tile ${val}`}
      >
        <span className="g2048-tile-text">{val}</span>
      </div>
    </div>
  )
}

export default Tile
