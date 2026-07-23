import { useState } from 'react'
import { useToggleRule } from '../../features/validation-rules/toggle-rule'
import { useDeleteRule } from '../../features/validation-rules/delete-rule'
import { EmptyState, ValidationRulesIcon } from '../../shared/ui'
import type { ValidationRule } from '../../entities/validation-rule'

export function RulesTable({ rules, targetType }: { rules: ValidationRule[]; targetType: string }) {
  const toggleRule = useToggleRule(targetType)
  const deleteRule = useDeleteRule(targetType)
  // Inline two-step confirm rather than a modal: this is the only
  // destructive-delete UI in the app today, so a shared dialog primitive
  // would be premature (.ci.loop §5). Only one row confirms at a time.
  const [confirmingId, setConfirmingId] = useState<number | null>(null)

  if (rules.length === 0) {
    return (
      <EmptyState icon={<ValidationRulesIcon size={20} />}>
        No rules yet for <code className="token">{targetType}</code>. Add one below.
      </EmptyState>
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
                <span className="switch" data-pending={toggleRule.variables?.id === rule.id || undefined}>
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    aria-label={rule.enabled ? `Disable rule for ${rule.field}` : `Enable rule for ${rule.field}`}
                    onChange={(event) => {
                      // Guarded here rather than via `disabled`: disabling the
                      // switch the user just toggled force-blurs it, and focus
                      // is never restored once the mutation settles.
                      if (toggleRule.isPending) return
                      toggleRule.mutate({ id: rule.id, enabled: event.target.checked })
                    }}
                  />
                  <span className="switch-track" />
                  <span className="switch-thumb" />
                </span>
                {confirmingId === rule.id ? (
                  <>
                    <button
                      type="button"
                      className="btn btn--danger btn--sm"
                      disabled={deleteRule.isPending}
                      aria-label={`Confirm delete rule for ${rule.field}`}
                      onClick={() => {
                        setConfirmingId(null)
                        deleteRule.mutate(rule.id)
                      }}
                    >
                      {deleteRule.isPending ? 'Deleting…' : 'Confirm delete'}
                    </button>
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      disabled={deleteRule.isPending}
                      aria-label={`Cancel deleting rule for ${rule.field}`}
                      onClick={() => setConfirmingId(null)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="btn btn--danger btn--sm"
                    disabled={deleteRule.isPending}
                    aria-label={`Delete rule for ${rule.field}`}
                    onClick={() => setConfirmingId(rule.id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
