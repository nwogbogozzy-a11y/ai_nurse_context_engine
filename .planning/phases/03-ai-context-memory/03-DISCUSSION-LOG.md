# Phase 3: AI Context Memory - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-28
**Phase:** 03-ai-context-memory
**Areas discussed:** Prior context window, Patient context summary, Recommendation rationale, SOAP note and handoff formatting

---

## Prior Context Window

| Option | Description | Selected |
|--------|-------------|----------|
| Same window for everything | Simpler, consistent | |
| Different by action type | Note structuring, supply, handoff each use last 5 A+P | ✓ |

**User's choice:** Different by action type — note structuring uses last 5 (A+P), supply recs use same 5 notes, handoff uses same 5-note window.

| Option | Description | Selected |
|--------|-------------|----------|
| No cutoff | Always last 5 regardless of age | |
| 72-hour cutoff | Only notes from last 3 days | |
| No cutoff but annotate age | Include age annotation per note | ✓ |

**User's choice:** No cutoff but annotate age.

| Option | Description | Selected |
|--------|-------------|----------|
| New n8n node (N3b) | Server-side fetch, frontend stays thin | ✓ |
| Frontend sends prior notes | More data over wire, no n8n change | |

**User's choice:** n8n node (N3b). User noted this would be "more consistent and stable."

---

## Patient Context Summary

| Option | Description | Selected |
|--------|-------------|----------|
| Left sidebar below patient info | Always visible, no tab switching | |
| Collapsible section at top of center | Prominent but collapsible | |
| Context tab alongside others | Dedicated tab | ✓ |

**User's choice:** Context tab.

| Option | Description | Selected |
|--------|-------------|----------|
| On page load | Automatic, costs API call per visit | |
| On-demand button | User controls cost | |
| On note creation only | Side-effect in n8n, stored in DB | ✓ |

**User's choice:** On note creation only. User asked: "will this essentially be the most up to date in relation to the notes?" — confirmed yes, regenerated with each dictation.

| Option | Description | Selected |
|--------|-------------|----------|
| n8n pipeline | Add Claude call after note processing | ✓ |
| Frontend webhook | Separate call from frontend | |

**User's choice:** n8n pipeline.

---

## Recommendation Rationale

| Option | Description | Selected |
|--------|-------------|----------|
| Inline subtitle | Smaller text under each item name | |
| Dedicated column | Replaces or merges with Notes column | |
| Expandable row | Click to reveal rationale | ✓ |

**User's choice:** Expandable row.

| Option | Description | Selected |
|--------|-------------|----------|
| Per-item rationale | Each item has its own rationale | |
| Single rationale block | One rationale for entire checklist | ✓ |
| Both | Overall + enhanced per-item notes | |

**User's choice:** Single rationale block per checklist.

**Header rename:** "Supply Checklist" → "Supply Prep Recommendations"

---

## SOAP Note and Handoff Formatting

**User's choice:** Consult the design system (NotebookLM) for both. Leaning toward dashboard card style for handoff reports.

**Design system findings applied:**
- SOAP notes: incremental polish (bold uppercase headers, white space grouping, muted timestamps)
- Handoff reports: dashboard card layout with lightweight borders, all sections visible, conservative visual style

**Notes:** User directed to query NotebookLM design knowledge base for authoritative guidance on both visual decisions.

---

## Deferred Ideas

- Edit notes before approval (nurse corrects dictation misinterpretation) — user raised this as a new capability, noted for backlog
