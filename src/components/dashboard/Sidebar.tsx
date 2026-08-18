'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/dashboard', icon: '🏠', label: 'Inicio' },
  { href: '/dashboard/citas', icon: '📅', label: 'Citas' },
  { href: '/dashboard/clientes', icon: '👥', label: 'Clientes' },
  { href: '/dashboard/cobros', icon: '💳', label: 'Cobros' },
  { href: '/dashboard/reportes', icon: '📊', label: 'Reportes' },
]

export default function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-[#E8E4F0] flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-[#E8E4F0]">
        <Link href="/dashboard">
          <h1 className="font-playfair text-2xl font-semibold text-[#4A4A4A]">
            Carmen<span className="text-[#B39DDB]">.</span>
          </h1>
          <p className="text-xs text-[#8A8A8A] mt-1">Panel de gestión</p>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#E8E4F0] text-[#9575CD]'
                  : 'text-[#8A8A8A] hover:bg-[#FAFAF8] hover:text-[#4A4A4A]'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#E8E4F0]">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-[#E8E4F0] flex items-center justify-center text-sm">🌸</div>
          <div>
            <p className="text-sm font-medium text-[#4A4A4A]">Carmen</p>
            <p className="text-xs text-[#8A8A8A]">Psicóloga</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2 text-sm text-[#8A8A8A] hover:text-red-500 transition-colors rounded-xl hover:bg-red-50"
        >
          🚪 Cerrar sesión
        </button>
      </div>
    </aside>
  )
}