import { useEffect } from 'react'
import { useKnownPermissions, useKnownPermissionsStore, useRoles } from '../../entities/rbac'
import { CreatePermissionForm } from '../../features/rbac/create-permission'
import { CreateRoleForm } from '../../features/rbac/create-role'
import { RoleCard } from './RoleCard'

export function RbacPage() {
  const roles = useRoles()
  const addPermissions = useKnownPermissionsStore((state) => state.addPermissions)
  const knownPermissions = useKnownPermissions()

  useEffect(() => {
    if (!roles.data) return
    addPermissions(roles.data.flatMap((role) => role.permissions))
  }, [roles.data, addPermissions])

  return (
    <section>
      <div className="page-header">
        <h1>Roles &amp; permissions</h1>
        <p>Manage roles, permissions, and which permissions each role grants.</p>
      </div>

      <div className="rbac-form-grid">
        <div className="card">
          <CreatePermissionForm />
        </div>
        <div className="card">
          <CreateRoleForm />
        </div>
      </div>

      <div className="section">
        <h2 className="section-heading">Roles</h2>
        {roles.isPending && (
          <p className="status-message status-message--muted" role="status">
            Loading…
          </p>
        )}
        {roles.isError && (
          <div className="status-message status-message--error">
            <span>Couldn't load roles.</span>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => roles.refetch()}>
              Retry
            </button>
          </div>
        )}
        {roles.data && roles.data.length === 0 && (
          <p className="status-message status-message--muted">No roles yet. Create one above.</p>
        )}
        {roles.data && roles.data.length > 0 && (
          <div className="role-list">
            {roles.data.map((role) => (
              <RoleCard key={role.id} role={role} knownPermissions={knownPermissions} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
