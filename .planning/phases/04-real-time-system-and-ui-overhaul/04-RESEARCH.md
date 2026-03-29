# Phase 4: Real-Time System and UI Overhaul - Research

**Researched:** 2026-03-29
**Domain:** Supabase Realtime subscriptions + shadcn/ui component migration
**Confidence:** HIGH

## Summary

This phase has two distinct workstreams: (1) wiring Supabase Realtime postgres_changes subscriptions so data propagates live across browser tabs, and (2) migrating all 11 existing components to shadcn/ui primitives with WCAG 2.1 AA compliance. Both are well-supported by the existing stack. The Supabase JS client already installed (v2.98.0) includes the Realtime channel API -- no new dependency needed. shadcn/ui v4.1.1 supports Tailwind CSS v4 and the `@theme inline` directive already used in `globals.css`, making the CSS variable remapping straightforward.

The key architectural challenge is designing the Realtime subscription lifecycle correctly: a global dashboard subscription that stays alive for flag badge / timestamp updates, and per-patient subscriptions that mount/unmount with navigation. The shadcn migration is mechanical but large (11 components + 2 pages + layout), requiring careful preservation of existing behavior while swapping the component primitives underneath.

**Primary recommendation:** Initialize shadcn/ui first (creates `components.json`, `lib/utils.ts`, installs Radix dependencies), then migrate components in dependency order (leaf components first, pages last), interleaving Realtime subscription wiring with the page-level migrations since subscriptions live in the same page components being migrated.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Subscribe to all 4 tables: notes, supply_requests, handoff_reports, audit_log
- **D-02:** Silent insert -- new data appears automatically without toasts or banners. The data "just being there" is the demo moment.
- **D-03:** Hybrid subscription pattern -- global subscription on dashboard for flag badge + last note timestamp updates; per-patient subscription on detail page for full live updates across all 4 tables
- **D-04:** Per-patient subscriptions subscribe on entering /patient/[id] and unsubscribe on navigation away
- **D-05:** New notes prepend to top of list (newest-first order). No full refetch, no flicker.
- **D-06:** patient_summaries do NOT get realtime subscription -- refetch on navigate to patient detail page
- **D-07:** Dashboard global subscription updates both flag badge AND last note timestamp on patient cards
- **D-08:** Full migration of all 11 components to shadcn/ui primitives (Button, Card, Table, Tabs, Dialog, Badge, Select, Textarea, Skeleton, Checkbox, AlertDialog)
- **D-09:** Remap shadcn CSS variables to existing design tokens in globals.css. The clinical color system (--color-primary, --color-accent, --color-flag-*) stays authoritative. shadcn provides component structure + accessibility.
- **D-10:** NurseSwitcher upgrades to shadcn Select + shadcn AlertDialog (replaces native select and window.confirm)
- **D-11:** SupplyChecklist table becomes shadcn Table with shadcn Checkbox (no DataTable/TanStack -- supply lists are short)
- **D-12:** Patient detail tabs migrate to shadcn Tabs (Radix primitive with keyboard navigation, focus management, ARIA roles built-in)
- **D-13:** Adopt cn() utility (clsx + tailwind-merge) everywhere -- both in shadcn components and migrated existing components. Create lib/utils.ts.
- **D-14:** SOAP skeleton during AI processing -- four labeled sections (S/O/A/P) with shimmer lines matching the final note structure
- **D-15:** Supply checklist skeleton shows table outline with shimmer rows. Handoff report skeleton shows card outlines for summary/flags/stable/actions. Each skeleton matches its final layout shape.
- **D-16:** 15-second timeout before showing "Taking longer than expected..." with retry option
- **D-17:** Meaningful visual upgrade -- rethink card proportions, spacing ratios, typography scale, whitespace. Noticeably more polished than current state. Not a redesign of information architecture.
- **D-18:** Enhanced patient cards with three additions: last documenting nurse name, admission duration (e.g., "Day 3"), and active unresolved flag count. Left border color indicator stays.
- **D-19:** Three-panel patient detail layout stays. Refine panel proportions (give center panel more room if needed), add subtle visual separators between panels.
- **D-20:** Header/nav bar refresh -- shadcn-styled header bar with app title, shadcn Select nurse switcher, professional top bar framing.

