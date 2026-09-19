import React from 'react'

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string
  strokeWidth?: number | string
  className?: string
}

export interface UniversalIconProps extends IconProps {
  name: string
}

function SvgBase({
  size = 24,
  strokeWidth = 1.75,
  className = '',
  children,
  ...props
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  )
}

// ── Collection Icons ─────────────────────────────────────────────────────────

export function LogicIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      {/* 4 corner terminal pads */}
      <rect x="3.5" y="3.5" width="4" height="4" rx="1" />
      <rect x="16.5" y="3.5" width="4" height="4" rx="1" />
      <rect x="3.5" y="16.5" width="4" height="4" rx="1" />
      <rect x="16.5" y="16.5" width="4" height="4" rx="1" />
      {/* Central logic core block */}
      <rect x="9" y="7" width="6" height="10" rx="1.5" />
      {/* Circuit bus lines connecting pads and logic core */}
      <path d="M5.5 7.5v9M5.5 12H9" />
      <path d="M18.5 7.5v9M15 12h3.5" />
    </SvgBase>
  )
}

export function StrategyIcon(props: IconProps) {
  return <ChessIcon {...props} />
}

export function PuzzlesIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2.5" />
      <path d="M3 3l18 18M21 3L3 21M3 12h18M12 3v18" />
    </SvgBase>
  )
}

export function WordsIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      {/* Pristine typographic 'Aa' */}
      {/* Capital 'A' */}
      <path d="M4 18.5L9 5.5l5 13" />
      <path d="M6.3 13.5h5.4" />
      {/* Lowercase 'a' */}
      <circle cx="17.2" cy="14.2" r="2.8" />
      <path d="M20 11.4v6.8a0.8 0.8 0 0 0 .8.8" />
    </SvgBase>
  )
}

export function ClassicsIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <rect x="4" y="6" width="11" height="15" rx="2" />
      <path d="M9 3h7a2 2 0 0 1 2 2v13" />
      <path d="M7.5 11h4" />
    </SvgBase>
  )
}

export function SequenceIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <circle cx="6" cy="6" r="2.2" />
      <circle cx="18" cy="6" r="2.2" />
      <circle cx="6" cy="18" r="2.2" />
      <circle cx="18" cy="18" r="2.2" />
      <path d="M8.2 6h7.6M18 8.2v7.6M15.8 18H8.2M6 15.8V8.2M8 8l8 8" />
    </SvgBase>
  )
}

export function CipherIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      {/* Clean rotary cipher wheel with generous breathing room and 4 cardinal ticks */}
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4.5" />
      {/* 4 small perpendicular tick marks between rings with zero collision */}
      <line x1="12" y1="4.25" x2="12" y2="6.25" />
      <line x1="12" y1="17.75" x2="12" y2="19.75" />
      <line x1="4.25" y1="12" x2="6.25" y2="12" />
      <line x1="17.75" y1="12" x2="19.75" y2="12" />
      {/* Center axis pip */}
      <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
    </SvgBase>
  )
}

// ── Game Icons ───────────────────────────────────────────────────────────────

export function ChessIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      {/* Pedestal Base */}
      <path d="M4.5 20.5h15" />
      <path d="M6 18h12" />
      {/* Knight horse profile contour */}
      <path d="M6.5 18c0-3.5 1.5-5 2.2-6-1-.5-2.7-1.7-2.7-3s1-1.5 2-1.5l2 0c1-1.2 1.7-3 2.5-4.5.6-.7 1.5-.3 1.2.7l-.4 1.8c2.7 1.5 4.7 5.5 4.7 12.5" />
      {/* Inner mane stroke & eye accent */}
      <path d="M14.5 9.5c1 2.5 1 5.5 1 8.5" />
      <circle cx="9.5" cy="9.5" r="0.75" fill="currentColor" stroke="none" />
    </SvgBase>
  )
}

