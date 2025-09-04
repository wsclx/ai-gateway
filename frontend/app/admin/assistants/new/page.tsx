"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { assistantsApi, AssistantCreate } from '@/lib/api-client';

export default function NewAssistantPage() {
  const router = useRouter();
  const [form, setForm] = useState<AssistantCreate>({ name: '', description: '', instructions: '', model: 'gpt-4o' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!form.name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await assistantsApi.createAssistant(form);
      router.push('/');
    } catch (e: any) {
      setError(e?.message || 'Fehler beim Erstellen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Neuen Assistenten erstellen</h1>
      {error && <div className="bg-error/10 border border-error/20 rounded-lg p-3 text-error text-sm">{error}</div>}
      <div className="space-y-3">
        <div>
          <label className="block text-sm text-text-secondary mb-1">Name</label>
          <input className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1">Beschreibung</label>
          <textarea className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 h-24" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1">Anweisungen</label>
          <textarea className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 h-24" value={form.instructions} onChange={e=>setForm({...form, instructions:e.target.value})} />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1">Modell</label>
          <select className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2" value={form.model} onChange={e=>setForm({...form, model:e.target.value})}>
            <option value="gpt-4o">gpt-4o</option>
            <option value="gpt-4o-mini">gpt-4o-mini</option>
          </select>
        </div>
      </div>
      <div className="flex gap-2">
        <button disabled={loading} onClick={submit} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors">Erstellen</button>
        <button disabled={loading} onClick={()=>router.back()} className="px-4 py-2 bg-bg-secondary rounded-lg border border-border">Abbrechen</button>
      </div>
    </div>
  );
}
