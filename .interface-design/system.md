# Design System: AI-Native Nurse Context Engine
_Last updated: 2026-02-27 | Project type: Web App (Clinical Dashboard)_

---

## Color Tokens

| Token | Value | Tailwind | Rationale |
|---|---|---|---|
| `background` | #FFFFFF | `bg-background` | Clean white — clinical trust, maximum contrast base |
| `surface` | #F8FAFC | `bg-surface` | Subtle off-white for cards/panels — distinguishes content from page |
| `border` | #E2E8F0 | `border-border` | Soft slate divider — visible without competing with content |
| `text-primary` | #0F172A | `text-primary` | Near-black — maximum readability, 15.4:1 contrast on white |
| `text-secondary` | #475569 | `text-secondary` | Dark slate — supporting copy, 7.1:1 contrast on white |
| `text-muted` | #94A3B8 | `text-muted` | Medium slate — timestamps, metadata, 3.5:1 (use at 16px+ only) |
| `accent` | #0EA5E9 | `bg-accent` / `text-accent` | Sky blue — clinical, trustworthy, primary actions |
| `accent-hover` | #0284C7 | `hover:bg-accent-hover` | Darker sky — clear hover affordance |
| `accent-foreground` | #FFFFFF | `text-accent-foreground` | White text on accent backgrounds |
| `flag-warning` | #F59E0B | `bg-flag-warning` / `text-flag-warning` | Amber — anomaly detected, human attention needed |
| `flag-critical` | #EF4444 | `bg-flag-critical` / `text-flag-critical` | Red — urgent, requires immediate human review |
| `flag-safe` | #10B981 | `bg-flag-safe` / `text-flag-safe` | Green — clear, auto-approved, no action needed |
| `flag-warning-bg` | #FFFBEB | `bg-flag-warning-bg` | Light amber background for warning containers |
| `flag-critical-bg` | #FEF2F2 | `bg-flag-critical-bg` | Light red background for critical containers |
| `flag-safe-bg` | #F0FDF4 | `bg-flag-safe-bg` | Light green background for safe containers |

### Color Rules
- Color is **semantic only** — never decorative
- Flag colors always paired with text label + icon — never color alone (accessibility)
- Backgrounds stay white/surface — no colored page sections
- Accent used only for interactive elements (buttons, links, focus rings)
- Muted text only at 16px+ to maintain WCAG AA (3.5:1 minimum)

---

## Typography

**Typeface:** Inter (Google Fonts)
**Rationale:** Professional, highly legible sans-serif optimized for UI. Excellent at small sizes for dense clinical data. System-font fallback ensures zero FOUT in demo.

**Font import:** `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap`

| Role | Size | Weight | Line Height | Tailwind Pattern |
|---|---|---|---|---|
| H1 (Page title) | 30px | 700 | 1.25 | `text-3xl font-bold leading-tight` |
| H2 (Section) | 24px | 600 | 1.375 | `text-2xl font-semibold leading-snug` |
| H3 (Subsection) | 20px | 600 | 1.5 | `text-xl font-semibold leading-normal` |
| H4 (Card title) | 18px | 600 | 1.5 | `text-lg font-semibold leading-normal` |
| Body | 16px | 400 | 1.625 | `text-base leading-relaxed` |
| Body SM | 14px | 400 | 1.625 | `text-sm leading-relaxed` |
| Caption | 12px | 400 | 1.5 | `text-xs leading-normal` |
| Label | 12px | 500 | 1.5 | `text-xs font-medium uppercase tracking-wide` |
| Mono (clinical data) | 14px | 400 | 1.5 | `font-mono text-sm leading-normal` |

### Typography Rules
- H1 used once per page only
- Body SM for dense table/list content
- Caption for timestamps, metadata
- Label for column headers, section labels
- Mono for clinical values (vitals, measurements, drain output)
- Never apply `tracking-wide` to body copy
- Headings always use `text-primary`, never muted

---

## Spacing

