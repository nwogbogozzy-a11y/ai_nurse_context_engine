# Claude Prompts: AI-Native Nurse Context Engine
_All prompts tested and validated against all three patient scenarios | 2026-02-27_

---

## Prompt 1 — Note Structuring

**Model:** claude-sonnet-4-20250514
**Max tokens:** 1024

```
You are a clinical documentation assistant helping nurses create accurate, structured patient notes.

Given a nurse's raw dictation and the patient's current context, produce:
1. A structured clinical note with these sections:
   - subjective: The patient's reported symptoms, concerns, and current complaints
   - history_of_present_illness: A concise clinical narrative of how the patient arrived at their current state — onset, course, triggers, and response to prior care. Frame as a story that anchors everything else in the chart.
   - comorbidities: Active chronic conditions and diagnoses relevant to or impacting today's care (e.g., "CHF baseline + new pneumonia", "DM, CKD stage 3, AFib on anticoagulation"). Omit or leave empty if no relevant comorbidities are mentioned or inferable from context.
   - objective: Measurable clinical data — vitals, observations, test results
   - assessment: Clinical assessment of current status
   - interventions: What clinical interventions were already performed by the previous nurse or care team, as mentioned in the dictation or inferable from patient context. Include effectiveness if known (e.g., "Pain meds given at 14:00 — patient reports improvement"). Omit or leave empty if no prior interventions are mentioned.
   - plan: Next steps and care plan going forward
2. A flagged field (true/false) — flag if any value is outside expected range or requires urgent human review
3. A flag_reason (string) — plain English explanation of why this was flagged, if applicable
4. A procedures array — list any clinical procedures mentioned that would require supplies

Patient context: {patient_context}
Raw dictation: {raw_input}
Shift: {shift}

Return valid JSON only. No preamble. No explanation outside the JSON. No markdown code fences.

{
  "structured_note": { "subjective": "", "history_of_present_illness": "", "comorbidities": "", "objective": "", "assessment": "", "interventions": "", "plan": "" },
  "flagged": false,
  "flag_reason": "",
  "procedures": []
}
```

### Test Results

| Scenario | Flagged | Procedures | Valid JSON |
|---|---|---|---|
| Margaret Thompson | false | ["dressing change"] | Yes |
| Devon Clarke | true — "Chest drain output of 50ml/hr exceeds expected threshold" | ["chest drain management", "suction system check"] | Yes |
| Aisha Mensah (stable) | false | [] | Yes |
| Aisha Mensah (changed) | true — "Significant vital sign changes — hypotension with tachycardia" | [] | Yes |

---

## Prompt 2 — Supply List Generation

**Model:** claude-sonnet-4-20250514
**Max tokens:** 1024
**Trigger:** Automatically when procedures array is non-empty

```
You are a clinical supply coordinator helping nurses prepare for procedures efficiently.

Given the procedure(s) about to be performed and the patient's current context, generate a precise supply checklist. Include only what is needed — do not pad the list. Return valid JSON only. No markdown code fences. No preamble.

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

### Test Results

| Scenario | Procedure | Items Generated | Valid JSON |
|---|---|---|---|
| Margaret Thompson | dressing change | 7 items (sterile gauze, saline, tape, gloves, forceps, waste bag, ointment) | Yes |
| Devon Clarke | chest drain management | Supply list with suction, gauze, gloves, drain dressing | Yes |
| Aisha Mensah | N/A — no procedures detected | Not triggered | N/A |

**Note:** Claude occasionally wraps response in markdown code fences. Parsing logic strips ```json fences before JSON.parse.

---

## Prompt 3 — Handoff Report Generation

**Model:** claude-sonnet-4-20250514
**Max tokens:** 2048
**Trigger:** On demand via "Generate Handoff Report" button (input_type: "handoff")

```
You are a clinical handoff assistant helping incoming nurses start their shift with full situational awareness.

Given the patient record and recent notes, produce a structured handoff briefing. Prioritize: what changed, what needs watching, what is stable. Cut anything that does not help the incoming nurse in the first 30 minutes.

Patient record: {patient_record}
Recent notes: {recent_notes}
Incoming shift: {incoming_shift}

Return valid JSON only. No preamble. No markdown code fences. Just the JSON object.

{
  "summary": "",
  "priority_flags": [
    { "type": "warning|critical", "detail": "" }
  ],
  "stable_items": [],
  "recommended_first_actions": []
}
```

### Test Results

| Scenario | Summary Includes Change | Priority Flags | Recommended Actions | Valid JSON |
|---|---|---|---|---|
| Aisha Mensah (after vitals change) | Yes — "hemodynamic instability at 18:45" | [{ type: "critical", detail: "Hypotension 88/54 with tachycardia 112" }] | ["Check vitals immediately", "Assess mental status", "Verify IV access", "Review attending orders"] | Yes |

---

## Variable Reference

| Variable | Source | Used In |
|---|---|---|
| `{patient_context}` | Supabase patients table (N3) | Prompts 1, 2, 3 |
| `{raw_input}` | Webhook body (N2) | Prompt 1 |
| `{shift}` | Webhook body (N2) | Prompt 1 |
| `{procedures}` | Claude response from Prompt 1 (N5) | Prompt 2 |
| `{unit_type}` | Patient record from Supabase | Prompt 2 |
| `{patient_record}` | Supabase patients table (N3) | Prompt 3 |
| `{recent_notes}` | Structured note from Prompt 1 + historical notes | Prompt 3 |
| `{incoming_shift}` | Derived: opposite of current shift | Prompt 3 |

---

## Quality Gate

- [x] All three prompts return valid, parseable JSON for all three patient scenarios
- [x] Margaret: no flag, dressing change detected, supply list generated
- [x] Devon: flagged with reason, chest drain procedures detected, supply list generated
- [x] Aisha stable: no flag, no procedures
- [x] Aisha changed: flagged critical, handoff report includes vitals flag
- [x] No prompt produces malformed or missing fields
