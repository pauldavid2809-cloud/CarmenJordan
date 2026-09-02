import DashboardSidebar from '@/components/dashboard/Sidebar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  const isExpired = profile && !profile.is_admin && (
    profile.subscription_status === 'expired' ||
    profile.subscription_status === 'suspended' ||
    (profile.subscription_status === 'trial' && new Date(profile.trial_ends_at) < new Date())
  )

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <DashboardSidebar />
      <main className="md:ml-64 p-4 sm:p-6 md:p-8 min-w-0">
        {isExpired && (
          <div className="mb-6 p-5 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⏳</span>
                <div>
                  <h3 className="font-semibold text-amber-900 text-sm">Tu periodo de evaluación de 3 días ha vencido</h3>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Para activar tu mes completo de consultas y mantener tu enlace activo, realiza tu transferencia por Pago Móvil y repórtala.
                  </p>
                </div>
              </div>
              <a
                href="https://wa.me/584120000000?text=Hola,%20acabo%20de%20hacer%20el%20Pago%20M%C3%B3vil%20de%20mi%20membres%C3%ADa%20en%20PsicoOnline"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm whitespace-nowrap self-start sm:self-auto"
              >
                Reportar Pago Móvil por WhatsApp 💬
              </a>
            </div>
          </div>
        )}
        {children}
      </main>
    </div>
  )
}