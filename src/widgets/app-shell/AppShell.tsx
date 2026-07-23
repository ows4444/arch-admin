import { NavLink, Outlet } from 'react-router-dom'
import { LogoutButton } from '../../features/auth/logout'
import { useCurrentUser } from '../../entities/session'
import { DashboardIcon, Logomark, RolesIcon, ValidationRulesIcon } from '../../shared/ui'

export function AppShell() {
  const { data: user } = useCurrentUser()

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <aside className="sidebar">
        <div className="sidebar-brand brand">
          <Logomark />
          <span className="brand-word">Arch</span>
          <span className="brand-tag">Admin</span>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" end>
            <DashboardIcon />
            Dashboard
          </NavLink>
          <NavLink to="/validation-rules">
            <ValidationRulesIcon />
            Validation rules
          </NavLink>
          <NavLink to="/rbac">
            <RolesIcon />
            Roles &amp; permissions
          </NavLink>
        </nav>
        <div className="sidebar-account">
          {user && <span className="sidebar-account-email">{user.email}</span>}
          <LogoutButton />
        </div>
      </aside>
      <main id="main-content" className="app-main" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  )
}
