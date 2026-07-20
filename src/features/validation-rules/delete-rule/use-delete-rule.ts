import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authFetch } from '../../../entities/session'
import { validationRulesQueryKey } from '../../../entities/validation-rule'

export function useDeleteRule(targetType: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => authFetch<void>(`/validation-rules/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: validationRulesQueryKey(targetType) })
    },
  })
}
