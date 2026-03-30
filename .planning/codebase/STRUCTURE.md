# Codebase Structure

**Analysis Date:** 2026-03-26

## Directory Layout

```
nurse_context_engine/
├── src/                              # Next.js application (all frontend code)
│   ├── app/                          # Next.js App Router pages
│   │   ├── layout.tsx                # Root layout with header, Inter font, global nav
│   │   ├── page.tsx                  # Dashboard — patient list (/)
│   │   ├── globals.css               # Tailwind imports + design token theme
│   │   ├── favicon.ico               # App icon
│   │   └── patient/
│   │       └── [id]/
│   │           └── page.tsx          # Patient detail view (/patient/:uuid)
│   ├── components/                   # Reusable React components
│   │   ├── PatientCard.tsx           # Patient summary card for dashboard
│   │   ├── DictationInput.tsx        # Typewriter dictation input with demo scripts
│   │   ├── StructuredNote.tsx        # SOAP note display with flags and actions
│   │   ├── SupplyChecklist.tsx       # Supply item table with confirm checkboxes
│   │   ├── ProcedureSearch.tsx       # Standalone procedure search form
│   │   ├── HandoffReport.tsx         # Shift handoff report display
│   │   ├── FlagBadge.tsx             # Safe/warning/critical status badge
│   │   └── NurseActionBar.tsx        # Approve/escalate/override action buttons
│   ├── lib/                          # Shared utilities and configuration
│   │   ├── supabase.ts              # Supabase client initialization
│   │   ├── types.ts                 # All TypeScript interfaces
│   │   ├── demo-scripts.ts          # Pre-scripted dictation text per patient
│   │   └── format-time.ts           # Timestamp formatting helpers
│   ├── public/                       # Static assets (SVG icons from Next.js scaffold)
│   ├── tsconfig.json                 # TypeScript config with @/* path alias
│   ├── next.config.ts                # Next.js config (turbopack enabled)
│   ├── postcss.config.mjs            # PostCSS with @tailwindcss/postcss plugin
│   ├── package.json                  # Dependencies and scripts
│   ├── package-lock.json             # Lockfile
│   └── next-env.d.ts                 # Next.js TypeScript declarations
├── supabase/                         # Database configuration
│   └── migrations/
│       └── 001_enable_rls.sql        # RLS policies for all 4 tables
├── n8n-workflow.json                 # Main n8n pipeline (note + handoff + supply from dictation)
├── n8n-workflow-supply-lookup.json   # Standalone supply lookup n8n pipeline
├── .interface-design/
│   └── system.md                     # Design system specification
├── .claude/                          # Claude agent skill definitions
│   └── skills/                       # Agent skill files (9 agents)
├── design_package/                   # Design reference materials (not runtime code)
├── reviews/
│   └── review-final.md              # Design review output
├── .planning/
│   └── codebase/                     # GSD codebase analysis documents (this directory)
├── CLAUDE.md                         # Master project instructions
├── prompts.md                        # Claude API prompt definitions
├── ux-brief.md                       # UX research brief
├── design-principles-nurse.md        # Design principles document
├── backend-verification.md           # Backend pipeline verification log
├── integration-verification.md       # Integration test log
├── test-report.md                    # End-to-end test report
├── debug-log.md                      # Debugging log
├── .env                              # Environment variables (DO NOT READ)
└── .gitignore                        # Git ignore rules
```

## File Organization

**Organization pattern:** Hybrid -- pages organized by route (App Router convention), components organized by type in a flat directory.

- **Pages** follow Next.js App Router file-based routing: `src/app/page.tsx` for `/`, `src/app/patient/[id]/page.tsx` for `/patient/:id`
- **Components** are in a single flat `src/components/` directory -- no subdirectories, no grouping by feature
- **Library code** lives in `src/lib/` -- client init, types, utilities, demo data
- **Backend logic** is entirely outside the Next.js app, in root-level n8n JSON files
- **Documentation** lives at the project root (markdown files)

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root layout -- header with app name, nurse identity, global CSS import
- `src/app/page.tsx`: Dashboard page -- fetches patients, renders PatientCard grid
- `src/app/patient/[id]/page.tsx`: Patient detail -- three-column layout, tabs, dictation, handoff generation

