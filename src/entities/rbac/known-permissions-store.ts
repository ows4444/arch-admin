import { useMemo } from 'react'
import { create } from 'zustand'
import type { Permission } from './types'

// The API exposes no `GET /auth/permissions` — permissions only surface
// nested inside a role's response or as the immediate result of creating
// one. This store accumulates every permission observed so far (from role
// fetches and from creating a permission) so the "grant to role" UI has a
// catalog to pick from. It is never authoritative: a page reload rebuilds
// it entirely from `GET /auth/roles`, so it can't drift from the server in
// a way that matters. See entities/rbac/ARCH.md Design 001.
interface KnownPermissionsState {
  byName: Record<string, Permission>
  addPermissions: (permissions: Permission[]) => void
}

export const useKnownPermissionsStore = create<KnownPermissionsState>((set) => ({
  byName: {},
  addPermissions: (permissions) =>
    set((state) => {
      const byName = { ...state.byName }
      for (const permission of permissions) {
        byName[permission.name] = permission
      }
      return { byName }
    }),
}))

export function useKnownPermissions(): Permission[] {
  // `byName` is referentially stable across renders unless `addPermissions`
  // actually changes it — deriving the sorted array with useMemo (rather than
  // inline in the Zustand selector) keeps the return value stable too. A
  // selector that allocates a new array on every call defeats
  // useSyncExternalStore's change detection and causes an infinite render
  // loop, since every call looks like a change.
  const byName = useKnownPermissionsStore((state) => state.byName)
  return useMemo(
    () => Object.values(byName).sort((a, b) => a.name.localeCompare(b.name)),
    [byName],
  )
}
