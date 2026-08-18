import Link from 'next/link'

const specialties = [
  { icon: '🧠', title: 'Ansiedad y Estrés', desc: 'Herramientas prácticas para manejar la ansiedad y recuperar tu calma.' },
  { icon: '💔', title: 'Duelo y Pérdidas', desc: 'Acompañamiento compasivo en procesos de duelo y transiciones difíciles.' },
  { icon: '🌱', title: 'Desarrollo Personal', desc: 'Descubre tu potencial y construye la vida que deseas vivir.' },
  { icon: '👫', title: 'Terapia de Pareja', desc: 'Fortalece tu relación con comunicación y comprensión mutua.' },
]

const steps = [
  { number: '01', title: 'Agenda tu cita', desc: 'Elige el horario que mejor se adapte a ti.' },
  { number: '02', title: 'Realiza tu pago', desc: 'Paga fácilmente por Pago Móvil o Zelle con tu comprobante.' },
  { number: '03', title: 'Inicia tu sesión', desc: 'Conéctate por Google Meet desde la comodidad de tu hogar.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E8E4F0]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="font-playfair text-xl font-semibold text-[#4A4A4A]">
            Carmen<span className="text-[#B39DDB]">.</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-[#8A8A8A]">
            <a href="#especialidades" className="hover:text-[#B39DDB] transition-colors">Especialidades</a>
            <a href="#como-funciona" className="hover:text-[#B39DDB] transition-colors">Cómo funciona</a>
            <a href="#contacto" className="hover:text-[#B39DDB] transition-colors">Contacto</a>
          </div>
          <a
            href="#contacto"
            className="bg-[#B39DDB] text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-[#9575CD] transition-colors"
          >
            Agendar consulta
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block bg-[#E8E4F0] text-[#9575CD] text-xs font-medium px-3 py-1 rounded-full mb-6">
                Psicóloga clínica online
              </span>
              <h1 className="font-playfair text-5xl md:text-6xl font-semibold text-[#4A4A4A] leading-tight mb-6">
                Un espacio seguro
                <span className="text-[#B39DDB] italic"> para ti.</span>
              </h1>
              <p className="text-[#8A8A8A] text-lg leading-relaxed mb-8">
                Hola, soy Carmen. Te acompaño en tu proceso de crecimiento personal y bienestar emocional desde la comodidad de tu hogar.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="#contacto"
                  className="bg-[#B39DDB] text-white px-8 py-3 rounded-full font-medium hover:bg-[#9575CD] transition-all hover:shadow-lg hover:shadow-[#B39DDB]/30"
                >
                  Agendar mi consulta
                </a>
                <a
                  href="#como-funciona"
                  className="text-[#4A4A4A] px-8 py-3 rounded-full font-medium border border-[#E8E4F0] hover:border-[#B39DDB] transition-colors"
                >
                  Cómo funciona →
                </a>
              </div>
              <div className="mt-10 flex items-center gap-6 text-sm text-[#8A8A8A]">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">●</span>
                  Consultas disponibles
                </div>
                <div>📍 Venezuela · Online</div>
              </div>
            </div>
            <div className="relative">
              <div className="w-full aspect-square max-w-md mx-auto rounded-3xl bg-gradient-to-br from-[#E8E4F0] to-[#F3F0F8] flex items-center justify-center">
                <div className="text-center">
                  <div className="text-8xl mb-4">🌸</div>
                  <p className="font-playfair text-2xl text-[#B39DDB] font-medium">Carmen</p>
                  <p className="text-[#8A8A8A] text-sm mt-1">Psicóloga Clínica</p>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-lg border border-[#E8E4F0]">
                <p className="text-2xl font-bold text-[#B39DDB] font-playfair">+200</p>
                <p className="text-xs text-[#8A8A8A]">Pacientes atendidos</p>
              </div>
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-lg border border-[#E8E4F0]">
                <p className="text-2xl font-bold text-[#B39DDB] font-playfair">5★</p>
                <p className="text-xs text-[#8A8A8A]">Valoración promedio</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Especialidades */}
      <section id="especialidades" className="py-20 px-6 bg-[#FAFAF8]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-playfair text-4xl font-semibold text-[#4A4A4A] mb-4">Áreas de especialidad</h2>
            <p className="text-[#8A8A8A] text-lg max-w-xl mx-auto">Cada persona es única. Mi enfoque se adapta a tus necesidades y objetivos terapéuticos.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {specialties.map((s) => (
              <div key={s.title} className="bg-white rounded-2xl p-6 border border-[#E8E4F0] hover:border-[#B39DDB] hover:shadow-md transition-all group">
                <div className="text-3xl mb-4">{s.icon}</div>
                <h3 className="font-medium text-[#4A4A4A] mb-2 group-hover:text-[#B39DDB] transition-colors">{s.title}</h3>
                <p className="text-sm text-[#8A8A8A] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-playfair text-4xl font-semibold text-[#4A4A4A] mb-4">¿Cómo funciona?</h2>
            <p className="text-[#8A8A8A] text-lg">Simple, rápido y desde donde estés.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.number} className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#E8E4F0] flex items-center justify-center mx-auto mb-4">
                  <span className="font-playfair text-xl font-bold text-[#B39DDB]">{step.number}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute" />
                )}
                <h3 className="font-medium text-[#4A4A4A] text-lg mb-2">{step.title}</h3>
                <p className="text-[#8A8A8A] text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / Contacto */}
      <section id="contacto" className="py-20 px-6 bg-gradient-to-br from-[#E8E4F0] to-[#F3F0F8]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-playfair text-4xl font-semibold text-[#4A4A4A] mb-4">
            Da el primer paso
          </h2>
          <p className="text-[#8A8A8A] text-lg mb-8">
            Escríbeme por WhatsApp y juntas encontramos el horario ideal para ti.
          </p>
          <a
            href="https://wa.me/584120000000?text=Hola%20Carmen%2C%20me%20gustaría%20agendar%20una%20consulta."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-green-500 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-green-600 transition-all hover:shadow-lg"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Escribir por WhatsApp
          </a>
          <p className="text-[#8A8A8A] text-sm mt-6">
            También puedes escribirme a <span className="text-[#B39DDB]">@carmen.psicologa</span> en Instagram
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center border-t border-[#E8E4F0]">
        <p className="font-playfair text-lg text-[#4A4A4A] mb-1">Carmen<span className="text-[#B39DDB]">.</span></p>
        <p className="text-[#8A8A8A] text-sm">Psicóloga Clínica · Consultas Online · Venezuela</p>
      </footer>
    </div>
  )
}