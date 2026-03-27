# Phase 2: Compliance and Audit Trail - Research

**Researched:** 2026-03-27
**Domain:** Supabase audit logging, Postgres triggers, React timeline UI, flag state machine
**Confidence:** HIGH

## Summary

Phase 2 adds an audit trail layer to the existing nurse context engine. The work is scoped to three concerns: (1) writing audit log entries for every consequential nurse action, (2) surfacing those entries in a new Activity tab, and (3) extending the flag badge and review status system to support a visible state progression from flagged through under_review to resolved.

The existing codebase already has the foundation: NurseActionBar writes review_status to Supabase, SupplyChecklist persists confirmation state, and DictationInput submits through n8n. Phase 2 adds an `audit_log` table, a Postgres trigger on notes for review_status changes, app-level audit inserts in 4 components, a new ActivityTimeline component, an extended FlagBadge, and two new design tokens for the under_review and resolved badge states.

**Primary recommendation:** Implement the migration first (audit_log table + trigger), then wire app-level inserts in existing components, then build the Activity tab UI and badge extensions. This order ensures the data layer is testable before UI work begins.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
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
- Flag badge colors for new states (under_review, resolved) -- follow design system semantic color patterns
- Activity tab entry format (timestamp, action icon, nurse name, description)
- Whether to add a filter/search on the Activity tab or keep it simple chronological
- Exact trigger function implementation details
- Migration naming and ordering

### Deferred Ideas (OUT OF SCOPE)
- Audit log export (CSV/PDF) for external compliance reporting -- could be Phase 4 or backlog
- Audit log search/filter by nurse or action type -- keep Activity tab simple for now
- Audit log retention policy / archiving -- not needed for demo
- Email/Slack notifications on critical actions -- out of scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| COMP-01 | Every nurse action writes an audit event to audit_log with nurse_name, action_type, patient_id, timestamp, metadata | D-01 through D-05 define the table schema, trigger, and app-level insert pattern. Existing component integration points identified in NurseActionBar, SupplyChecklist, DictationInput, and patient detail page. |
| COMP-02 | Patient detail view includes "Activity" tab showing chronological audit trail | ActivityTimeline component design; Tab type extension from 3 to 4 tabs; Supabase SELECT query with patient_id filter, ordered by created_at desc. |
| COMP-03 | Flagged notes support review status state machine (flagged -> under_review -> resolved) with resolving nurse attribution | Current review_status is TEXT with values pending/approved/escalated/overridden. Extend with under_review/resolved values. NurseActionBar needs new transition buttons. reviewed_by and reviewed_at columns already exist. |
| COMP-04 | Flag badge reflects current review state with visible badge progression | FlagBadge currently has safe/warning/critical. Add under_review and resolved types. Two new design tokens needed in globals.css. |
| UI-05 | Flag badges use semantic color system consistently with WCAG AA contrast | Existing tokens meet AA. New under_review and resolved tokens must also meet AA. Research provides specific color values. |
| UI-09 | Audit trail / Activity tab uses clean timeline component with nurse avatars and action icons | ActivityTimeline component pattern documented with icon mapping, timestamp formatting, and nurse initial display. |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **Stack locked:** Next.js 14+ (App Router), Tailwind CSS, TypeScript, Supabase, n8n -- no additions
- **No default exports on components** -- named exports only (page components exempt)
- **`'use client'`** on all component files
- **Semantic tokens only** -- no hardcoded hex in components; all colors via globals.css `@theme inline`
- **No clsx/cn utility** -- raw template literal string concatenation for conditional classes
- **WCAG 2.1 AA** -- non-negotiable; contrast, keyboard nav, semantic HTML, ARIA
- **Sonner toasts** on every persisted action (established Phase 1 pattern)
- **Direct Supabase writes** from components for nurse actions (not n8n round-trip)
- **Interface for object shapes, type for unions** -- e.g., `interface AuditLogEntry`, `type ReviewStatus = '...'`
- **Props interface named `{ComponentName}Props`** immediately above component
- **No semicolons, 2-space indent, single quotes, trailing commas**

## Standard Stack

### Core (Already Installed -- No New Dependencies)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@supabase/supabase-js` | ^2.98.0 | Database reads/writes for audit_log | Already in use for all data operations |
| `next` | 16.1.6 | App framework | Already installed |
| `react` | 19.2.3 | UI rendering | Already installed |
| `tailwindcss` | ^4 | Styling with semantic tokens | Already installed |
| `sonner` | (installed) | Toast notifications | Already used in Phase 1 |

