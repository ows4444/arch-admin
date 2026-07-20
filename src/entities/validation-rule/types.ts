export const VALIDATION_RULE_OPERATORS = [
  'equals',
  'not_equals',
  'greater_than',
  'greater_than_or_equal',
  'less_than',
  'less_than_or_equal',
  'in',
  'not_in',
  'contains',
  'not_contains',
] as const

export type ValidationRuleOperator = (typeof VALIDATION_RULE_OPERATORS)[number]

export interface ValidationRule {
  id: number
  targetType: string
  field: string
  operator: ValidationRuleOperator
  value: unknown
  compareField?: string
  message?: string
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateValidationRuleInput {
  targetType: string
  field: string
  operator: ValidationRuleOperator
  value?: unknown
  compareField?: string
  message?: string
  enabled?: boolean
}

export interface UpdateValidationRuleInput {
  field?: string
  operator?: ValidationRuleOperator
  value?: unknown
  compareField?: string
  message?: string
  enabled?: boolean
}
