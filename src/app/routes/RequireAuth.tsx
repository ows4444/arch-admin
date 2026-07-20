import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useCurrentUser, useSessionStore } from '../../entities/session'

/**
 * Fetch-on-render guard (not a router loader) to stay consistent with the
 * app's default loading strategy — see ARCH.md "Design 001".
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const hasRefreshToken = useSessionStore((state) => state.refreshToken !== null)
  const { isPending, isError } = useCurrentUser()

  if (!hasRefreshToken || isError) {
    return <Navigate to="/login" replace />
  }

  if (isPending) {
    return <p>Loading…</p>
  }

  return <>{children}</>
}
