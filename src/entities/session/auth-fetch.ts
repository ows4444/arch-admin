import { http, ApiError, type HttpRequestOptions } from '../../shared/api'
import { useSessionStore } from './session-store'
import type { AuthSession } from './types'

let refreshPromise: Promise<AuthSession> | null = null

function refreshSession(): Promise<AuthSession> {
  const { refreshToken } = useSessionStore.getState()
  if (!refreshToken) {
    return Promise.reject(new ApiError(401, 'No refresh token available'))
  }

  refreshPromise ??= http<AuthSession>('/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
  }).finally(() => {
    refreshPromise = null
  })

  return refreshPromise
}

function withAuthHeader(options: HttpRequestOptions, token: string | null): HttpRequestOptions {
  return {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }
}

/** Refreshes the session and retries `path` with the new access token, clearing the session on failure. */
async function refreshAndRetry<T>(path: string, options: HttpRequestOptions): Promise<T> {
  try {
    const session = await refreshSession()
    useSessionStore.getState().setSession(session)
    return await http<T>(path, withAuthHeader(options, session.accessToken))
  } catch (refreshError) {
    useSessionStore.getState().clearSession()
    throw refreshError
  }
}

/** Attaches the current access token and retries once via refresh on a 401. */
export async function authFetch<T>(path: string, options: HttpRequestOptions = {}): Promise<T> {
  const { accessToken, refreshToken } = useSessionStore.getState()

  // The access token only ever lives in memory, so a full page reload always
  // starts with accessToken === null even though the persisted refreshToken
  // is still valid. Refresh proactively in that case instead of firing a
  // request that's guaranteed to 401.
  if (!accessToken && refreshToken) {
    return refreshAndRetry<T>(path, options)
  }

  try {
    return await http<T>(path, withAuthHeader(options, accessToken))
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) {
      throw error
    }
    if (!accessToken) {
      useSessionStore.getState().clearSession()
      throw error
    }

    return refreshAndRetry<T>(path, options)
  }
}
