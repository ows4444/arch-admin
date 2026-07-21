import { lazy } from 'react'

// Each top-level route is its own chunk, loaded on navigation rather than
// bundled into the app's entry chunk. `pages/login` stays eager (imported
// directly in `router.tsx`) since it's the unauthenticated entry point most
// first visits hit — splitting it out would trade one waterfall (entry chunk
// -> route chunk) for another with no benefit. See `.ci.loop` §6/§10.
export const DashboardPage = lazy(() =>
  import('../../pages/dashboard').then((module) => ({ default: module.DashboardPage })),
)
export const ValidationRulesPage = lazy(() =>
  import('../../pages/validation-rules').then((module) => ({
    default: module.ValidationRulesPage,
  })),
)
export const RbacPage = lazy(() =>
  import('../../pages/rbac').then((module) => ({ default: module.RbacPage })),
)
