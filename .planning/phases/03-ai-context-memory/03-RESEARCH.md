# Phase 3: AI Context Memory - Research

**Researched:** 2026-03-28
**Domain:** n8n workflow modification, Claude API prompt engineering, Supabase schema, React component polish
**Confidence:** HIGH

## Summary

Phase 3 introduces AI memory into the Nurse Context Engine by injecting prior patient notes into Claude prompts, generating patient context summaries, adding rationale to supply recommendations, and polishing SOAP note and handoff report visual formatting. The work spans four layers: (1) n8n workflow additions (new N3b node for prior notes fetch, patient summary Claude call after note save), (2) Supabase schema (patient_summaries storage), (3) TypeScript types and frontend components, and (4) CSS-level visual refinements.

All decisions are locked by CONTEXT.md. The n8n workflow is the primary modification target -- it currently feeds only the current patient record to Claude (N3 Fetch Patient Context). Phase 3 adds a second Supabase query (N3b) to retrieve the last 5 notes' Assessment + Plan sections, then injects that context into the N4 Claude Structure Note prompt and the N8a Claude Supply List prompt. A separate Claude call after N6 generates a rolling patient summary stored in the database.

**Primary recommendation:** Implement in three waves: (1) database migration + n8n prior-notes node, (2) prompt modifications + patient summary generation, (3) frontend component updates (Context tab, supply rationale, SOAP polish, handoff cards).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Context window differs by action type: Note structuring uses last 5 notes (A+P sections), Supply recommendations use same 5-note window, Handoff reports use the same 5-note window for consistency.
- **D-02:** No time cutoff on notes -- always last 5 regardless of age. But annotate age on each note fed to Claude (e.g., "Note from 3 days ago" vs "Note from 6 months ago") so the AI can weigh recency.
- **D-03:** Prior notes fetched server-side in n8n. Add a new node (N3b) after N3 Fetch Patient Context that queries last 5 notes from Supabase REST API, extracting Assessment + Plan sections and created_at timestamps. Frontend stays a thin client -- no large payloads over the wire.
- **D-04:** Patient context summary lives in a dedicated "Context" tab alongside Notes/Supplies/Handoff/Activity. Tab type extends to include 'context'.
- **D-05:** Summary generated in the n8n pipeline on note creation only -- a new Claude call added after note processing. The summary is always as current as the latest note.
- **D-06:** Summary stored in a `patient_summaries` table (or column on `patients` table). Frontend reads via Supabase JS client on page load. No extra Claude API call on page visit.
- **D-07:** Supply checklist component header renamed from "Supply Checklist" to "Supply Prep Recommendations".
- **D-08:** Single rationale block per checklist (not per-item). Claude's supply prompt extended to return `{procedure, rationale, items: [...]}` where rationale is a string explaining why these supplies were recommended given patient context and procedure.
- **D-09:** Rationale displayed via expandable row -- click to reveal. Keeps the table compact by default, rationale available on demand.
- **D-10:** Incremental improvement on current layout, not a structural redesign. Changes: Bolder S/O/A/P section letters with letter-spacing, better spacing between SOAP sections using white space, timestamp annotations in desaturated muted gray, all sections always visible.
- **D-11:** Design system authority: left-aligned text, F-pattern scanning optimization, proximity-based grouping over decorative borders.
- **D-12:** Dashboard card layout with lightweight borders (not heavy shadows). Each section (summary, priority flags, stable items, recommended actions) in its own bordered card.
- **D-13:** All four sections always visible -- no collapsible accordions. Nurses need to cross-reference flags against actions without context switching.
- **D-14:** Summary card gets visual prominence (larger text, top position). Priority flags use semantic color badges inline. Stable items and recommended actions render as clean lists.
- **D-15:** Conservative, quiet visual style -- desaturated colors, no heavy shadows or animations. Sovereign app for 12-hour shifts.

### Claude's Discretion
- Patient context summary prompt design and output format
- Exact SOAP section spacing values (within design system constraints)
- How prior notes are formatted in the Claude prompt (bullet list vs structured blocks)
- Whether patient_summaries is a new table or a column on patients
- Handoff report card spacing and typography details
- N3b query implementation details (SQL, ordering, field selection)

