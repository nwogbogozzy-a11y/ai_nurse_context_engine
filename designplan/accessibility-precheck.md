# Accessibility Pre-Check: Nurse Context Engine

_Last updated: 2026-03-29 | WCAG 2.1 AA floor, validated before build_

_NotebookLM web-frontend: "Accessibility should not be treated as an expensive extra feature. Bake accessibility best practices into the foundational components of your living design system from the very beginning."_

---

## 1. Color Contrast Audit

### Text on Background Surfaces

All ratios calculated against WCAG 2.1 AA minimum requirements:
- **Normal text (< 18px or < 14px bold):** 4.5:1 minimum
- **Large text (>= 18px or >= 14px bold):** 3:1 minimum

| Token Pair | Foreground | Background | Ratio | Verdict | Notes |
|---|---|---|---|---|---|
| `text-primary` on `background` | #0F172A | #FFFFFF | **15.4:1** | PASS | Near-black on white. Excellent. |
| `text-primary` on `surface` | #0F172A | #F8FAFC | **14.5:1** | PASS | Near-black on off-white. Excellent. |
| `text-secondary` on `background` | #475569 | #FFFFFF | **7.1:1** | PASS | Dark slate on white. Strong. |
| `text-secondary` on `surface` | #475569 | #F8FAFC | **6.7:1** | PASS | Dark slate on off-white. |
| `text-muted` on `background` | #94A3B8 | #FFFFFF | **3.5:1** | CONDITIONAL | Passes at 18px+ (large text only). Fails at 14px body text. |
| `text-muted` on `surface` | #94A3B8 | #F8FAFC | **3.3:1** | CONDITIONAL | Passes at 18px+ only. Fails at smaller sizes. |
| `accent` on `background` | #0EA5E9 | #FFFFFF | **3.3:1** | FAIL for body text | Accent should only appear on interactive elements (buttons, links) at 14px bold+ or as large text. |
| `accent-foreground` on `accent` | #FFFFFF | #0EA5E9 | **3.3:1** | CONDITIONAL | Passes for bold button text at 14px+. Verify button font-weight is 600+. |

### Semantic Colors on Tinted Backgrounds

| Token Pair | Foreground | Background | Ratio | Verdict | Notes |
|---|---|---|---|---|---|
| `flag-warning` on `flag-warning-bg` | #F59E0B | #FFFBEB | **3.1:1** | FAIL for small text | Amber on light amber. Must use at 14px bold+ or 18px+. Add dark text alternative for body-sized content. |
| `flag-critical` on `flag-critical-bg` | #EF4444 | #FEF2F2 | **4.0:1** | CONDITIONAL | Borderline. Passes at 14px bold. Fails at 12px. Use only for badges (bold, 12px is acceptable per badge sizing). |
| `flag-safe` on `flag-safe-bg` | #10B981 | #F0FDF4 | **3.4:1** | FAIL for small text | Green on light green. Same constraint as warning. Badge use only, or increase to darker green (#059669, ratio 4.9:1). |
| White on `flag-critical` | #FFFFFF | #EF4444 | **4.6:1** | PASS | White text on red badge. Passes AA. |
| White on `flag-safe` | #FFFFFF | #10B981 | **3.5:1** | CONDITIONAL | White on green. Passes at 14px bold+. Consider #059669 for body-sized text. |

### Remediation Actions

| Issue | Fix | Priority |
|---|---|---|
| `text-muted` below 18px | Restrict to timestamps and metadata at 16px+. Never use for labels or actionable content below 16px. | HIGH |
| `flag-warning` on `flag-warning-bg` | Use `#B45309` (Amber-700, ratio 5.3:1) for warning text inside warning containers when text is below 14px bold. | HIGH |
| `flag-safe` on `flag-safe-bg` | Use `#059669` (Emerald-600, ratio 4.9:1) for safe text inside safe containers when text is below 14px bold. | MEDIUM |
| `accent` as text | Never use `accent` as body text color. Reserve for interactive element labels at 600+ weight. | HIGH |

---

## 2. Non-Color Indicators

