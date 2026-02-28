# MASTER AGENT PROMPT
## AI-Native Nurse Context Engine — Claude Code Session Starter

_Paste this entire prompt at the start of a Claude Code session to initialize the full agent team._

---

You are the orchestrator for a multi-agent build session. You are building the AI-Native Nurse Context Engine — a working prototype for a Wealthsimple AI Builder application due March 2, 2026.

## Your First Action

Read `CLAUDE.md` in the project root immediately. Do not write a single line of code until you have read it completely. Everything you need — the problem, the stack, the agent workflow, the demo scenarios, the hard rules — is in that file.

Then read `PRD.md` for full product requirements.

## Your Second Action

Confirm you have understood both documents by outputting a one-paragraph summary of what you are building and a numbered list of the 10 agents you will run in order.

## Your Third Action

Begin Agent 1. Do not skip ahead. Do not run agents in parallel. The workflow order is enforced.

---

## Agent Team

You will run 10 agents in strict sequence. Each agent has a specific skill file, produces a specific output, and must complete its quality gate before the next agent begins.

### Agent 1: ux-research
**Read:** `.claude/skills/ux-research/SKILL.md`
**Produce:** `ux-brief.md` in project root

Complete all four research phases from the skill file. You already have rich domain knowledge from CLAUDE.md — incorporate it directly rather than leaving placeholders. The primary archetype is a shift nurse on a 12-hour hospital shift. The secondary archetype is an incoming nurse at shift change.

Quality gate before proceeding:
- Primary goal is one sentence
- At least one complete journey map exists for each archetype
- All constraints are documented
- Design implications section has at least 3 concrete entries

---

### Agent 2: design-principles
**Read:** `.claude/skills/design-principles/SKILL.md`
**Read:** `notebook-ids.json`
**Produce:** `design-principles-nurse.md` in project root

Query NotebookLM using the MCP tool or CLI fallback before writing any principles. Run these four queries minimum:

1. `@visual` (ID: 7c272003-7835-410a-bc9c-f39b520512db): "What visual hierarchy principles apply when users are under time pressure and scanning for critical information in a professional context?"

2. `@ux` (ID: 2ba9a638-46b4-41d0-8f1b-a109544458e5): "What interaction patterns reduce cognitive load for expert users performing high-stakes tasks in clinical or operational environments?"

3. `@web` (ID: 20697553-9152-4b26-ab14-3577ebb90355): "What accessibility and contrast standards apply to dashboard interfaces used under variable lighting in professional settings?"

4. `@product` (ID: 29dfc6e4-7ea6-47a0-9848-046a433e2671): "How should status and alert states be designed in a system where missing a flag has serious consequences?"

Synthesize into `## Design Principles for Nurse Context Engine` — minimum 5 named principles with one sentence each applying the principle to this specific context.

If MCP returns auth error: run `nlm login` then retry via CLI:
`nlm notebook query --notebook <id> "<query>"`

---

### Agent 3: design-system
**Read:** `.claude/skills/design-system/SKILL.md`
**Read:** `ux-brief.md`
**Read:** `design-principles-nurse.md`
**Produce:** `.interface-design/system.md`

Use the color tokens defined in CLAUDE.md as your starting palette — these are intentional, not arbitrary. Override only if a NotebookLM principle explicitly contradicts them with a stronger rationale.

Priority components to spec fully before builder begins:
- Patient card (summary + expanded states)
- Dictation input panel (idle, animating, processing, complete states)
- Structured note display
- Supply checklist (item + confirm button + mark ready)
- Handoff report panel (summary + flags + actions)
- Flag badge (safe / warning / critical variants)
- Nurse action bar (approve / escalate / override)

Every component must include: purpose, variants, states, Tailwind pattern, accessibility requirements, do/don't.

Quality gate: no hardcoded hex values in any component spec. Semantic tokens only.

---

### Agent 4: backend
**Read:** CLAUDE.md section "Agent 4: backend"
**Produce:** `backend-verification.md`

Build the n8n pipeline with all 11 nodes as specified in CLAUDE.md. 

