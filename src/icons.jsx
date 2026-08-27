const icons = {
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
