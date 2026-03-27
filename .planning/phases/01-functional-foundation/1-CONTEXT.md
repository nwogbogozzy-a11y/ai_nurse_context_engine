# Phase 1: Functional Foundation - Context

**Gathered:** 2026-03-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Every nurse interaction persists to the database and is attributed to a named nurse identity. Covers: nurse identity switching, action persistence (approve/escalate/override), supply confirmation persistence, free-form dictation input, data integrity fixes (note_id FK on supply_requests), handoff report field persistence, UPDATE RLS policies, and basic UX feedback (toast notifications + error states).

</domain>

<decisions>
## Implementation Decisions

### Nurse Identity UX
- **D-01:** Nurse switcher lives in the page header bar as a dropdown, top-right position. Matches the `[Nurse]` slot already defined in the design system layout.
- **D-02:** Two hardcoded demo nurses: Sarah Chen (Night Shift) and Marcus Webb (Morning Shift). No nurse table needed — identity is a frontend-only concept for the demo.
- **D-03:** Selected nurse persists via localStorage, hydrated into a React Context provider on mount. Default: Sarah Chen (Night).
- **D-04:** Switching nurse auto-sets the shift context (Sarah = Night, Marcus = Morning). One dropdown controls both identity and shift.
- **D-05:** If dictation is animating or processing when the nurse tries to switch, show a confirmation prompt: "Switching nurse will discard current dictation. Continue?" Otherwise switch silently.

### Action Persistence Model
- **D-06:** Add three columns to the existing `notes` table: `review_status` (TEXT, DEFAULT 'pending'), `reviewed_by` (TEXT), `reviewed_at` (TIMESTAMPTZ). No separate actions table.
- **D-07:** Valid review_status values: 'pending', 'approved', 'escalated', 'overridden'.
- **D-08:** Nurse action writes (approve/escalate/override) go directly from the frontend via Supabase JS client `update()`. No n8n round-trip for these mutations.
- **D-09:** Add UPDATE RLS policy on `notes` table to allow anon role to update `review_status`, `reviewed_by`, `reviewed_at` columns.

### Supply Confirmation Persistence
- **D-10:** Add `confirmed_items` (JSONB) column to `supply_requests` table to track per-item confirmation state. Stores a map of item index → boolean.
- **D-11:** Add UPDATE RLS policy on `supply_requests` table. Frontend writes confirmation state directly via Supabase JS client.

### Dictation Mode Switching
- **D-12:** Dropdown selector above the textarea with options: demo scripts (per-patient, labeled by scenario name) and "Free-form entry" option, separated by a visual divider.
- **D-13:** Selecting a demo script populates the textarea and enables the "Begin Dictation" button for typewriter animation.
- **D-14:** Selecting "Free-form entry" gives an empty, fully editable textarea with a "Submit Note" button (no typewriter animation). Standard text input behavior.

### Toast & Error Feedback
- **D-15:** Install Sonner for toast notifications. Position: bottom-right. Success toasts auto-dismiss after 4 seconds. Error toasts persist until manually dismissed.
- **D-16:** All persisted actions get confirmation toasts: approve/escalate/override, supply item confirmation, "Mark All Ready", handoff report generated.
- **D-17:** Webhook errors (dictation submit, handoff generation) show BOTH an inline red alert in the originating component AND a persistent error toast. Belt-and-suspenders for clinical visibility.

### Data Integrity Fixes
- **D-18:** Add `note_id` FK column to `supply_requests` table. When a note triggers supply generation, the response includes the note ID and the supply request is linked directly — replacing the current timestamp-proximity correlation.
- **D-19:** Add `stable_items` (JSONB) and `recommended_first_actions` (JSONB) columns to `handoff_reports` table so these fields persist across page refresh (currently lost in React state only).

### Verification Approach
- **D-20:** Manual verification only for Phase 1. Run all three demo scenarios end-to-end, check Supabase records directly, confirm state survives page refresh. No test framework added in this phase.

