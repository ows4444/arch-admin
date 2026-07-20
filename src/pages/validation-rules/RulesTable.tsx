import { useToggleRule } from '../../features/validation-rules/toggle-rule'
import { useDeleteRule } from '../../features/validation-rules/delete-rule'
import type { ValidationRule } from '../../entities/validation-rule'

export function RulesTable({ rules, targetType }: { rules: ValidationRule[]; targetType: string }) {
  const toggleRule = useToggleRule(targetType)
  const deleteRule = useDeleteRule(targetType)

  if (rules.length === 0) {
    return (
      <p className="status-message status-message--muted">
        No rules yet for <code className="token">{targetType}</code>. Add one below.
      </p>
    )
  }

  return (
    <table className="rules-table">
      <thead>
        <tr>
          <th scope="col">Rule</th>
          <th scope="col">Message</th>
          <th scope="col">
            <span className="visually-hidden">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {rules.map((rule) => (
          <tr key={rule.id}>
            <td>
              <div className="rule-expression">
                <code className="token">{rule.field}</code>
                <span className="op-pill">{rule.operator}</span>
                <code className="token">
                  {rule.compareField ?? JSON.stringify(rule.value)}
                </code>
              </div>
            </td>
            <td className="rule-message">{rule.message}</td>
            <td>
              <div className="rule-actions">
                <span className="switch">
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    disabled={toggleRule.isPending}
                    aria-label={rule.enabled ? `Disable rule for ${rule.field}` : `Enable rule for ${rule.field}`}
                    onChange={(event) =>
                      toggleRule.mutate({ id: rule.id, enabled: event.target.checked })
                    }
                  />
                  <span className="switch-track" />
                  <span className="switch-thumb" />
                </span>
                <button
                  type="button"
                  className="btn btn--danger btn--sm"
                  disabled={deleteRule.isPending}
                  onClick={() => deleteRule.mutate(rule.id)}
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
