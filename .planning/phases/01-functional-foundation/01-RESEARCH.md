# Phase 1: Functional Foundation - Research

**Researched:** 2026-03-26
**Domain:** Supabase persistence, React Context state management, toast notifications, n8n webhook integration
**Confidence:** HIGH

## Summary

Phase 1 converts a visually complete but stateless demo into a system where every nurse interaction persists to the database and is attributed to a named nurse identity. The work falls into five categories: (1) nurse identity via React Context + localStorage, (2) Supabase schema migrations adding columns and UPDATE RLS policies, (3) wiring existing UI components to Supabase writes, (4) adding a free-form dictation path alongside the existing typewriter mode, and (5) installing Sonner for toast feedback.

The existing codebase is well-structured with clear patterns. All components are `'use client'`, all data fetching uses the Supabase JS client directly, and the design system tokens are already in place. The main technical risks are: ensuring the n8n webhook response includes the note ID for supply request linking (FOUND-05), and handling the layout.tsx constraint that it is currently a server component but needs to render a client-side NurseContext provider and dropdown.

**Primary recommendation:** Execute in strict dependency order -- schema migrations first, then nurse identity context, then persistence wiring, then dictation mode expansion, then toast integration last. FOUND-01 (nurse identity) must land before FOUND-02/03/04 because persistence writes need a `nurse_name` field.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Nurse switcher lives in the page header bar as a dropdown, top-right position. Matches the `[Nurse]` slot already defined in the design system layout.
- **D-02:** Two hardcoded demo nurses: Sarah Chen (Night Shift) and Marcus Webb (Morning Shift). No nurse table needed -- identity is a frontend-only concept for the demo.
- **D-03:** Selected nurse persists via localStorage, hydrated into a React Context provider on mount. Default: Sarah Chen (Night).
- **D-04:** Switching nurse auto-sets the shift context (Sarah = Night, Marcus = Morning). One dropdown controls both identity and shift.
- **D-05:** If dictation is animating or processing when the nurse tries to switch, show a confirmation prompt: "Switching nurse will discard current dictation. Continue?" Otherwise switch silently.
- **D-06:** Add three columns to the existing `notes` table: `review_status` (TEXT, DEFAULT 'pending'), `reviewed_by` (TEXT), `reviewed_at` (TIMESTAMPTZ). No separate actions table.
- **D-07:** Valid review_status values: 'pending', 'approved', 'escalated', 'overridden'.
- **D-08:** Nurse action writes (approve/escalate/override) go directly from the frontend via Supabase JS client `update()`. No n8n round-trip for these mutations.
- **D-09:** Add UPDATE RLS policy on `notes` table to allow anon role to update `review_status`, `reviewed_by`, `reviewed_at` columns.
- **D-10:** Add `confirmed_items` (JSONB) column to `supply_requests` table to track per-item confirmation state. Stores a map of item index to boolean.
- **D-11:** Add UPDATE RLS policy on `supply_requests` table. Frontend writes confirmation state directly via Supabase JS client.
- **D-12:** Dropdown selector above the textarea with options: demo scripts (per-patient, labeled by scenario name) and "Free-form entry" option, separated by a visual divider.
- **D-13:** Selecting a demo script populates the textarea and enables the "Begin Dictation" button for typewriter animation.
- **D-14:** Selecting "Free-form entry" gives an empty, fully editable textarea with a "Submit Note" button (no typewriter animation). Standard text input behavior.
- **D-15:** Install Sonner for toast notifications. Position: bottom-right. Success toasts auto-dismiss after 4 seconds. Error toasts persist until manually dismissed.
- **D-16:** All persisted actions get confirmation toasts: approve/escalate/override, supply item confirmation, "Mark All Ready", handoff report generated.
- **D-17:** Webhook errors (dictation submit, handoff generation) show BOTH an inline red alert in the originating component AND a persistent error toast. Belt-and-suspenders for clinical visibility.
- **D-18:** Add `note_id` FK column to `supply_requests` table. When a note triggers supply generation, the response includes the note ID and the supply request is linked directly -- replacing the current timestamp-proximity correlation.
- **D-19:** Add `stable_items` (JSONB) and `recommended_first_actions` (JSONB) columns to `handoff_reports` table so these fields persist across page refresh (currently lost in React state only).
- **D-20:** Manual verification only for Phase 1. Run all three demo scenarios end-to-end, check Supabase records directly, confirm state survives page refresh. No test framework added in this phase.

