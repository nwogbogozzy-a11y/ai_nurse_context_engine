# Architecture Research

**Domain:** Clinical workflow web app — Next.js + Supabase + n8n + Claude API
**Researched:** 2026-03-26
**Confidence:** HIGH (existing codebase is known; patterns are well-documented and verified)

---

## Standard Architecture

### System Overview

This is an additive milestone — three new capabilities layered onto an existing client-side React app. The base architecture does not change. New components slot into defined positions.

```
┌──────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER (Next.js)                  │
│                                                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐    │
│  │  Patient     │  │  Patient     │  │  NurseActionBar      │    │
│  │  Dashboard   │  │  Detail Page │  │  (approve/escalate/  │    │
│  │  /           │  │  /patient/id │  │   override)          │    │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘    │
│         │                 │                      │                 │
│         │    ┌────────────┴──────────────────────┘                │
│         │    │                                                     │
│  ┌──────▼────▼──────┐  ┌────────────────┐  ┌───────────────────┐  │
│  │  Supabase JS     │  │  Realtime Sub  │  │  n8n Webhook      │  │
│  │  (direct reads)  │  │  useChannel()  │  │  (writes/AI proc) │  │
│  └──────┬───────────┘  └───────┬────────┘  └─────────┬─────────┘  │
└─────────┼─────────────────────┼───────────────────────┼────────────┘
          │                     │                       │
┌─────────┼─────────────────────┼───────────────────────┼────────────┐
│         │          AUTOMATION LAYER (n8n)             │            │
│         │                                             ▼            │
│         │              ┌──────────────────────────────────────┐    │
│         │              │  Main Pipeline Webhook               │    │
│         │              │  N1: Webhook → N2: Parse → N3: Fetch │    │
│         │              │  N4: Claude (structure note)         │    │
│         │              │  N5: Parse → N6: Save note           │    │
│         │              │  N7: Router → N8a: Supply / N8b: HOF │    │
│         │              │  N9a/b: Save → N10: Response         │    │
│         │              │                                      │    │
│         │              │  + NEW: N6a: Write audit_log INSERT  │    │
│         │              │  + NEW: N8c: Fetch context memory    │    │
│         │              └──────────────────────────────────────┘    │
└─────────┼──────────────────────────────────────────────────────────┘
          │
┌─────────┼──────────────────────────────────────────────────────────┐
│         │                  DATA LAYER (Supabase)                    │
│         │                                                           │
│  ┌──────▼───────┐  ┌────────────┐  ┌──────────────┐  ┌──────────┐  │
│  │  patients    │  │  notes     │  │  supply_     │  │ handoff_ │  │
│  │  (existing)  │  │  (exist.)  │  │  requests    │  │ reports  │  │
│  └──────────────┘  └────────────┘  │  (existing)  │  │ (exist.) │  │
│                                    └──────────────┘  └──────────┘  │
│  ┌──────────────────────────┐  ┌──────────────────────────────────┐ │
│  │  audit_log  (NEW)        │  │  Realtime Publication (Postgres) │ │
│  │  append-only action log  │  │  REPLICA IDENTITY FULL on notes  │ │
│  └──────────────────────────┘  └──────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| Next.js Dashboard `/` | Render patient grid; subscribe to `patients` realtime channel | Supabase JS (read), Realtime channel |
| Next.js Patient Detail `/patient/[id]` | Render notes/supplies/handoff; accept dictation; show audit log | Supabase JS (read), n8n (write), Realtime channel |
| `NurseActionBar` | Approve/escalate/override a note — must persist action to DB | n8n webhook OR direct Supabase JS INSERT to `audit_log` |
| `useRealtimeChannel` hook (new) | Subscribe to a Supabase channel for a specific table+filter; call provided callback on any event; clean up on unmount | Supabase JS realtime |
| `AuditLog` component (new) | Display audit trail for a patient — who did what, when, on which note | Supabase JS (read `audit_log`) |
| `ContextMemoryService` (n8n logic) | Before Claude note-structuring call: fetch recent notes for same patient, compress into a prior-context summary block, inject into prompt | Supabase REST (read `notes`) |
| n8n Main Pipeline | Receive nurse input, orchestrate Claude, write results | Supabase REST, Claude API |
| Supabase `audit_log` table | Append-only record of every nurse action (approve/escalate/override/flag) with actor, target note, timestamp, reason | Written by: n8n or frontend direct insert; read by: frontend |
| Supabase Realtime | Broadcast row-level changes on `notes`, `handoff_reports`, `supply_requests` to subscribed clients | Read by: frontend subscriptions |

---

## Recommended Project Structure

The existing structure is sound. Additions are minimal and localized.

```
src/
├── app/
│   ├── page.tsx                   # Dashboard — add realtime subscription
│   └── patient/[id]/
│       └── page.tsx               # Detail — add realtime + audit log tab
├── components/
│   ├── DictationInput.tsx         # Existing
│   ├── FlagBadge.tsx              # Existing
│   ├── HandoffReport.tsx          # Existing
│   ├── NurseActionBar.tsx         # Existing — wire approve/escalate/override to DB
│   ├── PatientCard.tsx            # Existing
│   ├── ProcedureSearch.tsx        # Existing
│   ├── AuditLog.tsx               # NEW — audit trail display
│   └── NurseSelector.tsx          # NEW — multi-nurse identity switcher
├── hooks/
│   └── useRealtimeChannel.ts      # NEW — reusable Supabase realtime hook
├── lib/
│   ├── types.ts                   # Existing — add AuditEntry, NurseIdentity
│   ├── demo-scripts.ts            # Existing
│   └── supabase.ts                # Existing — no changes needed
supabase/
└── migrations/
    └── 002_audit_and_realtime.sql # NEW — audit_log table + realtime publication
