import { Haptics, ImpactStyle } from '@capacitor/haptics'

/**
 * audio.js — Nook procedural Web Audio synthesizer
 * No external audio files. Uses Web Audio API only.
 */

let _ctx = null

function getContext() {
  if (!_ctx) {
    _ctx = new (window.AudioContext || window.webkitAudioContext)()
  }
  // Resume if suspended (browser autoplay policy)
  if (_ctx.state === 'suspended') {
    _ctx.resume()
  }
  return _ctx
}

/**
 * Lightweight haptic vibration helper.
 * Checks localStorage key 'nook-haptics' (default: true).
 */
export async function triggerHaptic(duration = 8) {
  try {
    if (localStorage.getItem('nook-haptics') === 'false') return

    // Try native Capacitor Haptics first
    try {
      await Haptics.impact({ style: ImpactStyle.Light })
      return
    } catch {
      // Fallback to web navigator.vibrate if not running in native shell
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(duration)
      }
    }
  } catch {}
}

/**
 * Returns true if the user has enabled the mute setting.
 * Backed by localStorage key 'nook-muted'.
 */
export function isMuted() {
  try {
    return localStorage.getItem('nook-muted') === 'true'
  } catch {
    return false
  }
}

/**
 * Muted warm sine-wave tick.
 * 420 Hz dropping exponentially to 140 Hz over 0.08 s,
 * gain decays to silence by 0.12 s.
 */
export function playTap() {
  if (isMuted()) return
  triggerHaptic(8)
  try {
    const ctx = getContext()
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(420, now)
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.08)

    gain.gain.setValueAtTime(0.18, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.13)
  } catch {
    // Silently fail — audio is non-critical
  }
}

/**
 * Pentatonic chord progression for completion states.
 * Voices: C4, Eb4, G4, Bb4, D5 — staggered sine waves fading over 1.2 s.
 */
export function playChime() {
  if (isMuted()) return
  try {
    const ctx = getContext()
    const now = ctx.currentTime
    const root = 261.63 // C4

    // Pentatonic ratios relative to C4
    const freqs = [
      root,           // C4
      root * 1.2,     // Eb4 ≈ 313.9 Hz
      root * 1.5,     // G4 ≈ 392.5 Hz
      root * 1.8,     // Bb4 ≈ 470.9 Hz
      root * 2.25,    // D5 ≈ 588.7 Hz
    ]

    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      const startTime = now + i * 0.06 // stagger each voice by 60 ms

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, startTime)

      gain.gain.setValueAtTime(0.0001, startTime)
      gain.gain.linearRampToValueAtTime(0.14, startTime + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(startTime)
      osc.stop(startTime + 1.25)
    })
  } catch {
    // Silently fail — audio is non-critical
  }
}

/**
 * Toggle the mute state. Returns the new muted value.
 */
export function toggleMute() {
  try {
    const next = !isMuted()
    localStorage.setItem('nook-muted', String(next))
    return next
  } catch {
    return false
  }
}
