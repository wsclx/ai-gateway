'use client'

import { useEffect, useState } from 'react'
import { Shield, RefreshCw, Lock } from 'lucide-react'
import { adminApi } from '@/lib/api-client'

export default function AdminSecurityPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reload = async () => {
    try {
      setError(null)
      setLoading(true)
      // Placeholder for future API calls (audit, policies, keys)
      await new Promise((r) => setTimeout(r, 400))
    } catch (e) {
      console.error(e)
      setError('Fehler beim Laden der Sicherheitseinstellungen')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reload()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Sicherheit</h1>
          <p className="text-text-muted">Richtlinien, Rollen und Audit</p>
        </div>
        <button
          onClick={reload}
          disabled={loading}
          className="px-4 py-2 bg-bg-secondary text-text rounded-lg border border-border hover:bg-bg-muted active:scale-[0.98] transition-all duration-fast flex items-center gap-2 disabled:opacity-60"
          aria-label="Neu laden"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Neu laden
        </button>
      </div>

      {error && (
        <div className="bg-error/10 text-error border border-error/20 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-5 w-5 text-text-secondary" />
          <h2 className="text-lg font-semibold text-text">Rollenbasierter Zugriff</h2>
        </div>
        <form className="space-y-4" onSubmit={(e)=>{ e.preventDefault(); alert('Rollen gespeichert'); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1">Admin-Rollen</label>
              <input className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-text" placeholder="admin,dpo" defaultValue="admin,dpo" />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Benutzer-Rollen</label>
              <input className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-text" placeholder="user" defaultValue="user" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-all duration-fast">Speichern</button>
          </div>
        </form>
      </div>
    </div>
  )
}