```

### Structure Rationale

- **`hooks/`:** Extracted to avoid repeating realtime subscription setup across Dashboard and Patient Detail. One hook, used in two places. Handles subscribe on mount, unsubscribe on unmount, and re-subscribe on filter change.
- **`components/AuditLog.tsx`:** Isolated from the main patient detail page. Reads from `audit_log` directly via Supabase JS client. No new n8n node needed.
- **`supabase/migrations/002`:** All schema changes in one migration — keeps the audit trail and realtime setup colocated and reversible.

---

## Architectural Patterns

### Pattern 1: Supabase Realtime — Table Channel Subscription

**What:** Client subscribes to a Postgres channel scoped to a specific table and optional row filter. On INSERT/UPDATE/DELETE events, a callback fires and the component re-fetches or merges the new record into local state.

**When to use:** Any place the UI currently calls `fetchData()` after a mutation. Replace the polling re-fetch with a subscription that fires on the event and triggers the same re-fetch. This makes multi-tab sync and "living context" visible.

**Trade-offs:**
- Pro: No polling, instant UI updates across tabs, demonstrates "living context" narrative
- Pro: Maps cleanly to existing `fetchData()` — subscription calls it instead of the mutation calling it
- Con: Requires `REPLICA IDENTITY FULL` on tracked tables (one SQL statement per table)
- Con: Subscription must be cleaned up on component unmount or channels accumulate

**Pattern:**
```typescript
// hooks/useRealtimeChannel.ts
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useRealtimeChannel(
  channelName: string,
  table: string,
  filter: string | undefined,  // e.g. 'patient_id=eq.some-uuid'
  onEvent: () => void
) {
  useEffect(() => {
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table, filter },
        () => onEvent()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [channelName, table, filter, onEvent])
}

// Usage in patient detail page:
useRealtimeChannel(
  `notes-${patientId}`,
  'notes',
  `patient_id=eq.${patientId}`,
  fetchData
)
```

**Required Supabase setup:**
```sql
-- Run once per table to be tracked
ALTER TABLE notes REPLICA IDENTITY FULL;
ALTER TABLE handoff_reports REPLICA IDENTITY FULL;
ALTER TABLE supply_requests REPLICA IDENTITY FULL;

