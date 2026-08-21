'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })\

    if (error) {
      setError('Credenciales incorrectas. Verifica tu email y contraseña.')
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#E8E4F0] to-[#F3F0F8] border-4 border-white shadow-lg mx-auto mb-3 flex items-center justify-center text-3xl">
            🌸
          </div>
          <h1 className="font-playfair text-3xl font-semibold text-[#4A4A4A] mb-1">
            Psico<span className="text-[#B39DDB]">Online.</span>
          </h1>
          <p className="text-xs text-[#8A8A8A]">Panel de administración profesional</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#E8E4F0]">
          <h2 className="font-playfair text-2xl font-medium text-[#4A4A4A] mb-6">Iniciar sesión</h2>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#4A4A4A] mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-[#E8E4F0] focus:outline-none focus:border-[#B39DDB] bg-white text-[#4A4A4A] transition-colors"
                placeholder="demo@psicologia.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4A4A4A] mb-2">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-[#E8E4F0] focus:outline-none focus:border-[#B39DDB] bg-white text-[#4A4A4A] transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#B39DDB] text-white py-3 rounded-xl font-medium hover:bg-[#9575CD] transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}