**Base grid:** 8px
**Density level:** Default — clinical dashboards need generous spacing for rapid scanning but sufficient density for data-rich views

| Role | Value | Tailwind |
|---|---|---|
| Component XS | 4px | `p-1` |
| Component SM | 8px | `p-2` |
| Component MD | 16px | `p-4` |
| Component LG | 24px | `p-6` |
| Gap XS | 8px | `gap-2` |
| Gap SM | 12px | `gap-3` |
| Gap MD | 16px | `gap-4` |
| Gap LG | 24px | `gap-6` |
| Section SM | 24px | `py-6` |
| Section MD | 32px | `py-8` |
| Section LG | 48px | `py-12` |

### Spacing Rules
- All spacing from Tailwind default scale — no arbitrary values
- Card padding: `p-5` or `p-6`
- Table row height: `py-3`
- Form field gap: `gap-4`
- Action button group gap: `gap-3`

---

## Border Radius

| Token | Value | Tailwind | Use |
|---|---|---|---|
| `radius-sm` | 4px | `rounded` | Inputs, small badges |
| `radius-md` | 8px | `rounded-lg` | Cards, buttons, panels |
| `radius-lg` | 12px | `rounded-xl` | Modal overlays, large panels |
| `radius-full` | 9999px | `rounded-full` | Status dots, avatar circles |

---

## Shadows / Elevation

| Token | Tailwind | Use |
|---|---|---|
| `shadow-sm` | `shadow-sm` | Subtle card lift on dashboard |
| `shadow-md` | `shadow-md` | Active/focused cards, dropdowns |
| `shadow-lg` | `shadow-lg` | Overlays (not used in this project) |

### Shadow Rules
- Cards use `shadow-sm` by default, `shadow-md` on hover/focus
- Minimal shadow use — the clinical aesthetic relies on borders and spacing, not elevation
- No `shadow-lg` in standard flows (desktop only, no modals planned)

---

## Motion

| Token | Duration | Easing | Use |
|---|---|---|---|
| `transition-fast` | 100ms | ease-out | Hover states, color changes |
| `transition-base` | 150ms | ease-out | Button transitions, focus rings |
| `transition-slow` | 300ms | ease-in-out | Panel reveals, tab switching |
| `typewriter` | 40ms/char | linear | Dictation simulation — character by character |
| `pulse` | 1.5s | ease-in-out | Processing state indicator |

### Motion Rules
- All interactive elements get `transition-colors duration-150`
- Typewriter animation: 40ms per character, blinking cursor (1s interval)
- Processing state: pulsing indicator, not spinner (calmer under clinical stress)
- No decorative animations — motion only for state communication

---

## Breakpoints

| Name | Value | Tailwind Prefix | Use |
|---|---|---|---|
| xl | 1280px | `xl:` | Minimum supported width |
| 2xl | 1440px | `2xl:` | Standard workstation |
| 3xl | 1920px | — | Wide workstation |

### Breakpoint Rules
- Desktop only — no mobile/tablet layouts
- Test at 1280px, 1440px, 1920px
- Layout uses CSS Grid for main structure, Flexbox within components
- Sidebar width fixed at 280-320px, main content fluid

---

## Components

### Patient Card

**Purpose:** Dashboard-level summary of one patient. Must surface flag status, identity, and recency at a glance — nurse should know who needs attention without clicking.

**Variants:**
- `default` — no flags, stable patient
- `flagged-warning` — amber left border, warning badge visible
- `flagged-critical` — red left border, critical badge visible

**States:** default | hover | focus | active (selected)

**Tailwind Pattern:**
```html
<!-- Default -->
<div class="bg-surface border border-border rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
  <div class="flex items-start justify-between">
    <div>
      <h4 class="text-lg font-semibold text-primary">Patient Name</h4>
      <p class="text-sm text-secondary mt-1">Ward 3B | Post-op | Hip Replacement</p>
    </div>
    <!-- Flag Badge slot -->
  </div>
  <p class="text-xs text-muted mt-3">Last updated: 07:45</p>
</div>

<!-- Flagged Warning -->
<div class="bg-surface border border-border border-l-4 border-l-flag-warning rounded-lg p-5 ...">

<!-- Flagged Critical -->
<div class="bg-surface border border-border border-l-4 border-l-flag-critical rounded-lg p-5 ...">
```

