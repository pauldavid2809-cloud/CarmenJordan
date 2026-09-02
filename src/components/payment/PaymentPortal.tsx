'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatTime } from '@/lib/utils'

interface Props {
  link: any
  existingProof: any | null
}

export default function PaymentPortal({ link, existingProof }: Props) {
  const [activeTab, setActiveTab] = useState<'pago_movil' | 'zelle'>('pago_movil')
  const [euroRate, setEuroRate] = useState<number | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [form, setForm] = useState({
    client_name: '',
    client_phone: '',
    reference_number: '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const apt = link.appointments
  const client = apt?.clients
  const profile = apt?.psico_profiles || apt?.profiles

  const isExpired = new Date(link.expires_at) < new Date()
  const isVerified = link.status === 'verificado'
  const isRejected = link.status === 'rechazado'
  const hasProof = !!existingProof || link.status === 'subido'

  // Datos dinámicos de Pago Móvil de la psicóloga
  const pagoMovil = {
    banco: profile?.pago_movil_banco || 'Banco por definir',
    bancoNombre: profile?.pago_movil_banco || 'Banco por definir',
    cedula: profile?.pago_movil_cedula || 'V-00.000.000',
    cedulaRaw: (profile?.pago_movil_cedula || '').replace(/[^0-9]/g, ''),
    telefono: profile?.pago_movil_telefono || '0412-0000000',
    telefonoRaw: (profile?.pago_movil_telefono || '').replace(/[^0-9]/g, ''),
  }

  // Datos dinámicos de Zelle de la psicóloga
  const zelle = {
    email: profile?.zelle_email || '',
    holder: profile?.zelle_holder || profile?.full_name || '',
  }

  // Consulta automática de la cotización
  useEffect(() => {
    async function fetchRate() {
      try {
        const res = await fetch('https://ve.dolarapi.com/v1/euros/oficial')
        if (res.ok) {
          const data = await res.json()
          if (data && typeof data.promedio === 'number') {
            setEuroRate(data.promedio)
          }
        }
      } catch {
        // Mantiene cálculo si existe
      }
    }
    fetchRate()
  }, [])

  const rawAmount = apt?.amount_usd || apt?.amount_bs || 0
  const calculatedBs = euroRate ? rawAmount * euroRate : apt?.amount_bs || null
  const formattedBs = calculatedBs
    ? calculatedBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : ''
  const rawBsNumber = calculatedBs ? calculatedBs.toFixed(2) : ''

  function copyToClipboard(text: string, fieldName: string) {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    setTimeout(() => {
      setCopiedField((current) => (current === fieldName ? null : current))
    }, 2000)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return setError('Selecciona una imagen del comprobante')
    setUploading(true)
    setError(null)

    try {
      const fileName = `${link.id}/${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, file)

      if (uploadError) {
        setError('Error al subir el archivo. Intenta de nuevo.')
        setUploading(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage.from('payment-proofs').getPublicUrl(fileName)

      const { error: insertError } = await supabase.from('payment_proofs').insert({
        payment_link_id: link.id,
        file_url: publicUrl,
        file_name: file.name,
        payment_method_used: activeTab,
        client_name: form.client_name,
        client_phone: form.client_phone,
        reference_number: form.reference_number || null,
      })

      if (insertError) {
        setError('Error al registrar el comprobante. Intenta de nuevo.')
        setUploading(false)
        return
      }

      await supabase.from('payment_links').update({ status: 'subido' }).eq('id', link.id)
      setDone(true)
      setUploading(false)
    } catch (err: any) {
      setError('Error inesperado al procesar comprobante.')
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#E8E4F0] to-[#F3F0F8] border border-[#B39DDB]/40 shadow-sm mx-auto mb-2 flex items-center justify-center text-2xl">
            🌸
          </div>
          <h1 className="font-playfair text-2xl font-semibold text-[#4A4A4A]">
            {profile?.full_name || 'Consulta Psicológica'}
          </h1>
          <p className="text-[#8A8A8A] text-xs mt-0.5">Portal de pago seguro</p>
        </div>

        <div className="bg-white rounded-3xl border border-[#E8E4F0] shadow-sm overflow-hidden">
          {/* Detalles de la consulta */}
          <div className="bg-gradient-to-br from-[#E8E4F0] to-[#F3F0F8] p-6">
            <p className="text-xs font-medium text-[#9575CD] uppercase tracking-wider mb-2">Detalle de tu cita</p>
            <div className="space-y-1.5 text-sm">
              {client?.name && <p className="font-semibold text-[#4A4A4A] text-base">👋 Hola, {client.name}</p>}
              <p className="text-[#4A4A4A]">📅 Fecha: {apt?.scheduled_at ? formatDate(apt.scheduled_at) : '-'}</p>
              <p className="text-[#4A4A4A]">🕐 Hora: {apt?.scheduled_at ? formatTime(apt.scheduled_at) : '-'}</p>
              <p className="text-[#4A4A4A]">💼 Modalidad: {apt?.session_type || 'Individual'}</p>
              {apt?.amount_usd && (
                <p className="text-[#4A4A4A] font-medium">💵 Tarifa: ${apt.amount_usd} USD</p>
              )}
            </div>
          </div>

          <div className="p-6">
            {/* Estados especiales */}
            {isExpired && !isVerified && !hasProof && (
              <div className="text-center py-8">
                <p className="text-4xl mb-3">⏰</p>
                <p className="font-medium text-[#4A4A4A]">Este link ha expirado</p>
                <p className="text-sm text-[#8A8A8A] mt-1">Contacta a tu terapeuta para generar uno nuevo</p>
              </div>
            )}

            {isVerified && (
              <div className="text-center py-8">
                <p className="text-5xl mb-4">✅</p>
                <p className="font-playfair text-xl font-medium text-[#4A4A4A]">Pago verificado</p>
                <p className="text-sm text-[#8A8A8A] mt-2">Tu pago fue confirmado exitosamente.</p>
                <div className="mt-6 flex flex-col items-center gap-3">
                  <a
                    href={`/sala/${link.token}`}
                    className="inline-flex items-center gap-2 bg-[#B39DDB] text-white px-7 py-3.5 rounded-2xl text-sm sm:text-base font-semibold hover:bg-[#9575CD] transition-all shadow-lg shadow-[#B39DDB]/30 hover:scale-[1.02]"
                  >
                    <span>📹</span>
                    <span>Entrar a mi sala de consulta virtual</span>
                  </a>

                  {apt?.meet_link && (
                    <a
                      href={apt.meet_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#8A8A8A] hover:text-[#4A4A4A] underline mt-1"
                    >
                      O unirse mediante enlace externo de respaldo ↗
                    </a>
                  )}
                </div>
              </div>
            )}

            {isRejected && (
              <div className="text-center py-8">
                <p className="text-5xl mb-4">❌</p>
                <p className="font-playfair text-xl font-medium text-[#4A4A4A]">Comprobante no procesado</p>
                {existingProof?.rejection_reason && (
                  <p className="text-sm text-red-500 mt-2">{existingProof.rejection_reason}</p>
                )}
                <p className="text-sm text-[#8A8A8A] mt-3">Por favor contacta a tu terapeuta para solventar el pago.</p>
              </div>
            )}

            {(done || (hasProof && !isVerified && !isRejected)) && (
              <div className="text-center py-8">
                <p className="text-5xl mb-4">📄</p>
                <p className="font-playfair text-xl font-medium text-[#4A4A4A]">Comprobante recibido</p>
                <p className="text-sm text-[#8A8A8A] mt-2">Tu terapeuta verificará el pago a la brevedad. ¡Gracias!</p>
              </div>
            )}

            {/* Formulario de Pago */}
            {!isExpired && !isVerified && !isRejected && !done && !hasProof && (
              <>
                {/* Selector de método de pago */}
                <div className="flex rounded-xl bg-[#FAFAF8] p-1 border border-[#E8E4F0] mb-6">
                  <button
                    type="button"
                    onClick={() => setActiveTab('pago_movil')}
                    className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      activeTab === 'pago_movil'
                        ? 'bg-white text-[#9575CD] shadow-sm font-semibold'
                        : 'text-[#8A8A8A] hover:text-[#4A4A4A]'
                    }`}
                  >
                    📱 Pago Móvil
                  </button>
                  {zelle.email && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('zelle')}
                      className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                        activeTab === 'zelle'
                          ? 'bg-white text-[#9575CD] shadow-sm font-semibold'
                          : 'text-[#8A8A8A] hover:text-[#4A4A4A]'
                      }`}
                    >
                      💵 Zelle
                    </button>
                  )}
                </div>

                {/* TAB: PAGO MÓVIL */}
                {activeTab === 'pago_movil' && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2.5">
                      <p className="font-semibold text-[#4A4A4A] text-sm flex items-center gap-1.5">
                        <span>📱</span> Datos para Pago Móvil
                      </p>
                      <span className="text-[11px] text-[#8A8A8A]">Toca para copiar</span>
                    </div>

                    <div className="space-y-2.5">
                      {/* Banco */}
                      <div
                        onClick={() => copyToClipboard(pagoMovil.bancoNombre, 'banco')}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          copiedField === 'banco'
                            ? 'bg-green-50/80 border-green-300 ring-2 ring-green-100'
                            : 'bg-[#FAFAF8] border-[#E8E4F0] hover:border-[#B39DDB] hover:bg-white'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-medium text-[#8A8A8A] uppercase tracking-wider">Banco</p>
                          <p className="font-medium text-[#4A4A4A] text-sm truncate">{pagoMovil.banco}</p>
                        </div>
                        <span className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-colors flex-shrink-0 ${
                          copiedField === 'banco'
                            ? 'bg-green-500 text-white shadow-sm'
                            : 'bg-white text-[#9575CD] border border-[#E8E4F0]'
                        }`}>
                          {copiedField === 'banco' ? '✓ Copiado' : 'Copiar'}
                        </span>
                      </div>

                      {/* Cédula */}
                      <div
                        onClick={() => copyToClipboard(pagoMovil.cedulaRaw, 'cedula')}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          copiedField === 'cedula'
                            ? 'bg-green-50/80 border-green-300 ring-2 ring-green-100'
                            : 'bg-[#FAFAF8] border-[#E8E4F0] hover:border-[#B39DDB] hover:bg-white'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-medium text-[#8A8A8A] uppercase tracking-wider">Cédula</p>
                          <p className="font-semibold text-[#4A4A4A] text-sm">{pagoMovil.cedula}</p>
                        </div>
                        <span className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-colors flex-shrink-0 ${
                          copiedField === 'cedula'
                            ? 'bg-green-500 text-white shadow-sm'
                            : 'bg-white text-[#9575CD] border border-[#E8E4F0]'
                        }`}>
                          {copiedField === 'cedula' ? '✓ Copiado' : 'Copiar'}
                        </span>
                      </div>

                      {/* Teléfono */}
                      <div
                        onClick={() => copyToClipboard(pagoMovil.telefonoRaw, 'telefono')}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          copiedField === 'telefono'
                            ? 'bg-green-50/80 border-green-300 ring-2 ring-green-100'
                            : 'bg-[#FAFAF8] border-[#E8E4F0] hover:border-[#B39DDB] hover:bg-white'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-medium text-[#8A8A8A] uppercase tracking-wider">Teléfono</p>
                          <p className="font-semibold text-[#4A4A4A] text-sm">{pagoMovil.telefono}</p>
                        </div>
                        <span className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-colors flex-shrink-0 ${
                          copiedField === 'telefono'
                            ? 'bg-green-500 text-white shadow-sm'
                            : 'bg-white text-[#9575CD] border border-[#E8E4F0]'
                        }`}>
                          {copiedField === 'telefono' ? '✓ Copiado' : 'Copiar'}
                        </span>
                      </div>

                      {/* Monto */}
                      <div
                        onClick={() => calculatedBs && copyToClipboard(rawBsNumber, 'monto')}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          copiedField === 'monto'
                            ? 'bg-green-50/80 border-green-300 ring-2 ring-green-100'
                            : 'bg-gradient-to-r from-[#F3F0F8] to-[#FAFAF8] border-[#E8E4F0] hover:border-[#B39DDB]'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-medium text-[#9575CD] uppercase tracking-wider">Monto a pagar</p>
                          <p className="font-bold text-[#4A4A4A] text-base sm:text-lg">
                            {calculatedBs ? `Bs. ${formattedBs}` : (apt?.amount_bs ? `Bs. ${apt.amount_bs}` : 'Calculando...')}
                          </p>
                        </div>
                        {(calculatedBs || apt?.amount_bs) && (
                          <span className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-colors flex-shrink-0 ${
                            copiedField === 'monto'
                              ? 'bg-green-500 text-white shadow-sm'
                              : 'bg-[#B39DDB] text-white shadow-sm'
                          }`}>
                            {copiedField === 'monto' ? '✓ Copiado' : 'Copiar monto'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB: ZELLE */}
                {activeTab === 'zelle' && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2.5">
                      <p className="font-semibold text-[#4A4A4A] text-sm flex items-center gap-1.5">
                        <span>💵</span> Datos para Zelle
                      </p>
                      <span className="text-[11px] text-[#8A8A8A]">Toca para copiar</span>
                    </div>

                    <div className="space-y-2.5">
                      <div
                        onClick={() => copyToClipboard(zelle.email, 'zelle_email')}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          copiedField === 'zelle_email'
                            ? 'bg-green-50/80 border-green-300 ring-2 ring-green-100'
                            : 'bg-[#FAFAF8] border-[#E8E4F0] hover:border-[#B39DDB] hover:bg-white'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-medium text-[#8A8A8A] uppercase tracking-wider">Correo Zelle</p>
                          <p className="font-semibold text-[#4A4A4A] text-sm truncate">{zelle.email}</p>
                        </div>
                        <span className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-colors flex-shrink-0 ${
                          copiedField === 'zelle_email'
                            ? 'bg-green-500 text-white shadow-sm'
                            : 'bg-white text-[#9575CD] border border-[#E8E4F0]'
                        }`}>
                          {copiedField === 'zelle_email' ? '✓ Copiado' : 'Copiar'}
                        </span>
                      </div>

                      {zelle.holder && (
                        <div className="p-3 rounded-2xl border border-[#E8E4F0] bg-[#FAFAF8]">
                          <p className="text-[11px] font-medium text-[#8A8A8A] uppercase tracking-wider">Titular</p>
                          <p className="font-medium text-[#4A4A4A] text-sm">{zelle.holder}</p>
                        </div>
                      )}

                      <div className="p-3.5 rounded-2xl border border-[#E8E4F0] bg-gradient-to-r from-[#F3F0F8] to-[#FAFAF8]">
                        <p className="text-[11px] font-medium text-[#9575CD] uppercase tracking-wider">Monto a pagar</p>
                        <p className="font-bold text-[#4A4A4A] text-base sm:text-lg">
                          ${apt?.amount_usd || 0} USD
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Formulario de carga de comprobante */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">Tu nombre completo *</label>
                    <input
                      type="text"
                      required
                      value={form.client_name}
                      onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8E4F0] focus:outline-none focus:border-[#B39DDB] text-sm bg-white"
                      placeholder="Nombre y apellido"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">Tu teléfono WhatsApp</label>
                    <input
                      type="tel"
                      value={form.client_phone}
                      onChange={(e) => setForm({ ...form, client_phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8E4F0] focus:outline-none focus:border-[#B39DDB] text-sm bg-white"
                      placeholder="04121234567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">
                      Número de referencia (Opcional)
                    </label>
                    <input
                      type="text"
                      value={form.reference_number}
                      onChange={(e) => setForm({ ...form, reference_number: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8E4F0] focus:outline-none focus:border-[#B39DDB] text-sm bg-white"
                      placeholder="Ej. 123456"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">
                      Captura del comprobante ({activeTab === 'pago_movil' ? 'Pago Móvil' : 'Zelle'}) *
                    </label>
                    <div
                      className="border-2 border-dashed border-[#E8E4F0] rounded-xl p-6 text-center cursor-pointer hover:border-[#B39DDB] transition-colors bg-[#FAFAF8]"
                      onClick={() => document.getElementById('fileInput')?.click()}
                    >
                      {file ? (
                        <div>
                          <p className="text-2xl mb-1">📸</p>
                          <p className="text-sm font-medium text-[#4A4A4A]">{file.name}</p>
                          <p className="text-xs text-[#8A8A8A]">{(file.size / 1024).toFixed(0)} KB</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-3xl mb-2">📤</p>
                          <p className="text-sm text-[#4A4A4A] font-medium">Toca para subir la captura de pago</p>
                          <p className="text-xs text-[#8A8A8A] mt-1">Formato JPG, PNG o PDF</p>
                        </div>
                      )}
                      <input
                        id="fileInput"
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={uploading}
                    className="w-full bg-[#B39DDB] text-white py-3.5 rounded-xl font-medium hover:bg-[#9575CD] transition-colors disabled:opacity-60 text-sm shadow-md shadow-[#B39DDB]/30"
                  >
                    {uploading ? 'Enviando comprobante...' : 'Enviar comprobante'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-[#8A8A8A] mt-6">
          🌸 PsicoOnline — Consultas Psicológicas Online
        </p>
      </div>
    </div>
  )
}