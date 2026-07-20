# Design 001

**Slice / UI Domain:** Auth (session/login/logout) — cross-cutting concern
**Date:** 2026-07-21

## Goal

Stand up authentication for arch-admin from an empty Vite/React scaffold: login, session bootstrap on reload, logout, and a route guard protecting everything but `/login`.

## Scale/UX Context Assumed

- Single-tenant (one Arch API backend, one org).
- Medium/growing admin console — expect more resource-management screens (validation-rules, RBAC) to be added over time, but only a login + dashboard shell exist today.
- No SEO or offline/PWA requirements — this is an auth-gated internal tool. CSR-only, no prerendering, no service worker.

## FSD Slices Identified

- `app` — providers (QueryClient), router definition, root composition
- `pages/login`, `pages/dashboard`
- `widgets/app-shell` — authenticated layout (header, sign-out, skip link)
- `features/auth/login`, `features/auth/logout`
- `entities/session` — session token state, `authFetch`, `useCurrentUser`
- `shared/api` — generic HTTP client, no auth awareness

## Key Decisions (with risk tag)

**CRITICAL**
- **Token storage.** The Arch API is a bearer-token API, not a cookie-session API: `POST /auth/login` and `/auth/refresh` return `accessToken`/`refreshToken` in the JSON body, and `/auth/refresh` + `/auth/logout` require the client to resubmit `refreshToken` explicitly in the request body. There is no `Set-Cookie` in play. This overrides `.ci.loop` §9's cookie-first default — the backend contract doesn't support it without a backend change.
  Chosen approach: `accessToken` is held in memory only (Zustand store, never persisted); `refreshToken` is persisted to `sessionStorage` (cleared when the tab closes) so a page reload doesn't force a fresh login. On load, if an access token is missing but a refresh token is present, `authFetch` proactively calls `/auth/refresh` before the first request.
  Accepted risk: `sessionStorage` is readable by any script that runs in-page, so an XSS bug could exfiltrate the refresh token. Mitigated by: this app renders no tenant-authored or third-party content (single-tenant internal tool), a `Content-Security-Policy` should be added at the hosting layer restricting script sources (tracked as follow-up, not yet implemented), and the backend controls `refreshTokenExpiresAt` (currently ~30 days — worth revisiting for a shorter admin-tool-appropriate lifetime).
  Rejected alternative: httpOnly cookie-based sessions — not possible without a backend change to have `/auth/login` set a cookie and stop returning tokens in the body.
  Future evolution: if the backend later issues an httpOnly `Secure`/`SameSite` cookie alongside or instead of the body tokens, migrate to that and drop client-side token storage entirely.

**HIGH**
- FSD layers adopted: `app → pages → widgets → features → entities → shared`. `shared/api` has zero knowledge of auth (no upstream imports) — `entities/session` builds `authFetch` on top of `shared/api`'s bare `http()`, keeping the layer direction intact.
- Loading strategy: fetch-on-render via TanStack Query for all server data (`useCurrentUser`, future resource queries), not router loaders — matches `.ci.loop` §0.3's stated default since no loader-based pattern was already established in this greenfield app.
- Router: React Router (`createBrowserRouter`), chosen as the established client-side router for this app going forward.
- Route guarding is a wrapper component (`RequireAuth`) using `useCurrentUser`, not a router loader — consistent with the fetch-on-render choice above.
- State ownership: server state (current user, future resource data) lives in TanStack Query; the raw token pair lives in a single justified Zustand store (`entities/session`) because it's ephemeral secret material multiple non-React consumers (the `authFetch` interceptor) need synchronous access to outside the query cache — not a case of "value stored in more than one place."
- Dev-server API proxying: the Arch API sends no CORS headers and doesn't implement `OPTIONS` (`Cannot OPTIONS /auth/login`, verified against the running backend), so cross-origin calls from the Vite dev server are blocked by the browser even though the backend itself returns 200. Fixed via a Vite dev proxy (`vite.config.ts` → `/auth`, `/validation-rules` → `http://localhost:3000`) so dev requests are same-origin. `shared/api`'s base URL defaults to `''` (relative) for this reason; production must set `VITE_API_URL` explicitly, which then requires the backend to CORS-allow the deployed frontend origin (no credentials needed, since auth is bearer-token, not cookie-based).

**MEDIUM**
- `authFetch` retries a 401 exactly once via a de-duplicated in-flight refresh promise (`refreshPromise` module singleton) to avoid a refresh stampede if multiple queries 401 simultaneously.
- No shared UI kit yet (`shared/ui`) — only two forms exist (login) and nothing is duplicated yet; premature per `.ci.loop` §5.

**LOW**
- Folder/file naming: PascalCase for components, kebab/camel for hooks and stores.

## Rejected Alternatives

- httpOnly cookie auth — blocked by backend contract (see CRITICAL above).
- Router-loader-based data fetching for the auth guard — rejected in favor of fetch-on-render to match the app-wide default and avoid mixing two loading strategies for the same data (`/auth/me`).
- Global Zustand store for UI state (e.g. shell/sidebar) — not created; no concrete need yet.

## Loading/Prerendering Strategy Decision

Fetch-on-render (TanStack Query) for all routes. CSR-only, no prerendering — no SEO/offline requirement was stated.

## State Ownership Decision (Server vs. Client)

- Server state (TanStack Query): `AuthenticatedUser` via `useCurrentUser` (`GET /auth/me`); future resource data (validation-rules, roles/permissions).
- Client state (Zustand, single store): `accessToken` (memory-only), `refreshToken` (memory + `sessionStorage`) — justified exception, not a general-purpose UI store.
- No URL state yet (no filterable list views exist).

## Open Questions / Future Evolution

- Revisit refresh-token storage if the backend adds httpOnly cookie support.
- Add a `Content-Security-Policy` header at the hosting/CDN layer before this ships past internal use — not yet configured.
- Production CORS: the deployed frontend origin needs to be allow-listed on the backend once a deployment target is chosen; not yet actionable without that target.
- `refreshTokenExpiresAt` is currently ~30 days from the backend — worth a conversation with backend owners about a shorter lifetime for an admin tool.

## Handoff to Improvement Loop

- Public slice API surface:
  - `entities/session`: `useSessionStore`, `authFetch`, `useCurrentUser`, `currentUserQueryKey`, `AuthSession`, `AuthenticatedUser` (via `index.ts`)
  - `features/auth/login`: `LoginForm`
  - `features/auth/logout`: `LogoutButton`
  - `shared/api`: `http`, `ApiError`, `HttpRequestOptions`
- Layer boundaries: `shared/api` has no upstream imports; `entities/session` imports only `shared/api`; `features/auth/*` import `shared/api` and `entities/session`; `pages/*` and `widgets/app-shell` import from `features/*` and `entities/session`; `app/*` composes `pages/*` and `widgets/*`.

## Amendment (found while building `entities/validation-rule`, same date)

The HIGH decision above to proxy each backend path directly (`/auth`, `/validation-rules` → backend) was wrong: it collides with any frontend page route of the same name. Building the `/validation-rules` page surfaced this immediately — a full-page load of that route hit the Vite proxy instead of the SPA, so it never reached React Router. Reverified live: `GET http://localhost:5173/validation-rules` returned the backend's raw `{"message":"Missing bearer token."}` JSON instead of `index.html`.

Fixed by proxying under `/api` instead (stripped before forwarding to the backend), so the proxy prefix can never collide with a page route by construction. `shared/api`'s default base URL changed from `''` to `'/api'` to match. See `entities/validation-rule/ARCH.md` for the full writeup — logged here too since it corrects a decision made in this document.
