# Integration Verification: AI-Native Nurse Context Engine
_Verified: 2026-02-27_

---

## Integration Architecture

```
Frontend (Next.js, localhost:3000)
  ├── Supabase JS Client → Direct reads (patients, notes, supply_requests, handoff_reports)
  └── n8n Webhook POST → All AI processing (note structuring, supply list, handoff report)
        └── n8n (localhost:5678)
              ├── Claude API → AI processing
              └── Supabase REST API → Writes (notes, supply_requests, handoff_reports)
```

---

## Flow 1 — Note Submission

**Path:** Frontend dictation submit → POST to n8n → Claude structures note → Supabase updated → Frontend re-fetches and renders

| Step | Component | Verified |
|---|---|---|
| User clicks "Begin Dictation" | DictationInput.tsx | Typewriter animation starts at 40ms/char |
| Animation completes | DictationInput.tsx | Submit fires automatically |
| POST to n8n webhook | fetch() to /webhook/nurse-context | Body: patient_id, raw_input, nurse_name, shift, input_type |
| n8n processes | N1→N2→N3→N4→N5→N6→N7→N10 | Claude structures note, saves to Supabase |
| Response returned | WebhookResponse type | Contains structured_note, flagged, flag_reason, procedures |
| Frontend re-fetches | supabase.from('notes').select() | New note appears in Notes tab |
| UI renders | StructuredNote.tsx | SOAP format displayed with flag if applicable |

**Status:** Architecture verified. Full end-to-end requires n8n running.

---

## Flow 2 — Supply List (Auto-Generated)

**Path:** Procedure detected in note → n8n generates supply list → Supabase updated → Frontend renders checklist

| Step | Component | Verified |
|---|---|---|
| Claude detects procedure | N5 Parse Claude Response | procedures[] populated |
| N7 Router branches | Switch node | Routes to N8a when procedures.length > 0 |
| Claude generates supply list | N8a Claude Supply List | Returns procedure + items[] |
| Saved to Supabase | N9a Save Supply Request | supply_requests table updated |
| Response includes supply_list | N10 Webhook Response | supply_list field in response |
| Frontend auto-switches tab | PatientDetail.tsx | setActiveTab('supplies') when supply_list present |
| Checklist renders | SupplyChecklist.tsx | Items with confirm checkboxes + "Mark All Ready" |

**Status:** Architecture verified. Auto-tab switch on supply detection implemented.

---

## Flow 3 — Handoff Report (On Demand)

**Path:** User clicks "Generate Handoff Report" → POST to n8n → Claude synthesizes → Supabase updated → Frontend renders

| Step | Component | Verified |
|---|---|---|
| User clicks button | Patient sidebar button | input_type: "handoff" sent |
| POST to n8n | fetch() to webhook | Includes patient_id + latest note context |
| N7 Router branches | Switch node | Routes to N8b for handoff |
| Claude generates report | N8b Claude Handoff Report | Returns summary, priority_flags, stable_items, recommended_first_actions |
| Saved to Supabase | N9b Save Handoff Report | handoff_reports table updated |
| Frontend re-fetches | supabase.from('handoff_reports').select() | New report appears |
| Report renders | HandoffReport.tsx | Summary + priority flags + stable items + first actions |

**Status:** Architecture verified. Generation timestamp displayed.

---

## Flow 4 — Flag Display

**Path:** Flagged note → badges appear on dashboard and detail view → human review controls

| Step | Component | Verified |
|---|---|---|
| Note has flagged: true | Supabase notes table | flag_reason populated |
| Dashboard card shows flag | PatientCard.tsx | Left border color + FlagBadge component |
| Detail view shows flag | StructuredNote.tsx | Flag badge in header + alert box with reason |
| Action bar appears | NurseActionBar.tsx | Approve / Escalate / Override buttons |
| Action recorded | NurseActionBar state | Action feedback shown (approved/escalated/overridden) |

**Status:** Architecture verified. Flag type detection (warning vs critical) based on flag_reason content.

---

## Environment Requirements for Demo

```
# Terminal 1 — Frontend
cd src && npm run dev
# → localhost:3000

# Terminal 2 — n8n (must be running with imported workflow)
# → localhost:5678/webhook/nurse-context

# .env.local in src/ directory
NEXT_PUBLIC_SUPABASE_URL=https://ofmmfffibcccpugcdqok.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<key>
NEXT_PUBLIC_N8N_WEBHOOK_URL=http://localhost:5678/webhook/nurse-context
```

---

## Known Integration Notes

1. **CORS:** n8n webhook configured with Access-Control-Allow-Origin: * for local dev
2. **Handoff report data:** The webhook response includes `handoff_report` with full structured data; Supabase stores `summary` and `flags` fields. Frontend HandoffReport component reads from Supabase for persisted reports.
3. **Supply auto-switch:** When dictation result includes a supply_list, the active tab automatically switches to "Supply Requests" to immediately show the generated checklist.
4. **Re-fetch pattern:** After every webhook response, the frontend re-fetches all data from Supabase to ensure consistency between what n8n wrote and what the UI displays.
