# Loop 001

**Slice:** features/rbac/grant-permission
**Date:** 2026-07-21

## Goal

First Improvement Loop pass over `features/rbac/grant-permission` (no prior LOOP.md/ARCH.md; boundaries set by `entities/rbac/ARCH.md` Design 001).

## Files Reviewed

- `features/rbac/grant-permission/use-grant-permission.ts`
- `features/rbac/grant-permission/index.ts`

## Problems Found

**Critical**
- None

**High**
- None

**Medium**
- None

**Low**
- None — thin, single-purpose mutation hook; correctly URI-encodes `roleName`/`permissionName` path segments, invalidates `rolesQueryKey` on success. Mirrors `revoke-permission` structurally as intended (same endpoint shape, opposite HTTP method) — this is deliberate symmetry per `entities/rbac/ARCH.md`, not duplicated logic to consolidate (the two hooks differ only in HTTP method and are each other's natural pair, not incidental copy-paste).

## Changes Made

- None.

## Why

N/A — no change made.

## Tests

No automated tests exist yet (known gap).

## Build

PASS

## Lint

PASS

## Remaining TODO

- None specific to this slice.

## Next Loop

- No known follow-up.
