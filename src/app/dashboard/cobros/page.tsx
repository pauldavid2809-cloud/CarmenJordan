'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Client, Appointment } from '@/types'
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
    payment_method: 'ambos',
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
          const msg = `Hola ${client.name} 🌸 Aqui esta tu link de pago para tu consulta del ${new Date(form.scheduled_at).toLocaleDateString('es-VE')}: ${payUrl}`
          window.open(generateWhatsAppLink(client.phone, msg), '_blank')
        } else {
          await navigator.clipboard.writeText(payUrl)
          alert(`Link creado y copiado: ${payUrl}`)
        }
      }
    }

    setShowNewModal(false)
    setForm({ client_id: '', scheduled_at: '', session_type: 'Individual', amount_usd: '', currency: 'USD', payment_method: 'ambos' })
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
    const msg = `Hola ${client.name} 🌸 Aqui esta tu link de pago para tu consulta del ${formatDate(link.appointments.scheduled_at)}: ${payUrl}`
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
    subido: 'bg-blue-50 text-blue-700 border-blue-200',
    verificado: 'bg-green-50 text-green-700 border-green-200',
    rechazado: 'bg-red-50 text-red-700 border-red-200',
  }

  const filtered = filter === 'todos' ? links : links.filter(l => l.status === filter)
  const pendingCount = links.filter(l => l.status === 'subido').length

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-playfair text-3xl font-semibold text-[#4A4A4A]">
            Cobros
            {pendingCount > 0 && (
              <span className="ml-3 bg-amber-400 text-white text-sm px-3 py-0.5 rounded-full">
                {pendingCount} por verificar
              </span>
            )}
          </h1>
          <p className="text-[#8A8A8A] mt-1">Gestión de pagos y comprobantes</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="bg-[#B39DDB] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#9575CD] transition-colors"
        >
          💳 Nuevo link de pago
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {Object.entries(statusLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === key
                ? 'bg-[#B39DDB] text-white'
                : 'bg-white border border-[#E8E4F0] text-[#8A8A8A] hover:border-[#B39DDB]'
            }`}
          >
            {label}
            {key === 'subido' && pendingCount > 0 && (
              <span className="ml-1.5 bg-amber-400 text-white text-xs px-1.5 rounded-full">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-[#8A8A8A]">Cargando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">💳</p>
          <p className="text-[#8A8A8A]">No hay cobros en esta categoría</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((link) => {
            const proof = link.payment_proofs?.[0]
            const apt = link.appointments as any
            return (
              <div key={link.id} className="bg-white rounded-2xl border border-[#E8E4F0] p-5">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-medium text-[#4A4A4A]">{apt?.clients?.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[link.status] || ''}`}>
                        {statusLabels[link.status] || link.status}
                      </span>
                    </div>
                    <div className="text-sm text-[#8A8A8A] space-y-1">
                      <p>📅 {apt?.scheduled_at ? formatDate(apt.scheduled_at) + ' a las ' + formatTime(apt.scheduled_at) : '-'}</p>
                      <p>💼 {apt?.session_type} · {apt?.currency === 'USD' ? `$${apt?.amount_usd} USD` : `Bs. ${apt?.amount_bs}`}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyLink(link.token)}
                      title="Copiar link"
                      className="p-2 text-[#8A8A8A] hover:bg-[#E8E4F0] rounded-xl transition-colors text-lg"
                    >
                      🔗
                    </button>
                    <button
                      onClick={() => sendWhatsApp(link)}
                      title="Enviar por WhatsApp"
                      className="p-2 text-green-500 hover:bg-green-50 rounded-xl transition-colors text-lg"
                    >
                      💬
                    </button>
                  </div>
                </div>

                {/* Comprobante */}
                {proof && (
                  <div className="mt-4 border-t border-[#E8E4F0] pt-4">
                    <p className="text-sm font-medium text-[#4A4A4A] mb-3">📄 Comprobante recibido</p>
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => setShowProofModal(proof.file_url)}
                        className="w-20 h-20 rounded-xl bg-[#E8E4F0] overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity"
                      >
                        <img
                          src={proof.file_url}
                          alt="Comprobante"
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = '' }}
                        />
                      </button>
                      <div className="flex-1 text-sm text-[#8A8A8A] space-y-1">
                        <p><strong className="text-[#4A4A4A]">Método:</strong> {proof.payment_method_used === 'pago_movil' ? 'Pago Móvil' : 'Zelle'}</p>
                        {proof.reference_number && <p><strong className="text-[#4A4A4A]">Ref:</strong> {proof.reference_number}</p>}
                        {proof.client_name && <p><strong className="text-[#4A4A4A]">Nombre:</strong> {proof.client_name}</p>}
                      </div>
                      {link.status === 'subido' && (
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => verifyPayment(link.id, proof.id)}
                            className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-600 transition-colors"
                          >
                            ✅ Verificar
                          </button>
                          {showRejectInput === link.id ? (
                            <div className="flex flex-col gap-1">
                              <input
                                type="text"
                                placeholder="Motivo del rechazo"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="px-3 py-1.5 rounded-lg border border-red-200 text-sm"
                              />
                              <button
                                onClick={() => rejectPayment(link.id, proof.id)}
                                className="bg-red-500 text-white px-4 py-1.5 rounded-xl text-sm hover:bg-red-600 transition-colors"
                              >
                                Rechazar
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setShowRejectInput(link.id)}
                              className="border border-red-200 text-red-500 px-4 py-2 rounded-xl text-sm hover:bg-red-50 transition-colors"
                            >
                              ❌ Rechazar
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

      {/* Modal comprobante */}
      {showProofModal && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setShowProofModal(null)}
        >
          <img
            src={showProofModal}
            alt="Comprobante"
            className="max-w-full max-h-full rounded-2xl object-contain"
          />
        </div>
      )}

      {/* Modal nuevo link */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-xl">
            <h2 className="font-playfair text-2xl font-medium text-[#4A4A4A] mb-6">Nuevo link de pago</h2>
            <form onSubmit={createPaymentLink} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">Cliente *</label>
                <select
                  required
                  value={form.client_id}
                  onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E4F0] focus:outline-none focus:border-[#B39DDB] text-sm bg-white"
                >
                  <option value="">Seleccionar cliente...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">Fecha y hora de la consulta *</label>
                <input
                  type="datetime-local"
                  required
                  value={form.scheduled_at}
                  onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E4F0] focus:outline-none focus:border-[#B39DDB] text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">Tipo de sesión</label>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">Monto</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.amount_usd}
                    onChange={(e) => setForm({ ...form, amount_usd: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E8E4F0] focus:outline-none focus:border-[#B39DDB] text-sm"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">Moneda</label>
                  <select
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E8E4F0] focus:outline-none focus:border-[#B39DDB] text-sm bg-white"
                  >
                    <option value="USD">USD</option>
                    <option value="BS">Bs.F</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">Método de pago</label>
                <select
                  value={form.payment_method}
                  onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E4F0] focus:outline-none focus:border-[#B39DDB] text-sm bg-white"
                >
                  <option value="ambos">Pago Móvil y Zelle</option>
                  <option value="pago_movil">Solo Pago Móvil</option>
                  <option value="zelle">Solo Zelle</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowNewModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E8E4F0] text-[#8A8A8A] text-sm hover:bg-[#FAFAF8] transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-[#B39DDB] text-white text-sm font-medium hover:bg-[#9575CD] transition-colors disabled:opacity-60">
                  {saving ? 'Creando...' : 'Crear y enviar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
