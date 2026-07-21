# Loop 001

**Slice:** features/validation-rules/create-rule
**Date:** 2026-07-21

## Goal

First Improvement Loop pass over `features/validation-rules/create-rule` (no prior LOOP.md/ARCH.md; boundaries set by `entities/validation-rule/ARCH.md` Design 001).

## Files Reviewed

- `features/validation-rules/create-rule/create-rule-schema.ts`
- `features/validation-rules/create-rule/CreateRuleForm.tsx`
- `features/validation-rules/create-rule/use-create-rule.ts`
- `features/validation-rules/create-rule/index.ts`

## Problems Found

**Critical**
- None

**High**
- None

**Medium**
- None

**Low**
- The raw-JSON `value` text input (vs. an operator-aware structured input) is a documented scope cut in `entities/validation-rule/ARCH.md`, not an oversight — not re-raised here.

## Changes Made

- None. The `.refine()` chain correctly enforces "value or compareField, not neither" and "value must parse as JSON," error messages are field-scoped and rendered accessibly, and the mutation invalidates the correct parameterized query key (`validationRulesQueryKey(targetType)`). No change clears the `.ci.loop` §19 bar.

## Why

N/A — no change made.

## Tests

No automated tests exist yet (known gap).

## Build

PASS

## Lint

PASS

## Remaining TODO

- None specific to this slice beyond the already-tracked scope cuts in `entities/validation-rule/ARCH.md`.

## Next Loop

- No known follow-up.
