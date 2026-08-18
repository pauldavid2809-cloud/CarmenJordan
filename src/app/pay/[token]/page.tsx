import { createClient } from '@/lib/supabase/server'
import PaymentPortal from '@/components/payment/PaymentPortal'
import { notFound } from 'next/navigation'

export default async function PayPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()

  const { data: link } = await supabase
    .from('payment_links')
    .select(`
      *,
      appointments(*,clients(name,phone))
    `)
    .eq('token', token)
    .single()

  if (!link) return notFound()

  const { data: proof } = await supabase
    .from('payment_proofs')
    .select('*')
    .eq('payment_link_id', link.id)
    .single()

  return <PaymentPortal link={link as any} existingProof={proof as any} />
}