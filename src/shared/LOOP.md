# Loop 001

**Slice:** shared (api/http, ui/Logomark)
**Date:** 2026-07-21

## Goal

First Improvement Loop pass over the shared kernel (`shared/api/http.ts`, `shared/api/index.ts`, `shared/ui/Logomark.tsx`, `shared/ui/index.ts`) — no prior LOOP.md existed for this slice.

## Files Reviewed

- `shared/api/http.ts`, `shared/api/index.ts`
- `shared/ui/Logomark.tsx`, `shared/ui/index.ts`

## Problems Found

**Critical**
- None

**High**
- None

**Medium**
- `http()` unconditionally set `Content-Type: application/json` on every request, including bodiless `GET`s. `application/json` is not a CORS-simple header value, so any request carrying it forces a preflight `OPTIONS` round-trip. The backend is documented (ARCH.md, `vite.config.ts`) as not implementing `OPTIONS` at all — currently masked by the same-origin dev proxy, but this would silently break every `GET` the moment this client talks directly to the API cross-origin (the exact scenario `VITE_API_URL` exists for).

**Low**
- None — `Logomark` and the barrel files are minimal, correct, and appropriately zero-dependency (no upstream imports, consistent with `shared` owning no business logic).

## Changes Made

- `shared/api/http.ts`: `Content-Type: application/json` is now only attached when `body !== undefined`, so bodiless requests (all `GET`s) stay preflight-free.

## Why

Removes a latent cross-origin correctness bug before it's exercised (currently invisible because of the dev proxy and because `VITE_API_URL` cross-origin deployment hasn't happened yet). Zero behavior change for requests that do send a body.

## Tests

No automated tests exist yet (known gap, no test runner configured in this repo). Verified by build + lint only; the change is header-shape-only and doesn't alter any request that carries a body (still `application/json`).

## Build

PASS

## Lint

PASS

## Remaining TODO

- No test runner configured yet — this and all future `shared/api` changes are verified by build/lint/manual review only.
- Revisit once a production `VITE_API_URL` deployment target exists — confirm the backend allow-lists the deployed origin and add an integration check for the preflight-free `GET` path.

## Next Loop

- No known follow-up specific to this slice; re-review if `http()` grows additional cross-cutting concerns (e.g. request cancellation, timeout) that sibling entities start reimplementing individually.
