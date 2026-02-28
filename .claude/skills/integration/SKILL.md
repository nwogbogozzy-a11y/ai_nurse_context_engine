# Skill: integration

## What This Skill Does
Wires the Next.js frontend to the n8n backend. Verifies all four data flows work end-to-end.

## Four Flows to Verify
1. Note submission: frontend → n8n → Claude → Supabase → frontend re-renders
2. Supply list: auto-triggered on procedure detection → renders without extra user action
3. Handoff report: on-demand → renders with flags
4. Flag display: flagged note → badge + human review prompt visible

## Quality Gate
- [ ] All four flows working for all three patients
- [ ] No hardcoded patient data in frontend — everything from Supabase
- [ ] Loading states display correctly during n8n processing
- [ ] Error states handled gracefully (n8n timeout, Supabase error)
