import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Carmen Jordán — Psicóloga Clínica | Consultas Online',
  description: 'Consultas psicológicas online con Carmen Jordán. Espacio seguro, cálido y profesional para tu bienestar emocional.',
  openGraph: {
    title: 'Carmen Jordán Psicóloga Clínica',
    description: 'Consultas psicológicas online con Carmen Jordán',
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
