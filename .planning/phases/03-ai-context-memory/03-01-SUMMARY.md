---
phase: 03-ai-context-memory
plan: 01
subsystem: backend
tags: [n8n, claude-api, supabase, context-memory, soap-notes, supply-rationale]

# Dependency graph
requires:
  - phase: 01-functional-foundation
    provides: "n8n workflow with N1-N10 nodes, Supabase tables with RLS, TypeScript types"
  - phase: 02-observable-behavior
    provides: "audit_log table, review_status on notes"
provides:
  - "N3b/N3c prior notes fetch and parse nodes in n8n workflow"
  - "Prior clinical context injection into all three Claude prompts (N4, N8a, N8b)"
  - "N6b/N6c patient summary generation as parallel branch after note save"
  - "patient_summaries table with UNIQUE patient_id and upsert support"
  - "rationale column on supply_requests table"
  - "PatientSummary TypeScript interface"
  - "rationale fields on SupplyRequest and WebhookResponse types"
affects: [03-02, 03-03, frontend-context-tab, frontend-supply-rationale]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Prior notes context injection via N3b/N3c intermediate nodes"
    - "Parallel branch from N6 for non-blocking summary generation"
    - "Supabase REST upsert via Prefer: resolution=merge-duplicates header"
    - "Age annotation on prior notes (hours ago / days ago)"

key-files:
  created:
    - "supabase/migrations/004_phase3_context_memory.sql"
  modified:
    - "src/lib/types.ts"
    - "n8n-workflow.json"

key-decisions:
  - "N3c Parse Prior Notes passes through all upstream data (patient_context, input fields) so downstream nodes reference N3c instead of N3"
  - "N5 Parse Claude Response updated to reference N3c instead of N3 for patient_context"
  - "N10 Webhook Response includes rationale in supply_list response to frontend"
  - "Summary generation (N6b/N6c) runs as parallel branch from N6, not blocking webhook response"

patterns-established:
  - "Prior notes context pattern: N3b fetches, N3c parses with age labels, downstream nodes consume via prior_notes_context field"
  - "Parallel side-effect branch: N6 -> N6b -> N6c runs alongside N6 -> N7 -> response path"

requirements-completed: [AICTX-01, AICTX-03, AICTX-04]

# Metrics
duration: 4min
completed: 2026-03-28
---

# Phase 3 Plan 1: AI Context Memory Backend Summary

**Prior notes injection into all Claude prompts, patient summary generation via parallel N6b/N6c branch, and supply rationale support across n8n pipeline**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-28T18:14:59Z
- **Completed:** 2026-03-28T18:19:23Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- n8n workflow expanded from 12 to 16 nodes with N3b/N3c prior notes fetch and N6b/N6c patient summary generation
- All three Claude prompts (note structuring, supply list, handoff report) now receive prior clinical context with age annotations
- Supply recommendations include rationale field persisted to Supabase and returned to frontend
- Patient context summaries generated after every note save via upsert to patient_summaries table

## Task Commits

Each task was committed atomically:

1. **Task 1: Create database migration and extend TypeScript types** - `2b1a99c` (feat)
2. **Task 2: Add N3b prior notes fetch and modify Claude prompts** - `67c9356` (feat)
3. **Task 3: Add patient summary generation nodes (N6b, N6c)** - `656249b` (feat)

## Files Created/Modified
- `supabase/migrations/004_phase3_context_memory.sql` - Creates patient_summaries table with UNIQUE patient_id, adds rationale column to supply_requests
- `src/lib/types.ts` - Added PatientSummary interface, rationale on SupplyRequest and WebhookResponse.supply_list, fixed pre-existing missing fields
- `n8n-workflow.json` - Added N3b/N3c/N6b/N6c nodes, enriched N4/N8a/N8b prompts, updated N9a/N10 for rationale

## Decisions Made
- N3c Parse Prior Notes consolidates all upstream data (patient_context from N3, input fields from N2, prior_notes_context from N3b) so downstream nodes only reference N3c
- N5 Parse Claude Response updated to pull patient_context from N3c instead of N3 directly
- N10 Webhook Response extracts rationale from supply list Claude response and includes it in the frontend payload
- Summary generation runs as parallel branch (N6 -> N6b -> N6c) alongside main response path (N6 -> N7 -> N10)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Fixed pre-existing TypeScript type gaps**
- **Found during:** Task 1 (TypeScript types update)
- **Issue:** SupplyRequest was missing confirmed_items and note_id fields; HandoffReport was missing stable_items and recommended_first_actions -- all added by Phase 1 migration but never reflected in types
- **Fix:** Added confirmed_items (Record<string, boolean>), note_id (string | null) to SupplyRequest; stable_items (string[]), recommended_first_actions (string[]) to HandoffReport
- **Files modified:** src/lib/types.ts
- **Verification:** TypeScript compilation passes cleanly (was failing with 3 errors before fix)
- **Committed in:** 2b1a99c (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** Pre-existing type gaps fixed as part of types.ts update. No scope creep.

## Issues Encountered
None

## Known Stubs
None - all backend nodes are fully wired with production Claude prompts, Supabase REST calls, and data flow.

## User Setup Required
Migration `004_phase3_context_memory.sql` must be run against Supabase before the new nodes will work:
- Creates `patient_summaries` table
- Adds `rationale` column to `supply_requests`

## Next Phase Readiness
- Backend pipeline complete for AI context memory
- Plan 03-02 (frontend Context tab and supply rationale UI) can proceed -- types and webhook response shape are ready
- Plan 03-03 (SOAP note and handoff report visual polish) has no backend dependency from this plan

## Self-Check: PASSED
- All 3 files verified present on disk
- All 3 task commits verified in git log (2b1a99c, 67c9356, 656249b)
- TypeScript compilation clean
- n8n workflow JSON valid with all 16 nodes

---
*Phase: 03-ai-context-memory*
*Completed: 2026-03-28*
