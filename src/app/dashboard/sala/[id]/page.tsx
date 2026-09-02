'use client'

import { useEffect, useState, useRef, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import JitsiVideoCall from '@/components/video/JitsiVideoCall'
import { formatDate, formatTime, generateWhatsAppLink } from '@/lib/utils'

interface Props {
  params: Promise<{ id: string }>
}

export default function ConsultorioVirtualPage({ params }: Props) {
  const { id: appointmentId } = use(params)
  const [appointment, setAppointment] = useState<any | null>(null)
  const [clientHistory, setClientHistory] = useState<any[]>([])
  const [token, setToken] = useState<string | null>(null)
  const [psychologistName, setPsychologistName] = useState('Psicóloga')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'notas' | 'expediente'>('notas')

  // Estado del bloc de notas de la sesión
  const [sessionNotes, setSessionNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const [savedStatus, setSavedStatus] = useState<string | null>(null)
  const [copiedPatientLink, setCopiedPatientLink] = useState(false)

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = createClient()
  const origin = typeof window !== 'undefined' ? window.location.origin : ''

  useEffect(() => {
    fetchSessionData()
  }, [appointmentId])

  async function fetchSessionData() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: prof } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()
      if (prof?.full_name) setPsychologistName(prof.full_name)
    }

    // Consulta de la cita actual
    const { data: apt } = await supabase
      .from('appointments')
      .select('*, clients(*)')
      .eq('id', appointmentId)
      .single()

    if (apt) {
      setAppointment(apt)
      setSessionNotes(apt.notes || '')

      // Buscar el payment link token de esta cita
      const { data: pLink } = await supabase
        .from('payment_links')
        .select('token')
        .eq('appointment_id', apt.id)
        .maybeSingle()

      if (pLink?.token) setToken(pLink.token)

      // Cargar historial previo de este paciente
      if (apt.client_id) {
        const { data: history } = await supabase
          .from('appointments')
          .select('id, scheduled_at, session_type, status, notes')
          .eq('client_id', apt.client_id)
          .neq('id', apt.id)
          .order('scheduled_at', { ascending: false })
          .limit(5)
        setClientHistory(history || [])
      }
    }

    setLoading(false)
  }

  // Guardado automático con debounce
  function handleNotesChange(newText: string) {
    setSessionNotes(newText)
    setSavedStatus('Guardando cambios...')

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)

    saveTimeoutRef.current = setTimeout(async () => {
      setSavingNotes(true)
      const { error } = await supabase
        .from('appointments')
        .update({ notes: newText })
        .eq('id', appointmentId)

      setSavingNotes(false)
      if (!error) {
        setSavedStatus('Guardado automáticamente ✓')
        setTimeout(() => setSavedStatus(null), 3000)
      } else {
        setSavedStatus('Error al guardar notas')
      }
    }, 1200)
  }

  async function markCompleted() {
    if (!confirm('¿Deseas marcar esta consulta como completada?')) return
    await supabase.from('appointments').update({ status: 'completada' }).eq('id', appointmentId)
    setAppointment((prev: any) => ({ ...prev, status: 'completada' }))
    alert('Consulta marcada como completada con éxito.')
  }

  function copyPatientLink() {
    if (!token) return
    const patientUrl = `${origin}/sala/${token}`
    navigator.clipboard.writeText(patientUrl)
    setCopiedPatientLink(true)
    setTimeout(() => setCopiedPatientLink(false), 2500)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center text-white">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#B39DDB]/30 border-t-[#B39DDB] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-300">Cargando consultorio virtual...</p>
        </div>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <h2 className="text-lg font-semibold text-[#4A4A4A] mb-2">Consulta no encontrada</h2>
        <Link href="/dashboard/citas" className="text-[#9575CD] underline text-sm">
          Volver a Citas
        </Link>
      </div>
    )
  }

  const roomName = token ? `psico-${token}` : `psico-apt-${appointment.id.slice(0, 8)}`
  const patient = appointment.clients

  return (
    <div className="fixed inset-0 bg-[#121212] z-50 flex flex-col text-white">
      {/* Barra superior del Consultorio */}
      <header className="h-16 bg-[#1E1E1E] border-b border-white/10 px-4 sm:px-6 flex items-center justify-between z-30 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/citas"
            className="p-2 -ml-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors flex items-center gap-1.5 text-xs font-medium"
            title="Volver a la lista de citas"
          >
            <span>←</span>
            <span className="hidden sm:inline">Citas</span>
          </Link>

          <div className="h-6 w-px bg-white/15 mx-1 hidden sm:block" />

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-playfair font-semibold text-sm sm:text-base text-white">
                {patient?.name || 'Consulta Virtual'}
              </h1>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#B39DDB]/20 text-[#D1C4E9] font-medium border border-[#B39DDB]/30">
                {appointment.session_type || 'Individual'}
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              {formatDate(appointment.scheduled_at)} · {formatTime(appointment.scheduled_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {token && (
            <button
              onClick={copyPatientLink}
              className="bg-white/10 hover:bg-white/15 text-gray-200 text-xs px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 border border-white/10"
              title="Copiar el enlace de la videollamada para el paciente"
            >
              <span>🔗</span>
              <span className="hidden md:inline">
                {copiedPatientLink ? '¡Link copiado!' : 'Copiar link del paciente'}
              </span>
            </button>
          )}

          {patient?.phone && (
            <a
              href={generateWhatsAppLink(
                patient.phone,
                `Hola ${patient.name} 🌸 Ya me encuentro en la sala de consulta virtual. Puedes ingresar aquí: ${origin}/sala/${token}`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 font-medium shadow-sm"
              title="Avisar por WhatsApp que estás en la sala"
            >
              <span>💬</span>
              <span className="hidden sm:inline">Avisar WhatsApp</span>
            </a>
          )}

          {appointment.status !== 'completada' ? (
            <button
              onClick={markCompleted}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3.5 py-2 rounded-xl font-medium transition-colors shadow-sm"
            >
              Finalizar sesión
            </button>
          ) : (
            <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-500/30 font-medium">
              ✓ Completada
            </span>
          )}
        </div>
      </header>

      {/* Cuerpo del Consultorio Integral (Split Screen) */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Lado Izquierdo: Videollamada Jitsi (65% - 70%) */}
        <div className="flex-1 lg:w-[68%] h-[50vh] lg:h-full p-2 sm:p-3 flex flex-col min-h-0 bg-black">
          <JitsiVideoCall
            roomName={roomName}
            displayName={`Lic. ${psychologistName}`}
            className="flex-1 w-full h-full"
          />
        </div>

        {/* Lado Derecho: Expediente y Bloc de Notas Clínicas (30% - 35%) */}
        <div className="w-full lg:w-[32%] flex-1 lg:h-full bg-[#1C1C1E] border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col min-h-0">
          {/* Selector de pestañas */}
          <div className="p-3 border-b border-white/10 flex items-center justify-between flex-shrink-0 bg-[#252528]">
            <div className="flex rounded-xl bg-white/10 p-1 w-full">
              <button
                onClick={() => setActiveTab('notas')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  activeTab === 'notas'
                    ? 'bg-[#B39DDB] text-white font-semibold shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                📝 Notas de la Sesión
              </button>
              <button
                onClick={() => setActiveTab('expediente')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  activeTab === 'expediente'
                    ? 'bg-[#B39DDB] text-white font-semibold shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                👤 Expediente del Paciente
              </button>
            </div>
          </div>

          {/* TAB: NOTAS CLÍNICAS */}
          {activeTab === 'notas' && (
            <div className="flex-1 flex flex-col p-4 overflow-y-auto min-h-0">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Observaciones Terapéuticas (Privadas)
                </label>
                {savedStatus && (
                  <span className="text-[11px] text-emerald-400 transition-opacity">
                    {savedStatus}
                  </span>
                )}
              </div>

              <textarea
                value={sessionNotes}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Escribe aquí las observaciones clínicas, intervenciones realizadas, acuerdos y tareas para la próxima sesión..."
                className="flex-1 w-full bg-[#28282B] border border-white/10 rounded-2xl p-3.5 text-xs sm:text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#B39DDB] resize-none leading-relaxed min-h-[160px]"
              />

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
                <span>🔒 Solo visible para ti (no visible para el paciente)</span>
                <span>{savingNotes ? 'Guardando...' : 'Autoguardado'}</span>
              </div>
            </div>
          )}

          {/* TAB: EXPEDIENTE Y ANTECEDENTES */}
          {activeTab === 'expediente' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
              <div className="bg-[#28282B] rounded-2xl p-4 border border-white/10 space-y-2">
                <p className="text-xs font-semibold text-gray-300 uppercase">Datos de Contacto</p>
                <p className="text-gray-200"><span className="text-gray-400">Nombre:</span> {patient?.name}</p>
                {patient?.phone && <p className="text-gray-200"><span className="text-gray-400">WhatsApp:</span> {patient.phone}</p>}
                {patient?.email && <p className="text-gray-200"><span className="text-gray-400">Email:</span> {patient.email}</p>}
                {patient?.notes && (
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <p className="text-[11px] text-gray-400 mb-1">Notas generales del paciente:</p>
                    <p className="text-gray-300 italic">{patient.notes}</p>
                  </div>
                )}
              </div>

              {/* Historial de sesiones previas */}
              <div className="bg-[#28282B] rounded-2xl p-4 border border-white/10">
                <p className="text-xs font-semibold text-gray-300 uppercase mb-3">
                  Sesiones Anteriores ({clientHistory.length})
                </p>

                {clientHistory.length === 0 ? (
                  <p className="text-gray-400 italic text-[11px]">No hay sesiones anteriores registradas.</p>
                ) : (
                  <div className="space-y-3">
                    {clientHistory.map((h) => (
                      <div key={h.id} className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center justify-between text-[11px] text-gray-300 font-medium mb-1">
                          <span>{formatDate(h.scheduled_at)}</span>
                          <span className="text-emerald-400 capitalize">{h.status}</span>
                        </div>
                        {h.notes ? (
                          <p className="text-gray-400 text-[11px] line-clamp-3 italic">
                            "{h.notes}"
                          </p>
                        ) : (
                          <p className="text-gray-500 text-[10px]">Sin notas registradas</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
