'use client'

import { useEffect, useState } from 'react'
import { RefreshCw, Save } from 'lucide-react'
import { adminApi, GatewayConfig } from '@/lib/api-client'

export default function AdminConfigPage() {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [form, setForm] = useState<GatewayConfig>({
    openaiApiKey: '',
    anthropicApiKey: '',
    retentionDays: 365,
    redactionEnabled: false,
    featureDemoMode: true,
    enableAnalytics: true,
  })

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await adminApi.getConfig()
      setForm({
        openaiApiKey: '',
        anthropicApiKey: '',
        retentionDays: data.retentionDays ?? 365,
        redactionEnabled: !!data.redactionEnabled,
        featureDemoMode: !!data.featureDemoMode,
        enableAnalytics: !!data.enableAnalytics,
      })
    } catch (e) {
      console.error(e)
      setError('Fehler beim Laden der Konfiguration')
    } finally {
      setLoading(false)
    }
  }

  const save = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)
      await adminApi.updateConfig(form)
      setSuccess('Konfiguration gespeichert')
      await load()
    } catch (e) {
      console.error(e)
      setError('Fehler beim Speichern der Konfiguration')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Konfiguration</h1>
          <p className="text-text-muted">Provider-Keys und Grundeinstellungen</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} disabled={loading} className="px-4 py-2 bg-bg-secondary text-text rounded-lg border border-border hover:bg-bg-muted active:scale-[0.98] transition-all duration-fast flex items-center gap-2 disabled:opacity-60">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Neu laden
          </button>
          <button onClick={save} disabled={saving} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover active:scale-[0.98] transition-all duration-fast flex items-center gap-2 disabled:opacity-60">
            <Save className="h-4 w-4" /> Speichern
          </button>
        </div>
      </div>

      {error && <div className="bg-error/10 text-error border border-error/20 rounded-xl p-4 text-sm">{error}</div>}
      {success && <div className="bg-success/10 text-success border border-success/20 rounded-xl p-4 text-sm">{success}</div>}

      <div className="bg-card rounded-xl border border-border p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="openaiKey" className="block text-sm text-text-secondary mb-2">OpenAI API Key</label>
            <input id="openaiKey" type="password" value={form.openaiApiKey} onChange={(e) => setForm({ ...form, openaiApiKey: e.target.value })} className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-text" placeholder="sk-..." />
          </div>
          <div>
            <label htmlFor="anthropicKey" className="block text-sm text-text-secondary mb-2">Anthropic API Key</label>
            <input id="anthropicKey" type="password" value={form.anthropicApiKey} onChange={(e) => setForm({ ...form, anthropicApiKey: e.target.value })} className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-text" placeholder="ak-..." />
          </div>
          <div>
            <label htmlFor="retention" className="block text-sm text-text-secondary mb-2">Retention (Tage)</label>
            <input id="retention" type="number" value={form.retentionDays} onChange={(e) => setForm({ ...form, retentionDays: Number(e.target.value) })} className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-text" min={0} />
          </div>
          <div className="flex items-center gap-2 mt-8">
            <input id="redact" type="checkbox" checked={form.redactionEnabled} onChange={(e) => setForm({ ...form, redactionEnabled: e.target.checked })} className="h-4 w-4" />
            <label htmlFor="redact" className="text-sm text-text-secondary">PII-Redaktion aktivieren</label>
          </div>
          <div className="flex items-center gap-2 mt-8">
            <input id="demo" type="checkbox" checked={form.featureDemoMode} onChange={(e) => setForm({ ...form, featureDemoMode: e.target.checked })} className="h-4 w-4" />
            <label htmlFor="demo" className="text-sm text-text-secondary">Demo-Modus aktivieren</label>
          </div>
          <div className="flex items-center gap-2 mt-8">
            <input id="analytics" type="checkbox" checked={form.enableAnalytics} onChange={(e) => setForm({ ...form, enableAnalytics: e.target.checked })} className="h-4 w-4" />
            <label htmlFor="analytics" className="text-sm text-text-secondary">Analytics aktivieren</label>
          </div>
        </div>
      </div>
    </div>
  )
}