### Claude's Discretion
- Exact dropdown component styling (within design system constraints)
- NurseContext provider implementation details
- Migration SQL ordering and naming
- Toast message copy (e.g., "Note approved by Sarah Chen" vs "Note approved")
- Loading/disabled states during Supabase writes

### Deferred Ideas (OUT OF SCOPE)
- Audit trail / action history log (separate table tracking all state changes) -- could be Phase 3 or backlog
- Real authentication / nurse login -- out of scope for demo project
- Undo for nurse actions (e.g., un-approve a note) -- not needed for demo flow
- Test framework installation -- Phase 3+ concern
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FOUND-01 | Nurse can switch active identity via dropdown and all subsequent actions are attributed to the selected nurse | React Context + localStorage pattern; layout.tsx server/client boundary handling; NurseContext provider wrapping |
| FOUND-02 | Nurse can approve a flagged note and the approval persists to Supabase | Supabase JS `update()` on `notes` table; UPDATE RLS policy; `review_status`/`reviewed_by`/`reviewed_at` columns |
| FOUND-03 | Nurse can escalate a flagged note and the escalation persists to Supabase | Same persistence pattern as FOUND-02, different `review_status` value |
| FOUND-04 | Nurse can override a flagged note and the override persists to Supabase | Same persistence pattern as FOUND-02, different `review_status` value |
| FOUND-05 | Supply requests linked to notes via note_id FK | n8n webhook response must be updated to include note ID from N6 Supabase response; `note_id` column added to `supply_requests` |
| FOUND-06 | Handoff report extras persist to Supabase and display on page reload | `stable_items` and `recommended_first_actions` JSONB columns on `handoff_reports`; n8n N9b node must save these fields; frontend reads from DB instead of React state |
| FOUND-07 | Supply checklist confirmation state persists to Supabase | `confirmed_items` JSONB column on `supply_requests`; Supabase JS `update()` on toggle/mark-all; UPDATE RLS policy |
| FOUND-08 | Dictation input supports both pre-scripted and free-form text entry | DictationInput refactor: mode selector dropdown, conditional typewriter vs direct submit, free-form textarea editing |
| UI-07 | Error states display actionable feedback when webhook calls fail | Inline error alerts (already partially exist) + persistent Sonner error toast + retry button |
| UI-08 | Toast notifications for nurse actions confirming persistence | Sonner `<Toaster />` in layout, `toast.success()`/`toast.error()` calls at persistence points |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/supabase-js | ^2.98.0 | Database reads and writes | Already installed; `update()` method handles all persistence needs |
| sonner | 2.0.7 | Toast notifications | Decision D-15; lightweight, works with React 19 and Next.js App Router; no provider needed |
| react (Context API) | 19.2.3 | Nurse identity state | Already installed; Context + localStorage is the standard pattern for cross-component demo state |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next | 16.1.6 | App Router, layout.tsx | Already installed; layout boundary handling for context provider |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Sonner | react-hot-toast | Sonner is the locked decision (D-15); better API, position control, auto-dismiss config |
| React Context | Zustand | Overkill for two nurses; Context is the established pattern in this codebase |

**Installation:**
```bash
cd src && npm install sonner
```

**Version verification:** Sonner 2.0.7 confirmed via `npm view sonner version` on 2026-03-26. Peer dependencies: `react ^18.0.0 || ^19.0.0` -- compatible with React 19.2.3.

## Architecture Patterns

### Recommended Project Structure
```
src/
  contexts/
    NurseContext.tsx       # React Context provider + useNurse hook
  components/
    NurseSwitcher.tsx      # Header dropdown component (new)
    NurseActionBar.tsx     # Modified: Supabase writes + toast
    DictationInput.tsx     # Modified: mode selector + free-form
    SupplyChecklist.tsx    # Modified: Supabase confirmation writes
    HandoffReport.tsx      # Modified: reads extras from DB
    StructuredNote.tsx     # Modified: reads review_status from DB
  app/
    layout.tsx             # Modified: NurseProvider wrapper + Toaster
    patient/[id]/page.tsx  # Modified: uses NurseContext, removes handoffExtras state
  lib/
    types.ts               # Modified: new fields on Note, SupplyRequest, HandoffReport
```

