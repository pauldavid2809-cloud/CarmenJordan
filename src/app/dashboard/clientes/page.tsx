'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Client } from '@/types'
import { generateWhatsAppLink } from '@/lib/utils'

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchClients()
  }, [])

  async function fetchClients() {
    const { data } = await supabase
      .from('clients')
      .select('*')
      .order('name')
    setClients(data || [])
    setLoading(false)
  }

  async function saveClient(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Debes iniciar sesión')
      setSaving(false)
      return
    }
    await supabase.from('clients').insert({
      ...form,
      psychologist_id: user.id,
    })
    setForm({ name: '', phone: '', email: '', notes: '' })
    setShowModal(false)
    setSaving(false)
    fetchClients()
  }

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="font-playfair text-2xl sm:text-3xl font-semibold text-[#4A4A4A]">Clientes</h1>
          <p className="text-sm text-[#8A8A8A] mt-1">{clients.length} pacientes registrados</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#B39DDB] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#9575CD] transition-colors shadow-sm self-start sm:self-auto"
        >
          + Nuevo cliente
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar por nombre, teléfono o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-3 rounded-xl border border-[#E8E4F0] focus:outline-none focus:border-[#B39DDB] text-sm bg-white shadow-sm"
        />
      </div>

      {loading ? (
        <div className="text-center py-20 text-[#8A8A8A]">Cargando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#E8E4F0] p-8">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-[#8A8A8A]">No hay clientes registrados aún.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {filtered.map((client) => (
            <div key={client.id} className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E8E4F0] flex items-center gap-3 sm:gap-4 shadow-sm hover:border-[#B39DDB] transition-all">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#E8E4F0] flex items-center justify-center text-lg sm:text-xl font-playfair font-bold text-[#B39DDB] flex-shrink-0">
                {client.name[0]?.toUpperCase() || 'P'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[#4A4A4A] text-sm sm:text-base truncate">{client.name}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs sm:text-sm text-[#8A8A8A]">
                  {client.phone && <span>📱 {client.phone}</span>}
                  {client.email && <span className="truncate">✉️ {client.email}</span>}
                </div>
                {client.notes && <p className="text-xs text-[#8A8A8A] mt-1 truncate">{client.notes}</p>}
              </div>
              {client.phone && (
                <a
                  href={generateWhatsAppLink(client.phone, `Hola ${client.name} 🌸`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 text-green-600 bg-green-50 hover:bg-green-100 rounded-xl transition-colors text-lg flex-shrink-0"
                  title="Escribir por WhatsApp"
                >
                  💬
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal nuevo cliente */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-playfair text-2xl font-medium text-[#4A4A4A]">Nuevo cliente</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#8A8A8A] hover:text-[#4A4A4A] text-lg p-1"
              >
                ✕
              </button>
            </div>
            <form onSubmit={saveClient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">Nombre completo *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej: María Pérez"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E4F0] focus:outline-none focus:border-[#B39DDB] text-sm bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">Teléfono</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="04121234567"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E4F0] focus:outline-none focus:border-[#B39DDB] text-sm bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="cliente@ejemplo.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E4F0] focus:outline-none focus:border-[#B39DDB] text-sm bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">Notas internas</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  placeholder="Motivo de consulta, observaciones..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E4F0] focus:outline-none focus:border-[#B39DDB] text-sm resize-none bg-white"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E8E4F0] text-[#8A8A8A] text-sm hover:bg-[#FAFAF8] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-[#B39DDB] text-white text-sm font-medium hover:bg-[#9575CD] transition-colors disabled:opacity-60 shadow-sm"
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
