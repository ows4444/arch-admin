// Empty by default so requests are same-origin and go through the Vite dev
// proxy (see vite.config.ts). Production deployments must set VITE_API_URL
// to the API's origin, which then requires that origin to be CORS-allowed
// on the backend.
const API_BASE_URL = import.meta.env.VITE_API_URL ?? ''

export class ApiError extends Error {
  status: number
  body?: unknown

  constructor(status: number, message: string, body?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export type HttpRequestOptions = Omit<RequestInit, 'body'> & { body?: unknown }

export async function http<T>(path: string, options: HttpRequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => undefined)
    const message =
      (errorBody && typeof errorBody === 'object' && 'message' in errorBody
        ? String((errorBody as { message?: unknown }).message)
        : undefined) ?? response.statusText
    throw new ApiError(response.status, message, errorBody)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