### Deferred Ideas (OUT OF SCOPE)
- Edit notes before approval (nurse corrects dictation misinterpretation before confirming) -- backlog
- Context summary history (view how the summary evolved over time) -- backlog
- Configurable context window size (let nurse choose 3 vs 5 vs 10 prior notes) -- not needed for demo
- AI confidence scores on individual SOAP sections -- future enhancement
- Export handoff report as PDF -- backlog
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AICTX-01 | When structuring a new note, the AI prompt includes a summary of the patient's prior notes (last 5 notes, Assessment + Plan sections) as context | n8n N3b node fetches prior notes via Supabase REST API; N4 and N8a/N8b prompts extended with prior_notes injection; age annotation per D-02 |
| AICTX-02 | Patient detail view shows a "Patient History" section displaying the AI-aggregated context summary | New Context tab in patient detail; patient_summaries table/column; PatientContextSummary component reads from Supabase on load |
| AICTX-03 | Supply checklist is reframed as "Procedure Prep Recommendations" with rationale attribution | SupplyChecklist header rename (D-07); Claude supply prompt returns `rationale` field (D-08); expandable rationale row (D-09) |
| AICTX-04 | Each supply/recommendation item shows confidence context (procedure source, unit type consideration) | Rationale string from Claude includes procedure + patient context references; single block per checklist, not per-item |
| UI-04 | Structured SOAP notes display with clear visual hierarchy (section headers, indentation, temporal context) | StructuredNote.tsx CSS polish: bolder labels, letter-spacing, increased section spacing, muted timestamps (D-10, D-11) |
| UI-10 | Handoff report renders with professional clinical formatting (summary, priority flags with badges, stable items, recommended actions) | HandoffReport.tsx restructured to dashboard card layout (D-12 through D-15) |
</phase_requirements>

## Standard Stack

### Core (already in project -- no new dependencies)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 | App framework | Already installed, no changes |
| @supabase/supabase-js | ^2.98.0 | DB client | Already installed, used for patient_summaries reads |
| Tailwind CSS | ^4 | Styling | Already installed, CSS-level changes only |
| sonner | ^2.0.7 | Toast notifications | Already installed |

### Supporting (no additions needed)
This phase requires zero new npm packages. All changes are:
- n8n workflow JSON modifications (new nodes, prompt extensions)
- Supabase schema migration (one new table or column)
- TypeScript type extensions
- React component modifications
- CSS class changes within existing Tailwind system

**Installation:** None required. No new packages.

## Architecture Patterns

### n8n Workflow Modification Pattern

The existing n8n workflow follows a strict linear pipeline: N1 (webhook) -> N2 (parse) -> N3 (fetch patient) -> N4 (Claude note) -> N5 (parse) -> N6 (save) -> N7 (router) -> branches.

Phase 3 inserts into this pipeline:

```
EXISTING:
N3 Fetch Patient Context -> N4 Claude Structure Note

PHASE 3:
N3 Fetch Patient Context -> N3b Fetch Prior Notes -> N4 Claude Structure Note (modified prompt)
                                                                    |
                                                    N6 Save Note -> N6b Generate Patient Summary -> N6c Save Summary
                                                                    |
                                                    N7 Router (unchanged)
```

**N3b Fetch Prior Notes** is an HTTP Request node querying Supabase REST API:
```
GET {SUPABASE_URL}/rest/v1/notes?patient_id=eq.{patient_id}&select=structured_note,created_at&order=created_at.desc&limit=5
```

**N6b Generate Patient Summary** is a Claude API call after N6 Save Note, parallel to the N7 Router path. It takes the newly saved note plus the prior notes and generates a rolling summary.

**N6c Save Summary** upserts to patient_summaries (or updates the patients table column).

### Prior Notes Format in Claude Prompt

Recommended format (structured blocks with age annotation):

```
Prior clinical context (last 5 notes, most recent first):

[1] 2 hours ago (14:30, 28 Mar):
  Assessment: Post-op day 2, stable vitals, wound healing well
  Plan: Continue current medications, reassess drain output at next check

[2] 8 hours ago (08:15, 28 Mar):
  Assessment: Overnight stable, no complaints
  Plan: Morning vitals, dressing check scheduled
```

This format gives Claude both temporal context (age) and clinical context (A+P). Numbered entries make it clear how many notes are available.

### Patient Summary Storage Decision

**Recommendation: New `patient_summaries` table** (not a column on patients).

