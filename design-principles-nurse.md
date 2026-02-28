# Design Principles for Nurse Context Engine
_Synthesized from NotebookLM design library queries | February 2026_

---

## Sources Queried

| Notebook | Query |
|---|---|
| @visual (visual-design) | Visual hierarchy principles for time-pressured scanning of critical information |
| @ux (ux-interaction) | Interaction patterns that reduce cognitive load for expert users in high-stakes environments |
| @web (web-frontend) | Accessibility and contrast standards for dashboards under variable lighting |
| @product (product-design-strategy) | Status and alert state design when missing a flag has serious consequences |

---

## Design Principles

### 1. Scan-First Hierarchy — Critical information must be visible before the nurse clicks anything

Nurses scan, they don't read. The interface must follow F-pattern reading gravity, placing the most critical information — flags, status changes, patient alerts — in the top-left primary optical area. Apply the inverted pyramid: lead with what changed, follow with supporting detail. The patient dashboard must surface flag badges at the card level so an incoming nurse knows who needs attention first without opening a single record.

**Applied to this system:** Patient cards show flag status, last update time, and current status at the dashboard level. Flags are never hidden behind a click.

---

### 2. Semantic Color Only — Every color must mean something; decoration erodes trust

Color is reserved exclusively for clinical meaning: amber for anomaly/warning, red for critical/urgent, green for clear/safe, blue for system accent. Desaturated backgrounds reduce eye fatigue across 12-hour shifts. Highlighting is applied to no more than 10% of visible content — overuse dilutes signal. Red drives urgency, yellow draws scanning attention to warnings, green confirms safe status. No decorative color anywhere.

**Applied to this system:** The color palette from CLAUDE.md (flag-warning #F59E0B, flag-critical #EF4444, flag-safe #10B981, accent #0EA5E9) maps directly to clinical semantics. Background stays white/surface. Color never appears without meaning.

---

### 3. Transparent Reasoning — Show why, not just what, to earn clinical trust

Nurses will not trust a black box. Every AI-generated flag must include a plain-English explanation of why it was flagged. Every handoff report must show generation timestamp and data recency. Every structured note must be reviewable against the raw input. The system earns trust by making its reasoning visible — not by asking the nurse to take its word for it. Alerts must be placed in close proximity to the relevant data point, not in a generic banner.

**Applied to this system:** Flag badges always display with `flag_reason`. Handoff reports include generation timestamps. Structured notes are shown alongside (or expandable from) the original dictation input.

---

### 4. Zero-Friction Expert Workflow — Optimize for the nurse who already knows what they're doing

This is a tool for expert users under time pressure. Apply Hick's Law: minimize choices at every decision point. Apply Fitts's Law: make critical actions (approve, escalate, override) large targets placed close together. Use object-verb ordering — the nurse selects the patient first, then sees only relevant actions. Progressive disclosure hides secondary functions without removing them. No onboarding flows, no tooltips blocking workflows, no modals interrupting clinical tasks.

**Applied to this system:** Dictation → structured output is one action. Supply lists appear without being requested. Handoff reports generate with one click. Approve/escalate/override buttons are large, adjacent, and always visible on flagged notes.

---

### 5. Modeless Status Visibility — System state must be glanceable without interaction

In high-stakes environments, modal dialogs are dangerous — they interrupt workflow and demand cognitive attention to dismiss. Use persistent, modeless visual cues for all status communication: processing states, flag indicators, patient status. The dashboard must communicate the full picture at a glance. A nurse returning from a patient room should be able to re-orient in under 3 seconds by scanning the dashboard — no clicks, no navigation required.

**Applied to this system:** Patient cards show live status without interaction. Processing states use inline indicators (not modals). Flag badges persist on cards until resolved. The dashboard is the nurse's home screen and always reflects current state.

---

### 6. Accessible Under Duress — Design for variable lighting, fatigue, and the 11th hour of a shift

Accessibility is not a checkbox — it's a clinical safety requirement. High contrast text on all surfaces (never light gray on white). Color is never the sole indicator of meaning — always paired with text, icon, or position. WCAG 2.1 AA is the floor. Design for the extreme: dim ward lighting at 3am, nurse on hour 11, eyes fatigued. If it's readable then, it's readable always. Generous spacing prevents misclicks. Large touch/click targets on all action buttons.

**Applied to this system:** Minimum 4.5:1 contrast on all text. Flag states use color + text label + icon. Action buttons have generous padding (min 44px touch target). Typography uses high-weight headings, comfortable line height (1.5+), and sufficient font size (16px base minimum).

---

### 7. Protect Against Catastrophic Error — Hide the ejector seat, surface the safety net

Irreversible or high-consequence actions must be deliberately protected. AI-generated content is always presented for human review before it affects the record. Override and escalation paths are available but not the default — the safe path (approve) is visually prominent, the dangerous path (override) requires deliberate secondary action. Immediate feedback on every action — spinners on processing, confirmation on save — so the nurse never wonders whether the system registered their decision.

**Applied to this system:** Flagged notes require explicit human action before proceeding. "Override" is visually de-emphasized compared to "Approve" and "Escalate." Every submit and confirm action shows immediate processing feedback. No destructive action is one click away.

---

## Integration Notes

These principles must be referenced by:
- **Agent 3 (design-system):** Every component spec must trace back to at least one principle
- **Agent 6 (builder):** Implementation must respect scan-first hierarchy and zero-friction patterns
- **Agent 10 (design-review):** Review checklist should verify each principle is reflected in the final build
