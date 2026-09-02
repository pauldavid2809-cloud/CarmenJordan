import Link from 'next/link'

const features = [
  {
    icon: '🌐',
    title: 'Tu propia página web profesional',
    desc: 'Obtén tu enlace público personalizado (ej. psico-online.com/tu-nombre) con tu foto, biografía, especialidades y contacto directo a tu WhatsApp.',
  },
  {
    icon: '💳',
    title: 'Cobros por Pago Móvil y Zelle',
    desc: 'Genera enlaces de pago únicos por consulta. Tus pacientes copian tus datos bancarios en 1 clic y suben el comprobante directamente.',
  },
  {
    icon: '📋',
    title: 'Bandeja de verificación de pagos',
    desc: 'Olvídate de buscar capturas de pantalla perdidas en el chat. Revisa el comprobante, valida la referencia y aprueba la cita desde tu panel.',
  },
  {
    icon: '📹',
    title: 'Integración directa con Google Meet',
    desc: 'Al verificar el pago de la consulta, el paciente desbloquea automáticamente el enlace de su videollamada para ingresar a la hora pautada.',
  },
  {
    icon: '👥',
    title: 'Directorio de pacientes y métricas',
    desc: 'Lleva el historial de tus pacientes, el registro de citas atendidas y el control total de tus ingresos en dólares y bolívares.',
  },
  {
    icon: '⚡',
    title: 'Directo a tu cuenta bancaria',
    desc: 'Sin intermediarios ni retención de dinero. El 100% de los pagos de tus pacientes va directamente a tu propio Pago Móvil o Zelle.',
  },
]

const steps = [
  {
    number: '01',
    title: 'Regístrate en 2 minutos',
    desc: 'Crea tu cuenta, elige tu enlace personalizado y activa tus 3 días de prueba gratis de inmediato.',
  },
  {
    number: '02',
    title: 'Configura tus datos de pago',
    desc: 'Ingresa los datos bancarios donde quieres que tus pacientes te transfieran (Pago Móvil / Zelle).',
  },
  {
    number: '03',
    title: 'Genera links y atiende',
    desc: 'Envía el link de cobro a tu paciente por WhatsApp, aprueba su comprobante y conéctate a tu sesión.',
  },
]

