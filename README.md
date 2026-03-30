# AI-Native Nurse Context Engine

A living patient context system that gives hospital nurses instant situational awareness, eliminating the cognitive reconstruction work that consumes 30-40% of every shift.

**Live demo:** https://nursecontextengine.vercel.app/
**Repository:** https://github.com/nwogbogozzy-a11y/ai_nurse_context_engine

---

## The Problem

Hospital nursing workflows were designed around paper, memory, and verbal handoff. Nurses spend 30-40% of every shift reconstructing context that already existed: documenting observations from memory, receiving shift handoffs of uneven quality, and making multiple supply room trips because there is no structured pre-procedure checklist.

All three breakdowns share one root cause. There was no tool that could hold patient context continuously. That constraint no longer applies.

---

## What It Does

One continuously updated patient context layer that powers three workflows nurses currently rebuild from scratch at every transition point.

### 1. Structured Clinical Notes

The nurse types or dictates a raw observation. The system sends it to Claude alongside the patient record and returns a structured SOAP note (extended with HPI, Comorbidities, and Interventions based on nurse feedback). If any value falls outside expected range, the note is flagged with a plain-English reason. The nurse approves or overrides. All clinical judgment stays with the human.

### 2. Supply Checklists

When a procedure is mentioned in a note, the system automatically generates an itemized supply checklist for that procedure, with quantities, units, and preparation notes. Checklists can also be generated on demand via the Procedure Search panel without writing a note first.

### 3. Shift Handoff Reports

Generated on demand from the full patient record and all notes from the last 24 hours. The report surfaces what changed, what needs watching, and what is stable, structured so an incoming nurse can read it before stepping into the room. Priority flags appear at the top.

---

## Architecture

```
Nurse input
    |
    v
n8n webhook (POST)
    |
    v
Parse input: patient_id, raw_input, nurse_name, shift, input_type
    |
    v
Fetch patient context from Supabase
    |
    v
Claude API: structure note, detect flags, detect procedures
    |
    v
Router: procedures detected? --> supply list pipeline
        handoff requested?   --> handoff report pipeline
        else                 --> save note, return to frontend
    |
    v
Supabase (INSERT) --> frontend renders structured output
```

Two n8n pipelines:

- **Main pipeline:** handles note structuring, automatic supply list generation on procedure detection, and handoff report generation on demand.
- **Supply lookup pipeline:** standalone webhook for on-demand procedure search, independent of note submission.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Backend/Automation | n8n (webhook-driven pipelines) |
| Database | Supabase (PostgreSQL) |
| AI | Claude API (claude-sonnet-4-20250514) via n8n HTTP nodes |
| Deployment | Vercel |

---

## Database Schema

**`patients`**
`id`, `full_name`, `date_of_birth`, `admission_date`, `ward`, `unit_type`, `current_status`, `created_at`

**`notes`**
`id`, `patient_id`, `raw_input`, `structured_note`, `shift`, `nurse_name`, `flagged`, `flag_reason`, `created_at`

**`supply_requests`**
`id`, `patient_id`, `procedure`, `items` (jsonb), `generated_at`, `confirmed_by`

**`handoff_reports`**
`id`, `patient_id`, `incoming_nurse`, `summary`, `flags` (jsonb), `generated_at`, `shift_start`

---

## Demo Patients

Three patients are seeded in the database for demonstration purposes.

| Patient | Age/Sex | Ward | Status | Scenario |
|---|---|---|---|---|
| Margaret Thompson | 67F | Ward 3B | Post-op, stable | Clean note, automatic dressing change supply list, no flags |
| Devon Clarke | 44M | Ward 5A, ICU | Chest drain in situ | Drain output anomaly detected, flagged for human review, suction supply list generated |
| Aisha Mensah | 31F | Ward 2C | General ward | Stable on admission, vitals change mid-shift, flag appears in handoff report |

---

## Project Structure

The Next.js application lives inside `src/`.

```
src/
  app/
    layout.tsx
    page.tsx              # Patient list dashboard
    patient/              # Patient detail view (dynamic route)
  components/
    DictationInput.tsx    # Typewriter animation + note submission
    FlagBadge.tsx         # Warning / critical / safe variants
    HandoffReport.tsx     # Shift handoff report panel
    NurseActionBar.tsx    # Approve / flag / override actions
    PatientCard.tsx       # Summary card for dashboard
    ProcedureSearch.tsx   # On-demand supply list lookup
    StructuredNote.tsx    # Rendered SOAP note display
    SupplyChecklist.tsx   # Itemized checklist with confirm actions
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A running n8n instance with the two pipeline JSONs imported (`n8n-workflow.json`, `n8n-workflow-supply-lookup.json`)
- A Supabase project with the four tables created and seeded
- An Anthropic API key configured in n8n

### Installation

1. Clone the repository.

```bash
git clone https://github.com/nwogbogozzy-a11y/ai_nurse_context_engine.git
cd ai_nurse_context_engine/src
```

2. Install dependencies.

```bash
npm install
```

3. Create a `.env.local` file in the `src/` directory with the following variables.

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_N8N_WEBHOOK_URL=
NEXT_PUBLIC_N8N_WEBHOOK_URL_SUPPLY=
```

4. Run the development server.

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### n8n Setup

1. Import `n8n-workflow.json` into your n8n instance as the main pipeline.
2. Import `n8n-workflow-supply-lookup.json` as the supply lookup pipeline.
3. Set the `ANTHROPIC_API_KEY`, `SUPABASE_URL`, and `SUPABASE_ANON_KEY` credentials in n8n.
4. Activate both workflows. Copy the webhook URLs into your `.env.local`.

---

## Design Notes

**Color carries only meaning.** Amber indicates a flagged anomaly requiring human review. Red indicates a critical condition. Green indicates a note that has been auto-approved as clear. No color is used for decoration.

**AI flags, humans decide.** The system detects anomalies and surfaces them with a plain-English reason. It does not interpret them clinically, escalate them, or act on them. Every clinical decision remains with the nurse.

**SOAP format is extended.** Based on feedback from active nursing professionals, the structured note format includes HPI (History of Present Illness), Comorbidities, and Interventions in addition to standard SOAP fields.

**JSON parsing workaround.** Claude occasionally wraps JSON responses in markdown code fences. Both n8n pipelines include a strip function that removes fence markers before parsing. This is documented in `debug-log.md`.

---

## Accessibility

The interface targets WCAG 2.1 AA compliance. It is designed for desktop workstations (primary breakpoints: 1280px, 1440px, 1920px) in Chrome and Firefox.

---

## Author

Gozzy Nwogbo
