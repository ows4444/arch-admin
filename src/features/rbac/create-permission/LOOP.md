# Loop 001

**Slice:** features/rbac/create-permission
**Date:** 2026-07-21

## Goal

First Improvement Loop pass over `features/rbac/create-permission` (no prior LOOP.md/ARCH.md; boundaries set by `entities/rbac/ARCH.md` Design 001).

## Files Reviewed

- `features/rbac/create-permission/create-permission-schema.ts`
- `features/rbac/create-permission/CreatePermissionForm.tsx`
- `features/rbac/create-permission/use-create-permission.ts`
- `features/rbac/create-permission/index.ts`

## Problems Found

**Critical**
- None

**High**
- None

**Medium**
- None

**Low**
- `description` in the Zod schema is a required (non-optional) string with `max(255)`, even though the API/`CreatePermissionInput` treats it as optional. Not a real drift: the form always initializes `description: ''` and the submit handler explicitly converts a blank/whitespace-only value to `undefined` before calling the mutation, so the effective contract matches the API. Documented here as a considered non-issue, not overlooked.

## Changes Made

- None. The form-to-API mapping is correct, error handling distinguishes 409 (duplicate name) from other failures, and the mono-styled name field matches the sibling `create-role` convention (`input--mono` for identifier-shaped fields). No change clears the `.ci.loop` §19 bar.

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
