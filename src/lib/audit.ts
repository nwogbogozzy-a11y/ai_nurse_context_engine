import { supabase } from '@/lib/supabase'

interface AuditInsertParams {
  patientId: string
  nurseName: string
  actionType: string
  metadata: Record<string, unknown>
}

export async function insertAuditEntry({
  patientId,
  nurseName,
  actionType,
  metadata,
}: AuditInsertParams): Promise<void> {
  const { error } = await supabase
    .from('audit_log')
    .insert({
      patient_id: patientId,
      nurse_name: nurseName,
      action_type: actionType,
      metadata,
    })

  if (error) {
    console.error('Audit log insert failed:', error)
  }
}
