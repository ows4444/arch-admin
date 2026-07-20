# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`arch-admin` is a Vite + React 19 + TypeScript SPA, currently a freshly scaffolded template (default `App.tsx` demo content, no routing/data layer/state management wired up yet). It is the admin frontend for a separate backend service, the "Arch API" (a NestJS-style monorepo service), which is not part of this repo.

The backend exposes an OpenAPI spec at `http://localhost:3000/docs-json` when running locally. Current endpoint surface (as of last check):
- `auth`: `/auth/login`, `/auth/logout`, `/auth/logout-all`, `/auth/me`, `/auth/refresh`, `/auth/register` — cookie/token-based session auth
- `auth-rbac`: `/auth/permissions`, `/auth/roles`, role↔permission and user↔role assignment endpoints — role-based access control management
- `validation-rules`: full CRUD for stored validation rules, filterable by `targetType`

Since the spec can drift, re-fetch `http://localhost:3000/docs-json` against a running backend instance rather than trusting a stale summary when working on API integration.

## Commands

- `npm run dev` — start Vite dev server with HMR
- `npm run build` — type-check (`tsc -b`) then production build (`vite build`)
- `npm run lint` — run oxlint
- `npm run preview` — preview the production build locally

There is no test runner configured yet.

## Architecture

The codebase has no application logic yet — `src/App.tsx` is unmodified scaffold content. **All real architectural direction comes from `.ci.loop`** at the repo root, which is the operating protocol this repo is meant to be built against. Read it before doing any nontrivial frontend work; do not treat it as optional background:

- **Feature-Sliced Design (FSD)** is the mandated structure: layers are `app → processes → pages → widgets → features → entities → shared`, imports only ever point downstream, and each slice exposes a public API solely through its `index.ts` (no deep imports into another slice's internals).
- **Section 0 (Design Mode)** applies whenever a new slice/feature/widget is being scoped, or an existing slice's boundaries/data-loading/state-ownership are being reconsidered — not for ordinary bug fixes or internal refactors. Design Mode output is recorded per-slice in `ARCH.md` (template in `.ci.loop` §0.7) and must exist before the Improvement Loop treats a slice's boundaries as settled.
- **Sections 1–20 (Improvement Loop)** apply once code exists: Understand → Review → Plan → Implement → Verify → Evaluate, with every change classified LOW/MEDIUM/HIGH/CRITICAL (§19). Iterations are logged per-slice in `LOOP.md` (template in §15) — never delete history, always append.
- Target stack once slices are built out: TanStack Query for server state, Zustand for client/UI state (scoped stores, not a single god-store), Zod schemas shared between client and API, a client-side router (React Router or TanStack Router — not yet chosen), and CSR-only rendering by default (prerendering must be explicitly justified, not assumed).
- Auth tokens must not be stored in `localStorage`/`sessionStorage` — prefer httpOnly cookies issued by the API, given the backend is a separate origin (`localhost:3000` vs the Vite dev origin), which implies CORS-with-credentials and CSRF handling.
- Only `VITE_`-prefixed env vars are ever exposed to the client bundle — never put secrets in unprefixed `import.meta.env` values.

Before adding a new slice, feature, or making a loading/state-ownership decision, check `.ci.loop` for the relevant section rather than improvising — it has specific rules for routing/data-loading (§6), state management (§7), forms/validation (§8), security (§9), performance (§10), accessibility (§11), and FSD boundaries (§12).

## Linting

`.oxlintrc.json` enables the `react`, `typescript`, and `oxc` plugins with `react/rules-of-hooks` as an error and `react/only-export-components` as a warn. Type-aware lint rules are not yet enabled (would require `oxlint-tsgolint`).