**Accessibility:**
- `role="article"` or semantic `<article>`
- Keyboard focusable with visible focus ring
- Flag state announced via `aria-label` (e.g., "Margaret Thompson — stable" or "Devon Clarke — warning flag")
- Click/Enter opens patient detail

**Do / Don't:**
- Do: Show flag badge, patient name, ward, status, and last update timestamp at card level
- Don't: Hide flag status behind hover or click — flags are the highest-priority visual element

---

### Flag Badge

**Purpose:** Semantic status indicator. Must be instantly recognizable by color + text + icon. Never color alone.

**Variants:**
- `safe` — green dot + "Clear" text
- `warning` — amber dot + "Flagged" text + icon (triangle)
- `critical` — red dot + "Critical" text + icon (exclamation)

**Tailwind Pattern:**
```html
<!-- Safe -->
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-flag-safe-bg text-flag-safe">
  <span class="w-1.5 h-1.5 rounded-full bg-flag-safe"></span>
  Clear
</span>

<!-- Warning -->
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-flag-warning-bg text-flag-warning">
  <svg class="w-3.5 h-3.5" ...><!-- triangle icon --></svg>
  Flagged
</span>

<!-- Critical -->
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-flag-critical-bg text-flag-critical">
  <svg class="w-3.5 h-3.5" ...><!-- exclamation icon --></svg>
  Critical
</span>
```

**Accessibility:**
- Always includes text label — color is never the sole indicator
- `role="status"` for dynamic updates
- Contrast: text on tinted background meets 4.5:1 minimum

**Do / Don't:**
- Do: Always pair color with text and icon
- Don't: Use a colored dot without a label — 5% of males have color vision deficiency

---

### Dictation Input Panel

**Purpose:** Primary input surface where nurse dictates/types observations. Simulates real-time speech-to-text via typewriter animation in demo mode.

**States:**
- `idle` — empty textarea, "Begin Dictation" button enabled
- `animating` — typewriter text appearing character by character, blinking cursor, submit disabled
- `processing` — text complete, "Processing..." indicator, submit disabled
- `complete` — structured output rendered below, input dimmed

**Tailwind Pattern:**
```html
<!-- Container -->
<div class="bg-surface border border-border rounded-lg p-5">
  <label class="text-xs font-medium uppercase tracking-wide text-secondary mb-3 block">Dictation Input</label>

  <!-- Textarea -->
  <div class="relative">
    <textarea class="w-full min-h-[120px] p-4 text-base leading-relaxed text-primary bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
      placeholder="Begin dictation or type observation..."></textarea>
    <!-- Blinking cursor (during animation) -->
    <span class="animate-pulse text-accent">|</span>
  </div>

  <!-- Action row -->
  <div class="flex items-center justify-between mt-4">
    <p class="text-xs text-muted">Patient: Margaret Thompson | Shift: Day</p>
    <button class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-accent text-accent-foreground hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150">
      Begin Dictation
    </button>
  </div>
</div>

<!-- Processing state -->
<div class="flex items-center gap-2 mt-3">
  <div class="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
  <span class="text-sm text-secondary">Processing dictation...</span>
</div>
```

**Accessibility:**
- `<textarea>` with associated `<label>`
- `aria-busy="true"` during processing state
- Button `disabled` attribute during animation and processing
- Focus management: after processing completes, focus moves to structured output

**Do / Don't:**
- Do: Disable submit during animation — nurse should watch the simulated dictation play out
- Don't: Use a modal or overlay for the input — it's always visible in the right panel

---

### Structured Note Display