Rationale:
- Keeps the patients table clean (it's the source-of-truth for demographics)
- Allows storing metadata: generated_at timestamp, note_count at generation time
- Enables future features (summary history) without schema changes
- Upsert pattern: `ON CONFLICT (patient_id) DO UPDATE` ensures one summary per patient

```sql
CREATE TABLE public.patient_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) UNIQUE,
  summary TEXT NOT NULL,
  note_count INTEGER NOT NULL DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.patient_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon select on patient_summaries" ON public.patient_summaries FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert on patient_summaries" ON public.patient_summaries FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update on patient_summaries" ON public.patient_summaries FOR UPDATE TO anon USING (true) WITH CHECK (true);
```

### Supply Rationale Storage

The `supply_requests` table currently stores `items` as JSONB. Phase 3 adds a `rationale` TEXT column:

```sql
ALTER TABLE public.supply_requests ADD COLUMN rationale TEXT;
```

The n8n supply prompt is extended to return `rationale` alongside `procedure` and `items`. The N9a Save Supply Request and S5 Save Supply Request nodes are updated to include rationale in the INSERT.

### Recommended Project Structure (changes only)

```
src/
  components/
    StructuredNote.tsx      # CSS polish (D-10, D-11)
    SupplyChecklist.tsx      # Rename header, add rationale (D-07, D-08, D-09)
    HandoffReport.tsx        # Dashboard card layout (D-12-D-15)
    PatientContextSummary.tsx # NEW: Context tab content
  lib/
    types.ts                # Extended types (PatientSummary, rationale on WebhookResponse)
  app/
    patient/[id]/page.tsx   # Add Context tab, wire patient summary
supabase/
  migrations/
    004_phase3_context_memory.sql  # NEW: patient_summaries table, rationale column
n8n-workflow.json            # Modified: N3b, N4 prompt, N6b, N6c, N8a prompt
n8n-workflow-supply-lookup.json  # Modified: S4 prompt for rationale
```

### Anti-Patterns to Avoid
- **Fetching prior notes from frontend:** D-03 explicitly says n8n fetches server-side. Do not add a Supabase query in the React component to feed notes to the webhook call.
- **Per-item rationale:** D-08 says single rationale block per checklist. Do not add a rationale field to each SupplyItem.
- **Heavy visual redesign of SOAP notes:** D-10 says incremental CSS improvement. Do not restructure the component hierarchy or add collapsible sections.
- **Generating summary on page load:** D-05 says summary is generated during note creation in n8n. The frontend only reads the stored summary.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Supabase REST queries in n8n | Custom HTTP construction | Standard pattern: `{SUPABASE_URL}/rest/v1/{table}?{filters}&select={fields}` with apikey header | Existing N3 node demonstrates the exact pattern |
| Upsert logic for patient_summaries | Application-level check-then-insert | Supabase REST with `Prefer: resolution=merge-duplicates` header or SQL `ON CONFLICT` | Race condition free, single request |
| Time-ago formatting | Custom date math | Existing `formatNoteTimestamp` in `src/lib/format-time.ts` | Already handles <1min, <60min, <24h, older cases |
| Expandable UI pattern | Custom state management for rationale toggle | Follow existing `showRaw` toggle pattern in StructuredNote.tsx | useState boolean + conditional render, already established |

## Common Pitfalls

### Pitfall 1: n8n Expression Reference Chain Breaking
**What goes wrong:** Adding N3b between N3 and N4 can break downstream expression references like `$('N3 Fetch Patient Context').item.json` if node names change during workflow import.
**Why it happens:** n8n workflow JSON uses string-based node name references. If the imported workflow assigns different names (e.g., "N3 Fetch Patient Context1"), all downstream references silently fail.
**How to avoid:** After modifying the workflow JSON, verify every `$('...')` expression references the correct node name. Test the workflow end-to-end in n8n before committing the JSON.
**Warning signs:** n8n execution shows "undefined" or empty values in Set nodes.

### Pitfall 2: structured_note Being a String vs Object
**What goes wrong:** The `structured_note` column in Supabase stores TEXT (JSON-stringified). When N3b fetches prior notes, the A+P sections need to be extracted from parsed JSON, but the raw Supabase response returns them as strings.
**Why it happens:** N6 Save Note stringifies the structured_note before INSERT. On retrieval, it comes back as a string, not an object.
**How to avoid:** In the N3b Set node that processes prior notes, parse `structured_note` with `JSON.parse()` before extracting `.assessment` and `.plan`. Add a try/catch for malformed records.
**Warning signs:** Claude receives literal JSON strings instead of extracted A+P text.

### Pitfall 3: Patient Summary Claude Call Blocking Webhook Response
**What goes wrong:** If the patient summary generation (N6b) is in the critical path between N6 and N7, it adds Claude API latency (~1-3 seconds) to every note submission.
**Why it happens:** n8n executes nodes sequentially along connected paths.
**How to avoid:** The summary generation should branch off N6 in parallel with the N7 Router path, or execute after the webhook response is sent. Option: use n8n's "Execute Workflow" node to trigger summary generation asynchronously, or accept the latency for the demo (3 patients, minimal traffic).
**Warning signs:** Dictation submission takes 5+ seconds instead of the current 2-3 seconds.

### Pitfall 4: Upsert Failing on First Summary
**What goes wrong:** If using `ON CONFLICT` upsert, the first summary for a patient has no conflict and uses INSERT. But if the Supabase REST `Prefer: resolution=merge-duplicates` header is used without a UNIQUE constraint on patient_id, it silently inserts duplicates.
**Why it happens:** Supabase REST upsert requires a UNIQUE constraint to detect conflicts.
**How to avoid:** The migration MUST add `UNIQUE` on patient_summaries.patient_id (included in the schema above). Verify with a test INSERT before deploying.
**Warning signs:** Multiple summary rows per patient in Supabase.

### Pitfall 5: Supply Lookup Workflow Not Updated
**What goes wrong:** The standalone supply lookup workflow (`n8n-workflow-supply-lookup.json`) has its own Claude prompt (S4) that does not include prior notes or rationale. Supply requests from ProcedureSearch will lack rationale.
**Why it happens:** Two separate workflows serve supply generation. Only the main workflow gets updated.
**How to avoid:** Update both `n8n-workflow.json` (N8a) and `n8n-workflow-supply-lookup.json` (S4) prompts. Both need rationale in the response schema and prior notes in the context.
**Warning signs:** Supply requests generated via ProcedureSearch have no rationale, while those from dictation do.

### Pitfall 6: Handoff Report Not Using Prior Notes
**What goes wrong:** The current N8b Claude Handoff Report prompt only receives the latest structured_note, not the full note history. D-01 requires the handoff to use the 5-note window.
**Why it happens:** N8b currently references `$('N5 Parse Claude Response').item.json.structured_note` (singular).
**How to avoid:** N8b must also receive the prior notes fetched by N3b. The handoff prompt should include all 5 prior notes, not just the current one.
**Warning signs:** Handoff reports lack historical context and only reflect the most recent note.

## Code Examples

### N3b Fetch Prior Notes -- Supabase REST Query
```
// n8n HTTP Request node
GET {SUPABASE_URL}/rest/v1/notes?patient_id=eq.{patient_id}&select=structured_note,created_at&order=created_at.desc&limit=5
Headers: apikey: {SUPABASE_ANON_KEY}
```

### N3b Parse -- Extract A+P with Age Annotation
```javascript
// n8n Set node expression (raw mode)
(() => {
  const notes = $('N3b Fetch Prior Notes').item.json
  const notesArray = Array.isArray(notes) ? notes : [notes]
  const now = new Date()

  const priorContext = notesArray.map((n, i) => {
    const parsed = typeof n.structured_note === 'string'
      ? JSON.parse(n.structured_note)
      : n.structured_note
    const created = new Date(n.created_at)
    const hoursAgo = Math.round((now - created) / 3600000)
    const ageLabel = hoursAgo < 24
      ? `${hoursAgo} hours ago`
      : `${Math.round(hoursAgo / 24)} days ago`
    return `[${i + 1}] ${ageLabel} (${created.toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'})}):\n  Assessment: ${parsed.assessment || 'N/A'}\n  Plan: ${parsed.plan || 'N/A'}`
  }).join('\n\n')

  return JSON.stringify({
    ...$('N3 Fetch Patient Context').item.json,
    prior_notes_context: priorContext || 'No prior notes available.'
  })
})()
```

### Extended N4 Claude Prompt (prior notes injection)
```
You are a clinical documentation assistant...

