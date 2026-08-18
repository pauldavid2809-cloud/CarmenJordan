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

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <DashboardSidebar />
      <main className="md:ml-64 p-4 sm:p-6 md:p-8 min-w-0">
        {children}
      </main>
    </div>
  )
}