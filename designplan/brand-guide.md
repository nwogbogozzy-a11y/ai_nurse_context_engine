# Brand Guide: Nurse Context Engine

_Last updated: 2026-03-29 | Grounded in NotebookLM visual-design + product-design-strategy queries_

---

## Brand Position

The Nurse Context Engine is a **clinical precision instrument**, not a consumer application. It occupies the same design territory as medical device interfaces and clinical EHR systems. Every visual decision must reinforce one message: **this tool is trustworthy enough to use on hour 11 of a 12-hour shift.**

### Brand Adjectives (Ordered by Priority)
1. **Reliable** -- the system does what it says, every time
2. **Precise** -- no ambiguity, no decoration, no noise
3. **Transparent** -- reasoning is visible, not hidden
4. **Efficient** -- zero unnecessary friction
5. **Clinical** -- professional without being cold

### Brand Personality
The system communicates like a senior colleague: calm, direct, factual. It does not congratulate, apologize, or editorialize. It surfaces information and gets out of the way.

---

## Visual Identity

### Logo Treatment
- No logo in the current phase. The product name appears as plain text in Inter 600 weight.
- Product name: **Nurse Context Engine**
- No tagline in the interface. The product speaks through use.

### Color Identity

The color system is **monochromatic with semantic accents**. The base interface is achromatic (white, slate, near-black). Color appears only when it carries clinical meaning.

| Role | Token | Value | When It Appears |
|---|---|---|---|
| Base surface | `background` | #FFFFFF | Always -- page background |
| Card surface | `surface` | #F8FAFC | Always -- card and panel backgrounds |
| Dividers | `border` | #E2E8F0 | Always -- structural separation |
| System accent | `accent` | #0EA5E9 | Interactive elements only: buttons, links, focus rings |
| Warning | `flag-warning` | #F59E0B | Anomaly detected, human attention needed |
| Critical | `flag-critical` | #EF4444 | Urgent, requires immediate human review |
| Safe/Clear | `flag-safe` | #10B981 | Approved, no action needed |

