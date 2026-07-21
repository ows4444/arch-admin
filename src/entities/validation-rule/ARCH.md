# Design 001

**Slice / UI Domain:** Validation rules — first resource-CRUD screen
**Date:** 2026-07-21

## Goal

Build the first non-auth resource screen: list/create/toggle/delete validation rules against `GET/POST/PATCH/DELETE /validation-rules`, filtered by the required `targetType` query param. Establishes the pattern future resource screens (RBAC roles/permissions) will follow.

## Scale/UX Context Assumed

Same as `entities/session/ARCH.md` Design 001: single-tenant, growing admin console, no SEO/offline requirement, CSR-only.

## FSD Slices Identified

- `entities/validation-rule` — domain types + read query (`useValidationRules`)
- `features/validation-rules/create-rule` — form + create mutation
- `features/validation-rules/toggle-rule` — enable/disable mutation
- `features/validation-rules/delete-rule` — delete mutation
- `pages/validation-rules` — composes the above, owns the `targetType` filter as local component state

## Key Decisions (with risk tag)

**HIGH**
- **Dev proxy path collision (correction to `entities/session/ARCH.md` Design 001).** That design proxied backend paths directly (`/auth`, `/validation-rules` → `http://localhost:3000`). Adding a frontend page at `/validation-rules` collided with the `/validation-rules` proxy rule: a full-page load of that route hit the API proxy instead of the SPA. Verified: `GET http://localhost:5173/validation-rules` returned the backend's `{"message":"Missing bearer token."}` instead of `index.html`, before the fix.
  Fixed by moving all API traffic under an `/api` prefix in `vite.config.ts` (`rewrite: path => path.replace(/^\/api/, '')`), so the proxy prefix is namespaced and can never collide with a page route regardless of what routes are added later. `shared/api`'s default `API_BASE_URL` changed from `''` to `'/api'` to match.
  This generalizes: any dev-server proxy-by-path-prefix approach is unsafe once the app has more than a couple of frontend routes: the API's own path shape (`/auth/*`, `/validation-rules`, future `/roles`, `/users`, etc.) is not guaranteed disjoint from the app's route namespace, and the API doesn't control what routes this frontend adds. A dedicated `/api` (or similar) prefix removes the risk by construction.

**MEDIUM**
- Query key: `['validation-rules', targetType]` — parameterized by the filter so switching target types doesn't show stale data and each filter value caches independently.
- Mutations (`create`, `toggle`, `delete`) each `invalidateQueries` on the same key rather than manually patching the cache — simpler and correct at this data volume; revisit with optimistic updates only if the list becomes large enough that a full refetch feels slow.
- `value` and `compareField` on the create form are mutually exclusive per the API contract (`value` "required unless `compareField` is set"); the Zod schema enforces "at least one provided," not full mutual exclusivity, to keep the form lenient about incidental whitespace rather than fighting the user.

**LOW**
- `value` is entered as raw JSON text (parsed client-side) rather than a structured operator-aware input, since its shape depends on the operator (scalar for `equals`, array for `in`/`not_in`, etc.) and building an operator-aware value editor isn't justified yet for a single admin screen — flagged below as a scope cut, not an oversight.

## Rejected Alternatives

- Operator-aware structured value input (e.g. array chips for `in`/`not_in`, dedicated number input for `greater_than`) — rejected for now as premature UI investment for the first CRUD screen; JSON-text entry covers all operators uniformly with one input.
- Full multi-field edit form (editing `field`/`operator`/`value` after creation, not just `enabled`) — rejected for this pass; only `enabled` toggling is wired up. Editing other fields requires delete-and-recreate today.
- Optimistic updates on toggle/delete — rejected; plain invalidate-and-refetch is simpler and the list sizes here are small.

## Loading/Prerendering Strategy Decision

Fetch-on-render via TanStack Query, consistent with `entities/session/ARCH.md`. No prerendering.

## State Ownership Decision (Server vs. Client)

- Server state (TanStack Query): the rules list itself (`useValidationRules`).
- Client state: the `targetType` filter text and the create-form field values — local `useState` in `pages/validation-rules` and `features/validation-rules/create-rule` respectively. Not promoted to Zustand or URL state; revisit URL state (`?targetType=`) if deep-linking to a filtered view becomes a real requirement.

## Open Questions / Future Evolution

- Full edit support (not just enable/disable) once there's a concrete need.
- Move `targetType` into the URL (search param) if users need to bookmark/share a filtered view.
- Structured, operator-aware value input if the raw-JSON entry proves error-prone in practice.
- ~~This screen could not be exercised end-to-end against a real success response during this build...~~ **Resolved 2026-07-22:** `smoke-test@example.com` was granted the seeded `admin` role (`roles:manage`) via a direct DB write — the intended manual/ops step per `libs/auth`'s `SeedRolesManagePermission` migration comment — then used, through the now-working RBAC screen itself, to create and grant a new `validation-rules:manage` permission to that same role. The full create/toggle/delete happy path was then verified end-to-end against real `200`/`201` responses (see `entities/validation-rule/LOOP.md` Loop 003 and `pages/validation-rules/LOOP.md`). This is a genuinely privileged, reusable local dev account now, not a one-off workaround.

## Handoff to Improvement Loop

- Public slice API surface:
  - `entities/validation-rule`: `useValidationRules`, `validationRulesQueryKey`, `ValidationRule`, `ValidationRuleOperator`, `VALIDATION_RULE_OPERATORS`, `CreateValidationRuleInput`, `UpdateValidationRuleInput`
  - `features/validation-rules/create-rule`: `CreateRuleForm`
  - `features/validation-rules/toggle-rule`: `useToggleRule`
  - `features/validation-rules/delete-rule`: `useDeleteRule`
  - `pages/validation-rules`: `ValidationRulesPage`
- Layer boundaries: `entities/validation-rule` imports only `entities/session` (for `authFetch`) and `shared/api` types; `features/validation-rules/*` import `entities/session` and `entities/validation-rule`; `pages/validation-rules` composes `entities/validation-rule` and `features/validation-rules/*`.
