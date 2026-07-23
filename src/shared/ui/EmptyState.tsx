import type { ReactNode } from 'react'

export function EmptyState({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="empty-state">
      <span className="empty-state-icon">{icon}</span>
      <p className="status-message status-message--muted">{children}</p>
    </div>
  )
}
