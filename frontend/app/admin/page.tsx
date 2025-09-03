'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Database, 
  Shield, 
  Settings, 
  Activity, 
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  Server,
  Network,
  HardDrive,
  Cpu,
  Zap,
  Loader2
} from 'lucide-react';
import { systemApi, SystemOverview, SystemStatus } from '@/lib/api-client';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [systemOverview, setSystemOverview] = useState<SystemOverview | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSystemData();
  }, []);

  const loadSystemData = async () => {
    try {
      setLoading(true);
      const [overview, status] = await Promise.all([
        systemApi.getSystemOverview(),
        systemApi.getSystemStatus()
      ]);
      setSystemOverview(overview);
      setSystemStatus(status);
      setError(null);
    } catch (err) {
      console.error('Failed to load system data:', err);
      setError('Fehler beim Laden der Systemdaten');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-accent-success';
      case 'warning': return 'text-accent-warning';
      case 'error': return 'text-accent-error';
      default: return 'text-text-muted';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-accent-success/10';
      case 'warning': return 'bg-accent-warning/10';
      case 'error': return 'bg-accent-error/10';
      default: return 'bg-text-muted/10';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Verwaltung</h1>
          <p className="text-text-muted">Systemverwaltung und Konfiguration</p>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-accent-primary animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Verwaltung</h1>
        <p className="text-text-muted">Systemverwaltung und Konfiguration</p>
      </div>

      {error && (
        <div className="bg-accent-error/10 border border-accent-error/20 rounded-xl p-4">
          <p className="text-accent-error text-sm">{error}</p>
          <button 
            onClick={loadSystemData}
            className="mt-2 text-accent-error hover:text-accent-error/80 text-sm underline"
          >
            Erneut versuchen
          </button>
        </div>
      )}

      {/* Hinweis: Tabs entfernt, Navigation erfolgt über Sidebar-Einträge */}

      {/* Content */}
      {activeTab === 'overview' && systemOverview && (
        <div className="space-y-6">
          {/* System Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-bg-tertiary rounded-xl p-6 border border-border-default">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-muted text-sm">Aktive Benutzer</p>
                  <p className="text-2xl font-bold text-text-primary">{systemOverview.users.active}</p>
                  <p className="text-sm text-text-secondary mt-1">
                    {systemOverview.users.new_this_week} diese Woche
                  </p>
                </div>
                <div className="w-12 h-12 bg-accent-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-accent-primary" />
                </div>
              </div>
            </div>

            <div className="bg-bg-tertiary rounded-xl p-6 border border-border-default">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-muted text-sm">Offene Tickets</p>
                  <p className="text-2xl font-bold text-text-primary">{systemOverview.tickets.open}</p>
                  <p className="text-sm text-text-secondary mt-1">
                    {systemOverview.tickets.total} insgesamt
                  </p>
                </div>
                <div className="w-12 h-12 bg-accent-warning/10 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-accent-warning" />
                </div>
              </div>
            </div>

            <div className="bg-bg-tertiary rounded-xl p-6 border border-border-default">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-muted text-sm">Chat Nachrichten</p>
                  <p className="text-2xl font-bold text-text-primary">{systemOverview.chat.total_messages}</p>
                  <p className="text-sm text-text-secondary mt-1">
                    {systemOverview.chat.avg_messages_per_thread} pro Thread
                  </p>
                </div>
                <div className="w-12 h-12 bg-accent-success/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-accent-success" />
                </div>
              </div>
            </div>

            <div className="bg-bg-tertiary rounded-xl p-6 border border-border-default">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-muted text-sm">System Load</p>
                  <p className="text-2xl font-bold text-text-primary">{systemOverview.system.cpu_usage}%</p>
                  <p className="text-sm text-text-secondary mt-1">
                    Uptime: {systemOverview.system.uptime}
                  </p>
                </div>
                <div className="w-12 h-12 bg-accent-purple/10 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-accent-purple" />
                </div>
              </div>
            </div>
          </div>

          {/* System Status */}
          {systemStatus && (
            <div className="bg-bg-tertiary rounded-xl border border-border-default p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                System Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {systemStatus.services.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-bg-elevated rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${getStatusBg(service.status)} rounded-lg flex items-center justify-center`}>
                        <div className={getStatusColor(service.status)}>
                          {service.name === 'Database' && <Database className="w-5 h-5" />}
                          {service.name === 'API Server' && <Server className="w-5 h-5" />}
                          {service.name === 'Storage' && <HardDrive className="w-5 h-5" />}
                          {service.name === 'CPU' && <Cpu className="w-5 h-5" />}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">{service.name}</p>
                        <p className="text-xs text-text-muted">{service.details}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-text-secondary">{service.value}</span>
                      <div className={`w-2 h-2 rounded-full ${
                        service.status === 'operational' ? 'bg-accent-success' :
                        service.status === 'warning' ? 'bg-accent-warning' :
                        'bg-accent-error'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-bg-tertiary rounded-xl border border-border-default p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Benutzerverwaltung</h3>
          <p className="text-text-muted">Benutzerverwaltung wird implementiert...</p>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="bg-bg-tertiary rounded-xl border border-border-default p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Systemeinstellungen</h3>
          <p className="text-text-muted">Systemeinstellungen werden implementiert...</p>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="bg-bg-tertiary rounded-xl border border-border-default p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Sicherheitseinstellungen</h3>
          <p className="text-text-muted">Sicherheitseinstellungen werden implementiert...</p>
        </div>
      )}
    </div>
  );
}
