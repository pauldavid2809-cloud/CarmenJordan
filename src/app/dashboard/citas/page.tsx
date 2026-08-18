'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatTime, getStatusColor, getStatusLabel, generateWhatsAppLink } from '@/lib/utils'

export default function CitasPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApt, setSelectedApt] = useState<any | null>(null)
  const [meetLink, setMeetLink] = useState('')
  const [savingMeet, setSavingMeet] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchAppointments()
  }, [])

  async function fetchAppointments() {
    const { data } = await supabase
      .from('appointments')
      .select('*, clients(name, phone)')
      .order('scheduled_at', { ascending: false })
    setAppointments(data || [])
    setLoading(false)
  }

  async function saveMeetLink(aptId: string) {
    setSavingMeet(true)
    await supabase.from('appointments').update({ meet_link: meetLink }).eq('id', aptId)
    setSavingMeet(false)
    setSelectedApt(null)
    fetchAppointments()
  }

  async function updateStatus(aptId: string, status: string) {
    await supabase.from('appointments').update({ status }).eq('id', aptId)
    fetchAppointments()
  }

  const grouped: Record<string, any[]> = {}
  appointments.forEach((apt) => {
    const date = new Date(apt.scheduled_at).toDateString()
    if (!grouped[date]) grouped[date] = []
    grouped[date].push(apt)
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-playfair text-3xl font-semibold text-[#4A4A4A]">Citas</h1>
        <p className="text-[#8A8A8A] mt-1">{appointments.length} citas en total</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-[#8A8A8A]">Cargando...</div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">🗓️</p>
          <p className="text-[#8A8A8A]">No hay citas aún. Crea un link de pago para generar la primera.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([date, apts]) => (
            <div key={date}>
              <h2 className="text-sm font-semibold text-[#8A8A8A] uppercase tracking-wider mb-3">
                {formatDate(new Date(date).toISOString())}
              </h2>
              <div className="space-y-3">
                {apts.map((apt) => (
                  <div
                    key={apt.id}
                    className="bg-white rounded-2xl border border-[#E8E4F0] p-5 cursor-pointer hover:border-[#B39DDB] transition-colors"
                    onClick={() => { setSelectedApt(apt); setMeetLink(apt.meet_link || '') }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center w-16 flex-shrink-0">
                        <p className="text-xl font-bold text-[#B39DDB]">{formatTime(apt.scheduled_at)}</p>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-[#4A4A4A]">{apt.clients?.name}</p>
                        <p className="text-sm text-[#8A8A8A]">{apt.session_type} · {apt.currency === 'USD' ? `$${apt.amount_usd}` : `Bs. ${apt.amount_bs}`}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {apt.meet_link && (
                          <a
                            href={apt.meet_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-sm text-blue-500 hover:underline"
                          >
                            💻 Meet
                          </a>
                        )}
                        <span className={`text-xs px-3 py-1 rounded-full border ${getStatusColor(apt.status)}`}>
                          {getStatusLabel(apt.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal detalle cita */}
      {selectedApt && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-xl">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-playfair text-2xl font-medium text-[#4A4A4A]">{selectedApt.clients?.name}</h2>
                <p className="text-[#8A8A8A] text-sm mt-1">
                  {formatDate(selectedApt.scheduled_at)} · {formatTime(selectedApt.scheduled_at)}
                </p>
              </div>
              <button onClick={() => setSelectedApt(null)} className="text-[#8A8A8A] hover:text-[#4A4A4A] text-xl">×</button>
            </div>

            <div className="space-y-4">
              <div className="bg-[#FAFAF8] rounded-xl p-4 text-sm space-y-2">
                <div className="flex justify-between"><span className="text-[#8A8A8A]">Tipo:</span><span className="font-medium">{selectedApt.session_type}</span></div>
                <div className="flex justify-between"><span className="text-[#8A8A8A]">Monto:</span><span className="font-medium">{selectedApt.currency === 'USD' ? `$${selectedApt.amount_usd}` : `Bs. ${selectedApt.amount_bs}`}</span></div>
                <div className="flex justify-between"><span className="text-[#8A8A8A]">Estado:</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(selectedApt.status)}`}>{getStatusLabel(selectedApt.status)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4A4A4A] mb-2">💻 Link de Google Meet</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={meetLink}
                    onChange={(e) => setMeetLink(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="flex-1 px-3 py-2.5 rounded-xl border border-[#E8E4F0] focus:outline-none focus:border-[#B39DDB] text-sm"
                  />
                  <button
                    onClick={() => saveMeetLink(selectedApt.id)}
                    disabled={savingMeet}
                    className="px-4 py-2.5 bg-[#B39DDB] text-white rounded-xl text-sm hover:bg-[#9575CD] transition-colors disabled:opacity-60"
                  >
                    Guardar
                  </button>
                </div>
                {meetLink && (
                  <a href={meetLink} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline mt-1 block">Abrir Meet ↗</a>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4A4A4A] mb-2">Cambiar estado</label>
                <div className="flex gap-2 flex-wrap">
                  {['pendiente', 'pagada', 'completada', 'cancelada'].map((s) => (
                    <button
                      key={s}
                      onClick={() => { updateStatus(selectedApt.id, s); setSelectedApt({ ...selectedApt, status: s }) }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                        selectedApt.status === s
                          ? 'bg-[#B39DDB] text-white'
                          : 'bg-[#FAFAF8] border border-[#E8E4F0] text-[#8A8A8A] hover:border-[#B39DDB]'
                      }`}
                    >
                      {getStatusLabel(s)}
                    </button>
                  ))}
                </div>
              </div>

              {selectedApt.clients?.phone && (
                <a
                  href={generateWhatsAppLink(
                    selectedApt.clients.phone,
                    `Hola ${selectedApt.clients.name} 🌸 Te recuerdo tu consulta para el ${formatDate(selectedApt.scheduled_at)} a las ${formatTime(selectedApt.scheduled_at)}.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 w-full justify-center bg-green-50 text-green-600 border border-green-200 py-2.5 rounded-xl text-sm font-medium hover:bg-green-100 transition-colors"
                >
                  💬 Enviar recordatorio por WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
