# Anti-Patterns List: Nurse Context Engine

_Last updated: 2026-03-29 | 10 things this UI must never do_

_Grounded in NotebookLM ux-interaction + visual-design + product-design-strategy queries. Each anti-pattern includes the source principle, a concrete violation example, and the enforcement mechanism for design-review._

---

## 1. Never Make AI Output Visually Identical to Human Input

**Source:** CLAUDE.md Hard Rule #8, design-principles Principle #3 (Transparent Reasoning)

**What it means:** Every surface that displays AI-generated content (structured notes, supply lists, handoff reports, flag reasons) must carry a visual distinction marker. This is not a style preference. A nurse who mistakes AI output for a human-written observation may act on unverified information.

**Violation example:** A SOAP note renders in the same font, weight, and color as the original dictation text, with no "AI-Structured" label or visual differentiation.

**Enforcement:** design-review Category 1 (Clinical Safety), item 1. 🔴 CRITICAL if AI-generated content is not visually distinct from human input on any surface.

---

## 2. Never Use Color as the Sole Indicator of Meaning

**Source:** NotebookLM visual-design (Universal Principles of Design), NotebookLM ux-interaction (About Face, Designing for the Digital Age). 5-8% of males have color vision deficiency.

**What it means:** Every flag badge, status indicator, and semantic color must be paired with a text label and/or icon. A green dot alone does not communicate "Clear." A red border alone does not communicate "Critical."

**Violation example:** A patient card has a red left border but no flag badge text or icon. A colorblind nurse sees a gray border and misses the alert.

**Enforcement:** design-review Category 2 (Accessibility). 🔴 CRITICAL if any semantic color token is used without an accompanying text label.

---

## 3. Never Use Modal Dialogs to Interrupt Clinical Workflows

**Source:** NotebookLM ux-interaction (About Face): "Don't stop the proceedings with idiocy." Modals in clinical environments are dangerous -- they interrupt workflow and demand cognitive attention to dismiss during time-critical tasks.

**What it means:** No confirmation modals, no success modals, no error modals. All feedback is modeless and inline. Processing states are inline. Errors are inline. Confirmations are immediate visual state changes, not dialog boxes.

**Violation example:** After approving a flagged note, a modal appears: "Note approved successfully! Click OK to continue." The nurse has to dismiss it before attending to the next patient.

**Enforcement:** design-review Category 3 (Interaction Fidelity). No modals in the component inventory. System.md specifies no modals.

---

## 4. Never Fail Silently on AI Timeout or Error

**Source:** NotebookLM ux-interaction: "The UI must never freeze or leave a mute dialog box on the screen if a connection is lost or a process times out." CLAUDE.md constraint: "15-second AI timeout must be surfaced with retry UI, not silent failure."

**What it means:** Every AI operation (note structuring, supply generation, handoff generation) must have explicit timeout handling. After 15 seconds: stop the processing indicator, display a plain-language message, and offer a retry button. The nurse's input is never lost.

**Violation example:** The nurse submits a dictation. The pulse indicator runs for 45 seconds. Nothing happens. The nurse doesn't know if the system crashed, the network dropped, or the AI is still thinking.

**Enforcement:** design-review Category 3 (Interaction Fidelity). 🔴 CRITICAL if 15-second AI timeout has no retry UI.

---

## 5. Never Use Routine Confirmation Dialogs

**Source:** NotebookLM ux-interaction (About Face): "When a confirmation box is issued routinely, users get used to approving it routinely. So, when it eventually reports an impending disaster, he goes ahead and approves it anyway, because it is routine. Like the fable of the boy who cried wolf."

**What it means:** Do not ask "Are you sure?" for reversible actions (saving a note, confirming a supply item, generating a report). Reserve confirmation for truly irreversible actions only (Override on a critical flag). Even then, prefer a two-step interaction (de-emphasized button + deliberate click) over a confirmation modal.

**Violation example:** Every time the nurse checks a supply item, a dialog appears: "Confirm this item is ready?" The nurse starts clicking "Yes" without reading. Eventually, they confirm an item they actually needed to review.

**Enforcement:** No confirmation dialogs in the component inventory. Override button is de-emphasized (ghost style) rather than confirmed via dialog.

---

## 6. Never Present a Blank Slate Without Context

**Source:** NotebookLM ux-interaction (About Face): "Blank slates intimidate most people. Provide contextual hints, brief instructions, or quick-start templates."

**What it means:** Every empty state must include a single-line message explaining why it's empty and a contextual CTA for the next logical action. No blank white panels. No empty tables with only headers.

**Violation example:** The nurse opens the Supplies tab for a patient with no procedures mentioned. They see an empty white panel with column headers: Item | Qty | Unit | Notes | Confirm. No explanation, no action.

**Enforcement:** Edge case inventory defines empty states for every view. design-review checks for blank slates.

---

## 7. Never Use Spinners or Decorative Animation

**Source:** design-principles Principle #5 (Modeless Status Visibility), system.md Motion Rules: "Pulse animation for processing, not spinner. Spinners create urgency anxiety; pulse communicates 'working' without alarm."

