# Loop 001

**Slice:** pages/validation-rules
**Date:** 2026-07-21

## Goal

First Improvement Loop pass over `pages/validation-rules` (no prior LOOP.md/ARCH.md; boundaries set by `entities/validation-rule/ARCH.md` Design 001).

## Files Reviewed

- `pages/validation-rules/ValidationRulesPage.tsx`
- `pages/validation-rules/RulesTable.tsx`
- `pages/validation-rules/index.ts`

## Problems Found

**Critical**
- None

**High**
- None

**Medium**
- None

**Low**
- Same accessible-loading-state gap as `pages/rbac` (see that slice's Loop 001 entry): `rules.isPending`'s `Loading…` text had no live-region role, unlike the adjacent `role="alert"` error state.
- `RulesTable`'s switch/delete controls already carry correct `aria-label`s describing the action and target (e.g. `Disable rule for <field>`) — noted as a positive finding, not a gap.

## Changes Made

- Added `role="status"` to the loading indicator in `ValidationRulesPage.tsx`, matching the fix applied to `pages/rbac/RbacPage.tsx` and `app/routes/RequireAuth.tsx` in this same loop pass.

## Why

Consistency: the same loading-announcement gap existed in three places across the app; fixed identically in all three rather than only here.

## Tests

No automated tests exist yet (known gap). Verified via build/lint; additive, one-attribute change.

## Build

PASS

## Lint

PASS

## Remaining TODO

- Re-verify the create/toggle/delete happy path against a live backend once a privileged test account exists (carried over from `entities/validation-rule/LOOP.md`).

## Next Loop

- No other known follow-up.

---

# Loop 002

**Slice:** pages/validation-rules
**Date:** 2026-07-22

## Goal

Fix an unthrottled network-request bug found by manually exercising this page in-browser against a running backend — first time this slice was verified end-to-end (per the Remaining TODO in Loop 001).

## Files Reviewed

- `pages/validation-rules/ValidationRulesPage.tsx`
- `entities/validation-rule/use-validation-rules.ts`

## Problems Found

**Critical**
- None

**High**
- `targetType` (raw input state) was passed directly into `useValidationRules`, which puts it straight into the TanStack Query key. Every keystroke changed the query key and fired a new request with no debounce. Typing a 13-character target type sent 13 separate `GET /validation-rules?targetType=...` requests to the live backend — confirmed via network inspection in-browser. Filed as High rather than Medium because this scales with input length and would be materially worse against a real network (not localhost) or a rate-limited backend, and §7/§10 of `.ci.loop` both call this out (duplicate/overlapping fetches; request volume).

**Medium**
- None

**Low**
- None

## Changes Made

- `ValidationRulesPage.tsx`: added a `debouncedTargetType` state, updated via a 400ms `setTimeout`/`clearTimeout` effect keyed on `targetType`. `useValidationRules` now takes the debounced value; the raw `targetType` still drives the input display and `CreateRuleForm`'s target (so the create form doesn't lag behind what the user typed).

## Why

The fix is contained to this page component rather than pushed into `entities/validation-rule/use-validation-rules.ts`, since debouncing is a UI-triggering concern specific to this one text-input consumer, not a property of the query hook itself — other future consumers of `useValidationRules` (if any) may not want debounced input semantics imposed on them.

## Tests

No automated tests exist yet (known gap). Manually verified in-browser: typing "CreateRoleDto" now produces exactly one `GET` request (confirmed via network request inspection, before/after comparison) instead of 13.

## Build

PASS

## Lint

PASS

## Remaining TODO

- Re-verify the create/toggle/delete happy path against a live backend once a privileged test account exists (carried over from Loop 001 / `entities/validation-rule/LOOP.md`) — current test account (`smoke-test@example.com`) gets `403` on `GET /validation-rules`, same permission gap observed on the RBAC screen.

## Next Loop

- If any other slice in this app has a text input driving a TanStack Query key directly (grep for `useState` immediately followed by a query hook call using that state), cross-check it for the same missing-debounce pattern.

---

# Loop 003

**Slice:** pages/validation-rules
**Date:** 2026-07-22

## Goal

Fix the missing delete confirmation flagged in a prior session summary: `RulesTable`'s Delete button fired `deleteRule.mutate(rule.id)` immediately on click, with no confirmation step at all — a destructive action one misclick away, per direct user request.

## Files Reviewed

- `pages/validation-rules/RulesTable.tsx`
- `features/validation-rules/delete-rule/use-delete-rule.ts` (unchanged — confirmed the mutation itself was correct; the gap was purely at the call site)

## Problems Found

**Critical**
- None

**High**
- `RulesTable`'s Delete button called `deleteRule.mutate(rule.id)` directly in its `onClick`, with no confirmation step. A single misclick permanently deletes a validation rule (no undo, no soft-delete on the backend per `entities/validation-rule/ARCH.md`).

**Medium**
- None

**Low**
- None

## Changes Made

