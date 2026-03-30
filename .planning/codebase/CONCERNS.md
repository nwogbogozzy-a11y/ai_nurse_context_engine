# Codebase Concerns

**Analysis Date:** 2026-03-26

## Tech Debt

**NurseActionBar actions are no-ops:**
- Issue: The Approve, Escalate, and Override buttons in `NurseActionBar` only `console.log` the action. No data is persisted to Supabase, no note status is updated, and no UI state survives a page refresh.
- Files: `src/components/StructuredNote.tsx` (line 156), `src/components/NurseActionBar.tsx`
- Impact: Core demo scenario 2 (Devon Clarke flagged note) relies on nurse actions. The approve/escalate/override workflow is purely cosmetic -- a reviewer clicking "Approve" sees local state that vanishes on refresh. This undermines the "human stays in control" narrative described in `CLAUDE.md`.
- Fix approach: POST action to n8n webhook or update note record in Supabase directly (add `action_taken` column to `notes` table). Reflect persisted state on reload.

**Hardcoded nurse name throughout:**
- Issue: The nurse name `'Sarah Chen'` is hardcoded in multiple locations rather than being configurable or passed through context.
- Files: `src/app/layout.tsx` (line 34), `src/app/patient/[id]/page.tsx` (line 98), `src/components/DictationInput.tsx` (line 60)
- Impact: Cannot demonstrate multi-nurse scenarios (e.g., handoff between two different nurses). The handoff report always shows the same nurse as both outgoing and incoming.
- Fix approach: Create a React context or top-level state for the current nurse identity. For demo purposes, a simple toggle or dropdown in the header would suffice.

**Handoff extras stored only in React state:**
- Issue: `stable_items` and `recommended_first_actions` from the handoff webhook response are stored in component state (`handoffExtras`) but not persisted to the database.
- Files: `src/app/patient/[id]/page.tsx` (lines 29, 110-119, 316)
- Impact: Only the most recent handoff report shows stable items and recommended actions. On page refresh or when viewing older reports, these fields are empty. The `handoff_reports` Supabase table schema does not include these columns.
- Fix approach: Either add `stable_items` and `recommended_first_actions` columns to the `handoff_reports` table, or store them in a JSONB `extras` column. Update the n8n pipeline to persist them.

**Timestamp correlation hack for note-supply mapping:**
- Issue: Notes are matched to supply requests by timestamp proximity (within 120 seconds) rather than a foreign key relationship.
- Files: `src/app/patient/[id]/page.tsx` (lines 32-48)
- Impact: Fragile matching -- if two notes are created within 120s, supplies may be attributed to the wrong note. Also fails if n8n processing takes longer than 120s.
- Fix approach: Add a `note_id` foreign key column to the `supply_requests` table. Have the n8n pipeline pass the note ID when creating supply requests.

**Package name is "src":**
- Issue: The `package.json` has `"name": "src"` -- a default/placeholder name that does not reflect the project.
- Files: `src/package.json` (line 2)
- Impact: Minor -- affects npm scripts and logging only.
- Fix approach: Rename to `"nurse-context-engine"`.

## Security Concerns

**Root `.env` file exists outside gitignore protection:**
- Issue: A `.env` file exists at the project root (`/Users/gozzynwogbo/.../nurse_context_engine/.env`). While `.env` is listed in `.gitignore`, git status shows it is currently untracked (not committed). However, its presence at the root alongside committed project files is a risk -- it could be accidentally committed.
- Files: `.env` (root), `.gitignore`
- Impact: If accidentally committed, Supabase credentials and potentially the Anthropic API key would be exposed in git history.
- Recommendations: Verify `.env` is not staged. Consider adding a pre-commit hook that rejects `.env` files. The `src/.env.local` file (which is the one Next.js actually uses) is properly gitignored.

**Supabase anon key used with permissive RLS policies:**
- Issue: All RLS policies use `USING (true)` and `WITH CHECK (true)` for the `anon` role, meaning anyone with the anon key can SELECT all records and INSERT into `notes`, `supply_requests`, and `handoff_reports`.
- Files: `supabase/migrations/001_enable_rls.sql`, `src/lib/supabase.ts`
- Impact: In a production context, any client with the public anon key could insert arbitrary notes or supply requests. Acceptable for a demo, but a real deployment would need authenticated sessions and row-level filtering.
- Recommendations: Document this as a demo-only configuration. For production, require Supabase auth and scope policies to the authenticated nurse's records.

**No input sanitization on webhook payloads:**
- Issue: Raw user input from the dictation textarea and procedure search is sent directly to the n8n webhook without any client-side validation or sanitization.
- Files: `src/components/DictationInput.tsx` (lines 54-64), `src/components/ProcedureSearch.tsx` (lines 28-34), `src/app/patient/[id]/page.tsx` (lines 92-101)
- Impact: The n8n pipeline forwards this input to the Claude API, which mitigates injection risk. However, the raw input is also stored in Supabase and rendered in the UI. If Supabase or the webhook were compromised, stored XSS is possible via `raw_input`.
- Recommendations: Add basic input length limits on the client. Ensure `raw_input` is rendered as text (not HTML) -- currently it is rendered via React JSX which escapes by default, so XSS risk is low.

