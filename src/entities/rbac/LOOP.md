# Loop 001

**Slice:** entities/rbac (+ features/rbac/*, pages/rbac)
**Date:** 2026-07-21

## Goal

Implement the RBAC (roles & permissions) screen per `ARCH.md` Design 001: create roles, create permissions, grant/revoke permissions on a role. Follows the pattern established by `entities/validation-rule`.

## Files Reviewed

- `entities/session/*` (auth-fetch, session-store) — reused as-is, no changes
- `entities/validation-rule/*` and `features/validation-rules/*` — used as the structural/convention reference (query key shape, invalidate-on-mutation, local-useState-plus-zod-safeParse form pattern)
- `shared/api/http.ts` — reused `ApiError`/`http` unchanged
- `widgets/app-shell/AppShell.tsx` — added nav link
- `app/routes/router.tsx` — added `/rbac` route
- `index.css` — reviewed existing tokens/classes before adding new ones

## Problems Found

**Critical**
- None (greenfield slice, no existing code to have defects)

**High**
- Backend has no `GET /auth/permissions` — resolved via a documented Zustand accumulator (`known-permissions-store.ts`), not silently worked around.
- Backend has no user-list/search endpoint at all — user↔role assignment is out of scope for this loop (confirmed with the user); tracked in `ARCH.md` Open Questions.

**Medium**
- None

**Low**
- None

## Changes Made

- Added `entities/rbac` (`types.ts`, `use-roles.ts`, `known-permissions-store.ts`, barrel, `ARCH.md`).
- Added `features/rbac/{create-permission,create-role,grant-permission,revoke-permission}`.
- Added `pages/rbac` (`RbacPage.tsx`, `RoleCard.tsx`, barrel).
- Wired `/rbac` into `app/routes/router.tsx` and added a nav link in `widgets/app-shell/AppShell.tsx`.
- Added `.rbac-form-grid`, `.permission-checklist`, `.role-list` to `index.css`, reusing existing `.card`/`.token`/`.checkbox-field`/`.status-message`/`.btn` primitives rather than introducing new ones.

## Why

Same rationale as `entities/validation-rule`: establish the second resource-CRUD screen following the pattern from the first, so a third (e.g. a future audit-log or user-management screen) has two consistent examples to follow rather than one.

## Tests

No automated tests exist in this repo yet (matches the state of every prior slice). Manually verified:
- `npm run build` (tsc -b + vite build) passes.
- `npm run lint` (oxlint) passes clean.
- Navigating to `/rbac` unauthenticated correctly redirects to `/login` via `RequireAuth` (confirmed in-browser) — proves the route/guard wiring is correct and the new code doesn't crash on load.

**Not verified:** the actual login → grant/revoke flow against a live backend. Docker (`make compose-up`) wasn't running in this environment and couldn't be started, so the Arch API backend was unavailable. This mirrors the same blocker recorded in `entities/validation-rule/LOOP.md` and `widgets/app-shell/LOOP.md` (no privileged test account / no way to exercise the real 200-path). Re-verify end-to-end once the backend and a `roles:manage`-permitted test account are available.

## Build

PASS

## Lint

PASS

## Remaining TODO

- End-to-end verify against a live backend: create a permission, create a role, grant/revoke, confirm `RoleCard` checkbox states track the server accurately.
- Accessibility spot-check of the new screen (focus order across two forms + N role cards, screen-reader behavior of the permission checklist) — not yet done, unlike the considered pass `widgets/app-shell/LOOP.md` did for the rest of the app.
- Revisit the known-permissions accumulator if the backend ever adds `GET /auth/permissions`.

## Next Loop

- Backend: request a `GET /auth/permissions` endpoint and a minimal user-list/search endpoint — both are blocking a fuller RBAC UI (permission browsing without going through roles; user↔role assignment at all).
- Once available, add `features/rbac/assign-user-role`/`revoke-user-role` per `entities/rbac/ARCH.md` Open Questions.
- Accessibility and live-backend verification (see Remaining TODO) before this screen is considered done per `.ci.loop` Definition of Done.

---

# Loop 002

**Slice:** entities/rbac
**Date:** 2026-07-21

## Goal

Second Improvement Loop pass, reviewing this slice on its own (independent of the `features/rbac/*`/`pages/rbac` build recorded in Loop 001) for drift, duplication, and the standard Section 2 checklist.

## Files Reviewed

- `entities/rbac/types.ts`
- `entities/rbac/use-roles.ts`
- `entities/rbac/known-permissions-store.ts`
- `entities/rbac/index.ts`
- `entities/rbac/ARCH.md` (cross-checked — implementation still matches the documented decisions, no drift)

## Problems Found

**Critical**
- None

**High**
- None

**Medium**
- None

**Low**
- `useKnownPermissions()` recomputes `Object.values(byName).sort(...)` on every call, returning a new array reference each render even when `byName` hasn't changed — considered under §7 ("selector usage to avoid over-rendering"). Not fixed: the permission catalog is small (dozens of entries at most for an admin console), the recompute is O(n log n) on a tiny n, and memoizing it would add a `useMemo`/custom-equality dependency for no measurable benefit — exactly the "premature optimization" `.ci.loop` §5 warns against. Documented here as a deliberate no-op rather than an overlooked issue.

## Changes Made

- None. The slice matches its `ARCH.md`, has no duplicated logic, and the one candidate issue found (selector re-creation) doesn't clear the bar for a justified change per §19 ("never refactor code that already satisfies... correctness").

## Why

N/A — no change made.

## Tests

No automated tests exist yet (known gap, unchanged from Loop 001).

## Build

PASS

## Lint

PASS

## Remaining TODO

- Same as Loop 001: end-to-end verification against a live backend, accessibility spot-check — still blocked on backend/test-account availability, not something resolvable from this pass.

## Next Loop

- Revisit `useKnownPermissions` memoization only if a real render-cost problem is observed (profiler data), not preemptively.
