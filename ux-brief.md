# UX Brief: AI-Native Nurse Context Engine
_Last updated: 2026-02-27_

## Project Summary
A living patient context system that gives hospital nurses instant situational awareness across three workflows they currently rebuild from scratch every time: charting (structuring raw observations into clinical notes), shift handoff (synthesizing 24 hours of patient history into a reliable briefing), and supply preparation (generating procedure-specific checklists). Success looks like a nurse who never has to reconstruct context from memory — the system holds it continuously and surfaces it at the exact moment it's needed.

## Project Type
Web App — clinical workflow tool for hospital nursing staff, optimized for desktop workstation use during 12-hour shifts.

## Primary Goal
Eliminate the cognitive reconstruction burden that consumes 30-40% of every nursing shift by maintaining a continuously updated patient context layer that powers structured notes, handoff reports, and supply checklists.

## Success Metrics
- All three demo scenarios (straightforward, complex/flagged, dynamic/shift change) run end-to-end without errors
- Nurse can go from raw dictation to structured output in under 8 seconds
- Incoming nurse receives a complete, current handoff briefing before entering the patient room — including changes made minutes before shift change
- Zero missed flags: every anomaly detected by AI is surfaced visibly for human review

---

## Users

### Primary Archetype: Shift Nurse (Outgoing)
**Who they are:** Registered nurse on a 12-hour hospital shift, responsible for 4-8 patients across general or ICU wards. Expert clinician. Not a technology novice, but has zero patience for tools that add friction to an already overloaded workflow. Works under time pressure, cognitive load, and physical fatigue for the entire shift.
**What they want:** To document observations quickly and accurately without interrupting patient care. To hand off cleanly at shift end without spending 30+ minutes preparing verbal reports from memory. To walk into the supply room once, with the right list, and walk out ready.
**What they know:** Clinical practice deeply. Patient status from direct observation. Hospital protocols. What "normal" looks like for each patient — and what doesn't. They know the current system is broken; they compensate with personal workarounds (pocket notebooks, memory, asking colleagues).
**What they fear:** Missing something critical because it wasn't documented or communicated. Being responsible for a patient outcome that could have been prevented with better information flow. A new tool that creates more work instead of less.
**Trust signals they respond to:** Structured, consistent output they can rely on under pressure. Visible reasoning — show why something was flagged, not just that it was. Speed — if it's slower than their current workaround, they won't use it. Accuracy — one wrong supply list or missed flag and trust is gone permanently.

### Secondary Archetype: Shift Nurse (Incoming)
**Who they are:** Same professional profile as above, but arriving cold. Starting a shift with patients they may have never seen before. Has 15-30 minutes to get situational awareness on 4-8 patients before they're responsible for care decisions.
**What they want:** Complete, reliable situational awareness before stepping into a patient room. To know: what changed, what needs watching, what's stable, and what to do first. To not depend on the outgoing nurse's memory, communication skill, or how tired they are.
**What they know:** General clinical knowledge and hospital protocols. Nothing specific about these patients until they receive handoff.
**What they fear:** Inheriting a patient with an unmentioned change in condition. Walking into a room unprepared. The outgoing nurse forgetting to mention something critical because they were rushed.
**Trust signals they respond to:** Recency — the report must reflect the most current state, not what was true 6 hours ago. Completeness — every flag, every change, every pending action visible. Prioritization — what matters most is shown first. Timestamp visibility — knowing when the report was generated and when each piece of information was last updated.

---

## Journey Map: Shift Nurse (Outgoing)

| Stage | What They Do | What They Think/Feel | Design Implication |
|---|---|---|---|
| Shift Start | Receives verbal handoff from outgoing nurse. Scribbles notes on paper or personal reference sheet. Tries to build a mental model of each patient. | "I hope they didn't forget anything. Let me check the chart to verify." Anxious, scanning for gaps. | System should already hold current context. Patient cards should surface status, flags, and last update at a glance — reducing dependence on verbal handoff quality. |
| Patient Round | Enters room, assesses patient, makes observations. May adjust medication, perform procedure, note changes. | Fully present with the patient. Clinical judgment active. Not thinking about documentation yet. | Input must not require the nurse to leave the patient's side mentally. Dictation (voice/typing) should feel natural, not like filling out a form. |
| Documentation | Returns to workstation or finds a quiet moment. Reconstructs observations from memory. Types or writes notes — often 30-60 minutes after the observation. | "What was her BP again? Was it the left or right drain?" Frustrated by memory decay. Knows the note won't be as accurate as it could be. | Dictation input should be available immediately during or right after observation. Structured output should be generated from raw input — the nurse doesn't have to format it. |
| Procedure Prep | Walks to supply room. Tries to remember what's needed. Makes multiple trips. Wastes supplies that entered a patient room but weren't used. | "I think I need the 10ml syringe... actually maybe the 20." Cognitive effort on a task that should be automatic. | Supply list should auto-generate from procedure mention in notes. Nurse confirms/adjusts — doesn't build from scratch. Checklist visible before they leave the workstation. |
| Shift End / Handoff | Prepares verbal report for incoming nurse. Tries to summarize 12 hours from memory and notes. Quality depends entirely on their energy and communication. | "I hope I'm not forgetting anything. I just want to go home." Exhausted, rushing, anxious about completeness. | Handoff report generated on demand from the system's full record — not the nurse's memory. Report is complete, current, prioritized. Nurse reviews and approves rather than creates from scratch. |

### Recurring Use Loop

