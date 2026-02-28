# Typography System Reference

## Core Principles
1. **Hierarchy through contrast** — size, weight, and color work together, not independently
2. **Legibility first** — no type decision should prioritize aesthetics over readability
3. **Minimum 2 type roles** — always distinguish heading from body; 3–4 roles is typical
4. **Restraint** — one typeface for most projects; two maximum (heading + body)

---

## Font Pairing Patterns

### Single Typeface (recommended for most projects)
Use weight and size variation within one family. Clean, cohesive, easier to maintain.
- **Sans-serif utility**: Inter, Plus Jakarta Sans, DM Sans — professional, legible, neutral
- **Humanist sans**: Outfit, Nunito, Poppins — approachable, friendly, modern
- **Geometric sans**: Geist, Sora, Space Grotesk — technical, contemporary, distinctive

### Heading + Body Pairing
Use when you need stronger brand character or better long-form readability.
- **Serif heading + sans body**: Strong hierarchy, editorial feel, trust-building
  - Fraunces / Inter, Playfair Display / DM Sans, Lora / Plus Jakarta Sans
- **Display sans + utility sans**: Modern brand with readable body
  - Sora / Inter, Space Grotesk / Inter, Outfit / DM Sans
- **Mono accent + sans body**: Technical, developer-focused aesthetic
  - JetBrains Mono (accents/code) / Inter, Geist Mono / Geist

### Avoid
- More than 2 typefaces
- Two serif typefaces together
- Mixing two geometric sans — too similar, no contrast
- System fonts for brand-forward projects (acceptable for dashboards/tools)

---

## Type Scale

### Tailwind Default Scale (no config changes needed)

| Role | Class | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| Display | `text-6xl font-bold` | 60px | 700 | `leading-none` (1.0) | `tracking-tight` |
| H1 | `text-5xl font-bold` | 48px | 700 | `leading-tight` (1.25) | `tracking-tight` |
| H2 | `text-4xl font-semibold` | 36px | 600 | `leading-tight` (1.25) | `tracking-tight` |
| H3 | `text-3xl font-semibold` | 30px | 600 | `leading-snug` (1.375) | default |
| H4 | `text-2xl font-medium` | 24px | 500 | `leading-snug` (1.375) | default |
| H5 | `text-xl font-medium` | 20px | 500 | `leading-normal` (1.5) | default |
| Body LG | `text-lg` | 18px | 400 | `leading-relaxed` (1.625) | default |
| Body | `text-base` | 16px | 400 | `leading-relaxed` (1.625) | default |
| Body SM | `text-sm` | 14px | 400 | `leading-relaxed` (1.625) | default |
| Caption | `text-xs` | 12px | 400 | `leading-normal` (1.5) | `tracking-wide` |
| Label | `text-xs font-medium` | 12px | 500 | `leading-normal` | `tracking-widest uppercase` |

### Custom Scale (add to tailwind.config.js if needed)

```js
theme: {
  extend: {
    fontSize: {
      'display': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
      'display-sm': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
    }
  }
}
```

---

## Responsive Type

Headlines should scale down on mobile — minimum 2 steps:

```html
<!-- Marketing headline -->
<h1 class="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
  Headline
</h1>

<!-- Section heading -->
<h2 class="text-2xl md:text-3xl lg:text-4xl font-semibold">
  Section
</h2>

<!-- Body copy — rarely needs to scale -->
<p class="text-base md:text-lg leading-relaxed">
  Body copy
</p>
```

---

## Measure (Line Length)

Optimal reading line length: **60–75 characters** (roughly `max-w-prose` in Tailwind = 65ch).

```html
<!-- Constrain body copy width -->
<p class="max-w-prose text-base leading-relaxed">...</p>

<!-- Marketing copy can be wider but not full-width -->
<p class="max-w-2xl text-lg leading-relaxed">...</p>
```

Never let body text span full container width at desktop sizes.

---

## Color Roles for Type

Always use semantic tokens, never hardcoded colors:

| Role | Tailwind Token | Use |
|---|---|---|
| `text-primary` | `text-gray-900` (default) | Headings, primary body |
| `text-secondary` | `text-gray-600` | Supporting copy, subtitles |
| `text-muted` | `text-gray-400` | Placeholders, metadata, disabled |
| `text-inverse` | `text-white` | Text on dark backgrounds |
| `text-accent` | `text-[accent]` | Links, highlights, CTAs |
| `text-destructive` | `text-red-600` | Errors, warnings |

---

## Type by Project Type

### Marketing / Landing Pages
- Display and H1 should command attention — large, bold, tight tracking
- Body copy at `text-lg leading-relaxed` — comfortable reading
- CTAs at `text-base font-semibold` or `text-sm font-semibold uppercase tracking-widest`
- Limit body copy width to `max-w-2xl`

### Portfolio Sites
- Type choices signal taste — invest in a distinctive pairing
- Case study body at `text-base md:text-lg leading-relaxed max-w-prose`
- Project titles should be prominent but not screaming
- Metadata (dates, roles, tags) at `text-sm text-secondary`

### Web Apps / Dashboards
- Legibility over expression — Inter or system font is fine
- Dense data tables: `text-sm` body, `text-xs font-medium uppercase tracking-wide` for column headers
- Form labels: `text-sm font-medium`
- Error messages: `text-sm text-destructive`
- Avoid decorative typefaces entirely

---

## Common Mistakes

**Tracking on body text** — Never add `tracking-wide` to body copy. Letter spacing is for headings (tight) and labels (wide uppercase only).

**Weight without purpose** — `font-semibold` on everything creates no hierarchy. Reserve bold weights for actual headings and CTAs.

**Too many sizes** — If you have more than 5–6 distinct type sizes in use, you have a hierarchy problem. Consolidate.

**Line height on headings** — Large headings need tight line height (`leading-tight` or `leading-none`). Default `leading-normal` on a 48px heading looks broken.
