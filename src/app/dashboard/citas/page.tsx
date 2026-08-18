'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatTime, getStatusColor, getStatusLabel, generateWhatsAppLink } from '@/lib/utils'

export default function CitasPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApt, setSelectedApt] = useState<any | null>(null)
  const [meetLink, setMeetLink] = useState('')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchAppointments()
  }, [])

  async function fetchAppointments() {
    const { data } = await supabase
      .from('appointments')
      .select('*, clients(*)')
      .order('scheduled_at', { ascending: true })
    setAppointments(data || [])
    setLoading(false)
  }

  async function updateMeetLink(id: string) {
    setSaving(true)
    await supabase.from('appointments').update({ meet_link: meetLink }).eq('id', id)
    setSaving(false)
    fetchAppointments()
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('appointments').update({ status }).eq('id', id)
    fetchAppointments()
  }

  const grouped: Record<string, any[]> = {}
  appointments.forEach((apt) => {
    const date = new Date(apt.scheduled_at).toDateString()
    if (!grouped[date]) grouped[date] = []
    grouped[date].push(apt)
  })

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="font-playfair text-2xl sm:text-3xl font-semibold text-[#4A4A4A]">Citas</h1>
        <p className="text-sm text-[#8A8A8A] mt-1">{appointments.length} consultas programadas</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-[#8A8A8A]">Cargando...</div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#E8E4F0] p-8">
          <p className="text-4xl mb-3">🗓️</p>
          <p className="text-[#8A8A8A]">No hay citas registradas aún.</p>
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {Object.entries(grouped).map(([date, apts]) => (
            <div key={date}>
              <h2 className="text-xs sm:text-sm font-semibold text-[#8A8A8A] uppercase tracking-wider mb-3">
                {formatDate(new Date(date).toISOString())}
              </h2>
              <div className="space-y-3">
                {apts.map((apt) => (
                  <div
                    key={apt.id}
                    className="bg-white rounded-2xl border border-[#E8E4F0] p-4 sm:p-5 cursor-pointer hover:border-[#B39DDB] transition-all shadow-sm"
                    onClick={() => { setSelectedApt(apt); setMeetLink(apt.meet_link || '') }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="text-center w-14 flex-shrink-0 bg-[#FAFAF8] py-2 rounded-xl border border-[#E8E4F0]/60">
                          <p className="text-base sm:text-lg font-bold text-[#B39DDB]">{formatTime(apt.scheduled_at)}</p>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-[#4A4A4A] text-sm sm:text-base truncate">{apt.clients?.name}</p>
                          <p className="text-xs text-[#8A8A8A] truncate">{apt.session_type} · ${apt.amount_usd || 0} USD</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {apt.meet_link && (
                          <a
                            href={apt.meet_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1 rounded-xl text-xs font-medium hover:bg-blue-100 transition-colors flex items-center gap-1"
                          >
                            <span>📹</span> Meet
                          </a>
                        )}
                        <span className={`text-xs px-2.5 py-1 rounded-full border whitespace-nowrap ${getStatusColor(apt.status)}`}>
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

      {/* Modal detalle y gestión de cita */}
      {selectedApt && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-playfair text-2xl font-medium text-[#4A4A4A]">Detalles de la cita</h2>
              <button
                onClick={() => setSelectedApt(null)}
                className="text-[#8A8A8A] hover:text-[#4A4A4A] text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-[#FAFAF8] rounded-2xl p-4 space-y-1.5 text-sm border border-[#E8E4F0]">
                <p className="font-medium text-[#4A4A4A] text-base">{selectedApt.clients?.name}</p>
                <p className="text-[#8A8A8A]">📅 {formatDate(selectedApt.scheduled_at)} a las {formatTime(selectedApt.scheduled_at)}</p>
                <p className="text-[#8A8A8A]">💼 Modalidad: {selectedApt.session_type}</p>
                {selectedApt.clients?.phone && <p className="text-[#8A8A8A]">📱 {selectedApt.clients.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">Enlace de Google Meet</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={meetLink}
                    onChange={(e) => setMeetLink(e.target.value)}
                    placeholder="https://meet.google.com/xxx-xxxx-xxx"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#E8E4F0] focus:outline-none focus:border-[#B39DDB] text-sm bg-white"
                  />
                  <button
                    onClick={() => updateMeetLink(selectedApt.id)}
                    disabled={saving}
                    className="bg-[#B39DDB] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#9575CD] transition-colors disabled:opacity-60 shadow-sm whitespace-nowrap"
                  >
                    {saving ? '...' : 'Guardar'}
                  </button>
                </div>
                {meetLink && (
                  <a href={meetLink} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline mt-1.5 block font-medium">Abrir sala de Meet ↗</a>
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
                          ? 'bg-[#B39DDB] text-white shadow-sm'
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
                  className="flex items-center gap-2 w-full justify-center bg-green-50 text-green-700 border border-green-200 py-2.5 rounded-xl text-sm font-medium hover:bg-green-100 transition-colors shadow-sm mt-2"
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
