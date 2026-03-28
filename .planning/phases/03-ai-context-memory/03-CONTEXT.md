# Phase 3: AI Context Memory - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

The AI incorporates each patient's documented history when structuring notes and generating recommendations, making the "system remembers" narrative visible. Covers: prior notes context window in Claude prompts, patient context summary generation and display, supply recommendation rationale and attribution, SOAP note visual polish, and handoff report professional formatting with all four data sections rendered.

</domain>

<decisions>
## Implementation Decisions

### Prior Context Window
- **D-01:** Context window differs by action type: Note structuring uses last 5 notes (A+P sections), Supply recommendations use same 5-note window, Handoff reports use the same 5-note window for consistency.
- **D-02:** No time cutoff on notes — always last 5 regardless of age. But annotate age on each note fed to Claude (e.g., "Note from 3 days ago" vs "Note from 6 months ago") so the AI can weigh recency.
- **D-03:** Prior notes fetched server-side in n8n. Add a new node (N3b) after N3 Fetch Patient Context that queries last 5 notes from Supabase REST API, extracting Assessment + Plan sections and created_at timestamps. Frontend stays a thin client — no large payloads over the wire.

### Patient Context Summary
- **D-04:** Patient context summary lives in a dedicated "Context" tab alongside Notes/Supplies/Handoff/Activity. Tab type extends to include 'context'.
- **D-05:** Summary generated in the n8n pipeline on note creation only — a new Claude call added after note processing. The summary is always as current as the latest note.
- **D-06:** Summary stored in a `patient_summaries` table (or column on `patients` table). Frontend reads via Supabase JS client on page load. No extra Claude API call on page visit.

### Supply Recommendation Rationale
- **D-07:** Supply checklist component header renamed from "Supply Checklist" to "Supply Prep Recommendations".
- **D-08:** Single rationale block per checklist (not per-item). Claude's supply prompt extended to return `{procedure, rationale, items: [...]}` where rationale is a string explaining why these supplies were recommended given patient context and procedure.
- **D-09:** Rationale displayed via expandable row — click to reveal. Keeps the table compact by default, rationale available on demand.

### SOAP Note Visual Polish (UI-04)
- **D-10:** Incremental improvement on current layout, not a structural redesign. Changes:
  - Bolder S/O/A/P section letters with letter-spacing (uppercase labels already exist)
  - Better spacing between SOAP sections using white space (not lines, per Tufte 1+1=3 rule)
  - Timestamp annotations in desaturated muted gray — temporal markers recede behind clinical content
  - All sections always visible — no collapsing or chunking (expert nurses scan, not click)
- **D-11:** Design system authority: left-aligned text, F-pattern scanning optimization, proximity-based grouping over decorative borders.

### Handoff Report Formatting (UI-10)
- **D-12:** Dashboard card layout with lightweight borders (not heavy shadows). Each section (summary, priority flags, stable items, recommended actions) in its own bordered card.
- **D-13:** All four sections always visible — no collapsible accordions. Nurses need to cross-reference flags against actions without context switching.
- **D-14:** Summary card gets visual prominence (larger text, top position). Priority flags use semantic color badges inline (amber/red per existing design system). Stable items and recommended actions render as clean lists.
- **D-15:** Conservative, quiet visual style — desaturated colors, no heavy shadows or animations. This is a sovereign app for 12-hour shifts per UX interaction design system guidance.

### Claude's Discretion
- Patient context summary prompt design and output format
- Exact SOAP section spacing values (within design system constraints)
- How prior notes are formatted in the Claude prompt (bullet list vs structured blocks)
- Whether patient_summaries is a new table or a column on patients
- Handoff report card spacing and typography details
- N3b query implementation details (SQL, ordering, field selection)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### n8n Workflow (primary modification target)
- `n8n-workflow.json` — Main pipeline. Phase 3 adds N3b (prior notes fetch) and a patient summary Claude call. Node names may have been reset — verify current state via n8n MCP tools.
- `/Users/gozzynwogbo/Downloads/Nurse_Context_Engine_Fixed.json` — Latest exported workflow with N5 structured_note stringify fix.

### Database Schema
- `supabase/migrations/002_phase1_persistence.sql` — Phase 1 columns (review_status, reviewed_by, reviewed_at)
- `supabase/migrations/003_audit_log.sql` — Phase 2 audit_log table and trigger
- `src/lib/types.ts` — TypeScript interfaces for Note, StructuredNote, SupplyItem, WebhookResponse. Phase 3 extends WebhookResponse and adds PatientSummary type.

