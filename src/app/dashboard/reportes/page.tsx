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
    .select('amount_usd, currency, status, session_type')

  const totalUSD = allApts?.filter(a => a.status === 'pagada' && a.currency === 'USD').reduce((s, a) => s + (a.amount_usd || 0), 0) || 0
  const thisMonthUSD = thisMonthApts?.filter(a => a.status === 'pagada' && a.currency === 'USD').reduce((s, a) => s + (a.amount_usd || 0), 0) || 0
  const lastMonthUSD = lastMonthApts?.filter(a => a.status === 'pagada' && a.currency === 'USD').reduce((s, a) => s + (a.amount_usd || 0), 0) || 0

  const sessionTypes: Record<string, number> = {}
  allApts?.forEach((a) => {
    sessionTypes[a.session_type] = (sessionTypes[a.session_type] || 0) + 1
  })

  const totalSessions = allApts?.length || 0
  const completedSessions = allApts?.filter(a => a.status === 'completada' || a.status === 'pagada').length || 0
  const pendingSessions = allApts?.filter(a => a.status === 'pendiente').length || 0

  const stats = [
    { label: 'Ingresos totales', value: `$${totalUSD.toFixed(2)}`, sub: 'en USD', icon: '💵', color: 'text-green-600 bg-green-50' },
    { label: 'Este mes', value: `$${thisMonthUSD.toFixed(2)}`, sub: 'USD este mes', icon: '📅', color: 'text-blue-600 bg-blue-50' },
    { label: 'Mes anterior', value: `$${lastMonthUSD.toFixed(2)}`, sub: 'USD mes pasado', icon: '📊', color: 'text-purple-600 bg-purple-50' },
    { label: 'Total sesiones', value: totalSessions, sub: `${completedSessions} completadas`, icon: '👥', color: 'text-amber-600 bg-amber-50' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-playfair text-3xl font-semibold text-[#4A4A4A]">Reportes</h1>
        <p className="text-[#8A8A8A] mt-1">Resumen de tu actividad y ganancias</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-[#E8E4F0]">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center text-xl mb-3`}>{s.icon}</div>
            <p className="text-2xl font-bold text-[#4A4A4A]">{s.value}</p>
            <p className="text-xs text-[#8A8A8A] mt-1">{s.label}</p>
            <p className="text-xs text-[#B39DDB] mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-[#E8E4F0] p-6">
          <h2 className="font-medium text-[#4A4A4A] mb-4">Sesiones por tipo</h2>
          <div className="space-y-3">
            {Object.entries(sessionTypes).map(([type, count]) => (
              <div key={type} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#4A4A4A] font-medium">{type}</span>
                    <span className="text-[#8A8A8A]">{count} sesiones</span>
                  </div>
                  <div className="h-2 bg-[#E8E4F0] rounded-full">
                    <div
                      className="h-2 bg-[#B39DDB] rounded-full transition-all"
                      style={{ width: `${(count / totalSessions) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {Object.keys(sessionTypes).length === 0 && (
              <p className="text-[#8A8A8A] text-sm text-center py-4">No hay datos aún</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8E4F0] p-6">
          <h2 className="font-medium text-[#4A4A4A] mb-4">Estado de sesiones</h2>
          <div className="space-y-3">
            {[
              { label: 'Completadas / Pagadas', count: completedSessions, color: 'bg-green-400' },
              { label: 'Pendientes de pago', count: pendingSessions, color: 'bg-amber-400' },
              { label: 'Canceladas', count: allApts?.filter(a => a.status === 'cancelada').length || 0, color: 'bg-red-300' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#4A4A4A] font-medium">{item.label}</span>
                  <span className="text-[#8A8A8A]">{item.count}</span>
                </div>
                <div className="h-2 bg-[#E8E4F0] rounded-full">
                  <div
                    className={`h-2 ${item.color} rounded-full transition-all`}
                    style={{ width: totalSessions ? `${(item.count / totalSessions) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