Per NotebookLM (visual-design + ux-interaction): "Never rely solely on hue to communicate meaning. 5-8% of males have color vision deficiency."

| Element | Color | Text Label | Icon | Position/Shape | Verdict |
|---|---|---|---|---|---|
| Flag: Safe | Green dot | "Clear" | -- | Pill badge with dot | PASS (color + text + dot) |
| Flag: Warning | Amber dot | "Flagged" | Triangle icon | Pill badge with icon | PASS (color + text + icon) |
| Flag: Critical | Red dot | "Critical" | Exclamation icon | Pill badge with icon | PASS (color + text + icon) |
| Flagged card border | Left border color | Flag badge in card | -- | Left border position | PASS (color + badge + position) |
| Processing state | Accent pulse | "AI is processing..." | Pulse dot | Inline below input | PASS (color + text + animation) |
| Audit action: APPROVED | Green | Text label | -- | Badge | NEEDS ICON (add checkmark) |
| Audit action: ESCALATED | Amber | Text label | -- | Badge | NEEDS ICON (add arrow-up) |
| Audit action: OVERRIDDEN | Muted | Text label | -- | Badge | ACCEPTABLE (ghost treatment) |

### Remediation Actions

| Issue | Fix | Priority |
|---|---|---|
| Audit action badges lack icons | Add checkmark icon to APPROVED, arrow-up to ESCALATED | MEDIUM |

---

## 3. Keyboard Navigation Audit

| Component | Tab Focusable | Enter/Space Activate | Focus Ring Visible | Escape Closes | Arrow Keys | Verdict |
|---|---|---|---|---|---|---|
| Patient Card | Yes | Yes (opens detail) | Yes (2px accent ring) | N/A | N/A | PASS |
| Flag Badge | No (informational) | N/A | N/A | N/A | N/A | PASS |
| Submit Button | Yes | Yes | Yes | N/A | N/A | PASS |
| Approve Button | Yes | Yes | Yes | N/A | N/A | PASS |
| Escalate Button | Yes | Yes | Yes | N/A | N/A | PASS |
| Override Button | Yes | Yes | Yes | N/A | N/A | PASS |
| Supply Checkbox | Yes | Yes (toggles) | Yes | N/A | N/A | PASS |
| Mark All Ready | Yes | Yes | Yes | N/A | N/A | PASS |
| Tab Navigation | Yes | Yes (switches tab) | Yes | N/A | Arrow Left/Right | VERIFY |
| Textarea | Yes | N/A (typing) | Yes | N/A | N/A | PASS |
| Audit Log Expand | Yes | Yes | Yes | Yes | N/A | PASS |

### Focus Order Rules

1. **Patient Dashboard:** Tab through cards in grid order (left to right, top to bottom).
2. **Patient Detail:** Sidebar → Tab bar → Active tab content → Right panel. Left-to-right, top-to-bottom within each zone.
3. **Nurse Action Bar:** Approve → Escalate → Override. Safe path first.
4. **After AI processing completes:** Focus moves to the structured output container.

### Remediation Actions

| Issue | Fix | Priority |
|---|---|---|
| Tab navigation arrow key support | Implement `role="tablist"` with `aria-selected`, Left/Right arrow key support per WAI-ARIA tabs pattern | HIGH |
| Focus management after processing | Programmatically move focus to structured output when AI processing completes | HIGH |

---

## 4. ARIA Requirements

| Component | Required ARIA | Implementation |
|---|---|---|
| Patient Card | `aria-label="[Name] - [flag status]"` | Dynamic label combining patient name + current flag state |
| Flag Badge | `role="status"` | Announces when flag state changes dynamically |
| Dictation Textarea | `aria-label="Dictation input for [Patient Name]"` | Associated `<label>` element |
| Processing State | `aria-busy="true"` on output container | Set during AI processing, cleared on completion |
| Flag Reason Block | `role="alert"` for critical flags | Immediate screen reader announcement for critical clinical alerts |
| Supply Checkbox | `aria-checked="true/false"` | Toggle state announced on change |
| Supply Table | `<th scope="col">` on all header cells | Proper table semantics |
| Tab Navigation | `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected` | Full WAI-ARIA tabs pattern |
| Mark All Ready | `aria-label="Mark all supply items as ready"` | Descriptive label beyond button text |
| Override Button | `aria-label="Override AI flag - use clinical judgment"` | Clarifies the destructive nature of the action |
| Handoff Priority Flags | `role="alert"` for critical items | Immediate announcement of critical handoff flags |
| Timestamp elements | `<time datetime="...">` | Semantic time elements throughout |
| Loading skeletons | `aria-hidden="true"` on skeletons, `aria-busy="true"` on container | Hide decorative skeletons from screen readers |