**Webhook URLs fallback to localhost:**
- Issue: Both webhook URLs fall back to hardcoded localhost values: `http://localhost:5678/webhook/nurse-context` and `http://localhost:5678/webhook/supply-lookup`.
- Files: `src/components/DictationInput.tsx` (line 51), `src/components/ProcedureSearch.tsx` (line 25), `src/app/patient/[id]/page.tsx` (line 88)
- Impact: If env vars are not set, the app silently falls back to localhost. In a deployed environment without n8n running locally, all webhook calls fail with no clear error about misconfiguration.
- Recommendations: Add a startup check or visible warning when `NEXT_PUBLIC_N8N_WEBHOOK_URL` is not configured.

## Performance Concerns

**N+1 query pattern on dashboard:**
- Issue: The dashboard page fetches all patients, then loops through each patient and makes a separate Supabase query for the latest note per patient.
- Files: `src/app/page.tsx` (lines 24-31)
- Impact: For 3 seeded patients this is negligible. At scale (e.g., 50 patients on a ward), this becomes 51 queries instead of 2. The sequential `for...of` loop compounds the latency.
- Fix approach: Use a single query with a Supabase RPC or a join/subquery to fetch latest notes for all patients at once. Alternatively, use `Promise.all` for the note queries to at least parallelize them.

**No data caching or optimistic updates:**
- Issue: Every action (dictation submit, handoff generation) triggers a full `fetchData()` that re-queries all four tables for the patient.
- Files: `src/app/patient/[id]/page.tsx` (lines 50-63, 68, 108)
- Impact: Perceptible delay after each action. For a demo this is acceptable, but it creates a sluggish feel when multiple notes are submitted in sequence.
- Fix approach: Use optimistic updates -- append the new note/supply to local state from the webhook response before re-fetching in the background.

## Maintainability Issues

**Patient detail page is a monolith (347 lines):**
- Issue: `src/app/patient/[id]/page.tsx` contains all state management, data fetching, handoff generation logic, tab management, and layout rendering in a single component.
- Files: `src/app/patient/[id]/page.tsx`
- Impact: Difficult to modify individual features (e.g., handoff generation) without risk of breaking unrelated state. Testing individual behaviors requires rendering the entire page.
- Fix approach: Extract into custom hooks (`usePatientData`, `useHandoffGeneration`) and sub-components (`PatientSidebar`, `TabContent`).

**Duplicated flag-type derivation logic:**
- Issue: The logic to determine `flagType` from a note's `flagged` and `flag_reason` fields is duplicated across three components with slightly different implementations.
- Files: `src/components/PatientCard.tsx` (lines 13-15), `src/components/StructuredNote.tsx` (lines 21-23), `src/app/patient/[id]/page.tsx` (lines 152-154)
- Impact: If the flag classification logic changes (e.g., adding a new severity level), all three locations must be updated.
- Fix approach: Extract into a shared utility function in `src/lib/`, e.g., `getFlagType(note: Note): 'safe' | 'warning' | 'critical'`.

**Hardcoded patient UUIDs in demo scripts:**
- Issue: Demo scripts are keyed by raw Supabase UUIDs, creating a tight coupling between the seed data and the frontend code.
- Files: `src/lib/demo-scripts.ts`
- Impact: If the database is re-seeded with new UUIDs (or a different Supabase project is used), the demo scripts silently fail -- the dictation dropdown shows no options.
- Fix approach: Either key scripts by a stable identifier (e.g., patient name slug) and resolve at runtime, or document that re-seeding requires updating `demo-scripts.ts`.

**Inline SVG icons repeated across components:**
- Issue: The same SVG icons (checkmark, warning triangle, exclamation circle, arrow) are duplicated as raw SVG markup across nearly every component.
- Files: `src/components/FlagBadge.tsx`, `src/components/StructuredNote.tsx`, `src/components/NurseActionBar.tsx`, `src/components/SupplyChecklist.tsx`, `src/components/HandoffReport.tsx`, `src/app/patient/[id]/page.tsx`
- Impact: Updating an icon requires changes in 5+ files. Increases bundle size slightly. Makes components harder to read.
- Fix approach: Create a shared `src/components/icons/` directory or a single `Icons.tsx` barrel file with named icon components.

## Missing Features / Incomplete Work

