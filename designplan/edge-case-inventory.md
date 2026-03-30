# Edge Case Inventory: Nurse Context Engine

_Last updated: 2026-03-29 | Every key view x every non-happy-path state_

_Grounded in NotebookLM ux-interaction guidance: "Systems should never lock up or issue an error because non-critical data is missing." "The UI must never freeze or leave a mute dialog box on the screen." "Never present a completely blank slate."_

---

## State Definitions

| State | Definition | Design Mandate |
|---|---|---|
| **Empty** | No data exists yet for this view | Contextual hint + CTA. Never a blank surface. |
| **Loading** | Data is being fetched | Skeleton loader matching content shape. Never a spinner. |
| **AI Processing** | Claude API is generating output | Pulse indicator + status label. `aria-busy="true"`. |
| **AI Timeout** | 15 seconds elapsed, no response | Inline retry UI. Plain language. Never silent failure. |
| **AI Error** | API returned an error or malformed response | Error message in context + retry. Never a modal. |
| **Partial Data** | Some fields populated, others missing | Accept and display what exists. Modeless hint for missing fields. |
| **Flagged** | AI detected anomaly requiring human review | Flag badge + reason + action bar. `role="alert"` for critical. |
| **Stale** | Data is older than expected freshness window | Timestamp turns amber. "Last updated X minutes ago" warning. |
| **Network Offline** | Connection lost to Supabase or n8n | Persistent status bar. Disable submit. Show last-known state. |

---

## View: Patient Dashboard

| State | What the Nurse Sees | Implementation Notes |
|---|---|---|
| **Empty (no patients)** | "No patients assigned to this shift. Contact charge nurse for patient assignments." | Single line, centered, body text. No illustration. |
| **Loading** | 3 card-shaped skeleton loaders in grid | Skeletons match patient card dimensions: name line, ward line, timestamp line, badge placeholder. |
| **Partial (1 of 3 patients loaded)** | Loaded card renders; other 2 show skeleton | Cards appear independently as data arrives. No "all or nothing." |
| **Flagged patient** | Card has red or amber left border + flag badge | Flag visible at dashboard level. Nurse knows who needs attention before clicking. |
| **Stale data** | Timestamp on card turns amber: "Last updated 45 min ago" | Triggers if no update received in 30+ minutes for a patient with active flags. |
| **Real-time update (new note added)** | New data prepended. 100ms highlight fade on updated card. | No layout push. No full-page refresh. Highlight draws eye without disrupting scan. |
| **Network offline** | Top bar: "Connection lost. Displaying last known state." Disable "Begin Dictation" button. | Persistent, modeless. Disappears automatically on reconnection. |

---

## View: Dictation Input Panel

| State | What the Nurse Sees | Implementation Notes |
|---|---|---|
| **Idle** | Empty textarea. "Begin dictation or type observation..." placeholder. Submit button enabled. | Clean, ready state. No clutter. |
| **Animating (demo mode)** | Typewriter text appearing at 40ms/char. Blinking cursor. Submit disabled. | `disabled` attribute on button. Nurse watches the simulation. |
| **AI Processing** | Textarea dimmed. Pulse indicator below: "AI is processing..." | `aria-busy="true"` on output container. No modal. No spinner. |
| **AI Timeout (15s)** | Pulse stops. Inline message: "Processing timed out. Your input is saved." Retry button appears. | Retry button is primary style. Input text preserved. Nurse does not need to re-type. |
| **AI Error** | Inline message: "Unable to process dictation. Your input is saved." Retry button + "Submit as unstructured note" fallback. | Two paths: retry AI, or save raw text as-is. Never lose the nurse's input. |
| **Empty submission** | Submit button stays disabled until textarea has content. | No error message needed. Button simply doesn't activate. Bounded control. |
| **Very long input (>2000 chars)** | Character count appears: "1847 / 2000 characters." Warning at 1800+. | Modeless feedback. Do not truncate silently. |

---

## View: Structured Note Display (SOAP)

| State | What the Nurse Sees | Implementation Notes |
|---|---|---|
| **Loading (after processing)** | Skeleton matching SOAP structure: 4 section blocks with label + content placeholder. | Each section block is a distinct skeleton. Not one gray rectangle. |
| **Complete, no flags** | Full SOAP note. Flag badge: "Clear" (green). No action bar. | Clean, approving state. Nurse scans and moves on. |
| **Flagged (warning)** | Amber flag badge. Flag reason block below affected section. Action bar: Approve / Escalate / Override. | Flag reason has `role="alert"`. Action bar appears only on flagged notes. |
| **Flagged (critical)** | Red flag badge. Same as warning but red container. `role="alert"` with urgency. | Screen reader announces immediately. |
| **Partial SOAP (missing section)** | Section renders with label but content shows: "No data for this section." Muted text. | AI returned incomplete output. Show what exists. Modeless hint on missing section. Do not block the entire note. |
| **AI hallucination / suspect data** | No automatic detection in v1. Nurse uses Override button if they disagree. | Future: highlight suspect values with amber border. "Audit, don't edit" principle. |
| **Review status lifecycle** | Pill transitions: Flagged (amber) → Under Review (blue) → Resolved (green). | Each state is a distinct visual. Pill is always visible top-right of card. |
| **Multiple flags on same note** | Each flag reason stacks vertically in the flag reason block. Badge shows highest severity. | Badge: Critical > Warning > Clear. All reasons visible. |

