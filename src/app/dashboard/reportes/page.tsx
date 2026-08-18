import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function ReportesPage() {
  const supabase = await createClient()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  const { data: thisMonthApts } = await supabase
    .from('appointments')
    .select('amount_usd, amount_bs, currency, status')
    .gte('scheduled_at', startOfMonth.toISOString())

  const { data: lastMonthApts } = await supabase
    .from('appointments')
    .select('amount_usd, amount_bs, currency, status')
    .gte('scheduled_at', startOfLastMonth.toISOString())
    .lte('scheduled_at', endOfLastMonth.toISOString())

  const { data: allApts } = await supabase
    .from('appointments')
    .select('amount_usd, amount_bs, currency, status, session_type')

  const totalUSD = allApts?.filter(a => a.status === 'pagada' && a.currency === 'USD').reduce((s, a) => s + (a.amount_usd || 0), 0) || 0
  const thisMonthUSD = thisMonthApts?.filter(a => a.status === 'pagada' && a.currency === 'USD').reduce((s, a) => s + (a.amount_usd || 0), 0) || 0
  const lastMonthUSD = lastMonthApts?.filter(a => a.status === 'pagada' && a.currency === 'USD').reduce((s, a) => s + (a.amount_usd || 0), 0) || 0

  const sessionTypes: Record<string, number> = {}
  allApts?.forEach((a) => {
    sessionTypes[a.session_type] = (sessionTypes[a.session_type] || 0) + 1
  })

  const totalSessions = allApts?.length || 0
  const completedSessions = allApts?.filter(a => a.status === 'completada' || a.status === 'pagada').length || 0

  const stats = [
    { label: 'Ingresos totales', value: `$${totalUSD.toFixed(2)}`, sub: 'en USD', icon: '💵', color: 'text-green-600 bg-green-50' },
    { label: 'Este mes', value: `$${thisMonthUSD.toFixed(2)}`, sub: 'USD este mes', icon: '📅', color: 'text-blue-600 bg-blue-50' },
    { label: 'Mes anterior', value: `$${lastMonthUSD.toFixed(2)}`, sub: 'USD mes pasado', icon: '📊', color: 'text-purple-600 bg-purple-50' },
    { label: 'Total sesiones', value: totalSessions, sub: `${completedSessions} completadas`, icon: '👥', color: 'text-amber-600 bg-amber-50' },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="font-playfair text-2xl sm:text-3xl font-semibold text-[#4A4A4A]">Reportes</h1>
        <p className="text-sm text-[#8A8A8A] mt-1">Resumen de actividad y rendimiento financiero</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E8E4F0] shadow-sm">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${s.color} flex items-center justify-center text-lg sm:text-xl mb-2 sm:mb-3`}>{s.icon}</div>
            <p className="text-xl sm:text-2xl font-bold text-[#4A4A4A]">{s.value}</p>
            <p className="text-xs text-[#8A8A8A] mt-0.5 sm:mt-1">{s.label}</p>
            <p className="text-[11px] text-[#B39DDB] mt-0.5 font-medium">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-[#E8E4F0] p-5 sm:p-6 shadow-sm">
          <h2 className="font-medium text-[#4A4A4A] mb-4 text-base">Sesiones por tipo</h2>
          <div className="space-y-3">
            {Object.entries(sessionTypes).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAF8] border border-[#E8E4F0]/60">
                <span className="text-sm text-[#4A4A4A]">{type}</span>
                <span className="text-sm font-bold text-[#B39DDB] bg-[#E8E4F0] px-3 py-1 rounded-full">{count}</span>
              </div>
            ))}
            {Object.keys(sessionTypes).length === 0 && (
              <p className="text-sm text-[#8A8A8A] text-center py-6">No hay datos suficientes aún.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8E4F0] p-5 sm:p-6 shadow-sm">
          <h2 className="font-medium text-[#4A4A4A] mb-4 text-base">Estado de sesiones</h2>
          <div className="space-y-3">
            {[
              { label: 'Pagadas / Confirmadas', count: allApts?.filter(a => a.status === 'pagada').length || 0, color: 'bg-green-500' },
              { label: 'Completadas', count: allApts?.filter(a => a.status === 'completada').length || 0, color: 'bg-purple-500' },
              { label: 'Pendientes', count: allApts?.filter(a => a.status === 'pendiente').length || 0, color: 'bg-amber-500' },
              { label: 'Canceladas', count: allApts?.filter(a => a.status === 'cancelada').length || 0, color: 'bg-red-400' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAF8] border border-[#E8E4F0]/60">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                  <span className="text-sm text-[#4A4A4A]">{item.label}</span>
                </div>
                <span className="text-sm font-semibold text-[#4A4A4A]">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
