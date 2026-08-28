const icons = {
  // ── Collection icons ─────────────────────────────────────────────
  logic: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="1" />
      <path d="M4 12h16M12 4v16" />
    </>
  ),
  spatial: (
    <>
      <circle cx="7" cy="8" r="2" />
      <circle cx="17" cy="7" r="2" />
      <circle cx="8" cy="17" r="2" />
      <circle cx="16" cy="16" r="2" />
      <path d="M8.7 9.4 15.3 8.6M8.8 15.2 15.2 8.8M9.8 17.2 14.2 16.8" />
    </>
  ),
  strategy: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="1" />
      <path d="M4 12h16M12 4v16" />
      <circle cx="8" cy="8" r="1.4" />
      <circle cx="16" cy="16" r="1.4" />
    </>
  ),
  words: (
    <>
      <path d="M5 7h14M5 12h10M5 17h7" />
    </>
  ),

  // ── Navigation icons ─────────────────────────────────────────────
  home: (
    <>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6.5 10.5V20h11v-9.5" />
    </>
  ),
  progress: (
    <>
      <path d="M5 19V11M12 19V5M19 19v-7" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
  settings: (
    <>
      <path d="M5 8h14M5 16h14" />
      <circle cx="9" cy="8" r="1.8" />
      <circle cx="15" cy="16" r="1.8" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="9" r="3" />
      <path d="M6.2 18.2a6 6 0 0 1 11.6 0" />
    </>
  ),
  chevron: <path d="M9 6l6 6-6 6" />,
  back: <path d="M15 6l-6 6 6 6" />,

  // ── Game icons (hero icons for BriefingScreen) ───────────────────
  sudoku: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="1.5" />
      <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
      <circle cx="6.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="17.5" cy="17.5" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  nonogram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="1.5" />
      <rect x="6" y="6" width="4" height="4" rx="0.5" />
      <rect x="14" y="6" width="4" height="4" rx="0.5" />
      <rect x="6" y="14" width="4" height="4" rx="0.5" />
      <rect x="10" y="10" width="4" height="4" rx="0.5" />
    </>
  ),
  kakuro: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="1.5" />
      <path d="M3 12h18M12 3v18M3 3l18 18" strokeDasharray="2 2" />
    </>
  ),
  slitherlink: (
    <>
      <circle cx="5" cy="5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="19" cy="5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="5" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="5" cy="19" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="19" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="19" cy="19" r="1.2" fill="currentColor" stroke="none" />
      <path d="M5 5h7M19 5v7M19 12v7M5 19h7M5 5v7" />
    </>
  ),
  shikaku: (
    <>
      <rect x="3" y="3" width="9" height="5" rx="0.5" />
      <rect x="14" y="3" width="7" height="9" rx="0.5" />
      <rect x="3" y="10" width="9" height="11" rx="0.5" />
      <rect x="14" y="14" width="7" height="7" rx="0.5" />
    </>
  ),
  '15-puzzle': (
    <>
      <rect x="3" y="3" width="18" height="18" rx="1.5" />
      <rect x="4" y="4" width="4" height="4" rx="0.5" />
      <rect x="10" y="4" width="4" height="4" rx="0.5" />
      <rect x="16" y="4" width="4" height="4" rx="0.5" />
      <rect x="4" y="10" width="4" height="4" rx="0.5" />
      <rect x="10" y="10" width="4" height="4" rx="0.5" />
      <rect x="16" y="10" width="4" height="4" rx="0.5" />
      <rect x="4" y="16" width="4" height="4" rx="0.5" />
      <rect x="10" y="16" width="4" height="4" rx="0.5" />
    </>
  ),
  untangle: (
    <>
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M8 6h8M6 8v8M18 8v8M8 18h8M8 8l8 8M16 8l-8 8" />
    </>
  ),
  'arrow-puzzle': (
    <>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
      <path d="M5 6v12" strokeDasharray="2 2" />
    </>
  ),
  'one-line': (
    <>
      <circle cx="5" cy="12" r="2" />
      <circle cx="19" cy="6" r="2" />
      <circle cx="19" cy="18" r="2" />
      <path d="M7 12 c4-8 12-2 10 6" />
      <path d="M17 18 c-2-4-8-6-10-6" />
    </>
  ),
  '2048': (
    <>
      <rect x="3" y="3" width="8" height="8" rx="1" />
      <rect x="13" y="3" width="8" height="8" rx="1" />
      <rect x="3" y="13" width="8" height="8" rx="1" />
      <path d="M16 13v8M13 17h8" />
    </>
  ),
  'knights-tour': (
    <>
      <rect x="3" y="3" width="18" height="18" rx="1" />
      <path d="M10 17V9l-2 2" />
      <path d="M10 9c0-2 4-2 4 0v2h2l-1 4h-5" />
      <path d="M10 17h4" />
      <path d="M7 15h10" strokeDasharray="1.5 2" />
    </>
  ),
  chess: (
    <>
      <path d="M9 20h6M12 20v-4" />
      <path d="M9 16c0-1.5 1.5-4 3-4s3 2.5 3 4" />
      <path d="M10 12V9l-1.5-1.5L10 6h4l1.5 2.5L14 9v3" />
      <path d="M12 6V4" />
      <circle cx="12" cy="3.5" r="1" />
    </>
  ),
  go: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="0.5" />
      <path d="M8 3v18M12 3v18M16 3v18M3 8h18M3 12h18M3 16h18" />
      <circle cx="8" cy="8" r="2" fill="currentColor" stroke="none" />
      <circle cx="16" cy="16" r="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </>
  ),
  reversi: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="9" cy="10" r="2.5" fill="currentColor" stroke="none" />
      <circle cx="15" cy="14" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
    </>
  ),
  checkers: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="1" />
      <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
      <circle cx="7" cy="7" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="13" cy="13" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="17" cy="7" r="1.8" fill="none" stroke="currentColor" strokeWidth="1.3" />
    </>
  ),
  'word-ladder': (
    <>
      <rect x="3" y="4" width="18" height="4" rx="1" />
      <rect x="3" y="10" width="18" height="4" rx="1" />
      <rect x="3" y="16" width="18" height="4" rx="1" />
      <path d="M12 4V3M12 8v2M12 14v2M12 16v-2" strokeWidth="1" />
    </>
  ),
  crossword: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="1" />
      <rect x="3" y="3" width="6" height="6" rx="0" fill="currentColor" stroke="none" />
      <rect x="15" y="3" width="6" height="6" rx="0" fill="currentColor" stroke="none" />
      <rect x="3" y="15" width="6" height="6" rx="0" fill="currentColor" stroke="none" />
      <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
    </>
  ),
  anagrams: (
    <>
      <path d="M4 17L12 4l8 13H4z" />
      <path d="M8 13h8" />
    </>
  ),
  'reasoning-puzzles': (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5l3 3" />
      <circle cx="12" cy="4" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  'tower-of-hanoi': (
    <>
      <path d="M12 4v16" />
      <rect x="8" y="8" width="8" height="2.5" rx="1" />
      <rect x="5.5" y="11.5" width="13" height="2.5" rx="1" />
      <rect x="3" y="15" width="18" height="2.5" rx="1" />
      <path d="M3 20h18" />
    </>
  ),
}

export function Icon({ name, size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {icons[name]}
    </svg>
  )
}
