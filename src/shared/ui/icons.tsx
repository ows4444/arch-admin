export function DashboardIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1.5" y="1.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="8.5" y="1.5" width="6" height="9.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="1.5" y="9.5" width="6" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

export function ValidationRulesIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 2.5l5-1.5 5 1.5v5.2c0 3.5-2.2 6.1-5 6.8-2.8-.7-5-3.3-5-6.8V2.5z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M5.5 8l1.8 1.8L10.5 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function RolesIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="6" cy="5" r="2.25" stroke="currentColor" strokeWidth="1.4" />
      <path d="M1.75 13.5c0-2.3 1.9-4 4.25-4s4.25 1.7 4.25 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M10.5 2.3c1.2.35 2 1.4 2 2.7s-.8 2.35-2 2.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M12 9.6c1.4.4 2.25 1.6 2.25 3.15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}
