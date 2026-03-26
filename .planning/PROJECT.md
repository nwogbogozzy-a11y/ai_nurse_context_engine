# AI-Native Nurse Context Engine — v2 Milestone

## What This Is

A living patient context system that gives nurses instant situational awareness — eliminating the cognitive reconstruction work that consumes 30-40% of every shift. Built as a portfolio centerpiece for the FIKA Cannabis AI Builder application, where the structural analogy between nursing workflows and cannabis retail guest experiences is the core argument.

The system takes nurse dictation, structures it into SOAP notes via Claude API, auto-generates supply checklists per procedure, and produces shift handoff reports with priority flags. Three demo scenarios (stable patient, flagged anomaly, dynamic handoff) run end-to-end through a Next.js frontend, n8n automation backend, and Supabase database.

## Core Value

The CEO of FIKA watches the demo video, clicks the live link, and thinks: "This is already 80% of what we need, just in a different domain." Every improvement must make that reaction more inevitable.

## Requirements

### Validated

- ✓ Nurse dictation → structured SOAP note via Claude API — existing
- ✓ Anomaly detection with flagging and plain-English reasoning — existing
- ✓ Auto-generated supply checklists per detected procedure — existing
- ✓ Shift handoff report generation with priority flags — existing
- ✓ Typewriter dictation simulation (pre-scripted demo scenarios) — existing
- ✓ Three seeded patients with distinct clinical profiles — existing
- ✓ n8n webhook pipeline (note structuring, supply generation, handoff) — existing
- ✓ Supabase persistence (patients, notes, supply_requests, handoff_reports) — existing
- ✓ Vercel deployment with cloud n8n backend — existing
- ✓ Standalone procedure search for supply lookups — existing

### Active

- [ ] Nurse actions persist (approve/escalate/override save to DB, survive refresh)
- [ ] Multi-nurse identity (switch nurses to demonstrate real shift handoff)
- [ ] Data integrity (note_id FK on supply_requests, persist handoff extras to DB)
- [ ] Audit trail (who flagged what, when, what action was taken — compliance signal)
- [ ] Patient preference memory across visits (aggregate context from prior notes into AI prompts)
- [ ] Real-time updates (Supabase realtime subscriptions — multi-tab live sync)
- [ ] Supply/recommendation panel polish (feel like a recommendation engine, not a checklist)
- [ ] UI overhaul (professional clinical tool aesthetic — trustworthy, considered, fatigue-aware)

### Out of Scope

- Actual voice input / speech-to-text — typewriter simulation is intentional for demo reliability
- Mobile responsiveness — this is a workstation tool, desktop only
- User authentication / login system — demo has predefined nurse identities
- Production security hardening — RLS policies are demo-appropriate, not production-grade
- FIKA-specific cannabis retail UI — the nurse domain IS the demo; the analogy is verbal (video)

## Context

**Application target:** FIKA Cannabis, AI Builder role ($90-100K, Toronto). The Nurse Context Engine is the primary portfolio piece shown in a 3-5 minute video submission. The structural analogy maps nursing workflows to cannabis retail: dictation → recommendation, supply lists → product suggestions, handoff reports → guest context continuity, compliance flagging → cannabis regulations.

**What already works:** All 3 demo scenarios pass end-to-end. Frontend renders correctly. n8n cloud instance processes webhooks. Supabase has seeded data. Vercel deployment is live.

**What needs to change:** The demo works but feels like a demo. Nurse actions are cosmetic (no persistence). No multi-nurse support undermines the handoff narrative. No audit trail misses the compliance parallel. No cross-visit memory misses the "guest remembered" argument. UI needs to feel like something a hospital would actually deploy.

**Codebase state:** Next.js 16 (App Router, all client components), React 19, Tailwind v4, Supabase JS client, 2 n8n workflows (main pipeline + supply lookup). 7 React components. No test framework. See `.planning/codebase/` for full analysis.

**User research:** Problem validated by active nursing professionals. Direct quote on handoff solution: "Oh that would be fantastic." Extended SOAP format based on nurse feedback.

## Constraints

- **Stack**: Next.js 14+ (App Router), Tailwind CSS, TypeScript, Supabase, n8n, Claude API — no stack changes
- **Deployment**: Vercel (frontend) + cloud n8n — must remain live and functional after changes
- **Accessibility**: WCAG 2.1 AA — non-negotiable (clinical tool for 12-hour shifts)
- **Browser**: Chrome primary, Firefox secondary, desktop only
- **Design**: Color carries only meaning (flag=amber, critical=red, safe=green). No decorative color. Clinical, white, high-contrast.
- **AI boundary**: AI flags but never acts. Every clinical decision requires human confirmation.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Fix functional gaps before new features | Broken features undermine credibility more than missing features | — Pending |
| Audit trail as highest-priority new feature | Strongest compliance signal — maps directly to cannabis regulation narrative | — Pending |
| Patient preference memory as second priority | Makes the nurse-to-budtender bridge feel inevitable, not theoretical | — Pending |
| Real-time updates as third priority | "Living context layer" narrative becomes visible, not just verbal | — Pending |
| UI overhaul across all phases | Every functional change is also a UI improvement opportunity | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-26 after initialization*
