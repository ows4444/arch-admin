import { useQuery } from '@tanstack/react-query'
import { authFetch } from '../session'
import type { ValidationRule } from './types'

export const validationRulesQueryKey = (targetType: string) =>
  ['validation-rules', targetType] as const

export function useValidationRules(targetType: string) {
  return useQuery({
    queryKey: validationRulesQueryKey(targetType),
    queryFn: () =>
      authFetch<ValidationRule[]>(
        `/validation-rules?targetType=${encodeURIComponent(targetType)}`,
      ),
    enabled: targetType.length > 0,
  })
}
