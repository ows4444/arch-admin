import { useQuery } from '@tanstack/react-query'
import { authFetch } from './auth-fetch'
import { useSessionStore } from './session-store'
import type { AuthenticatedUser } from './types'

export const currentUserQueryKey = ['session', 'current-user'] as const

export function useCurrentUser() {
  const hasRefreshToken = useSessionStore((state) => state.refreshToken !== null)

  return useQuery({
    queryKey: currentUserQueryKey,
    queryFn: () => authFetch<AuthenticatedUser>('/auth/me'),
    enabled: hasRefreshToken,
    retry: false,
    staleTime: 60_000,
  })
}