### Pattern 1: React Context for Nurse Identity
**What:** A `NurseContext` providing `{ nurseName, shift, setNurse }` to all components, persisted to localStorage.
**When to use:** Every component that needs nurse attribution (DictationInput, NurseActionBar, patient detail page, handoff generation).
**Example:**
```typescript
// src/contexts/NurseContext.tsx
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface NurseIdentity {
  name: string
  initials: string
  shift: string
}

const NURSES: Record<string, NurseIdentity> = {
  'Sarah Chen': { name: 'Sarah Chen', initials: 'SC', shift: 'Night' },
  'Marcus Webb': { name: 'Marcus Webb', initials: 'MW', shift: 'Morning' },
}

interface NurseContextValue {
  nurse: NurseIdentity
  setNurse: (name: string) => void
}

const NurseContext = createContext<NurseContextValue | null>(null)

export function NurseProvider({ children }: { children: ReactNode }) {
  const [nurse, setNurseState] = useState<NurseIdentity>(NURSES['Sarah Chen'])

  useEffect(() => {
    const saved = localStorage.getItem('nurse_name')
    if (saved && NURSES[saved]) {
      setNurseState(NURSES[saved])
    }
  }, [])

  const setNurse = (name: string) => {
    if (NURSES[name]) {
      setNurseState(NURSES[name])
      localStorage.setItem('nurse_name', name)
    }
  }

  return (
    <NurseContext.Provider value={{ nurse, setNurse }}>
      {children}
    </NurseContext.Provider>
  )
}

export function useNurse() {
  const ctx = useContext(NurseContext)
  if (!ctx) throw new Error('useNurse must be used within NurseProvider')
  return ctx
}
```

### Pattern 2: Server/Client Boundary in layout.tsx
**What:** The root `layout.tsx` is currently a server component (no `'use client'` directive). NurseProvider is a client component. The pattern is to keep layout.tsx as a server component and import the client NurseProvider as a wrapper around `{children}`.
**When to use:** When adding client-side context providers to App Router layouts.
**Example:**
```typescript
// layout.tsx stays a server component
import { NurseProvider } from '@/contexts/NurseContext'
import { NurseSwitcher } from '@/components/NurseSwitcher'
import { Toaster } from 'sonner'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NurseProvider>
          <header>
            {/* ... existing header content ... */}
            <NurseSwitcher />
          </header>
          <main>{children}</main>
          <Toaster position="bottom-right" />
        </NurseProvider>
      </body>
    </html>
  )
}
```
**Critical note:** `<Toaster />` from Sonner can be placed in server components -- it renders a client-side portal internally. However, since we are wrapping with `NurseProvider` (a client component), everything inside it becomes client-rendered anyway. The `NurseSwitcher` component must be a separate `'use client'` component that calls `useNurse()`.

### Pattern 3: Supabase Direct UPDATE from Frontend
**What:** Using `supabase.from('table').update({...}).eq('id', id)` for persistence writes.
**When to use:** For nurse actions (approve/escalate/override), supply confirmation, any frontend-initiated state changes.
**Example:**
```typescript
// Approve a note
const { error } = await supabase
  .from('notes')
  .update({
    review_status: 'approved',
    reviewed_by: nurse.name,
    reviewed_at: new Date().toISOString(),
  })
  .eq('id', noteId)

if (error) {
  toast.error('Failed to save approval')
} else {
  toast.success(`Note approved by ${nurse.name}`)
}
```

### Pattern 4: Sonner Toast Integration
**What:** Import `toast` from `sonner` in any client component and call it directly. No provider needed beyond the `<Toaster />` component.
**When to use:** After every persisted action and on every error.
**Example:**
```typescript
import { toast } from 'sonner'

// Success
toast.success('Note approved by Sarah Chen')

// Error (persistent until dismissed)
toast.error('Failed to process dictation. Check that n8n is running.', {
  duration: Infinity,
})

// With action
toast.error('Webhook failed', {
  duration: Infinity,
  action: {
    label: 'Retry',
    onClick: () => retrySubmission(),
  },
})
```

### Anti-Patterns to Avoid
- **Do not add `'use client'` to layout.tsx.** It is the only server component in the app. Keep it that way. Import client components into it.
- **Do not create a separate actions table for review status.** Decision D-06 locks this to three columns on the existing `notes` table.
- **Do not route action persistence through n8n.** Decision D-08 says direct Supabase writes from the frontend. Only note structuring and report generation go through n8n.
- **Do not use `clsx` or `cn` utility.** The codebase uses raw template literal string concatenation for conditional classes. Stay consistent.
- **Do not use default exports for components.** Only page components use default exports; all other components use named exports.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Toast notifications | Custom toast component | Sonner 2.0.7 | Position control, auto-dismiss, persistent error toasts, accessible, works with React 19 |
| localStorage sync | Manual localStorage read/write with event listeners | React Context + useEffect hydration | Simple enough for two demo nurses; no SSR issues with useEffect mount pattern |
| Supabase RLS policies | Application-level permission checks | Postgres RLS UPDATE policies | The database enforces access; frontend code cannot bypass it |