-- Enable realtime for the tables
ALTER PUBLICATION supabase_realtime ADD TABLE notes;
ALTER PUBLICATION supabase_realtime ADD TABLE handoff_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE supply_requests;
```

---

### Pattern 2: Audit Trail — Append-Only `audit_log` Table

**What:** A dedicated `audit_log` table records every nurse action (approve, escalate, override) with: who, what action, which note, when, and an optional free-text reason. Rows are never updated or deleted — insert-only. The frontend reads this table to display history.

**When to use:** Every `NurseActionBar` action. Currently these only `console.log`. The fix is to INSERT a row into `audit_log` and mark the note as actioned in the `notes` table.

**Trade-offs:**
- Pro: Append-only is simple, performant, and correct for audit use cases
- Pro: Demonstrates compliance-readiness — the strongest analogy to cannabis regulation
- Pro: No n8n node needed — a direct Supabase JS INSERT from the frontend is appropriate here (no AI processing, no orchestration)
- Con: Requires `nurse_name` to be reliable — depends on multi-nurse identity being implemented first

**Schema:**
```sql
CREATE TABLE audit_log (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id     uuid NOT NULL REFERENCES notes(id),
  patient_id  uuid NOT NULL REFERENCES patients(id),
  nurse_name  text NOT NULL,
  action      text NOT NULL CHECK (action IN ('approved', 'escalated', 'overridden', 'flagged')),
  reason      text,
  created_at  timestamptz DEFAULT now() NOT NULL
);

-- BRIN index for time-range queries (optimal for append-only tables)
CREATE INDEX audit_log_created_at_brin ON audit_log USING BRIN (created_at);
-- BTREE for patient-scoped queries
CREATE INDEX audit_log_patient_id_idx ON audit_log (patient_id);
-- BTREE for note-scoped queries
CREATE INDEX audit_log_note_id_idx ON audit_log (note_id);
```

**Frontend insertion (direct, no n8n needed):**
```typescript
async function handleApprove(noteId: string, reason?: string) {
  await supabase.from('audit_log').insert({
    note_id: noteId,
    patient_id: patientId,
    nurse_name: activeNurse,
    action: 'approved',
    reason: reason ?? null
  })
  // Also update the note's flagged status if overriding
}
```

---

### Pattern 3: Cross-Visit Context Memory — Prompt Injection via n8n

**What:** Before Claude is called to structure a new note, n8n fetches the last N notes for that patient from Supabase and injects a compressed prior-context block into the Claude prompt. This allows Claude to reference prior observations, flag changes from baseline, and produce more clinically coherent output.

**When to use:** Note structuring (Prompt 1 in `prompts.md`) and handoff report generation (Prompt 3). Not needed for supply lookup.

**Trade-offs:**
- Pro: No new database table needed — reads from existing `notes` table
- Pro: Stronger AI output quality — flags deviations from baseline rather than treating each note as isolated
- Pro: Directly enables the "guest remembered" analogy for the FIKA pitch
- Con: More tokens per Claude call — prior notes add to prompt size. Mitigate by limiting to last 5 notes and using a compressed summary format, not raw SOAP text.
- Con: n8n node complexity increases slightly — one additional Supabase query before the Claude call

**n8n modification — add before Claude note structuring node:**
```
N3b: Fetch Prior Notes
  → GET /rest/v1/notes?patient_id=eq.{patient_id}&order=created_at.desc&limit=5
  → Extract structured_note fields only (not raw_input)
  → Format as: "Prior observations: [date]: [SOAP assessment summary], [date]: ..."
  → Inject as {prior_context} into Prompt 1
```

**Modified Prompt 1 — context memory injection:**
```
Patient context: {patient_context}
Prior observations (last 5 notes, newest first):
{prior_context}
Raw dictation: {raw_input}
Shift: {shift}

Flag if any value deviates from the pattern established in prior notes.
```

**Compression rule for `prior_context`:** Include only the Assessment and Plan sections from each prior SOAP note, with the date. This keeps token count bounded while preserving clinical signal. A 5-note window at ~100 tokens each adds ~500 tokens — well within Claude's context budget.

---

## Data Flow

### Flow: Nurse Action with Audit Trail

```
NurseActionBar (click Approve)
    ↓
frontend: supabase.from('audit_log').insert({ note_id, nurse_name, action: 'approved' })
    ↓
Supabase: writes to audit_log
    ↓
Supabase Realtime: broadcasts INSERT on audit_log
    ↓
AuditLog component: receives event, re-fetches audit_log for this patient
    ↓