**Purpose:** Renders AI-structured SOAP note from raw dictation. Must be scannable and show flag reasoning inline.

**Layout:**
```
┌─────────────────────────────────────┐
│ Structured Note          [Flag Badge]│
│ Nurse: Sarah Chen | 07:45 | Day      │
├─────────────────────────────────────┤
│ S: [Subjective]                      │
│ O: [Objective]                       │
│ A: [Assessment]                      │
│ P: [Plan]                            │
├─────────────────────────────────────┤
│ ⚠ Flag: Drain output 200ml/4hrs...  │  ← only if flagged
│ [Approve] [Escalate] [Override]      │
└─────────────────────────────────────┘
```

**Tailwind Pattern:**
```html
<div class="bg-surface border border-border rounded-lg overflow-hidden">
  <!-- Header -->
  <div class="flex items-center justify-between px-5 py-3 border-b border-border">
    <div>
      <h4 class="text-lg font-semibold text-primary">Structured Note</h4>
      <p class="text-xs text-muted mt-0.5">Nurse: Sarah Chen | 07:45 | Day Shift</p>
    </div>
    <!-- Flag Badge component -->
  </div>

  <!-- SOAP sections -->
  <div class="px-5 py-4 space-y-3">
    <div>
      <span class="text-xs font-medium uppercase tracking-wide text-secondary">Subjective</span>
      <p class="text-sm leading-relaxed text-primary mt-1">...</p>
    </div>
    <!-- O, A, P sections follow same pattern -->
  </div>

  <!-- Flag reason (conditional) -->
  <div class="mx-5 mb-4 p-3 rounded-lg bg-flag-warning-bg border border-flag-warning/20">
    <div class="flex items-start gap-2">
      <svg class="w-4 h-4 text-flag-warning mt-0.5 shrink-0">...</svg>
      <p class="text-sm text-flag-warning">Drain output 200ml/4hrs exceeds expected threshold. Human review required.</p>
    </div>
  </div>

  <!-- Action bar (conditional — only on flagged notes) -->
  <div class="px-5 py-3 border-t border-border bg-background">
    <!-- Nurse Action Bar component -->
  </div>
</div>
```

**Accessibility:**
- SOAP sections use `<dl>` or clear heading structure
- Flag reason has `role="alert"` for screen reader announcement
- Each SOAP label is semantically associated with its content

**Do / Don't:**
- Do: Show SOAP labels prominently — nurses scan by section
- Don't: Collapse SOAP sections by default — all content visible on load

---

### Supply Checklist

**Purpose:** AI-generated list of supplies needed for a detected procedure. Appears automatically when procedure is mentioned in dictation — nurse confirms rather than creates from scratch.

**Layout:**
```
┌─────────────────────────────────────────┐
│ Supply Checklist: Dressing Change        │
│ Generated: 07:46                         │
├──────────┬─────┬──────┬─────┬──────────┤
│ Item     │ Qty │ Unit │ Notes│ Confirm  │
├──────────┼─────┼──────┼─────┼──────────┤
│ Gauze    │ 4   │ pack │      │ [✓]      │
│ Saline   │ 1   │ 500ml│      │ [✓]      │
│ Tape     │ 1   │ roll │      │ [ ]      │
│ Gloves   │ 2   │ pair │ L   │ [ ]      │
├──────────┴─────┴──────┴─────┴──────────┤
│                          [Mark All Ready]│
└─────────────────────────────────────────┘
```