**Key insight:** This phase is about wiring existing UI to persistence, not building new UI. Every component already exists and renders correctly -- the work is adding database writes and reading persisted state back on load.

## Common Pitfalls

### Pitfall 1: Hydration Mismatch with localStorage
**What goes wrong:** Reading localStorage during SSR/initial render causes hydration mismatch because the server has no localStorage.
**Why it happens:** React 19 with Next.js App Router renders components on the server first, then hydrates on the client.
**How to avoid:** Initialize NurseContext with the default value (Sarah Chen). Read localStorage in a `useEffect` (client-only) and update state. The brief flash of default-to-actual is acceptable for a demo.
**Warning signs:** Console warning about hydration mismatch; nurse name flickers on page load.

### Pitfall 2: layout.tsx Becoming a Client Component
**What goes wrong:** Adding `'use client'` to layout.tsx or importing a hook directly into it forces the entire app shell into client rendering, breaking metadata export.
**Why it happens:** The `NurseProvider` uses hooks, so it must be `'use client'`. The layout must import it but NOT become a client component itself.
**How to avoid:** Keep layout.tsx as a server component. Import the `NurseProvider` (a client component) and render it as a child wrapper. Next.js handles the server/client boundary at the import.
**Warning signs:** Build error about `metadata` export not being allowed in client components.

### Pitfall 3: Supabase UPDATE Returning No Data
**What goes wrong:** `supabase.from('notes').update({...}).eq('id', noteId)` returns `{ data: null }` even on success if the RLS policy is wrong or the row does not exist.
**Why it happens:** Supabase silently returns empty when RLS blocks the operation or the filter matches no rows.
**How to avoid:** Always check for `error` in the response. Also verify the UPDATE RLS policy is in place before testing. Use `select()` after `update()` if you need the returned data: `.update({...}).eq('id', noteId).select()`.
**Warning signs:** No error, no data, UI shows success but database unchanged.

### Pitfall 4: n8n Webhook Response Missing note_id
**What goes wrong:** The current N10 Webhook Response node builds its JSON from `N5 Parse Claude Response`, which has no note ID. The note ID comes from `N6 Save Note to Supabase`'s response (via `Prefer: return=representation`).
**Why it happens:** The webhook response was written before note_id linking was a requirement. N6 returns the full saved row including `id`, but N10 does not reference it.
**How to avoid:** Update N10's `responseBody` to include `note_id: $('N6 Save Note to Supabase').item.json[0].id` in the result payload. Also update N9a Save Supply Request to include the note_id in its insert body.
**Warning signs:** Supply requests created without `note_id`; `note_id` column is always null.

### Pitfall 5: n8n Handoff Save Missing Fields
**What goes wrong:** N9b Save Handoff Report currently only saves `summary`, `flags`, `shift_start`, `patient_id`, and `incoming_nurse`. It does not save `stable_items` or `recommended_first_actions` because those fields do not exist in the DB yet.
**Why it happens:** The handoff report table was designed before persistence of all Claude response fields was required.
**How to avoid:** After adding the columns via migration, update the N9b node's `jsonBody` to include `stable_items` and `recommended_first_actions` parsed from the Claude response.
**Warning signs:** Handoff report loads with summary and flags but empty stable items and recommended actions after page refresh.

### Pitfall 6: Supply Confirmation State Shape
**What goes wrong:** The `confirmed_items` JSONB column stores `{ "0": true, "1": false, ... }` (index-keyed map). If the supply list items change order or count, the confirmation state becomes invalid.
**Why it happens:** Items are identified by array index, not by unique ID.
**How to avoid:** This is acceptable for the demo (supply items are immutable after generation). Document the assumption. Do not allow supply list editing in Phase 1.
**Warning signs:** Confirmation checkboxes misaligned after any theoretical item reorder (not a real risk in demo).

