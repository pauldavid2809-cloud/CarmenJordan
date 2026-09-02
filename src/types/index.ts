export interface SpecialtyItem {
  icon: string
  title: string
  desc: string
}

export interface Profile {
  id: string
  slug: string
  full_name: string
  title: string
  bio?: string
  specialties?: SpecialtyItem[]
  whatsapp_phone: string
  rates_info?: string
  pago_movil_banco?: string
  pago_movil_cedula?: string
  pago_movil_telefono?: string
  zelle_email?: string
  zelle_holder?: string
  subscription_status: 'trial' | 'active' | 'expired' | 'suspended'
  trial_ends_at: string
  subscription_ends_at?: string
  is_admin: boolean
  created_at: string
  updated_at?: string
}

export interface Client {
  id: string
  psychologist_id: string
  name: string
  phone?: string
  email?: string
  notes?: string
  created_at: string
}

export interface Appointment {
  id: string
  psychologist_id: string
  client_id: string
  scheduled_at: string
  duration_minutes: number
  session_type: string
  amount_usd?: number
  amount_bs?: number
  currency: 'USD' | 'BS'
  meet_link?: string
  status: 'pendiente' | 'pagada' | 'completada' | 'cancelada'
  notes?: string
  created_at: string
  clients?: Client
  profiles?: Profile
}

export interface PaymentLink {
  id: string
  appointment_id: string
  token: string
  payment_method: 'pago_movil' | 'zelle' | 'ambos'
  status: 'pendiente' | 'subido' | 'verificado' | 'rechazado'
  expires_at: string
  created_at: string
  appointments?: Appointment
}

export interface PaymentProof {
  id: string
  payment_link_id: string
  file_url: string
  file_name?: string
  payment_method_used: 'pago_movil' | 'zelle'
  client_name?: string
  client_phone?: string
  reference_number?: string
  submitted_at: string
  reviewed_at?: string
  rejection_reason?: string
}

export interface PaymentLinkFull {
  id: string
  token: string
  status: 'pendiente' | 'subido' | 'verificado' | 'rechazado'
  payment_method: 'pago_movil' | 'zelle' | 'ambos'
  expires_at: string
  created_at: string
  appointment_id?: string
  psychologist_id?: string
  scheduled_at: string
  session_type: string
  amount_usd?: number
  amount_bs?: number
  currency: 'USD' | 'BS'
  meet_link?: string
  appointment_status: string
  client_id?: string
  client_name: string
  client_phone?: string
  client_email?: string
  psychologist_name?: string
  psychologist_slug?: string
  pago_movil_banco?: string
  pago_movil_cedula?: string
  pago_movil_telefono?: string
  zelle_email?: string
  zelle_holder?: string
  file_url?: string
  payment_method_used?: string
  reference_number?: string
  submitted_at?: string
  rejection_reason?: string
}