**Zero test files:**
- Issue: No test files exist anywhere in the project. No test framework is configured (no jest.config, vitest.config, or testing dependencies in package.json).
- Files: `src/package.json` (no test dependencies)
- Impact: No automated verification that the three demo scenarios work. Regressions from any code change are undetectable without manual testing.
- Fix approach: Add Vitest (aligns with the Vite-based Next.js ecosystem). Prioritize integration tests for the webhook submission flow and unit tests for utility functions (`formatNoteTimestamp`, flag type derivation).

**No error boundary:**
- Issue: There is no React Error Boundary component. If any component throws during render (e.g., malformed Supabase data), the entire app crashes to a white screen.
- Files: `src/app/layout.tsx`
- Impact: During a demo, a single malformed note from Claude could crash the entire UI.
- Fix approach: Add a root-level error boundary in the layout or use Next.js `error.tsx` convention.

**No loading/error states for Supabase client initialization:**
- Issue: The Supabase client is created with non-null assertions (`process.env.NEXT_PUBLIC_SUPABASE_URL!`). If env vars are missing, the app crashes at module load time with an unclear error.
- Files: `src/lib/supabase.ts`
- Impact: Confusing developer experience when env vars are misconfigured.
- Fix approach: Add a runtime check with a descriptive error message.

**Supply checklist "Confirm Prepared" state is client-only:**
- Issue: Checking off supply items and clicking "Mark All Ready" updates only local React state. Nothing is persisted. The `confirmed_by` field in `supply_requests` is never written to.
- Files: `src/components/SupplyChecklist.tsx` (lines 13-25), `src/lib/types.ts` (line 47: `confirmed_by: string | null`)
- Impact: Supply confirmation -- a key workflow step -- is ephemeral. Refreshing the page resets all checkmarks.
- Fix approach: Update `supply_requests.confirmed_by` in Supabase when "Mark All Ready" is clicked.

**Handoff report incoming shift is hardcoded:**
- Issue: The `incomingShift` prop is always passed as `"Night"` regardless of actual time or context.
- Files: `src/app/patient/[id]/page.tsx` (line 327)
- Impact: Minor inaccuracy in the handoff report display. Does not affect demo scenarios since they assume day-to-night handoff.
- Fix approach: Derive from current time or make configurable.

## Dependency Risks

**Next.js 16 (canary/pre-release):**
- Issue: The project uses `next@16.1.6` which is a very recent major version. The Next.js 16 release may have breaking changes from the 14.x era described in `CLAUDE.md`.
- Files: `src/package.json` (line 13)
- Impact: Documentation in `CLAUDE.md` references "Next.js 14 (App Router)" but the actual installed version is 16. API differences between 14 and 16 could cause confusion for developers referencing the project docs.
- Fix approach: Update `CLAUDE.md` to reflect the actual version. Verify all App Router patterns are compatible with Next.js 16.

**React 19:**
- Issue: React 19 is installed (`react@19.2.3`). This is stable but relatively new. Some ecosystem tools and libraries may not fully support React 19 yet.
- Files: `src/package.json` (line 14)
- Impact: Low risk -- Supabase JS and Next.js both support React 19. The `suppressHydrationWarning` usage on date renders suggests awareness of SSR/CSR date mismatch issues.

## Configuration Issues

**Mismatched project structure -- src/ is a nested Next.js project:**
- Issue: The Next.js project lives inside `src/` with its own `package.json`, `tsconfig.json`, `node_modules/`, and `.env.local`. The root directory contains documentation, n8n workflow JSONs, and a separate `.env`. This is non-standard -- typically `src/` is a subdirectory of the Next.js project, not the project root itself.
- Files: `src/package.json`, `src/tsconfig.json`, `src/.env.local` vs root `.env`, root `.gitignore`
- Impact: Developers must `cd src/` before running `npm dev`. The root `.gitignore` covers the root `.env` but does not account for `src/.env.local` (though `src/.gitignore` does). Two separate gitignore files create confusion.
- Fix approach: Either move the Next.js project to the root, or document clearly that `src/` is the Next.js project root. Add a root-level `package.json` with proxy scripts (e.g., `"dev": "cd src && npm run dev"`).

**Google Fonts loaded via external CDN link:**
- Issue: Inter font is loaded from `fonts.googleapis.com` via a `<link>` tag in the layout head.
- Files: `src/app/layout.tsx` (lines 17-20)
- Impact: Violates the `CLAUDE.md` constraint: "Demo must run locally with zero external dependencies at demo time." If internet is unavailable during the demo, the font fails to load and the UI falls back to system fonts.
- Fix approach: Use `next/font/google` which automatically self-hosts the font at build time, or bundle the Inter font files locally.

**`.vercel` directory committed in src/:**
- Issue: A `.vercel/` directory exists inside `src/` containing project configuration. This is typically gitignored.
- Files: `src/.vercel/project.json`
- Impact: Contains Vercel project metadata that should not be shared across developer machines.
- Fix approach: Add `.vercel` to `src/.gitignore` if not already present, and remove from tracking.

---

*Concerns audit: 2026-03-26*
