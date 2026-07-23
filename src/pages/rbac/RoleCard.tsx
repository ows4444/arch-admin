import { useGrantPermission } from '../../features/rbac/grant-permission'
import { useRevokePermission } from '../../features/rbac/revoke-permission'
import { EmptyState, RolesIcon } from '../../shared/ui'
import type { Permission, Role } from '../../entities/rbac'

export function RoleCard({ role, knownPermissions }: { role: Role; knownPermissions: Permission[] }) {
  const grantPermission = useGrantPermission()
  const revokePermission = useRevokePermission()
  const isPending = grantPermission.isPending || revokePermission.isPending
  const pendingPermissionName = grantPermission.isPending
    ? grantPermission.variables?.permissionName
    : revokePermission.isPending
      ? revokePermission.variables?.permissionName
      : undefined
  const grantedNames = new Set(role.permissions.map((permission) => permission.name))

  const togglePermission = (permissionName: string, checked: boolean) => {
    // Guard re-entrancy here rather than via the `disabled` attribute: disabling
    // the checkbox the user just interacted with force-blurs it, and nothing
    // restores focus once the mutation settles — a keyboard user toggling
    // several permissions in a row would lose their tab position every time.
    if (isPending) return
    const mutate = checked ? grantPermission.mutate : revokePermission.mutate
    mutate({ roleName: role.name, permissionName })
  }

  return (
    <div className="card">
      <h3 className="section-heading">
        <code className="token">{role.name}</code>
      </h3>

      {knownPermissions.length === 0 ? (
        <EmptyState icon={<RolesIcon size={20} />}>No permissions exist yet.</EmptyState>
      ) : (
        <div className="permission-checklist">
          {knownPermissions.map((permission) => (
            <label
              key={permission.id}
              className="checkbox-field"
              data-pending={permission.name === pendingPermissionName || undefined}
            >
              <input
                type="checkbox"
                checked={grantedNames.has(permission.name)}
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
