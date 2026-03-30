# AI-Native Nurse Context Engine: Product Report

---

## Executive Summary

The Nurse Context Engine is an AI-native clinical workflow system that eliminates the cognitive reconstruction work consuming 30-40% of every nursing shift. It replaces the fragmented, memory-dependent processes of charting, shift handoff, and procedure preparation with a single, continuously updated patient context layer powered by Claude API.

The system takes raw nurse dictation, structures it into clinical SOAP notes, auto-generates supply checklists when procedures are detected, and produces shift handoff reports with priority flags on demand. Three demo scenarios run end-to-end across a Next.js frontend, n8n automation backend, and Supabase database with real-time data propagation.

---

## The Problem

Hospital nursing workflows were designed around paper, memory, and verbal handoff. Three specific breakdowns validated by active nursing professionals:

**1. Documentation burden.** Nurses spend 30-40% of shift time on charting. Notes are written after the fact, from memory, inconsistently. Context decays between the moment of observation and the moment of record. This is not a documentation problem. It is a context loss problem.

**2. Shift handoff failure.** Incoming nurses inherit patients via rushed verbal reports. Quality varies by nurse, shift, and fatigue level. Information gets lost. One nurse described the experience as "a game of telephone." Another: "Bro nurses be so pissed waiting for report."

**3. Supply room inefficiency.** Nurses leave patient rooms, reconstruct what they need from memory, make multiple trips, and waste clean supplies that cannot be returned once they enter a patient room. No structured pre-procedure checklist exists in most workflows.

**The underlying insight:** All three breakdowns are the same problem. A nurse is constantly reconstructing context from scratch at every transition point: at the start of a shift, before a procedure, after an observation. The system was built for a world where no tool could hold that context continuously. That constraint no longer exists.

**Domain validation:** Problem confirmed by active nursing professionals. Direct quote on the handoff solution: *"Oh that would be fantastic."*

---

## System Architecture

### Data Flow

