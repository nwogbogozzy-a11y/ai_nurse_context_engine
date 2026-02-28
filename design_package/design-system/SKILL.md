# Skill: design-system

## What This Skill Does
Establishes the project's design system before any component is built. Defines design tokens, typography, color, spacing, and component standards — then saves everything to `.interface-design/system.md`. Every builder agent reads from this file. Nothing gets styled by gut.

## When to Trigger This Skill
- After `ux-research` and `design-principles` have both run
- At the start of any new project before implementation begins
- When a design system doesn't exist yet for the project
- When the system needs a significant update (new brand, new component category)

Do NOT trigger this skill mid-build to make one-off decisions. Extend the system intentionally, not reactively.

---

## Prerequisites
Before running, verify these exist:
- [ ] `ux-brief.md` — produced by ux-research skill
- [ ] Design principles output — produced by design-principles skill
- [ ] Any existing brand assets (logo, brand colors, fonts) provided by client

---

## Protocol

### Phase 1 — Gather Inputs
Read the following before making any decisions:
1. `ux-brief.md` — extract: project type, brand constraints, audience, tone
2. Design principles output — extract: relevant visual and typographic principles
3. Brand assets if provided — extract: existing colors, typefaces, logo clearance rules

### Phase 2 — Establish Tokens
Work through each token category in order. Use `references/spacing-scale.md` and `references/typography-system.md` as defaults — override only with explicit rationale.

**Token decision order:**
1. Color palette
2. Typography scale
3. Spacing scale
4. Border radius
5. Shadows / elevation
6. Motion / animation timing
7. Breakpoints

For each token, document:
- The value
- The rationale (why this, not just what)
- The Tailwind mapping (custom value or closest utility)

### Phase 3 — Define Component Standards
For each component type relevant to the project, define:
- Visual spec (size, color, spacing)
- States (default, hover, focus, active, disabled, loading, error)
- Tailwind class pattern (the canonical implementation)
- Accessibility requirements (focus ring, ARIA role, keyboard behavior)

Start with the components that appear most in this project type:

| Project Type | Priority Components |
|---|---|
| Marketing / Landing | Hero, CTA button, Nav, Card, Testimonial, Footer |
| Portfolio | Nav, Case study card, Project hero, Contact form, Tag/Badge |
| Web App / Dashboard | Button, Form inputs, Table, Modal, Toast/Alert, Sidebar nav, Data card |

### Phase 4 — Save to system.md
Populate `.interface-design/system.md` using the template in `assets/system-template.md`. This file is the single source of truth — all builder agents read it, none override it without explicit instruction.

### Phase 5 — Tailwind Config
If the project uses custom tokens that don't map to Tailwind defaults, output a `tailwind.config.js` extension block with all custom values. This goes at the end of `system.md` under `## Tailwind Config`.

---

## Token Defaults

These are starting points — override based on project needs and design principles retrieved from NotebookLM.

### Color System Structure
Always define colors as semantic roles, not raw values:

```
background        — page/app background
surface           — cards, panels, raised elements
border            — dividers, input borders
text-primary      — body copy, headings
text-secondary    — supporting copy, metadata
text-muted        — placeholders, disabled text
accent            — primary brand color, CTAs
accent-hover      — darker/lighter variant for hover
accent-foreground — text on accent backgrounds
destructive       — errors, delete actions
success           — confirmations, completions
warning           — caution states
```

Never hardcode hex values in components — always reference semantic tokens.

### Typography Scale (Tailwind-mapped)
Default type scale for reference — adjust based on project:

| Role | Size | Weight | Line Height | Tailwind |
|---|---|---|---|---|
| Display | 48–72px | 700 | 1.1 | `text-5xl`–`text-7xl font-bold` |
| H1 | 36–48px | 700 | 1.15 | `text-4xl font-bold` |
| H2 | 28–36px | 600 | 1.2 | `text-3xl font-semibold` |
| H3 | 22–28px | 600 | 1.25 | `text-2xl font-semibold` |
| H4 | 18–22px | 500 | 1.3 | `text-xl font-medium` |
| Body | 16px | 400 | 1.6 | `text-base` |
| Small | 14px | 400 | 1.5 | `text-sm` |
| Caption | 12px | 400 | 1.4 | `text-xs` |

### Spacing Scale
Use an 8px base grid. Map to Tailwind's default scale where possible:

| Token | Value | Tailwind |
|---|---|---|
| space-1 | 4px | `p-1` / `m-1` |
| space-2 | 8px | `p-2` / `m-2` |
| space-3 | 12px | `p-3` / `m-3` |
| space-4 | 16px | `p-4` / `m-4` |
| space-6 | 24px | `p-6` / `m-6` |
| space-8 | 32px | `p-8` / `m-8` |
| space-12 | 48px | `p-12` / `m-12` |
| space-16 | 64px | `p-16` / `m-16` |
| space-24 | 96px | `p-24` / `m-24` |

---

## Component Spec Format

Every component in `system.md` must follow this format:

```markdown
### [Component Name]

**Purpose:** [One sentence — what it does and when to use it]

**Variants:**
- `primary` — [description]
- `secondary` — [description]
- `ghost` — [description]

**States:** default | hover | focus | active | disabled | loading _(if applicable)_

**Tailwind Pattern:**
```
<!-- Primary button -->
<button class="[canonical class string]">
  Label
</button>
```

**Accessibility:**
- Role: `button` (native) / `[aria-role]` if custom
- Focus: visible ring using `focus-visible:ring-2 focus-visible:ring-accent`
- Keyboard: Enter and Space activate; Tab navigates
- Disabled: `aria-disabled="true"`, not just `disabled` attribute if interactive

**Do / Don't:**
- Do: [concrete guidance]
- Don't: [concrete anti-pattern]
```

---

## Quality Gate
Before handing off to the builder, verify `system.md` contains:
- [ ] All semantic color tokens defined with values and rationale
- [ ] Typography scale with Tailwind mappings
- [ ] Spacing scale documented
- [ ] All priority components for this project type have specs
- [ ] Tailwind config block present if custom tokens used
- [ ] No raw hex values in component specs — semantic tokens only
