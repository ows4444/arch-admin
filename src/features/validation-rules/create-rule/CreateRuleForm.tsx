import { useId, useState, type FormEvent } from 'react'
import { VALIDATION_RULE_OPERATORS, type ValidationRuleOperator } from '../../../entities/validation-rule'
import { createRuleSchema, type CreateRuleFormValues } from './create-rule-schema'
import { useCreateRule } from './use-create-rule'

const emptyForm: CreateRuleFormValues = {
  targetType: '',
  field: '',
  operator: 'equals',
  valueJson: '',
  compareField: '',
  message: '',
  enabled: true,
}

export function CreateRuleForm({ targetType }: { targetType: string }) {
  const createRule = useCreateRule(targetType)
  const [form, setForm] = useState<CreateRuleFormValues>({ ...emptyForm, targetType })
  const [error, setError] = useState<string | null>(null)
  const fieldId = useId()
  const operatorId = useId()
  const valueId = useId()
  const compareFieldId = useId()
  const messageId = useId()

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const result = createRuleSchema.safeParse(form)
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Invalid input')
      return
    }
    setError(null)
    createRule.mutate(
      {
        targetType: result.data.targetType,
        field: result.data.field,
        operator: result.data.operator,
        value: result.data.valueJson.trim() === '' ? undefined : JSON.parse(result.data.valueJson),
        compareField: result.data.compareField.trim() === '' ? undefined : result.data.compareField,
        message: result.data.message.trim() === '' ? undefined : result.data.message,
        enabled: result.data.enabled,
      },
      { onSuccess: () => setForm({ ...emptyForm, targetType }) },
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2 className="section-heading">
        Add rule for <code className="token">{targetType}</code>
      </h2>

      <div className="field-row">
        <div className="field">
          <label className="field-label" htmlFor={fieldId}>
            Field
          </label>
          <input
            id={fieldId}
            className="input input--mono"
            value={form.field}
            onChange={(event) => setForm({ ...form, field: event.target.value })}
          />
        </div>
        <div className="field">
          <label className="field-label" htmlFor={operatorId}>
            Operator
          </label>
          <select
            id={operatorId}
            className="select"
            value={form.operator}
            onChange={(event) =>
              setForm({ ...form, operator: event.target.value as ValidationRuleOperator })
            }
          >
            {VALIDATION_RULE_OPERATORS.map((operator) => (
              <option key={operator} value={operator}>
                {operator}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label className="field-label" htmlFor={valueId}>
            Value (JSON)
          </label>
          <input
            id={valueId}
            className="input input--mono"
            value={form.valueJson}
            placeholder='e.g. "root" or ["a","b"]'
            onChange={(event) => setForm({ ...form, valueJson: event.target.value })}
          />
        </div>
        <div className="field">
          <label className="field-label" htmlFor={compareFieldId}>
            Compare field (alternative to value)
          </label>
          <input
            id={compareFieldId}
            className="input input--mono"
            value={form.compareField}
            onChange={(event) => setForm({ ...form, compareField: event.target.value })}
          />
        </div>
      </div>

      <div className="field">
        <label className="field-label" htmlFor={messageId}>
          Message
        </label>
        <input
          id={messageId}
          className="input"
          value={form.message}
          onChange={(event) => setForm({ ...form, message: event.target.value })}
        />
      </div>

      <label className="checkbox-field">
        <input
          type="checkbox"
          checked={form.enabled}
          onChange={(event) => setForm({ ...form, enabled: event.target.checked })}
        />
        Enabled
      </label>

      {error && (
        <p className="status-message status-message--error" role="alert">
          {error}
        </p>
      )}
      {createRule.isError && (
        <p className="status-message status-message--error" role="alert">
          Failed to create rule. Please try again.
        </p>
      )}
      <div>
        <button type="submit" className="btn btn--primary" disabled={createRule.isPending}>
          {createRule.isPending ? 'Adding…' : 'Add rule'}
        </button>
      </div>
    </form>
  )
}
