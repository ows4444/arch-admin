import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authFetch, useSessionStore, currentUserQueryKey } from '../../../entities/session'

export function useLogout() {
  const queryClient = useQueryClient()
  const clearSession = useSessionStore((state) => state.clearSession)
  const refreshToken = useSessionStore((state) => state.refreshToken)

  return useMutation({
    mutationFn: () =>
      authFetch<void>('/auth/logout', { method: 'POST', body: { refreshToken } }),
    onSettled: () => {
      clearSession()
      queryClient.removeQueries({ queryKey: currentUserQueryKey })
    },
  })
}
