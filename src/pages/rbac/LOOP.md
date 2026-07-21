# Loop 001

**Slice:** pages/rbac
**Date:** 2026-07-21

## Goal

First Improvement Loop pass over `pages/rbac` (no prior LOOP.md/ARCH.md; boundaries set by `entities/rbac/ARCH.md` Design 001, which this page implements against).

## Files Reviewed

- `pages/rbac/RbacPage.tsx`
- `pages/rbac/RoleCard.tsx`
- `pages/rbac/index.ts`

## Problems Found

**Critical**
- None

**High**
- None

**Medium**
- None

**Low**
- The `roles.isPending` loading indicator (`<p className="status-message status-message--muted">Loading…</p>`) had no accessible live-region role, so a screen reader wouldn't announce the loading→loaded/error transition (`.ci.loop` §11: "Screen-reader announcements for async loading/error/success states"). The sibling error state already used `role="alert"`; the loading state had no equivalent.

## Changes Made

- Added `role="status"` to the loading indicator in `RbacPage.tsx` (an implicit `aria-live="polite"` region, appropriate for a non-urgent loading notice — `role="alert"` stays reserved for the error states, which are more urgent).

## Why

Brings the loading state in line with the error state's existing accessible-announcement treatment, and with the same fix applied to `pages/validation-rules/ValidationRulesPage.tsx` and `app/routes/RequireAuth.tsx` in this same loop pass — a recurring pattern across sibling slices, fixed consistently rather than in just one place.

## Tests

No automated tests exist yet (known gap). Verified via build/lint; the change is additive (one attribute) and doesn't alter markup structure or component logic.

## Build

PASS

## Lint

PASS

## Remaining TODO

- Live-backend end-to-end verification (carried over from `entities/rbac/LOOP.md`) — still blocked on backend/test-account availability.

## Next Loop

- No other known follow-up.

---

# Loop 002

**Slice:** pages/rbac
**Date:** 2026-07-22

## Goal

Close out the live-backend verification blocker, now that a privileged test account exists (see `entities/rbac/LOOP.md` Loop 004).

## Files Reviewed

- `pages/rbac/RbacPage.tsx`, `RoleCard.tsx` (no code change — verification only)

## Problems Found

**Critical/High/Medium/Low**
- None.

## Changes Made

- None.

## Why

N/A — no change made.

## Tests

Manually verified end-to-end against a live backend: `RbacPage` correctly renders the roles list once `GET /auth/roles` succeeds (previously only its `403` error state had been exercised), and `RoleCard`'s permission checklist correctly reflects grant/revoke mutations against real data, including a permission created live during this same verification pass.

## Build

PASS (no change)

## Lint

PASS (no change)

## Remaining TODO

- None. This was the last open item for this slice.

## Next Loop

- No known follow-up.
