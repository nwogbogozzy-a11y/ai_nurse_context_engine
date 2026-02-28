# CLAUDE.md — AI-Native Nurse Context Engine
_Project initialized: February 2026 | Wealthsimple AI Builder Application_

---

## Project

**Name:** AI-Native Nurse Context Engine
**Type:** Web App
**One-line description:** A living patient context system that gives nurses instant situational awareness — eliminating the cognitive reconstruction work that consumes 30-40% of every shift.
**Primary goal:** Demo a working AI-native system that shows Wealthsimple how a broken legacy workflow gets rebuilt from scratch — running locally, end-to-end, across three distinct outputs.

---

## The Problem (Do Not Skip — Read Before Anything)

Hospital nursing workflows were designed around paper, memory, and verbal handoff. Three specific breakdowns validated by real nurses:

1. **Charting** — nurses spend 30-40% of shift time documenting. Notes are written after the fact, from memory, inconsistently. Context decays between observation and record.

2. **Shift handoff** — incoming nurses inherit patients via rushed verbal reports. Quality varies by nurse, by shift, by how tired everyone is. Info gets lost. Confidence is low. One nurse described it as "a game of telephone." Another: *"Bro nurses be so pissed waiting for report."*

3. **Supply room** — nurses leave patient rooms, reconstruct what they need from memory, make multiple trips, waste clean supplies that can't be returned once they've entered a patient room. No structured pre-procedure checklist exists.

**The underlying insight:** All three are the same problem. A nurse is constantly reconstructing context from scratch — at the start of a shift, before a procedure, after an observation. The system was built for a world where no tool could hold that context continuously. That constraint no longer exists.

**Domain validation:** Problem confirmed by active nursing professionals. Direct quote on the handoff solution: *"Oh that would be fantastic."*

---

## The System

**Name:** AI-Native Nurse Context Engine
**Frame:** One continuously updated patient context layer that powers three workflows nurses currently rebuild from scratch every time.

```
INPUT LAYER
  Nurse speaks or types during/after care
  Tagged to: patient | shift | nurse | timestamp

        ↓

AI PROCESSING LAYER (Claude API via n8n)
  Structures raw input into clinical note
  Detects procedure mentions → triggers supply list
  On handoff request → synthesizes patient briefing
  Flags anomalies for human review

        ↓

OUTPUT LAYER
  1. Living patient record (always current)
  2. Shift handoff report (generated on demand)
  3. Supply checklist (generated per procedure)
```

**The human's role:** Every clinical decision. Every reordering action. Every approval of a flagged note. The AI holds context and surfaces it — the nurse acts on it.

**Where AI must stop:** Anything involving clinical judgment on ambiguous presentations. Diagnosis. Interpreting a flag as a clinical emergency. The AI says "this changed" — the nurse decides what it means.

**What breaks first at scale:** Input quality. The system is only as current as what nurses actually dictate. If dictation adoption is low, the context layer degrades. This is a change management problem, not a technical one — and it's the honest answer.

---

## Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **Deployment:** Local (localhost) — demo only
- **Backend:** n8n (automation pipeline, self-hosted or cloud)
- **Database:** Supabase (existing project — KYC tables already present, new tables added)
- **AI:** Claude API (claude-sonnet-4-20250514) via n8n HTTP node
- **Voice simulation:** Typewriter animation (pre-scripted text that animates as if being dictated in real time)
- **Other:** Supabase JS client for frontend data fetching

---

## Database (Already Created in Supabase)

Four tables seeded and ready:

**`patients`** — id, full_name, date_of_birth, admission_date, ward, unit_type, current_status, created_at

**`notes`** — id, patient_id, raw_input, structured_note, shift, nurse_name, flagged, flag_reason, created_at

**`supply_requests`** — id, patient_id, procedure, items (jsonb), generated_at, confirmed_by

**`handoff_reports`** — id, patient_id, incoming_nurse, summary, flags (jsonb), generated_at, shift_start

**Three seeded patients:**
- Margaret Thompson — 67F, post-op, Ward 3B, hip replacement Day 2, stable
- Devon Clarke — 44M, ICU, Ward 5A, chest drain in situ, complex history
- Aisha Mensah — 31F, general, Ward 2C, admitted overnight, vitals changed at 18:45

---

## Demo Scenarios (All Three Must Work End-to-End)

### Scenario 1 — Margaret Thompson (Clean / Straightforward)
Nurse dictates standard post-op observation. System structures it, no flags, generates dressing change supply list automatically from procedure mention. Auto-approves note.

**What to show:** Input → structured note → supply list generated. Clean, fast, zero friction.

