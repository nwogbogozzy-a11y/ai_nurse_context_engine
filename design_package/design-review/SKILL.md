# Skill: design-review

## What This Skill Does
Reviews completed design work against four criteria: brief alignment, design system consistency, accessibility, and responsive behavior. Produces a structured review report with issues categorized by severity. Work can continue with logged issues — nothing is blocked — but all issues must be acknowledged before handoff.

## When to Trigger This Skill
- After a section, page, or component is considered complete by the builder
- Before any work is handed off to the client or shipped
- When the builder is unsure if a decision is consistent with the system
- When a significant scope change has occurred mid-build

Do NOT skip this skill because the work looks good visually. Most issues caught here are invisible to casual inspection.

---

## Prerequisites
Before reviewing, confirm these are available:
- [ ] `ux-brief.md` — the brief this work is evaluated against
- [ ] `.interface-design/system.md` — the design system this work must conform to
- [ ] The completed work (HTML, component code, or rendered output)

---

## Review Protocol

### Step 1 — Scope the Review
State clearly what is being reviewed:
> "Reviewing: [component / page / section name] — [brief description of what it does]"

### Step 2 — Run All Four Review Categories
Work through each category in `references/review-checklist.md` systematically. Do not skip categories because they seem unlikely to have issues.

### Step 3 — Classify Each Issue
Every issue gets a severity label:

| Severity | Meaning | Action Required |
|---|---|---|
| 🔴 **Critical** | Breaks functionality, fails accessibility hard requirements, or directly contradicts the primary goal | Must fix — flag prominently |
| 🟡 **Warning** | Inconsistency, suboptimal pattern, or deviation from system that degrades quality | Should fix — log and address before final handoff |
| 🔵 **Note** | Minor improvement, stylistic suggestion, or future consideration | Optional — log for awareness |

### Step 4 — Produce the Review Report
Use the output format below. Save as `review-[component-or-page-name].md` in a `/reviews` folder at the project root.

---

## Output Format

```markdown
# Design Review: [Component / Page Name]
_Reviewed: [date] | Reviewer: Claude (design-review skill)_

## Scope
[One sentence describing what was reviewed]

## Summary
| Category | Status | Issues Found |
|---|---|---|
| Brief Alignment | ✅ Pass / ⚠️ Issues / ❌ Fail | [count] |
| Design System | ✅ Pass / ⚠️ Issues / ❌ Fail | [count] |
| Accessibility | ✅ Pass / ⚠️ Issues / ❌ Fail | [count] |
| Responsive | ✅ Pass / ⚠️ Issues / ❌ Fail | [count] |

**Overall:** ✅ Ready for handoff / ⚠️ Ready with logged issues / ❌ Needs rework

---

## Issues

### Brief Alignment
<!-- List issues or write "No issues found." -->

### Design System Consistency
<!-- List issues or write "No issues found." -->

### Accessibility
<!-- List issues or write "No issues found." -->

### Responsive Behavior
<!-- List issues or write "No issues found." -->

---

## Issue Format

🔴 **Critical — [Short title]**
- **Where:** [Component name, line, or location]
- **Issue:** [What's wrong]
- **Fix:** [Specific corrective action]

🟡 **Warning — [Short title]**
- **Where:** [Location]
- **Issue:** [What's wrong]
- **Fix:** [Specific corrective action]

🔵 **Note — [Short title]**
- **Where:** [Location]
- **Suggestion:** [What could be improved]

---

## Handoff Status
[One of the following:]

✅ **Ready for handoff.** No critical or warning issues.

⚠️ **Ready with logged issues.** [N] warning(s) and [N] note(s) logged above. Work can proceed — issues should be addressed before final delivery.

❌ **Needs rework.** [N] critical issue(s) must be resolved before this work proceeds.
```

---

## Soft Gate Rules

This is a soft gate. The following applies:

- 🔴 **Critical issues** must be explicitly acknowledged by the builder before work continues. They do not automatically block — but they cannot be silently ignored.
- 🟡 **Warnings** are logged and should be resolved before final handoff. They do not stop the build.
- 🔵 **Notes** are optional improvements. Log and move on.

If the builder disagrees with a finding, they must state why in the review file under an `## Disputes` section. Silence is not acceptance — it's a gap.

---

## Pattern Recognition

Common issues by project type to look for proactively:

**Marketing / Landing Pages**
- CTA hierarchy broken — multiple competing primary actions
- Hero doesn't establish value prop within first viewport
- Social proof placed below the fold with no above-fold trust signal
- Mobile nav missing or broken
- Form fields without visible labels (placeholder-only)

**Portfolio Sites**
- Case studies don't show process — output only
- No clear contact or engagement path
- Work thumbnails too small to evaluate quality
- No indication of role/contribution on team projects
- Tone inconsistent between sections

**Web Apps / Dashboards**
- Empty states missing or using generic placeholder text
- Error states exist but have no recovery path
- Loading states absent on async actions
- Table columns have no sort/filter affordance when data warrants it
- Modal/drawer doesn't trap focus or restore focus on close
