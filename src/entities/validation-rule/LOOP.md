# Loop 001

**Slice:** validation-rule / validation-rules
**Date:** 2026-07-21

## Goal

Implement the validation-rules CRUD screen per `ARCH.md` Design 001.

## Files Reviewed

- `src/entities/session/*` (as the dependency this slice builds on)
- `src/app/routes/router.tsx`, `src/vite.config.ts` (route/proxy wiring)

## Problems Found

**Critical**

**High**
- Dev-server proxy prefix (`/validation-rules` proxied directly to the backend) collided with the frontend page route of the same path, breaking full-page loads/reloads/bookmarks of `/validation-rules`. Found via live browser testing, not typecheck or unit tests.

**Medium**
- None beyond the scope cuts documented in `ARCH.md` (structured value input, full edit form) — deliberate, not defects.

**Low**

## Changes Made

- Added `entities/validation-rule` (types, `useValidationRules`), `features/validation-rules/{create-rule,toggle-rule,delete-rule}`, `pages/validation-rules`.
- Wired `/validation-rules` route into `app/routes/router.tsx` and added nav links in `widgets/app-shell/AppShell.tsx`.
- Fixed the proxy collision: `vite.config.ts` now proxies under `/api` with a path rewrite; `shared/api/http.ts` default base URL changed to `/api`. Documented as an amendment in `entities/session/ARCH.md`.

## Why

Backend has no CORS support, so the dev proxy is required; the `/api` prefix change removes the possibility of a route/proxy path collision by construction rather than by coincidence, which matters once more page routes get added.

## Tests

No automated tests yet (none exist in the repo). Verified manually against the live backend: unauthenticated calls correctly 401, authenticated calls correctly attach the bearer token and reach `/api/validation-rules`, and a 403 (insufficient RBAC permission on the available test account) renders "Failed to load validation rules." rather than hanging. Could not verify the 200-success path for create/toggle/delete — no privileged test account was available (see `ARCH.md` Open Questions).

## Build

PASS

## Lint

PASS

## Remaining TODO

- Re-verify create/toggle/delete against a 200 response once a privileged test account exists.
- Consider URL-based `targetType` state if deep-linking becomes a requirement.

## Next Loop

- RBAC roles/permissions screen (`auth-rbac` endpoints) — natural next resource screen, same pattern.
