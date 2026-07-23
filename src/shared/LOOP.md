# Loop 001

**Slice:** shared (api/http, ui/Logomark)
**Date:** 2026-07-21

## Goal

First Improvement Loop pass over the shared kernel (`shared/api/http.ts`, `shared/api/index.ts`, `shared/ui/Logomark.tsx`, `shared/ui/index.ts`) — no prior LOOP.md existed for this slice.

## Files Reviewed

- `shared/api/http.ts`, `shared/api/index.ts`
- `shared/ui/Logomark.tsx`, `shared/ui/index.ts`

## Problems Found

**Critical**
- None

**High**
- None

**Medium**
- `http()` unconditionally set `Content-Type: application/json` on every request, including bodiless `GET`s. `application/json` is not a CORS-simple header value, so any request carrying it forces a preflight `OPTIONS` round-trip. The backend is documented (ARCH.md, `vite.config.ts`) as not implementing `OPTIONS` at all — currently masked by the same-origin dev proxy, but this would silently break every `GET` the moment this client talks directly to the API cross-origin (the exact scenario `VITE_API_URL` exists for).

**Low**
- None — `Logomark` and the barrel files are minimal, correct, and appropriately zero-dependency (no upstream imports, consistent with `shared` owning no business logic).

## Changes Made

- `shared/api/http.ts`: `Content-Type: application/json` is now only attached when `body !== undefined`, so bodiless requests (all `GET`s) stay preflight-free.

## Why

Removes a latent cross-origin correctness bug before it's exercised (currently invisible because of the dev proxy and because `VITE_API_URL` cross-origin deployment hasn't happened yet). Zero behavior change for requests that do send a body.

## Tests

No automated tests exist yet (known gap, no test runner configured in this repo). Verified by build + lint only; the change is header-shape-only and doesn't alter any request that carries a body (still `application/json`).

## Build

PASS

## Lint

PASS

## Remaining TODO

- No test runner configured yet — this and all future `shared/api` changes are verified by build/lint/manual review only.
- Revisit once a production `VITE_API_URL` deployment target exists — confirm the backend allow-lists the deployed origin and add an integration check for the preflight-free `GET` path.

## Next Loop

- No known follow-up specific to this slice; re-review if `http()` grows additional cross-cutting concerns (e.g. request cancellation, timeout) that sibling entities start reimplementing individually.

---

# Loop 002

**Slice:** shared (ui/icons, ui/EmptyState)
**Date:** 2026-07-23

## Goal

Whole-app UI/design polish pass (user-requested, general quality/consistency review). Add the two new `shared/ui` primitives it required: a small icon set and a unified empty-state component. Justified as shared per `.ci.loop` §5 ("Shared UI kit only when justified") — icons are used in both `widgets/app-shell` and `pages/dashboard`; `EmptyState` replaces three separate hand-rolled empty states across `pages/rbac` and `pages/validation-rules`.

## Files Reviewed

- `shared/ui/Logomark.tsx` (style reference — hand-rolled inline SVG, no icon library dependency)
- Every existing "No X yet" plain-`<p>` empty state in the app (3 call sites, found via review of `RulesTable.tsx`, `RoleCard.tsx`, `RbacPage.tsx`)

## Problems Found

**Low**
- Three independent hand-rolled empty states with no shared treatment — the only repeated UI pattern in the app that didn't already have one (buttons, status messages, tokens all do).
- Sidebar nav and dashboard had no icons — see `widgets/app-shell/LOOP.md` Loop 003 and `pages/dashboard/LOOP.md` Loop 003 for the consuming-side changes.

## Changes Made

- New `shared/ui/icons.tsx`: `DashboardIcon`, `ValidationRulesIcon`, `RolesIcon` — small inline SVGs, `stroke="currentColor"`, same style as `Logomark.tsx`, no new dependency.
- New `shared/ui/EmptyState.tsx`: `{ icon, children }` — icon in a circular `.empty-state-icon` badge + message via the existing `.status-message--muted` class (reused, not duplicated).
- `shared/ui/index.ts`: exports both additions alongside `Logomark`.
- `index.css`: new `.empty-state`, `.empty-state-icon` classes — additive only.

## Why

Three real call sites already existed for `EmptyState`, and two for the icons — both cross the "used in 2+ places" bar this codebase already applies (see `entities/rbac/ARCH.md`'s reasoning for `known-permissions-store.ts` as a comparable "justified shared abstraction" precedent).

## Tests

`npm run build` and `npm run lint` pass. Live-verified indirectly through the consuming slices (`widgets/app-shell`, `pages/dashboard`, `pages/rbac`, `pages/validation-rules` — see their own LOOP.md entries for the actual rendered checks).

## Build

PASS

## Lint

PASS

## Remaining TODO

- None.

## Next Loop

- No known follow-up.