Patient context: {patient_context}
Raw dictation: {raw_input}
Shift: {shift}

Prior clinical context (last 5 notes, most recent first):
{prior_notes_context}

Use the prior clinical context to inform your assessment and plan. Reference relevant history where it affects the current note (e.g., "consistent with prior assessments" or "new finding compared to previous check"). Do not repeat prior notes verbatim.

Return valid JSON only...
```

### Patient Summary Prompt (N6b)
```
You are a clinical summarization assistant. Given a patient's record and their recent notes, produce a concise patient context summary that an incoming nurse could read in 30 seconds.

Prioritize: current status, active concerns, treatment trajectory, what needs watching.
Write as if briefing a colleague verbally -- short, prioritized, clinical.

Patient record: {patient_record}
Recent notes (last 5, A+P only): {prior_notes_context}
Latest note: {current_structured_note}

Return a plain text summary, 3-5 sentences. No JSON wrapping. No headers.
```

### PatientSummary TypeScript Interface
```typescript
// Add to src/lib/types.ts
export interface PatientSummary {
  id: string
  patient_id: string
  summary: string
  note_count: number
  generated_at: string
  created_at: string
}
```

### Extended WebhookResponse (rationale on supply_list)
```typescript
// Modify in src/lib/types.ts
export interface WebhookResponse {
  // ... existing fields
  supply_list?: {
    procedure: string
    rationale?: string  // NEW: AI explanation of why these supplies
    items: SupplyItem[]
  }
}
```

### SupplyChecklist Rationale Expandable Row
```typescript
// Pattern: follows existing showRaw toggle in StructuredNote.tsx
const [showRationale, setShowRationale] = useState(false)

