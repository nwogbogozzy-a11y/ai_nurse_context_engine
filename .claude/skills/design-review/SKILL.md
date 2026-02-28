# Skill: design-review

## What This Skill Does
Reviews completed design work against four criteria: brief alignment, design system consistency, accessibility, and responsive behavior. Produces a structured review report. Nothing is blocked — but all issues must be acknowledged before handoff.

## When to Trigger
- After a section or page is complete
- Before final handoff
- When builder is unsure if a decision is consistent with the system

## Prerequisites
- [ ] `ux-brief.md`
- [ ] `.interface-design/system.md`
- [ ] Completed implementation

---

## Review Protocol

### Step 1 — Scope the Review
> "Reviewing: [component / page] — [description]"

### Step 2 — Run All Four Categories
Do not skip categories.

### Step 3 — Classify Each Issue

| Severity | Meaning | Action |
|---|---|---|
| 🔴 Critical | Breaks functionality or fails accessibility hard requirements | Must fix |
| 🟡 Warning | Inconsistency or deviation from system | Should fix before handoff |
| 🔵 Note | Minor improvement or future consideration | Optional |

### Step 4 — Produce Report
Save as `reviews/review-[name].md`.

---

## Output Format

```markdown
# Design Review: [Name]
_Reviewed: [date]_

## Summary
| Category | Status | Issues |
|---|---|---|
| Brief Alignment | ✅/⚠️/❌ | [count] |
| Design System | ✅/⚠️/❌ | [count] |
| Accessibility | ✅/⚠️/❌ | [count] |
| Responsive | ✅/⚠️/❌ | [count] |

**Overall:** ✅ Ready / ⚠️ Ready with issues / ❌ Needs rework

## Issues

🔴 **Critical — [Title]**
- Where: [location]
- Issue: [what's wrong]
- Fix: [specific action]

🟡 **Warning — [Title]**
- Where / Issue / Fix

🔵 **Note — [Title]**
- Where / Suggestion

## Handoff Status
[Explicit statement of readiness]
```

---

## Soft Gate Rules
- 🔴 Critical issues must be acknowledged by builder before work continues
- 🟡 Warnings should be resolved before final handoff
- 🔵 Notes are optional

---

## Common Issues to Check (Web App / Dashboard)
- Empty states missing or generic
- Error states have no recovery path
- Loading states absent on async actions
- Modal/drawer doesn't trap focus
- No keyboard nav for interactive elements
- Color contrast below 4.5:1 for body text
- Flag colors not distinguishable without color alone (need icon or label too)