**Tailwind Pattern:**
```html
<div class="bg-surface border border-border rounded-lg overflow-hidden">
  <div class="px-5 py-3 border-b border-border">
    <h4 class="text-lg font-semibold text-primary">Supply Checklist</h4>
    <p class="text-xs text-muted mt-0.5">Dressing Change | Generated: 07:46</p>
  </div>

  <table class="w-full">
    <thead>
      <tr class="border-b border-border">
        <th class="px-5 py-2 text-left text-xs font-medium uppercase tracking-wide text-secondary">Item</th>
        <th class="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-secondary">Qty</th>
        <th class="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-secondary">Unit</th>
        <th class="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-secondary">Notes</th>
        <th class="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-secondary">Confirm</th>
      </tr>
    </thead>
    <tbody>
      <tr class="border-b border-border">
        <td class="px-5 py-3 text-sm text-primary">Sterile gauze pads</td>
        <td class="px-3 py-3 text-sm font-mono text-primary">4</td>
        <td class="px-3 py-3 text-sm text-secondary">pack</td>
        <td class="px-3 py-3 text-sm text-muted">—</td>
        <td class="px-3 py-3 text-center">
          <button class="w-6 h-6 rounded border border-border bg-background hover:border-accent focus-visible:ring-2 focus-visible:ring-accent">
            <!-- Checkmark when confirmed -->
          </button>
        </td>
      </tr>
    </tbody>
  </table>

  <div class="px-5 py-3 border-t border-border flex justify-end">
    <button class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-accent text-accent-foreground hover:bg-accent-hover focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 transition-colors duration-150">
      Mark All Ready
    </button>
  </div>
</div>
```

**Accessibility:**
- Semantic `<table>` with `<thead>` and `<th scope="col">`
- Checkboxes use `<input type="checkbox">` or `role="checkbox"` with `aria-checked`
- "Mark All Ready" uses `aria-label="Mark all supply items as ready"`

**Do / Don't:**
- Do: Show the checklist automatically when procedure is detected — zero nurse effort to request it
- Don't: Require the nurse to navigate to a separate tab/page to see supplies

---

### Handoff Report Panel

**Purpose:** AI-generated comprehensive briefing for incoming shift nurse. The emotional climax of the demo — must show the system is live, not a snapshot.

**Layout:**
```
┌────────────────────────────────────────┐
│ Handoff Report: Aisha Mensah           │
│ Generated: 19:02 | Incoming: Night     │
├────────────────────────────────────────┤
│ Summary                                 │
│ [Narrative paragraph]                   │
├────────────────────────────────────────┤
│ Priority Flags                          │
│ 🔴 BP 88/54 at 18:45 — critical       │
│ 🟡 HR elevated 112 — monitoring        │
├────────────────────────────────────────┤
│ Stable Items                            │
│ • Admitting diagnosis unchanged         │
│ • IV access patent                      │
├────────────────────────────────────────┤
│ Recommended First Actions               │
│ 1. Reassess vitals on arrival           │
│ 2. Review attending's response          │
└────────────────────────────────────────┘
```

**Tailwind Pattern:**
```html
<div class="bg-surface border border-border rounded-lg overflow-hidden">
  <!-- Header -->
  <div class="px-5 py-4 border-b border-border">
    <div class="flex items-center justify-between">
      <h4 class="text-lg font-semibold text-primary">Handoff Report</h4>
      <span class="text-xs text-muted">Generated: 19:02</span>
    </div>
    <p class="text-sm text-secondary mt-1">Aisha Mensah | Incoming: Night Shift</p>
  </div>

  <!-- Summary -->
  <div class="px-5 py-4 border-b border-border">
    <span class="text-xs font-medium uppercase tracking-wide text-secondary">Summary</span>
    <p class="text-sm leading-relaxed text-primary mt-2">...</p>
  </div>

  <!-- Priority Flags -->
  <div class="px-5 py-4 border-b border-border">
    <span class="text-xs font-medium uppercase tracking-wide text-secondary">Priority Flags</span>
    <div class="mt-2 space-y-2">
      <div class="flex items-start gap-2 p-3 rounded-lg bg-flag-critical-bg">
        <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-flag-critical text-white shrink-0">Critical</span>
        <p class="text-sm text-primary">BP dropped to 88/54 at 18:45. HR elevated at 112. Attending notified.</p>
      </div>
    </div>
  </div>

  <!-- Stable Items -->
  <div class="px-5 py-4 border-b border-border">
    <span class="text-xs font-medium uppercase tracking-wide text-secondary">Stable Items</span>
    <ul class="mt-2 space-y-1">
      <li class="flex items-center gap-2 text-sm text-primary">
        <span class="w-1.5 h-1.5 rounded-full bg-flag-safe shrink-0"></span>
        Admitting diagnosis unchanged
      </li>
    </ul>
  </div>

  <!-- Recommended First Actions -->
  <div class="px-5 py-4">
    <span class="text-xs font-medium uppercase tracking-wide text-secondary">Recommended First Actions</span>
    <ol class="mt-2 space-y-1 list-decimal list-inside">
      <li class="text-sm text-primary">Reassess vitals on arrival</li>
    </ol>
  </div>
</div>
```

