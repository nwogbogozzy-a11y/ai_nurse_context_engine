# Roadmap — AI-Native Nurse Context Engine (v2 Milestone)

*Generated: 2026-03-26*
*Granularity: Standard (5-8 phases)*
*Coverage: 30/30 requirements mapped*

---

## Phases

- [ ] **Phase 1: Functional Foundation** - Every nurse action has a database consequence; two distinct nurse identities support the handoff narrative
- [ ] **Phase 2: Compliance and Audit Trail** - Who did what, when, and why is recorded and visible — the system's strongest compliance signal
- [ ] **Phase 3: AI Context Memory** - The AI knows what happened on prior visits; supply recommendations carry rationale and attribution
- [ ] **Phase 4: Real-Time System and UI Overhaul** - Notes and flags appear live across tabs; every component uses the professional shadcn/ui system

---

## Phase Details

### Phase 1: Functional Foundation
**Goal**: Every nurse interaction has a persisted database consequence and is attributed to a named nurse identity
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05, FOUND-06, FOUND-07, FOUND-08, UI-07, UI-08
**Success Criteria** (what must be TRUE):
  1. Nurse can select a named identity (Sarah Chen or Marcus Webb) from a dropdown; all subsequent actions display and persist under that nurse's name
  2. Nurse can approve, escalate, or override a flagged note; refreshing the page shows the same action state — no reset
  3. Supply checklist confirmation state survives page refresh; confirmed items remain confirmed
  4. Handoff report's stable items and recommended first actions are visible after page reload (not lost on navigation)
  5. Submitting free-form text through the dictation panel produces a structured SOAP note identical in quality to the pre-scripted typewriter path; webhook errors display an actionable message with a retry option rather than silently failing
**Plans**: 4 plans
Plans:
- [x] 01-01-PLAN.md -- Schema migrations, type updates, Sonner install
- [x] 01-02-PLAN.md -- Nurse identity context and header switcher
- [x] 01-03-PLAN.md -- Dictation mode selector with free-form entry
- [x] 01-04-PLAN.md -- Persistence wiring, toast feedback, error states
**UI hint**: yes

---

### Phase 2: Compliance and Audit Trail
**Goal**: Every consequential nurse action is permanently recorded with actor attribution, creating a visible compliance record
**Depends on**: Phase 1
**Requirements**: COMP-01, COMP-02, COMP-03, COMP-04, UI-05, UI-09
**Success Criteria** (what must be TRUE):
  1. Every approve, escalate, override, generate-handoff, and confirm-supply action writes a row to the audit log with the acting nurse's name, timestamp, patient ID, and action metadata
  2. Patient detail view shows an "Activity" tab with a chronological timeline of all actions taken on that patient — nurse name, action type, and time visible at a glance
  3. A flagged note progresses visibly through three states — flagged, under review, resolved — with the resolving nurse's name and timestamp recorded on the note
  4. Flag badge on a note reflects the current review state (amber for flagged, distinct state for under review, green for resolved); state transitions are visible without page refresh
**Plans**: 2 plans
Plans:
- [x] 02-01-PLAN.md — Migration, types, audit helper, FlagBadge extension, NurseActionBar state machine
- [ ] 02-02-PLAN.md — ActivityTimeline component, Activity tab, app-level audit inserts
**UI hint**: yes

---

### Phase 3: AI Context Memory
**Goal**: The AI incorporates each patient's documented history when structuring notes and generating recommendations, making the "system remembers" narrative visible to the interviewer
**Depends on**: Phase 1
**Requirements**: AICTX-01, AICTX-02, AICTX-03, AICTX-04, UI-04, UI-10
**Success Criteria** (what must be TRUE):
  1. When a nurse submits a new note, the Claude prompt includes the patient's last five notes (Assessment and Plan sections only); the resulting SOAP note visibly reflects prior clinical context when compared to a cold-context response
  2. Patient detail left panel displays an AI-generated "Patient Context" summary derived from prior notes — the summary updates when new notes are added
  3. The supply/recommendation panel displays "Procedure Prep Recommendations" with a rationale line per item ("AI suggested based on chest drain + ICU context") rather than an unlabeled checklist
  4. Structured SOAP note output uses clear visual section headers, indentation, and temporal markers; handoff report renders with summary, priority flag badges, stable items, and recommended actions in a professionally formatted layout
**Plans**: 3 plans
Plans:
- [x] 03-01-PLAN.md — Migration, types, n8n workflow (prior notes, prompt enrichment, patient summary generation)
- [x] 03-02-PLAN.md — StructuredNote polish, HandoffReport card layout, SupplyChecklist rationale
- [x] 03-03-PLAN.md — PatientContextSummary component, Context tab wiring, supply lookup workflow
**UI hint**: yes

---

### Phase 4: Real-Time System and UI Overhaul
**Goal**: Notes, flags, and audit events propagate live across open browser tabs; every component in the application is rebuilt on the shadcn/ui system with WCAG 2.1 AA compliance
**Depends on**: Phase 1, Phase 2
**Requirements**: RT-01, RT-02, RT-03, RT-04, UI-01, UI-02, UI-03, UI-06
**Success Criteria** (what must be TRUE):
  1. When Nurse A submits a note from one browser tab, Nurse B's open view of the same patient shows the new note without manual refresh; the same applies to handoff reports and supply requests
  2. Patient dashboard flag badges update live — flagging a note from the patient detail view causes the badge on the dashboard card to appear without navigating away and back
  3. All interactive components (buttons, dropdowns, dialogs, tabs) pass WCAG 2.1 AA contrast and keyboard navigation requirements; no custom CSS overrides semantic Radix behavior
  4. Patient dashboard card grid and patient detail three-panel layout use shadcn/ui components with consistent spacing, typography, and visual hierarchy; AI processing states show skeleton loaders rather than static "Processing..." text
**Plans**: 6 plans
Plans:
- [x] 04-01-PLAN.md — shadcn/ui init, CSS variable remapping, skeleton loaders, TimeoutRetry
- [x] 04-02-PLAN.md — Supabase Realtime migration + subscription hooks
- [ ] 04-03-PLAN.md — Layout header, NurseSwitcher, FlagBadge, NurseActionBar, PatientCard migration
- [ ] 04-04-PLAN.md — StructuredNote, DictationInput, SupplyChecklist, HandoffReport migration
- [ ] 04-05-PLAN.md — ActivityTimeline, PatientContextSummary, ProcedureSearch migration
- [ ] 04-06-PLAN.md — Page-level wiring: realtime subscriptions, shadcn Tabs, visual polish
**UI hint**: yes

---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Functional Foundation | 4/4 | Complete |  |
| 2. Compliance and Audit Trail | 0/2 | In Progress | - |
| 3. AI Context Memory | 0/3 | Not started | - |
| 4. Real-Time System and UI Overhaul | 0/6 | Not started | - |
