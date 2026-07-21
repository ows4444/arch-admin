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
