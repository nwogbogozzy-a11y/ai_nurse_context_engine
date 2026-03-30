# Component Priority Map: Nurse Context Engine

_Last updated: 2026-03-29 | Ranked by user journey frequency x clinical impact_

---

## Ranking Methodology

Components ranked using an **Importance/Feasibility matrix** (NotebookLM product-design-strategy) combined with **journey frequency analysis** from the UX Brief. Each component is scored on:

1. **Journey frequency:** How often does a nurse encounter this component during a 12-hour shift?
2. **Clinical impact:** What is the consequence of this component failing or being poorly designed?
3. **Trust dependency:** Does the nurse's trust in the overall system depend on this component working well?

---

## Tier 1: Build First (Table Stakes)

These components appear in every core workflow. If any of these fails, the system fails.

| Priority | Component | Journey Frequency | Clinical Impact | Trust Dependency | Rationale |
|---|---|---|---|---|---|
| 1 | **Flag Badge** | Every patient, every view | Critical -- missed flag = missed clinical event | System-defining | The single most important visual element. Appears on patient cards, note cards, handoff reports. If the badge is wrong, ambiguous, or invisible, the entire value proposition collapses. Build and validate this first. |
| 2 | **Patient Card** | Every dashboard load (4-8x per re-entry) | High -- determines which patient gets attention first | High -- first impression of system reliability | The nurse's primary scanning surface. Flag badge, name, status, and timestamp must be glanceable in under 2 seconds. This is where the nurse decides "who needs me." |
| 3 | **Structured Note Display (SOAP)** | Every note review (10-20x per shift) | Critical -- AI-structured clinical content requires human verification | System-defining | The core output of the system. If the SOAP note is unreadable, inaccurate, or doesn't surface flags inline, the nurse cannot verify AI output. Clinical safety depends on this component. |
| 4 | **Nurse Action Bar** | Every flagged note (variable, 2-8x per shift) | Critical -- approve/escalate/override is the human control surface | High -- this is where the nurse asserts authority over AI | The trust contract between human and AI. Safe path (Approve) must be visually dominant. Override must be deliberately de-emphasized. Wrong hierarchy here is a clinical safety failure. |
| 5 | **Dictation Input Panel** | Every observation entry (10-20x per shift) | High -- primary data input surface | High -- if input feels slow, nurses revert to paper | The nurse's primary interaction point. Must feel faster than their current workaround (paper, memory, EHR form). Typewriter animation, processing state, and submit flow must be seamless. |

---

## Tier 2: Build Second (Core Workflows)

These components complete the three core workflows. Buildable once Tier 1 is solid.

| Priority | Component | Journey Frequency | Clinical Impact | Trust Dependency | Rationale |
|---|---|---|---|---|---|
| 6 | **Handoff Report Panel** | 1-2x per shift (shift start/end) | Critical -- information loss at handoff causes adverse events | System-defining -- "the emotional climax of the demo" | Low frequency but highest-stakes single interaction. The incoming nurse's entire situational awareness depends on this component. Must show generation timestamp, priority flags first, stable items last, recommended actions. |
| 7 | **Supply Checklist** | 2-6x per shift (per procedure) | Medium -- wrong supplies waste time, not clinical safety | Medium -- convenience feature that builds daily trust | Appears automatically when procedure detected. Checkbox confirmation, quantity display, "Mark All Ready" CTA. If the checklist is accurate, the nurse saves 3-5 minutes per procedure. Compounds trust over a shift. |
| 8 | **Tab Navigation** | Every patient detail view (frequent) | Low -- navigation, not content | Medium -- broken tabs destroy flow | Connects Notes, Supplies, Handoff, Context, and Audit views. Must be keyboard-navigable, clearly indicate active tab, and preserve scroll position on tab switch. |
| 9 | **Patient Info Sidebar** | Every patient detail view | Medium -- context anchor for all other views | Medium -- reference surface, not decision surface | Name, ward, diagnosis, vitals summary, admitting information. Static reference that anchors the nurse's mental model while they work in the center panel. |

---

## Tier 3: Build Third (Supporting Views)

These complete the system but are not on the critical path for trust or safety.

| Priority | Component | Journey Frequency | Clinical Impact | Trust Dependency | Rationale |
|---|---|---|---|---|---|
| 10 | **Audit Log Table** | Infrequent (charge nurse, compliance review) | Medium -- compliance requirement | Low -- secondary user feature | Compact table with timestamp, nurse, action, and detail columns. Action badges (APPROVED / ESCALATED / OVERRIDDEN). Important for compliance but not part of the shift nurse's core loop. |
| 11 | **Processing State Indicator** | Every AI operation (10-20x per shift) | Medium -- silent failure erodes trust | High -- but simple to implement | Pulsing indicator + "AI is processing..." label. Must be visible but not alarming. Simple component but high trust impact -- implement early within Tier 1 components. |
| 12 | **Skeleton Loaders** | Every data fetch | Low -- cosmetic, but missing loaders feel broken | Medium -- polished loading = professional tool | Must match the exact shape of the content they replace. Patient cards get card-shaped skeletons. SOAP notes get section-shaped skeletons. No generic spinners. |
| 13 | **Empty States** | Rare (new patient, no notes yet) | Low | Low -- but blank screens feel broken | Single-line message + contextual CTA. "No notes recorded yet. Begin dictation to create the first note." No illustrations. |
| 14 | **Timeout/Retry UI** | Rare (network issues, AI timeout) | Medium -- silent timeout is unacceptable | High when it appears | Inline retry button + plain language message after 15-second AI timeout. "AI processing timed out. Retry?" Must not be a modal. |

---

## Build Order Summary

```
Week 1: Flag Badge → Patient Card → Structured Note Display → Nurse Action Bar
Week 2: Dictation Input Panel → Processing State → Skeleton Loaders
Week 3: Handoff Report Panel → Supply Checklist → Tab Navigation
Week 4: Patient Info Sidebar → Audit Log → Empty States → Timeout/Retry UI
```

---

## Cross-Role Priority Notes

| Role | Top Priority Components | Why |
|---|---|---|
| **Shift Nurse (Outgoing)** | Dictation Input, Structured Note, Supply Checklist | These are the tools they use 10-20x per shift |
| **Shift Nurse (Incoming)** | Handoff Report, Patient Card, Flag Badge | These orient them before first patient contact |
| **Charge Nurse** | Patient Card (dashboard), Audit Log, Flag Badge | They monitor multiple patients and review compliance |

The shift nurse's components (Tiers 1-2) must be built and validated before the charge nurse's views (Tier 3) get attention. Primary users define the build order; secondary users refine it.