### No New Dependencies Required

Phase 2 requires zero new npm packages. All work is accomplished with:
- Supabase JS client (existing) for audit_log reads and app-level inserts
- Postgres trigger function (SQL migration) for automatic audit entries on review_status changes
- React components with Tailwind (existing patterns)

**Installation:** None needed.

## Architecture Patterns

### Database Layer

#### audit_log Table (Migration 003)

```sql
-- Source: D-03 from CONTEXT.md
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  nurse_name TEXT NOT NULL,
  action_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS per D-05
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read access to audit_log"
  ON public.audit_log FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon insert audit_log"
  ON public.audit_log FOR INSERT TO anon WITH CHECK (true);

-- No UPDATE or DELETE policies -- immutable audit records
```

#### Postgres Trigger on notes.review_status (D-01, D-02)

```sql
-- Trigger function: fires on UPDATE to notes when review_status changes
CREATE OR REPLACE FUNCTION log_review_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.review_status IS DISTINCT FROM NEW.review_status THEN
    INSERT INTO public.audit_log (patient_id, nurse_name, action_type, metadata)
    VALUES (
      NEW.patient_id,
      COALESCE(NEW.reviewed_by, 'system'),
      NEW.review_status,
      jsonb_build_object(
        'note_id', NEW.id,
        'previous_status', OLD.review_status,
        'new_status', NEW.review_status,
        'flag_reason', NEW.flag_reason
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notes_review_status
  AFTER UPDATE ON public.notes
  FOR EACH ROW
  EXECUTE FUNCTION log_review_status_change();
```

**Key design choice:** The trigger uses `COALESCE(NEW.reviewed_by, 'system')` because the NurseActionBar already writes `reviewed_by` in the same UPDATE that changes `review_status`. The trigger reads the nurse name from the row itself, avoiding the need for Postgres session variables.

#### Review Status Extension

Current `review_status` values: `'pending' | 'approved' | 'escalated' | 'overridden'`

Extended values: `'pending' | 'approved' | 'escalated' | 'overridden' | 'under_review' | 'resolved'`

No migration needed for the column itself (it is TEXT, not ENUM -- per Phase 1 D-06). Only TypeScript types need updating.

### Review State Machine

Recommended transition rules:

```
pending -----> approved       (nurse approves unflagged or mildly flagged note)
pending -----> escalated      (nurse escalates to higher authority)
pending -----> overridden     (nurse overrides AI flag with clinical judgment)
pending -----> under_review   (nurse begins active review of flagged note)
under_review -> resolved      (nurse completes review and resolves the flag)
under_review -> escalated     (nurse decides to escalate during review)
escalated ---> resolved       (escalation is addressed and resolved)
```

States that cannot transition:
- `approved` is terminal
- `overridden` is terminal
- `resolved` is terminal

This gives the demo a visible three-step flow for Devon Clarke (flagged -> under_review -> resolved) while keeping the existing approve/escalate/override paths working unchanged.

### Component Integration Points

```
src/
  components/
    NurseActionBar.tsx     # ADD: under_review + resolved buttons; trigger handles audit
    FlagBadge.tsx          # ADD: under_review + resolved badge types
    SupplyChecklist.tsx    # ADD: app-level audit insert on confirm-supply
    ActivityTimeline.tsx   # NEW: chronological audit log display
    DictationInput.tsx     # ADD: app-level audit insert on create-note (in parent callback)
  app/
    patient/[id]/page.tsx  # ADD: Activity tab, audit_log fetch, generate-handoff audit insert
  lib/
    types.ts              # ADD: AuditLogEntry interface, extended ReviewStatus type
    audit.ts              # NEW: insertAuditEntry() helper function
    format-time.ts        # REUSE: existing timestamp formatters
  app/
    globals.css           # ADD: under_review and resolved color tokens
```

### Pattern: Audit Insert Helper

```typescript
// src/lib/audit.ts
import { supabase } from '@/lib/supabase'

interface AuditInsertParams {
  patientId: string
  nurseName: string
  actionType: string
  metadata: Record<string, unknown>
}

export async function insertAuditEntry({
  patientId,
  nurseName,
  actionType,
  metadata,
}: AuditInsertParams): Promise<void> {
  const { error } = await supabase
    .from('audit_log')
    .insert({
      patient_id: patientId,
      nurse_name: nurseName,
      action_type: actionType,
      metadata,
    })

  if (error) {
    console.error('Audit log insert failed:', error)
    // Audit failures should not block the primary action
    // but should be visible in development
  }
}
```

