import { useId, useState, type FormEvent } from 'react'
import { ApiError } from '../../../shared/api'
import { createPermissionSchema, type CreatePermissionFormValues } from './create-permission-schema'
import { useCreatePermission } from './use-create-permission'

const emptyForm: CreatePermissionFormValues = { name: '', description: '' }

export function CreatePermissionForm() {
  const createPermission = useCreatePermission()
  const [form, setForm] = useState<CreatePermissionFormValues>(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const nameId = useId()
  const descriptionId = useId()

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const result = createPermissionSchema.safeParse(form)
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Invalid input')
      return
    }
    setError(null)
    createPermission.mutate(
      {
        name: result.data.name,
        description: result.data.description.trim() === '' ? undefined : result.data.description,
      },
      { onSuccess: () => setForm(emptyForm) },
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2 className="section-heading">New permission</h2>

      <div className="field-row">
        <div className="field">
          <label className="field-label" htmlFor={nameId}>
            Name
          </label>
          <input
            id={nameId}
            className="input input--mono"
            placeholder="e.g. roles:manage"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
        </div>
        <div className="field">
          <label className="field-label" htmlFor={descriptionId}>
            Description
          </label>
          <input
            id={descriptionId}
            className="input"
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
          />
        </div>
      </div>

      {error && (
        <p className="status-message status-message--error" role="alert">
          {error}
        </p>
      )}
      {createPermission.isError && (
        <p className="status-message status-message--error" role="alert">
          {createPermission.error instanceof ApiError && createPermission.error.status === 409
            ? 'A permission with that name already exists.'
            : 'Failed to create permission. Please try again.'}
        </p>
      )}
      <div>
        <button type="submit" className="btn btn--primary" disabled={createPermission.isPending}>
          {createPermission.isPending ? 'Creating…' : 'Create permission'}
        </button>
      </div>
    </form>
  )
}