export function KnightsTourIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      {/* Background 3x3 dot grid */}
      <circle cx="6" cy="6" r="1.2" fill="currentColor" stroke="none" opacity="0.35" />
      <circle cx="12" cy="6" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="18" cy="6" r="1.2" fill="currentColor" stroke="none" opacity="0.35" />
      <circle cx="6" cy="12" r="1.2" fill="currentColor" stroke="none" opacity="0.35" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" opacity="0.35" />
      <circle cx="18" cy="12" r="1.2" fill="currentColor" stroke="none" opacity="0.35" />
      <circle cx="6" cy="18" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="18" r="1.2" fill="currentColor" stroke="none" opacity="0.35" />
      <circle cx="18" cy="18" r="1.2" fill="currentColor" stroke="none" opacity="0.35" />
      {/* L-move path: 2 steps up from (6,18) to (6,6), then 1 step right to (12,6) */}
      <path d="M6 18V6h6" />
      {/* Start node */}
      <circle cx="6" cy="18" r="2.2" fill="currentColor" stroke="none" />
      {/* Turn node */}
      <circle cx="6" cy="6" r="1.8" fill="none" stroke="currentColor" strokeWidth={1.5} />
      {/* Destination target node */}
      <circle cx="12" cy="6" r="2.5" fill="none" stroke="currentColor" strokeWidth={1.5} />
      <circle cx="12" cy="6" r="1" fill="currentColor" stroke="none" />
    </SvgBase>
  )
}

export function CheckersIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      {/* Top stacked concentric disc */}
      <ellipse cx="12" cy="7.5" rx="7.5" ry="3.5" />
      <ellipse cx="12" cy="7.5" rx="4" ry="1.8" />
      <path d="M4.5 7.5v3c0 1.93 3.36 3.5 7.5 3.5s7.5-1.57 7.5-3.5v-3" />
      {/* Bottom stacked concentric disc */}
      <ellipse cx="12" cy="14" rx="7.5" ry="3.5" />
      <ellipse cx="12" cy="14" rx="4" ry="1.8" />
      <path d="M4.5 14v3c0 1.93 3.36 3.5 7.5 3.5s7.5-1.57 7.5-3.5v-3" />
    </SvgBase>
  )
}

export function ReversiIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      {/* Two-tone coin: left half solid filled, right half open */}
      <path d="M12 3.5a8.5 8.5 0 0 0 0 17V3.5z" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="8.5" />
      {/* Outer axis marks */}
      <path d="M12 2v1.5M12 20.5V22M2 12h1.5M20.5 12H22" opacity="0.6" />
    </SvgBase>
  )
}

export function GomokuIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      {/* Grid intersection lines */}
      <path d="M4 6h16M4 12h16M4 18h16M6 4v16M12 4v16M18 4v16" opacity="0.4" strokeWidth="1.2" />
      {/* 3 diagonal stones aligned along intersection points */}
      <circle cx="6" cy="18" r="2.75" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="2.75" fill="none" stroke="currentColor" strokeWidth={1.75} />
      <circle cx="18" cy="6" r="2.75" fill="currentColor" stroke="none" />
    </SvgBase>
  )
}

export function SudokuIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      {/* Simple 3x3 outer rounded rectangle */}
      <rect x="3" y="3" width="18" height="18" rx="2.5" />
      {/* Thin inner grid partition lines */}
      <path d="M3 9h18M3 15h18M9 3v18M15 3v18" strokeWidth={1.2} opacity="0.8" />
      {/* Small number '7' in the top center cell */}
      <path d="M10.6 4.8h2.8l-1.6 3.4" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
    </SvgBase>
  )
}

export function LightsOutIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      {/* 5-cell cross toggle shape (+ shape) */}
      <rect x="9.5" y="3.5" width="5" height="5" rx="1.5" />
      <rect x="9.5" y="15.5" width="5" height="5" rx="1.5" />
      <rect x="3.5" y="9.5" width="5" height="5" rx="1.5" />
      <rect x="15.5" y="9.5" width="5" height="5" rx="1.5" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="1.5" fill="currentColor" fillOpacity="0.2" />
      {/* Center toggle glow pip */}
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </SvgBase>
  )
}

export function ShikakuIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      {/* Outer rounded rectangle */}
      <rect x="3" y="3" width="18" height="18" rx="2.5" />
      {/* Asymmetric room partition divider */}
      <path d="M3 13.5h9V3" />
      {/* Quiet room area numeral clues */}
      <circle cx="7.5" cy="8.2" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="16.5" cy="15.5" r="1.1" fill="currentColor" stroke="none" />
    </SvgBase>
  )
}