**Accessibility:**
- Priority flags use `role="alert"` for critical items
- Ordered list for recommended actions (sequence matters)
- Generation timestamp visible and semantic (`<time>` element)
- Keyboard navigable — Tab through sections

**Do / Don't:**
- Do: Show generation timestamp prominently — trust depends on recency
- Don't: Truncate the summary or hide flags behind expand/collapse — this is the one view where completeness wins over density

---

### Nurse Action Bar

**Purpose:** Human control surface for AI-generated content. Approve, escalate, or override. Appears on flagged notes only. Safe path (Approve) is visually dominant — dangerous path (Override) is de-emphasized.

**Actions:**
- `Approve` — confirms AI assessment, saves note as-is (primary button)
- `Escalate` — marks for senior review (secondary button)
- `Override` — nurse overrides AI flag with their clinical judgment (ghost/destructive)

**Tailwind Pattern:**
```html
<div class="flex items-center gap-3">
  <!-- Approve (primary — safe path, visually dominant) -->
  <button class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-flag-safe text-white hover:bg-emerald-600 focus-visible:ring-2 focus-visible:ring-flag-safe focus-visible:ring-offset-2 transition-colors duration-150">
    <svg class="w-4 h-4"><!-- check icon --></svg>
    Approve
  </button>

  <!-- Escalate (secondary) -->
  <button class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg border border-flag-warning text-flag-warning bg-background hover:bg-flag-warning-bg focus-visible:ring-2 focus-visible:ring-flag-warning focus-visible:ring-offset-2 transition-colors duration-150">
    <svg class="w-4 h-4"><!-- arrow-up icon --></svg>
    Escalate
  </button>

  <!-- Override (ghost — deliberately de-emphasized) -->
  <button class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 transition-colors duration-150">
    Override
  </button>
</div>
```

**Accessibility:**
- All native `<button>` elements
- Override includes `aria-label="Override AI flag — use clinical judgment"`
- Focus order: Approve → Escalate → Override (safe path first)
- Keyboard: Enter/Space to activate

**Do / Don't:**
- Do: Make Approve the visually dominant action — it's the safe, expected path
- Don't: Make Override visually equal to Approve — it should require deliberate intent, not accidental clicks

---

### Button (General)

**Purpose:** Primary interactive element for actions throughout the system.

**Variants:**
- `primary` — accent background, white text. Main CTA per surface.
- `secondary` — border + surface background. Supporting actions.
- `ghost` — no background. Tertiary or de-emphasized actions.

**States:** default | hover | focus | active | disabled | loading

**Tailwind Pattern:**
```html
<!-- Primary -->
<button class="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-accent text-accent-foreground hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150">
  Label
</button>

<!-- Secondary -->
<button class="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg border border-border bg-surface text-primary hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150">
  Label
</button>

<!-- Ghost -->
<button class="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg text-secondary hover:text-primary hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150">
  Label
</button>
```

**Accessibility:**
- Native `<button>` always
- `disabled` attribute (not `aria-disabled`) for true disabled state
- Focus ring: `focus-visible:ring-2 focus-visible:ring-accent`
- Min touch/click target: 44px height (py-2.5 on text-sm achieves ~40px — add py-3 if needed)

---

