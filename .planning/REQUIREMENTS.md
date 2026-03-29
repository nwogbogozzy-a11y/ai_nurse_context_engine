# Requirements — v2 Milestone

## v1 Requirements

### Functional Foundation

- [x] **FOUND-01**: Nurse can switch active identity via dropdown (predefined nurses: Sarah Chen - Night, Marcus Webb - Morning) and all subsequent actions are attributed to the selected nurse
- [x] **FOUND-02**: Nurse can approve a flagged note and the approval persists to Supabase (survives page refresh)
- [x] **FOUND-03**: Nurse can escalate a flagged note and the escalation persists to Supabase (survives page refresh)
- [x] **FOUND-04**: Nurse can override a flagged note and the override persists to Supabase (survives page refresh)
- [x] **FOUND-05**: Supply requests are linked to notes via note_id foreign key (not timestamp proximity)
- [x] **FOUND-06**: Handoff report extras (stable_items, recommended_first_actions) persist to Supabase and display on page reload
- [x] **FOUND-07**: Supply checklist confirmation state persists to Supabase (survives page refresh)
- [x] **FOUND-08**: Dictation input supports both pre-scripted demo scenarios (typewriter animation) and free-form text entry that the nurse types directly — both paths submit to n8n and produce structured SOAP output

### Compliance & Accountability

- [x] **COMP-01**: Every nurse action (approve, escalate, override, generate handoff, confirm supply) writes an audit event to an audit_log table with nurse_name, action_type, patient_id, timestamp, and metadata
- [x] **COMP-02**: Patient detail view includes an "Activity" tab showing chronological audit trail for that patient
- [x] **COMP-03**: Flagged notes support a review status state machine (flagged -> under_review -> resolved) with resolving nurse attribution and timestamp
- [x] **COMP-04**: Flag escalation state transitions are visible as badge progression on the note display

### AI Context Intelligence

- [x] **AICTX-01**: When structuring a new note, the AI prompt includes a summary of the patient's prior notes (last 5 notes, Assessment + Plan sections) as context
- [x] **AICTX-02**: Patient detail view shows a "Patient History" section displaying the AI-aggregated context summary
- [x] **AICTX-03**: Supply checklist is reframed as "Procedure Prep Recommendations" with rationale attribution ("AI suggested based on [procedure] + [patient context]")
- [x] **AICTX-04**: Each supply/recommendation item shows confidence context (procedure source, unit type consideration)

### Real-Time System

- [x] **RT-01**: When Nurse A submits a note, Nurse B's open view of the same patient updates automatically without manual refresh (Supabase Realtime subscription on notes table)
- [x] **RT-02**: When a handoff report is generated, any open patient view reflects the new report automatically
- [x] **RT-03**: When supply requests are created, any open patient view reflects the new supplies automatically
- [x] **RT-04**: Patient dashboard (home page) reflects status changes in real-time (flag badges update live)

### UI Professional Polish

- [x] **UI-01**: All components upgraded to shadcn/ui with Radix primitives (WCAG 2.1 AA accessible by default)
- [ ] **UI-02**: Patient dashboard uses card components with clear visual hierarchy (name, ward, status, last note timestamp, flag badges)
- [ ] **UI-03**: Patient detail view three-panel layout has professional typography, spacing, and visual separation between panels
- [x] **UI-04**: Structured SOAP notes display with clear visual hierarchy (section headers, indentation, temporal context)
- [x] **UI-05**: Flag badges use semantic color system consistently (amber=warning, red=critical, green=safe) with sufficient contrast for WCAG AA
- [x] **UI-06**: Loading states use skeleton components during AI processing (not just "Processing..." text)
- [x] **UI-07**: Error states display actionable feedback when webhook calls fail (not silent failures)
- [x] **UI-08**: Toast notifications for nurse actions (approve, escalate, override) confirming persistence via sonner
- [x] **UI-09**: Audit trail / Activity tab uses clean timeline component with nurse avatars and action icons
- [x] **UI-10**: Handoff report renders with professional clinical formatting (summary, priority flags with badges, stable items, recommended actions)

---

## v2 Requirements (Deferred)

- [ ] Handoff completeness score (readiness indicator before generating report) — requires defining expected note categories per unit type; needs clinical domain research
- [ ] Advanced AI context window management (token budgeting for large patient histories) — relevant only at production scale
- [ ] Notification/alert system (push or email for critical flags) — external delivery plumbing not needed for demo

## Out of Scope

- Real voice input / speech-to-text — typewriter simulation is intentional for demo reliability
- User authentication / login system — predefined nurse identities via dropdown; no passwords
- Mobile/tablet responsive layout — desktop workstation tool by design
- Dashboard analytics / charts — this is a context engine, not an analytics dashboard
- PDF export of handoff reports — context lives in the system, not in printouts
- Auto-fill from historical notes — AI context informs generation, never pre-fills input (patient safety)
- Production security hardening — RLS policies are demo-appropriate
- Cannabis retail reskin — the nurse domain IS the demo; the FIKA analogy is verbal (video)

---

## Traceability

| REQ-ID | Phase | Status |
|--------|-------|--------|
| FOUND-01 | Phase 1 | Complete |
| FOUND-02 | Phase 1 | Complete |
| FOUND-03 | Phase 1 | Complete |
| FOUND-04 | Phase 1 | Complete |
| FOUND-05 | Phase 1 | Complete |
| FOUND-06 | Phase 1 | Complete |
| FOUND-07 | Phase 1 | Complete |
| FOUND-08 | Phase 1 | Complete |
| UI-07 | Phase 1 | Complete |
| UI-08 | Phase 1 | Complete |
| COMP-01 | Phase 2 | Complete |
| COMP-02 | Phase 2 | Complete |
| COMP-03 | Phase 2 | Complete |
| COMP-04 | Phase 2 | Complete |
| UI-05 | Phase 2 | Complete |
| UI-09 | Phase 2 | Complete |
| AICTX-01 | Phase 3 | Complete |
| AICTX-02 | Phase 3 | Complete |
| AICTX-03 | Phase 3 | Complete |
| AICTX-04 | Phase 3 | Complete |
| UI-04 | Phase 3 | Complete |
| UI-10 | Phase 3 | Complete |
| RT-01 | Phase 4 | Complete |
| RT-02 | Phase 4 | Complete |
| RT-03 | Phase 4 | Complete |
| RT-04 | Phase 4 | Complete |
| UI-01 | Phase 4 | Complete |
| UI-02 | Phase 4 | Pending |
| UI-03 | Phase 4 | Pending |
| UI-06 | Phase 4 | Complete |

---
*Requirements defined: 2026-03-26*
*Traceability filled: 2026-03-26*
*Source: FIKA AI Builder application — portfolio optimization milestone*