**Critical pattern:** Audit inserts are fire-and-forget from the UI perspective. A failed audit insert must NOT block the primary nurse action (approve, confirm supply, etc.). The trigger-based audit for review_status changes is guaranteed by Postgres and cannot fail independently of the UPDATE.

### Pattern: NurseActionBar Extension

The existing NurseActionBar needs two additions:
1. An "Under Review" button (shown when `review_status === 'pending'` and `note.flagged === true`)
2. A "Resolve" button (shown when `review_status === 'under_review'` or `review_status === 'escalated'`)

The trigger automatically creates the audit entry when review_status changes, so no manual audit insert is needed in NurseActionBar for status transitions.

### Pattern: Activity Tab Timeline

```typescript
// src/components/ActivityTimeline.tsx
interface AuditLogEntry {
  id: string
  patient_id: string
  nurse_name: string
  action_type: string
  metadata: Record<string, unknown>
  created_at: string
}

interface ActivityTimelineProps {
  entries: AuditLogEntry[]
}
```

Timeline entries should display:
- Nurse initials in a small circle (derived from nurse_name, lookup against NURSES constant)
- Action description (human-readable from action_type + metadata)
- Relative timestamp (reuse formatNoteTimestamp)
- Action-specific icon (approve = checkmark, escalate = arrow up, flag = triangle, etc.)

### Anti-Patterns to Avoid

- **Double-writing audit for review_status changes:** The trigger handles this. Do NOT also insert from NurseActionBar for approve/escalate/override/under_review/resolved -- that would create duplicate entries.
- **Blocking on audit failures:** App-level audit inserts must not use `await` in a way that blocks the primary action's UI feedback. Insert after the primary action succeeds, and do not revert the primary action if audit fails.
- **Using the trigger for all action types:** The trigger only fires on notes.review_status UPDATE. Supply confirmation, handoff generation, and note creation are app-level inserts -- do not try to route them through the trigger.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Audit log immutability | Application-level delete prevention | Postgres RLS (no DELETE policy) | RLS cannot be bypassed by frontend code |
| Review status change logging | Manual INSERT in every component | Postgres AFTER UPDATE trigger | Trigger fires regardless of which client updates the row |
| Timestamp generation | `new Date().toISOString()` in JS | `DEFAULT now()` in Postgres | Server-side timestamps are authoritative; client clocks may drift |
| UUID generation | `crypto.randomUUID()` in JS | `DEFAULT gen_random_uuid()` in Postgres | Consistent with existing table patterns |

## Common Pitfalls

### Pitfall 1: Duplicate Audit Entries for Review Status Changes
**What goes wrong:** NurseActionBar inserts an audit entry AND the trigger fires, creating two entries for the same action.
**Why it happens:** Developer forgets that the trigger already handles review_status changes.
**How to avoid:** NurseActionBar should NOT call `insertAuditEntry()` for approve/escalate/override/under_review/resolved. Only the Postgres trigger writes these. App-level inserts are only for: confirm-supply, generate-handoff, create-note.
**Warning signs:** Activity tab shows paired entries with identical timestamps for the same action.

### Pitfall 2: Trigger Reads Stale reviewed_by
**What goes wrong:** The trigger fires but `NEW.reviewed_by` is NULL because the UPDATE set `review_status` but forgot to also set `reviewed_by` in the same statement.
**Why it happens:** If someone adds a code path that updates review_status without also setting reviewed_by.
**How to avoid:** Ensure every UPDATE to review_status also sets reviewed_by and reviewed_at in the same Supabase .update() call. The existing NurseActionBar pattern already does this correctly.
**Warning signs:** Audit entries show nurse_name = 'system' for actions that should have a nurse name.

### Pitfall 3: Tab Type Not Extended
**What goes wrong:** Adding 'activity' to the Tab type union but forgetting to update the tabs array, the tab rendering logic, or the ARIA attributes.
**Why it happens:** The tab system has three separate places that must stay in sync: the type, the array, and the rendering switch.
**How to avoid:** Update all three in a single commit. The type is `type Tab = 'notes' | 'supplies' | 'handoff'` on line 17 of page.tsx. The tabs array is on line 145. The rendering is in the `<div className="space-y-4">` block starting at line 253.
**Warning signs:** TypeScript compilation error or Activity tab shows blank content.

