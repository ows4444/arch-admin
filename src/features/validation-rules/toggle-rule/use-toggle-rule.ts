import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authFetch } from '../../../entities/session'
import { validationRulesQueryKey, type ValidationRule } from '../../../entities/validation-rule'

export function useToggleRule(targetType: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
      authFetch<ValidationRule>(`/validation-rules/${id}`, {
        method: 'PATCH',
        body: { enabled },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: validationRulesQueryKey(targetType) })
    },
  })
}
