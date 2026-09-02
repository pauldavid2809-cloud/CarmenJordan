'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [slug, setSlug] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Sanitizar el slug automáticamente (letras, números y guiones)
  const handleSlugChange = (val: string) => {
    const clean = val
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
    setSlug(clean)
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!slug.trim()) {
      setError('Por favor indica un enlace o nombre de usuario para tu página.')
      setLoading(false)
      return
    }

    try {
      // 1. Verificar si el slug ya existe
      const { data: existingSlug } = await supabase
        .from('profiles')
        .select('id')
        .eq('slug', slug.trim())
        .maybeSingle()

      if (existingSlug) {
        setError(`El enlace "/${slug}" ya está en uso. Por favor elige otro.`)
        setLoading(false)
        return
      }

      // 2. Registrar usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            slug: slug.trim(),
            whatsapp_phone: whatsapp.trim(),
          },
        },
      })

      if (authError) {
        setError(authError.message || 'Error al crear la cuenta. Intenta de nuevo.')
        setLoading(false)
        return
      }

      const user = authData.user
      if (!user) {
        setError('No se pudo completar el registro. Intenta de nuevo.')
        setLoading(false)
        return
      }

      // 3. Crear el perfil de la psicóloga con 3 días de prueba gratis
      const trialEnds = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      const { error: profileError } = await supabase.from('profiles').insert({
        id: user.id,
        slug: slug.trim(),
        full_name: fullName.trim(),
        title: 'Psicóloga Clínica',
        whatsapp_phone: whatsapp.trim(),
        subscription_status: 'trial',
        trial_ends_at: trialEnds,
        specialties: [
          { icon: '🧠', title: 'Ansiedad y Estrés', desc: 'Acompañamiento y herramientas prácticas de autorregulación.' },
          { icon: '🌱', title: 'Crecimiento Personal', desc: 'Desarrollo de fortalezas y autoestima.' },
        ],
      })

      if (profileError) {
        console.error('Error insertando perfil:', profileError)
        // Aún así permitimos el acceso si fue por RLS o trigger existente
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err?.message || 'Ocurrió un error inesperado al registrarte.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#E8E4F0] to-[#F3F0F8] border-4 border-white shadow-lg mx-auto mb-3 flex items-center justify-center text-3xl">
            🌸
          </div>
          <h1 className="font-playfair text-3xl font-semibold text-[#4A4A4A] mb-1">
            Psico<span className="text-[#B39DDB]">Online.</span>
          </h1>
          <p className="text-xs text-[#8A8A8A]">
            Únete a la plataforma para gestionar tus consultas online
          </p>
          <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs text-emerald-700 font-medium">
            <span>✨</span> 3 días de prueba gratis sin tarjeta
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#E8E4F0]">
          <h2 className="font-playfair text-2xl font-medium text-[#4A4A4A] mb-2">Crear cuenta</h2>
          <p className="text-sm text-[#8A8A8A] mb-6">Configura tu perfil profesional en 2 minutos.</p>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">Nombre y Apellido</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-[#E8E4F0] focus:outline-none focus:border-[#B39DDB] bg-white text-[#4A4A4A] text-sm"
                placeholder="Ej. Lic. Mariana Pérez"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">
                Tu enlace público personal
              </label>
              <div className="flex items-center rounded-xl border border-[#E8E4F0] overflow-hidden focus-within:border-[#B39DDB] bg-white">
                <span className="px-3 text-xs sm:text-sm text-[#8A8A8A] bg-[#FAFAF8] py-3 border-r border-[#E8E4F0] select-none">
                  psico-online.com/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  required
                  className="flex-1 px-3 py-3 focus:outline-none text-[#4A4A4A] text-sm"
                  placeholder="mariana-perez"
                />
              </div>
              <p className="text-xs text-[#8A8A8A] mt-1">Este será el link que compartirás con tus pacientes.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">Teléfono WhatsApp</label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-[#E8E4F0] focus:outline-none focus:border-[#B39DDB] bg-white text-[#4A4A4A] text-sm"
                placeholder="+58 412 1234567"
              />
              <p className="text-xs text-[#8A8A8A] mt-1">Donde los pacientes te contactarán desde tu página pública.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-[#E8E4F0] focus:outline-none focus:border-[#B39DDB] bg-white text-[#4A4A4A] text-sm"
                placeholder="mariana@psicologia.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border border-[#E8E4F0] focus:outline-none focus:border-[#B39DDB] bg-white text-[#4A4A4A] text-sm"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#B39DDB] text-white py-3.5 rounded-xl font-medium hover:bg-[#9575CD] transition-all hover:shadow-md hover:shadow-[#B39DDB]/30 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {loading ? 'Creando tu cuenta...' : 'Comenzar 3 días gratis'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#E8E4F0] text-center">
            <p className="text-sm text-[#8A8A8A]">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-[#9575CD] font-medium hover:underline">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
