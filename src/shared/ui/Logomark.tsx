export function Logomark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect width="32" height="32" rx="7" className="logomark-plate" />
      <path d="M11 7H21L19.4 25H12.6L11 7Z" className="logomark-key" />
    </svg>
  )
}