### Components (modify, don't replace)
- `src/components/StructuredNote.tsx` — SOAP note display. Phase 3 applies visual polish (D-10, D-11).
- `src/components/SupplyChecklist.tsx` — Supply display. Phase 3 renames header, adds rationale block (D-07, D-08, D-09).
- `src/components/HandoffReport.tsx` — Handoff display. Phase 3 redesigns to dashboard card layout (D-12 through D-15).
- `src/app/patient/[id]/page.tsx` — Patient detail page. Phase 3 adds Context tab, wires patient summary.

### Design System
- `.interface-design/system.md` — Component specs, color tokens, layout patterns
- `design-principles-nurse.md` — Clinical UI principles

### External Design Knowledge
- `/Users/gozzynwogbo/ai_domain/personalplayground/notebooklm/design/` — NotebookLM-backed design system. Key findings for Phase 3:
  - Visual design: bold uppercase labels with letter-spacing, white space over lines, desaturated timestamps
  - UX interaction: no over-chunking scannable data, expert users prefer high information density, allow multiple sections visible simultaneously
  - Product design: dashboard cards with lightweight borders for multi-section reports, conservative quiet visual style for sovereign apps

### Prior Phase Decisions
- `.planning/phases/01-functional-foundation/1-CONTEXT.md` — Nurse identity, direct Supabase writes, toast patterns
- `.planning/phases/02-compliance-audit-trail/2-CONTEXT.md` — Audit trail, trigger-based logging, Activity tab

### Project Planning
- `.planning/ROADMAP.md` — Phase 3 scope definition and requirements mapping
- `.planning/REQUIREMENTS.md` — AICTX-01 through AICTX-04, UI-04, UI-10 acceptance criteria

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/supabase.ts` — Supabase client for patient summary reads
- `src/lib/format-time.ts` — Timestamp formatting. Reuse for "3 days ago" age annotations
- `src/components/ActivityTimeline.tsx` — Timeline pattern with nurse initials. Similar visual language could apply to context summary
- `src/lib/audit.ts` — insertAuditEntry helper. No changes needed but summary generation could log to audit trail

### Established Patterns
- n8n workflow nodes follow N1-N10 naming convention with Set nodes for parsing
- Claude prompts use `JSON.stringify` for patient context injection
- `structured_note` stored as TEXT (JSON-stringified) — patient summary should follow same pattern
- Tab system: `type Tab = 'notes' | 'supplies' | 'handoff' | 'activity'` — extend with 'context'
- SupplyChecklist already has expandable patterns (individual item toggles) — rationale expandable row follows this

### Integration Points
- n8n N4 Claude Structure Note: prompt needs prior notes injected from new N3b node
- n8n N8a Claude Supply List: prompt needs prior notes for rationale generation
- n8n pipeline: add patient summary Claude call after N6 Save Note (side-effect of note creation)
- `src/app/patient/[id]/page.tsx`: add Context tab, fetch patient_summaries, pass to new component
- `src/components/SupplyChecklist.tsx`: add rationale prop, expandable row, rename header
- `src/components/HandoffReport.tsx`: restructure into dashboard card sections
- `src/components/StructuredNote.tsx`: CSS-level polish (spacing, typography, timestamp color)

</code_context>

<specifics>
## Specific Ideas

- The "system remembers" narrative is the demo centerpiece for Phase 3. The interviewer should see that when a nurse dictates a new note for Devon Clarke, the AI references his chest drain history without being told — it just knows.
- Patient context summary should feel like a colleague's verbal briefing, not a database dump. Short, prioritized, clinical.
- Supply rationale should read naturally: "Recommended based on chest drain procedure in ICU setting with documented drain output monitoring" — not just "AI generated."
- SOAP note polish should be subtle. The current layout works — it just needs typographic refinement, not a redesign.
- Handoff report is the strongest demo moment for Phase 3. When an incoming nurse opens the handoff tab and sees summary + priority flags + stable items + recommended actions all laid out in clean cards, that's the "oh that would be fantastic" moment.

</specifics>

<deferred>
## Deferred Ideas

- Edit notes before approval (nurse corrects dictation misinterpretation before confirming) — backlog, could be Phase 3.1 or Phase 4
- Context summary history (view how the summary evolved over time) — backlog
- Configurable context window size (let nurse choose 3 vs 5 vs 10 prior notes) — not needed for demo
- AI confidence scores on individual SOAP sections — future enhancement
- Export handoff report as PDF — backlog

</deferred>

---

*Phase: 03-ai-context-memory*
*Context gathered: 2026-03-28*
