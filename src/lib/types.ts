export interface Patient {
  id: string
  full_name: string
  date_of_birth: string
  admission_date: string
  ward: string
  unit_type: string
  current_status: string
  created_at: string
}

export interface StructuredNote {
  subjective: string
  history_of_present_illness?: string
  comorbidities?: string
  objective: string
  assessment: string
  interventions?: string
  plan: string
}

export interface Note {
  id: string
  patient_id: string
  raw_input: string
  structured_note: StructuredNote
  shift: string
  nurse_name: string
  flagged: boolean
  flag_reason: string
  created_at: string
  review_status: 'pending' | 'approved' | 'escalated' | 'overridden'
  reviewed_by: string | null
  reviewed_at: string | null
}

export interface SupplyItem {
  item: string
  quantity: number
  unit: string
  notes: string
}

export interface SupplyRequest {
  id: string
  patient_id: string
  procedure: string
  items: SupplyItem[]
  generated_at: string
  confirmed_by: string | null
  confirmed_items: Record<number, boolean>
  note_id: string | null
}

export interface PriorityFlag {
  type: 'warning' | 'critical'
  detail: string
}

export interface HandoffReport {
  id: string
  patient_id: string
  incoming_nurse: string
  summary: string
  flags: PriorityFlag[]
  generated_at: string
  shift_start: string
  stable_items: string[]
  recommended_first_actions: string[]
}

export interface SupplyLookupResponse {
  success: boolean
  supply_list: {
    procedure: string
    items: SupplyItem[]
  }
}

export interface WebhookResponse {
  success: boolean
  note: {
    structured_note: StructuredNote
    flagged: boolean
    flag_reason: string
    procedures: string[]
    patient_id: string
    nurse_name: string
    shift: string
  }
  supply_list?: {
    procedure: string
    items: SupplyItem[]
  }
  handoff_report?: {
    summary: string
    priority_flags: PriorityFlag[]
    stable_items: string[]
    recommended_first_actions: string[]
  }
}
