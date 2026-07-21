import { Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '../../widgets/app-shell'
import { LoginPage } from '../../pages/login'
import { RequireAuth } from './RequireAuth'
import { DashboardPage, ValidationRulesPage, RbacPage } from './lazy-pages'
import { RouteFallback } from './RouteFallback'

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
      {
        index: true,
        element: (
          <Suspense fallback={<RouteFallback />}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: 'validation-rules',
        element: (
          <Suspense fallback={<RouteFallback />}>
            <ValidationRulesPage />
          </Suspense>
        ),
      },
      {
        path: 'rbac',
        element: (
          <Suspense fallback={<RouteFallback />}>
            <RbacPage />
          </Suspense>
        ),
      },
    ],
  },
])
