---
phase: 1
slug: functional-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-26
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual verification (no test framework in Phase 1 — decision D-20 in CONTEXT.md) |
| **Config file** | none |
| **Quick run command** | `npm run build` (type-check + build verification) |
| **Full suite command** | `npm run build && npm run lint` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build && npm run lint`
- **Before `/gsd:verify-work`:** Full suite must be green + manual scenario walkthrough
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01 | 01 | 1 | FOUND-01 | build | `npm run build` | N/A | ⬜ pending |
| 01-02 | 01 | 1 | FOUND-05 | build | `npm run build` | N/A | ⬜ pending |
| 02-01 | 02 | 1 | FOUND-02 | manual | Supabase query check | N/A | ⬜ pending |
| 02-02 | 02 | 1 | FOUND-03 | manual | Supabase query check | N/A | ⬜ pending |
| 02-03 | 02 | 1 | FOUND-04 | manual | Supabase query check | N/A | ⬜ pending |
| 03-01 | 03 | 2 | FOUND-06 | manual | Page refresh test | N/A | ⬜ pending |
| 03-02 | 03 | 2 | FOUND-07 | build | `npm run build` | N/A | ⬜ pending |
| 03-03 | 03 | 2 | FOUND-08 | build | `npm run build` | N/A | ⬜ pending |
| 04-01 | 04 | 2 | UI-07 | manual | Visual check | N/A | ⬜ pending |
| 04-02 | 04 | 2 | UI-08 | manual | Visual check | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. Phase 1 uses manual verification per decision D-20 in CONTEXT.md. No test framework installation needed.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Nurse identity persists across refresh | FOUND-01 | localStorage + React Context — no automated test framework | Select Marcus Webb → refresh page → verify dropdown shows Marcus Webb |
| Note review status persists | FOUND-02 | DB write + UI render verification | Approve a note → refresh page → verify "Approved" badge visible |
| Supply confirmation persists | FOUND-03 | DB write + UI render verification | Confirm supply items → refresh page → verify items still confirmed |
| Handoff extras persist | FOUND-04 | DB write + UI render verification | Generate handoff → refresh → verify stable_items and first_actions visible |
| Free-form dictation works | FOUND-07 | Requires n8n webhook + Claude API | Select "Free-form entry" → type text → submit → verify structured note returned |
| Error states display correctly | UI-07 | Requires simulating webhook failure | Disconnect n8n → submit dictation → verify inline error + error toast |
| Toast notifications fire | UI-08 | Visual UX verification | Approve note → verify success toast appears bottom-right, auto-dismisses in ~4s |

*All phase behaviors require manual verification due to Phase 1's no-test-framework decision.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
