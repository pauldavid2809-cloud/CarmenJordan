'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Client } from '@/types'
import { formatDate, formatTime, generateWhatsAppLink } from '@/lib/utils'

interface PaymentLinkWithDetails {
  id: string
  token: string
  status: string
  payment_method: string
  expires_at: string
  created_at: string
  appointments: {
    scheduled_at: string
    session_type: string
    amount_usd: number
    amount_bs: number
    currency: string
    clients: {
      name: string
      phone: string
    }
  }
  payment_proofs: Array<{
    id: string
    file_url: string
    payment_method_used: string
    reference_number: string
    client_name: string
    client_phone: string
    submitted_at: string
    rejection_reason: string
  }>
}

export default function CobrosPage() {
  const [links, setLinks] = useState<PaymentLinkWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState<Client[]>([])
  const [showNewModal, setShowNewModal] = useState(false)
  const [showProofModal, setShowProofModal] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('todos')
  const [form, setForm] = useState({
    client_id: '',
    scheduled_at: '',
    session_type: 'Individual',
    amount_usd: '',
    currency: 'USD',
    payment_method: 'pago_movil',
  })
  const [saving, setSaving] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectInput, setShowRejectInput] = useState<string | null>(null)
  const supabase = createClient()
  const appUrl = typeof window !== 'undefined' ? window.location.origin : ''

  useEffect(() => {
    fetchLinks()
    fetchClients()
  }, [])

  async function fetchLinks() {
    const { data } = await supabase
      .from('payment_links')
      .select(`
        *,
        appointments(*,clients(*)),
        payment_proofs(*)
      `)
      .order('created_at', { ascending: false })
    setLinks((data as any) || [])
    setLoading(false)
  }

  async function fetchClients() {
    const { data } = await supabase.from('clients').select('*').order('name')
    setClients(data || [])
  }

  async function createPaymentLink(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { data: apt } = await supabase
      .from('appointments')
      .insert({
        client_id: form.client_id,
        scheduled_at: form.scheduled_at,
        session_type: form.session_type,
        amount_usd: form.currency === 'USD' ? parseFloat(form.amount_usd) : null,
        currency: form.currency,
        status: 'pendiente',
      })
      .select()
      .single()

    if (apt) {
      const { data: link } = await supabase
        .from('payment_links')
        .insert({
          appointment_id: apt.id,
          payment_method: form.payment_method,
        })
        .select()
        .single()

      if (link) {
        const client = clients.find(c => c.id === form.client_id)
        const payUrl = `${appUrl}/pay/${link.token}`
        if (client?.phone) {
          const msg = `Hola ${client.name} 🌸 Aquí está tu link de pago para tu consulta del ${new Date(form.scheduled_at).toLocaleDateString('es-VE')}: ${payUrl}`
          window.open(generateWhatsAppLink(client.phone, msg), '_blank')
        } else {
          await navigator.clipboard.writeText(payUrl)
          alert(`Link creado y copiado: ${payUrl}`)
        }
      }
    }

    setShowNewModal(false)
    setForm({ client_id: '', scheduled_at: '', session_type: 'Individual', amount_usd: '', currency: 'USD', payment_method: 'pago_movil' })
    setSaving(false)
    fetchLinks()
  }

  async function verifyPayment(linkId: string, proofId: string) {
    await supabase.from('payment_proofs').update({ reviewed_at: new Date().toISOString() }).eq('id', proofId)
    await supabase.from('payment_links').update({ status: 'verificado' }).eq('id', linkId)
    const link = links.find(l => l.id === linkId)
    await supabase.from('appointments').update({ status: 'pagada' }).eq('id', link?.appointments ? (link.appointments as any).id : '')
    fetchLinks()
  }

  async function rejectPayment(linkId: string, proofId: string) {
    await supabase.from('payment_proofs').update({
      reviewed_at: new Date().toISOString(),
      rejection_reason: rejectReason,
    }).eq('id', proofId)
    await supabase.from('payment_links').update({ status: 'rechazado' }).eq('id', linkId)
    setShowRejectInput(null)
    setRejectReason('')
    fetchLinks()
  }

  function copyLink(token: string) {
    navigator.clipboard.writeText(`${appUrl}/pay/${token}`)
    alert('Link copiado al portapapeles')
  }

  function sendWhatsApp(link: PaymentLinkWithDetails) {
    const client = link.appointments?.clients
    if (!client?.phone) return alert('El cliente no tiene teléfono registrado')
    const payUrl = `${appUrl}/pay/${link.token}`
    const msg = `Hola ${client.name} 🌸 Aquí está tu link de pago para tu consulta del ${formatDate(link.appointments.scheduled_at)}: ${payUrl}`
    window.open(generateWhatsAppLink(client.phone, msg), '_blank')
  }

  const statusLabels: Record<string, string> = {
    todos: 'Todos',
    pendiente: 'Pendiente',
    subido: 'Con comprobante',
    verificado: 'Verificado',
    rechazado: 'Rechazado',
  }

  const statusColors: Record<string, string> = {
    pendiente: 'bg-amber-50 text-amber-700 border-amber-200',
    subido: 'bg-blue-50 text-blue-700 border-blue-200 font-semibold',
    verificado: 'bg-green-50 text-green-700 border-green-200',
    rechazado: 'bg-red-50 text-red-700 border-red-200',
  }

  const filtered = filter === 'todos' ? links : links.filter(l => l.status === filter)
  const pendingCount = links.filter(l => l.status === 'subido').length

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="font-playfair text-2xl sm:text-3xl font-semibold text-[#4A4A4A] flex items-center gap-2">
            <span>Cobros</span>
            {pendingCount > 0 && (
              <span className="bg-amber-400 text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
                {pendingCount} por verificar
              </span>
            )}
          </h1>
          <p className="text-sm text-[#8A8A8A] mt-1">Gestión de pagos y comprobantes</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="bg-[#B39DDB] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#9575CD] transition-colors shadow-sm self-start sm:self-auto"
        >
          💳 Nuevo link de pago
        </button>
      </div>

      {/* Filtros horizontales responsivos */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
        {Object.entries(statusLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
              filter === key
                ? 'bg-[#B39DDB] text-white shadow-sm'
                : 'bg-white border border-[#E8E4F0] text-[#8A8A8A] hover:border-[#B39DDB]'
            }`}
          >
            {label}
            {key === 'subido' && pendingCount > 0 && (
              <span className="ml-1.5 bg-amber-400 text-white text-xs px-1.5 py-0.2 rounded-full font-bold">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-[#8A8A8A]">Cargando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#E8E4F0] p-8">
          <p className="text-4xl mb-3">💳</p>
          <p className="text-[#8A8A8A]">No hay cobros en esta categoría.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((link) => {
            const proof = link.payment_proofs?.[0]
            const apt = link.appointments as any
            return (
              <div key={link.id} className="bg-white rounded-2xl border border-[#E8E4F0] p-4 sm:p-5 shadow-sm hover:border-[#B39DDB] transition-all">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <p className="font-medium text-[#4A4A4A] text-base">{apt?.clients?.name}</p>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border ${statusColors[link.status] || ''}`}>
                        {statusLabels[link.status] || link.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm text-[#8A8A8A]">
                      <span>📅 {apt?.scheduled_at ? formatDate(apt.scheduled_at) : '-'}</span>
                      <span>🕐 {apt?.scheduled_at ? formatTime(apt.scheduled_at) : '-'}</span>
                      <span>💼 {apt?.session_type}</span>
                      {apt?.amount_usd && <span className="font-semibold text-[#4A4A4A]">${apt.amount_usd} USD</span>}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E8E4F0]">
                    <button
                      onClick={() => copyLink(link.token)}
                      className="px-3 py-1.5 rounded-xl border border-[#E8E4F0] text-xs text-[#8A8A8A] hover:border-[#B39DDB] hover:text-[#4A4A4A] transition-colors"
                      title="Copiar link"
                    >
                      🔗 Copiar
                    </button>
                    {apt?.clients?.phone && (
                      <button
                        onClick={() => sendWhatsApp(link)}
                        className="px-3 py-1.5 rounded-xl bg-green-50 text-green-700 border border-green-200 text-xs font-medium hover:bg-green-100 transition-colors flex items-center gap-1"
                      >
                        💬 WhatsApp
                      </button>
                    )}
                  </div>
                </div>

                {/* Comprobante subido */}
                {proof && (
                  <div className="mt-4 pt-4 border-t border-[#E8E4F0]">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 rounded-xl bg-[#FAFAF8] border border-[#E8E4F0]">
                      <button
                        onClick={() => setShowProofModal(proof.file_url)}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#E8E4F0] overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity relative border border-[#E8E4F0]"
                      >
                        <img
                          src={proof.file_url}
                          alt="Comprobante"
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = '' }}
                        />
                      </button>
                      <div className="flex-1 text-xs sm:text-sm text-[#8A8A8A] space-y-1">
                        <p><strong className="text-[#4A4A4A]">Método:</strong> Pago Móvil</p>
                        {proof.client_name && <p><strong className="text-[#4A4A4A]">Titular:</strong> {proof.client_name}</p>}
                        {proof.client_phone && <p><strong className="text-[#4A4A4A]">Teléfono:</strong> {proof.client_phone}</p>}
                        <p className="text-[11px] text-[#8A8A8A]">Enviado: {new Date(proof.submitted_at).toLocaleDateString('es-VE')}</p>
                      </div>
                      {link.status === 'subido' && (
                        <div className="flex flex-col gap-2 w-full sm:w-auto pt-2 sm:pt-0">
                          <button
                            onClick={() => verifyPayment(link.id, proof.id)}
                            className="w-full sm:w-auto bg-green-500 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-medium hover:bg-green-600 transition-colors shadow-sm"
                          >
                            ✅ Verificar pago
                          </button>
                          {showRejectInput === link.id ? (
                            <div className="flex flex-col gap-1.5">
                              <input
                                type="text"
                                placeholder="Motivo de rechazo..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="px-3 py-1.5 rounded-lg border border-red-200 text-xs bg-white"
                              />
                              <button
                                onClick={() => rejectPayment(link.id, proof.id)}
                                className="bg-red-500 text-white px-4 py-1.5 rounded-xl text-xs hover:bg-red-600 transition-colors font-medium"
                              >
                                Confirmar rechazo
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setShowRejectInput(link.id)}
                              className="text-red-500 text-xs hover:underline py-1"
                            >
                              Rechazar comprobante
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal nuevo link */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-playfair text-2xl font-medium text-[#4A4A4A]">Nuevo link de cobro</h2>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-[#8A8A8A] hover:text-[#4A4A4A] text-lg p-1"
              >
                ✕
              </button>
            </div>
            <form onSubmit={createPaymentLink} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">Paciente *</label>
                <select
                  required
                  value={form.client_id}
                  onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E4F0] focus:outline-none focus:border-[#B39DDB] text-sm bg-white"
                >
                  <option value="">Selecciona un paciente</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">Fecha y hora de consulta *</label>
                <input
                  type="datetime-local"
                  required
                  value={form.scheduled_at}
                  onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E4F0] focus:outline-none focus:border-[#B39DDB] text-sm bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">Tipo de consulta</label>
                <select
                  value={form.session_type}
                  onChange={(e) => setForm({ ...form, session_type: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E4F0] focus:outline-none focus:border-[#B39DDB] text-sm bg-white"
                >
                  <option>Individual</option>
                  <option>Pareja</option>
                  <option>Familia</option>
                  <option>Primera consulta</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">Monto en USD</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={form.amount_usd}
                  onChange={(e) => setForm({ ...form, amount_usd: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E4F0] focus:outline-none focus:border-[#B39DDB] text-sm bg-white"
                  placeholder="Ej: 30.00"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowNewModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E8E4F0] text-[#8A8A8A] text-sm hover:bg-[#FAFAF8] transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-[#B39DDB] text-white text-sm font-medium hover:bg-[#9575CD] transition-colors disabled:opacity-60 shadow-sm">
                  {saving ? 'Creando...' : 'Crear y enviar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal vista comprobante */}
      {showProofModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowProofModal(null)}>
          <div className="max-w-2xl w-full bg-white rounded-3xl p-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3 px-2">
              <h3 className="font-medium text-[#4A4A4A]">Captura del comprobante</h3>
              <button onClick={() => setShowProofModal(null)} className="text-[#8A8A8A] hover:text-[#4A4A4A] text-xl">✕</button>
            </div>
            <div className="max-h-[80vh] overflow-auto rounded-2xl bg-[#FAFAF8] flex items-center justify-center">
              <img src={showProofModal} alt="Comprobante completo" className="max-w-full max-h-[75vh] object-contain rounded-xl" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
