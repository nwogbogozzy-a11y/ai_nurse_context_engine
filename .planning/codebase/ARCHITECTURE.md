# Architecture

**Analysis Date:** 2026-03-26

## Pattern Overview

**Overall:** Client-heavy single-page app with external automation backend (n8n) and cloud database (Supabase)

**Key Characteristics:**
- Next.js App Router frontend with all pages marked `'use client'` -- effectively a React SPA
- No server-side API routes; all backend logic lives in n8n workflows (self-hosted automation platform)
- Supabase serves as both the database and the direct-read data layer for the frontend
- AI processing (Claude API) happens exclusively inside n8n, never from the frontend
- Two separate n8n workflows handle the two main automation paths

## Layers

**Presentation Layer (Next.js Frontend):**
- Purpose: Render patient data, accept nurse input, display AI-processed outputs
- Location: `src/app/` (pages), `src/components/` (UI components)
- Contains: React client components, Tailwind-styled UI, typewriter animation logic
- Depends on: Supabase JS client for reads, n8n webhooks for writes/AI processing
- Used by: End user (nurse) via browser

**Automation Layer (n8n Workflows):**
- Purpose: Receive nurse input, orchestrate Claude API calls, write results to Supabase
- Location: `n8n-workflow.json` (main pipeline), `n8n-workflow-supply-lookup.json` (standalone supply lookup)
- Contains: Webhook endpoints, input parsing, Supabase REST calls, Claude API prompts, response routing
- Depends on: Supabase REST API, Claude API (Anthropic)
- Used by: Frontend via HTTP POST to webhook URLs

**Data Layer (Supabase):**
- Purpose: Persistent storage for patients, notes, supply requests, handoff reports
- Location: Cloud-hosted Supabase project; schema defined in `supabase/migrations/001_enable_rls.sql`
- Contains: 4 tables with RLS policies
- Depends on: Nothing (source of truth)
- Used by: Frontend (SELECT via JS client), n8n (SELECT + INSERT via REST API)

**Type Layer (Shared Contracts):**
- Purpose: Define TypeScript interfaces for all data models and API responses
- Location: `src/lib/types.ts`
- Contains: `Patient`, `Note`, `StructuredNote`, `SupplyItem`, `SupplyRequest`, `HandoffReport`, `PriorityFlag`, `WebhookResponse`, `SupplyLookupResponse`
- Used by: All frontend components and pages

## Data Flow

**Flow 1: Note Dictation (Primary)**

1. Nurse selects a demo script or types text in `DictationInput` component (`src/components/DictationInput.tsx`)
2. Typewriter animation plays at ~40ms/char, then auto-submits
3. Frontend POSTs to n8n webhook at `/webhook/nurse-context` with `{ patient_id, raw_input, nurse_name, shift, input_type: 'note' }`
4. n8n fetches patient context from Supabase REST API
5. n8n sends raw_input + patient context to Claude API for SOAP note structuring
6. Claude returns `{ structured_note, flagged, flag_reason, procedures[] }`
7. n8n saves note to Supabase `notes` table
8. If procedures detected: n8n calls Claude again for supply list generation, saves to `supply_requests` table
9. n8n returns full `WebhookResponse` JSON to frontend
10. Frontend calls `fetchData()` to refresh all data from Supabase, re-renders

**Flow 2: Handoff Report Generation**

1. Nurse clicks "Generate Handoff Report" button in patient detail sidebar
2. Frontend POSTs to n8n webhook at `/webhook/nurse-context` with `input_type: 'handoff'`
3. n8n fetches patient record + recent notes from Supabase
4. n8n sends to Claude for handoff briefing generation
5. Claude returns `{ summary, priority_flags, stable_items, recommended_first_actions }`
6. n8n saves to `handoff_reports` table
7. Frontend receives response, stores `stable_items` and `recommended_first_actions` in component state (these fields are NOT persisted to DB)
8. Frontend switches to handoff tab, re-fetches data from Supabase

**Flow 3: Standalone Supply Lookup**

