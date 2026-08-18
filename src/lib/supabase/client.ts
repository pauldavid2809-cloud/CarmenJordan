import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sdvlaeulvohfpfqaypiw.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkdmxhZXVsdm9oZnBmcWF5cGl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MTM1NDMsImV4cCI6MjA5NTM4OTU0M30.RxS3r5h2DDoagZM197QxGfR0nAZPqk3X8Z9KOrH75vA'

  return createBrowserClient(url, key)
}
