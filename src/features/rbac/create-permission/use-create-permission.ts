import { useMutation } from '@tanstack/react-query'
import { authFetch } from '../../../entities/session'
import { useKnownPermissionsStore, type CreatePermissionInput, type Permission } from '../../../entities/rbac'

export function useCreatePermission() {
  const addPermissions = useKnownPermissionsStore((state) => state.addPermissions)

  return useMutation({
    mutationFn: (input: CreatePermissionInput) =>
      authFetch<Permission>('/auth/permissions', { method: 'POST', body: input }),
    onSuccess: (permission) => {
      addPermissions([permission])
    },
  })
}
