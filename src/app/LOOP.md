# Loop 001

**Slice:** app (router, providers, RequireAuth)
**Date:** 2026-07-21

## Goal

First Improvement Loop pass over the `app` layer (no prior LOOP.md/ARCH.md — layering/loading-strategy decisions are documented per-slice in `entities/session/ARCH.md` Design 001, which this layer composes against).

## Files Reviewed

- `app/App.tsx`
- `app/providers/query-client.ts`
- `app/routes/RequireAuth.tsx`
- `app/routes/router.tsx`
- `main.tsx` (root composition, outside `app/` but the entry point that mounts it)

## Problems Found

**Critical**
- None

**High**
- None (no FSD layer violations — `app` composes `pages/*`/`widgets/*`, direction respected throughout)

**Medium**
- No route-based code-splitting anywhere: `router.tsx` statically imported every page (`LoginPage`, `DashboardPage`, `ValidationRulesPage`, `RbacPage`), producing a single ~402KB entry chunk with no split points (confirmed via the Vite build's chunk report). `.ci.loop` §6/§10 call for route-based splitting as a default expectation ("every top-level route should be its own chunk"), and this app now has enough routes (4) for it to matter.
- `RequireAuth`'s `isPending` fallback (`<p>Loading…</p>`) had no accessible live-region role — same gap independently found and fixed in `pages/rbac` and `pages/validation-rules` this pass.

**Low**
- None — `query-client.ts`'s `shouldRetry` (never retry 4xx, retry once otherwise) is correct and already covered by `widgets/app-shell/LOOP.md` Loop 001; not re-litigated here since it satisfies `.ci.loop` §19's "no observed drift" bar.

## Changes Made

- `app/routes/router.tsx`: `DashboardPage`, `ValidationRulesPage`, and `RbacPage` are now lazy-loaded (`React.lazy` + per-route `<Suspense fallback={<RouteFallback />}>`) instead of statically imported. `LoginPage` stays eager — it's the unauthenticated entry point most first visits hit, so splitting it out would trade one waterfall for another with no benefit.
- Extracted the lazy route definitions to `app/routes/lazy-pages.ts` and the shared `RouteFallback` component to `app/routes/RouteFallback.tsx`, rather than inlining them in `router.tsx` — keeps `router.tsx` as a components-only-adjacent file exporting just `router`, which also resolved an `oxlint react/only-export-components` warning the inline version introduced.
- `app/routes/RequireAuth.tsx`: added `role="status"` to the `isPending` loading paragraph, matching the identical fix applied to `pages/rbac/RbacPage.tsx` and `pages/validation-rules/ValidationRulesPage.tsx`.

## Why

Code-splitting: this is a Performance-dimension fix (`.ci.loop` §10), not a loading-*strategy* change — data is still fetched via TanStack Query inside each route component (fetch-on-render, unchanged); only the JS-chunk boundary moved. Classified **Medium** risk per §19 (comparable to "extracting hooks/components, moving files"), not High, since it doesn't touch data-loading strategy, state ownership, or the public API of any composed slice (`pages/*`'s `index.ts` exports are unchanged; `app` still imports the same named exports, just via a dynamic rather than static import internally).

Verified impact via the build's chunk report:
- Before: single `index-*.js` at 402.20 kB (gzip 121.86 kB).
- After: `index-*.js` 388.14 kB (gzip 119.34 kB) + `dashboard-*.js` 0.64 kB + `validation-rules-*.js` 7.08 kB + `rbac-*.js` 7.28 kB, each loaded only on first navigation to that route.

The `role="status"` fix is the same accessible-loading-announcement improvement applied consistently across the three places it was found.

## Tests

No automated tests exist yet (known gap, no test runner configured in this repo). Verified via `npm run build` (chunk report confirms the split) and `npm run lint`. Not verified in a live browser in this pass (no running dev server / backend in this environment) — the route tree structure, `Suspense` fallback, and lazy-import wiring are otherwise unchanged in shape from the working eager version, so the risk of a runtime-only regression is low, but this should be spot-checked (navigate between all four routes, confirm no flash-of-fallback jank) before considered fully verified per `.ci.loop` §17.

## Build

PASS

## Lint

PASS

## Remaining TODO

- Live-browser spot-check of route transitions (chunk loads correctly, `Suspense` fallback renders/unmounts cleanly, no visible layout shift) — not verified in this environment.
- Consider prefetching the next-likely route's chunk (e.g. hovering a `NavLink`) if navigation-triggered chunk-load latency turns out to be noticeable in practice; not implemented preemptively (`.ci.loop` §5 — avoid premature complexity without a stated need).

## Next Loop

- Revisit `LoginPage` eagerness if the app grows a second unauthenticated route (e.g. a password-reset flow) where the tradeoff calculus changes.
