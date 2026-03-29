---
phase: 04-real-time-system-and-ui-overhaul
plan: 02
subsystem: database, realtime
tags: [supabase, realtime, postgres_changes, react-hooks, websocket]

# Dependency graph
requires:
  - phase: 01-functional-foundation
    provides: "Supabase tables (notes, supply_requests, handoff_reports) with RLS"
  - phase: 02-audit-and-flag-semantics
    provides: "audit_log table"
provides:
  - "SQL migration enabling realtime publication on all 4 tables"
  - "useRealtimeSubscription hook for per-patient INSERT/UPDATE subscriptions"
  - "useDashboardRealtime hook for global note INSERT/UPDATE subscriptions"
affects: [04-05-PLAN, 04-06-PLAN]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Supabase postgres_changes channel with per-patient filter", "removeChannel cleanup in useEffect return"]

key-files:
  created:
    - supabase/migrations/005_enable_realtime.sql
    - src/hooks/useRealtimeSubscription.ts
    - src/hooks/useDashboardRealtime.ts
  modified: []

key-decisions:
  - "Callbacks excluded from useEffect deps to prevent channel reconnection on every render"
  - "Channel names use unique prefixes (patient-detail-{id}, dashboard-global) to avoid collisions"

patterns-established:
  - "Realtime hook pattern: subscribe in useEffect, removeChannel in cleanup, patientId as sole dep"
  - "Dashboard hook uses empty deps array for single global subscription"

requirements-completed: [RT-01, RT-02, RT-03, RT-04]

# Metrics
duration: 1min
completed: 2026-03-29
---

# Phase 04 Plan 02: Supabase Realtime Infrastructure Summary

**Supabase Realtime publication migration for 4 tables plus two React hooks for per-patient and dashboard-level live subscriptions**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-29T21:13:22Z
- **Completed:** 2026-03-29T21:14:15Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- SQL migration enabling realtime on notes, supply_requests, handoff_reports, and audit_log tables
- Per-patient hook subscribing to INSERT on all 4 tables and UPDATE on notes (for review_status changes)
- Dashboard hook subscribing to global note INSERT and UPDATE events for flag badge live updates
- Both hooks use supabase.removeChannel() for proper cleanup on unmount/navigation

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Supabase Realtime migration** - `be1c660` (feat)
2. **Task 2: Create per-patient and dashboard realtime hooks** - `b45f2fe` (feat)

## Files Created/Modified
- `supabase/migrations/005_enable_realtime.sql` - Adds all 4 tables to supabase_realtime publication
- `src/hooks/useRealtimeSubscription.ts` - Per-patient subscription hook (4 tables, INSERT+UPDATE on notes)
- `src/hooks/useDashboardRealtime.ts` - Dashboard global subscription hook (notes INSERT+UPDATE)

## Decisions Made
- Callbacks intentionally excluded from useEffect dependency arrays to prevent channel reconnection on every render; callers should use useCallback or refs
- Channel names use unique prefixes (patient-detail-{id}, dashboard-global) to avoid Supabase channel name collisions

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
**Migration 005 must be applied manually.** Run `supabase/migrations/005_enable_realtime.sql` in the Supabase SQL Editor before realtime subscriptions will receive events.

## Next Phase Readiness
- Hooks ready to be wired into patient detail page (Plan 05) and dashboard page (Plan 06)
- Migration must be applied by user before realtime events propagate

## Self-Check: PASSED

---
*Phase: 04-real-time-system-and-ui-overhaul*
*Completed: 2026-03-29*