```
INPUT LAYER
  Nurse speaks or types during/after care
  Tagged to: patient, shift, nurse, timestamp
        |
        v
AI PROCESSING LAYER (Claude API via n8n)
  Structures raw input into clinical SOAP note
  Detects procedure mentions -> triggers supply list
  On handoff request -> synthesizes patient briefing
  Flags anomalies for human review
        |
        v
OUTPUT LAYER
  1. Living patient record (always current)
  2. Supply checklist (generated per procedure)
  3. Shift handoff report (generated on demand)
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 16, React 19, TypeScript | Patient dashboard, detail views, dictation input |
| Styling | Tailwind CSS v4, shadcn/ui (Radix primitives) | Clinical design system with WCAG 2.1 AA compliance |
| Backend | n8n (self-hosted automation) | Webhook pipeline: note structuring, supply generation, handoff reports |
| Database | Supabase (PostgreSQL) | Persistent storage with real-time subscriptions |
| AI | Claude API (claude-sonnet-4-20250514) | Note structuring, anomaly detection, supply lists, handoff reports |
| Real-time | Supabase Realtime (postgres_changes) | Live data propagation across browser tabs |

### Database Schema

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `patients` | Patient records | full_name, ward, unit_type, current_status |
| `notes` | Structured clinical notes | raw_input, structured_note (JSONB), flagged, flag_reason, review_status |
| `supply_requests` | Generated supply checklists | procedure, items (JSONB), confirmed_items, rationale |
| `handoff_reports` | Shift handoff briefings | summary, flags (JSONB), stable_items, recommended_first_actions |
| `audit_log` | Compliance trail | nurse_name, action_type, metadata, timestamp |
| `patient_summaries` | AI-generated context summaries | summary, note_count, generated_at |

---

## Core Functions

### 1. Clinical Note Structuring

**Input:** Raw nurse dictation (typed or simulated via typewriter animation)

**Processing:** Claude API receives the dictation plus the patient's current record (including the last 5 notes for context memory). It returns:
- A structured SOAP note (Subjective, Objective, Assessment, Plan) with optional HPI, Comorbidities, and Interventions sections
- A flagged boolean indicating whether any values are outside expected range
- A plain-English flag reason explaining the anomaly
- An array of detected clinical procedures that would require supplies

**Output:** Structured note saved to database, displayed in the patient detail view with color-coded SOAP section headers. If flagged, an amber or red alert appears with the AI's reasoning.

**Key design decision:** SOAP format was chosen because it is the structure nurses already think in, reducing cognitive translation cost to zero. The extended fields (HPI, Comorbidities, Interventions) were added after nurse feedback confirmed these anchoring fields were missing from standard SOAP.

### 2. Supply Checklist Generation

**Trigger:** Automatic when a procedure is detected in a note, or on-demand via the Procedure Search feature.

**Processing:** Claude API receives the procedure name, patient context (including unit type, since ICU vs. general ward affects requirements), and returns an itemized supply checklist with quantity, unit, and notes per item.

**Output:** Interactive checklist with per-item confirmation checkboxes (Radix Checkbox with keyboard Space toggle), a "Mark All Ready" button, and persistence of confirmation state to the database. Includes an AI-generated rationale line ("AI suggested based on chest drain + ICU context").

**Key design decision:** The prompt includes the instruction "Include only what is needed. Do not pad the list." This constraint cut average list length by 30% without losing clinically necessary items.

### 3. Shift Handoff Report Generation

**Trigger:** On-demand via "Generate Handoff Report" button in the patient detail sidebar.

**Processing:** Claude API receives the full patient record plus recent notes and produces a structured briefing prioritizing what changed, what needs watching, and what is stable.

**Output:** Four-card layout displaying:
1. **Summary** with generated timestamp and incoming shift label
2. **Priority Flags** with color-coded badges (warning/critical) and detail text
3. **Stable Items** as a bulleted list
4. **Recommended First Actions** as a numbered list

**Key design decision:** The prompt constraint "Cut anything that doesn't help the incoming nurse in the first 30 minutes" was the single most effective quality improvement. Without it, reports included background history that an incoming nurse does not need at shift start.

### 4. Anomaly Detection and Flagging

**How it works:** The note structuring prompt evaluates clinical values against expected ranges for the patient's context. When an anomaly is detected, it returns `flagged: true` with a plain-English reason.

**Flag lifecycle:** Flagged -> Under Review -> Resolved (or Approved/Escalated/Overridden). Each state transition is recorded in the audit log with nurse attribution.

**AI boundary:** The AI flags but never acts. It says "drain output exceeds expected threshold." The nurse decides what it means clinically. This boundary is enforced at the prompt level by constraining output to structured fields (boolean + string) rather than open-ended clinical narrative.

### 5. Real-Time Data Propagation

**Architecture:** Supabase Realtime subscriptions using `postgres_changes` channel on all four primary tables.

**Dashboard level:** Global subscription to note INSERT and UPDATE events. When a note is submitted from any patient detail view, the dashboard's flag badges and "last note" timestamps update live without refresh.

**Patient detail level:** Per-patient subscription to notes, supply_requests, handoff_reports, and audit_log. New items prepend to the top of lists without full data refetch.

**Cross-tab behavior:** Nurse A submits a note in one browser tab. Nurse B's open view of the same patient shows the new note without manual refresh. This demonstrates the "living context" narrative.

### 6. Compliance Audit Trail

**What is recorded:** Every consequential nurse action writes a row to the audit log: approve, escalate, override, generate-handoff, confirm-supply, create-note. Each entry includes the acting nurse's name, timestamp, patient ID, and action metadata.

**Visibility:** The Activity tab in the patient detail view shows a chronological timeline with nurse initials, action type badges (color-coded by severity), and timestamps.

**Implementation:** Postgres trigger ensures audit entries cannot be bypassed by direct database writes. Application-level inserts provide additional metadata.

---

## User Interface

### Design Principles

- **Color carries only meaning.** Amber for warnings, red for critical flags, green for clear/safe, indigo for under review. No decorative color. On hour 11 of a 12-hour shift, color must always signal something.
- **WCAG 2.1 AA compliance.** All interactive components use Radix UI primitives with proper ARIA attributes, keyboard navigation, and focus ring indicators.
- **shadcn/ui component system.** 12 primitives (Button, Card, Table, Tabs, Badge, Select, AlertDialog, Textarea, Skeleton, Checkbox, Dialog, Skeleton) customized with clinical design tokens.
- **Skeleton loaders during AI processing.** SOAP note skeleton, supply table skeleton, and handoff report skeleton replace static "Processing..." text with structurally-shaped loading previews.

### Page Structure

**Dashboard (`/`):** Three patient cards in a responsive grid. Each card shows patient name, ward, unit type, current status, last documenting nurse, admission duration ("Day N"), flag badge, and unresolved flag count. Cards update live via real-time subscriptions.

**Patient Detail (`/patient/[id]`):** Three-panel layout:
- **Left sidebar (280px):** Patient info card with demographics, admission details, current status. "Generate Handoff Report" button.
- **Center panel (flexible):** Tabbed content via shadcn Tabs with keyboard navigation. Five tabs: Notes, Supply Requests, Handoff Report, Activity, Context.
- **Right panel (360px):** Dictation input with mode selector (pre-scripted typewriter or free-form), text area, and submit button.

### Nurse Identity System

Two pre-configured nurse identities (Sarah Chen, Night Shift; Marcus Webb, Morning Shift) selectable via a Radix Select dropdown with AlertDialog confirmation. All subsequent actions are attributed to the selected nurse. The switcher is disabled during active dictation to prevent mid-submission identity changes.

---

## Demo Scenarios

### Scenario 1: Margaret Thompson (Stable / Straightforward)
**Patient:** 67F, post-op, Ward 3B, hip replacement Day 2, stable.

**Flow:** Nurse dictates standard post-op observation. System structures it into a clean SOAP note with no flags. Detects "dressing change" procedure mention and auto-generates a supply list.

**What it demonstrates:** Input to structured note to supply list. Clean, fast, zero friction. The system handles routine documentation without cognitive overhead.

### Scenario 2: Devon Clarke (Complex / Flagged)
**Patient:** 44M, ICU, Ward 5A, chest drain in situ, complex history (hypertension, Type 2 diabetes).

**Flow:** Nurse reports drain output higher than expected range. System structures the note, flags the anomaly with a plain-English reason ("drain output exceeds expected threshold"), and generates a chest drain supply list.

**What it demonstrates:** AI detecting an anomaly, surfacing it with reasoning, but not acting on it. The human stays in control of the clinical response. The flag badge appears on the dashboard in real-time.

### Scenario 3: Aisha Mensah (Dynamic / Shift Change)
**Patient:** 31F, general ward, Ward 2C, admitted overnight.

**Flow:** Starts stable. A second dictation reports changed vitals (BP drop, elevated heart rate) at 18:45. System flags it critical. When the incoming nurse requests a handoff report, the flag appears in the briefing, reflecting the most current state.

**What it demonstrates:** The system is live, not a snapshot. Context updates in real-time. The handoff report reflects the most current state at generation time, not what was true six hours ago.

---

## AI Implementation Details

### Three Claude Prompts

| Prompt | Input | Output | Key Constraint |
|--------|-------|--------|---------------|
| Note Structuring | Raw dictation + patient context + last 5 notes | SOAP note + flagged + flag_reason + procedures[] | Explicit JSON schema in instruction |
| Supply Generation | Procedure + patient context + unit type | Itemized checklist with quantity/unit/notes | "Include only what is needed. Do not pad the list." |
| Handoff Report | Full patient record + recent notes | Summary + priority flags + stable items + actions | "Cut anything that doesn't help in the first 30 minutes" |

### Context Memory

The AI incorporates each patient's documented history when structuring new notes. The note structuring prompt includes the last 5 notes (Assessment and Plan sections only), enabling the AI to reference prior clinical context. A separate patient summary is generated asynchronously and displayed in the Context tab.

### The Markdown Fence Bug

Claude occasionally wraps JSON responses in markdown code fences even when instructed not to. The fix is dual: prompt instruction ("No markdown code fences. No preamble.") plus a parsing guard in the n8n pipeline that strips fences before JSON.parse. Both are necessary; neither alone is sufficient.

---

## Use Cases

### Primary: Shift Nurse (12-hour shifts, ICU and general ward)

- Dictates observations during or after patient care
- Reviews AI-structured notes for accuracy before approval
- Confirms or overrides AI-generated supply lists
- Escalates flagged notes that require senior review
- Relies on the system to maintain continuous patient context across a 12-hour shift

### Secondary: Incoming Nurse (shift handoff)

- Generates handoff report before or at the start of shift
- Reviews priority flags to understand what changed since last shift
- Identifies recommended first actions without reconstructing context from scratch
- Arrives at bedside with full situational awareness

### Tertiary: Charge Nurse / Unit Manager

- Monitors dashboard for flagged patients across the unit
- Reviews audit trail for compliance and quality assurance
- Identifies documentation gaps (patients without recent notes)

---

## Metrics and Instrumentation

| Metric | What It Measures | Why It Matters |
|--------|-----------------|---------------|
| **Dictation adoption rate** | % of notes entered via dictation vs. manual | If nurses aren't dictating, the context layer starves |
| **Flag accuracy rate** | % of flags acted on vs. dismissed | High dismiss rate = crying wolf; low flag rate on deteriorating patients = missing signals |
| **Supply list confirmation rate** | % of generated lists where nurses confirm items | If ignored, the feature isn't reducing cognitive load |
| **Handoff generation frequency** | Reports generated per shift change vs. total shift changes | If skipped, nurses don't trust the output |
| **Time-to-first-action** | Minutes from shift start to first patient care action | Hypothesis: system-generated handoff reduces this by 40%+ |

**Canary metric:** Dictation drop-off. If nurses stop dictating and revert to manual processes, the entire context layer degrades. Weekly dictation volume per nurse with alerts on sustained decline is the single most important instrumentation decision.

---

## Competitive Landscape

| Product | Capability | Gap |
|---------|-----------|-----|
| **Nuance DAX Copilot** | AI-assisted dictation and note structuring | No supply automation, no handoff generation, no anomaly flagging, no continuous context layer |
| **Epic Ambient Listening** | In-EHR ambient documentation | Locked inside Epic ecosystem (unavailable to 40% of US hospitals not on Epic) |
| **Nurse Context Engine** | Continuous context layer with notes + supplies + handoffs + flagging | Not a charting replacement; it is the context middleware between observation and action |

The Nurse Context Engine occupies a category neither Nuance nor Epic currently fills: a unified context layer that connects raw clinical observation to every downstream action (documentation, supply preparation, shift handoff, anomaly alerting) in a single system.

---

## Technical Specifications

### Performance

- Production build compiles in ~1.4 seconds
- Static pages pre-rendered, patient detail server-rendered on demand
- Supabase real-time latency: sub-second for INSERT/UPDATE propagation
- Skeleton loaders appear within 16ms of processing state change
- 15-second timeout triggers retry UI for slow AI responses

### Accessibility (WCAG 2.1 AA)

- All interactive components use Radix UI primitives with built-in ARIA
- Keyboard navigation: Tab for focus, Arrow keys for tabs/selects, Space/Enter for activation
- Focus ring visible on all interactive elements (blue ring)
- Semantic HTML throughout: article, aside, header, main, nav, dl/dt/dd, table, time, ol/ul
- `aria-label`, `aria-checked`, `aria-selected`, `aria-controls`, `aria-busy`, `role="status"`, `role="alert"` on relevant elements
- Screen reader support via `sr-only` class for visual-only content
- Minimum 44px touch targets on all buttons

### Browser Support

- Chrome (primary, demo machine)
- Firefox (secondary)
- Desktop only (workstation tool for clinical environments)

---

## Deployment

- **Frontend:** Vercel (Next.js) or localhost for demo
- **Backend:** n8n (cloud or self-hosted at localhost:5678)
- **Database:** Supabase (cloud-hosted PostgreSQL)
- **Environment variables:** SUPABASE_URL, SUPABASE_ANON_KEY, ANTHROPIC_API_KEY, N8N_WEBHOOK_URL

---

## Limitations and Honest Constraints

1. **Input quality dependency.** The system is only as current as what nurses dictate. If dictation adoption is low, the context layer degrades. This is a change management problem, not a technical one.

2. **Three-patient demo scope.** Prompts work reliably for three seeded patients with well-defined scenarios. They have not been stress-tested against edge cases: missing vitals, contradictory readings, extremely short/long inputs, or complex multi-system presentations.

3. **No EHR integration.** Production deployment requires integration via HL7 FHIR APIs or direct EHR vendor partnership. The demo runs standalone; the production system must connect to the hospital's existing EHR.

4. **No actual voice input.** Dictation is simulated via typewriter animation with pre-scripted text. Real speech-to-text integration would be required for production.

5. **No authentication.** Demo uses pre-defined nurse identities. Production requires proper user authentication and role-based access control.

6. **AI hallucination risk.** Claude may generate clinically plausible but incorrect information. All AI-generated content requires human review before clinical action. The system enforces this by requiring explicit nurse approval on every note.

---

## Source Code

Repository: [github.com/nwogbogozzy-a11y/ai_nurse_context_engine](https://github.com/nwogbogozzy-a11y/ai_nurse_context_engine)

Stack: Next.js 16 | React 19 | TypeScript | Tailwind CSS v4 | shadcn/ui | Supabase | n8n | Claude API
