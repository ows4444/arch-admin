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
      <h2>Validation rules</h2>
      <div>
        <label htmlFor={targetTypeId}>Target type</label>
        <input
          id={targetTypeId}
          value={targetType}
          placeholder="e.g. CreateRoleDto"
          onChange={(event) => setTargetType(event.target.value)}
        />
      </div>

      {targetType && (
        <>
          {rules.isPending && <p>Loading…</p>}
          {rules.isError && <p role="alert">Failed to load validation rules.</p>}
          {rules.data && <RulesTable rules={rules.data} targetType={targetType} />}
          <CreateRuleForm targetType={targetType} />
        </>
      )}
    </section>
  )
}