### Claude's Discretion
- shadcn component variant choices (default, outline, ghost, etc.) for buttons and badges
- Specific shimmer animation timing and opacity values
- Panel width ratios in the three-panel layout
- Typography scale increments (font sizes, line heights, letter spacing)
- Exact placement of new card info elements (note count, nurse name, admission duration)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| RT-01 | When Nurse A submits a note, Nurse B's open view of the same patient updates automatically without manual refresh | Supabase Realtime postgres_changes on `notes` table with `patient_id=eq.{id}` filter; per-patient channel in useEffect with cleanup |
| RT-02 | When a handoff report is generated, any open patient view reflects the new report automatically | Same per-patient channel, `.on('postgres_changes', {event: 'INSERT', table: 'handoff_reports', filter})` |
| RT-03 | When supply requests are created, any open patient view reflects the new supplies automatically | Same per-patient channel, `.on('postgres_changes', {event: 'INSERT', table: 'supply_requests', filter})` |
| RT-04 | Patient dashboard (home page) reflects status changes in real-time (flag badges update live) | Global dashboard channel subscribing to `notes` table INSERT events (all patients), updating latestNotes state on receipt |
| UI-01 | All components upgraded to shadcn/ui with Radix primitives (WCAG 2.1 AA accessible by default) | shadcn/ui v4.1.1 with Tailwind v4 support; `npx shadcn@latest init` then `add` per component; Radix provides keyboard nav + ARIA |
| UI-02 | Patient dashboard uses card components with clear visual hierarchy | shadcn Card component + enhanced card content per D-18 (nurse name, admission duration, flag count) |
| UI-03 | Patient detail view three-panel layout has professional typography, spacing, and visual separation | shadcn Card for panels, refined grid proportions per D-19, cn() for conditional styling |
| UI-06 | Loading states use skeleton components during AI processing | shadcn Skeleton component + custom SOAP/table/card skeleton layouts per D-14/D-15 |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| shadcn/ui (CLI) | 4.1.1 | Component scaffolding + Radix primitives | Standard React component library; installs Radix UI, provides WCAG AA accessible primitives out of the box |
| @supabase/supabase-js | 2.98.0 (installed) | Realtime postgres_changes subscriptions | Already in project; `.channel()` API provides subscription lifecycle management |
| clsx | 2.1.1 | Conditional class joining | Required by shadcn cn() utility |
| tailwind-merge | 3.5.0 | Tailwind class deduplication | Required by shadcn cn() utility; prevents conflicting utilities |
| class-variance-authority | 0.7.1 | Component variant definitions | Used by shadcn components for variant props (size, color, etc.) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @radix-ui/react-tabs | (installed by shadcn) | Accessible tab primitives | Patient detail tabs (D-12) |
| @radix-ui/react-select | (installed by shadcn) | Accessible select primitive | NurseSwitcher (D-10) |
| @radix-ui/react-alert-dialog | (installed by shadcn) | Accessible confirmation dialog | NurseSwitcher confirm (D-10) |
| @radix-ui/react-checkbox | (installed by shadcn) | Accessible checkbox primitive | SupplyChecklist (D-11) |
| tw-animate-css | (installed by shadcn) | Animation utilities for Tailwind v4 | Skeleton shimmer, transitions |
| lucide-react | (installed by shadcn) | Icon library | Replaces inline SVGs where applicable |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| shadcn/ui | Headless UI | shadcn is locked decision (D-08); Headless UI has fewer component primitives |
| postgres_changes | Supabase Broadcast | postgres_changes is locked decision (STATE.md); Broadcast requires explicit n8n emit events |
| clsx + tailwind-merge | Just template literals | cn() is locked decision (D-13); template literals can produce conflicting Tailwind classes |

**Installation:**
```bash
cd src
npx shadcn@latest init
npx shadcn@latest add button card table tabs badge select alert-dialog textarea skeleton checkbox
npm install clsx tailwind-merge class-variance-authority
```

Note: `npx shadcn@latest init` will create `components.json` and `src/lib/utils.ts` with the `cn()` function. The `add` commands install Radix dependencies automatically.

**Version verification:** All versions confirmed via `npm view` on 2026-03-29. `@supabase/supabase-js` 2.98.0 already installed in project; Realtime API is available at this version.

## Architecture Patterns