// In JSX, after the table header:
{rationale && (
  <div className="px-5 py-2 border-b border-border">
    <button
      onClick={() => setShowRationale(!showRationale)}
      className="inline-flex items-center gap-1 text-xs font-medium text-secondary hover:text-primary transition-colors"
    >
      <svg className={`w-3 h-3 transition-transform ${showRationale ? 'rotate-90' : ''}`} ...>
        <path ... />
      </svg>
      AI Rationale
    </button>
    {showRationale && (
      <p className="mt-2 text-sm text-secondary leading-relaxed italic">
        {rationale}
      </p>
    )}
  </div>
)}
```

### HandoffReport Dashboard Card Layout
```typescript
// Each section becomes an independent bordered card instead of border-b sections
<div className="space-y-4">
  {/* Summary Card -- visual prominence */}
  <div className="bg-surface border border-border rounded-lg p-5">
    <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Summary</span>
    <p className="text-base leading-relaxed text-primary mt-3">{summary}</p>
  </div>

  {/* Priority Flags Card */}
  <div className="bg-surface border border-border rounded-lg p-5">
    <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Priority Flags</span>
    ...
  </div>

  {/* Stable Items Card */}
  ...

  {/* Recommended Actions Card */}
  ...
</div>
```

### SOAP Note Typography Polish
```typescript
// Key CSS changes in StructuredNote.tsx SOAP section labels:
// BEFORE:
<span className="font-medium uppercase tracking-wide text-secondary text-xs">

// AFTER:
<span className="font-semibold uppercase tracking-widest text-secondary text-xs">

// BEFORE (section spacing):
<div className="px-5 py-4 space-y-3">

// AFTER (more breathing room):
<div className="px-5 py-5 space-y-5">

// Timestamp/metadata -- more muted:
<span className="text-xs text-muted/70">
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Cold-context Claude calls (current) | Prior notes injected into prompt | Phase 3 | AI can reference patient history; "system remembers" narrative |
| Unlabeled supply checklist | Rationale-attributed recommendations | Phase 3 | Nurse understands WHY supplies were recommended |
| Flat handoff sections | Dashboard card layout | Phase 3 | Professional clinical formatting, cross-reference friendly |

## Open Questions

1. **N6b Summary Generation: Synchronous or Async?**
   - What we know: Adding a Claude call after N6 adds 1-3s latency. For 3 demo patients this is acceptable.
   - What's unclear: Whether n8n's "Execute Workflow" node (async fire-and-forget) is reliable enough for demo.
   - Recommendation: Keep synchronous for demo reliability. Accept the added latency. The summary generation path should branch from N6 in parallel with N7 Router if n8n supports parallel execution from the same node output (it does -- N7 Router already uses allMatchingOutputs).