UI: audit trail updates in place (no page refresh)
```

### Flow: Realtime Multi-Tab Sync

```
Tab A: nurse submits dictation → POSTs to n8n
    ↓
n8n: processes, saves note to Supabase notes table
    ↓
Supabase Realtime: broadcasts INSERT on notes (REPLICA IDENTITY FULL)
    ↓
Tab B: useRealtimeChannel callback fires (subscribed to same patient's notes)
    ↓
Tab B: calls fetchData() → re-renders with new note
    ↓
UI: Tab B shows new note without Tab B user doing anything
```

### Flow: Note Dictation with Context Memory

```
Nurse submits dictation (patient_id, raw_input, nurse_name, shift)
    ↓
n8n N1: Webhook receives POST
n8n N2: Parse input
n8n N3: Fetch patient context from Supabase
n8n N3b: Fetch last 5 notes for patient (NEW) → compress to prior_context string
n8n N4: Send to Claude → structured_note + flagged + procedures
         (prompt now includes prior_context — Claude can reference baseline)
n8n N5-N6: Parse response, save note to Supabase
    ↓ (if procedures detected)
n8n N8a: Claude generates supply list
n8n N9a: Save supply_request
    ↓
n8n N10: Return WebhookResponse to frontend
    ↓
Frontend: receives response, renders structured note
Supabase Realtime: broadcasts notes INSERT → all subscribed clients re-fetch
```

### State Management

The existing pattern (re-fetch after mutation) is kept and complemented by realtime subscriptions, not replaced. The subscription fires `fetchData()` — the same function already called post-mutation. This means:
- Mutations from the current tab still use the existing POST → response → fetchData() path
- Mutations from other tabs or other users arrive via the realtime subscription → fetchData() path
- No state management library is needed; Supabase remains the single source of truth

```
Supabase (source of truth)
    ↓ subscription fires on INSERT/UPDATE
useRealtimeChannel hook → calls onEvent callback
    ↓
fetchData() — existing function, unchanged
    ↓
Component state updated, UI re-renders
```

---

## Build Order

Dependencies between the three new features determine the build order. Realtime and audit trail are independent. Context memory depends on nothing external. But audit trail depends on multi-nurse identity (you need a reliable `nurse_name` to log against). The recommended sequence:

```
1. Multi-nurse identity + NurseSelector component
   — No DB changes. Adds a nurse switcher to the UI. Feeds nurse_name into audit_log.
   — Required by: Audit trail

2. Audit trail (audit_log table + NurseActionBar persistence + AuditLog component)
   — DB migration 002 (audit_log table + indexes)
   — Depends on: Multi-nurse identity
   — Unblocks: Nothing (standalone feature)

3. Realtime subscriptions (useRealtimeChannel hook + REPLICA IDENTITY + publication)
   — DB migration 002 (realtime setup SQL)
   — Independent of audit trail, but shares the same migration file
   — Can be done in parallel with step 2

4. Context memory (n8n modification + prior_context prompt injection)
   — No DB changes. Modifies n8n workflow JSON only.
   — Independent of 1-3, but best done after audit trail is stable
   — Easiest to test in isolation (compare Claude output with vs without)
```

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Supabase Realtime | Supabase JS `channel().on('postgres_changes').subscribe()` in client components | Requires REPLICA IDENTITY FULL and publication membership per table. Channels must be removed on unmount. |
| Supabase REST (n8n) | HTTP GET with query params — existing pattern | Add one GET to fetch prior notes in n8n before Claude call. Returns JSON array. |
| Claude API (n8n) | HTTP POST to Anthropic endpoint — existing pattern | Prompt grows by ~500 tokens with context memory injection. No model change needed. |
| Supabase JS (frontend direct) | `supabase.from('audit_log').insert()` — same client used for reads | Audit trail writes bypass n8n intentionally — no AI processing needed, direct insert is faster and simpler. |

### Internal Boundaries

| Boundary | Communication | Constraint |
|----------|---------------|------------|
| Frontend → Supabase | Direct JS client for reads + audit inserts | Anon key with permissive RLS — acceptable for demo |
| Frontend → n8n | HTTP POST for note/supply/handoff writes | n8n does all AI-involved writes; frontend never calls Claude directly |
| n8n → Supabase | REST API for reads and writes | n8n needs service key or anon key with INSERT permission on `notes`, `supply_requests`, `handoff_reports` |
| Realtime subscription scope | Filter by `patient_id` on each subscription | Subscribe only to the current patient's data — do not subscribe to full table changes |
| Audit log writes | Frontend direct INSERT only | Do not route through n8n. No AI, no orchestration needed. Simpler, faster, less failure surface. |

---

## Scaling Considerations

This is a demo-scale app. Scaling is not the concern. The patterns chosen are appropriate for the scale:

| Scale | Architecture Adjustment |
|-------|------------------------|
| 1-10 demo users | Current architecture — no changes needed |
| 10-100 internal users | Add RLS policies scoped to nurse identity; move audit inserts to n8n to enforce validation |
| 100+ concurrent users | Add connection pooling (PgBouncer via Supabase); consider debouncing realtime subscription callbacks to avoid fetchData() storms on bulk inserts |

---

## Anti-Patterns

### Anti-Pattern 1: Routing Audit Log Writes Through n8n

**What people do:** Send every NurseActionBar action to n8n as a webhook call, which then writes to `audit_log`.

**Why it's wrong:** Adds latency (HTTP round-trip), adds a point of failure, and adds n8n workflow complexity for zero benefit — there is no AI processing involved in an approve/escalate action.

**Do this instead:** Write directly to `audit_log` via Supabase JS client from the frontend. Keep the n8n boundary for actions that involve Claude API calls.

---

### Anti-Pattern 2: Subscribing to Full Table Without Filter

**What people do:** Subscribe to the entire `notes` table without a `patient_id=eq.X` filter.

**Why it's wrong:** Every note insert for every patient fires the callback in every open tab. The `fetchData()` call becomes expensive and the UI thrashes unnecessarily.

**Do this instead:** Always scope channel subscriptions to the current entity. Use `filter: 'patient_id=eq.${patientId}'` in every subscription on the patient detail page.

---

### Anti-Pattern 3: Unbounded Prior Context in Claude Prompts

**What people do:** Fetch all notes for the patient and concatenate full SOAP text into the prompt.

**Why it's wrong:** Token count grows unboundedly with the number of visits. On patients with many notes, the prompt exceeds context limits or becomes expensive.

**Do this instead:** Limit to last 5 notes, extract only Assessment + Plan sections, and format as a concise one-line-per-note summary. The AI needs signal, not verbatim history.

---

### Anti-Pattern 4: Calling `fetchData()` Inside the Realtime Callback Without Debouncing

**What people do:** Subscribe to changes and call `fetchData()` synchronously on every event.

**Why it's wrong:** If multiple rows insert in quick succession (e.g., a handoff triggers both a note insert and a supply_request insert), `fetchData()` fires multiple times in rapid succession.

**Do this instead:** For demo scale, this is acceptable — `fetchData()` is cheap. Note it as a known issue. If it causes visible flicker, debounce the callback with a 100ms delay.

---

## Sources

- Supabase Realtime JavaScript reference: [subscribe/unsubscribe API](https://supabase.com/docs/reference/javascript/subscribe)
- Supabase Realtime with Next.js official guide: [Realtime with Next.js](https://supabase.com/docs/guides/realtime/realtime-with-nextjs)
- Supabase Postgres audit pattern: [Postgres Auditing in 150 lines of SQL](https://supabase.com/blog/postgres-audit)
- supa_audit extension (generic table auditing): [github.com/supabase/supa_audit](https://github.com/supabase/supa_audit)
- Cross-visit AI context memory: [Beyond the Bubble — Context-Aware Memory Systems 2025](https://www.tribe.ai/applied-ai/beyond-the-bubble-how-context-aware-memory-systems-are-changing-the-game-in-2025)
- Clinical note summarization for AI prompts: [AI Clinical Summarization Prospects — PMC 2025](https://pmc.ncbi.nlm.nih.gov/articles/PMC11578995/)
- n8n Webhook response patterns: [Respond to Webhook node docs](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.respondtowebhook/)

---

*Architecture research for: AI-Native Nurse Context Engine — v2 milestone (audit trail, realtime, context memory)*
*Researched: 2026-03-26*
