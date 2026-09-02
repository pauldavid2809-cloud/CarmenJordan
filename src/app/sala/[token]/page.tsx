import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import JitsiVideoCall from '@/components/video/JitsiVideoCall'
import { formatDate, formatTime } from '@/lib/utils'

interface Props {
  params: Promise<{ token: string }>
}

export const dynamic = 'force-dynamic'

export default async function SalaPacientePage({ params }: Props) {
  const { token } = await params
  const supabase = await createClient()

  const { data: link } = await supabase
    .from('payment_links')
    .select(`
      *,
      appointments(
        *,
        clients(*),
        psico_profiles:psychologist_id(*)
      )
    `)
    .eq('token', token)
    .single()

  if (!link) return notFound()

  const apt = link.appointments
  const client = apt?.clients
  const profile = apt?.psico_profiles || apt?.profiles

  const isVerified = link.status === 'verificado'
  const isExpired = new Date(link.expires_at) < new Date()

  // Si no está verificado aún
  if (!isVerified) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white p-8 rounded-3xl border border-[#E8E4F0] shadow-sm">
          <div className="text-4xl mb-3">⏳</div>
          <h1 className="font-playfair text-2xl font-semibold text-[#4A4A4A] mb-2">Sala no disponible aún</h1>
          <p className="text-sm text-[#8A8A8A] mb-6">
            La sala de videollamada se activa automáticamente una vez que tu terapeuta haya confirmado el pago de la consulta.
          </p>
          <Link
            href={`/pay/${token}`}
            className="inline-block bg-[#B39DDB] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#9575CD] transition-colors"
          >
            Ver estado del pago
          </Link>
        </div>
      </div>
    )
  }

  if (isExpired) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white p-8 rounded-3xl border border-[#E8E4F0] shadow-sm">
          <div className="text-4xl mb-3">⏰</div>
          <h1 className="font-playfair text-2xl font-semibold text-[#4A4A4A] mb-2">El enlace de la sala ha expirado</h1>
          <p className="text-sm text-[#8A8A8A] mb-6">
            Por favor comunícate con tu terapeuta si necesitas reprogramar la consulta.
          </p>
          <Link
            href={`/pay/${token}`}
            className="inline-block bg-[#E8E4F0] text-[#9575CD] px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#D1C4E9] transition-colors"
          >
            Volver al portal de pago
          </Link>
        </div>
      </div>
    )
  }

  const roomName = `psico-${link.token}`
  const displayName = client?.name ? `Paciente: ${client.name}` : 'Paciente'

  return (
    <div className="min-h-screen bg-[#141414] text-white flex flex-col">
      {/* Barra superior de la consulta */}
      <header className="h-16 bg-[#1F1F1F] border-b border-white/10 px-4 sm:px-6 flex items-center justify-between z-20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E8E4F0] to-[#F3F0F8] flex items-center justify-center text-base text-[#4A4A4A]">
            🌸
          </div>
          <div>
            <h1 className="font-playfair font-semibold text-sm sm:text-base leading-tight">
              Consulta con {profile?.full_name || 'tu Terapeuta'}
            </h1>
            <p className="text-xs text-gray-400">
              {apt?.scheduled_at ? `${formatDate(apt.scheduled_at)} · ${formatTime(apt.scheduled_at)}` : 'Sesión Online'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/pay/${token}`}
            className="text-xs text-gray-300 hover:text-white px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 transition-colors"
          >
            Detalles de la cita
          </Link>
        </div>
      </header>

      {/* Contenedor principal de la llamada */}
      <main className="flex-1 p-2 sm:p-4 flex flex-col min-h-0">
        <JitsiVideoCall
          roomName={roomName}
          displayName={displayName}
          className="flex-1 h-full"
        />
      </main>
    </div>
  )
}