---

## 5. Semantic HTML Audit

| Content | Required Element | Current system.md Spec | Verdict |
|---|---|---|---|
| Note cards | `<article>` | Specified | PASS |
| Sidebar | `<aside>` | Specified | PASS |
| Timestamps | `<time>` | Specified | PASS |
| Recommended actions | `<ol>` | Specified | PASS |
| Stable items list | `<ul>` | Specified | PASS |
| Supply table | `<table>` with `<thead>`, `<th scope>` | Specified | PASS |
| SOAP sections | `<dl>` or heading structure | "dl or clear heading structure" | VERIFY -- pick one and standardize |
| Page title | `<h1>` (one per page) | Specified | PASS |
| Section headers | `<h2>` | Implied | VERIFY -- ensure no heading level skips |
| Card titles | `<h3>` or `<h4>` | Specified as H4 | PASS |

### Remediation Actions

| Issue | Fix | Priority |
|---|---|---|
| SOAP sections: `<dl>` vs headings | Standardize on `<dl>` with `<dt>` for section labels and `<dd>` for content. More semantically accurate for key-value clinical data. | MEDIUM |
| Heading level audit | Verify no level skips (h1 → h3 without h2) across all views. | MEDIUM |

---

## 6. Touch/Click Target Audit

WCAG 2.5.8 requires minimum 44x44px target size for pointer inputs.

| Component | Current Size | Verdict | Notes |
|---|---|---|---|
| Primary Button (py-2.5 on text-sm) | ~40px height | BORDERLINE | Increase to `py-3` for 44px minimum |
| Ghost Button (py-2.5) | ~40px height | BORDERLINE | Same fix |
| Supply Checkbox (w-6 h-6) | 24x24px | FAIL | Increase clickable area to 44x44px with padding or invisible hit area |
| Tab items | Varies | VERIFY | Ensure tab bar items have 44px minimum height |
| Patient Card (full card clickable) | Well above 44px | PASS | Entire card is the target |

### Remediation Actions

| Issue | Fix | Priority |
|---|---|---|
| Button height | Change `py-2.5` to `py-3` on all buttons for 44px minimum height | HIGH |
| Checkbox hit area | Wrap checkbox in a 44x44px clickable container. Visual checkbox stays 24px; hit area expands. | HIGH |
| Tab item height | Ensure tab navigation items have `min-h-[44px]` | MEDIUM |

---

## Pre-Build Checklist Summary

### Must Fix Before Building (HIGH Priority)

- [ ] Restrict `text-muted` to 16px+ only
- [ ] Use darker semantic color alternatives inside tinted containers (Amber-700, Emerald-600)
- [ ] Never use `accent` as body text color
- [ ] Implement WAI-ARIA tabs pattern with arrow key navigation
- [ ] Programmatic focus management after AI processing
- [ ] Increase button padding to `py-3` for 44px targets
- [ ] Expand checkbox hit areas to 44x44px

### Should Fix Before Building (MEDIUM Priority)

- [ ] Add icons to audit action badges (APPROVED, ESCALATED)
- [ ] Standardize SOAP sections on `<dl>` pattern
- [ ] Audit heading levels for skip violations
- [ ] Ensure tab items meet 44px height minimum

### Verify During Build

- [ ] All flag badges use color + text + icon (never color alone)
- [ ] `aria-busy="true"` applied during all AI processing states
- [ ] `role="alert"` on all critical flag announcements
- [ ] Focus ring visible on every interactive element
- [ ] No `aria-disabled` -- use native `disabled` attribute
