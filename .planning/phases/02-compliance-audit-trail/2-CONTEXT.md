# Phase 2: Compliance and Audit Trail - Context

**Gathered:** 2026-03-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Every consequential nurse action is permanently recorded with actor attribution, creating a visible compliance record. Covers: audit_log table with Postgres trigger for notes review_status changes, app-level audit inserts for supply/handoff/note actions, Activity tab in patient detail view, flag badge state progression (under_review, resolved), and review state machine extension.

</domain>

<decisions>
## Implementation Decisions

### Audit Log Trigger Design
- **D-01:** Hybrid approach: Postgres trigger on `notes` table for review_status UPDATE changes. App-level inserts into `audit_log` for supply confirmation, handoff generation, and note creation. Trigger guarantees the critical compliance path (nurse actions on flagged notes) cannot be bypassed.
- **D-02:** Trigger fires on UPDATE only (not INSERT). Note creation is captured app-level since n8n-created notes carry nurse_name in the webhook payload, not in a Postgres session variable. Keeps trigger logic simple and focused.
- **D-03:** `audit_log` table schema: `id` (UUID PK), `patient_id` (UUID FK), `nurse_name` (TEXT), `action_type` (TEXT), `metadata` (JSONB), `created_at` (TIMESTAMPTZ DEFAULT now()).
- **D-04:** Action-specific JSONB metadata per action type:
  - approve/escalate/override/under_review/resolved: `{note_id, previous_status, new_status, flag_reason}`
  - confirm-supply: `{supply_request_id, items_confirmed}`
  - generate-handoff: `{handoff_report_id, shift}`
  - create-note: `{note_id, flagged, procedures}`
- **D-05:** RLS policy: SELECT for anon (frontend reads audit log for Activity tab), INSERT for anon (app-level inserts). No UPDATE or DELETE (audit records are immutable).

### Claude's Discretion
- Activity tab timeline component design (within design system constraints)
- Review state machine transition rules (which states can move to which)
- Flag badge colors for new states (under_review, resolved) — follow design system semantic color patterns
- Activity tab entry format (timestamp, action icon, nurse name, description)
- Whether to add a filter/search on the Activity tab or keep it simple chronological
- Exact trigger function implementation details
- Migration naming and ordering

</decisions>

<specifics>
## Specific Ideas

- The Activity tab should feel like a system event log — chronological, factual, no editorializing. Each entry shows who did what to which note/supply/handoff, when.
- The compliance narrative for the FIKA demo is: "Every action has a paper trail. You can see exactly who approved what and when." Keep this front of mind.
- The design system at `/Users/gozzynwogbo/ai_domain/personalplayground/notebooklm/design` should be referenced for Activity tab layout and timeline patterns.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Database Schema (Phase 1 foundation)
- `supabase/migrations/002_phase1_persistence.sql` — Phase 1 migration showing current RLS policies and column additions. Phase 2 migration builds on this.
- `src/lib/types.ts` — Current TypeScript interfaces including Note.review_status (pending/approved/escalated/overridden). Phase 2 extends this.

### Existing Components (modify, don't replace)
- `src/components/NurseActionBar.tsx` — Currently writes review_status to Supabase. Phase 2 adds app-level audit_log inserts alongside existing writes.
- `src/components/FlagBadge.tsx` — Currently has safe/warning/critical variants. Phase 2 adds under_review and resolved badge states.
- `src/components/SupplyChecklist.tsx` — Currently writes confirmed_items to Supabase. Phase 2 adds audit_log insert on confirmation.
- `src/app/patient/[id]/page.tsx` — Patient detail page with three tabs (Notes/Supplies/Handoff). Phase 2 adds Activity tab.

### NurseContext (identity attribution)
- `src/contexts/NurseContext.tsx` — Provides nurse name and shift for all attribution. Audit log entries use this for nurse_name.

### Prior Phase Decisions
- `.planning/phases/01-functional-foundation/1-CONTEXT.md` — Phase 1 decisions D-06 through D-09 (review_status as TEXT, direct Supabase writes, UPDATE RLS). Phase 2 extends this pattern.

### External Design Knowledge
- `/Users/gozzynwogbo/ai_domain/personalplayground/notebooklm/design/` — NotebookLM-backed design system for Activity tab and badge design.

### Project Planning
- `.planning/ROADMAP.md` — Phase 2 scope definition and requirements mapping.
- `.planning/REQUIREMENTS.md` — Full requirements with acceptance criteria (COMP-01 through COMP-04, UI-05, UI-09).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/supabase.ts` — Supabase client for all DB operations. Reuse for audit_log reads (Activity tab) and app-level inserts.
- `src/contexts/NurseContext.tsx` — `useNurse()` hook provides `currentNurse.name` and `currentNurse.shift` for audit attribution.
- `src/lib/format-time.ts` — Timestamp formatting utilities. Reuse for Activity tab timeline entries.
- `src/components/FlagBadge.tsx` — Three-state badge. Extend with two new variants (under_review, resolved).

### Established Patterns
- Direct Supabase writes from components (Phase 1 D-08). Audit log inserts follow same pattern.
- Sonner toasts on every persisted action (Phase 1 D-16). Audit-related actions should also toast.
- `'use client'` on all components. New Activity tab component follows this.
- Tab system in patient detail page (`type Tab = 'notes' | 'supplies' | 'handoff'`). Extend to include 'activity'.

### Integration Points
- `NurseActionBar.tsx` — After writing review_status UPDATE, also INSERT into audit_log with action-specific metadata. The Postgres trigger handles the trigger-based audit entry for the review_status change itself.
- `SupplyChecklist.tsx` — After writing confirmed_items UPDATE, INSERT into audit_log with supply confirmation metadata.
- `patient/[id]/page.tsx` — Add Activity tab. Fetch audit_log entries for the patient. Render as chronological timeline.
- `DictationInput.tsx` — After successful webhook response, INSERT into audit_log with create-note metadata.

</code_context>

<deferred>
## Deferred Ideas

- Audit log export (CSV/PDF) for external compliance reporting — could be Phase 4 or backlog
- Audit log search/filter by nurse or action type — keep Activity tab simple for now
- Audit log retention policy / archiving — not needed for demo
- Email/Slack notifications on critical actions — out of scope

</deferred>

---

*Phase: 02-compliance-audit-trail*
*Context gathered: 2026-03-27*
