import { useGrantPermission } from '../../features/rbac/grant-permission'
import { useRevokePermission } from '../../features/rbac/revoke-permission'
import type { Permission, Role } from '../../entities/rbac'

export function RoleCard({ role, knownPermissions }: { role: Role; knownPermissions: Permission[] }) {
  const grantPermission = useGrantPermission()
  const revokePermission = useRevokePermission()
  const isPending = grantPermission.isPending || revokePermission.isPending
  const grantedNames = new Set(role.permissions.map((permission) => permission.name))

  const togglePermission = (permissionName: string, checked: boolean) => {
    const mutate = checked ? grantPermission.mutate : revokePermission.mutate
    mutate({ roleName: role.name, permissionName })
  }

  return (
    <div className="card">
      <h3 className="section-heading">
        <code className="token">{role.name}</code>
      </h3>

      {knownPermissions.length === 0 ? (
        <p className="status-message status-message--muted">No permissions exist yet.</p>
      ) : (
        <div className="permission-checklist">
          {knownPermissions.map((permission) => (
            <label key={permission.id} className="checkbox-field">
              <input
                type="checkbox"
                checked={grantedNames.has(permission.name)}
                disabled={isPending}
                aria-label={
                  grantedNames.has(permission.name)
                    ? `Revoke ${permission.name} from ${role.name}`
                    : `Grant ${permission.name} to ${role.name}`
                }
                onChange={(event) => togglePermission(permission.name, event.target.checked)}
              />
              <code className="token">{permission.name}</code>
            </label>
          ))}
        </div>
      )}

      {(grantPermission.isError || revokePermission.isError) && (
        <p className="status-message status-message--error" role="alert">
          Failed to update permissions for {role.name}. Please try again.
        </p>
      )}
    </div>
  )
}
