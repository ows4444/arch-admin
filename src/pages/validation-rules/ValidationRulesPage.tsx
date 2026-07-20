import { useId, useState } from 'react'
import { useValidationRules } from '../../entities/validation-rule'
import { CreateRuleForm } from '../../features/validation-rules/create-rule'
import { RulesTable } from './RulesTable'

export function ValidationRulesPage() {
  const [targetType, setTargetType] = useState('')
  const targetTypeId = useId()
  const rules = useValidationRules(targetType)

  return (
    <section>
      <div className="page-header">
        <h1>Validation rules</h1>
        <p>Field-level rules enforced against a target type before it's accepted.</p>
      </div>

      <div className="field field--narrow">
        <label className="field-label" htmlFor={targetTypeId}>
          Target type
        </label>
        <input
          id={targetTypeId}
          className="input input--mono"
          value={targetType}
          placeholder="e.g. CreateRoleDto"
          onChange={(event) => setTargetType(event.target.value)}
        />
      </div>

      {targetType && (
        <>
          <div className="section">
            {rules.isPending && <p className="status-message status-message--muted">Loading…</p>}
            {rules.isError && (
              <div className="status-message status-message--error">
                <span>Couldn't load rules for {targetType}.</span>
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => rules.refetch()}>
                  Retry
                </button>
              </div>
            )}
            {rules.data && <RulesTable rules={rules.data} targetType={targetType} />}
          </div>

          <div className="section card">
            <CreateRuleForm targetType={targetType} />
          </div>
        </>
      )}
    </section>
  )
}
