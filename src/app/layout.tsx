import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Carmen Psicóloga — Consultas Online',
  description: 'Consultas psicológicas online con Carmen. Espacio seguro, cálido y profesional para tu bienestar emocional.',
  openGraph: {
    title: 'Carmen Psicóloga',
    description: 'Consultas psicológicas online',
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
