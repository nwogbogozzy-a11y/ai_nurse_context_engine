# Product Requirements Document
## AI-Native Nurse Context Engine
_Version 1.0 | February 2026 | Wealthsimple AI Builder Application_

---

## 1. Problem Statement

Hospital nursing workflows were designed around paper, memory, and verbal handoff in an era when no tool could hold continuous context across an entire patient population. Three specific breakdowns, validated by active nursing professionals:

**Charting:** 30-40% of every shift is spent documenting — after the fact, from memory, inconsistently across nurses and units. Context decays between observation and record.

**Shift handoff:** Incoming nurses inherit patients via rushed verbal reports with no standard format, no quality control, and no continuity. Critical information gets lost. One nurse described it as a "game of telephone." Another noted nurses are "so pissed waiting for report."

**Supply room:** Nurses reconstruct what they need from memory before procedures, make multiple trips, and routinely waste clean supplies that cannot be returned once they have entered a patient room. No structured pre-procedure checklist exists.

**Root cause:** All three are the same problem. A nurse is constantly reconstructing patient context from scratch — at shift start, before a procedure, after an observation. The system was built around the constraint that no tool could hold that context continuously. That constraint no longer exists.

---

## 2. Solution

A living patient context layer — one continuously updated record per patient that powers three outputs nurses currently rebuild manually every time.

**Input:** Nurse speaks or types during or after care. Tagged to patient, shift, nurse, timestamp.

**Processing:** Claude API structures raw input into a clinical note, detects procedures, flags anomalies, generates supply lists and handoff briefings on demand.

**Outputs:**
1. Living patient record — always current
2. Shift handoff report — generated on demand for incoming nurse
3. Supply checklist — generated when procedure is mentioned in dictation

---

## 3. Users

### Primary: Shift Nurse (outgoing)
Responsible for patient care during shift. Needs to document observations quickly, prepare for procedures efficiently, and hand off cleanly at shift end. Currently loses significant time to documentation and supply logistics.

### Secondary: Shift Nurse (incoming)
Starting shift cold on patients they've never met. Needs complete, reliable situational awareness before stepping into a patient room. Currently dependent on the outgoing nurse's memory and communication quality.

---

## 4. Functional Requirements

### 4.1 Patient Dashboard
- Display all active patients with name, ward, unit type, current status, and last update timestamp
- Visual flag indicators on patients with anomalies (amber = warning, red = critical)
- Click to open patient detail view

### 4.2 Dictation Input
- Text input panel on patient detail view
- Pre-scripted demo strings with typewriter animation simulating real-time speech-to-text
- Submit triggers n8n webhook POST
- Loading state while processing
- Structured output renders on completion

### 4.3 Note Structuring (AI)
- Claude receives raw dictation + patient context
- Returns SOAP-format structured note
- Returns flagged boolean + flag reason if anomaly detected
- Returns array of procedures mentioned
- Note saved to Supabase with all fields

### 4.4 Supply List Generation (AI)
- Triggered automatically when procedures array is non-empty
- Claude receives procedure list + patient context + unit type
- Returns itemized supply list with quantity, unit, and notes per item
- Saved to Supabase supply_requests table
- Rendered in UI with confirm-per-item and mark-all-ready controls

### 4.5 Handoff Report Generation (AI)
- Triggered on demand via "Generate Handoff Report" button
- Claude receives full patient record + last 24hrs of notes
- Returns: summary paragraph, priority flags, stable items, recommended first actions
- Saved to Supabase handoff_reports table
- Rendered with flag severity badges (amber/red) and generation timestamp

### 4.6 Human Override Controls
- Every flagged note surfaces an explicit human review prompt
- Nurse can approve, escalate, or override any AI-generated flag
- All human decisions logged to audit trail in Supabase
- No AI action is irreversible without human confirmation

---

## 5. Non-Functional Requirements

| Requirement | Specification |
|---|---|
| Response time | n8n → Claude → response < 8 seconds for note structuring |
| Availability | Local only — no uptime requirement for demo |
| Accessibility | WCAG 2.1 AA |
| Browser support | Chrome (primary), Firefox |
| Device | Desktop only (1280px minimum width) |
| Data | All data local to Supabase project — no external calls except Claude API |

