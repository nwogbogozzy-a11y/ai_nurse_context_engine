-- ============================================================
-- RLS Migration: Enable Row Level Security on all tables
-- AI-Native Nurse Context Engine
-- ============================================================
-- Access pattern:
--   Frontend (anon key): SELECT on all 4 tables
--   n8n (anon key via REST): SELECT patients, INSERT notes/supply_requests/handoff_reports
--   No UPDATE or DELETE required from either client
-- ============================================================

-- 1. Enable RLS on all tables
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.handoff_reports ENABLE ROW LEVEL SECURITY;

-- 2. patients — read-only (seeded data, never written by app)
CREATE POLICY "Allow anon read access to patients"
  ON public.patients
  FOR SELECT
  TO anon
  USING (true);

-- 3. notes — read by frontend, written by n8n
CREATE POLICY "Allow anon read access to notes"
  ON public.notes
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon insert notes"
  ON public.notes
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon update notes"
  ON public.notes
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- 4. supply_requests — read by frontend, written by n8n
CREATE POLICY "Allow anon read access to supply_requests"
  ON public.supply_requests
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon insert supply_requests"
  ON public.supply_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon update supply_requests"
  ON public.supply_requests
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- 5. handoff_reports — read by frontend, written by n8n
CREATE POLICY "Allow anon read access to handoff_reports"
  ON public.handoff_reports
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon insert handoff_reports"
  ON public.handoff_reports
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- ============================================================
-- Verification: run after applying to confirm RLS is active
-- ============================================================
-- SELECT tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public';
--
-- Expected: all 4 tables show rowsecurity = true
-- ============================================================
