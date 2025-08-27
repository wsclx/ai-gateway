'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'

export default function AuthCallback() {
  const params = useSearchParams()
  const router = useRouter()
  const [msg, setMsg] = useState('Verarbeite Anmeldung...')

  useEffect(() => {
    const code = params.get('code')
    if (!code) { setMsg('Kein Code übermittelt'); return }
    (async () => {
      const res = await apiClient.microsoftCallback(code)
      if (res.success && res.data) {
        setMsg(`Willkommen, ${res.data.displayName}`)
        setTimeout(() => router.replace('/'), 800)
      } else {
        setMsg(res.error || 'Anmeldung fehlgeschlagen')
      }
    })()
  }, [params, router])

  return <div className="container mx-auto p-6">{msg}</div>
}
