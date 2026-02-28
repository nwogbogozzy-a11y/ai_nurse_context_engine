# Design System: [Project Name]
_Last updated: [date] | Project type: [Marketing / Portfolio / Web App]_

---

## Color Tokens

| Token | Value | Tailwind | Rationale |
|---|---|---|---|
| `background` | | | |
| `surface` | | | |
| `border` | | | |
| `text-primary` | | | |
| `text-secondary` | | | |
| `text-muted` | | | |
| `accent` | | | |
| `accent-hover` | | | |
| `accent-foreground` | | | |
| `destructive` | | | |
| `success` | | | |
| `warning` | | | |

---

## Typography

**Typeface(s):** [Name(s) and source — Google Fonts URL or system]
**Rationale:** [Why this choice for this project/audience]

| Role | Size | Weight | Line Height | Tailwind Pattern |
|---|---|---|---|---|
| Display | | | | |
| H1 | | | | |
| H2 | | | | |
| H3 | | | | |
| H4 | | | | |
| Body | | | | |
| Body SM | | | | |
| Caption | | | | |
| Label | | | | |

---

## Spacing

**Base grid:** 8px
**Density level:** [Compact / Default / Spacious] — [rationale]

| Role | Value | Tailwind |
|---|---|---|
| Component XS | 4px | `p-1` |
| Component SM | 8px | `p-2` |
| Component MD | 16px | `p-4` |
| Component LG | 24px | `p-6` |
| Gap SM | 16px | `gap-4` |
| Gap MD | 24px | `gap-6` |
| Gap LG | 48px | `gap-12` |
| Section SM | 48px | `py-12` |
| Section MD | 80px | `py-20` |
| Section LG | 128px | `py-32` |

---

## Border Radius

| Token | Value | Tailwind | Use |
|---|---|---|---|
| `radius-sm` | | | Inputs, badges |
| `radius-md` | | | Cards, buttons |
| `radius-lg` | | | Modals, panels |
| `radius-full` | | | Pills, avatars |

---

## Shadows / Elevation

| Token | Value | Tailwind | Use |
|---|---|---|---|
| `shadow-sm` | | `shadow-sm` | Subtle card lift |
| `shadow-md` | | `shadow-md` | Cards, dropdowns |
| `shadow-lg` | | `shadow-lg` | Modals, popovers |

---

## Motion

| Token | Duration | Easing | Use |
|---|---|---|---|
| `transition-fast` | 100ms | ease-out | Hover states, color changes |
| `transition-base` | 200ms | ease-out | Component transitions |
| `transition-slow` | 300ms | ease-in-out | Page transitions, modals |

---

## Breakpoints

| Name | Value | Tailwind Prefix |
|---|---|---|
| sm | 640px | `sm:` |
| md | 768px | `md:` |
| lg | 1024px | `lg:` |
| xl | 1280px | `xl:` |
| 2xl | 1536px | `2xl:` |

---

## Components

<!-- Add one section per component using the format below -->

### Button

**Purpose:** Primary action trigger. Use for the most important action on a surface.

**Variants:**
- `primary` — filled accent background, used for main CTA
- `secondary` — outlined or surface background, used for secondary actions
- `ghost` — no background, used for tertiary/destructive actions

**States:** default | hover | focus | active | disabled | loading

**Tailwind Pattern:**
```html
<!-- Primary -->
<button class="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-md bg-accent text-accent-foreground hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none transition-colors duration-200">
  Label
</button>

<!-- Secondary -->
<button class="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-md border border-border bg-surface text-primary hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none transition-colors duration-200">
  Label
</button>
```

**Accessibility:**
- Native `<button>` element always preferred
- `disabled` attribute on native button; `aria-disabled="true"` if custom element
- Focus ring: `focus-visible:ring-2 focus-visible:ring-accent`

**Do / Don't:**
- Do: Use primary for the single most important action per surface
- Don't: Use more than one primary button in the same visual grouping

---

<!-- Continue with project-specific components -->

---

## Tailwind Config

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        surface: 'hsl(var(--surface))',
        border: 'hsl(var(--border))',
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          hover: 'hsl(var(--accent-hover))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        // Add remaining tokens
      },
      fontFamily: {
        sans: ['[FontName]', 'system-ui', 'sans-serif'],
        // heading: ['[HeadingFont]', 'sans-serif'], // if using separate heading font
      },
      // Add custom spacing, borderRadius, or other extensions here
    },
  },
  plugins: [],
}
```

---

## Design Decisions Log

_Record intentional decisions and their rationale so future agents don't second-guess them._

| Decision | Rationale | Date |
|---|---|---|
| | | |
