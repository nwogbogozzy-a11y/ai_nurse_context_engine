# Technology Stack

**Analysis Date:** 2026-03-26

## Languages

**Primary:**
- TypeScript ~5.x - All frontend source code (`src/**/*.ts`, `src/**/*.tsx`)

**Secondary:**
- SQL - Supabase migrations (`supabase/migrations/001_enable_rls.sql`)
- JSON - n8n workflow definitions (`n8n-workflow.json`, `n8n-workflow-supply-lookup.json`)

## Runtime

**Environment:**
- Node.js (version not pinned; no `.nvmrc` or `.node-version` present)
- Browser: Chrome primary, Firefox secondary (desktop only)

**Package Manager:**
- npm
- Lockfile: `src/package-lock.json` (present)

## Frameworks

**Core:**
- Next.js 16.1.6 - App Router, React Server Components capable but currently all pages use `'use client'`
- React 19.2.3 - UI rendering
- React DOM 19.2.3 - DOM binding

**Styling:**
- Tailwind CSS v4 - Utility-first CSS via PostCSS plugin (`@tailwindcss/postcss`)
- PostCSS - Build pipeline for Tailwind (`src/postcss.config.mjs`)

**Linting:**
- ESLint v9 - Code quality
- eslint-config-next 16.1.6 - Next.js-specific rules (core-web-vitals + typescript presets)

**Build/Dev:**
- Turbopack - Next.js dev server bundler (enabled in `src/next.config.ts` via `turbopack.root`)
- TypeScript ~5.x - Type checking, target ES2017, bundler module resolution

## Key Dependencies

**Critical (Production):**
- `@supabase/supabase-js` ^2.98.0 - Supabase client for database reads from frontend (`src/lib/supabase.ts`)
- `next` 16.1.6 - Application framework
- `react` 19.2.3 - UI library

**Development:**
- `@tailwindcss/postcss` ^4 - Tailwind CSS PostCSS integration
- `@types/node` ^20 - Node.js type definitions
- `@types/react` ^19 - React type definitions
- `@types/react-dom` ^19 - ReactDOM type definitions
- `eslint` ^9 - Linter
- `eslint-config-next` 16.1.6 - Next.js ESLint config
- `tailwindcss` ^4 - CSS framework
- `typescript` ^5 - TypeScript compiler

**Notable absence:** No test framework installed (no jest, vitest, playwright, or cypress).

## Configuration

**TypeScript:**
- Config: `src/tsconfig.json`
- Strict mode enabled
- Path alias: `@/*` maps to `src/*`
- JSX: react-jsx
- Module resolution: bundler

**Next.js:**
- Config: `src/next.config.ts`
- Turbopack enabled with root directory set
- No custom rewrites, redirects, or middleware

**ESLint:**
- Config: `src/eslint.config.mjs`
- Extends: `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Global ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`

**PostCSS:**
- Config: `src/postcss.config.mjs`
- Single plugin: `@tailwindcss/postcss`

**Tailwind CSS (v4 style):**
- Configured inline in `src/app/globals.css` using `@theme inline` block
- Design tokens defined as CSS custom properties (semantic color system)

**Environment:**
- `.env` file present at project root (contains Supabase and API credentials)
- Frontend env vars use `NEXT_PUBLIC_` prefix:
  - `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
  - `NEXT_PUBLIC_N8N_WEBHOOK_URL` - n8n main workflow webhook (defaults to `http://localhost:5678/webhook/nurse-context`)
  - `NEXT_PUBLIC_N8N_WEBHOOK_URL_SUPPLY` - n8n supply lookup webhook (defaults to `http://localhost:5678/webhook/supply-lookup`)
- n8n env vars (configured in n8n, not Next.js):
  - `SUPABASE_URL` - Supabase project URL
  - `SUPABASE_ANON_KEY` - Supabase anonymous key
  - `ANTHROPIC_API_KEY` - Claude API key

## Build & Scripts

**Available commands** (from `src/package.json`):
```bash
npm run dev       # Start Next.js dev server with Turbopack
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

## Platform Requirements

**Development:**
- Node.js (recent LTS recommended, version not pinned)
- n8n instance running locally or in cloud (self-hosted at `localhost:5678`)
- Supabase project with seeded data (4 tables: patients, notes, supply_requests, handoff_reports)
- Anthropic API key for Claude claude-sonnet-4-20250514

**Production:**
- Local only (demo project). No production deployment target.
- Vercel config directory exists (`.vercel/`) but deployment is local-only per project constraints.

---

*Stack analysis: 2026-03-26*
