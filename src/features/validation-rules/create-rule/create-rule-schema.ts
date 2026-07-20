import { z } from 'zod'
import { VALIDATION_RULE_OPERATORS } from '../../../entities/validation-rule'

// `value` and `compareField` are entered as raw text: value is parsed as
// JSON (its shape depends on the operator — e.g. an array for in/not_in),
// compareField is a plain field name. Exactly one of them is required,
// mirroring the API contract.
export const createRuleSchema = z
  .object({
    targetType: z.string().min(1, 'Target type is required'),
    field: z.string().min(1, 'Field is required'),
    operator: z.enum(VALIDATION_RULE_OPERATORS),
    valueJson: z.string(),
    compareField: z.string(),
    message: z.string(),
    enabled: z.boolean(),
  })
  .refine((data) => data.valueJson.trim() !== '' || data.compareField.trim() !== '', {
    message: 'Provide either a value or a compare field',
    path: ['valueJson'],
  })
  .refine(
    (data) => {
      if (data.valueJson.trim() === '') return true
      try {
        JSON.parse(data.valueJson)
        return true
      } catch {
        return false
      }
    },
    { message: 'Value must be valid JSON (e.g. "root", 5, ["a","b"])', path: ['valueJson'] },
  )

export type CreateRuleFormValues = z.infer<typeof createRuleSchema>
