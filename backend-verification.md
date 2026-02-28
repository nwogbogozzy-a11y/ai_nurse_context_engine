# Backend Verification: AI-Native Nurse Context Engine
_Verified: 2026-02-27_

---

## Prerequisites Verified

- [x] Supabase tables exist: patients, notes, supply_requests, handoff_reports
- [x] Three patients seeded: Margaret Thompson, Devon Clarke, Aisha Mensah
- [x] Supabase URL: https://ofmmfffibcccpugcdqok.supabase.co
- [x] Anthropic API key: available and tested
- [x] Claude model: claude-sonnet-4-20250514

---

## Node Configuration Summary

| Node | Type | Purpose | Status |
|---|---|---|---|
| N1 Webhook | webhook | POST /webhook/nurse-context, responseNode mode, CORS enabled | Configured |
| N2 Parse Input | set | Extracts patient_id, raw_input, nurse_name, shift, input_type from body | Configured |
| N3 Fetch Patient Context | httpRequest | GET from Supabase patients table by patient_id | Configured |
| N4 Claude Structure Note | httpRequest | POST to Claude API — note structuring prompt | Configured |
| N5 Parse Claude Response | set | Parses Claude JSON response, extracts structured_note, flagged, flag_reason, procedures | Configured |
| N6 Save Note to Supabase | httpRequest | POST to Supabase notes table with all fields | Configured |
| N7 Router | switch | Routes: handoff → N8b, procedures detected → N8a, else → N10 | Configured |
| N8a Claude Supply List | httpRequest | POST to Claude API — supply list generation prompt | Configured |
| N8b Claude Handoff Report | httpRequest | POST to Claude API — handoff report generation prompt | Configured |
| N9a Save Supply Request | httpRequest | POST to Supabase supply_requests table | Configured |
| N9b Save Handoff Report | httpRequest | POST to Supabase handoff_reports table | Configured |
| N10 Webhook Response | respondToWebhook | Returns full JSON response with note + supply_list + handoff_report | Configured |

---

## Scenario Test Results

### Scenario 1 — Margaret Thompson (Straightforward)

**Input:** "Margaret had a comfortable night. Pain score 3 out of 10, well managed with oral analgesia. Mobilized twice with physio, tolerating weight bearing. Wound site clean, performing a dressing change this morning."

**Claude Note Response:**
- structured_note: Valid SOAP format
  - S: Patient reports comfortable night. Pain score 3/10.
  - O: Day 2 post right hip replacement. Mobilized twice. Wound site clean.
  - A: Post-operative recovery progressing well.
  - P: Continue pain management. Continue physio. Monitor wound.
- flagged: false
- flag_reason: ""
- procedures: ["dressing change"]

**Supply List Generated:** Yes — 7 items including sterile gauze, saline, tape, gloves, forceps, waste bag, antimicrobial ointment

**Result:** PASS

---

### Scenario 2 — Devon Clarke (Complex / Flagged)

**Input:** "Devon's drain output has been higher than expected overnight — approximately 200mls in the last 4 hours. Vitals otherwise stable. Will need to manage the chest drain and check suction."

**Claude Note Response:**
- structured_note: Valid SOAP format
  - S: Higher than expected drain output overnight.
  - O: Drain output 200ml/4hrs (50ml/hr). Vitals stable.
  - A: Increased chest drain output requiring close monitoring.
  - P: Continue drain management. Check suction system.
- flagged: true
- flag_reason: "Chest drain output of 50ml/hr (200ml in 4 hours) is higher than expected and may indicate complications requiring physician evaluation"
- procedures: ["chest drain management", "suction system check"]

**Supply List Generated:** Yes — chest drain management supplies

**Result:** PASS

---

### Scenario 3 — Aisha Mensah (Dynamic / Shift Change)

**Input 1 (stable):** "Aisha settled overnight, obs stable, resting comfortably."
- flagged: false
- procedures: []

**Input 2 (changed):** "18:45 — Aisha's BP has dropped to 88/54. HR elevated at 112. Appears diaphoretic. Attending notified."
- flagged: true
- flag_reason: "Significant vital sign changes — hypotension (88/54) with tachycardia (112) and diaphoresis indicating potential hemodynamic instability"
- procedures: []

**Handoff Report Generated:**
- summary: "Aisha Mensah, 29F, Ward 2C. Was stable overnight until 18:45 when developed hemodynamic instability..."
- priority_flags: [{ type: "critical", detail: "Hypotension (88/54) with tachycardia (112) and diaphoresis at 18:45" }]
- stable_items: ["Was comfortable and stable through most of shift until evening"]
- recommended_first_actions: ["Check current vital signs immediately", "Assess mental status and perfusion", "Verify IV access patency", "Review recent orders from attending"]

**Result:** PASS

---

## Webhook URL for Integration Agent

```
POST http://localhost:5678/webhook/nurse-context
```

**Request body:**
```json
{
  "patient_id": "<uuid>",
  "raw_input": "<dictation text>",
  "nurse_name": "Nurse Name",
  "shift": "day|night",
  "input_type": "note|handoff"
}
```

**Response:**
```json
{
  "success": true,
  "note": {
    "structured_note": { "subjective": "", "objective": "", "assessment": "", "plan": "" },
    "flagged": false,
    "flag_reason": "",
    "procedures": [],
    "patient_id": "",
    "nurse_name": "",
    "shift": ""
  },
  "supply_list": { "procedure": "", "items": [] },
  "handoff_report": { "summary": "", "priority_flags": [], "stable_items": [], "recommended_first_actions": [] }
}
```

---

## n8n Environment Variables Required

```
SUPABASE_URL=https://ofmmfffibcccpugcdqok.supabase.co
SUPABASE_ANON_KEY=<key>
ANTHROPIC_API_KEY=<key>
```

## Workflow File

Exported to: `n8n-workflow.json` in project root. Import into n8n via Settings > Import Workflow.

---

## Edge Cases Noted

1. **Markdown code fences:** Claude sometimes wraps JSON in ```json fences. Added strip logic in N9a and N10 response nodes.
2. **Supply list not triggered for Aisha:** Correct — vitals change doesn't mention a procedure, so no supply list generated.
3. **Handoff requires input_type: "handoff":** Frontend must send this explicitly when "Generate Handoff Report" is clicked.
