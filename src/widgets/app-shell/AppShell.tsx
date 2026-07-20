import { Outlet } from 'react-router-dom'
import { LogoutButton } from '../../features/auth/logout'
import { useCurrentUser } from '../../entities/session'

export function AppShell() {
  const { data: user } = useCurrentUser()

  return (
    <div>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <header>
        <span>Arch Admin</span>
        {user && <span>{user.email}</span>}
        <LogoutButton />
      </header>
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  )
}
