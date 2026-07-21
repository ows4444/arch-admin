import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authFetch } from '../../../entities/session'
import { rolesQueryKey, type CreateRoleInput, type Role } from '../../../entities/rbac'

export function useCreateRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateRoleInput) =>
      authFetch<Role>('/auth/roles', { method: 'POST', body: input }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: rolesQueryKey })
    },
  })
}
