'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/dashboard', icon: '🏠', label: 'Inicio' },
  { href: '/dashboard/citas', icon: '📅', label: 'Citas' },
  { href: '/dashboard/clientes', icon: '👥', label: 'Clientes' },
  { href: '/dashboard/cobros', icon: '💳', label: 'Cobros' },
  { href: '/dashboard/reportes', icon: '📊', label: 'Reportes' },
]

export default function DashboardSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navContent = (
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className="p-6 border-b border-[#E8E4F0] flex items-center justify-between">
        <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
          <h1 className="font-playfair text-2xl font-semibold text-[#4A4A4A]">
            Carmen<span className="text-[#B39DDB]">.</span>
          </h1>
          <p className="text-xs text-[#8A8A8A] mt-0.5">Panel de gestión</p>
        </Link>
        {/* Close button on mobile */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-2 text-[#8A8A8A] hover:text-[#4A4A4A] rounded-xl hover:bg-[#FAFAF8]"
          aria-label="Cerrar menú"
        >
          ✕
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#E8E4F0] text-[#9575CD] font-semibold shadow-sm'
                  : 'text-[#8A8A8A] hover:bg-[#FAFAF8] hover:text-[#4A4A4A]'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#E8E4F0] bg-white">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <img
            src="/carmen.jpg"
            alt="Carmen Jordán"
            className="w-10 h-10 rounded-full object-cover object-[50%_15%] border-2 border-[#B39DDB]/40 shadow-sm"
          />
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#4A4A4A] truncate">Carmen Jordán</p>
            <p className="text-xs text-[#8A8A8A] truncate">Psicóloga Clínica</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2.5 text-sm text-[#8A8A8A] hover:text-red-500 transition-colors rounded-xl hover:bg-red-50 flex items-center gap-2"
        >
          <span>🚪</span> Cerrar sesión
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Barra superior en Móvil */}
      <header className="md:hidden sticky top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-[#E8E4F0] px-4 flex items-center justify-between z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-1 text-[#4A4A4A] hover:bg-[#FAFAF8] rounded-xl transition-colors text-xl"
            aria-label="Abrir menú"
          >
            ☰
          </button>
          <Link href="/dashboard" className="font-playfair text-xl font-semibold text-[#4A4A4A]">
            Carmen<span className="text-[#B39DDB]">.</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <img
            src="/carmen.jpg"
            alt="Carmen"
            className="w-8 h-8 rounded-full object-cover object-[50%_15%] border border-[#B39DDB]/40"
          />
        </div>
      </header>

      {/* Drawer Móvil (Slide-out) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer container */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[80vw] shadow-2xl z-50">
            {navContent}
          </div>
        </div>
      )}

      {/* Sidebar fijo en Desktop */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-[#E8E4F0] flex-col z-40">
        {navContent}
      </aside>
    </>
  )
}