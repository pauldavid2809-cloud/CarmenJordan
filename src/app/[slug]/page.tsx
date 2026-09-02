import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

const RESERVED_SLUGS = ['dashboard', 'login', 'registro', 'pay', 'api', 'favicon.ico']

const defaultSpecialties = [
  { icon: '🧠', title: 'Ansiedad y Estrés', desc: 'Herramientas prácticas para recuperar tu calma y gestionar momentos difíciles.' },
  { icon: '💔', title: 'Duelo y Pérdidas', desc: 'Acompañamiento compasivo en procesos de duelo y transiciones de vida.' },
  { icon: '🌱', title: 'Desarrollo Personal', desc: 'Descubre tu potencial y construye bienestar emocional duradero.' },
  { icon: '👫', title: 'Relaciones y Vínculos', desc: 'Fortalece la comunicación y los límites saludables en tus relaciones.' },
]

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  if (RESERVED_SLUGS.includes(slug)) return {}

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('psico_profiles')
    .select('full_name, title, bio')
    .eq('slug', slug)
    .single()

  if (!profile) return { title: 'Psicóloga no encontrada' }

  return {
    title: `${profile.full_name} — ${profile.title || 'Psicología Online'}`,
    description: profile.bio || `Consulta psicológica online con ${profile.full_name}.`,
  }
}

