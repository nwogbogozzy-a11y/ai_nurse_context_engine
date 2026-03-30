# Testing Patterns

**Analysis Date:** 2026-03-26

## Test Framework

**Runner:**
- No test framework is configured. There is no Jest, Vitest, Playwright, or Cypress installation.
- `src/package.json` has no test-related dependencies or scripts
- No `test` script in `package.json` — only `dev`, `build`, `start`, and `lint`

**Assertion Library:**
- None installed

**Run Commands:**
```bash
npm run lint              # Only available check — runs ESLint
npm run build             # TypeScript type checking happens during build
```

## Test File Organization

**Location:**
- No test files exist anywhere in the project
- No `__tests__/` directories
- No `*.test.*` or `*.spec.*` files

## Test Structure

**No automated tests exist.** Testing was performed manually per the project's `test-report.md` (a manual scenario checklist document at project root). The project relies on three manual end-to-end demo scenarios documented in `CLAUDE.md`.

## Mocking

**Framework:** None configured

**What would need mocking if tests were added:**
- Supabase client (`src/lib/supabase.ts`) — all data fetching goes through `@supabase/supabase-js`
- n8n webhook endpoints — components call `fetch` directly to webhook URLs
- `process.env` values — `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_N8N_WEBHOOK_URL`, `NEXT_PUBLIC_N8N_WEBHOOK_URL_SUPPLY`

## Fixtures and Factories

**Test Data:**
- No test fixtures or factories exist
- Demo data is hardcoded in `src/lib/demo-scripts.ts` (patient-specific dictation strings keyed by UUID)
- Seed data lives in Supabase (3 patients seeded directly in the database)

**Potential fixture sources if tests are added:**
- `src/lib/demo-scripts.ts` — contains realistic dictation strings per patient
- `src/lib/types.ts` — type definitions that can serve as fixture schemas

## Coverage

**Requirements:** None enforced
**Coverage tooling:** Not configured

## Test Types

**Unit Tests:**
- Not present. Candidates for unit testing:
  - `src/lib/format-time.ts` — `formatNoteTimestamp()` and `formatNoteLabel()` are pure functions
  - `src/components/PatientCard.tsx` — `getAge()` and `formatTimestamp()` helper functions
  - Flag type derivation logic (repeated in `PatientCard.tsx`, `StructuredNote.tsx`, `src/app/patient/[id]/page.tsx`)

**Integration Tests:**
- Not present. Candidates:
  - Supabase data fetching in `src/app/page.tsx` and `src/app/patient/[id]/page.tsx`
  - Webhook submission flow in `src/components/DictationInput.tsx` and `src/components/ProcedureSearch.tsx`

**E2E Tests:**
- Not present. No Playwright or Cypress configured.
- The three demo scenarios (Margaret/Devon/Aisha) documented in `CLAUDE.md` and `test-report.md` are candidates for E2E automation.

**Component Tests:**
- Not present. Candidates:
  - `FlagBadge` — renders correct variant based on type prop
  - `SupplyChecklist` — checkbox toggle and "Mark All Ready" behavior
  - `NurseActionBar` — action button state transitions
  - `DictationInput` — typewriter animation flow and state machine transitions

## Test Gaps

**Critical gaps (high risk if code changes):**
- `src/app/patient/[id]/page.tsx` (347 lines) — the most complex file, orchestrates all data fetching, webhook calls, and tab state. Zero test coverage.
- `src/components/DictationInput.tsx` — typewriter animation + webhook submission flow has multiple state transitions that could regress
- `src/components/StructuredNote.tsx` — JSON parsing of `structured_note` field (handles both string and object forms) is fragile without tests

**Medium priority gaps:**
- `src/lib/format-time.ts` — pure utility functions that are easy to test and used across the UI
- Flag type derivation logic — duplicated across 3 files (`PatientCard.tsx`, `StructuredNote.tsx`, `patient/[id]/page.tsx`) with no shared function or tests
- `src/components/ProcedureSearch.tsx` — form submission and error handling states

**Low priority gaps:**
- `src/components/HandoffReport.tsx` — presentational component with minimal logic
- `src/components/FlagBadge.tsx` — simple presentational component
- `src/app/layout.tsx` — static layout, unlikely to break

## Recommendations for Adding Tests

**Recommended framework setup:**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

**Vitest config to create at `src/vitest.config.ts`:**
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

**Add to `src/package.json` scripts:**
```json
"test": "vitest",
"test:run": "vitest run",
"test:coverage": "vitest run --coverage"
```

**Test file convention to follow:**
- Co-locate tests next to source files: `src/lib/format-time.test.ts`, `src/components/FlagBadge.test.tsx`
- Name pattern: `{filename}.test.{ts,tsx}`

**First tests to write (highest value):**
1. `src/lib/format-time.test.ts` — unit tests for `formatNoteTimestamp` and `formatNoteLabel`
2. `src/components/FlagBadge.test.tsx` — renders correct variant, icon, and label per type
3. `src/components/SupplyChecklist.test.tsx` — checkbox toggling, mark all ready, counter display
4. Extract and test flag derivation logic (currently duplicated inline)

---

*Testing analysis: 2026-03-26*