---

## View: Supply Checklist

| State | What the Nurse Sees | Implementation Notes |
|---|---|---|
| **No procedure detected** | Tab shows: "No procedures detected in recent notes. Search for a procedure to generate a supply list." + search input. | CTA is a procedure search field, not a dead end. |
| **Loading** | Skeleton table: 4 rows with checkbox + item + quantity placeholders. | Matches table structure exactly. |
| **Complete** | Full checklist with checkboxes, quantities, AI rationale line. "Mark All Ready" button. | Default state. All checkboxes unchecked. |
| **Partially confirmed** | Checked items: name struck through, row muted. Unchecked items: full opacity. | "Mark All Ready" button remains enabled. Count indicator: "3 of 6 confirmed." |
| **All confirmed** | All items struck through. "Mark All Ready" button changes to "All Ready" (green, disabled). | Completion state. Button provides closure feedback. |
| **AI-generated item nurse doesn't need** | Nurse leaves it unchecked. No mechanism to remove in v1. | Future: "Remove" action per item. For now, unchecked = not needed. |
| **Missing quantity/unit** | Item name shows. Quantity/unit shows "--". Muted. | Partial data accepted. Nurse can proceed with what's there. |

---

## View: Handoff Report

| State | What the Nurse Sees | Implementation Notes |
|---|---|---|
| **Not yet generated** | "No handoff report generated for this patient. Generate report for incoming shift." + "Generate Report" CTA. | Single CTA. No blank four-card layout. |
| **Generating** | Four card placeholders with skeleton loaders. "Generating handoff report..." label with pulse. | Skeletons match card shapes: summary paragraph, flag list, bullet list, numbered list. |
| **Generated, no flags** | Summary card, empty Priority Flags card: "No priority flags for this patient." Stable items, recommended actions. | Empty priority flags is a positive signal. Green "Clear" indicator. |
| **Generated, with critical flags** | Priority Flags card elevated. Red severity badge. Flag detail text. | Priority Flags card gets `role="alert"` for critical items. |
| **Stale report (>30 min old)** | Amber timestamp: "Generated 45 minutes ago. New notes have been added since this report." + "Regenerate" CTA. | Modeless staleness warning. Nurse decides whether to regenerate. |
| **Report generated, then new note added** | Same stale warning triggers. "1 new note since this report was generated." | Real-time awareness. The report is not a snapshot unless the nurse treats it as one. |
| **AI timeout during generation** | Skeleton loaders stop. "Report generation timed out. Retry?" + Retry button. | Same timeout pattern as dictation. Never silent failure. |

---

## View: Audit Log

| State | What the Nurse Sees | Implementation Notes |
|---|---|---|
| **Empty** | "No audit events recorded for this patient." | Single line. No table headers with empty rows. |
| **Loading** | Skeleton table: 4 rows matching column widths. | Column-accurate skeletons. |
| **Populated** | Table with timestamp, nurse, action badge, detail. | Default state. Sorted reverse-chronological. |
| **Many events (50+)** | First 20 visible. "Show more" button at bottom. Pagination, not infinite scroll. | Progressive disclosure. Do not load 200 rows on a clinical workstation. |

---

## Global Edge Cases

| State | Scope | What the Nurse Sees | Implementation Notes |
|---|---|---|---|
| **Session timeout** | All views | Modeless top bar: "Session expiring in 5 minutes. Activity will extend your session." | Auto-extends on any interaction. Never a modal interrupt during clinical work. |
| **Concurrent edit** | Notes, checklists | "This patient's record was updated by [Nurse Name] at [time]. Refresh to see changes." | Modeless banner. Do not auto-refresh and disrupt current view. |
| **Supabase Realtime disconnection** | All views | Status indicator in header: yellow dot + "Real-time updates paused." | Reconnects automatically. Dot returns to green on reconnection. |
| **Browser tab backgrounded** | All views | On re-focus: check for updates, prepend if needed, show highlight. | Catch-up on return. Do not accumulate a queue of animations. |
| **1280px viewport (minimum)** | All views | 3-column layout compresses. Sidebar narrows to 240px. Right panel to 360px. | Test at minimum. Never break at 1280px. |
