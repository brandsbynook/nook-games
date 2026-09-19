import { useEffect, useRef } from 'react'
import { Icon } from './Icons'

/**
 * ZenSplash — 1.2 s full-screen zen transition before entering a game.
 * Props:
 *   game    — game object (uses game.id for icon, game.quote for text)
 *   onDone  — callback fired after the animation completes
 */
export function ZenSplash({ game, onDone }) {
  const barRef = useRef(null)

  useEffect(() => {
    // Double-RAF guarantees the element is painted BEFORE we add the class,
    // which is required for CSS transitions to fire from width: 0 → 100%.
    let raf1, raf2
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        if (barRef.current) {
          barRef.current.classList.add('zen-bar-animate')
        }
      })
    })

    // Route to game after 1.25 s (bar transition is 1.15 s + 100 ms buffer)
    const timerId = setTimeout(() => {
      onDone()
    }, 1250)

    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
      clearTimeout(timerId)
    }
  }, [onDone])

  return (
    <div
      className="zen-splash"
      aria-live="polite"
      aria-label="Loading game"
      role="status"
    >
      <div className="zen-splash-inner">
        {/* Large game icon */}
        <div className="zen-splash-icon" aria-hidden="true">
          <Icon name={game.id} size={56} />
        </div>

        {/* Contemplation quote */}
        <p className="zen-splash-quote">{game.quote}</p>

        {/* Thin animated progress line */}
        <div className="zen-bar-track" aria-hidden="true">
          <div className="zen-bar-fill" ref={barRef} />
        </div>
      </div>
    </div>
  )
}
