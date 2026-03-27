-- ============================================================
-- Phase 1 Migration: Persistence Foundation
-- AI-Native Nurse Context Engine
-- ============================================================
-- Run this migration in the Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ============================================================
-- Purpose: Add columns and policies required for Phase 1 functional foundation.
--   - Nurse action persistence (review_status, reviewed_by, reviewed_at on notes)
--   - Supply confirmation tracking (confirmed_items, note_id on supply_requests)
--   - Handoff report field persistence (stable_items, recommended_first_actions)
--   - UPDATE RLS policies for frontend writes to notes and supply_requests
-- ============================================================

-- 1. Add review columns to notes table (D-06, D-07)
ALTER TABLE public.notes
  ADD COLUMN review_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN reviewed_by TEXT,
  ADD COLUMN reviewed_at TIMESTAMPTZ;

-- 2. Add confirmation tracking and note linkage to supply_requests (D-10, D-18)
ALTER TABLE public.supply_requests
  ADD COLUMN confirmed_items JSONB DEFAULT '{}',
  ADD COLUMN note_id UUID REFERENCES public.notes(id);

-- 3. Add missing fields to handoff_reports (D-19)
ALTER TABLE public.handoff_reports
  ADD COLUMN stable_items JSONB DEFAULT '[]',
  ADD COLUMN recommended_first_actions JSONB DEFAULT '[]';

-- 4. Add UPDATE RLS policies (D-09, D-11)
CREATE POLICY "Allow anon update review status on notes"
  ON public.notes
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon update confirmed_items on supply_requests"
  ON public.supply_requests
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- Verification: run after applying to confirm new columns exist
-- ============================================================
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
--   AND table_name = 'notes'
--   AND column_name IN ('review_status', 'reviewed_by', 'reviewed_at');
--
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
--   AND table_name = 'supply_requests'
--   AND column_name IN ('confirmed_items', 'note_id');
--
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
--   AND table_name = 'handoff_reports'
--   AND column_name IN ('stable_items', 'recommended_first_actions');
--
-- Expected: all columns present with correct types and defaults
-- ============================================================