1. Nurse types procedure name in `ProcedureSearch` component (`src/components/ProcedureSearch.tsx`)
2. Frontend POSTs to separate n8n webhook at `/webhook/supply-lookup` with `{ patient_id, procedure, unit_type }`
3. n8n fetches patient context, calls Claude for supply list
4. n8n saves to `supply_requests`, returns success
5. Frontend calls `fetchData()` to refresh supply list from Supabase

**State Management:**
- All persistent state lives in Supabase; frontend re-fetches after every mutation
- Local component state manages UI concerns: active tab, loading states, animation progress, confirmed supply items
- `handoffExtras` (stable_items, recommended_first_actions) stored in React state only -- lost on page refresh
- No global state management library (no Redux, Zustand, etc.)
- Patient data, notes, supplies, and handoffs fetched via `Promise.all` in `fetchData()` callback

## Key Abstractions

**WebhookResponse:**
- Purpose: Unified response contract from n8n back to frontend
- Definition: `src/lib/types.ts` (lines 73-94)
- Pattern: Contains required `note` field plus optional `supply_list` and `handoff_report` depending on flow

**StructuredNote (SOAP format):**
- Purpose: AI-structured clinical note with Subjective, Objective, Assessment, Plan sections
- Definition: `src/lib/types.ts` (lines 12-20)
- Pattern: Extended SOAP with optional HPI, comorbidities, and interventions fields

**Demo Scripts:**
- Purpose: Pre-scripted dictation text for each patient scenario
- Definition: `src/lib/demo-scripts.ts`
- Pattern: Record keyed by patient UUID, with `_alt` and `_change` suffixes for alternative scenarios

**FlagBadge:**
- Purpose: Visual indicator for clinical flag severity
- Definition: `src/components/FlagBadge.tsx`
- Pattern: Three-state badge (safe/warning/critical) with semantic colors

## Entry Points

**Dashboard Page:**
- Location: `src/app/page.tsx`
- Triggers: Browser navigates to `/`
- Responsibilities: Fetch all patients + latest note per patient from Supabase, render PatientCard grid

**Patient Detail Page:**
- Location: `src/app/patient/[id]/page.tsx`
- Triggers: Browser navigates to `/patient/{uuid}`
- Responsibilities: Fetch patient + all notes/supplies/handoffs, render three-column layout with tabs, handle dictation submission and handoff generation

**n8n Main Webhook:**
- Location: `n8n-workflow.json` (node N1)
- Triggers: POST to `http://localhost:5678/webhook/nurse-context`
- Responsibilities: Route between note processing, supply generation, and handoff report generation

**n8n Supply Lookup Webhook:**
- Location: `n8n-workflow-supply-lookup.json` (node S1)
- Triggers: POST to `http://localhost:5678/webhook/supply-lookup`
- Responsibilities: Standalone procedure-to-supply-list generation

## Error Handling

**Strategy:** Minimal -- try/catch at fetch boundaries, error messages displayed in UI

**Patterns:**
- Frontend wraps webhook calls in try/catch, displays error string in a red alert box (`flag-critical-bg` styling)
- n8n webhook errors surface as HTTP status codes; frontend checks `response.ok`
- No retry logic anywhere in the stack
- No error boundary components in React
- Supabase query failures are silently ignored (no error handling on `{ data }` destructuring)
- NurseActionBar actions (approve/escalate/override) only log to console -- no backend persistence

## Cross-Cutting Concerns

**Logging:** Console.log only (`NurseActionBar` logs actions to console). No structured logging.

**Validation:** None on the frontend. Input validation relies entirely on n8n pipeline and Claude prompt instructions.

**Authentication:** None. Supabase uses anon key with permissive RLS policies (SELECT all, INSERT all for `anon` role). No user authentication.

**Environment Configuration:**
- Frontend reads `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_N8N_WEBHOOK_URL`, `NEXT_PUBLIC_N8N_WEBHOOK_URL_SUPPLY` from environment
- n8n reads `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `ANTHROPIC_API_KEY` from its own environment
- Fallback webhook URLs hardcoded to `localhost:5678` in components

---

*Architecture analysis: 2026-03-26*