| Stage | What They Do | What They Think/Feel | Design Implication |
|---|---|---|---|
| Re-entry | Returns to the system after patient interaction, procedure, or break. | "What did I miss? What's changed?" Needs instant re-orientation. | Dashboard must show what's changed since last view. Flags and recent updates visually prominent. No cognitive cost to re-engage. |
| Core Task | Dictates or types observation. Reviews structured output. Confirms or adjusts AI-generated content. | "Is this right? Did it catch the important stuff?" Evaluating, not creating. Faster than writing from scratch but needs to trust the output. | Structured note must be readable at a glance. Flag reasoning must be visible. Approve/override controls must be immediate — no navigation required. |
| Completion | Note saved. Supply list generated if applicable. Returns to patient care. | "Done. Next patient." Relief. Wants to move on immediately. | Confirmation state should be brief and clear. No modal dialogs, no required secondary actions. System handles downstream effects (supply list, record update) automatically. |

---

## Journey Map: Shift Nurse (Incoming)

| Stage | What They Do | What They Think/Feel | Design Implication |
|---|---|---|---|
| Shift Start | Arrives on unit. Needs to get up to speed on all assigned patients before entering any room. | "What am I walking into today?" Alert, apprehensive, scanning for risk. | Handoff report must be available before they start. Patient dashboard gives instant overview. Flags visible at the list level — they know who needs attention first without clicking into each patient. |
| Handoff Review | Reads or listens to handoff report. Asks clarifying questions. Identifies priority patients. | "Did anything change since this was written? Is this current?" Trust calibration happening in real time. | Report must include generation timestamp and timestamps on each data point. Priority flags shown first. Stable items last. Recommended first actions give them a starting point. |
| First Patient Contact | Enters the room with the highest-priority patient. Uses handoff report as reference. | "I know what to look for. I'm not going in blind." Confident if report was good. Anxious if gaps were visible. | Report should be accessible on workstation — not something they need to print or memorize. Key flags and actions should be scannable in 10 seconds. |
| Ongoing Shift | Transitions from "incoming" to "outgoing" role — now they're the one documenting, preparing, and eventually handing off. | Mental model builds over the shift. They become the expert on these patients. | Seamless transition — the same system that briefed them now receives their input. No mode switching. No separate tools for reading vs. writing. |

---

## Competitive Landscape

**Does this well:** Epic Systems (EHR) — comprehensive charting, industry standard, deeply integrated with hospital systems. But: designed for compliance, not for cognitive support. Nurses describe it as "documentation for the chart, not for the nurse."

**Does this poorly:** Verbal handoff (current standard) — entirely dependent on individual nurse quality, memory, and energy level. No structure, no completeness guarantee, no audit trail. One nurse called it "a game of telephone."

**Our differentiation:** This is not a charting replacement or EHR competitor. It's a context layer — it sits between the nurse's raw observations and every downstream action (documentation, supply prep, handoff). It makes the nurse's existing knowledge continuously available to them and to the next nurse, without requiring them to reconstruct it from memory each time.

---

## Constraints

| Constraint | Detail |
|---|---|
| Accessibility | WCAG 2.1 AA — non-negotiable. Nurses work under variable lighting, often fatigued. High contrast and clear typography are clinical safety requirements, not just compliance. |
| Browsers/Devices | Desktop only (workstation tool). Chrome primary, Firefox secondary. Minimum 1280px width. |
| Performance | n8n → Claude → response must be under 8 seconds for note structuring. Loading states must be explicit and reassuring — the nurse needs to know the system is working, not frozen. |
| Brand | Clean, minimal, clinical. White backgrounds, high contrast, generous spacing. Color only for semantic meaning (flags, status). No decorative elements. Think: what a nurse would trust on hour 11 of a 12-hour shift. |
| Content | All demo content pre-scripted. Three patients, three scenarios. Typewriter animation simulates dictation — no live microphone required. |
| Tech Stack | Next.js 14 (App Router), Tailwind CSS, TypeScript, Supabase, n8n, Claude API. Local deployment only. |
| Timeline | Hard deadline: March 2, 2026 — 11:59pm EST. |

---

## Design Implications

1. **Speed over discoverability.** This is an expert tool for repeat users under time pressure. Every interaction should optimize for the nurse who already knows what they're doing — not for first-time onboarding. Progressive disclosure is fine, but core workflows must be zero-friction.

2. **Flags are the highest-priority visual element.** A missed flag has real consequences. Flag badges must be visible at the dashboard level (before clicking into a patient), use color semantically (amber = warning, red = critical, green = clear), and include reasoning — never just a colored dot without context.

3. **Trust is earned through transparency.** Show the AI's reasoning. Show why a note was flagged. Show when the data was last updated. Show the generation timestamp on every report. Nurses will not trust a black box — and they shouldn't. If the system says "this is abnormal," the nurse needs to see why.

4. **The system must feel like a relief, not a burden.** If any workflow takes longer with the system than without it, adoption fails. The bar is not "better than paper" — it's "faster and more reliable than my current personal workaround." Dictation → structured note must feel instantaneous. Supply list must appear without being requested. Handoff report must be generated in one click.

5. **Information density must be calibrated to task.** Dashboard: scannable, card-based, flags visible. Patient detail: comprehensive but organized by priority. Handoff report: narrative-first with structured flags. Supply list: checklist format, item-level confirmation. Each view serves a different cognitive mode and should be designed accordingly.

6. **Color is clinical, not decorative.** Every color in the interface must mean something. Amber means "this needs your attention." Red means "this is urgent." Green means "this is clear." Blue is the system accent — trustworthy, clinical, neutral. Any decorative use of color undermines the semantic system and erodes trust.

7. **The handoff report is the emotional climax of the demo.** This is where the viewer sees the full power of continuous context. The report should reflect changes made minutes before — proving the system is live, not a snapshot. Design this moment to land.

## Open Questions
- None at this stage — domain validation is complete and all three scenarios are fully specified.
