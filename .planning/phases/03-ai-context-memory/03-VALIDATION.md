---
phase: 3
slug: ai-context-memory
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-28
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual E2E via n8n webhook + Supabase queries (no jest/vitest test suite for this phase) |
| **Config file** | none |
| **Quick run command** | `curl -s -X POST http://localhost:5678/webhook/nurse-context -H 'Content-Type: application/json' -d '{"patient_id":"...","raw_input":"test","nurse_name":"Sarah Chen","shift":"day","input_type":"dictation"}' \| jq .` |
| **Full suite command** | Run all 3 demo scenarios via curl + verify Supabase records |
| **Estimated runtime** | ~30 seconds per scenario |

---

## Sampling Rate

- **After every task commit:** Run quick webhook test against one patient
- **After every plan wave:** Run all 3 demo scenarios end-to-end
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | AICTX-01 | integration | `curl webhook + check structured_note references prior context` | N/A | ⬜ pending |
| 03-01-02 | 01 | 1 | AICTX-02 | integration | `SELECT * FROM patient_summaries WHERE patient_id = ...` | N/A | ⬜ pending |
| 03-01-03 | 01 | 1 | AICTX-03 | integration | `curl supply webhook + check rationale field in response` | N/A | ⬜ pending |
| 03-02-01 | 02 | 2 | UI-04 | visual | Manual inspection of SOAP note typography | N/A | ⬜ pending |
| 03-02-02 | 02 | 2 | UI-10 | visual | Manual inspection of handoff report card layout | N/A | ⬜ pending |
| 03-02-03 | 02 | 2 | AICTX-04 | visual | Manual inspection of rationale display + Context tab | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements. No new test framework needed — validation is via webhook calls and Supabase queries.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| SOAP note visual polish (section headers, spacing, temporal markers) | UI-04 | CSS/typography changes require visual inspection | Open patient detail, submit note, verify S/O/A/P section headers are bold with letter-spacing, sections have adequate whitespace, timestamps are muted gray |
| Handoff report card layout (summary, flags, stable, actions) | UI-10 | Layout/card structure requires visual inspection | Generate handoff report for Devon Clarke, verify 4 dashboard cards visible simultaneously, summary card has larger text at top |
| AI context memory visible in SOAP output | AICTX-01 | Requires comparing AI output quality with/without prior context | Submit note for Devon Clarke, verify Assessment section references prior chest drain observations |
| Patient context summary readability | AICTX-02 | Summary quality is subjective — must read like a colleague's briefing | Check Context tab for Devon Clarke, verify summary is prioritized and clinical, not a database dump |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
