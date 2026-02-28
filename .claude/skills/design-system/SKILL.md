# Skill: design-system

## What This Skill Does
Establishes the project's design system before any component is built. Defines tokens, typography, color, spacing, and component standards — saves to `.interface-design/system.md`. Every builder agent reads from this file.

## When to Trigger
- After ux-research and design-principles have both run
- Before implementation begins

## Prerequisites
- [ ] `ux-brief.md` exists
- [ ] Design principles output exists

---

## Protocol

### Phase 1 — Gather Inputs
Read: ux-brief.md, design principles output, CLAUDE.md color tokens.

### Phase 2 — Establish Tokens
Work through in order: color palette → typography scale → spacing scale → border radius → shadows → motion timing → breakpoints.

For each token document: value, rationale, Tailwind mapping.

### Phase 3 — Define Component Standards
For each component: visual spec, states, Tailwind class pattern, accessibility requirements.

Priority components for this project:
- Patient card (summary + expanded)
- Dictation input panel (idle / animating / processing / complete)
- Structured note display
- Supply checklist
- Handoff report panel
- Flag badge (safe / warning / critical)
- Nurse action bar (approve / escalate / override)

### Phase 4 — Save to system.md
Populate `.interface-design/system.md`. This is the single source of truth.

### Phase 5 — Tailwind Config
Output `tailwind.config.js` extension block for any custom tokens.

---

## Token Defaults

### Color Roles (semantic only — no raw hex in components)
```
background        — page background
surface           — cards, panels
border            — dividers, input borders
text-primary      — headings, body
text-secondary    — supporting copy
text-muted        — placeholders, disabled
accent            — primary action color
accent-hover      — hover variant
flag-warning      — amber, anomaly detected
flag-critical     — red, urgent human review
flag-safe         — green, auto-approved/clear
```

### Typography Scale
| Role | Size | Weight | Tailwind |
|---|---|---|---|
| H1 | 36px | 700 | `text-4xl font-bold` |
| H2 | 28px | 600 | `text-3xl font-semibold` |
| H3 | 22px | 600 | `text-2xl font-semibold` |
| Body | 16px | 400 | `text-base` |
| Small | 14px | 400 | `text-sm` |
| Caption | 12px | 400 | `text-xs` |

### Spacing — 8px base grid
Use Tailwind default scale. No arbitrary values.

---

## Component Spec Format

```markdown
### [Component Name]
**Purpose:** [One sentence]
**Variants:** primary | secondary | ghost
**States:** default | hover | focus | active | disabled | loading
**Tailwind Pattern:** [canonical class string]
**Accessibility:** role, focus ring, keyboard behavior
**Do / Don't:** concrete guidance
```

---

## Quality Gate
- [ ] All semantic color tokens defined with rationale
- [ ] Typography scale with Tailwind mappings
- [ ] All priority components spec'd
- [ ] Tailwind config block present if custom tokens used
- [ ] No raw hex values anywhere in component specs