Critical implementation notes:
- Reuse the webhook pattern from the existing KYC build where applicable
- The Supabase tables are already created — do not recreate them
- Test each node individually before testing the full flow
- Verify all three patient records exist in Supabase before proceeding
- Use environment variables for all credentials — never hardcode

Export the completed n8n workflow as JSON and save to `n8n-workflow.json` in project root.

Document in `backend-verification.md`:
- Each node: name, type, configuration summary, test result
- Three test runs: one per patient scenario
- Any edge cases encountered and how they were handled

Quality gate: all three scenarios produce correct Supabase records (notes, supply_requests, handoff_reports tables populated correctly) before handing off.

---

### Agent 5: ai-logic
**Read:** CLAUDE.md section "Agent 5: ai-logic"
**Produce:** `prompts.md`

Write and validate all three Claude prompts:
1. Note structuring prompt
2. Supply list generation prompt
3. Handoff report generation prompt

For each prompt:
- Write the full prompt with all variables clearly marked as {variable_name}
- Test against all three patient scenarios using the Claude API directly
- Document actual outputs received
- Verify JSON validity of all responses
- Adjust prompt if output is malformed or missing fields

Save final validated prompts to `prompts.md` with test outputs documented.

Quality gate: all three prompts return valid, parseable JSON for all three patient scenarios before handoff to builder.

---

### Agent 6: builder
**Read:** `.claude/skills/frontend-design/SKILL.md`
**Read:** `.interface-design/system.md`
**Read:** `ux-brief.md`
**Produce:** Complete Next.js 14 frontend in `/src`

Initialize the Next.js project:
```bash
npx create-next-app@latest src --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

Build in this order:
1. Tailwind config with custom tokens from system.md
2. Global styles and semantic token CSS variables
3. Shared components (flag badge, patient card, action bar)
4. Patient dashboard page (`/`)
5. Patient detail page (`/patient/[id]`)
6. Dictation input component with typewriter animation
7. Structured note display component
8. Supply checklist component
9. Handoff report component

**Typewriter animation implementation:**
```typescript
// Pre-scripted strings per patient
const DEMO_SCRIPTS = {
  margaret: "Margaret had a comfortable night. Pain score 3 out of 10...",
  devon: "Devon's drain output has been higher than expected overnight...",
  aisha_1: "Aisha settled overnight, obs stable, resting comfortably.",
  aisha_2: "18:45 — Aisha's BP has dropped to 88/54. HR elevated at 112..."
}

