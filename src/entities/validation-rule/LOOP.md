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

---

# Loop 002

**Slice:** entities/validation-rule
**Date:** 2026-07-21

## Goal

Second Improvement Loop pass over this slice in isolation, checking for drift against `ARCH.md` and the standard Section 2 checklist.

## Files Reviewed

- `entities/validation-rule/types.ts`
- `entities/validation-rule/use-validation-rules.ts`
- `entities/validation-rule/index.ts`
- `entities/validation-rule/ARCH.md` (cross-checked — no drift)

## Problems Found

**Critical**
- None

**High**
- None

**Medium**
- None

**Low**
- None — `validationRulesQueryKey(targetType)` stays parameterized and consistent with its documented design, `useValidationRules` correctly gates on `targetType.length > 0`, no duplicated logic against `entities/rbac`'s equivalent (`useRoles`) beyond the intentionally identical TanStack Query shape.

## Changes Made

- None. Reviewed and confirmed the slice remains correct, minimal, and consistent with sibling `entities/rbac` — no change clears the bar for `.ci.loop` §19 ("never refactor code that already satisfies readability, maintainability, correctness").

## Why

N/A — no change made.

## Tests

No automated tests exist yet (known gap, unchanged from Loop 001).

## Build

PASS

## Lint

PASS

## Remaining TODO

- Same as Loop 001: re-verify create/toggle/delete against a 200 response once a privileged test account exists; still blocked, not resolvable from this pass.

## Next Loop

- No known follow-up specific to this slice's code.
