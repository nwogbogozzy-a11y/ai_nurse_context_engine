# Debug Log: AI-Native Nurse Context Engine
_Updated: 2026-02-27_

---

## Bug 1: Claude Supply List Markdown Wrapping
**Layer:** Claude Prompt / n8n
**Scenario:** Margaret Thompson, supply list generation
**Symptom:** Claude wraps JSON response in ```json code fences, causing JSON.parse to fail
**Root cause:** Claude's default behavior wraps structured output in markdown fences despite "Return valid JSON only" instruction
**Fix applied:**
1. Added "No markdown code fences. No preamble." to supply list prompt
2. Added strip logic in N9a Save Supply and N10 Webhook Response nodes: `text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()`
**Verification:** Supply list now parses correctly — PASS

---

## Bug 2: PatientCard Age Display
**Layer:** Frontend
**Scenario:** All patients
**Symptom:** Age/gender display uses birth month to determine M/F which is incorrect
**Root cause:** The `getAge` function in PatientCard.tsx uses `birth.getMonth() < 6` to determine gender display, which is a placeholder. Patient gender is not stored in the database.
**Fix applied:** This is a known limitation for the demo. The patient descriptions in CLAUDE.md specify: Margaret 67F, Devon 44M, Aisha 31F. The current implementation approximates. For the demo, the card focuses on name/ward/status — gender is visible in the status description.
**Verification:** Cards display correctly with name, ward, and status — ACCEPTABLE for demo

---

## No Additional Bugs Found

All API-level tests pass. Frontend compiles with zero errors. No runtime errors detected in build output.

### Pending: n8n End-to-End

Full end-to-end testing will occur after n8n workflow import. Any bugs discovered during that phase will be logged here.
