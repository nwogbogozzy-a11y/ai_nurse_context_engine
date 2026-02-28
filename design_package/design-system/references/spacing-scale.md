# Spacing Scale Reference

## The 8px Base Grid
All spacing in the system is based on multiples of 8px (with 4px as the minimum for tight internal spacing). This creates visual rhythm and makes layouts feel intentional rather than arbitrary.

**Why 8px?** Maps cleanly to Tailwind's default scale. Divisible by common screen widths. Creates consistent density across components.

## Tailwind Default Scale Mapping

| Token | px | rem | Tailwind Class | Use Case |
|---|---|---|---|---|
| space-0 | 0 | 0 | `p-0` / `m-0` | Resets |
| space-px | 1px | — | `p-px` | Hairline borders, offsets |
| space-0.5 | 2px | 0.125rem | `p-0.5` | Micro-adjustments |
| space-1 | 4px | 0.25rem | `p-1` | Icon padding, tight internal |
| space-1.5 | 6px | 0.375rem | `p-1.5` | Badge padding |
| space-2 | 8px | 0.5rem | `p-2` | Button padding (compact), input internal |
| space-3 | 12px | 0.75rem | `p-3` | Button padding (default), list item gap |
| space-4 | 16px | 1rem | `p-4` | Card padding (compact), section gap (tight) |
| space-5 | 20px | 1.25rem | `p-5` | Form field gap |
| space-6 | 24px | 1.5rem | `p-6` | Card padding (default), nav height internal |
| space-8 | 32px | 2rem | `p-8` | Card padding (spacious), section gap |
| space-10 | 40px | 2.5rem | `p-10` | Large component padding |
| space-12 | 48px | 3rem | `p-12` | Section gap (default) |
| space-16 | 64px | 4rem | `p-16` | Section gap (spacious) |
| space-20 | 80px | 5rem | `p-20` | Hero padding |
| space-24 | 96px | 6rem | `p-24` | Large section spacing |
| space-32 | 128px | 8rem | `p-32` | Page-level vertical rhythm |

## Semantic Spacing Roles

Assign semantic meaning to spacing values so components use consistent language:

| Role | Value | Notes |
|---|---|---|
| `spacing-component-xs` | 4px (space-1) | Tight internal padding (badges, chips) |
| `spacing-component-sm` | 8px (space-2) | Compact components |
| `spacing-component-md` | 12–16px (space-3/4) | Default component padding |
| `spacing-component-lg` | 24px (space-6) | Spacious component padding |
| `spacing-gap-xs` | 8px (space-2) | Tight element gap |
| `spacing-gap-sm` | 12–16px (space-3/4) | Default element gap |
| `spacing-gap-md` | 24px (space-6) | Section-level gap |
| `spacing-gap-lg` | 48px (space-12) | Large section separation |
| `spacing-section-sm` | 48px (space-12) | Compact section padding |
| `spacing-section-md` | 64–80px (space-16/20) | Default section padding |
| `spacing-section-lg` | 96–128px (space-24/32) | Hero / feature section padding |

## Density Guidelines by Project Type

**Marketing / Landing Pages**
- Generous spacing signals quality and confidence
- Section padding: `py-20` to `py-32`
- Card padding: `p-8` to `p-10`
- Tighter on mobile: reduce by one step

**Portfolio Sites**
- Breathing room is part of the brand
- Section padding: `py-24` to `py-32`
- Let work breathe — don't crowd case studies

**Web Apps / Dashboards**
- Information density matters — tighter default
- Card padding: `p-4` to `p-6`
- Table rows: `py-3` to `py-4`
- Match density to user expectation (power users prefer tighter)

## Responsive Spacing Pattern

Always reduce spacing on mobile — at minimum one step down the scale:

```html
<!-- Desktop spacious, mobile compact -->
<section class="py-12 md:py-20 lg:py-32">
  <div class="px-4 md:px-8 lg:px-16">
    <!-- content -->
  </div>
</section>
```

## Common Mistakes

**Too many custom values** — If you're adding `mt-[22px]` you've broken the grid. Find the nearest scale value or question whether the design is right.

**Inconsistent component density** — Cards with `p-4` next to cards with `p-7` feels unintentional. Pick a density level and apply it consistently.

**Forgetting gap vs padding** — Use `gap-*` for flex/grid children, `space-y-*` for stacked block elements, `p-*` for internal component padding. Don't mix approaches.
