import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PsicoOnline — Psicología Clínica | Consultas Online',
  description: 'Consultas psicológicas online. Un espacio seguro, confidencial y profesional para tu bienestar emocional y crecimiento personal.',
  openGraph: {
    title: 'PsicoOnline — Consultas Psicológicas',
    description: 'Consultas psicológicas online y terapia personalizada.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
