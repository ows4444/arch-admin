import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authFetch } from '../../../entities/session'
import { rolesQueryKey, type Role } from '../../../entities/rbac'

export function useRevokePermission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ roleName, permissionName }: { roleName: string; permissionName: string }) =>
      authFetch<Role>(
        `/auth/roles/${encodeURIComponent(roleName)}/permissions/${encodeURIComponent(permissionName)}`,
        { method: 'DELETE' },
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: rolesQueryKey })
    },
  })
}