export default async function PsychologistPublicPage({ params }: Props) {
  const { slug } = await params

  if (RESERVED_SLUGS.includes(slug)) {
    return notFound()
  }

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('psico_profiles')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white p-8 rounded-3xl border border-[#E8E4F0] shadow-sm">
          <div className="text-4xl mb-3">🌿</div>
          <h1 className="font-playfair text-2xl font-semibold text-[#4A4A4A] mb-2">Perfil no encontrado</h1>
          <p className="text-sm text-[#8A8A8A] mb-6">
            El enlace <span className="font-mono text-[#9575CD]">/{slug}</span> no corresponde a una profesional activa.
          </p>
          <Link
            href="/"
            className="inline-block bg-[#B39DDB] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#9575CD] transition-colors"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    )
  }

  if (profile.subscription_status === 'suspended') {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white p-8 rounded-3xl border border-[#E8E4F0] shadow-sm">
          <div className="text-4xl mb-3">⏳</div>
          <h1 className="font-playfair text-2xl font-semibold text-[#4A4A4A] mb-2">Consultas temporalmente pausadas</h1>
          <p className="text-sm text-[#8A8A8A] mb-6">
            La agenda de <span className="font-semibold text-[#4A4A4A]">{profile.full_name}</span> no se encuentra recibiendo nuevas consultas en este momento.
          </p>
          <Link
            href="/"
            className="inline-block bg-[#E8E4F0] text-[#9575CD] px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#D1C4E9] transition-colors"
          >
            Volver
          </Link>
        </div>
      </div>
    )
  }

  const cleanPhone = profile.whatsapp_phone.replace(/[^0-9]/g, '')
  const whatsappMsg = encodeURIComponent(
    `Hola ${profile.full_name}, vi tu perfil en línea y me gustaría agendar una consulta psicológica.`
  )
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${whatsappMsg}`

  const specialties = (profile.specialties && Array.isArray(profile.specialties) && profile.specialties.length > 0)
    ? profile.specialties
    : defaultSpecialties

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar de la psicóloga */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-md border-b border-[#E8E4F0]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E8E4F0] to-[#F3F0F8] border border-[#B39DDB]/50 flex items-center justify-center text-lg shadow-sm">
              🌸
            </div>
            <div>
              <h1 className="font-playfair font-semibold text-[#4A4A4A] text-lg leading-tight">
                {profile.full_name}
              </h1>
              <p className="text-xs text-[#8A8A8A]">{profile.title || 'Psicóloga Clínica'}</p>
            </div>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] hover:bg-[#1EBE5D] text-white px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all shadow-sm flex items-center gap-2 hover:scale-[1.02]"
          >
            <span>💬</span>
            <span>Escribir por WhatsApp</span>
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-[#E8E4F0] text-[#9575CD] text-xs font-semibold px-4 py-1.5 rounded-full mb-6 uppercase tracking-wider">
            {profile.title || 'Psicología Clínica Online'}
          </span>
          <h2 className="font-playfair text-4xl sm:text-5xl md:text-6xl font-semibold text-[#4A4A4A] leading-tight mb-6">
            Un espacio seguro y confidencial
            <span className="text-[#B39DDB] italic block sm:inline"> para tu bienestar.</span>
          </h2>
          <p className="text-[#6C757D] text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-10">
            {profile.bio ||
              'Acompañamiento profesional personalizado desde cualquier lugar. Sesiones online por videollamada para cuidar tu salud mental a tu ritmo.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-[#B39DDB] text-white px-8 py-3.5 rounded-full font-medium hover:bg-[#9575CD] transition-all shadow-md shadow-[#B39DDB]/30 flex items-center justify-center gap-2 text-base"
            >
              <span>💬</span>
              <span>Agendar consulta con {profile.full_name.split(' ')[0]}</span>
            </a>
            <a
              href="#especialidades"
              className="w-full sm:w-auto text-[#8A8A8A] hover:text-[#4A4A4A] px-6 py-3.5 rounded-full border border-[#E8E4F0] font-medium text-base transition-colors"
            >
              Ver especialidades
            </a>
          </div>
        </div>
      </section>

      {/* Especialidades */}
      <section id="especialidades" className="py-20 px-6 bg-[#FAFAF8] border-y border-[#E8E4F0]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold text-[#B39DDB] uppercase tracking-wider">Áreas de atención</span>
            <h3 className="font-playfair text-3xl font-semibold text-[#4A4A4A] mt-2">¿Cómo puedo ayudarte?</h3>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {specialties.map((item: any, idx: number) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-8 border border-[#E8E4F0] hover:border-[#B39DDB]/60 transition-all hover:shadow-md"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#F3F0F8] flex items-center justify-center text-2xl mb-5">
                  {item.icon || '🌱'}
                </div>
                <h4 className="font-playfair text-xl font-medium text-[#4A4A4A] mb-2">{item.title}</h4>
                <p className="text-sm text-[#8A8A8A] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-semibold text-[#B39DDB] uppercase tracking-wider">Proceso simple</span>
          <h3 className="font-playfair text-3xl font-semibold text-[#4A4A4A] mt-2 mb-14">¿Cómo iniciar tu consulta?</h3>

          <div className="grid sm:grid-cols-3 gap-8 text-left">
            <div className="bg-[#FAFAF8] p-6 rounded-2xl border border-[#E8E4F0]">
              <span className="text-2xl font-playfair font-bold text-[#B39DDB]">01</span>
              <h4 className="font-medium text-[#4A4A4A] mt-2 mb-1">Escribe por WhatsApp</h4>
              <p className="text-xs text-[#8A8A8A]">
                Haz clic en agendar para coordinar el horario y día que mejor se adapte a ti.
              </p>
            </div>

            <div className="bg-[#FAFAF8] p-6 rounded-2xl border border-[#E8E4F0]">
              <span className="text-2xl font-playfair font-bold text-[#B39DDB]">02</span>
              <h4 className="font-medium text-[#4A4A4A] mt-2 mb-1">Paga con tu link único</h4>
              <p className="text-xs text-[#8A8A8A]">
                Recibirás un enlace seguro para pagar por Pago Móvil o Zelle y subir tu comprobante.
              </p>
            </div>

            <div className="bg-[#FAFAF8] p-6 rounded-2xl border border-[#E8E4F0]">
              <span className="text-2xl font-playfair font-bold text-[#B39DDB]">03</span>
              <h4 className="font-medium text-[#4A4A4A] mt-2 mb-1">Conéctate a Google Meet</h4>
              <p className="text-xs text-[#8A8A8A]">
                Tu enlace de videollamada se activa en la pantalla para entrar directamente a tu sesión.
              </p>
            </div>
          </div>

          <div className="mt-12">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white px-8 py-3.5 rounded-full font-medium shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02]"
            >
              <span>💬</span>
              <span>Iniciar conversación por WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-[#E8E4F0] bg-[#FAFAF8] text-center">
        <p className="text-sm font-medium text-[#4A4A4A] mb-1">{profile.full_name}</p>
        <p className="text-xs text-[#8A8A8A] mb-4">{profile.title || 'Psicología Clínica Online'}</p>
        <div className="inline-flex items-center gap-1.5 text-xs text-[#B39DDB]">
          <span>🌸</span>
          <span>Potenciado por <Link href="/" className="underline hover:text-[#9575CD]">PsicoOnline SaaS</Link></span>
        </div>
      </footer>
    </div>
  )
}