### Claude's Discretion
- Exact dropdown component styling (within design system constraints)
- NurseContext provider implementation details
- Migration SQL ordering and naming
- Toast message copy (e.g., "Note approved by Sarah Chen" vs "Note approved")
- Loading/disabled states during Supabase writes

</decisions>

<specifics>
## Specific Ideas

- Nurse switcher should feel lightweight — a simple dropdown, not a modal or multi-step flow. This is a demo tool, not an auth system.
- Toast style should match the clinical aesthetic: clean, minimal, semantic color only (green for success, red for error). No decorative animations.
- The design system at `/Users/gozzynwogbo/ai_domain/personalplayground/notebooklm/design` should be referenced for any UI/UX decisions — it contains NotebookLM-backed design knowledge across visual design, UX interaction, web frontend, and product strategy.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design System
- `.interface-design/system.md` — Full component specs, color tokens, typography, layout patterns. Header layout shows `[Nurse]` slot for identity switcher.
- `design-principles-nurse.md` — Clinical UI principles guiding all interaction decisions.

### Database Schema
- `supabase/migrations/001_enable_rls.sql` — Current RLS policies (SELECT + INSERT only). Phase 1 adds UPDATE policies.
- `src/lib/types.ts` — TypeScript interfaces for all data models. Must be updated to reflect new columns.

### Existing Components (modify, don't replace)
- `src/components/NurseActionBar.tsx` — Currently sets local state only. Phase 1 wires to Supabase writes.
- `src/components/DictationInput.tsx` — Currently has typewriter mode. Phase 1 adds script selector dropdown and free-form mode.
- `src/app/layout.tsx` — Root layout. Phase 1 adds NurseContext provider and header nurse switcher.
- `src/app/patient/[id]/page.tsx` — Patient detail page. Phase 1 updates to use NurseContext for attribution and to persist handoff extras.

### n8n Workflows
- `n8n-workflow.json` — Main pipeline. Phase 1 may need minor updates if webhook response shape changes to include note_id for supply request linking.

### External Design Knowledge
- `/Users/gozzynwogbo/ai_domain/personalplayground/notebooklm/design/` — NotebookLM-backed design system with visual design, UX interaction, web frontend, and product strategy libraries.

### Project Planning
- `.planning/ROADMAP.md` — Phase 1 scope definition and requirements mapping.
- `.planning/REQUIREMENTS.md` — Full requirements with acceptance criteria.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/supabase.ts` — Supabase client already initialized. Use for all direct DB writes (action persistence, supply confirmation).
- `src/lib/demo-scripts.ts` — Pre-scripted dictation text keyed by patient UUID. Reuse as dropdown options for script selector.
- `src/components/FlagBadge.tsx` — Three-state badge component. Already works correctly — no changes needed.
- `src/lib/format-time.ts` — Timestamp formatting utilities. Reuse for toast messages and review timestamps.

### Established Patterns
- All components are `'use client'` with local `useState` — NurseContext provider follows this pattern (React Context, no external state library).
- Supabase reads use `useEffect` + `useCallback` pattern in patient detail page — Supabase writes should follow the same async pattern.
- Conditional classes via template literals (no `clsx`) — nurse switcher dropdown styling follows this convention.
- Error state stored as `string | null` in component state with inline red alert rendering.

### Integration Points
- `NurseActionBar.tsx` line 156 has a `console.log` for actions — replace with Supabase UPDATE + toast.
- `DictationInput.tsx` currently receives `demoScript` as a prop — refactor to internal state with dropdown selector.
- `patient/[id]/page.tsx` stores `handoffExtras` in React state — after DB migration, fetch from Supabase instead.
- `layout.tsx` needs to wrap children with `<NurseProvider>` and add header bar with nurse dropdown.

</code_context>

<deferred>
## Deferred Ideas

- Audit trail / action history log (separate table tracking all state changes) — could be Phase 3 or backlog
- Real authentication / nurse login — out of scope for demo project
- Undo for nurse actions (e.g., un-approve a note) — not needed for demo flow
- Test framework installation — Phase 3+ concern

</deferred>

---

*Phase: 01-functional-foundation*
*Context gathered: 2026-03-26*
