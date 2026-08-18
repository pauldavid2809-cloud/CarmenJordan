import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-VE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleTimeString('es-VE', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatCurrency(amount: number, currency: 'USD' | 'BS'): string {
  if (currency === 'USD') {
    return `$${amount.toFixed(2)} USD`
  }
  return `Bs. ${amount.toLocaleString('es-VE', { minimumFractionDigits: 2 })}`
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pendiente: 'bg-amber-100 text-amber-700 border-amber-200',
    subido: 'bg-blue-100 text-blue-700 border-blue-200',
    verificado: 'bg-green-100 text-green-700 border-green-200',
    rechazado: 'bg-red-100 text-red-700 border-red-200',
    completada: 'bg-purple-100 text-purple-700 border-purple-200',
    cancelada: 'bg-gray-100 text-gray-600 border-gray-200',
    pagada: 'bg-green-100 text-green-700 border-green-200',
  }
  return colors[status] || 'bg-gray-100 text-gray-600 border-gray-200'
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pendiente: 'Pendiente',
    subido: 'Comprobante subido',
    verificado: 'Verificado',
    rechazado: 'Rechazado',
    completada: 'Completada',
    cancelada: 'Cancelada',
    pagada: 'Pagada',
  }
  return labels[status] || status
}

export function generateWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '')
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`
}
