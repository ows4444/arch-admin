import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '../../shared/api'

// Client errors (4xx) won't resolve by retrying — a permission denial or a
// bad request stays denied/bad on attempt two. Retry once only for errors
// that might actually be transient (network blips, 5xx).
function shouldRetry(failureCount: number, error: unknown) {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
    return false
  }
  return failureCount < 1
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: shouldRetry,
    },
  },
})
