import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authFetch } from '../../../entities/session'
import {
  validationRulesQueryKey,
  type CreateValidationRuleInput,
  type ValidationRule,
} from '../../../entities/validation-rule'

export function useCreateRule(targetType: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateValidationRuleInput) =>
      authFetch<ValidationRule>('/validation-rules', { method: 'POST', body: input }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: validationRulesQueryKey(targetType) })
    },
  })
}
