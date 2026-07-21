# Design 001

**Slice / UI Domain:** RBAC (roles & permissions) — second resource-management screen
**Date:** 2026-07-21

## Goal

Build a screen to create roles, create permissions, and grant/revoke permissions on roles, against the `auth-rbac` endpoints (`libs/auth/src/http/role.controller.ts` in the `arch` backend). Every endpoint requires the `roles:manage` permission.

## Scale/UX Context Assumed

Same as `entities/session/ARCH.md` and `entities/validation-rule/ARCH.md` Design 001s: single-tenant, growing admin console, CSR-only, no SEO/offline requirement.

## FSD Slices Identified

- `entities/rbac` — domain types, `useRoles` (read query), `useKnownPermissionsStore` (derived client-side permission catalog)
- `features/rbac/create-permission` — form + create mutation
- `features/rbac/create-role` — form + create mutation (optionally pre-granting permissions)
- `features/rbac/grant-permission` — grant mutation
- `features/rbac/revoke-permission` — revoke mutation
- `pages/rbac` — composes the above; `RoleCard` renders one role's permission checklist

## Key Decisions (with risk tag)

**HIGH — No `GET /auth/permissions` exists.** Permissions only ever appear nested inside a `RoleResponseDto` (from `GET /auth/roles` or after granting) or as the direct response of `POST /auth/permissions`. There is no way to list all permissions independent of roles.
Chosen approach: `entities/rbac/known-permissions-store.ts`, a Zustand store that accumulates every `Permission` object observed so far — seeded from `GET /auth/roles`' nested permissions (merged in `pages/rbac/RbacPage.tsx` via an effect keyed on `roles.data`) and appended to on a successful `POST /auth/permissions`. This is a justified exception to "no assumed-by-default global stores": it is never authoritative (a full reload rebuilds it entirely from `GET /auth/roles`), so it cannot drift from the server in a way that matters — it only solves "what can I show as a checkbox option," not "what is true."
Accepted limitation: a permission that exists on the backend but has never been attached to any role and wasn't created in the current browser session (e.g. seeded by a migration, or created from a different browser tab) will not appear in the checklist until it's granted to some role through another path. Flagged as a backend gap below, not something the frontend can fully paper over.
Rejected alternative: a `useState` local to each form — rejected because the catalog needs to be shared between `CreateRoleForm` (pre-granting on create) and every `RoleCard` (granting after the fact), and re-deriving it independently in each component would duplicate the accumulation logic.

**HIGH — User↔role assignment is out of scope for this loop.** `POST/DELETE /auth/users/:userId/roles/:roleName` exist, but there is no `GET /users` or any user-lookup endpoint anywhere in the backend (confirmed via `libs/auth/src` and full repo grep for a users controller) — an admin would have to already know a raw UUID with no way to find one in this app. Decided with the user: skip this screen for now rather than ship a bare "paste a UUID" input. Tracked as an open question below.

**HIGH — Mutation granularity matches backend semantics.** Role↔permission grant/revoke are individual POST/DELETE per pair (no bulk-replace endpoint exists), so each checkbox in `RoleCard`'s permission checklist fires its own request on toggle. No client-side "diff and batch save" layer was built — the backend doesn't support it, and inventing one would just be complexity with no server-side counterpart.

**MEDIUM — Query key & invalidation.** Single `['rbac', 'roles']` list query (`GET /auth/roles` takes no query params — it always returns the full table). Every mutation (create role, grant, revoke) invalidates this one key; `create-permission` does not invalidate it, since creating a permission doesn't attach it to any role — it only updates the local known-permissions store. Matches the existing `entities/validation-rule` pattern of invalidate-over-cache-surgery at this data volume.

**LOW** — `description` is dropped client-side for `Role` even though the backend entity has the column, because `RoleResponseDto` never returns it (confirmed in `role.controller.ts`/`role-response.dto.ts`) — nothing to model on a field the API never sends.

## Rejected Alternatives

- A "browse all permissions" view independent of roles — not possible without a `GET /auth/permissions` endpoint; noted as a backend gap.
- Raw-UUID user↔role assignment input — rejected by the user in favor of skipping the screen entirely until a user-lookup endpoint exists.
- Optimistic updates on grant/revoke — rejected; matches the existing invalidate-and-refetch choice used for validation-rules, and role/permission counts here are small.

## Loading/Prerendering Strategy Decision

Fetch-on-render via TanStack Query, consistent with the rest of the app. No prerendering.

## State Ownership Decision (Server vs. Client)

- Server state (TanStack Query): the roles list (`useRoles`, key `['rbac', 'roles']`).
- Client state (Zustand, justified exception): the known-permissions catalog (`useKnownPermissionsStore`) — explicitly a derived, reconstructable accumulator, not a second source of truth for anything the server already owns.
- Form field values: local `useState` in `CreatePermissionForm`/`CreateRoleForm`, matching `features/validation-rules/create-rule`'s convention.

## Open Questions / Future Evolution

- Backend: add `GET /auth/permissions` to remove the need for the known-permissions accumulator entirely.
- Backend: add a user-list/search endpoint (even a minimal `GET /users?search=`) so user↔role assignment can be built — currently impossible to build without one.
- Once a user-lookup endpoint exists, add `features/rbac/assign-user-role` and `features/rbac/revoke-user-role` following the same grant/revoke mutation pattern as permissions.
- Re-verify this screen against a privileged test account — same blocker noted in `entities/validation-rule/ARCH.md` (available test account has no `roles:manage` permission, so this build could not be exercised against real 200 responses; verified instead via code review against the backend contract and the existing `authFetch`/error-state conventions).

## Handoff to Improvement Loop

- Public slice API surface:
  - `entities/rbac`: `useRoles`, `rolesQueryKey`, `useKnownPermissionsStore`, `useKnownPermissions`, `Role`, `Permission`, `CreateRoleInput`, `CreatePermissionInput`
  - `features/rbac/create-permission`: `CreatePermissionForm`, `useCreatePermission`
  - `features/rbac/create-role`: `CreateRoleForm`, `useCreateRole`
  - `features/rbac/grant-permission`: `useGrantPermission`
  - `features/rbac/revoke-permission`: `useRevokePermission`
  - `pages/rbac`: `RbacPage`
- Layer boundaries: `entities/rbac` imports only `entities/session` (for `authFetch`) and `shared/api`; `features/rbac/*` import `entities/session`, `entities/rbac`, and `shared/api`; `pages/rbac` composes `entities/rbac` and `features/rbac/*`.
