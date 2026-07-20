export interface AuthSession {
  userId: string
  accessToken: string
  accessTokenExpiresAt: string
  refreshToken: string
  refreshTokenExpiresAt: string
}

export interface AuthenticatedUser {
  userId: string
  email: string
  roles: string[]
  permissions: string[]
  jti: string
  tokenExpiresAt: string
}
