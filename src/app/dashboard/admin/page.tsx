'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

export default function SuperAdminPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    checkAdminAndFetch()
  }, [])

  async function checkAdminAndFetch() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return setLoading(false)

    // Perfil del usuario actual
    const { data: myProfile } = await supabase
      .from('psico_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    setCurrentUser(myProfile as Profile)

    if (myProfile?.is_admin) {
      const { data } = await supabase
        .from('psico_profiles')
        .select('*')
        .order('created_at', { ascending: false })
      setProfiles((data as Profile[]) || [])
    }

    setLoading(false)
  }

  async function updateSubscription(profileId: string, days: number, newStatus: 'active' | 'trial' | 'suspended') {
    setActionLoading(profileId)
    const targetDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()

    const updatePayload: any = {
      subscription_status: newStatus,
      updated_at: new Date().toISOString(),
    }

    if (newStatus === 'active') {
      updatePayload.subscription_ends_at = targetDate
    } else if (newStatus === 'trial') {
      updatePayload.trial_ends_at = targetDate
    }

    const { error } = await supabase
      .from('psico_profiles')
      .update(updatePayload)
      .eq('id', profileId)

    if (error) {
      alert('Error actualizando suscripción: ' + error.message)
    } else {
      checkAdminAndFetch()
    }
    setActionLoading(null)
  }

  if (loading) {
    return <div className="max-w-6xl mx-auto py-20 text-center text-[#8A8A8A]">Cargando panel...</div>
  }

  if (!currentUser?.is_admin) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <div className="bg-white rounded-3xl p-8 border border-[#E8E4F0] shadow-sm">
          <p className="text-4xl mb-3">🔒</p>
          <h1 className="font-playfair text-xl font-semibold text-[#4A4A4A] mb-2">Acceso Restringido</h1>
          <p className="text-xs text-[#8A8A8A] mb-6">
            Esta sección es exclusiva para el super-administrador de PsicoOnline.
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-[#B39DDB] text-white px-5 py-2.5 rounded-xl text-xs font-medium hover:bg-[#9575CD]"
          >
            Volver al Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const totalCount = profiles.length
  const activeCount = profiles.filter((p) => p.subscription_status === 'active').length
  const trialCount = profiles.filter((p) => p.subscription_status === 'trial').length

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2">
          <span className="text-2xl">👑</span>
          <h1 className="font-playfair text-2xl sm:text-3xl font-semibold text-[#4A4A4A]">Super Admin</h1>
        </div>
        <p className="text-sm text-[#8A8A8A] mt-1">
          Gestión y aprobación de suscripciones de psicólogas registradas.
        </p>
      </div>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-[#E8E4F0] shadow-sm">
          <p className="text-xs text-[#8A8A8A] uppercase font-medium">Total Psicólogas</p>
          <p className="text-2xl font-bold text-[#4A4A4A] mt-1">{totalCount}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-sm">
          <p className="text-xs text-emerald-700 uppercase font-medium">Membresías Activas</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{activeCount}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-sm">
          <p className="text-xs text-amber-700 uppercase font-medium">En Prueba Gratis</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{trialCount}</p>
        </div>
      </div>

      {/* Listado de psicólogas */}
      <div className="bg-white rounded-3xl border border-[#E8E4F0] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#E8E4F0]">
          <h2 className="font-medium text-[#4A4A4A]">Directorio de Profesionales</h2>
          <p className="text-xs text-[#8A8A8A] mt-0.5">
            Aprueba 30 días con 1 clic al confirmar su Pago Móvil.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAFAF8] text-[#8A8A8A] text-xs uppercase tracking-wider border-b border-[#E8E4F0]">
              <tr>
                <th className="px-6 py-3 font-semibold">Psicóloga</th>
                <th className="px-6 py-3 font-semibold">Enlace Público</th>
                <th className="px-6 py-3 font-semibold">WhatsApp</th>
                <th className="px-6 py-3 font-semibold">Estado</th>
                <th className="px-6 py-3 font-semibold">Vencimiento</th>
                <th className="px-6 py-3 font-semibold text-right">Acciones de Pago</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E4F0]">
              {profiles.map((p) => {
                const isBusy = actionLoading === p.id
                const isCurrentAdmin = p.is_admin

                return (
                  <tr key={p.id} className="hover:bg-[#FAFAF8] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#4A4A4A]">{p.full_name}</span>
                        {isCurrentAdmin && (
                          <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#8A8A8A]">{p.title}</p>
                    </td>

                    <td className="px-6 py-4">
                      <a
                        href={`/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#9575CD] hover:underline font-mono text-xs"
                      >
                        /{p.slug} ↗
                      </a>
                    </td>

                    <td className="px-6 py-4 text-xs text-[#4A4A4A]">
                      <a
                        href={`https://wa.me/${p.whatsapp_phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline flex items-center gap-1"
                      >
                        <span>💬</span> {p.whatsapp_phone}
                      </a>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          p.subscription_status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : p.subscription_status === 'trial'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {p.subscription_status === 'active'
                          ? 'Activa'
                          : p.subscription_status === 'trial'
                          ? 'Prueba'
                          : 'Pausada'}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-xs text-[#8A8A8A]">
                      {p.subscription_status === 'active' && p.subscription_ends_at
                        ? formatDate(p.subscription_ends_at)
                        : p.trial_ends_at
                        ? `${formatDate(p.trial_ends_at)} (Prueba)`
                        : '-'}
                    </td>

                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => updateSubscription(p.id, 30, 'active')}
                        disabled={isBusy}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-medium transition-colors shadow-sm disabled:opacity-50"
                        title="Activar 30 días de suscripción"
                      >
                        {isBusy ? '...' : '✓ Aprobar 1 Mes (Pago Móvil)'}
                      </button>

                      <button
                        onClick={() => updateSubscription(p.id, 3, 'trial')}
                        disabled={isBusy}
                        className="bg-[#E8E4F0] hover:bg-[#D1C4E9] text-[#4A4A4A] px-2.5 py-1.5 rounded-xl text-xs transition-colors disabled:opacity-50"
                        title="Dar 3 días más de prueba"
                      >
                        +3 días
                      </button>

                      {p.subscription_status !== 'suspended' ? (
                        <button
                          onClick={() => updateSubscription(p.id, 0, 'suspended')}
                          disabled={isBusy}
                          className="text-red-500 hover:bg-red-50 px-2.5 py-1.5 rounded-xl text-xs transition-colors disabled:opacity-50"
                          title="Suspender cuenta temporalmente"
                        >
                          Pausar
                        </button>
                      ) : (
                        <button
                          onClick={() => updateSubscription(p.id, 30, 'active')}
                          disabled={isBusy}
                          className="text-emerald-600 hover:bg-emerald-50 px-2.5 py-1.5 rounded-xl text-xs transition-colors disabled:opacity-50"
                        >
                          Reactivar
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