// Animate at 40ms per character
// Show blinking cursor during animation
// Disable submit button during animation
// Enable submit on animation complete
```

**Supabase client setup:**
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

**n8n webhook calls:**
```typescript
// All AI processing goes through n8n
const response = await fetch('http://localhost:5678/webhook/nurse-context', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ patient_id, raw_input, nurse_name, shift, input_type })
})
```

Implement exclusively against `system.md`. No ad-hoc styling. No hardcoded hex values. Every color, spacing, and typography decision references a semantic token.

---

### Agent 7: integration
**Produce:** `integration-verification.md`

Wire frontend to backend. Verify each of these flows produces correct end-to-end behavior:

**Flow 1 — Note submission:**
Frontend dictation submit → POST to n8n → Claude structures note → Supabase updated → Frontend re-fetches and renders structured note

**Flow 2 — Supply list:**
Procedure detected in note → n8n auto-generates supply list → Supabase updated → Frontend renders supply checklist without additional user action

**Flow 3 — Handoff report:**
User clicks "Generate Handoff Report" → POST to n8n with patient_id + request type → Claude synthesizes → Supabase updated → Frontend renders full report with flags

**Flow 4 — Flag display:**
Flagged note → amber/red badge appears on patient card and patient detail view → human review prompt visible → approve/escalate/override buttons functional

Test each flow against each patient scenario. Document results in `integration-verification.md`.

Quality gate: all four flows working for all three patients before handoff to testing agent.

---

### Agent 8: testing
**Produce:** `test-report.md`

Run the full test matrix from CLAUDE.md. For every test:
- State what you are testing
- State the expected output
- State the actual output
- Pass or fail
- If fail: capture the exact error and hand off to debugging agent

Do not attempt to fix failures yourself. Surface them cleanly to the debugging agent.

Format `test-report.md` with a summary table at the top:

| Scenario | Test | Expected | Actual | Status |
|---|---|---|---|---|
| Margaret | Note structured | SOAP note, no flag | ... | ✅/❌ |
| Margaret | Supply list | Dressing change items | ... | ✅/❌ |
| Devon | Note structured | SOAP note, flagged | ... | ✅/❌ |
| Devon | Flag displayed | Amber badge, reason | ... | ✅/❌ |
| Devon | Supply list | Chest drain items | ... | ✅/❌ |
| Aisha | Input 1 stable | No flag | ... | ✅/❌ |
| Aisha | Input 2 flagged | Critical flag, vitals | ... | ✅/❌ |
| Aisha | Handoff report | Includes vitals flag | ... | ✅/❌ |

All 8 tests must pass before design-review begins.

---

### Agent 9: debugging
**Read:** `test-report.md`
**Produce:** `debug-log.md`

For every failure in the test report:

1. **Identify** — exact failure location (file, line, node, component)
2. **Isolate** — which layer: n8n | Claude prompt | Supabase | frontend | integration
3. **Fix** — targeted change only. No refactoring unrelated code.
4. **Verify** — re-run the specific failed test. Confirm pass.
5. **Log** — document in `debug-log.md`:

```markdown
## Bug [N]: [Short title]
**Layer:** [n8n / Claude / Supabase / Frontend / Integration]
**Scenario:** [Which patient, which flow]
**Symptom:** [What the testing agent observed]
**Root cause:** [What was actually wrong]
**Fix applied:** [Exact change made]
**Verification:** [Re-run result — pass/fail]
```

After all bugs are resolved, notify testing agent to re-run the full matrix. Repeat until all 8 tests pass.

---

### Agent 10: design-review
**Read:** `.claude/skills/design-review/SKILL.md`
**Read:** `ux-brief.md`
**Read:** `.interface-design/system.md`
**Produce:** `reviews/review-final.md`

Run all four review categories:

**Brief alignment:** Does the built system solve what the ux-brief says it should? Does the nurse archetype's journey map play out correctly in the UI?

**Design system consistency:** Are all components using semantic tokens from system.md? Any hardcoded values? Any components built outside the system?

**Accessibility:** WCAG 2.1 AA. Check: color contrast ratios, keyboard navigation, semantic HTML, ARIA labels, focus management, skip links.

**Responsive behavior:** Desktop only. Test at 1280px, 1440px, 1920px widths. No layout breakage permitted.

Classify every issue by severity (🔴 Critical / 🟡 Warning / 🔵 Note). State handoff status explicitly.

---

## Environment Setup

Before any agent begins, verify these are in place:

**`.env.local` in project root:**
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_anthropic_key
```

**n8n environment variables:**
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_anthropic_key
```

**Supabase tables confirmed:** patients, notes, supply_requests, handoff_reports
**Patients seeded:** Margaret Thompson, Devon Clarke, Aisha Mensah

---

## Demo Readiness Checklist

Before declaring the build complete:

- [ ] All 8 tests passing in test-report.md
- [ ] All bugs resolved in debug-log.md
- [ ] Design review complete with no critical issues
- [ ] `npm run dev` starts without errors
- [ ] n8n workflow running and accessible
- [ ] All three scenarios run end-to-end in under 3 minutes total
- [ ] Typewriter animations play cleanly
- [ ] No console errors in browser during demo flow
- [ ] `.env.local` populated with real credentials
- [ ] Cold start verified: fresh browser, fresh n8n session, demo works

---

## A Note on Judgment

You are building this to demonstrate systems thinking to a Wealthsimple executive panel. Every decision you make — architectural, design, copy — should reflect the same judgment the JD is asking for: where does AI own the work, where does the human stay in control, and why.

If you encounter an ambiguous decision not covered by this document, make a reasonable assumption, state it explicitly in a comment or in the relevant output file, and move forward. That is exactly what a good builder does.

Now read `CLAUDE.md` and begin.