### Scenario 2 — Devon Clarke (Complex / Flagged)
Nurse dictates and mentions drain output volume outside expected range. System structures note, flags the reading for human review with reason, generates suction + gauze supply list from chest drain procedure context.

**What to show:** AI detecting an anomaly, surfacing it to the nurse with reasoning, not acting on it unilaterally. Human stays in control of the clinical response.

### Scenario 3 — Aisha Mensah (Dynamic / Shift Change)
Start of demo she's stable. Mid-demo nurse adds a new note with changed vitals at 18:45. Handoff report is then generated — and the flag appears in the incoming nurse's briefing before they've stepped into the room.

**What to show:** The system is live, not a snapshot. Context updates in real time. The handoff report reflects the most current state at generation time — not what was true 6 hours ago.

---

## Constraints

- **Accessibility:** WCAG 2.1 AA
- **Browser targets:** Chrome (primary — demo machine), Firefox
- **Device targets:** Desktop only (this is a workstation tool)
- **Brand rules:** Clean minimal clinical UI — white, structured, professional. No color for decoration. Color only for meaning (flag = amber, critical = red, safe = green). Think: what a nurse would trust on a 12-hour shift.
- **Timeline:** March 2, 2026 — 11:59pm EST. Hard deadline.
- **Voice:** Simulated dictation via typewriter animation. Pre-scripted strings animate character by character to simulate real-time speech-to-text. No actual microphone required for demo.

---

## Agent Workflow

Agents run in strict order. No agent starts until the previous one has produced its verified output.

```
1. ux-research        → produces: ux-brief.md
2. design-principles  → produces: design-principles-nurse.md (queries NotebookLM)
3. design-system      → produces: .interface-design/system.md
4. backend            → produces: n8n pipeline JSON + Supabase verification
5. ai-logic           → produces: all Claude prompts tested and validated
6. builder            → produces: Next.js frontend implementation
7. integration        → produces: frontend wired to backend, all three flows live
8. testing            → produces: test-report.md (all three scenarios passing)
9. debugging          → produces: debug-log.md (all issues resolved)
10. design-review     → produces: reviews/review-final.md
```

---

## Agent Rules

**All agents must:**
- Read this CLAUDE.md before doing anything
- Read `ux-brief.md` before making any user-facing decision
- Read `.interface-design/system.md` before touching any styling
- Save outputs to correct file paths — do not output to chat only
- Never invent design or architecture decisions not grounded in the system

---

## Agent Specifications

### Agent 1: ux-research
**Skill file:** `.claude/skills/ux-research/SKILL.md`
**Produces:** `ux-brief.md`

Follow the full research protocol in the skill file. The primary user archetype is the nurse (shift nurse, ICU and general ward). The secondary archetype is the incoming nurse at shift change. Use the journey map format from the skill file for both.

Key inputs already known — incorporate directly:
- Primary pain: cognitive reconstruction from scratch at every transition point
- Trust signal: structured, consistent output they can rely on under pressure
- Fear: missing something critical because the system didn't surface it
- Context: 12-hour shifts, high stakes, no time for learning curves

---

### Agent 2: design-principles
**Skill file:** `.claude/skills/design-principles/SKILL.md`
**Produces:** `design-principles-nurse.md`
**Notebook registry:** `notebook-ids.json`

Query NotebookLM before producing any principles. Suggested queries:

- `@visual`: "What visual hierarchy principles apply when users are under time pressure and scanning for critical information?"
- `@ux`: "What interaction patterns reduce cognitive load for expert users in high-stakes professional contexts?"
- `@web`: "What accessibility and readability standards apply to dashboard interfaces used in clinical or professional settings?"
- `@product`: "How should a design system handle status and alert states when the stakes of missing information are high?"

Synthesize into named `## Design Principles for Nurse Context Engine` block. Minimum 5 principles.

---

### Agent 3: design-system
**Skill file:** `.claude/skills/design-system/SKILL.md`
**Produces:** `.interface-design/system.md`

Clinical UI direction: white backgrounds, high contrast, generous spacing. Color used only for semantic meaning:

```
background:        #FFFFFF
surface:           #F8FAFC
border:            #E2E8F0
text-primary:      #0F172A
text-secondary:    #475569
text-muted:        #94A3B8
accent:            #0EA5E9  (sky blue — clinical, trustworthy)
accent-hover:      #0284C7
flag-warning:      #F59E0B  (amber — anomaly detected)
flag-critical:     #EF4444  (red — urgent human review required)
flag-safe:         #10B981  (green — clear, auto-approved)
```

Priority components for this project:
- Patient card (summary view + expanded view)
- Dictation input panel (with typewriter animation state)
- Structured note display
- Supply checklist (generated items with confirm button)
- Handoff report panel (full briefing with flags highlighted)
- Flag badge (warning / critical / safe variants)
- Nurse action bar (approve / flag / override buttons)

