# Skill: backend

## What This Skill Does
Builds and verifies the n8n automation pipeline and Supabase integration. Produces a working backend the integration agent wires to the frontend.

## Protocol

### Phase 1 — Verify Prerequisites
- [ ] Supabase tables exist: patients, notes, supply_requests, handoff_reports
- [ ] Three patients seeded: Margaret Thompson, Devon Clarke, Aisha Mensah
- [ ] n8n running, Anthropic API key available

### Phase 2 — Build Pipeline Node by Node
Build in order. Test each node individually before connecting the next.

Node order:
N1 Webhook → N2 Parse Input → N3 Fetch Patient → N4 Claude Note → N5 Parse Response → N6 Save Note → N7 Router → N8a Claude Supply / N8b Claude Handoff → N9a Save Supply / N9b Save Handoff → N10 Webhook Response

### Phase 3 — Test All Three Scenarios
Margaret (clean), Devon (flagged), Aisha (dynamic). Verify Supabase records after each.

### Phase 4 — Export and Document
Export workflow JSON to n8n-workflow.json. Document all configurations in backend-verification.md.

## Quality Gate
- [ ] All 11 nodes configured and tested individually
- [ ] All three scenarios produce correct Supabase records
- [ ] Webhook URL documented for integration agent
- [ ] n8n-workflow.json saved to project root
