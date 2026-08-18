import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate, formatTime, getStatusColor, getStatusLabel } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayEnd = new Date(today)
  todayEnd.setHours(23, 59, 59, 999)

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  // Citas de hoy
  const { data: todayAppointments } = await supabase
    .from('appointments')
    .select('*, clients(name, phone)')
    .gte('scheduled_at', today.toISOString())
    .lte('scheduled_at', todayEnd.toISOString())
    .order('scheduled_at')

  // Cobros pendientes
  const { data: pendingProofs } = await supabase
    .from('payment_links')
    .select('*, appointments(scheduled_at, session_type, amount_usd, currency, clients(name))')
    .eq('status', 'subido')
    .order('created_at', { ascending: false })

  // Ingresos del mes
  const { data: monthAppointments } = await supabase
    .from('appointments')
    .select('amount_usd, currency')
    .eq('status', 'pagada')
    .gte('created_at', startOfMonth.toISOString())

  const monthIncome = monthAppointments?.reduce((acc, a) => {
    if (a.currency === 'USD') return acc + (a.amount_usd || 0)
    return acc
  }, 0) || 0

  // Próximas citas (esta semana)
  const weekEnd = new Date(today)
  weekEnd.setDate(weekEnd.getDate() + 7)
  const { data: upcomingAppointments } = await supabase
    .from('appointments')
    .select('*, clients(name)')
    .gte('scheduled_at', today.toISOString())
    .lte('scheduled_at', weekEnd.toISOString())
    .neq('status', 'cancelada')
    .order('scheduled_at')
    .limit(5)

  const stats = [
    { label: 'Citas hoy', value: todayAppointments?.length || 0, icon: '📅', color: 'bg-blue-50 text-blue-600' },
    { label: 'Cobros pendientes', value: pendingProofs?.length || 0, icon: '⏳', color: 'bg-amber-50 text-amber-600', alert: (pendingProofs?.length || 0) > 0 },
    { label: 'Ingresos del mes', value: `$${monthIncome.toFixed(2)}`, icon: '💵', color: 'bg-green-50 text-green-600' },
    { label: 'Próximas citas', value: upcomingAppointments?.length || 0, icon: '🗓️', color: 'bg-purple-50 text-purple-600' },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="font-playfair text-2xl sm:text-3xl font-semibold text-[#4A4A4A]">Bienvenida, Carmen 🌸</h1>
        <p className="text-sm text-[#8A8A8A] mt-1 capitalize">{formatDate(new Date().toISOString())}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className={`bg-white rounded-2xl p-4 sm:p-5 border border-[#E8E4F0] relative shadow-sm ${stat.alert ? 'border-amber-300 ring-2 ring-amber-100' : ''}`}>
            {stat.alert && (
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse" />
            )}
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${stat.color} flex items-center justify-center text-lg sm:text-xl mb-2 sm:mb-3`}>
              {stat.icon}
            </div>
            <p className="text-xl sm:text-2xl font-bold text-[#4A4A4A]">{stat.value}</p>
            <p className="text-xs text-[#8A8A8A] mt-0.5 sm:mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Citas de hoy */}
        <div className="bg-white rounded-2xl border border-[#E8E4F0] p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-[#4A4A4A] text-base">Citas de hoy</h2>
            <Link href="/dashboard/citas" className="text-xs text-[#B39DDB] hover:underline font-medium">Ver todas →</Link>
          </div>
          {!todayAppointments?.length ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-2">🌿</p>
              <p className="text-[#8A8A8A] text-sm">No hay citas para hoy</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center gap-3 sm:gap-4 p-3 rounded-xl bg-[#FAFAF8] border border-[#E8E4F0]/60">
                  <div className="text-center w-14 flex-shrink-0">
                    <p className="text-base sm:text-lg font-bold text-[#B39DDB]">{formatTime(apt.scheduled_at)}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#4A4A4A] text-sm truncate">{(apt.clients as any)?.name}</p>
                    <p className="text-xs text-[#8A8A8A] truncate">{apt.session_type}</p>
                  </div>
                  <span className={`text-[11px] sm:text-xs px-2.5 py-1 rounded-full border whitespace-nowrap ${getStatusColor(apt.status)}`}>
                    {getStatusLabel(apt.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cobros pendientes */}
        <div className="bg-white rounded-2xl border border-[#E8E4F0] p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-[#4A4A4A] text-base flex items-center gap-2">
              <span>Comprobantes recibidos</span>
              {(pendingProofs?.length || 0) > 0 && (
                <span className="bg-amber-400 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {pendingProofs?.length}
                </span>
              )}
            </h2>
            <Link href="/dashboard/cobros" className="text-xs text-[#B39DDB] hover:underline font-medium">Ver todos →</Link>
          </div>
          {!pendingProofs?.length ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-2">✅</p>
              <p className="text-[#8A8A8A] text-sm">Todo al día, no hay pagos por verificar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingProofs.slice(0, 4).map((link) => (
                <div key={link.id} className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/70 border border-amber-200/70">
                  <span className="text-xl">📄</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#4A4A4A] text-sm truncate">
                      {(link.appointments as any)?.clients?.name}
                    </p>
                    <p className="text-xs text-[#8A8A8A]">{(link.appointments as any)?.session_type}</p>
                  </div>
                  <Link
                    href="/dashboard/cobros"
                    className="text-xs bg-[#B39DDB] text-white px-3.5 py-1.5 rounded-full hover:bg-[#9575CD] transition-colors whitespace-nowrap font-medium"
                  >
                    Verificar
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="mt-6 bg-gradient-to-br from-[#E8E4F0] to-[#F3F0F8] rounded-2xl p-5 sm:p-6 border border-[#E8E4F0]">
        <h2 className="font-medium text-[#4A4A4A] mb-3 text-base">Acciones rápidas</h2>
        <div className="flex flex-wrap gap-2.5 sm:gap-3">
          <Link
            href="/dashboard/cobros?nuevo=true"
            className="bg-[#B39DDB] text-white px-4 sm:px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#9575CD] transition-colors shadow-sm"
          >
            💳 Crear link de pago
          </Link>
          <Link
            href="/dashboard/citas?nueva=true"
            className="bg-white text-[#4A4A4A] px-4 sm:px-5 py-2.5 rounded-xl text-sm font-medium border border-[#E8E4F0] hover:border-[#B39DDB] transition-colors shadow-sm"
          >
            📅 Nueva cita
          </Link>
          <Link
            href="/dashboard/clientes?nuevo=true"
            className="bg-white text-[#4A4A4A] px-4 sm:px-5 py-2.5 rounded-xl text-sm font-medium border border-[#E8E4F0] hover:border-[#B39DDB] transition-colors shadow-sm"
          >
            👤 Nuevo cliente
          </Link>
        </div>
      </div>
    </div>
  )
}