export function NonogramIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      {/* 4x4 outer rounded rectangle */}
      <rect x="3" y="3" width="18" height="18" rx="2.5" />
      {/* 4x4 grid division lines */}
      <path d="M3 7.5h18M3 12h18M3 16.5h18M7.5 3v18M12 3v18M16.5 3v18" strokeWidth={1} opacity="0.4" />
      {/* Picture puzzle filled square blocks */}
      <rect x="8.3" y="3.8" width="2.9" height="2.9" rx="0.5" fill="currentColor" stroke="none" />
      <rect x="12.8" y="3.8" width="2.9" height="2.9" rx="0.5" fill="currentColor" stroke="none" />
      <rect x="3.8" y="8.3" width="2.9" height="2.9" rx="0.5" fill="currentColor" stroke="none" />
      <rect x="8.3" y="8.3" width="2.9" height="2.9" rx="0.5" fill="currentColor" stroke="none" />
      <rect x="12.8" y="8.3" width="2.9" height="2.9" rx="0.5" fill="currentColor" stroke="none" />
      <rect x="17.3" y="8.3" width="2.9" height="2.9" rx="0.5" fill="currentColor" stroke="none" />
      <rect x="8.3" y="12.8" width="2.9" height="2.9" rx="0.5" fill="currentColor" stroke="none" />
      <rect x="12.8" y="12.8" width="2.9" height="2.9" rx="0.5" fill="currentColor" stroke="none" />
      <rect x="8.3" y="17.3" width="2.9" height="2.9" rx="0.5" fill="currentColor" stroke="none" />
      <rect x="12.8" y="17.3" width="2.9" height="2.9" rx="0.5" fill="currentColor" stroke="none" />
    </SvgBase>
  )
}

export function KakuroIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2.5" />
      <path d="M3 3l18 18" />
      <path d="M14 6l3 3M7 15l3 3" opacity="0.6" strokeWidth={1.2} />
    </SvgBase>
  )
}

export function SlitherlinkIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <polygon points="12,3.5 20.5,8.5 20.5,17 12,21 3.5,16 3.5,7.5" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="8" cy="9.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="16" cy="14.5" r="1.2" fill="currentColor" stroke="none" />
    </SvgBase>
  )
}

export function FifteenPuzzleIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2.5" />
      <rect x="5.5" y="5.5" width="3.5" height="3.5" rx="0.75" />
      <rect x="10.25" y="5.5" width="3.5" height="3.5" rx="0.75" />
      <rect x="15" y="5.5" width="3.5" height="3.5" rx="0.75" />
      <rect x="5.5" y="10.25" width="3.5" height="3.5" rx="0.75" />
      <rect x="10.25" y="10.25" width="3.5" height="3.5" rx="0.75" />
      <rect x="15" y="10.25" width="3.5" height="3.5" rx="0.75" />
      <rect x="5.5" y="15" width="3.5" height="3.5" rx="0.75" />
      <rect x="10.25" y="15" width="3.5" height="3.5" rx="0.75" />
    </SvgBase>
  )
}

export function UntangleIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M8 6h8M6 8v8M18 8v8M8 18h8M8 8l8 8M16 8l-8 8" />
    </SvgBase>
  )
}

export function OneLineIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <circle cx="5" cy="12" r="2" />
      <circle cx="19" cy="6" r="2" />
      <circle cx="19" cy="18" r="2" />
      <path d="M7 12c4-8 12-2 10 6" />
      <path d="M17 18c-2-4-8-6-10-6" />
    </SvgBase>
  )
}

export function Game2048Icon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="8" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
      <path d="M17 13v8M13 17h8" />
    </SvgBase>
  )
}

export function GoIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M8 3v18M12 3v18M16 3v18M3 8h18M3 12h18M3 16h18" strokeWidth={1} opacity={0.6} />
      <circle cx="8" cy="8" r="2" fill="currentColor" stroke="none" />
      <circle cx="16" cy="16" r="2" fill="none" stroke="currentColor" strokeWidth={1.5} />
    </SvgBase>
  )
}

export function WordLadderIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      {/* Clean vertical rails with horizontal rungs */}
      <line x1="6.5" y1="3.5" x2="6.5" y2="20.5" />
      <line x1="17.5" y1="3.5" x2="17.5" y2="20.5" />
      <line x1="6.5" y1="7" x2="17.5" y2="7" />
      <line x1="6.5" y1="12" x2="17.5" y2="12" />
      <line x1="6.5" y1="17" x2="17.5" y2="17" />
    </SvgBase>
  )
}

