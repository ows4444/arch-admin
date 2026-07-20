import { useId, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../../../shared/api'
import { loginSchema } from './login-schema'
import { useLogin } from './use-login'

export function LoginForm() {
  const navigate = useNavigate()
  const login = useLogin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  const emailId = useId()
  const passwordId = useId()

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const result = loginSchema.safeParse({ email, password })
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors
      setFieldErrors({ email: errors.email?.[0], password: errors.password?.[0] })
      return
    }
    setFieldErrors({})
    login.mutate(result.data, {
      onSuccess: () => navigate('/', { replace: true }),
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div>
        <label htmlFor={emailId}>Email</label>
        <input
          id={emailId}
          type="email"
          value={email}
          autoComplete="email"
          onChange={(event) => setEmail(event.target.value)}
        />
        {fieldErrors.email && <p role="alert">{fieldErrors.email}</p>}
      </div>
      <div>
        <label htmlFor={passwordId}>Password</label>
        <input
          id={passwordId}
          type="password"
          value={password}
          autoComplete="current-password"
          onChange={(event) => setPassword(event.target.value)}
        />
        {fieldErrors.password && <p role="alert">{fieldErrors.password}</p>}
      </div>
      {login.isError && (
        <p role="alert">
          {login.error instanceof ApiError && login.error.status === 401
            ? 'Incorrect email or password.'
            : 'Something went wrong. Please try again.'}
        </p>
      )}
      <button type="submit" disabled={login.isPending}>
        {login.isPending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
