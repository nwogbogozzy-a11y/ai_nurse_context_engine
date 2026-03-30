# External Integrations

**Analysis Date:** 2026-03-26

## APIs & External Services

### Anthropic Claude API

**Purpose:** AI processing layer for three tasks: note structuring (SOAP format), supply list generation, and handoff report generation.

**Model:** `claude-sonnet-4-20250514`

**How called:** HTTP POST to `https://api.anthropic.com/v1/messages` from n8n workflow nodes (not from frontend directly).

**Auth:** API key via `x-api-key` header, sourced from n8n environment variable `ANTHROPIC_API_KEY`. Uses `anthropic-version: 2023-06-01`.

**Nodes that call Claude:**
- `N4 Claude Structure Note` in `n8n-workflow.json` - Structures raw nurse dictation into SOAP notes, detects flags and procedures. Max tokens: 1024.
- `N8a Claude Supply List` in `n8n-workflow.json` - Generates itemized supply checklist for detected procedures. Max tokens: 1024.
- `N8b Claude Handoff Report` in `n8n-workflow.json` - Generates shift handoff briefing with priority flags. Max tokens: 2048.
- `S4 Claude Supply List` in `n8n-workflow-supply-lookup.json` - Standalone supply lookup for searched procedures. Max tokens: 1024.

**Response format:** All prompts request valid JSON only (no preamble). Responses are parsed from `content[0].text` with markdown code fence stripping.

### n8n (Workflow Automation)

**Purpose:** Backend orchestration layer. Receives webhook POSTs from the frontend, coordinates Supabase reads, Claude API calls, Supabase writes, and returns structured responses.

**How called:** Frontend POSTs to n8n webhook endpoints via `fetch()`.

**Two workflows:**

**1. Main Workflow** (`n8n-workflow.json`):
- Webhook: `POST /webhook/nurse-context`
- Flow: Parse input -> Fetch patient from Supabase -> Claude structures note -> Parse response -> Save note to Supabase -> Route (handoff/supply/response-only) -> Optionally call Claude for supply list or handoff report -> Save to Supabase -> Return JSON response
- 12 nodes (N1-N10, with N8a/N8b and N9a/N9b branches)
- Router branches on: `input_type === 'handoff'` or `procedures.length > 0`

**2. Supply Lookup Workflow** (`n8n-workflow-supply-lookup.json`):
- Webhook: `POST /webhook/supply-lookup`
- Flow: Parse input -> Fetch patient -> Claude generates supply list -> Save to Supabase -> Return JSON response
- 6 nodes (S1-S6)
- Note: Uses `$vars` (n8n variables) instead of `$env` for Supabase credentials, unlike the main workflow which uses `$env`

**Frontend webhook URLs:**
- Main: `process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL` or fallback `http://localhost:5678/webhook/nurse-context` (used in `src/components/DictationInput.tsx`)
- Supply: `process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL_SUPPLY` or fallback `http://localhost:5678/webhook/supply-lookup` (used in `src/components/ProcedureSearch.tsx`)

**CORS:** Both webhooks return `Access-Control-Allow-Origin: *` and `Access-Control-Allow-Headers: Content-Type` headers.

### Google Fonts

**Purpose:** Load Inter font family for the clinical UI.

**How called:** External stylesheet link in `src/app/layout.tsx`:
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

**Auth:** None (public CDN).

## Database

### Supabase (PostgreSQL)

**Provider:** Supabase (hosted PostgreSQL with REST API).

**Connection methods:**
1. **Frontend (reads):** `@supabase/supabase-js` client initialized in `src/lib/supabase.ts` using `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
2. **n8n (reads and writes):** Direct HTTP requests to Supabase REST API (`/rest/v1/*` endpoints) using `apikey` header and `Authorization: Bearer` header with anon key.

**Tables:**

| Table | Purpose | Frontend Access | n8n Access |
|---|---|---|---|
| `patients` | Patient demographics, ward, status | SELECT | SELECT |
| `notes` | Structured clinical notes (SOAP), flags | SELECT | SELECT, INSERT |
| `supply_requests` | Generated supply checklists per procedure | SELECT | INSERT |
| `handoff_reports` | Shift handoff briefings with priority flags | SELECT | INSERT |

**Schema details** (from `src/lib/types.ts`):
- `patients`: id, full_name, date_of_birth, admission_date, ward, unit_type, current_status, created_at
- `notes`: id, patient_id, raw_input, structured_note (JSONB - SOAP format with optional HPI/comorbidities/interventions), shift, nurse_name, flagged (boolean), flag_reason, created_at
- `supply_requests`: id, patient_id, procedure, items (JSONB array of {item, quantity, unit, notes}), generated_at, confirmed_by
- `handoff_reports`: id, patient_id, incoming_nurse, summary, flags (JSONB array of {type, detail}), generated_at, shift_start

**Row Level Security:**
- RLS enabled on all 4 tables (`supabase/migrations/001_enable_rls.sql`)
- `anon` role: SELECT on all tables, INSERT on notes/supply_requests/handoff_reports
- No UPDATE or DELETE policies (write-only append model)

**Seeded data:** 3 patients pre-loaded:
- Margaret Thompson (`ffbb7417-3d1a-4087-86c5-1e0e400fae80`) - 67F, post-op, Ward 3B
- Devon Clarke (`612f2006-e34f-4bc2-86fe-37da67840e52`) - 44M, ICU, Ward 5A
- Aisha Mensah (`393ceb5c-5580-4deb-9ffb-c546319bb65f`) - 31F, general, Ward 2C

## Third-Party SDKs

| SDK | Version | Location | Purpose |
|---|---|---|---|
| `@supabase/supabase-js` | ^2.98.0 | `src/lib/supabase.ts` | Database client for frontend reads |

No other third-party SDKs. Claude API is called via raw HTTP from n8n, not via an SDK.

## Webhooks & Events

### Inbound Webhooks (n8n receives from frontend):

**`POST /webhook/nurse-context`**
- Source: `src/components/DictationInput.tsx`
- Payload: `{ patient_id, raw_input, nurse_name, shift, input_type }`
- `input_type`: `'note'` (default) or `'handoff'`
- Response: `WebhookResponse` (see `src/lib/types.ts`) containing structured note, optional supply list, optional handoff report

**`POST /webhook/supply-lookup`**
- Source: `src/components/ProcedureSearch.tsx`
- Payload: `{ patient_id, procedure, unit_type }`
- Response: `SupplyLookupResponse` with procedure name and items array

### Outbound Webhooks:
- None. The system does not send webhooks to external services.

### Outbound API Calls (from n8n):
- Supabase REST API (reads and writes)
- Anthropic Messages API (Claude inference)

## Environment Configuration

**Required env vars for frontend (.env or .env.local):**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon/public key
- `NEXT_PUBLIC_N8N_WEBHOOK_URL` - Main n8n webhook (optional, defaults to localhost)
- `NEXT_PUBLIC_N8N_WEBHOOK_URL_SUPPLY` - Supply lookup webhook (optional, defaults to localhost)

**Required env vars for n8n:**
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anon key (main workflow uses `$env`, supply workflow uses `$vars`)
- `ANTHROPIC_API_KEY` - Anthropic API key for Claude

**Secrets location:**
- `.env` file at project root (gitignored)

## Monitoring & Observability

**Error Tracking:** None. Errors are caught in try/catch blocks in components and displayed in UI.

**Logs:** Console only (browser dev tools). No structured logging framework.

**Health Checks:** None.

---

*Integration audit: 2026-03-26*
