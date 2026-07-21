import { useQuery } from '@tanstack/react-query'
import { authFetch } from '../session'
import type { Role } from './types'

export const rolesQueryKey = ['rbac', 'roles'] as const

export function useRoles() {
  return useQuery({
    queryKey: rolesQueryKey,
    queryFn: () => authFetch<Role[]>('/auth/roles'),
  })
}