---

### Agent 4: backend
**Skill file:** `.claude/skills/backend/SKILL.md`
**Produces:** n8n pipeline JSON exported + `backend-verification.md`

Build the n8n pipeline with these exact nodes:

```
N1  Webhook                → POST /kyc-submit (reuse pattern from KYC build)
N2  Parse Input            → extract patient_id, raw_input, nurse_name, shift, input_type
N3  Fetch Patient Context  → GET patient record from Supabase by patient_id
N4  Claude — Structure Note → send raw_input + patient context, return structured note + flags + procedures detected
N5  Parse Claude Response  → separate: structured_note, flagged (bool), flag_reason, procedures[]
N6  Save Note to Supabase  → INSERT into notes table
N7  Router                 → branch on: procedures detected? → N8a | handoff requested? → N8b | else → N9
N8a Claude — Supply List   → given procedure[] + patient context, generate itemized supply list
N8b Claude — Handoff Report → given last 24hrs notes + patient record, generate structured briefing with flags
N9a Save Supply Request    → INSERT into supply_requests
N9b Save Handoff Report    → INSERT into handoff_reports
N10 Webhook Response       → return 200 with structured payload to frontend
```

Environment variables needed:
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
ANTHROPIC_API_KEY=
```

Verify all three demo scenarios produce correct Supabase records before handoff to integration agent.

---

### Agent 5: ai-logic
**Produces:** `prompts.md` — all Claude prompts written, tested, and validated

Write and validate three Claude prompts:

**Prompt 1 — Note Structuring**
```
You are a clinical documentation assistant helping nurses create accurate, structured patient notes.

Given a nurse's raw dictation and the patient's current context, produce:
1. A structured clinical note in SOAP format (Subjective, Objective, Assessment, Plan)
2. A flagged field (true/false) — flag if any value is outside expected range or requires urgent human review
3. A flag_reason (string) — plain English explanation of why this was flagged, if applicable
4. A procedures array — list any clinical procedures mentioned that would require supplies

Patient context: {patient_context}
Raw dictation: {raw_input}
Shift: {shift}

Return valid JSON only. No preamble. No explanation outside the JSON.

{
  "structured_note": "",
  "flagged": false,
  "flag_reason": "",
  "procedures": []
}
```

**Prompt 2 — Supply List Generation**
```
You are a clinical supply coordinator helping nurses prepare for procedures efficiently.

Given the procedure(s) about to be performed and the patient's current context, generate a precise supply checklist. Include only what is needed — do not pad the list.

Patient context: {patient_context}
Procedures: {procedures}
Unit type: {unit_type}

Return valid JSON only.

{
  "procedure": "",
  "items": [
    { "item": "", "quantity": 0, "unit": "", "notes": "" }
  ]
}
```

**Prompt 3 — Handoff Report Generation**
```
You are a clinical handoff assistant helping incoming nurses start their shift with full situational awareness.

Given all notes from the last 24 hours and the patient's current record, produce a structured handoff briefing. Prioritize: what changed, what needs watching, what is stable. Cut anything that doesn't help the incoming nurse in the first 30 minutes.

Patient record: {patient_record}
Notes (last 24hrs): {recent_notes}
Incoming shift: {incoming_shift}

Return valid JSON only.