export default function SaaSLandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#4A4A4A]">
      {/* Barra de navegación */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-md border-b border-[#E8E4F0]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-playfair text-2xl font-semibold text-[#4A4A4A] flex items-center gap-2">
            <span className="text-xl">🌸</span>
            <span>Psico<span className="text-[#B39DDB]">Online.</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-[#8A8A8A]">
            <a href="#beneficios" className="hover:text-[#B39DDB] transition-colors">Beneficios</a>
            <a href="#como-funciona" className="hover:text-[#B39DDB] transition-colors">Cómo funciona</a>
            <a href="#precios" className="hover:text-[#B39DDB] transition-colors">Precios</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-[#8A8A8A] hover:text-[#4A4A4A] px-4 py-2 transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              className="bg-[#B39DDB] text-white px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium hover:bg-[#9575CD] transition-all shadow-sm shadow-[#B39DDB]/30 hover:scale-[1.02]"
            >
              Prueba 3 días gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-36 pb-20 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#E8E4F0] text-[#9575CD] text-xs font-semibold px-4 py-1.5 rounded-full mb-6 uppercase tracking-wider">
            <span>✨</span> Plataforma para Psicólogas y Terapeutas Online
          </div>

          <h1 className="font-playfair text-4xl sm:text-5xl md:text-6xl font-semibold text-[#4A4A4A] leading-[1.15] mb-6">
            La forma más profesional de{' '}
            <span className="text-[#B39DDB] italic">cobrar y gestionar</span>{' '}
            tus consultas online.
          </h1>

          <p className="text-[#6C757D] text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed mb-10">
            Comparte tu propio perfil web, genera links de pago en Pago Móvil y Zelle con copiado rápido,
            verifica comprobantes en segundos y entrega el link de Google Meet sin enredos de chat.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/registro"
              className="w-full sm:w-auto bg-[#B39DDB] text-white px-8 py-4 rounded-full font-medium hover:bg-[#9575CD] transition-all shadow-lg shadow-[#B39DDB]/30 hover:scale-[1.02] text-base"
            >
              Comenzar prueba gratis de 3 días 🚀
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto text-[#8A8A8A] hover:text-[#4A4A4A] px-8 py-4 rounded-full border border-[#E8E4F0] font-medium transition-colors text-base"
            >
              Ya tengo una cuenta
            </Link>
          </div>

          {/* Tarjeta de preview visual */}
          <div className="relative mx-auto max-w-4xl rounded-3xl bg-gradient-to-b from-[#FAFAF8] to-white p-4 sm:p-8 border border-[#E8E4F0] shadow-xl">
            <div className="bg-white rounded-2xl p-6 border border-[#E8E4F0] shadow-sm text-left grid md:grid-cols-3 gap-6">
              <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E8E4F0]">
                <span className="text-xs font-semibold text-[#9575CD] uppercase">1. Tu Página Personal</span>
                <p className="font-playfair text-lg font-semibold text-[#4A4A4A] mt-1">psico-online.com/tu-nombre</p>
                <p className="text-xs text-[#8A8A8A] mt-1">Tu perfil con especialidades y botón de WhatsApp listo para compartir.</p>
              </div>
              <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E8E4F0]">
                <span className="text-xs font-semibold text-emerald-600 uppercase">2. Portal de Pago Móvil</span>
                <p className="font-playfair text-lg font-semibold text-[#4A4A4A] mt-1">Links únicos de pago</p>
                <p className="text-xs text-[#8A8A8A] mt-1">Copia con 1 toque banco, cédula y teléfono + subida de comprobante.</p>
              </div>
              <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E8E4F0]">
                <span className="text-xs font-semibold text-sky-600 uppercase">3. Panel Administrativo</span>
                <p className="font-playfair text-lg font-semibold text-[#4A4A4A] mt-1">Control de citas y pagos</p>
                <p className="text-xs text-[#8A8A8A] mt-1">Validación de pagos, métricas de ingresos y acceso a Google Meet.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section id="beneficios" className="py-20 px-6 bg-[#FAFAF8] border-y border-[#E8E4F0]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold text-[#B39DDB] uppercase tracking-wider">Diseñado para terapeutas</span>
            <h2 className="font-playfair text-3xl sm:text-4xl font-semibold text-[#4A4A4A] mt-2">
              Todo lo que necesitas para tu consulta virtual
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-8 border border-[#E8E4F0] hover:border-[#B39DDB]/60 transition-all hover:shadow-md"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#F3F0F8] flex items-center justify-center text-2xl mb-5">
                  {feat.icon}
                </div>
                <h3 className="font-playfair text-xl font-medium text-[#4A4A4A] mb-2">{feat.title}</h3>
                <p className="text-sm text-[#8A8A8A] leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <span className="text-xs font-semibold text-[#B39DDB] uppercase tracking-wider">Simplicidad total</span>
          <h2 className="font-playfair text-3xl sm:text-4xl font-semibold text-[#4A4A4A] mt-2 mb-16">
            Empieza a operar en 3 sencillos pasos
          </h2>

          <div className="grid sm:grid-cols-3 gap-8 text-left">
            {steps.map((st) => (
              <div key={st.number} className="bg-[#FAFAF8] p-8 rounded-3xl border border-[#E8E4F0] relative">
                <span className="font-playfair text-4xl font-bold text-[#B39DDB]/60 block mb-3">{st.number}</span>
                <h3 className="font-playfair text-xl font-medium text-[#4A4A4A] mb-2">{st.title}</h3>
                <p className="text-sm text-[#8A8A8A] leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Precios / Membresía */}
      <section id="precios" className="py-20 px-6 bg-[#FAFAF8] border-t border-[#E8E4F0]">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-semibold text-[#B39DDB] uppercase tracking-wider">Membresía accesible</span>
          <h2 className="font-playfair text-3xl sm:text-4xl font-semibold text-[#4A4A4A] mt-2 mb-4">
            Comienza sin riesgos hoy mismo
          </h2>
          <p className="text-sm text-[#8A8A8A] max-w-xl mx-auto mb-12">
            Disfruta de todas las funciones completas durante 3 días. Luego renueva tu membresía mensual pagando cómodamente por Pago Móvil.
          </p>

          <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border-2 border-[#B39DDB] shadow-lg relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#B39DDB] text-white text-xs font-semibold px-4 py-1 rounded-full uppercase tracking-wider">
              Prueba Inicial
            </div>

            <h3 className="font-playfair text-2xl font-semibold text-[#4A4A4A] mt-2">Plan Profesional</h3>
            <p className="text-xs text-[#8A8A8A] mt-1">Para psicólogas independientes y consultorios</p>

            <div className="my-6 py-4 border-y border-[#E8E4F0]">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold font-playfair text-[#4A4A4A]">3 Días</span>
                <span className="text-lg font-medium text-emerald-600">Gratis</span>
              </div>
              <p className="text-xs text-[#8A8A8A] mt-2">Sin tarjeta de crédito requerida</p>
            </div>

            <ul className="text-left space-y-3 text-sm text-[#4A4A4A] mb-8">
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span> Enlace público propio (psico-online.com/tu-nombre)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span> Enlaces de cobro ilimitados con Pago Móvil y Zelle
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span> Carga y revisión de comprobantes de pago
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span> Enlaces directos a Google Meet
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span> Renovación mensual sencilla por Pago Móvil
              </li>
            </ul>

            <Link
              href="/registro"
              className="block w-full bg-[#B39DDB] text-white py-3.5 rounded-xl font-medium hover:bg-[#9575CD] transition-all shadow-md shadow-[#B39DDB]/30 text-sm"
            >
              Comenzar mis 3 días gratis
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[#E8E4F0] bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌸</span>
            <span className="font-playfair font-semibold text-[#4A4A4A]">PsicoOnline SaaS</span>
            <span className="text-xs text-[#8A8A8A]">© {new Date().getFullYear()}</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-[#8A8A8A]">
            <Link href="/login" className="hover:text-[#B39DDB] transition-colors">Iniciar sesión</Link>
            <Link href="/registro" className="hover:text-[#B39DDB] transition-colors">Registrarse</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}