2. **Supply Lookup Workflow Prior Notes**
   - What we know: The standalone supply lookup workflow (ProcedureSearch) does not currently fetch prior notes.
   - What's unclear: Whether ProcedureSearch supply requests need the same rationale quality as dictation-triggered ones.
   - Recommendation: Add prior notes fetch to the supply lookup workflow too. The rationale quality difference would be visible to the interviewer.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Frontend build | Yes | v24.11.0 | -- |
| npm | Package management | Yes | 11.6.1 | -- |
| n8n | Workflow pipeline | Yes (self-hosted) | -- | Must be running at localhost:5678 |
| Supabase | Database | Yes (cloud) | -- | -- |
| Claude API | AI processing | Yes | claude-sonnet-4-20250514 | -- |

**Missing dependencies with no fallback:** None.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None installed -- no test framework in package.json |
| Config file | None |
| Quick run command | `cd src && npm run lint` (lint only) |
| Full suite command | `cd src && npm run build` (type-check + build) |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AICTX-01 | Claude prompt includes prior 5 notes A+P | manual | Verify in n8n execution log that N4 prompt contains prior notes | N/A |
| AICTX-02 | Context tab shows patient summary | manual | Navigate to patient detail, click Context tab, verify summary displayed | N/A |
| AICTX-03 | Supply header says "Procedure Prep Recommendations" + rationale | manual | Submit dictation with procedure, verify header text and rationale block | N/A |
| AICTX-04 | Rationale references procedure + patient context | manual | Read rationale text, verify it mentions specific procedure and context | N/A |
| UI-04 | SOAP notes have bold headers, spacing, muted timestamps | manual | Visual inspection of structured note display | N/A |
| UI-10 | Handoff report renders in card layout with all 4 sections | manual | Generate handoff, verify card layout, flags, stable items, actions | N/A |

### Sampling Rate
- **Per task commit:** `cd src && npm run lint && npm run build`
- **Per wave merge:** Full build + manual 3-scenario walkthrough
- **Phase gate:** All 3 demo scenarios (Margaret, Devon, Aisha) produce correct outputs with prior context visible

### Wave 0 Gaps
- No automated test infrastructure exists -- all validation is manual + lint + build
- This is appropriate for a demo project with 3 seeded patients and manual scenario testing

## Project Constraints (from CLAUDE.md)

- **Stack locked:** Next.js 14+ (App Router), Tailwind CSS, TypeScript, Supabase, n8n, Claude API -- no stack changes
- **No default exports for components:** Named exports only (except page components)
- **Semantic tokens only:** No hardcoded hex values in components
- **`system.md` is implementation authority:** No component gets built outside the design system
- **Semicolon-free style:** No semicolons in TypeScript
- **2-space indentation**
- **Single quotes for strings, double quotes in JSX attributes**
- **No `clsx` or `cn`:** Raw template literal string concatenation for conditional classes
- **`interface` for object shapes, `type` for unions only**
- **All components are `'use client'`** (except root layout)
- **Direct Supabase queries in components** -- no abstraction layer
- **WCAG 2.1 AA is the floor** -- non-negotiable
- **Color only for meaning** -- no decorative color

## Sources

### Primary (HIGH confidence)
- Codebase inspection: `n8n-workflow.json` (512 lines) -- full pipeline reviewed
- Codebase inspection: `n8n-workflow-supply-lookup.json` (218 lines) -- standalone supply workflow
- Codebase inspection: `src/components/StructuredNote.tsx`, `SupplyChecklist.tsx`, `HandoffReport.tsx` -- current component implementations
- Codebase inspection: `src/app/patient/[id]/page.tsx` -- patient detail page with tab system
- Codebase inspection: `src/lib/types.ts` -- all TypeScript interfaces
- Codebase inspection: `supabase/migrations/` -- existing schema evolution
- CONTEXT.md: 15 locked decisions (D-01 through D-15) constraining all implementation choices

### Secondary (MEDIUM confidence)
- Supabase REST API patterns: inferred from existing N3 Fetch Patient Context node
- n8n parallel execution: inferred from N7 Router `allMatchingOutputs: true` configuration

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - no new dependencies, all existing libraries
- Architecture: HIGH - n8n pipeline modification follows established node patterns; all 15 decisions locked
- Pitfalls: HIGH - identified from direct codebase inspection (structured_note TEXT storage, dual workflow problem, node reference chains)

**Research date:** 2026-03-28
**Valid until:** 2026-04-28 (stable -- demo project with locked stack)
