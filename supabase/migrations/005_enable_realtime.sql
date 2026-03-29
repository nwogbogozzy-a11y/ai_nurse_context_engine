-- Migration 005: Enable Supabase Realtime on all 4 tables
-- Required for RT-01 through RT-04: live data propagation across browser tabs
-- IMPORTANT: This must be run in the Supabase SQL Editor by the user

ALTER PUBLICATION supabase_realtime ADD TABLE notes;
ALTER PUBLICATION supabase_realtime ADD TABLE supply_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE handoff_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE audit_log;
