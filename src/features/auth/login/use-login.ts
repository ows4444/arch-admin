import { useMutation, useQueryClient } from '@tanstack/react-query'
import { http } from '../../../shared/api'
import { useSessionStore, currentUserQueryKey, type AuthSession } from '../../../entities/session'
import type { LoginFormValues } from './login-schema'

export function useLogin() {
  const queryClient = useQueryClient()
  const setSession = useSessionStore((state) => state.setSession)

  return useMutation({
    mutationFn: (values: LoginFormValues) =>
      http<AuthSession>('/auth/login', { method: 'POST', body: values }),
    onSuccess: (session) => {
      setSession(session)
      void queryClient.invalidateQueries({ queryKey: currentUserQueryKey })
    },
  })
}