**What it means:** Processing states use a subtle pulse indicator. Loading states use skeleton loaders that match the shape of the content they replace. No spinning wheels, no bouncing dots, no progress circles. Motion exists only to communicate state change.

**Violation example:** While AI processes a dictation, a large circular spinner appears centered on screen with "Loading..." text. The nurse on hour 11 feels the system is struggling. Anxiety increases.

**Enforcement:** design-review Category 3 (Interaction Fidelity). 🟡 WARNING if any loading state uses a spinner instead of skeleton. System.md specifies "skeleton loaders only, no spinners."

---

## 8. Never Hardcode Visual Values in Components

**Source:** CLAUDE.md Hard Rule #3: "Semantic tokens only. No hardcoded hex, px, or arbitrary Tailwind values in components."

**What it means:** Every color, spacing, and typography value in a component must reference a semantic token defined in system.md. No `#EF4444` in a component file -- use `text-flag-critical`. No `text-[13px]` -- use the defined type scale. If a value isn't in the system, flag it before using it.

**Violation example:** A developer writes `bg-[#FEF2F2]` instead of `bg-flag-critical-bg` because they looked up the hex value directly. The token gets updated in the system; the hardcoded component doesn't change.

**Enforcement:** design-review Category 4 (System Compliance). 🔴 CRITICAL if any hardcoded hex, px, or arbitrary Tailwind value appears in a component.

---

## 9. Never Rearrange Data or Push Layout on Real-Time Updates

**Source:** NotebookLM ux-interaction (GUI Bloopers): "When software changes a display to show the effect of a user's actions, it should try to minimize what it changes. Sudden shifts cause users to lose track of where they are."

**What it means:** When a new note arrives via Supabase Realtime, it prepends to the list with a 100ms highlight fade. It does not push existing items down with an animation. It does not sort the entire list. It does not jump the scroll position. The nurse's eyes stay where they were; the new item appears above their current focus.

**Violation example:** The nurse is reading a SOAP note when a new note arrives. The entire list re-sorts, the note they were reading jumps down, and they lose their place. They have to scan the list again to find where they were.

**Enforcement:** design-review Category 3 (Interaction Fidelity). 🟡 WARNING if real-time prepend uses layout push instead of highlight fade.

---

## 10. Never Add Decorative Elements, Gradients, or Drop Shadows Beyond shadow-md

**Source:** CLAUDE.md Brand Rules: "No consumer aesthetic. No gradients, drop shadows, or decorative elements." NotebookLM visual-design: "If a clinical tool looks inappropriately polished -- as if it were 'designed by a marketing team' -- users will actually become skeptical of its trustworthiness."

**What it means:** No hero images. No decorative illustrations in empty states. No gradient backgrounds on headers. No `shadow-lg` or `shadow-xl`. No colored backgrounds on page sections. No rounded-2xl or rounded-3xl. The interface is a precision instrument. Every pixel serves a function.

**Violation example:** The dashboard header has a gradient from sky-500 to blue-600. Patient cards have a large drop shadow. The empty state shows a friendly illustration of a nurse with a clipboard. The system looks like a consumer health app. A charge nurse sees it and immediately questions whether it's a serious clinical tool.

**Enforcement:** Brand guide checklist. design-review Category 4 (System Compliance). Visual inspection against the "What This Brand Is Not" section.

---

## Quick Reference

| # | Anti-Pattern | Severity | Source |
|---|---|---|---|
| 1 | AI output identical to human input | 🔴 CRITICAL (clinical safety) | CLAUDE.md Rule #8 |
| 2 | Color as sole meaning indicator | 🔴 CRITICAL (accessibility) | NotebookLM visual-design |
| 3 | Modal dialogs interrupting workflow | 🔴 CRITICAL (clinical safety) | NotebookLM ux-interaction |
| 4 | Silent failure on AI timeout | 🔴 CRITICAL (trust) | CLAUDE.md, NotebookLM ux-interaction |
| 5 | Routine confirmation dialogs | 🟡 HIGH (trust erosion) | NotebookLM ux-interaction |
| 6 | Blank slates without context | 🟡 HIGH (usability) | NotebookLM ux-interaction |
| 7 | Spinners or decorative animation | 🟡 MEDIUM (stress, brand) | design-principles, system.md |
| 8 | Hardcoded visual values | 🔴 CRITICAL (system integrity) | CLAUDE.md Rule #3 |
| 9 | Layout push on real-time updates | 🟡 MEDIUM (disorientation) | NotebookLM ux-interaction |
| 10 | Decorative elements or gradients | 🟡 MEDIUM (brand, trust) | CLAUDE.md Brand Rules |

---

## How design-review Uses This Document

Each anti-pattern maps to a specific design-review checklist category. During review:

1. **Scan every component** for violations of items 1, 2, 8 (these are the most commonly introduced accidentally).
2. **Test every AI-connected flow** for violations of items 3, 4, 5, 7 (these only appear during runtime).
3. **Audit the visual output** for violations of items 6, 9, 10 (these are visible in static review).

Any 🔴 CRITICAL violation blocks shipment. The builder must acknowledge and fix before the section is marked complete.