### Pitfall 4: FlagBadge Prop Type Mismatch
**What goes wrong:** FlagBadge expects `type: 'safe' | 'warning' | 'critical'` but now needs `'under_review' | 'resolved'` too.
**Why it happens:** The FlagBadge type is narrowly defined and StructuredNote.tsx computes flagType from the note data.
**How to avoid:** Extend FlagBadgeProps type, add config entries for the new types, and update StructuredNote.tsx to compute the badge type from review_status (not just flagged boolean).
**Warning signs:** TypeScript error on FlagBadge `type` prop.

### Pitfall 5: Missing patient_id in Audit Entries
**What goes wrong:** Some components (SupplyChecklist) don't currently receive patient_id as a prop, so the audit insert cannot populate the required field.
**Why it happens:** SupplyChecklist was designed before audit logging was a concern.
**How to avoid:** Thread patient_id through to SupplyChecklist via props. The parent page already has it.
**Warning signs:** Supabase insert error (NOT NULL violation on patient_id).

## Code Examples

### Extended Review Status Type

```typescript
// src/lib/types.ts addition
export type ReviewStatus = 'pending' | 'approved' | 'escalated' | 'overridden' | 'under_review' | 'resolved'

export interface AuditLogEntry {
  id: string
  patient_id: string
  nurse_name: string
  action_type: string
  metadata: Record<string, unknown>
  created_at: string
}
```

### FlagBadge Extension

```typescript
// New config entries for FlagBadge
// under_review: blue tint (clinical, in-progress feel)
// resolved: green (same as safe, indicating resolution)
const config = {
  safe: { bg: 'bg-flag-safe-bg', text: 'text-flag-safe', dot: 'bg-flag-safe', defaultLabel: 'Clear' },
  warning: { bg: 'bg-flag-warning-bg', text: 'text-flag-warning', dot: 'bg-flag-warning', defaultLabel: 'Flagged' },
  critical: { bg: 'bg-flag-critical-bg', text: 'text-flag-critical', dot: 'bg-flag-critical', defaultLabel: 'Critical' },
  under_review: { bg: 'bg-flag-review-bg', text: 'text-flag-review', dot: 'bg-flag-review', defaultLabel: 'Under Review' },
  resolved: { bg: 'bg-flag-safe-bg', text: 'text-flag-safe', dot: 'bg-flag-safe', defaultLabel: 'Resolved' },
}
```

### New Design Tokens for globals.css

```css
/* Under Review: blue/indigo -- clinical, active, in-progress */
--color-flag-review: #6366F1;      /* indigo-500 -- 4.5:1 contrast on white */
--color-flag-review-bg: #EEF2FF;   /* indigo-50 background */
```

The `resolved` state reuses `flag-safe` (green) tokens since resolution is semantically the same as "clear." The label distinguishes them ("Resolved" vs "Clear").

### StructuredNote Badge Logic Update

```typescript
// Current logic (simplified):
const flagType = note.flagged
  ? note.flag_reason?.toLowerCase().includes('critical') ? 'critical' : 'warning'
  : 'safe'

// Updated logic incorporating review_status:
const getBadgeType = (note: Note): FlagBadgeType => {
  if (note.review_status === 'resolved') return 'resolved'
  if (note.review_status === 'under_review') return 'under_review'
  if (note.review_status === 'approved') return 'safe'
  if (note.flagged) {
    return note.flag_reason?.toLowerCase().includes('critical') ? 'critical' : 'warning'
  }
  return 'safe'
}
```

### Activity Tab Entry Rendering Pattern