{
  "summary": "",
  "priority_flags": [
    { "type": "warning|critical", "detail": "" }
  ],
  "stable_items": [],
  "recommended_first_actions": []
}
```

Test each prompt against all three patient scenarios before marking complete.

---

### Agent 6: builder
**Skill file:** `.claude/skills/frontend-design/SKILL.md`
**Produces:** Complete Next.js frontend in `/src`

Read `.interface-design/system.md` before writing a single line of code.

**Pages to build:**

`/` — Patient list dashboard
- Three patient cards (Margaret, Devon, Aisha)
- Each card shows: name, ward, unit type, current status, last note timestamp
- Flag badge visible on Devon (flagged) and Aisha (flagged)
- Click → opens patient detail view

`/patient/[id]` — Patient detail view
- Left panel: patient info + status
- Center panel: note history (chronological, most recent first)
- Right panel: action panel (dictation input + output display)
- Tabs: Notes | Supply Requests | Handoff Report

**Dictation simulation component:**
- Text area with a pre-scripted string per scenario
- "Begin Dictation" button triggers typewriter animation — text appears character by character at ~40ms per character to simulate real-time speech-to-text
- On completion: "Processing..." state → POST to n8n webhook → display structured output

**Handoff report component:**
- "Generate Handoff Report" button
- Loading state while n8n processes
- Report renders with: summary paragraph, priority flags (amber/red badges), stable items list, recommended first actions
- Timestamp of generation visible

**Supply checklist component:**
- Appears automatically when procedure is detected in note
- Itemized list with quantity, unit, notes column
- "Confirm Prepared" button per item
- Overall "Mark Ready" button

---

### Agent 7: integration
**Produces:** `integration-verification.md`

Wire frontend to n8n backend:
- Dictation submit → POST to n8n webhook → parse response → render structured note + supply list
- Handoff report request → POST to n8n webhook with patient_id + request type → render report
- All Supabase reads for patient data and note history go directly from frontend via Supabase JS client

Verify each flow produces correct UI state before marking complete.

---

### Agent 8: testing
**Produces:** `test-report.md`

Run all three demo scenarios end-to-end and document results:

**Scenario 1 — Margaret Thompson**
- [ ] Dictation input accepts pre-scripted string
- [ ] Typewriter animation plays correctly
- [ ] n8n receives POST, Claude structures note correctly
- [ ] Note saved to Supabase with flagged: false
- [ ] Supply list generated for dressing change
- [ ] UI displays structured note and supply checklist
- [ ] No flags shown

**Scenario 2 — Devon Clarke**
- [ ] Dictation input accepts pre-scripted string
- [ ] Claude detects drain output anomaly
- [ ] Note saved with flagged: true, flag_reason populated
- [ ] Flag badge displays in UI (amber or red)
- [ ] Supply list generated for chest drain procedure
- [ ] Human review prompt displayed

**Scenario 3 — Aisha Mensah**
- [ ] Initial state shows stable status
- [ ] Second dictation input with changed vitals accepted
- [ ] Note saved with flagged: true
- [ ] Handoff report generated on demand
- [ ] Report includes the vitals flag in priority_flags
- [ ] Report timestamp reflects generation time (after vitals change)

Document: pass/fail per check, actual vs expected output, any edge case behavior observed.

---

### Agent 9: debugging
**Produces:** `debug-log.md`

For every failure found by the testing agent:

1. **Identify** — log the exact failure: which scenario, which node/component, what the actual output was vs expected
2. **Isolate** — determine whether failure is in: n8n pipeline | Claude prompt | Supabase query | frontend rendering | integration layer
3. **Fix** — make the targeted change. Do not refactor unrelated code.
4. **Verify** — re-run the specific test that failed. Confirm pass before moving to next issue.
5. **Log** — document fix applied in `debug-log.md` with before/after

Debugging priority order: backend failures before frontend failures. Data integrity before visual correctness.

---

### Agent 10: design-review
**Skill file:** `.claude/skills/design-review/SKILL.md`
**Produces:** `reviews/review-final.md`

Run all four review categories against the completed frontend:
- Brief alignment (does this solve what the ux-brief says it should?)
- Design system consistency (are all components using system tokens?)
- Accessibility (WCAG 2.1 AA — contrast, keyboard nav, semantic HTML)
- Responsive behavior (desktop only, but verify no layout breakage at common desktop widths: 1280px, 1440px, 1920px)

Classify every issue by severity. State handoff status explicitly at the end.

---

## Knowledge Sources

| Notebook | ID | Query When |
|---|---|---|
| visual-design | `7c272003-7835-410a-bc9c-f39b520512db` | Color, typography, grid, visual hierarchy |
| ux-interaction | `2ba9a638-46b4-41d0-8f1b-a109544458e5` | User flows, interaction patterns, usability |
| copywriting-content | `a1655b58-fe91-4d1d-a787-ced4eaeb3d1b` | Voice/tone, microcopy, labels |
| web-frontend | `20697553-9152-4b26-ab14-3577ebb90355` | Web patterns, accessibility, performance UX |
| product-design-strategy | `29dfc6e4-7ea6-47a0-9848-046a433e2671` | Design systems, component strategy |

---

## Hard Rules

1. **Read this file first.** Every agent. Every session. No exceptions.
2. **NotebookLM is the design authority.** Query before deciding — never design by gut.
3. **`system.md` is the implementation authority.** No component gets built outside the system without flagging.
4. **Semantic tokens only.** No hardcoded hex values in components.
5. **Outputs go to files, not chat.** Every agent saves its work.
6. **Workflow order is enforced.** Builder does not start until `system.md` exists. Integration does not start until backend and builder are both complete.
7. **Testing agent has veto power.** Nothing goes to design-review until all three scenarios pass end-to-end.
8. **Debugging agent owns all failures.** Builder does not self-debug mid-build. Surface failures to the debugging agent.
9. **WCAG 2.1 AA is the floor.** Non-negotiable.
10. **Demo must run locally with zero external dependencies at demo time.** All credentials in `.env.local`. n8n running. Supabase connected. No live builds, no cold starts.
