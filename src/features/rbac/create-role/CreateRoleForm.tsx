import { useId, useState, type FormEvent } from 'react'
import { useKnownPermissions } from '../../../entities/rbac'
import { ApiError } from '../../../shared/api'
import { createRoleSchema, type CreateRoleFormValues } from './create-role-schema'
import { useCreateRole } from './use-create-role'

const emptyForm: CreateRoleFormValues = { name: '', permissions: [] }

export function CreateRoleForm() {
  const createRole = useCreateRole()
  const knownPermissions = useKnownPermissions()
  const [form, setForm] = useState<CreateRoleFormValues>(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const nameId = useId()

  const togglePermission = (name: string, checked: boolean) => {
    setForm((current) => ({
      ...current,
      permissions: checked
        ? [...current.permissions, name]
        : current.permissions.filter((permission) => permission !== name),
    }))
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const result = createRoleSchema.safeParse(form)
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Invalid input')
      return
    }
    setError(null)
    createRole.mutate(
      {
        name: result.data.name,
        permissions: result.data.permissions.length > 0 ? result.data.permissions : undefined,
      },
      { onSuccess: () => setForm(emptyForm) },
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2 className="section-heading">New role</h2>

      <div className="field field--narrow">
        <label className="field-label" htmlFor={nameId}>
          Name
        </label>
        <input
          id={nameId}
          className="input input--mono"
          placeholder="e.g. billing-admin"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
        />
      </div>

      <div className="field">
        <span className="field-label">Permissions</span>
        {knownPermissions.length === 0 ? (
          <p className="field-hint">
            No permissions created yet. You can grant permissions to this role after creating one.
          </p>
        ) : (
          <div className="permission-checklist">
            {knownPermissions.map((permission) => (
              <label key={permission.id} className="checkbox-field">
                <input
                  type="checkbox"
                  checked={form.permissions.includes(permission.name)}
                  onChange={(event) => togglePermission(permission.name, event.target.checked)}
                />
                <code className="token">{permission.name}</code>
              </label>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="status-message status-message--error" role="alert">
          {error}
        </p>
      )}
      {createRole.isError && (
        <p className="status-message status-message--error" role="alert">
          {createRole.error instanceof ApiError && createRole.error.status === 409
            ? 'A role with that name already exists.'
            : 'Failed to create role. Please try again.'}
        </p>
      )}
      <div>
        <button type="submit" className="btn btn--primary" disabled={createRole.isPending}>
          {createRole.isPending ? 'Creating…' : 'Create role'}
        </button>
      </div>
    </form>
  )
}