export function CrosswordIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      {/* Interlocking crossword: 3 horizontal square boxes crossed by 3 vertical square boxes in an asymmetrical intersection */}
      {/* Outer contour of the asymmetrical 5-box crossword puzzle */}
      <path d="M4.25 5.75A1.5 1.5 0 0 1 5.75 4.25H8.25A1.5 1.5 0 0 1 9.75 5.75V9.5H18.25A1.5 1.5 0 0 1 19.75 11V13.5A1.5 1.5 0 0 1 18.25 15H9.75V18.25A1.5 1.5 0 0 1 8.25 19.75H5.75A1.5 1.5 0 0 1 4.25 18.25Z" />
      {/* Internal crossword cell gridlines */}
      <line x1="4.25" y1="9.5" x2="9.75" y2="9.5" />
      <line x1="4.25" y1="15" x2="9.75" y2="15" />
      <line x1="9.75" y1="9.5" x2="9.75" y2="15" />
      <line x1="14.75" y1="9.5" x2="14.75" y2="15" />
    </SvgBase>
  )
}

export function AnagramsIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      {/* Subtle curved exchange arc above with swap arrowhead */}
      <path d="M6.5 6.5C9.5 3.2 14.5 3.2 17.5 6.5" strokeWidth={1.35} opacity={0.85} />
      <polyline points="15.2 6.5 17.5 6.5 17.5 4.2" strokeWidth={1.35} opacity={0.85} />

      {/* Left letter tile: 'A' */}
      <rect x="3" y="9.5" width="8.2" height="10" rx="1.5" />
      <path d="M5.3 17.2L7.1 12.2l1.8 5" />
      <line x1="5.9" y1="15.5" x2="8.3" y2="15.5" />

      {/* Right letter tile: 'B' */}
      <rect x="12.8" y="9.5" width="8.2" height="10" rx="1.5" />
      <path d="M15.3 17.2V12.2h1.5a1.25 1.25 0 0 1 1.25 1.25c0 .7-.55 1.25-1.25 1.25H15.3h1.6a1.25 1.25 0 0 1 1.25 1.25c0 .7-.55 1.25-1.25 1.25Z" />
    </SvgBase>
  )
}

export function MastermindIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      {/* 2x2 matrix of distinct geometric symbol tiles: Circle, Triangle, Square, Diamond */}
      {/* Top-Left: Circle */}
      <circle cx="7.5" cy="7.5" r="3.2" />
      {/* Top-Right: Triangle */}
      <polygon points="16.5,4.3 13.3,10.7 19.7,10.7" />
      {/* Bottom-Left: Square */}
      <rect x="4.5" y="13.5" width="6" height="6" rx="1.2" />
      {/* Bottom-Right: Diamond */}
      <polygon points="16.5,13.3 19.7,16.5 16.5,19.7 13.3,16.5" />
    </SvgBase>
  )
}

export function TowerOfHanoiIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M12 4v16" />
      <rect x="8" y="8" width="8" height="2.5" rx="1" />
      <rect x="5.5" y="11.5" width="13" height="2.5" rx="1" />
      <rect x="3" y="15" width="18" height="2.5" rx="1" />
      <path d="M3 20h18" />
    </SvgBase>
  )
}

// ── UI / Navigation Icons ───────────────────────────────────────────────────

export function HomeIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M4 11.5L12 4l8 7.5" />
      <path d="M6.5 10.5V20h11v-9.5" />
    </SvgBase>
  )
}

export function ProgressIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M5 19V11M12 19V5M19 19v-7" />
    </SvgBase>
  )
}

export function InfoIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5M12 8h.01" />
    </SvgBase>
  )
}

export function SettingsIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      {/* Minimal horizontal sliders */}
      <line x1="4" y1="8" x2="20" y2="8" />
      <circle cx="9" cy="8" r="2.2" fill="none" stroke="currentColor" strokeWidth={1.75} />
      <line x1="4" y1="16" x2="20" y2="16" />
      <circle cx="15" cy="16" r="2.2" fill="none" stroke="currentColor" strokeWidth={1.75} />
    </SvgBase>
  )
}

