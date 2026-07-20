import { NavLink, Outlet } from 'react-router-dom'
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
        <nav>
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          <NavLink to="/validation-rules">Validation rules</NavLink>
        </nav>
        {user && <span>{user.email}</span>}
        <LogoutButton />
      </header>
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  )
}
