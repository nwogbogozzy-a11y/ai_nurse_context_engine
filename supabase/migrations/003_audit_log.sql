-- Phase 2 Migration: Audit Log Table and Trigger
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  nurse_name TEXT NOT NULL,
  action_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read access to audit_log"
  ON public.audit_log FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon insert audit_log"
  ON public.audit_log FOR INSERT TO anon WITH CHECK (true);

-- Trigger function: fires on UPDATE only when review_status changes
CREATE OR REPLACE FUNCTION log_review_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.review_status IS DISTINCT FROM NEW.review_status THEN
    INSERT INTO public.audit_log (patient_id, nurse_name, action_type, metadata)
    VALUES (
      NEW.patient_id,
      COALESCE(NEW.reviewed_by, 'system'),
      NEW.review_status,
      jsonb_build_object(
        'note_id', NEW.id,
        'previous_status', OLD.review_status,
        'new_status', NEW.review_status,
        'flag_reason', NEW.flag_reason
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notes_review_status
  AFTER UPDATE ON public.notes
  FOR EACH ROW
  EXECUTE FUNCTION log_review_status_change();