```typescript
// Action type to human-readable description mapping
const ACTION_LABELS: Record<string, (meta: Record<string, unknown>) => string> = {
  'approved': () => 'Approved flagged note',
  'escalated': () => 'Escalated note for review',
  'overridden': () => 'Overridden AI flag',
  'under_review': () => 'Marked note as under review',
  'resolved': () => 'Resolved flagged note',
  'confirm-supply': (meta) => `Confirmed supply checklist`,
  'generate-handoff': (meta) => `Generated handoff report`,
  'create-note': (meta) => `Created clinical note${meta.flagged ? ' (flagged)' : ''}`,
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `review_status` has 4 values | Extended to 6 values | Phase 2 | TypeScript union change, no DB migration needed (TEXT column) |
| FlagBadge has 3 types | Extended to 5 types | Phase 2 | New under_review and resolved visual states |
| NurseActionBar shows 3 buttons | Conditional 4-5 buttons based on current state | Phase 2 | Button visibility depends on review_status |
| No audit logging | Hybrid trigger + app-level audit | Phase 2 | New audit_log table, new trigger, new component |
| 3 tabs in patient detail | 4 tabs (+ Activity) | Phase 2 | Tab type union extended, new rendering block |

## Open Questions

1. **NurseActionBar button layout with 5 possible actions**
   - What we know: Currently 3 buttons (Approve, Escalate, Override). Phase 2 adds Under Review and Resolve.
   - What's unclear: Whether all 5 should show simultaneously or conditionally based on state.
   - Recommendation: Conditional rendering. Pending shows Approve/Escalate/Override/Under Review. Under Review shows Resolve/Escalate. This prevents overwhelming the nurse with irrelevant actions.

2. **Activity tab empty state for patients with no actions**
   - What we know: New patients or patients with only n8n-created notes might have no audit entries initially.
   - What's unclear: Whether create-note audit entries should be backfilled for existing notes.
   - Recommendation: No backfill. Empty state message: "No actions recorded yet. Actions taken on this patient will appear here." This is honest and avoids data migration complexity.

3. **confirm-supply granularity**
   - What we know: D-04 specifies `{supply_request_id, items_confirmed}` in metadata.
   - What's unclear: Whether each individual item toggle should log, or only the "Mark All Ready" action.
   - Recommendation: Log only on "Mark All Ready" (or when all items are individually confirmed). Individual toggles are too noisy for a compliance log. The audit entry captures the final confirmed state.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None installed |
| Config file | none -- see Wave 0 |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| COMP-01 | Audit entries created for all action types | manual | Verify via Supabase dashboard after each action | N/A |
| COMP-02 | Activity tab renders chronological audit trail | manual | Visual inspection in browser | N/A |
| COMP-03 | Review status state machine transitions correctly | manual | Click through state transitions, verify Supabase | N/A |
| COMP-04 | Flag badge reflects review state visually | manual | Visual inspection of badge after state change | N/A |
| UI-05 | Semantic colors have WCAG AA contrast | manual | Browser dev tools contrast checker | N/A |
| UI-09 | Timeline displays nurse names, icons, timestamps | manual | Visual inspection of Activity tab | N/A |

### Sampling Rate
- **Per task commit:** `cd src && npx next lint` (TypeScript compilation + ESLint)
- **Per wave merge:** Manual walkthrough of all three demo scenarios with audit verification
- **Phase gate:** All three scenarios produce correct audit entries visible in Activity tab

### Wave 0 Gaps
- No automated test framework exists. Given the demo-only nature of this project and the hard deadline, manual verification via browser and Supabase dashboard is the pragmatic approach.
- TypeScript compilation (`npx next lint`) serves as the automated safety net for type errors.

## Sources

### Primary (HIGH confidence)
- Project codebase direct inspection -- all component files, migration files, type definitions, and page components read and analyzed
- CONTEXT.md decisions D-01 through D-05 -- locked implementation decisions from user discussion
- REQUIREMENTS.md -- full requirement text for COMP-01 through COMP-04, UI-05, UI-09

### Secondary (MEDIUM confidence)
- Supabase Postgres trigger documentation (standard Postgres trigger patterns) -- trigger syntax is standard PostgreSQL, not Supabase-specific
- Tailwind CSS v4 custom theme configuration -- tokens defined in `@theme inline` block in globals.css

### Tertiary (LOW confidence)
- WCAG AA contrast ratios for proposed indigo under_review token (#6366F1 on white) -- needs browser-level verification. Calculated as approximately 4.5:1, which meets AA for normal text. Should be confirmed with a contrast checker tool during implementation.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies, all existing libraries well-understood from Phase 1
- Architecture: HIGH -- trigger + app-level insert pattern is well-defined by locked decisions; component integration points identified precisely
- Pitfalls: HIGH -- all pitfalls derived from direct code inspection of the files that will be modified

**Research date:** 2026-03-27
**Valid until:** 2026-04-27 (stable -- no dependency changes expected)
