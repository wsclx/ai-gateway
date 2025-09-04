"use client";

import { useState, useEffect } from 'react';
import { TableRowSkeleton } from '@/components/ui/skeleton';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { adminApi } from '@/lib/api-client';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: 'active' | 'inactive';
  last_login?: string;
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    email: '',
    name: '',
    role: 'user' as 'user' | 'admin' | 'dpo',
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const apiUsers = await adminApi.getUsers?.();
        if (!apiUsers) {
          throw new Error('API Error: 404');
        }
        const transformedUsers = (apiUsers as any[]).map((user: any) => ({
          id: user.id,
          email: user.email,
          name: user.display_name || user.email,
          role: user.role || 'user',
          status: user.status || 'active',
          last_login: user.last_login,
          created_at: user.created_at
        }));
        setUsers(transformedUsers);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Fehler beim Laden der Benutzer');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      admin: 'Administrator',
      dpo: 'Datenschutzbeauftragter',
      user: 'Benutzer'
    };
    return labels[role as keyof typeof labels] || role;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-success/10 text-success',
      inactive: 'bg-error/10 text-error'
    };
    const labels = {
      active: 'Aktiv',
      inactive: 'Inaktiv'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-error/10 border border-error/20 rounded-xl p-6 max-w-md">
          <h2 className="text-lg font-semibold text-error mb-2">Fehler</h2>
          <p className="text-text-secondary">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text">Benutzerverwaltung</h1>
            <p className="text-text-secondary mt-1">
              Verwalten Sie Benutzerkonten und Berechtigungen
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            data-testid="open-create-user"
          >
            Neuen Benutzer hinzufügen
          </button>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-text">Alle Benutzer</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-bg-secondary">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">
                    Benutzer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">
                    Rolle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">
                    Letzter Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">
                    Erstellt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRowSkeleton key={i} />
                  ))
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="border-b border-border hover:bg-bg-secondary/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-text">{user.name}</div>
                          <div className="text-sm text-text-secondary">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-text-secondary">
                        {getRoleLabel(user.role)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="px-6 py-4 text-text-secondary">
                        {user.last_login ? formatDate(user.last_login) : 'Nie'}
                      </td>
                      <td className="px-6 py-4 text-text-secondary">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button className="text-primary hover:text-primary-hover transition-colors">
                            Bearbeiten
                          </button>
                          <button className="text-error hover:text-error/80 transition-colors">
                            Löschen
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {showCreate && (
        <div className="fixed inset-0 z-50">
          <button className="absolute inset-0 bg-black/40" aria-label="Close" onClick={() => setShowCreate(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <dialog open className="w-full max-w-md bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-text mb-4">Benutzer hinzufügen</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm text-text-secondary mb-1">Name</label>
                  <input id="name" className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-text" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm text-text-secondary mb-1">E-Mail</label>
                  <input id="email" className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-text" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
                </div>
                <div>
                  <label htmlFor="role" className="block text-sm text-text-secondary mb-1">Rolle</label>
                  <select id="role" className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-text" value={form.role} onChange={e=>setForm({...form, role:e.target.value as any})}>
                    <option value="user">Benutzer</option>
                    <option value="admin">Administrator</option>
                    <option value="dpo">Datenschutzbeauftragter</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button onClick={()=>setShowCreate(false)} className="px-4 py-2 bg-bg-secondary text-text rounded-lg border border-border hover:bg-bg-muted transition-all duration-fast">Abbrechen</button>
                <button
                  onClick={async () => {
                    if (!form.name.trim() || !form.email.trim()) return;
                    try {
                      const created = await adminApi.createUser({ email: form.email.trim(), display_name: form.name.trim(), role: form.role, department: 'IT' });
                      setUsers(prev => [{
                        id: created.id || Math.random().toString(36).slice(2),
                        email: created.email || form.email.trim(),
                        name: created.display_name || form.name.trim(),
                        role: created.role || form.role,
                        status: created.status || 'active',
                        created_at: created.created_at || new Date().toISOString()
                      }, ...prev]);
                      setShowCreate(false);
                      setForm({ email:'', name:'', role:'user' });
                    } catch (e) {}
                  }}
                  data-testid="save-user"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-all duration-fast"
                >
                  Speichern
                </button>
              </div>
            </dialog>
          </div>
        </div>
      )}
    </ErrorBoundary>
  );
}


