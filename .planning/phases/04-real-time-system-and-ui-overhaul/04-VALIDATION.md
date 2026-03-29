---
phase: 4
slug: real-time-system-and-ui-overhaul
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-29
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None installed — no test infrastructure exists |
| **Config file** | none — see Wave 0 |
| **Quick run command** | `cd src && npm run build` |
| **Full suite command** | `cd src && npm run build && npm run lint` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd src && npm run build`
- **After every plan wave:** Run `cd src && npm run build && npm run lint`
- **Before `/gsd:verify-work`:** Full suite must be green + manual walkthrough of all 3 demo scenarios
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | RT-01 | manual | Open two tabs, submit note, observe propagation | N/A | ⬜ pending |
| 04-01-02 | 01 | 1 | RT-02 | manual | Generate handoff in one tab, observe in other | N/A | ⬜ pending |
| 04-01-03 | 01 | 1 | RT-03 | manual | Submit dictation with procedure, observe supply tab | N/A | ⬜ pending |
| 04-01-04 | 01 | 1 | RT-04 | manual | Flag note from detail, observe dashboard badge | N/A | ⬜ pending |
| 04-02-01 | 02 | 2 | UI-01 | build | `cd src && npm run build` | ❌ W0 | ⬜ pending |
| 04-02-02 | 02 | 2 | UI-02 | manual | Visual inspection at 1280/1440/1920px | N/A | ⬜ pending |
| 04-02-03 | 02 | 2 | UI-03 | manual | Visual inspection of three-panel layout | N/A | ⬜ pending |
| 04-02-04 | 02 | 2 | UI-06 | manual | Submit dictation, observe skeleton loader | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/components/ui/` directory — shadcn/ui primitives installed via `npx shadcn@latest init`
- [ ] `src/lib/utils.ts` — `cn()` utility (clsx + tailwind-merge) installed by shadcn init
- [ ] Supabase Realtime publication — SQL migration to add tables to `supabase_realtime` publication

*No test framework to install — all validation is build-based (`npm run build`) or manual (multi-tab visual testing).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Note INSERT propagates to other tabs | RT-01 | Requires two browser tabs with WebSocket connections | 1. Open patient detail in Tab A and Tab B. 2. Submit note in Tab A. 3. Verify note appears in Tab B within 2s without refresh. |
| Handoff report propagates live | RT-02 | Requires multi-tab WebSocket observation | 1. Open patient detail in Tab A and Tab B. 2. Generate handoff in Tab A. 3. Verify report appears in Tab B handoff tab. |
| Supply request propagates live | RT-03 | Requires multi-tab WebSocket observation | 1. Open patient detail in Tab A and Tab B. 2. Submit dictation with procedure mention in Tab A. 3. Verify supply list appears in Tab B supplies tab. |
| Dashboard flag badges update live | RT-04 | Requires dashboard + detail view in separate tabs | 1. Open dashboard in Tab A, patient detail in Tab B. 2. Submit flagged note in Tab B. 3. Verify flag badge appears on dashboard card in Tab A. |
| All components use shadcn/ui | UI-01 | Visual consistency check | Inspect `src/components/` — all interactive elements import from `@/components/ui/`. No custom button/dialog/tab implementations. |
| Dashboard visual hierarchy | UI-02 | Subjective visual quality | Check at 1280px, 1440px, 1920px — cards evenly spaced, flag badges prominent, typography hierarchy clear. |
| Patient detail typography/spacing | UI-03 | Subjective visual quality | Three-panel layout has consistent spacing, no text overlap, semantic heading hierarchy. |
| Skeleton loaders during AI processing | UI-06 | Animation timing check | Submit dictation, verify skeleton appears during processing (not static "Processing..." text). |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
