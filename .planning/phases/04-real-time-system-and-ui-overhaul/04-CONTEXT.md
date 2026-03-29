# Phase 4: Real-Time System and UI Overhaul - Context

**Gathered:** 2026-03-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Live data sync across browser tabs via Supabase Realtime subscriptions, plus full migration of all 11 components to shadcn/ui with WCAG 2.1 AA compliance. This is the final phase — the result is the demo-ready product.

Requirements: RT-01, RT-02, RT-03, RT-04, UI-01, UI-02, UI-03, UI-06

</domain>

<decisions>
## Implementation Decisions

### Realtime Scope
- **D-01:** Subscribe to all 4 tables: notes, supply_requests, handoff_reports, audit_log
- **D-02:** Silent insert — new data appears automatically without toasts or banners. The data "just being there" is the demo moment.
- **D-03:** Hybrid subscription pattern — global subscription on dashboard for flag badge + last note timestamp updates; per-patient subscription on detail page for full live updates across all 4 tables
- **D-04:** Per-patient subscriptions subscribe on entering /patient/[id] and unsubscribe on navigation away
- **D-05:** New notes prepend to top of list (newest-first order). No full refetch, no flicker.
- **D-06:** patient_summaries do NOT get realtime subscription — refetch on navigate to patient detail page
- **D-07:** Dashboard global subscription updates both flag badge AND last note timestamp on patient cards

### shadcn/ui Migration
- **D-08:** Full migration of all 11 components to shadcn/ui primitives (Button, Card, Table, Tabs, Dialog, Badge, Select, Textarea, Skeleton, Checkbox, AlertDialog)
- **D-09:** Remap shadcn CSS variables to existing design tokens in globals.css. The clinical color system (--color-primary, --color-accent, --color-flag-*) stays authoritative. shadcn provides component structure + accessibility.
- **D-10:** NurseSwitcher upgrades to shadcn Select + shadcn AlertDialog (replaces native select and window.confirm)
- **D-11:** SupplyChecklist table becomes shadcn Table with shadcn Checkbox (no DataTable/TanStack — supply lists are short)
- **D-12:** Patient detail tabs migrate to shadcn Tabs (Radix primitive with keyboard navigation, focus management, ARIA roles built-in)
- **D-13:** Adopt cn() utility (clsx + tailwind-merge) everywhere — both in shadcn components and migrated existing components. Create lib/utils.ts.

### Loading & Skeleton Design
- **D-14:** SOAP skeleton during AI processing — four labeled sections (S/O/A/P) with shimmer lines matching the final note structure
- **D-15:** Supply checklist skeleton shows table outline with shimmer rows. Handoff report skeleton shows card outlines for summary/flags/stable/actions. Each skeleton matches its final layout shape.
- **D-16:** 15-second timeout before showing "Taking longer than expected..." with retry option

### Visual Refresh
- **D-17:** Meaningful visual upgrade — rethink card proportions, spacing ratios, typography scale, whitespace. Noticeably more polished than current state. Not a redesign of information architecture.
- **D-18:** Enhanced patient cards with three additions: last documenting nurse name, admission duration (e.g., "Day 3"), and active unresolved flag count. Left border color indicator stays.
- **D-19:** Three-panel patient detail layout stays. Refine panel proportions (give center panel more room if needed), add subtle visual separators between panels.
- **D-20:** Header/nav bar refresh — shadcn-styled header bar with app title, shadcn Select nurse switcher, professional top bar framing.

### Claude's Discretion
- shadcn component variant choices (default, outline, ghost, etc.) for buttons and badges
- Specific shimmer animation timing and opacity values
- Panel width ratios in the three-panel layout
- Typography scale increments (font sizes, line heights, letter spacing)
- Exact placement of new card info elements (note count, nurse name, admission duration)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design System
- `.interface-design/system.md` — Component design system with color tokens, spacing, typography
- `src/app/globals.css` — Semantic design tokens (@theme inline block) — authoritative color system

### Prior Phase Context
- `.planning/phases/01-functional-foundation/1-CONTEXT.md` — D-08 (direct Supabase writes), D-15-17 (Sonner toasts), nurse identity pattern
- `.planning/phases/02-compliance-audit-trail/2-CONTEXT.md` — Audit log schema, activity tab, flag badge states
- `.planning/phases/03-ai-context-memory/03-CONTEXT.md` — SOAP visual polish, handoff card layout, clinical aesthetic principles

### Existing Components (all need migration)
- `src/components/ActivityTimeline.tsx` — Audit log timeline
- `src/components/DictationInput.tsx` — Dictation input with typewriter + free-form
- `src/components/FlagBadge.tsx` — Flag status badge (5 states)
- `src/components/HandoffReport.tsx` — Handoff briefing cards
- `src/components/NurseActionBar.tsx` — Approve/escalate/override buttons
- `src/components/NurseSwitcher.tsx` — Nurse identity dropdown
- `src/components/PatientCard.tsx` — Dashboard patient card
- `src/components/PatientContextSummary.tsx` — AI context summary
- `src/components/ProcedureSearch.tsx` — Supply lookup form
- `src/components/StructuredNote.tsx` — SOAP note display
- `src/components/SupplyChecklist.tsx` — Supply table with checkboxes

### Data Layer
- `src/lib/supabase.ts` — Supabase client (needs realtime channel setup)
- `src/lib/types.ts` — All TypeScript interfaces
- `src/app/patient/[id]/page.tsx` — Main data fetching (Promise.all pattern, fetchData callback)
- `src/app/page.tsx` — Dashboard data fetching

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Supabase client in `src/lib/supabase.ts` — extend with `.channel()` for realtime
- NurseContext provider in `src/contexts/NurseContext.tsx` — nurse identity available app-wide
- Sonner toast setup in layout — keep for action confirmations (toasts are NOT for realtime events per D-02)
- Design tokens in globals.css — remap to shadcn CSS variable names

### Established Patterns
- All components are `'use client'` with `useState` + `useEffect`
- Data fetching via `useCallback` + `useEffect` with dependency arrays
- Direct Supabase writes with try/catch + toast feedback
- Template literals for conditional classes (migrating to cn() per D-13)
- No global state library — React Context + local state only

### Integration Points
- Dashboard page needs global realtime subscription (flag badges + timestamps)
- Patient detail page needs per-patient subscription (notes, supplies, handoffs, audit)
- Subscriptions should use `useEffect` cleanup for unsubscribe on unmount/navigation
- shadcn components install via CLI into `src/components/ui/` directory
- cn() utility goes in `src/lib/utils.ts`

</code_context>

<specifics>
## Specific Ideas

- Dashboard should feel like a "command center" with enhanced cards showing last nurse, admission day, and flag count
- The "living system" narrative is key — silent data updates that just appear make the strongest demo impression
- Header bar should frame the app as a professional clinical tool, not a prototype
- Each skeleton loader should preview the shape of its final content (SOAP sections, table rows, card stacks)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-real-time-system-and-ui-overhaul*
*Context gathered: 2026-03-29*
