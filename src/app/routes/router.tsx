import { createBrowserRouter } from 'react-router-dom'
import { LoginPage } from '../../pages/login'
import { DashboardPage } from '../../pages/dashboard'
import { ValidationRulesPage } from '../../pages/validation-rules'
import { RbacPage } from '../../pages/rbac'
import { AppShell } from '../../widgets/app-shell'
import { RequireAuth } from './RequireAuth'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'validation-rules', element: <ValidationRulesPage /> },
      { path: 'rbac', element: <RbacPage /> },
    ],
  },
])