#### Color Rules
1. **Semantic only.** No decorative color. Every hue means something.
2. **Color is never the sole indicator.** Always paired with text label + icon (5% of males have color vision deficiency).
3. **Background stays achromatic.** No colored page sections, banners, or gradients.
4. **Accent reserved for interaction.** Buttons, links, focus rings. Never status or content.
5. **Desaturated backgrounds for flag containers.** Tinted surfaces (#FFFBEB, #FEF2F2, #F0FDF4) reduce eye fatigue over 12-hour shifts.
6. **Red is sacred.** Used exclusively for critical clinical status. Never for branding, marketing, or decorative emphasis.

### Typography

**Typeface:** Inter (Google Fonts)

Inter is a **realist sans-serif** -- serious, professional, and effectively invisible. It lets clinical data take center stage. Per NotebookLM visual-design guidance, realist typefaces (the Helvetica family) communicate sterility, precision, and credibility without appearing "designed by a marketing team."

| Role | Size | Weight | Use |
|---|---|---|---|
| Page title | 30px | 700 (Bold) | One per page. Patient name in detail view, "Dashboard" on home. |
| Section header | 24px | 600 (Semibold) | Major view divisions. |
| Subsection | 20px | 600 | Tab labels, card group headers. |
| Card title | 18px | 600 | Patient card names, note titles. |
| Body | 16px | 400 (Regular) | All primary content. Minimum size for any clinical text. |
| Body SM | 14px | 400 | Dense table/list content. |
| Caption | 12px | 400 | Timestamps, metadata. |
| Label | 12px | 500 + uppercase + tracking-wide | Column headers, SOAP section labels. |
| Mono | 14px | 400 (monospace) | Clinical values: vitals, drain output, measurements. |

#### Typography Rules
- **Always letter-space uppercase text.** Fonts are designed for sentence case; uppercase without tracking looks cramped (NotebookLM: king-vs-pawn).
- **Headings always use `text-primary` (#0F172A).** Never muted.
- **Muted text (#94A3B8) only at 16px+** to maintain WCAG AA (3.5:1 minimum contrast).
- **No decorative fonts, no font mixing.** One family. Consistency is trust.

### Density Philosophy

Per NotebookLM visual-design: **maximize signal-to-noise ratio.** Every unnecessary line, graphic, or data item steals attention from critical clinical information.

- **Form follows function.** Beauty comes from the purity of utility.
- **Horror vacui inverted.** Intentional whitespace communicates precision and prestige. The interface is not empty -- it is focused.
- **Progressive disclosure for depth.** Show the most relevant controls by default. Advanced features behind deliberate interaction ("More" actions, tab navigation).
- **Strip visual noise.** Thin or remove borders where possible. Simplify by removing elements that don't actively aid the nurse's current task.

### Spacing and Density
- 8px base grid
- Card padding: 20-24px (`p-5` or `p-6`)
- Generous gaps between action buttons (12px / `gap-3`) to prevent misclicks under fatigue
- Table row height: 12px vertical padding (`py-3`)

---

## Tone of Voice

### Writing Principles

| Principle | Do | Don't |
|---|---|---|
| **Direct** | "Drain output exceeds expected threshold." | "It looks like drain output might be a little higher than what we'd normally expect." |
| **Clinical** | "AI is processing..." | "Hang tight! We're working on it!" |
| **Factual** | "Generated: 19:02" | "Just generated moments ago!" |
| **Neutral** | "Note saved." | "Great job! Your note has been saved successfully!" |
| **Actionable** | "Reassess vitals on arrival." | "You may want to consider checking the vitals when you get a chance." |

### Voice Rules
1. **No personality.** The system is a tool, not a companion. No humor, no enthusiasm, no apologies.
2. **No filler words.** "Please," "just," "simply," "actually" -- remove them all.
3. **Active voice.** "System flagged elevated heart rate" not "An elevated heart rate was flagged by the system."
4. **Present tense for status.** "Processing" not "Your request is being processed."
5. **Plain English for flag reasons.** A nurse on hour 11 should understand every word without re-reading.

### Content Labels

| Content Type | Label | Visual Treatment |
|---|---|---|
| AI-generated note | "AI-Structured" | Italic text, `text-muted` color, prefixed with AI indicator icon |
| AI-generated supply list | "AI-Generated" | Same as above |
| AI-generated handoff report | "AI-Generated Report" | Same as above |
| Human-entered observation | No label needed | Default styling -- human input is the baseline |
| AI flag reason | "Flag:" prefix | Amber or red container, plain English |

**Clinical safety rule:** AI-generated content must **always** be visually distinct from human-entered content. This is not a style preference. It is a safety requirement. A nurse must never mistake AI output for a human-written record.

---

## Interaction Identity

### Motion
- **No decorative animation.** Motion communicates state change only.
- **100ms hover transitions.** Fast enough to feel responsive, slow enough to register.
- **150ms button transitions.** Focus rings, color changes.
- **300ms panel reveals.** Tab switching, content area transitions.
- **40ms/character typewriter.** Dictation simulation only.
- **1.5s pulse.** AI processing indicator. Calmer than a spinner under clinical stress.

### Elevation
- **Minimal shadows.** Cards use `shadow-sm` by default, `shadow-md` on hover/focus.
- **No drop shadows on buttons.** Flat surfaces with border distinction.
- **No gradients anywhere.** Gradients signal consumer software. Flat surfaces signal precision.

### Borders and Shapes
- **Rounded-lg (8px) for cards and buttons.** Professional without being sharp.
- **Rounded (4px) for inputs and small badges.** Subtle softening.
- **Rounded-full for status dots and avatar circles.** Circular indicators only.
- **No rounded-xl or larger** in standard components. Over-rounding signals playfulness.

---

## What This Brand Is Not

| We are NOT | Why |
|---|---|
| A SaaS dashboard | No gradients, drop shadows, colorful illustrations, or "juicy" Web 2.0 graphics |
| A consumer health app | No friendly mascots, motivational copy, or gamification elements |
| An EHR replacement | We don't look like Epic or Cerner. We're a context layer, not a charting system |
| A startup landing page | No hero images, no marketing copy in the interface, no "Get Started Free" CTAs |

---

## Brand Application Checklist

Before shipping any view, verify:

- [ ] All color usage is semantic (no decorative color)
- [ ] AI-generated content is visually distinct from human-entered content
- [ ] All text meets WCAG AA contrast minimums on its surface
- [ ] No gradients, drop shadows beyond `shadow-md`, or decorative elements
- [ ] Typography uses Inter only, with correct weight/size per role
- [ ] Copy is direct, factual, and free of personality
- [ ] Flag indicators use color + text + icon (never color alone)
- [ ] Interactive elements have visible focus rings
- [ ] Spacing follows 8px grid