### Pitfall 7: Sonner Styling Conflict with Tailwind v4
**What goes wrong:** Sonner's default styles may not match the clinical design system tokens.
**Why it happens:** Sonner ships with its own CSS that may conflict with Tailwind v4's CSS layer ordering.
**How to avoid:** Use Sonner's `toastOptions` prop on `<Toaster />` to apply custom class names. Or use Sonner's `unstyled` mode and style with Tailwind classes matching the design system. The simplest path is using Sonner's built-in theming (`theme="light"`) and letting it handle its own styles -- they are clean enough for a clinical demo.
**Warning signs:** Toast text color, background, or border does not match the rest of the UI.

## Code Examples

### Supabase UPDATE for Note Review Status
```typescript
// In NurseActionBar.tsx (after refactor)
import { supabase } from '@/lib/supabase'
import { useNurse } from '@/contexts/NurseContext'
import { toast } from 'sonner'

const { nurse } = useNurse()

const handleAction = async (action: 'approve' | 'escalate' | 'override') => {
  const reviewStatus = action === 'approve' ? 'approved'
    : action === 'escalate' ? 'escalated'
    : 'overridden'

  const { error } = await supabase
    .from('notes')
    .update({
      review_status: reviewStatus,
      reviewed_by: nurse.name,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', noteId)

  if (error) {
    toast.error(`Failed to ${action} note`)
    return
  }

  setActed(action)
  toast.success(`Note ${reviewStatus} by ${nurse.name}`)
  onAction(action)
}
```

### Supabase UPDATE for Supply Confirmation
```typescript
// In SupplyChecklist.tsx (after refactor)
const toggleItem = async (index: number) => {
  const newConfirmed = { ...confirmed, [index]: !confirmed[index] }
  setConfirmed(newConfirmed)

  const { error } = await supabase
    .from('supply_requests')
    .update({ confirmed_items: newConfirmed })
    .eq('id', supplyRequestId)

  if (error) {
    // Revert optimistic update
    setConfirmed(confirmed)
    toast.error('Failed to save confirmation')
  }
}
```

### SQL Migration for Phase 1
```sql
-- 002_phase1_persistence.sql

-- Notes: add review columns
ALTER TABLE public.notes
  ADD COLUMN review_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN reviewed_by TEXT,
  ADD COLUMN reviewed_at TIMESTAMPTZ;

-- Supply requests: add confirmation tracking and note linkage
ALTER TABLE public.supply_requests
  ADD COLUMN confirmed_items JSONB DEFAULT '{}',
  ADD COLUMN note_id UUID REFERENCES public.notes(id);

-- Handoff reports: add missing fields for full persistence
ALTER TABLE public.handoff_reports
  ADD COLUMN stable_items JSONB DEFAULT '[]',
  ADD COLUMN recommended_first_actions JSONB DEFAULT '[]';

-- UPDATE policies
CREATE POLICY "Allow anon update review status on notes"
  ON public.notes
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon update confirmed_items on supply_requests"
  ON public.supply_requests
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);
```

