import { useId } from 'react'

export function LogoMark({ size = 28 }) {
  const gradientId = useId()
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop style={{ stopColor: 'var(--indigo)' }} />
          <stop offset="1" style={{ stopColor: 'var(--indigo-deep)' }} />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${gradientId})`} />
      <path d="M10 11h8a4 4 0 0 1 0 8h-4" stroke="var(--white)" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="11" cy="21" r="2.2" fill="var(--white)" />
    </svg>
  )
}

export default function Logo({ href = '#top', tone = 'dark' }) {
  return (
    <a className={`logo logo--${tone}`} href={href} aria-label="Piralax, back to top">
      <LogoMark />
      <span className="logo__word">Piralax</span>
    </a>
  )
}