## Page Layouts

### Dashboard (`/`)
```
┌──────────────────────────────────────────┐
│ Header: Nurse Context Engine    [Nurse]  │
├──────────────────────────────────────────┤
│                                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ Patient  │ │ Patient  │ │ Patient  │   │
│  │ Card 1   │ │ Card 2   │ │ Card 3   │   │
│  │ Margaret │ │ Devon    │ │ Aisha    │   │
│  └─────────┘ └─────────┘ └─────────┘   │
│                                          │
└──────────────────────────────────────────┘
```
- Grid: `grid grid-cols-1 xl:grid-cols-3 gap-6`
- Max width: `max-w-7xl mx-auto`
- Page padding: `px-8 py-8`

### Patient Detail (`/patient/[id]`)
```
┌──────────────────────────────────────────────────┐
│ ← Back to Dashboard    Patient Name    [Status]  │
├────────────┬─────────────────────┬───────────────┤
│ Patient    │ Notes / Supply /    │ Dictation     │
│ Info       │ Handoff Tabs        │ Input Panel   │
│ Sidebar    │                     │               │
│            │ [Tab Content]       │ [Typewriter]  │
│ Name       │                     │               │
│ Ward       │                     │ [Submit]      │
│ Status     │                     │               │
│ Vitals     │                     │ [Output]      │
│            │                     │               │
├────────────┴─────────────────────┴───────────────┤
│ Footer (optional)                                 │
└──────────────────────────────────────────────────┘
```
- Layout: `grid grid-cols-[280px_1fr_400px] gap-6`
- Sidebar: fixed width 280px, `bg-surface border-r border-border`
- Center: fluid, scrollable
- Right panel: fixed width 400px, `bg-surface border-l border-border`

---

## Tailwind Config

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
        surface: '#F8FAFC',
        border: '#E2E8F0',
        primary: '#0F172A',
        secondary: '#475569',
        muted: '#94A3B8',
        accent: {
          DEFAULT: '#0EA5E9',
          hover: '#0284C7',
          foreground: '#FFFFFF',
        },
        flag: {
          warning: '#F59E0B',
          'warning-bg': '#FFFBEB',
          critical: '#EF4444',
          'critical-bg': '#FEF2F2',
          safe: '#10B981',
          'safe-bg': '#F0FDF4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'typewriter-cursor': 'blink 1s step-end infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
```

### CSS Variables (globals.css)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --background: #FFFFFF;
  --surface: #F8FAFC;
  --border: #E2E8F0;
  --text-primary: #0F172A;
  --text-secondary: #475569;
  --text-muted: #94A3B8;
  --accent: #0EA5E9;
  --accent-hover: #0284C7;
  --flag-warning: #F59E0B;
  --flag-critical: #EF4444;
  --flag-safe: #10B981;
}

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: var(--text-primary);
  background: var(--background);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

---

## Design Decisions Log

| Decision | Rationale | Date |
|---|---|---|
| Inter as sole typeface | Optimal legibility at small sizes for dense clinical data; system font fallback for zero FOUT | 2026-02-27 |
| 3-column grid for patient detail | Left context (patient info) + center content (notes/reports) + right input (dictation) — maps to nurse workflow | 2026-02-27 |
| Left border color for flagged cards | F-pattern scanning starts left — flag indicator at left edge is seen first during dashboard scan | 2026-02-27 |
| Override button de-emphasized | Principle 7 (Protect Against Catastrophic Error) — safe path visually dominant, dangerous path requires intent | 2026-02-27 |
| No modals anywhere | Principle 5 (Modeless Status Visibility) — clinical interruption from modals is dangerous | 2026-02-27 |
| 40ms/char typewriter speed | Simulates natural speech-to-text pace — fast enough to feel real, slow enough to be readable | 2026-02-27 |
| Pulse animation for processing (not spinner) | Calmer under clinical stress — spinners create urgency anxiety, pulse communicates "working" without alarm | 2026-02-27 |