### TypeScript Type Updates
```typescript
// Updated interfaces for src/lib/types.ts

export interface Note {
  id: string
  patient_id: string
  raw_input: string
  structured_note: StructuredNote
  shift: string
  nurse_name: string
  flagged: boolean
  flag_reason: string
  created_at: string
  review_status: 'pending' | 'approved' | 'escalated' | 'overridden'
  reviewed_by: string | null
  reviewed_at: string | null
}

export interface SupplyRequest {
  id: string
  patient_id: string
  procedure: string
  items: SupplyItem[]
  generated_at: string
  confirmed_by: string | null
  confirmed_items: Record<number, boolean>
  note_id: string | null
}

export interface HandoffReport {
  id: string
  patient_id: string
  incoming_nurse: string
  summary: string
  flags: PriorityFlag[]
  generated_at: string
  shift_start: string
  stable_items: string[]
  recommended_first_actions: string[]
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Sonner 1.x `<Toaster />` required provider | Sonner 2.x standalone `<Toaster />` + `toast()` import | 2025 | Simpler setup; no wrapping provider needed |
| `@supabase/supabase-js` 1.x chained methods | v2 unified `.from().update().eq().select()` | 2023 | Consistent API for reads and writes |
| Next.js pages router context pattern | App Router: server layout imports client provider | 2023+ | Must keep layout as server component; client providers imported as components |

**Deprecated/outdated:**
- The `console.log` on NurseActionBar line 156 is the current "action handler" -- this is the exact line that gets replaced with Supabase writes.

## Open Questions

1. **n8n Workflow Modification for note_id**
   - What we know: N6 Save Note returns the full row including `id` via `Prefer: return=representation`. N10 Webhook Response does not currently include it.
   - What's unclear: Whether modifying the N10 response body expression is sufficient or if data flow between N6 and N10 requires intermediate node changes (N7 Router may not pass N6's output through).
   - Recommendation: Trace the n8n data flow from N6 through N7 Router to N9a and N10. The N10 expression `$('N6 Save Note to Supabase').item.json` should be accessible if the data propagates. Test by checking what `$('N6 Save Note to Supabase').item.json` contains at the N10 node.

2. **N9b Handoff Report Field Extraction**
   - What we know: N9b currently parses `report.summary` and `report.priority_flags` from Claude's response. It needs to also extract `report.stable_items` and `report.recommended_first_actions`.
   - What's unclear: Whether Claude's handoff prompt consistently returns these fields (the prompt template includes them but actual responses may vary).
   - Recommendation: The extraction is straightforward -- add the fields to the N9b `jsonBody` expression. If Claude omits them, they default to `[]` in the DB.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None (D-20: manual verification only for Phase 1) |
| Config file | none |
| Quick run command | Manual: run demo scenarios in browser, check Supabase dashboard |
| Full suite command | Manual: all three scenarios end-to-end with refresh checks |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUND-01 | Nurse dropdown switches identity, persists across refresh | manual | Browser: switch nurse, refresh, verify dropdown shows last selection | N/A |
| FOUND-02 | Approve persists to Supabase | manual | Browser: approve note, refresh, verify badge shows "Approved" | N/A |
| FOUND-03 | Escalate persists to Supabase | manual | Browser: escalate note, refresh, verify badge shows "Escalated" | N/A |
| FOUND-04 | Override persists to Supabase | manual | Browser: override note, refresh, verify badge shows "Overridden" | N/A |
| FOUND-05 | Supply requests linked via note_id | manual | Supabase dashboard: check `note_id` column is non-null after note+supply creation | N/A |
| FOUND-06 | Handoff extras persist | manual | Browser: generate handoff, refresh, verify stable items and recommended actions visible | N/A |
| FOUND-07 | Supply confirmation persists | manual | Browser: confirm items, refresh, verify checkboxes remain checked | N/A |
| FOUND-08 | Free-form dictation produces SOAP note | manual | Browser: select free-form, type text, submit, verify structured note appears | N/A |
| UI-07 | Error states with actionable feedback | manual | Browser: stop n8n, attempt dictation, verify error message + retry button | N/A |
| UI-08 | Toast notifications on actions | manual | Browser: approve a note, verify toast appears bottom-right | N/A |

### Sampling Rate
- **Per task commit:** Manual spot check of affected behavior
- **Per wave merge:** Full three-scenario walkthrough
- **Phase gate:** All 10 requirements manually verified with page refresh survival

### Wave 0 Gaps
None -- D-20 explicitly defers test framework to Phase 3+. Manual verification only.

## Sources

### Primary (HIGH confidence)
- Codebase inspection: `src/components/NurseActionBar.tsx`, `DictationInput.tsx`, `SupplyChecklist.tsx`, `HandoffReport.tsx`, `StructuredNote.tsx`, `layout.tsx`, `patient/[id]/page.tsx`, `lib/types.ts`, `lib/supabase.ts`, `lib/demo-scripts.ts`
- Codebase inspection: `n8n-workflow.json` -- N6 Save Note (line 106-140), N9b Save Handoff (line 320-340), N10 Webhook Response (line 342-366)
- Codebase inspection: `supabase/migrations/001_enable_rls.sql` -- current RLS policies (SELECT + INSERT only)
- npm registry: `npm view sonner version` returned 2.0.7, peer deps confirmed React 18/19 compatibility

### Secondary (MEDIUM confidence)
- [Sonner GitHub](https://github.com/emilkowalski/sonner) - API reference, Toaster props, toast function signatures
- [Sonner npm](https://www.npmjs.com/package/sonner) - Version 2.0.7, peer dependencies
- [shadcn/ui Sonner docs](https://ui.shadcn.com/docs/components/radix/sonner) - Next.js App Router integration pattern

### Tertiary (LOW confidence)
- None. All findings verified against codebase and registry.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries either already installed or verified via npm registry; Sonner compatibility confirmed
- Architecture: HIGH - patterns derived directly from existing codebase conventions; server/client boundary well understood
- Pitfalls: HIGH - all pitfalls identified from actual code inspection (e.g., N10 missing note_id is verified in the workflow JSON)

**Research date:** 2026-03-26
**Valid until:** 2026-04-26 (stable -- no fast-moving dependencies)
