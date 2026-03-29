# Phase 4: Real-Time System and UI Overhaul - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-29
**Phase:** 04-real-time-system-and-ui-overhaul
**Areas discussed:** Realtime scope, shadcn/ui migration strategy, Loading & skeleton design, Visual refresh direction

---

## Realtime Scope

### Which tables get live subscriptions?

| Option | Description | Selected |
|--------|-------------|----------|
| All 4 tables | notes, supply_requests, handoff_reports, audit_log | ✓ |
| Core 3 only | Skip audit_log | |
| Notes + dashboard only | Minimal scope | |

**User's choice:** All 4 tables

### UI reaction to realtime events

| Option | Description | Selected |
|--------|-------------|----------|
| Silent insert | Data appears automatically, no notification | ✓ |
| Subtle indicator | Dot/badge shows "2 new notes" | |
| Toast notification | Sonner toast per event | |

**User's choice:** Silent insert

### Subscription channel strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Per-patient on detail page | Subscribe on enter, unsubscribe on leave | |
| Global subscription | Always listening on all tables | |
| Hybrid | Global for dashboard badges, per-patient for detail | ✓ |

**User's choice:** Hybrid — after requesting detailed explanation of all three options and their demo implications. Key factor: the Aisha Mensah demo scenario where incoming nurse sees flag badge update on dashboard.

### Data insertion behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Prepend to top | New items appear at top, no re-sort | ✓ |
| Full refetch and re-sort | Re-query on every event | |
| Optimistic prepend + background sync | Insert immediately, sync quietly | |

**User's choice:** Prepend to top

### patient_summaries realtime

| Option | Description | Selected |
|--------|-------------|----------|
| No — refetch on navigate | Summary updates on page visit | ✓ |
| Yes — subscribe | Fifth table subscription | |

**User's choice:** No — refetch on navigate

### Dashboard subscription scope

| Option | Description | Selected |
|--------|-------------|----------|
| Update badge + timestamp | Flag badge AND last note timestamp update live | ✓ |
| Badge only | Only flag status changes | |

**User's choice:** Badge + timestamp

---

## shadcn/ui Migration Strategy

### Migration scope

| Option | Description | Selected |
|--------|-------------|----------|
| Full migration | Replace all 11 components | ✓ |
| Selective — high-impact only | Migrate 5 key components | |
| Primitives only | Base primitives, keep outer structure | |

**User's choice:** Full migration

### Token strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Remap shadcn to existing tokens | Clinical color system stays authoritative | ✓ |
| Adopt shadcn defaults | Rework token names | |
| Dual system | Both systems coexist | |

**User's choice:** Remap to existing tokens

### NurseSwitcher upgrade

| Option | Description | Selected |
|--------|-------------|----------|
| shadcn Select + Dialog | Full upgrade | ✓ |
| shadcn Select only | Keep window.confirm | |
| Keep as-is | No change | |

**User's choice:** shadcn Select + Dialog

### Table component

| Option | Description | Selected |
|--------|-------------|----------|
| shadcn Table | Clean semantic table | ✓ |
| shadcn DataTable | TanStack Table integration | |
| Keep custom, add shadcn Checkbox | Minimal change | |

**User's choice:** shadcn Table

### Tabs component

| Option | Description | Selected |
|--------|-------------|----------|
| shadcn Tabs | Radix primitive with keyboard nav | ✓ |
| Keep custom tabs | Already has ARIA | |

**User's choice:** shadcn Tabs

### Class utility

| Option | Description | Selected |
|--------|-------------|----------|
| Adopt cn() everywhere | clsx + tailwind-merge in all components | ✓ |
| cn() for shadcn only | Two patterns coexist | |
| No cn() — template literals | Rewrite shadcn internals | |

**User's choice:** Adopt cn() everywhere

---

## Loading & Skeleton Design

### AI processing loading state

| Option | Description | Selected |
|--------|-------------|----------|
| SOAP skeleton | Four labeled sections with shimmer lines | ✓ |
| Generic card skeleton | Simple rounded card with lines | |
| Inline progress indicator | Progress bar in dictation panel | |

**User's choice:** SOAP skeleton

### Secondary output skeletons

| Option | Description | Selected |
|--------|-------------|----------|
| Matching skeletons | Each skeleton matches final layout shape | ✓ |
| Generic skeletons | Same simple skeleton for both | |
| No — just the note | Spinner for secondary outputs | |

**User's choice:** Matching skeletons

### Timeout

| Option | Description | Selected |
|--------|-------------|----------|
| 15 seconds | Then show "Taking longer..." + retry | ✓ |
| 30 seconds | More generous | |
| No timeout | Trust the webhook | |

**User's choice:** 15 seconds

---

## Visual Refresh Direction

### Refresh scope

| Option | Description | Selected |
|--------|-------------|----------|
| Polish, not redesign | Upgrade spacing/typography through shadcn | |
| Meaningful visual upgrade | Rethink proportions, whitespace, polish | ✓ |
| Minimal — just swap components | Same everything, new primitives | |

**User's choice:** Meaningful visual upgrade

### Patient card design

| Option | Description | Selected |
|--------|-------------|----------|
| shadcn Card with current info | Same info, cleaner styling | |
| Enhanced cards | Add last nurse, flag count, admission duration | ✓ |
| Keep current cards | Swap internals only | |

**User's choice:** Enhanced cards

### Enhanced card info (multi-select)

| Option | Description | Selected |
|--------|-------------|----------|
| Note count | Total clinical notes | |
| Last documenting nurse | Name of last nurse | ✓ |
| Active flag count | Unresolved flags | ✓ |
| Admission duration | Days since admission | ✓ |

**User's choice:** Last documenting nurse, Active flag count, Admission duration

### Three-panel layout

| Option | Description | Selected |
|--------|-------------|----------|
| Keep layout, refine proportions | Adjust widths, add separators | ✓ |
| Collapsible sidebar | Left panel collapses to icons | |
| No changes | Panels stay exactly as-is | |

**User's choice:** Keep layout, refine proportions

### Header refresh

| Option | Description | Selected |
|--------|-------------|----------|
| shadcn header | Clean header bar with title + nurse switcher | ✓ |
| Minimal touch | Just upgrade the dropdown | |

**User's choice:** shadcn header

---

## Claude's Discretion

- shadcn component variant choices (default, outline, ghost, etc.)
- Shimmer animation timing and opacity values
- Panel width ratios in three-panel layout
- Typography scale increments
- Placement of new card info elements

## Deferred Ideas

None — discussion stayed within phase scope
