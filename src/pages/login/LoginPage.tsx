import { LoginForm } from '../../features/auth/login'
import { Logomark } from '../../shared/ui'

export function LoginPage() {
  return (
    <main className="auth-screen">
      <div className="auth-card">
        <div className="auth-card-header">
          <Logomark size={36} />
          <div>
            <h1>Sign in to Arch</h1>
            <p>Manage auth, roles, and validation rules.</p>
          </div>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