export function ProfileIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <circle cx="12" cy="9" r="3.5" />
      <path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" />
    </SvgBase>
  )
}

export function ChevronIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M9 6l6 6-6 6" />
    </SvgBase>
  )
}

export function BackIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M15 6l-6 6 6 6" />
    </SvgBase>
  )
}

export function EraseIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
      <path d="M22 21H7" />
      <path d="m5 11 9 9" />
    </SvgBase>
  )
}

export function PencilIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </SvgBase>
  )
}

export function RestartIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </SvgBase>
  )
}

export function UndoIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
    </SvgBase>
  )
}

export function HintIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
    </SvgBase>
  )
}

export function EyeIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </SvgBase>
  )
}

export function ListIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </SvgBase>
  )
}

export function CheckIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <polyline points="20 6 9 17 4 12" />
    </SvgBase>
  )
}

export function SparklesIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="m12 3-1.9 5.1L5 10l5.1 1.9L12 17l1.9-5.1L19 10l-5.1-1.9zM19 16l-.9 2.1-2.1.9 2.1.9.9 2.1.9-2.1 2.1-.9-2.1-.9z" />
    </SvgBase>
  )
}

export function LeafIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </SvgBase>
  )
}

export function BookIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      {/* Delicate line-art open book */}
      <path d="M3.5 19.5c2.5-1.2 5.5-1.2 8.5 0V5.5c-3-1.2-6-1.2-8.5 0v14z" />
      <path d="M20.5 19.5c-2.5-1.2-5.5-1.2-8.5 0V5.5c3-1.2 6-1.2 8.5 0v14z" />
      <path d="M12 5.5v14" />
    </SvgBase>
  )
}

export function BookmarkIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      {/* Delicate ribbon bookmark */}
      <path d="M6 3.5h12a1.5 1.5 0 0 1 1.5 1.5v15.5l-7.5-4.5-7.5 4.5V5a1.5 1.5 0 0 1 1.5-1.5z" />
    </SvgBase>
  )
}

// ── Universal Icon Mapping Registry ──────────────────────────────────────────

const componentRegistry: Record<string, React.ComponentType<IconProps>> = {
  // Collections
  logic: LogicIcon,
  sequence: SequenceIcon,
  spatial: SequenceIcon,
  strategy: StrategyIcon,
  puzzles: PuzzlesIcon,
  words: WordsIcon,
  cipher: CipherIcon,
  deduction: CipherIcon,
  classics: ClassicsIcon,

  // Navigation & UI
  home: HomeIcon,
  progress: ProgressIcon,
  info: InfoIcon,
  settings: SettingsIcon,
  profile: ProfileIcon,
  chevron: ChevronIcon,
  back: BackIcon,
  erase: EraseIcon,
  pencil: PencilIcon,
  restart: RestartIcon,
  undo: UndoIcon,
  hint: HintIcon,
  lightbulb: HintIcon,
  eye: EyeIcon,
  list: ListIcon,
  check: CheckIcon,
  sparkles: SparklesIcon,
  leaf: LeafIcon,
  ambient: LeafIcon,
  book: BookIcon,
  bookmark: BookmarkIcon,

  // Games
  chess: ChessIcon,
  gomoku: GomokuIcon,
  sudoku: SudokuIcon,
  checkers: CheckersIcon,
  'lights-out': LightsOutIcon,
  lanterns: LightsOutIcon,
  shikaku: ShikakuIcon,
  nonogram: NonogramIcon,
  kakuro: KakuroIcon,
  slitherlink: SlitherlinkIcon,
  '15-puzzle': FifteenPuzzleIcon,
  untangle: UntangleIcon,
  'one-line': OneLineIcon,
  '2048': Game2048Icon,
  'knights-tour': KnightsTourIcon,
  go: GoIcon,
  reversi: ReversiIcon,
  'word-ladder': WordLadderIcon,
  crossword: CrosswordIcon,
  anagrams: AnagramsIcon,
  mastermind: MastermindIcon,
  'tower-of-hanoi': TowerOfHanoiIcon,
}

export function Icon({ name, size = 24, strokeWidth = 1.75, ...props }: UniversalIconProps) {
  const Component = componentRegistry[name]
  if (!Component) {
    return null
  }
  return <Component size={size} strokeWidth={strokeWidth} {...props} />
}

export default Icon