- `RulesTable.tsx`: added a `confirmingId` state (one row confirms at a time). Clicking Delete now shows "Confirm delete" + "Cancel" in place of the single Delete button; only clicking "Confirm delete" fires the mutation. Both new buttons carry field-specific `aria-label`s, matching the existing convention on the toggle switch and original Delete button.

## Why

Chose an inline two-step confirm over a modal/dialog primitive: this is the only destructive-delete UI in the app today (role/permission creation isn't destructive, grant/revoke are reversible), so building a generic shared confirmation-dialog component now would be premature sharing per `.ci.loop` §5 — no second call site exists yet to justify the shared abstraction. If a second destructive-delete flow is added later (e.g. deleting a role), revisit whether the pattern should graduate to a shared primitive.

## Tests

No automated tests exist yet (known gap). Manually verified in-browser against a mocked `fetch` (the live backend still 403s `GET /validation-rules` for the available test account, same blocker as Loop 001/002 — mocking was necessary to get a rule row rendered at all): Delete → Confirm delete/Cancel appear in place of Delete; Cancel reverts cleanly to the single Delete button with no request sent; Delete → Confirm delete fires exactly one `DELETE /api/validation-rules/{id}` request.

## Build

PASS

## Lint

PASS

## Remaining TODO

- Same live-backend verification blocker as every prior loop on this slice — re-verify once a privileged test account exists.

## Next Loop

- If a second destructive-delete UI is added anywhere in this app, revisit whether this inline two-step pattern should become a shared `shared/ui` primitive rather than being reimplemented per call site.

---

# Loop 004

**Slice:** pages/validation-rules
**Date:** 2026-07-22

## Goal

Close out the live-backend verification blocker carried since Loop 001, and specifically verify Loop 003's delete-confirmation fix against a real `DELETE`, not just a mocked one.

## Files Reviewed

- `pages/validation-rules/ValidationRulesPage.tsx`, `RulesTable.tsx` (no code change — verification only)

## Problems Found

**Critical/High/Medium/Low**
- None in the application code. One process note: the toggle switch's `<input>` (opacity-0, absolutely positioned, per `index.css`'s `.switch input`) is small enough (34×20px) that synthetic/automated clicks at approximate coordinates missed it entirely with no error and no request — cost real debugging time before being traced to click precision, not app logic (a genuine `element.click()` toggled it correctly on the first try). Not a code defect — native checkbox click targets this small are a normal, accessible pattern (the visual `.switch` box itself defines the hit area) — but worth remembering if a future automated-testing pass (Playwright, once a test runner exists) targets this element: use a locator-based click, not raw coordinates.

## Changes Made

- None.

## Why

N/A — no change made; this loop closes a verification gap.

## Tests

Manually verified the full create → toggle-off → toggle-on → delete-confirm → delete happy path end-to-end against a live backend (`smoke-test@example.com`, now privileged — see `entities/rbac/ARCH.md`'s Amendment), confirming each step via response inspection (not just UI appearance): `POST` 201 with the correct `targetType` persisted, `PATCH` 200 reflecting the toggled `enabled` state, and Loop 003's confirm-dialog fix correctly gated the real `DELETE` (200) behind the Confirm/Cancel step rather than firing on the first click.

## Build

PASS (no change)

## Lint

PASS (no change)

## Remaining TODO

- None. This was the last open item for this slice.

## Next Loop

- No known follow-up.

---

# Loop 005

**Slice:** pages/validation-rules
**Date:** 2026-07-23

## Goal

Cross-port the `role="alert"` fix from `pages/rbac/RbacPage.tsx` (`entities/rbac/LOOP.md` Loop 005): the list-level fetch-error message here had the same gap — no announcement to screen readers when `GET /validation-rules` fails — flagged during that RBAC accessibility spot-check as an identical pattern in this sibling page.

## Files Reviewed

- `pages/validation-rules/ValidationRulesPage.tsx`

## Problems Found

**Critical/High**
- None.

**Medium**
- The `rules.isError` fetch-error `<div>` had no `role="alert"`/`aria-live`, unlike the loading state (`role="status"`) right above it and unlike the equivalent error surfaces in `CreateRuleForm`. Silent failure for screen-reader users on a live `GET` error. Fixed.

**Low**
- None.

## Changes Made

- `pages/validation-rules/ValidationRulesPage.tsx`: added `role="alert"` to the rules-fetch-error `<div>`.

## Why

Matches the fix already applied to the identical pattern in `pages/rbac/RbacPage.tsx` — same component shape (list page with a top-level fetch-error banner), same gap, same fix, for consistency across sibling list pages per `.ci.loop` §3 ("note if the fix pattern should be back-ported or cross-checked against another sibling slice").

## Tests

No test runner configured. Verified via code review (diff is a single `role="alert"` attribute, same as the already-verified RBAC fix) plus build/lint.

## Build

PASS

## Lint

PASS

## Remaining TODO

- None.

## Next Loop

- No known follow-up.
