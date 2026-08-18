'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatTime } from '@/lib/utils'

const PAGO_MOVIL = {
  banco: 'Banco Nacional de Crédito (BNC)',
  cedula: '25.988.653',
  cedulaRaw: '25988653',
  telefono: '0412-1702806',
  telefonoRaw: '04121702806',
  concepto: 'Consulta psicológica',
}

interface Props {
  link: any
  existingProof: any | null
}

export default function PaymentPortal({ link, existingProof }: Props) {
  const [euroRate, setEuroRate] = useState<number | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [form, setForm] = useState({
    client_name: '',
    client_phone: '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const apt = link.appointments
  const client = apt?.clients

  const isExpired = new Date(link.expires_at) < new Date()
  const isVerified = link.status === 'verificado'
  const isRejected = link.status === 'rechazado'
  const hasProof = !!existingProof || link.status === 'subido'

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

  function copyToClipboard(text: string, fieldName: string) {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    setTimeout(() => {
      setCopiedField((current) => (current === fieldName ? null : current))
    }, 2000)
  }

  function copyAllDetails() {
    const textToCopy = `Banco: ${PAGO_MOVIL.banco}\nCédula: ${PAGO_MOVIL.cedulaRaw}\nTeléfono: ${PAGO_MOVIL.telefonoRaw}\nMonto: Bs. ${formattedBs || 'A consultar'}`
    copyToClipboard(textToCopy, 'all')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return setError('Selecciona una imagen del comprobante')
    setUploading(true)
    setError(null)

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
      payment_method_used: 'pago_movil',
      client_name: form.client_name,
      client_phone: form.client_phone,
    })

    if (insertError) {
      setError('Error al guardar el comprobante. Intenta de nuevo.')
      setUploading(false)
      return
    }

    await supabase.from('payment_links').update({ status: 'subido' }).eq('id', link.id)
    setDone(true)
    setUploading(false)
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="font-playfair text-3xl font-semibold text-[#4A4A4A]">
            Carmen Jordán<span className="text-[#B39DDB]">.</span>
          </h1>
          <p className="text-[#8A8A8A] text-sm mt-1">Portal de pago seguro</p>
        </div>

        <div className="bg-white rounded-3xl border border-[#E8E4F0] shadow-sm overflow-hidden">
          {/* Detalles de la consulta */}
          <div className="bg-gradient-to-br from-[#E8E4F0] to-[#F3F0F8] p-6">
            <p className="text-xs font-medium text-[#9575CD] uppercase tracking-wider mb-3">Detalle de tu consulta</p>
            <div className="space-y-2 text-sm">
              {client?.name && <p className="font-medium text-[#4A4A4A] text-base">👋 Hola, {client.name}</p>}
              <p className="text-[#4A4A4A]">📅 Fecha: {apt?.scheduled_at ? formatDate(apt.scheduled_at) : '-'}</p>
              <p className="text-[#4A4A4A]">🕐 Hora: {apt?.scheduled_at ? formatTime(apt.scheduled_at) : '-'}</p>
              <p className="text-[#4A4A4A]">💼 Modalidad: {apt?.session_type || 'Individual'}</p>
            </div>
          </div>

          <div className="p-6">
            {/* Estados especiales */}
            {isExpired && !isVerified && !hasProof && (
              <div className="text-center py-8">
                <p className="text-4xl mb-3">⏰</p>
                <p className="font-medium text-[#4A4A4A]">Este link ha expirado</p>
                <p className="text-sm text-[#8A8A8A] mt-1">Contacta a Carmen para generar uno nuevo</p>
              </div>
            )}

            {isVerified && (
              <div className="text-center py-8">
                <p className="text-5xl mb-4">✅</p>
                <p className="font-playfair text-xl font-medium text-[#4A4A4A]">Pago verificado</p>
                <p className="text-sm text-[#8A8A8A] mt-2">Tu pago fue confirmado exitosamente.</p>
                {apt?.meet_link && (
                  <a
                    href={apt.meet_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 bg-blue-500 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors shadow-md shadow-blue-500/20"
                  >
                    💻 Unirse a la consulta por Meet
                  </a>
                )}
              </div>
            )}

            {isRejected && (
              <div className="text-center py-8">
                <p className="text-5xl mb-4">❌</p>
                <p className="font-playfair text-xl font-medium text-[#4A4A4A]">Comprobante no procesado</p>
                {existingProof?.rejection_reason && (
                  <p className="text-sm text-red-500 mt-2">{existingProof.rejection_reason}</p>
                )}
                <p className="text-sm text-[#8A8A8A] mt-3">Por favor contacta a Carmen para solventar el pago.</p>
              </div>
            )}

            {(done || (hasProof && !isVerified && !isRejected)) && (
              <div className="text-center py-8">
                <p className="text-5xl mb-4">📄</p>
                <p className="font-playfair text-xl font-medium text-[#4A4A4A]">Comprobante recibido</p>
                <p className="text-sm text-[#8A8A8A] mt-2">Carmen verificará tu pago a la brevedad. ¡Gracias!</p>
              </div>
            )}

            {/* Formulario de Pago Móvil */}
            {!isExpired && !isVerified && !isRejected && !done && !hasProof && (
              <>
                {/* Datos de Pago Móvil con función copiar */}
                <div className="bg-[#FAFAF8] rounded-2xl p-4 sm:p-5 mb-6 text-sm border border-[#E8E4F0]">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-[#4A4A4A] flex items-center gap-2">
                      <span>📱</span> Datos para Pago Móvil
                    </p>
                    <button
                      onClick={copyAllDetails}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                        copiedField === 'all'
                          ? 'bg-green-500 text-white border-green-500'
                          : 'bg-white text-[#9575CD] border-[#B39DDB] hover:bg-[#E8E4F0]'
                      }`}
                    >
                      {copiedField === 'all' ? '✓ ¡Todo copiado!' : '📋 Copiar todo'}
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {/* Banco */}
                    <div className="flex items-center justify-between p-2 rounded-xl hover:bg-white/80 transition-colors">
                      <span className="text-[#8A8A8A] text-xs sm:text-sm">Banco:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#4A4A4A] text-xs sm:text-sm">{PAGO_MOVIL.banco}</span>
                        <button
                          onClick={() => copyToClipboard('Banco Nacional de Credito', 'banco')}
                          className="text-[11px] text-[#B39DDB] hover:text-[#9575CD] px-1.5 py-0.5 rounded bg-white border border-[#E8E4F0]"
                          title="Copiar banco"
                        >
                          {copiedField === 'banco' ? '✓' : 'Copiar'}
                        </button>
                      </div>
                    </div>

                    {/* Cédula */}
                    <div className="flex items-center justify-between p-2 rounded-xl hover:bg-white/80 transition-colors">
                      <span className="text-[#8A8A8A] text-xs sm:text-sm">Cédula:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#4A4A4A] text-xs sm:text-sm">{PAGO_MOVIL.cedula}</span>
                        <button
                          onClick={() => copyToClipboard(PAGO_MOVIL.cedulaRaw, 'cedula')}
                          className="text-[11px] text-[#B39DDB] hover:text-[#9575CD] px-1.5 py-0.5 rounded bg-white border border-[#E8E4F0]"
                          title="Copiar cédula"
                        >
                          {copiedField === 'cedula' ? '✓' : 'Copiar'}
                        </button>
                      </div>
                    </div>

                    {/* Teléfono */}
                    <div className="flex items-center justify-between p-2 rounded-xl hover:bg-white/80 transition-colors">
                      <span className="text-[#8A8A8A] text-xs sm:text-sm">Teléfono:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#4A4A4A] text-xs sm:text-sm">{PAGO_MOVIL.telefono}</span>
                        <button
                          onClick={() => copyToClipboard(PAGO_MOVIL.telefonoRaw, 'telefono')}
                          className="text-[11px] text-[#B39DDB] hover:text-[#9575CD] px-1.5 py-0.5 rounded bg-white border border-[#E8E4F0]"
                          title="Copiar teléfono"
                        >
                          {copiedField === 'telefono' ? '✓' : 'Copiar'}
                        </button>
                      </div>
                    </div>

                    {/* Monto */}
                    <div className="flex items-center justify-between pt-3 border-t border-[#E8E4F0] p-2">
                      <span className="text-[#8A8A8A] font-medium text-xs sm:text-sm">Monto a pagar:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#9575CD] text-base sm:text-lg">
                          {calculatedBs ? `Bs. ${formattedBs}` : 'Calculando...'}
                        </span>
                        {calculatedBs && (
                          <button
                            onClick={() => copyToClipboard(calculatedBs.toFixed(2), 'monto')}
                            className="text-[11px] text-[#B39DDB] hover:text-[#9575CD] px-1.5 py-0.5 rounded bg-white border border-[#E8E4F0]"
                            title="Copiar monto"
                          >
                            {copiedField === 'monto' ? '✓' : 'Copiar'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">Tu nombre *</label>
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
                    <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">Tu teléfono</label>
                    <input
                      type="tel"
                      value={form.client_phone}
                      onChange={(e) => setForm({ ...form, client_phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8E4F0] focus:outline-none focus:border-[#B39DDB] text-sm bg-white"
                      placeholder="04121234567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">Captura del comprobante *</label>
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
                          <p className="text-sm text-[#4A4A4A] font-medium">Toca para subir la captura del Pago Móvil</p>
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
          🌸 Carmen Jordán — Psicóloga Clínica Online
        </p>
      </div>
    </div>
  )
}