**Configuration:**
- `src/tsconfig.json`: TypeScript strict mode, `@/*` path alias maps to `src/*`
- `src/next.config.ts`: Turbopack enabled
- `src/postcss.config.mjs`: Tailwind CSS v4 via `@tailwindcss/postcss`
- `src/app/globals.css`: Design tokens defined as CSS custom properties via `@theme inline`

**Core Logic:**
- `src/lib/supabase.ts`: Singleton Supabase client (reads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- `src/lib/types.ts`: All data model interfaces -- `Patient`, `Note`, `StructuredNote`, `SupplyItem`, `SupplyRequest`, `HandoffReport`, `PriorityFlag`, `WebhookResponse`, `SupplyLookupResponse`
- `src/lib/demo-scripts.ts`: Hardcoded dictation strings keyed by patient UUID (6 scripts total across 3 patients)
- `src/lib/format-time.ts`: `formatNoteTimestamp()` and `formatNoteLabel()` helpers

**Backend Pipelines:**
- `n8n-workflow.json`: Main pipeline -- webhook `POST /webhook/nurse-context` -> parse -> fetch patient -> Claude note structuring -> save -> route (supply list or handoff) -> respond
- `n8n-workflow-supply-lookup.json`: Supply pipeline -- webhook `POST /webhook/supply-lookup` -> parse -> fetch patient -> Claude supply generation -> save -> respond

**Database:**
- `supabase/migrations/001_enable_rls.sql`: RLS policies -- anon SELECT on all tables, anon INSERT on notes/supply_requests/handoff_reports

## Naming Conventions

**Files:**
- Components: PascalCase (`PatientCard.tsx`, `FlagBadge.tsx`)
- Library modules: kebab-case (`demo-scripts.ts`, `format-time.ts`) except `supabase.ts` and `types.ts`
- Pages: `page.tsx` (Next.js App Router convention)
- Config files: lowercase with dots (`tsconfig.json`, `next.config.ts`, `postcss.config.mjs`)

**Directories:**
- Route segments: lowercase (`patient/`, `[id]/`)
- Feature directories: lowercase (`components/`, `lib/`, `public/`)

## Where to Add New Code

**New Page/Route:**
- Create directory under `src/app/` following App Router conventions
- Add `page.tsx` with `'use client'` directive
- Import types from `@/lib/types` and supabase client from `@/lib/supabase`

**New UI Component:**
- Add to `src/components/` as PascalCase `.tsx` file
- Export as named export (not default)
- Mark with `'use client'` directive
- Accept props via typed interface defined in the same file

**New Data Type/Interface:**
- Add to `src/lib/types.ts`

**New Utility Function:**
- Add to existing file in `src/lib/` or create new kebab-case `.ts` file there

**New n8n Pipeline:**
- Export as JSON from n8n, save at project root as `n8n-workflow-{name}.json`
- Add corresponding `NEXT_PUBLIC_N8N_WEBHOOK_URL_{NAME}` env var
- Reference the webhook URL in the relevant component with localhost fallback

**New Supabase Migration:**
- Add numbered SQL file to `supabase/migrations/` (e.g., `002_add_table.sql`)

**New Demo Script:**
- Add entry to `DEMO_SCRIPTS` record in `src/lib/demo-scripts.ts`, keyed by patient UUID with optional suffix

## Special Directories

**`.interface-design/`:**
- Purpose: Design system specification (`system.md`) -- colors, typography, spacing, component patterns
- Generated: By design-system agent
- Committed: Yes

**`.claude/skills/`:**
- Purpose: Agent skill definitions for the 9-agent workflow (ux-research, design-principles, design-system, backend, ai-logic, frontend-design, integration, testing, design-review)
- Generated: Manual setup
- Committed: Yes

**`design_package/`:**
- Purpose: Design reference materials, NotebookLM integration configs, skill templates
- Generated: Manual setup
- Committed: Yes

**`.planning/codebase/`:**
- Purpose: GSD codebase analysis documents (this file and siblings)
- Generated: By GSD mapping agents
- Committed: Yes

**`src/.next/`:**
- Purpose: Next.js build output
- Generated: Yes (by `next build` or `next dev`)
- Committed: No (in `.gitignore`)

**`src/node_modules/`:**
- Purpose: Installed npm dependencies
- Generated: Yes (by `npm install`)
- Committed: No (in `.gitignore`)

---

*Structure analysis: 2026-03-26*
