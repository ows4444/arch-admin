import { create } from 'zustand'
import type { AuthSession } from './types'

// Refresh token is persisted to sessionStorage so a page reload doesn't force
// a fresh login; it's cleared when the tab closes. Access token is kept
// in-memory only. See ARCH.md "Design 001" for the full tradeoff writeup —
// this backend issues bearer tokens in the response body (not httpOnly
// cookies), so some client-accessible storage is unavoidable.
const REFRESH_TOKEN_STORAGE_KEY = 'arch-admin.refreshToken'

interface SessionState {
  accessToken: string | null
  refreshToken: string | null
  setSession: (session: Pick<AuthSession, 'accessToken' | 'refreshToken'>) => void
  clearSession: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
  accessToken: null,
  refreshToken: sessionStorage.getItem(REFRESH_TOKEN_STORAGE_KEY),
  setSession: ({ accessToken, refreshToken }) => {
    sessionStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken)
    set({ accessToken, refreshToken })
  },
  clearSession: () => {
    sessionStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
    set({ accessToken: null, refreshToken: null })
  },
}))