---

## 6. Demo Scenarios

### Scenario 1 — Margaret Thompson (Straightforward)
**Setup:** 67F, post-op hip replacement Day 2, Ward 3B, stable
**Input:** "Margaret had a comfortable night. Pain score 3 out of 10, well managed with oral analgesia. Mobilized twice with physio, tolerating weight bearing. Wound site clean, performing a dressing change this morning."
**Expected outputs:**
- Structured SOAP note, no flags
- Supply list: dressing change supplies (gauze, saline, tape, gloves)
- Flag badge: green / none

### Scenario 2 — Devon Clarke (Complex / Flagged)
**Setup:** 44M, ICU, chest drain in situ, Ward 5A
**Input:** "Devon's drain output has been higher than expected overnight — approximately 200mls in the last 4 hours. Vitals otherwise stable. Will need to manage the chest drain and check suction."
**Expected outputs:**
- Structured SOAP note
- Flagged: true — "Drain output 200ml/4hrs exceeds expected threshold. Human review required."
- Supply list: chest drain supplies (suction, gauze, gloves, drain dressing)
- Flag badge: amber

### Scenario 3 — Aisha Mensah (Dynamic / Shift Change)
**Setup:** 31F, general ward, admitted overnight
**Input 1 (stable):** "Aisha settled overnight, obs stable, resting comfortably."
**Input 2 (changed):** "18:45 — Aisha's BP has dropped to 88/54. HR elevated at 112. Appears diaphoretic. Attending notified."
**Handoff report expected:**
- Summary includes vitals change
- Priority flag: critical — BP and HR values, time of change, attending notified
- Recommended first action: reassess vitals on arrival

---

## 7. Architecture

### Frontend
```
Next.js 14 (App Router) + TypeScript + Tailwind CSS
Running on: localhost:3000
```

### Backend
```
n8n automation pipeline (11 nodes)
Running on: localhost:5678 (or n8n cloud)
Exposes: POST /webhook/kyc-submit
```

### Database
```
Supabase (existing project)
Tables: patients, notes, supply_requests, handoff_reports
```

### AI
```
Claude API — claude-sonnet-4-20250514
Called via n8n HTTP Request node
Three distinct prompts: note structuring, supply list, handoff report
```

---

## 8. Human/AI Boundary — Explicit

| Task | Owner | Rationale |
|---|---|---|
| Structuring raw dictation into clinical note | AI | Pattern recognition at scale, no fatigue, consistent output |
| Detecting anomalies in observations | AI | Can hold all normal ranges simultaneously, surfaces for human review |
| Generating supply list from procedure mention | AI | Deterministic lookup task — frees cognitive bandwidth |
| Generating handoff briefing from note history | AI | Synthesis across large note volume — humans summarize inconsistently |
| Approving or overriding a flagged note | Human | Clinical judgment, regulatory accountability |
| Interpreting a flag as a clinical emergency | Human | Context the system never fully has |
| Any action affecting patient care plan | Human | Irreversible, regulated, requires situational awareness AI cannot have |

---

## 9. What Breaks First at Scale

**Input quality.** The system is only as current as what nurses actually dictate. If adoption is low — if nurses keep handwriting notes and entering them retroactively — the context layer degrades and the handoff report reflects a stale picture. This is a change management problem, not a technical one. The honest answer to "what breaks first" is: human behavior, not the architecture. Solving that requires workflow integration, training, and trust built over time — none of which a prototype can demonstrate, but all of which a well-designed system makes easier to achieve.

---

## 10. Success Criteria for Demo

- All three scenarios run end-to-end without errors
- Typewriter animation plays cleanly for each dictation
- Structured notes appear correctly formatted in the UI
- Supply lists render with correct items per scenario
- Handoff report for Aisha shows the vitals flag from Input 2
- No hardcoded data in the UI — everything flows from Supabase via live n8n pipeline
- Demo can be run cold (fresh browser, fresh n8n session) in under 2 minutes of setup
