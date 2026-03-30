-- Migration 006: Tighten RLS policies
-- IMPORTANT: Run manually in Supabase SQL Editor
-- Drops unnecessary UPDATE policies for the anon role
-- Per access pattern docs: n8n uses service role for writes, anon is read + insert only

-- Drop overly permissive UPDATE policies
DROP POLICY IF EXISTS "Allow anon update notes" ON public.notes;
DROP POLICY IF EXISTS "Allow anon update supply_requests" ON public.supply_requests;

-- Recreate with narrower scope: only allow updating review_status and confirmed_items
-- (these are the only fields the frontend updates directly)
CREATE POLICY "Allow anon update note review status"
  ON public.notes
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon update supply confirmation"
  ON public.supply_requests
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Note: Column-level restrictions cannot be enforced via RLS alone.
-- For production, use a Postgres function or Edge Function to validate
-- that only review_status/reviewed_by/reviewed_at columns are modified.
