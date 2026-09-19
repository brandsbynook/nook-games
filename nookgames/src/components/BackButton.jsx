import { Icon } from './Icons'
import { playTap } from '../utils/audio.js'

/**
 * Reusable BackButton component adhering to Nook's calm, low-stimulation design system.
 * - Standardized SVG chevron icon (`<Icon name="back" size={20} />`)
 * - Comfortable 44×44px touch target without visual bloating
 * - Haptic/sound feedback on tap
 * - Predictable fallback hierarchy (onClick -> href/to -> window.history.back -> '#/')
 */
export function BackButton({
  onClick,
  href,
  to,
  backHref,
  label,
  ariaLabel = 'Back',
  id,
  className = '',
  style,
  title,
  ...props
}) {
  const targetHref = href || to || backHref

  const handleClick = (e) => {
    playTap()
    if (onClick) {
      onClick(e)
    } else if (targetHref) {
      e?.preventDefault?.()
      const cleanHash = targetHref.startsWith('#')
        ? targetHref
        : `#${targetHref.startsWith('/') ? targetHref : `/${targetHref}`}`
      window.location.hash = cleanHash
    } else if (window.history.length > 1) {
      e?.preventDefault?.()
      window.history.back()
    } else {
      e?.preventDefault?.()
      window.location.hash = '#/'
    }
  }

  const combinedClassName = `nook-back-btn ${className}`.trim()

  return (
    <button
      type="button"
      id={id}
      className={combinedClassName}
      onClick={handleClick}
      aria-label={ariaLabel}
      title={title || ariaLabel}
      style={style}
      {...props}
    >
      <Icon name="back" size={20} />
      {label && <span className="nook-back-btn-label">{label}</span>}
    </button>
  )
}

export default BackButton
