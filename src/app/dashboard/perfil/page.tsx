'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'

const VENEZUELA_BANKS = [
  'Banco de Venezuela (0102)',
  'Banesco (0134)',
  'Banco Mercantil (0105)',
  'Banco Provincial BBVA (0108)',
  'Banco Nacional de Crédito BNC (0191)',
  'Bancaribe (0114)',
  'Banco Exterior (0115)',
  'Banco Venezolano de Crédito (0104)',
  'Banco del Tesoro (0163)',
  'Bancamiga (0172)',
  'Otro banco...',
]

export default function PerfilPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)

  // Form states
  const [fullName, setFullName] = useState('')
  const [title, setTitle] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [bio, setBio] = useState('')
  const [ratesInfo, setRatesInfo] = useState('')

  // Bank states
  const [pmBanco, setPmBanco] = useState('')
  const [pmCedula, setPmCedula] = useState('')
  const [pmTelefono, setPmTelefono] = useState('')
  const [zelleEmail, setZelleEmail] = useState('')
  const [zelleHolder, setZelleHolder] = useState('')

  const supabase = createClient()
  const origin = typeof window !== 'undefined' ? window.location.origin : ''

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      setProfile(data as Profile)
      setFullName(data.full_name || '')
      setTitle(data.title || 'Psicóloga Clínica')
      setWhatsapp(data.whatsapp_phone || '')
      setBio(data.bio || '')
      setRatesInfo(data.rates_info || '')
      setPmBanco(data.pago_movil_banco || '')
      setPmCedula(data.pago_movil_cedula || '')
      setPmTelefono(data.pago_movil_telefono || '')
      setZelleEmail(data.zelle_email || '')
      setZelleHolder(data.zelle_holder || '')
    }
    setLoading(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    setSuccessMsg(null)

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim(),
        title: title.trim(),
        whatsapp_phone: whatsapp.trim(),
        bio: bio.trim(),
        rates_info: ratesInfo.trim(),
        pago_movil_banco: pmBanco.trim(),
        pago_movil_cedula: pmCedula.trim(),
        pago_movil_telefono: pmTelefono.trim(),
        zelle_email: zelleEmail.trim(),
        zelle_holder: zelleHolder.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id)

    setSaving(false)
    if (!error) {
      setSuccessMsg('¡Cambios guardados con éxito!')
      setTimeout(() => setSuccessMsg(null), 3500)
    } else {
      alert('Error al guardar: ' + error.message)
    }
  }

  function copyPublicLink() {
    if (!profile?.slug) return
    const publicUrl = `${origin}/${profile.slug}`
    navigator.clipboard.writeText(publicUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center text-[#8A8A8A]">
        Cargando perfil...
      </div>
    )
  }

  const daysLeftTrial = profile?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(profile.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-playfair text-2xl sm:text-3xl font-semibold text-[#4A4A4A]">Mi Perfil y Cobros</h1>
          <p className="text-sm text-[#8A8A8A] mt-1">Configura tu página web y tus cuentas bancarias para consultas.</p>
        </div>

        {profile?.slug && (
          <div className="flex items-center gap-2">
            <button
              onClick={copyPublicLink}
              className="bg-white border border-[#E8E4F0] text-[#4A4A4A] hover:border-[#B39DDB] px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors shadow-sm flex items-center gap-1.5"
            >
              <span>🔗</span>
              <span>{copiedLink ? '¡Enlace copiado!' : 'Copiar enlace público'}</span>
            </button>
            <a
              href={`/${profile.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#E8E4F0] text-[#9575CD] hover:bg-[#D1C4E9] px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5"
            >
              <span>👁️</span>
              <span>Ver mi página</span>
            </a>
          </div>
        )}
      </div>

      {/* Estado de Suscripción Banner */}
      <div className="mb-6 p-4 rounded-2xl bg-white border border-[#E8E4F0] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F3F0F8] flex items-center justify-center text-xl">
            {profile?.subscription_status === 'active' ? '⭐' : '✨'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#4A4A4A]">Estado de suscripción:</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                profile?.subscription_status === 'active'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {profile?.subscription_status === 'active'
                  ? 'Membresía Activa'
                  : `Prueba gratis (${daysLeftTrial} días restantes)`}
              </span>
            </div>
            <p className="text-xs text-[#8A8A8A] mt-0.5">
              {profile?.subscription_status === 'active'
                ? 'Tienes acceso total a todas las herramientas de la plataforma.'
                : 'Disfruta de todas las herramientas durante tu periodo de evaluación.'}
            </p>
          </div>
        </div>

        {profile?.subscription_status !== 'active' && (
          <a
            href="https://wa.me/584120000000?text=Hola,%20quiero%20renovar%20mi%20suscripci%C3%B3n%20en%20PsicoOnline"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#B39DDB] text-white text-xs px-4 py-2 rounded-xl hover:bg-[#9575CD] transition-colors shadow-sm self-start sm:self-auto font-medium"
          >
            Activar plan completo vía Pago Móvil
          </a>
        )}
      </div>

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-2xl animate-fade-in flex items-center gap-2">
          <span>✅</span>
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECCIÓN 1: PERFIL PÚBLICO */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E4F0] shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🌿</span>
            <h2 className="font-playfair text-xl font-semibold text-[#4A4A4A]">Datos de tu Página Pública</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#8A8A8A] mb-6">
            Esta información se muestra en tu enlace personal <span className="font-mono text-[#9575CD]">/{profile?.slug}</span>.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A4A4A] mb-1.5">
                Nombre y Apellido
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8E4F0] focus:outline-none focus:border-[#B39DDB] text-sm bg-white"
                placeholder="Lic. Carmen Jordán"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A4A4A] mb-1.5">
                Título o Especialidad Principal
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8E4F0] focus:outline-none focus:border-[#B39DDB] text-sm bg-white"
                placeholder="Psicóloga Clínica y Psicoterapeuta"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A4A4A] mb-1.5">
                Teléfono de WhatsApp para Citas
              </label>
              <input
                type="text"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8E4F0] focus:outline-none focus:border-[#B39DDB] text-sm bg-white"
                placeholder="+58 412 1234567"
              />
              <p className="text-xs text-[#8A8A8A] mt-1">
                A este número llegarán los pacientes que hagan clic en "Agendar por WhatsApp" en tu página.
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A4A4A] mb-1.5">
                Biografía o Mensaje de Bienvenida
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8E4F0] focus:outline-none focus:border-[#B39DDB] text-sm bg-white"
                placeholder="Te acompaño en tu proceso de crecimiento personal y bienestar emocional desde la comodidad de tu hogar..."
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: DATOS BANCARIOS (PAGO MÓVIL Y ZELLE) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E4F0] shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">💳</span>
            <h2 className="font-playfair text-xl font-semibold text-[#4A4A4A]">Tus Cuentas Bancarias de Cobro</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#8A8A8A] mb-6">
            Estos son los datos exactos que tus pacientes verán en su portal de pago al recibir tus links.
          </p>

          <div className="space-y-6">
            {/* PAGO MÓVIL */}
            <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-[#E8E4F0]">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">📱</span>
                <h3 className="font-semibold text-sm text-[#4A4A4A]">Pago Móvil</h3>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#8A8A8A] uppercase mb-1">Banco</label>
                  <input
                    type="text"
                    value={pmBanco}
                    onChange={(e) => setPmBanco(e.target.value)}
                    placeholder="Banesco / BNC / Mercantil"
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E4F0] focus:outline-none focus:border-[#B39DDB] text-xs sm:text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#8A8A8A] uppercase mb-1">Cédula</label>
                  <input
                    type="text"
                    value={pmCedula}
                    onChange={(e) => setPmCedula(e.target.value)}
                    placeholder="V-20.123.456"
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E4F0] focus:outline-none focus:border-[#B39DDB] text-xs sm:text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#8A8A8A] uppercase mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={pmTelefono}
                    onChange={(e) => setPmTelefono(e.target.value)}
                    placeholder="0412-1234567"
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E4F0] focus:outline-none focus:border-[#B39DDB] text-xs sm:text-sm bg-white"
                  />
                </div>
              </div>
            </div>

            {/* ZELLE */}
            <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-[#E8E4F0]">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">💵</span>
                <h3 className="font-semibold text-sm text-[#4A4A4A]">Zelle (Opcional)</h3>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#8A8A8A] uppercase mb-1">Correo de Zelle</label>
                  <input
                    type="email"
                    value={zelleEmail}
                    onChange={(e) => setZelleEmail(e.target.value)}
                    placeholder="tu-correo@ejemplo.com"
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E4F0] focus:outline-none focus:border-[#B39DDB] text-xs sm:text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#8A8A8A] uppercase mb-1">Nombre del Titular</label>
                  <input
                    type="text"
                    value={zelleHolder}
                    onChange={(e) => setZelleHolder(e.target.value)}
                    placeholder="Nombre registrado en Zelle"
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E4F0] focus:outline-none focus:border-[#B39DDB] text-xs sm:text-sm bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#B39DDB] text-white px-8 py-3.5 rounded-xl font-medium hover:bg-[#9575CD] transition-all shadow-md shadow-[#B39DDB]/30 disabled:opacity-60 text-sm"
          >
            {saving ? 'Guardando cambios...' : 'Guardar configuración'}
          </button>
        </div>
      </form>
    </div>
  )
}