### Recommended Project Structure
```
src/
  components/
    ui/                    # shadcn primitives (auto-generated by CLI)
      button.tsx
      card.tsx
      table.tsx
      tabs.tsx
      badge.tsx
      select.tsx
      alert-dialog.tsx
      textarea.tsx
      skeleton.tsx
      checkbox.tsx
    ActivityTimeline.tsx   # migrated to use shadcn primitives
    DictationInput.tsx     # migrated
    FlagBadge.tsx          # migrated
    HandoffReport.tsx      # migrated
    NurseActionBar.tsx     # migrated
    NurseSwitcher.tsx      # migrated (shadcn Select + AlertDialog)
    PatientCard.tsx        # migrated (shadcn Card)
    PatientContextSummary.tsx  # migrated
    ProcedureSearch.tsx    # migrated
    StructuredNote.tsx     # migrated
    SupplyChecklist.tsx    # migrated (shadcn Table + Checkbox)
    skeletons/             # custom skeleton layouts
      SoapSkeleton.tsx     # D-14: four S/O/A/P sections with shimmer
      SupplySkeleton.tsx   # D-15: table outline with shimmer rows
      HandoffSkeleton.tsx  # D-15: card outlines for report sections
  hooks/
    useRealtimeSubscription.ts  # shared hook for per-patient subscriptions
  lib/
    utils.ts               # cn() utility (created by shadcn init)
    supabase.ts            # existing client (no changes needed)
    types.ts               # existing types
    audit.ts               # existing audit helper
    demo-scripts.ts        # existing
    format-time.ts         # existing
  app/
    globals.css            # extended with shadcn CSS variable remapping
    layout.tsx             # header refresh with shadcn components (D-20)
    page.tsx               # dashboard with global realtime subscription
    patient/[id]/page.tsx  # detail with per-patient realtime subscription
```

### Pattern 1: Supabase Realtime Subscription in React

**What:** A useEffect-based pattern for subscribing to postgres_changes with proper cleanup
**When to use:** Any component/page that needs live data updates

