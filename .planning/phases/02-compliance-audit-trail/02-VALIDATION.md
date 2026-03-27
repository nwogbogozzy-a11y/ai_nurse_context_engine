---
phase: 2
slug: compliance-audit-trail
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-27
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual verification + Supabase query checks |
| **Config file** | none — no test framework in project |
| **Quick run command** | `cd src && npm run build` |
| **Full suite command** | `cd src && npm run build && npm run lint` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd src && npm run build`
- **After every plan wave:** Run `cd src && npm run build && npm run lint`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | COMP-01 | integration | `cd src && npm run build` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | COMP-02 | integration | `cd src && npm run build` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 2 | COMP-03 | integration | `cd src && npm run build` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 2 | COMP-04 | integration | `cd src && npm run build` | ❌ W0 | ⬜ pending |
| 02-03-01 | 03 | 2 | UI-05 | manual | visual inspection | ❌ W0 | ⬜ pending |
| 02-03-02 | 03 | 2 | UI-09 | manual | visual inspection | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Supabase migration for `audit_log` table — required before any audit writes
- [ ] Postgres trigger for `notes.review_status` changes — required for COMP-03

*Existing infrastructure covers build and lint. No test framework install needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Activity timeline renders chronologically | UI-05 | Visual UI component | Navigate to patient detail, click Activity tab, verify entries ordered newest-first |
| Flag badge reflects review state without refresh | UI-09 | Real-time visual state | Change review status via NurseActionBar, verify badge updates without page reload |
| Handoff generation creates audit entry | COMP-01 | End-to-end flow | Generate handoff report, query audit_log table for matching entry |
| Supply confirmation creates audit entry | COMP-01 | End-to-end flow | Confirm supplies, query audit_log table for matching entry |

*All phase behaviors also verifiable via Supabase query after action.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
