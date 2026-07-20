import { useToggleRule } from '../../features/validation-rules/toggle-rule'
import { useDeleteRule } from '../../features/validation-rules/delete-rule'
import type { ValidationRule } from '../../entities/validation-rule'

export function RulesTable({ rules, targetType }: { rules: ValidationRule[]; targetType: string }) {
  const toggleRule = useToggleRule(targetType)
  const deleteRule = useDeleteRule(targetType)

  if (rules.length === 0) {
    return <p>No validation rules for this target type yet.</p>
  }

  return (
    <table>
      <thead>
        <tr>
          <th scope="col">Field</th>
          <th scope="col">Operator</th>
          <th scope="col">Value / Compare field</th>
          <th scope="col">Message</th>
          <th scope="col">Enabled</th>
          <th scope="col">
            <span className="visually-hidden">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {rules.map((rule) => (
          <tr key={rule.id}>
            <td>{rule.field}</td>
            <td>{rule.operator}</td>
            <td>{rule.compareField ?? JSON.stringify(rule.value)}</td>
            <td>{rule.message}</td>
            <td>
              <label>
                <input
                  type="checkbox"
                  checked={rule.enabled}
                  disabled={toggleRule.isPending}
                  onChange={(event) =>
                    toggleRule.mutate({ id: rule.id, enabled: event.target.checked })
                  }
                />
                <span className="visually-hidden">Enabled</span>
              </label>
            </td>
            <td>
              <button
                type="button"
                disabled={deleteRule.isPending}
                onClick={() => deleteRule.mutate(rule.id)}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
