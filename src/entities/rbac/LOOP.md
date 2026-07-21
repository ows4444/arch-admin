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

---

# Loop 003

**Slice:** entities/rbac
**Date:** 2026-07-22

## Goal

Fix a live crash found by manually exercising `/rbac` in-browser against a running backend (first time this slice was verified end-to-end, per the Remaining TODO in Loop 001/002).

## Files Reviewed

- `entities/rbac/known-permissions-store.ts`
- `entities/rbac/use-roles.ts`
- `pages/rbac/RbacPage.tsx`

## Problems Found

**Critical**
- `/rbac` crashed on load with "Maximum update depth exceeded". Root cause: `useKnownPermissions()`'s Zustand selector did `Object.values(state.byName).sort(...)` inline, allocating a new array reference on every call — including calls React's `useSyncExternalStore` makes purely to check for changes. A selector with no referential stability makes every check look like a change, producing an infinite synchronous re-render loop. This is the same code Loop 002 examined and declined to change, filed as a "Low / premature optimization" concern — that assessment was wrong: it's not a performance nit, it's a correctness bug that crashes the page. Corrected here.

**High**
- None

**Medium**
- None

**Low**
- None

## Changes Made

- `known-permissions-store.ts`: `useKnownPermissions()` now subscribes to the stable `state.byName` object directly and derives the sorted array via `useMemo(() => ..., [byName])`, instead of allocating inline inside the selector. Output is unchanged (same sorted `Permission[]`); only the reference stability changed.

## Why

Loop 002's rationale ("small n, negligible recompute cost, memoizing is premature optimization") addressed the wrong question — the bug isn't recompute cost, it's that `useSyncExternalStore` requires `getSnapshot` to return a stable reference when the underlying state hasn't changed, or React cannot terminate its change-detection loop. This only surfaced now because Loop 001/002 were never able to exercise the route against a live backend (Docker unavailable in that environment); this loop had a running backend and an authenticated session, which is what actually triggered the crash.

## Tests

No automated tests exist yet (known gap, unchanged). Manually verified in-browser:
- Signed in as `smoke-test@example.com`, navigated to `/rbac` — previously crashed immediately with the render-loop error; now renders correctly.
- `GET /auth/roles` returns `403` for this account (it lacks `roles:manage`-equivalent permission) — confirmed this is a legitimate backend authorization response, not a frontend bug. The "Couldn't load roles" error state renders correctly for this case.

**Still not verified:** the actual grant/revoke flow, since no available test account has permission to list roles. Same blocker as Loop 001/002, now one layer further in (auth works, listing roles is gated).

## Build

PASS

## Lint

PASS

## Remaining TODO

- End-to-end verify create/grant/revoke once a `roles:manage`-permitted test account is available.
- Accessibility spot-check, still outstanding from Loop 001.

## Next Loop

- If another slice's Zustand selector follows this same "derive inline in the selector" pattern, cross-check it for the same bug (§7's "selector usage" checklist should treat referential stability as a correctness property, not just a performance one, for any selector whose result feeds a render).

---

# Loop 004

**Slice:** entities/rbac
**Date:** 2026-07-22

## Goal

Close out the create/grant/revoke end-to-end verification blocker carried since Loop 001, now that a privileged test account exists.

## Files Reviewed

- `entities/rbac/use-roles.ts`, `known-permissions-store.ts` (no code change — verification only)

## Problems Found

**Critical/High/Medium**
- None.

**Low**
- While verifying, discovered `known-permissions-store.ts`'s `useKnownPermissions()` correctly accumulates a newly-created permission (`validation-rules:manage`, created live during this verification) into the checklist shown by `CreateRoleForm`/`RoleCard` without a page reload — confirms the accumulator design in `ARCH.md` works as documented, not just in theory. Noted as a positive finding, not a defect.

## Changes Made

- None.

## Why

N/A — no change made; this loop closes a verification gap, not a code gap.

## Tests

Manually verified end-to-end against a live backend, using `smoke-test@example.com` after it was granted the seeded `admin` role (see `ARCH.md`'s Amendment): created a permission (`validation-rules:manage`, `201`), granted it to the `admin` role (`201`), revoked it (`200`), re-granted it (`201`), and created a role (`201`) — all confirmed via response inspection, not just UI appearance. The test role was deleted directly via the dev DB afterward (no `DELETE /auth/roles/{name}` endpoint exists on the backend to do this through the API) to avoid leaving stray data.

## Build

PASS (no change)

## Lint

PASS (no change)

## Remaining TODO

- Accessibility spot-check, still outstanding from Loop 001 — unrelated to this loop's scope.

## Next Loop

- No known follow-up specific to the live-verification gap; only the pre-existing accessibility TODO remains.