```typescript
// Source: Supabase official docs + React pattern
useEffect(() => {
  const channel = supabase
    .channel(`patient-${patientId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notes',
        filter: `patient_id=eq.${patientId}`,
      },
      (payload) => {
        // D-05: Prepend new note to top of list, no full refetch
        setNotes((prev) => [payload.new as Note, ...prev])
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'supply_requests',
        filter: `patient_id=eq.${patientId}`,
      },
      (payload) => {
        setSupplies((prev) => [payload.new as SupplyRequest, ...prev])
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'handoff_reports',
        filter: `patient_id=eq.${patientId}`,
      },
      (payload) => {
        setHandoffs((prev) => [payload.new as HandoffReportType, ...prev])
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'audit_log',
        filter: `patient_id=eq.${patientId}`,
      },
      (payload) => {
        setAuditEntries((prev) => [payload.new as AuditLogEntry, ...prev])
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [patientId])
```

### Pattern 2: Global Dashboard Subscription

**What:** Dashboard subscribes to notes INSERT events across all patients to update flag badges and timestamps
**When to use:** Dashboard page only

```typescript
// Source: Supabase docs + D-07
useEffect(() => {
  const channel = supabase
    .channel('dashboard-updates')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notes',
      },
      (payload) => {
        const newNote = payload.new as Note
        // Update the latestNotes map for the affected patient
        setLatestNotes((prev) => ({
          ...prev,
          [newNote.patient_id]: newNote,
        }))
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [])
```

### Pattern 3: shadcn CSS Variable Remapping

**What:** Map existing clinical design tokens to shadcn's expected CSS variable names
**When to use:** In globals.css, done once during init

```css
/* Existing clinical tokens stay authoritative (D-09) */
@theme inline {
  /* Existing tokens unchanged */
  --color-background: #FFFFFF;
  --color-surface: #F8FAFC;
  --color-border: #E2E8F0;
  --color-primary: #0F172A;
  --color-secondary: #475569;
  --color-muted: #94A3B8;
  --color-accent: #0EA5E9;
  --color-accent-hover: #0284C7;
  --color-accent-foreground: #FFFFFF;
  /* ... flag tokens ... */

  /* shadcn mappings (aliases to existing tokens) */
  --color-foreground: #0F172A;          /* maps to primary */
  --color-card: #F8FAFC;               /* maps to surface */
  --color-card-foreground: #0F172A;    /* maps to primary */
  --color-popover: #FFFFFF;            /* maps to background */
  --color-popover-foreground: #0F172A; /* maps to primary */
  --color-muted-foreground: #475569;   /* maps to secondary */
  --color-destructive: #EF4444;        /* maps to flag-critical */
  --color-input: #E2E8F0;             /* maps to border */
  --color-ring: #0EA5E9;              /* maps to accent */
  --color-radius: 0.5rem;
}
```

### Pattern 4: cn() Utility

**What:** Class name merging utility replacing template literals
**When to use:** Every component after migration (D-13)

```typescript
// src/lib/utils.ts (created by shadcn init)
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Usage in components:
// Before: className={`px-4 py-2 ${active ? 'bg-accent text-white' : 'bg-surface'}`}
// After:  className={cn('px-4 py-2', active ? 'bg-accent text-white' : 'bg-surface')}
```

### Pattern 5: Skeleton Loaders (D-14, D-15)

**What:** Structurally-shaped skeleton loaders that match final content layout
**When to use:** During AI processing states

```typescript
// SOAP Skeleton (D-14)
import { Skeleton } from '@/components/ui/skeleton'

export function SoapSkeleton() {
  return (
    <div className="space-y-4">
      {['Subjective', 'Objective', 'Assessment', 'Plan'].map((section) => (
        <div key={section} className="space-y-2">
          <Skeleton className="h-4 w-20" /> {/* section label */}
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      ))}
    </div>
  )
}
```

### Anti-Patterns to Avoid
- **Full refetch on realtime event:** D-05 says prepend, not refetch. Calling `fetchData()` on every INSERT defeats the purpose of realtime and causes flicker.
- **Toasts for realtime events:** D-02 explicitly forbids toasts/banners for incoming data. Keep toasts only for user-initiated actions (approve, escalate, etc.).
- **Subscribing without cleanup:** Every `.subscribe()` must have a corresponding `supabase.removeChannel(channel)` in the useEffect cleanup. Leaked subscriptions degrade Realtime performance.
- **Overriding Radix behavior with custom CSS:** D-08 success criterion says "no custom CSS overrides semantic Radix behavior." Let Radix handle focus management, keyboard nav, and ARIA. Style through shadcn's variant system only.
- **Mixing template literals and cn():** D-13 says adopt cn() everywhere. Do not leave some components with template literals and others with cn().

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Accessible tabs with keyboard nav | Custom tab component with manual ARIA | shadcn Tabs (Radix) | Arrow key navigation, focus management, `role="tablist"`/`role="tab"`/`role="tabpanel"` all handled |
| Accessible select dropdown | Native `<select>` or custom dropdown | shadcn Select (Radix) | Keyboard navigation, screen reader announcements, portal rendering for overflow |
| Confirmation dialog | `window.confirm()` | shadcn AlertDialog (Radix) | Focus trapping, escape key, accessible announcement, styled consistently |
| Checkbox with indeterminate state | Custom checkbox with SVG | shadcn Checkbox (Radix) | ARIA checked states, keyboard toggle, focus ring |
| Skeleton loader animation | Custom CSS keyframes | shadcn Skeleton + tw-animate-css | Consistent shimmer animation, composable sizing |
| Class name merging | Template literals | cn() (clsx + tailwind-merge) | Handles conflicting Tailwind classes, cleaner conditional logic |
| Realtime websocket management | Manual WebSocket connection | Supabase `.channel()` API | Handles reconnection, auth, multiplexing, cleanup |

**Key insight:** The entire value of shadcn/ui is that Radix handles the invisible accessibility work (focus trapping, keyboard navigation, screen reader announcements, ARIA attributes) that is extremely tedious and error-prone to build manually. The migration is worth it solely for the WCAG compliance it provides for free.

## Common Pitfalls

### Pitfall 1: Supabase Realtime Tables Not Added to Publication
**What goes wrong:** Subscriptions connect but never fire callbacks. No errors.
**Why it happens:** Supabase Realtime only broadcasts changes for tables added to the `supabase_realtime` publication. Tables are NOT added by default.
**How to avoid:** Run SQL migration before any Realtime code:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE notes;
ALTER PUBLICATION supabase_realtime ADD TABLE supply_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE handoff_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE audit_log;
```
**Warning signs:** Subscription status shows "SUBSCRIBED" but callbacks never fire.

### Pitfall 2: React 18 Strict Mode Double-Mount Killing Subscriptions
**What goes wrong:** In development, React 18 Strict Mode mounts components twice. The first mount's cleanup runs, potentially closing the subscription before the second mount re-creates it. This can cause a brief "CLOSED" state.
**Why it happens:** React 18 Strict Mode intentionally double-invokes effects to catch cleanup bugs.
**How to avoid:** Use `supabase.removeChannel(channel)` in cleanup (not `channel.unsubscribe()`) -- `removeChannel` is the official recommended cleanup method. The second mount will create a fresh channel. This is a development-only issue; production builds run effects once.
**Warning signs:** Subscription state flickers between SUBSCRIBED and CLOSED in dev console.

### Pitfall 3: shadcn CSS Variables Conflicting with Existing Design Tokens
**What goes wrong:** shadcn components render with wrong colors because shadcn expects specific CSS variable names (`--background`, `--foreground`, `--card`, etc.) that differ from the project's existing tokens.
**Why it happens:** shadcn init generates a default set of CSS variables. The project already has its own token system in globals.css using `--color-*` prefix.
**How to avoid:** Per D-09, do NOT let shadcn init overwrite globals.css. Instead, manually add shadcn variable aliases that point to existing clinical tokens. Run `shadcn init` first, then reconcile the generated CSS with the existing tokens. The existing clinical tokens stay authoritative.
**Warning signs:** Components render with different colors than expected; dark gray backgrounds where white is expected.

### Pitfall 4: Realtime Payload Type Mismatch
**What goes wrong:** `payload.new` has different field types than expected (e.g., JSONB fields come as strings, timestamps as ISO strings).
**Why it happens:** Supabase Realtime delivers the raw Postgres row as JSON. JSONB columns may already be parsed objects, but other types may differ from what the Supabase JS `select()` returns after its own parsing.
**How to avoid:** Type-assert carefully. For JSONB fields like `items` on `supply_requests`, verify `payload.new.items` is already an object (it should be from Postgres JSONB). Test with actual Realtime events, not mocked data.
**Warning signs:** Runtime errors like "Cannot read property of undefined" when rendering realtime-received data.

### Pitfall 5: Channel Name Collisions
**What goes wrong:** Two different subscription setups use the same channel name, causing one to overwrite the other.
**Why it happens:** Channel names must be unique per client. If dashboard and detail page accidentally share a name, behavior is undefined.
**How to avoid:** Use descriptive, unique channel names: `dashboard-global` for the dashboard, `patient-detail-${patientId}` for per-patient channels.
**Warning signs:** Subscriptions stop working when navigating between pages.

### Pitfall 6: shadcn Init Overwriting Project Files
**What goes wrong:** Running `shadcn init` overwrites `globals.css`, `tailwind.config`, or other project files.
**Why it happens:** The CLI generates boilerplate that may conflict with existing configuration.
**How to avoid:** Run `shadcn init` and carefully review what it wants to change. For this project, the critical file is `globals.css` -- the existing `@theme inline` block must be preserved. After init, merge shadcn's additions into the existing file rather than replacing it.
**Warning signs:** Loss of existing design tokens after running init.

### Pitfall 7: UPDATE Events Not Firing for Notes Table
**What goes wrong:** When a note's `review_status` changes (approve/escalate/override), the realtime subscription does not detect it because only INSERT is subscribed.
**Why it happens:** D-01 says subscribe to all 4 tables, but notes also receive UPDATE events when review_status changes.
**How to avoid:** Subscribe to both INSERT and UPDATE events on the `notes` table. For UPDATE events, replace the existing note in state rather than prepending.
**Warning signs:** Flag badge changes and review status updates are not reflected live.

## Code Examples

### Supabase Realtime -- Enable Publication (Migration 005)

```sql
-- Source: Supabase Realtime docs
-- Migration: 005_enable_realtime.sql
ALTER PUBLICATION supabase_realtime ADD TABLE notes;
ALTER PUBLICATION supabase_realtime ADD TABLE supply_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE handoff_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE audit_log;
```

### shadcn components.json Configuration

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

Note: `"config": ""` is correct for Tailwind v4 (no tailwind.config.js). `"rsc": false` because all pages/components use `'use client'`. `"css"` path is relative to the `src/` directory where `package.json` lives.

### NurseSwitcher Migration Example (D-10)

```typescript
// Before: native <select> + window.confirm
// After: shadcn Select + AlertDialog
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

// Select replaces native <select>, AlertDialog replaces window.confirm
// Radix handles keyboard nav, focus trapping, screen reader
```

### Handling UPDATE Events on Notes

```typescript
// Per-patient channel needs both INSERT and UPDATE for notes
.on(
  'postgres_changes',
  {
    event: 'INSERT',
    schema: 'public',
    table: 'notes',
    filter: `patient_id=eq.${patientId}`,
  },
  (payload) => {
    setNotes((prev) => [payload.new as Note, ...prev])
  }
)
.on(
  'postgres_changes',
  {
    event: 'UPDATE',
    schema: 'public',
    table: 'notes',
    filter: `patient_id=eq.${patientId}`,
  },
  (payload) => {
    const updated = payload.new as Note
    setNotes((prev) => prev.map((n) => n.id === updated.id ? updated : n))
  }
)
```

### Dashboard Global Subscription -- Also Handle Note UPDATEs for Flag Badge

```typescript
// Dashboard needs UPDATE events too -- flag badge changes when review_status updates
.on(
  'postgres_changes',
  { event: 'UPDATE', schema: 'public', table: 'notes' },
  (payload) => {
    const updated = payload.new as Note
    setLatestNotes((prev) => {
      // Only update if this is the latest note for the patient
      const current = prev[updated.patient_id]
      if (current && current.id === updated.id) {
        return { ...prev, [updated.patient_id]: updated }
      }
      return prev
    })
  }
)
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| tailwindcss-animate | tw-animate-css | shadcn/ui Tailwind v4 update (2025) | shadcn now installs tw-animate-css for v4 compatibility |
| HSL color format | OKLCH color format | shadcn Tailwind v4 update | New shadcn projects use OKLCH; existing HEX tokens in this project are fine since we remap manually |
| `forwardRef` pattern | `data-slot` + direct ref | React 19 + shadcn update | shadcn components no longer use forwardRef; works with React 19.2.3 |
| `default` shadcn style | `new-york` style only | shadcn v4 | `default` style deprecated; `new-york` is the current standard |
| `channel.unsubscribe()` | `supabase.removeChannel(channel)` | Supabase JS v2 | `removeChannel` is the recommended cleanup; fully removes the channel rather than just unsubscribing |

**Deprecated/outdated:**
- `tailwindcss-animate`: Replaced by `tw-animate-css` for Tailwind v4. shadcn init installs the correct one.
- `forwardRef` in shadcn components: React 19 eliminated the need; shadcn components use `data-slot` attribute instead.
- `default` shadcn style: Use `new-york` style.

## Open Questions

1. **Exact shadcn init behavior with existing globals.css**
   - What we know: shadcn init may want to modify or replace globals.css. The project has a well-established `@theme inline` block.
   - What's unclear: Whether `shadcn init` will merge or overwrite. Likely needs manual reconciliation.
   - Recommendation: Back up globals.css before running init. After init, manually merge shadcn's CSS variable additions into the existing file, keeping the clinical token system authoritative.

2. **Supabase Realtime with structured_note JSONB**
   - What we know: `payload.new` delivers the row as JSON. JSONB columns should arrive as parsed objects.
   - What's unclear: Whether the `structured_note` JSONB field on `notes` arrives as a parsed `StructuredNote` object or as a JSON string.
   - Recommendation: Test with an actual INSERT to the notes table and inspect `payload.new.structured_note` type. If it arrives as a string, add `JSON.parse()` in the subscription callback.

3. **Dashboard note count for enhanced patient cards (D-18)**
   - What we know: D-18 wants "active unresolved flag count" on patient cards. Current dashboard only fetches latest note per patient.
   - What's unclear: Whether to add a second query for unresolved flag count or include it in the initial data fetch.
   - Recommendation: Add a count query in the dashboard fetch: `supabase.from('notes').select('id', { count: 'exact' }).eq('patient_id', id).eq('flagged', true).in('review_status', ['pending', 'under_review'])`. This is lightweight and runs in parallel with existing queries.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build/dev server | Assumed available | (not pinned) | -- |
| npm | Package installation | Assumed available | -- | -- |
| Supabase (cloud) | Realtime subscriptions | Assumed available | -- | Realtime must be enabled in Supabase dashboard |
| npx | shadcn CLI | Assumed available | -- | -- |

**Missing dependencies with no fallback:**
- Supabase Realtime must be enabled on the project (free tier includes Realtime). Tables must be added to the `supabase_realtime` publication via SQL.

**Missing dependencies with fallback:**
- None identified. All tools are standard Node.js/npm ecosystem.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None installed -- no test infrastructure exists |
| Config file | none -- see Wave 0 |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| RT-01 | Note INSERT propagates to other tabs | manual | Open two tabs, submit note in one, observe in other | N/A |
| RT-02 | Handoff report INSERT propagates live | manual | Generate handoff in one tab, observe in other | N/A |
| RT-03 | Supply request INSERT propagates live | manual | Submit dictation with procedure, observe supply tab in other tab | N/A |
| RT-04 | Dashboard flag badges update live | manual | Submit flagged note from detail page, observe dashboard in other tab | N/A |
| UI-01 | All components use shadcn/ui primitives | manual | Visual inspection + check `src/components/ui/` directory exists with all primitives | N/A |
| UI-02 | Dashboard cards have clear visual hierarchy | manual | Visual inspection at 1280px, 1440px, 1920px widths | N/A |
| UI-03 | Patient detail has professional typography/spacing | manual | Visual inspection of three-panel layout | N/A |
| UI-06 | Skeleton loaders during AI processing | manual | Submit dictation, observe skeleton during processing state | N/A |

### Sampling Rate
- **Per task commit:** `cd src && npm run build` (type checking + build verification)
- **Per wave merge:** `cd src && npm run build && npm run lint`
- **Phase gate:** Full manual walkthrough of all 3 demo scenarios + visual inspection at desktop widths

### Wave 0 Gaps
- No test framework installed -- all validation is manual (visual inspection + multi-tab testing)
- `npm run build` serves as the automated gate (catches type errors, import issues, build failures)
- `npm run lint` catches ESLint violations
- Realtime testing is inherently manual (requires two browser tabs)

## Project Constraints (from CLAUDE.md)

- **Stack locked:** Next.js 14+ App Router, Tailwind CSS, TypeScript, Supabase, n8n, Claude API
- **Semantic tokens only:** No hardcoded hex values in components (all colors through design token layer in globals.css)
- **Named exports for components:** `export function ComponentName(...)` (not default exports, except pages)
- **All components are `'use client'`:** No server components except layout.tsx
- **No global state library:** React Context + local state only
- **cn() replaces template literals:** Per D-13, adopt cn() everywhere
- **WCAG 2.1 AA is the floor:** Non-negotiable accessibility requirement
- **Color for meaning only:** No decorative color. Clinical, white, high-contrast.
- **Desktop only:** No mobile/tablet responsive concerns
- **No semicolons, 2-space indent, single quotes in TS, double quotes in JSX**
- **Interface for object shapes, type for unions only**
- **Props destructured in function signature**
- **`@/*` path alias maps to `src/*`**

## Sources

### Primary (HIGH confidence)
- [Supabase Realtime Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes) -- subscription API, filters, channel lifecycle
- [Supabase JS removeChannel](https://supabase.com/docs/reference/javascript/removechannel) -- cleanup pattern
- [shadcn/ui Next.js Installation](https://ui.shadcn.com/docs/installation/next) -- CLI setup, components.json
- [shadcn/ui Tailwind v4](https://ui.shadcn.com/docs/tailwind-v4) -- CSS variable format, @theme inline, migration notes
- [shadcn/ui components.json](https://ui.shadcn.com/docs/components-json) -- configuration schema

### Secondary (MEDIUM confidence)
- [Supabase Realtime with Next.js Guide](https://supabase.com/docs/guides/realtime/realtime-with-nextjs) -- integration patterns (video content, limited text extraction)
- [Supabase Discussion: unsubscribe vs removeChannel](https://github.com/orgs/supabase/discussions/34457) -- cleanup method comparison

### Tertiary (LOW confidence)
- React 18 Strict Mode subscription issues -- based on community reports; development-only concern, not production-affecting

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all packages verified via npm view, versions current, shadcn/ui Tailwind v4 support confirmed in official docs
- Architecture: HIGH -- Supabase Realtime channel API is well-documented; subscription patterns are standard React useEffect lifecycle
- Pitfalls: HIGH -- publication requirement is the #1 gotcha, well-documented in Supabase docs; CSS variable conflict is specific to this project's existing token system

**Research date:** 2026-03-29
**Valid until:** 2026-04-28 (stable libraries, unlikely to change)
