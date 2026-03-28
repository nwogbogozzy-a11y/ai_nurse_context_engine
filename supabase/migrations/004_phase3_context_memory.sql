-- ============================================================
-- Phase 3 Migration: Context Memory
-- AI-Native Nurse Context Engine
-- ============================================================
-- Purpose: Add patient summaries table for AI-generated rolling context
--   and rationale column on supply_requests for AI supply reasoning.
-- ============================================================

-- 1. Patient summaries table for AI-generated rolling context
CREATE TABLE public.patient_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) UNIQUE,
  summary TEXT NOT NULL,
  note_count INTEGER NOT NULL DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS policies for patient_summaries
ALTER TABLE public.patient_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon select on patient_summaries"
  ON public.patient_summaries
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon insert on patient_summaries"
  ON public.patient_summaries
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon update on patient_summaries"
  ON public.patient_summaries
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- 2. Add rationale column to supply_requests
ALTER TABLE public.supply_requests ADD COLUMN IF NOT EXISTS rationale TEXT;
