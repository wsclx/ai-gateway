"use client";

import { useState, useEffect } from 'react';
import { systemApi } from '@/lib/api-client';
import { StatCardSkeleton } from '@/components/ui/skeleton';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Server, Database, Activity, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  active_connections: number;
  requests_per_minute: number;
  error_rate: number;
}

interface SystemStatus {
  database: 'healthy' | 'warning' | 'error';
  redis: 'healthy' | 'warning' | 'error';
  api: 'healthy' | 'warning' | 'error';
  storage: 'healthy' | 'warning' | 'error';
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  component: string;
  message: string;
}

export default function SystemPage() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSystemData = async () => {
      try {
        setLoading(true);
        const overview = await systemApi.getSystemOverview();
        const statusResp = await systemApi.getSystemStatus();
        // Replace infra metrics with AI-Gateway KPIs
        setMetrics({
          cpu_usage: undefined as any,
          memory_usage: undefined as any,
          disk_usage: undefined as any,
          active_connections: overview.chat.total_threads,
          requests_per_minute: overview.chat.total_messages,
          error_rate: 0,
        } as any);
        const statusMap: any = {};
        statusResp.services.forEach((s)=>{ statusMap[s.name.toLowerCase()] = s.status === 'operational' ? 'healthy' : (s.status as any); });
        setStatus({
          database: statusMap.database || 'healthy',
          redis: statusMap.storage || 'healthy',
          api: statusMap['api server'] || 'healthy',
          storage: statusMap.storage || 'healthy',
        });
        setLogs([{ id: '1', timestamp: new Date().toISOString(), level: 'info', component: 'API', message: 'Metriken geladen' }]);
      } catch (err) {
        setError('Fehler beim Laden der Systemdaten');
      } finally {
        setLoading(false);
      }
    };
    fetchSystemData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-DE');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-error" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      healthy: 'Gesund',
      warning: 'Warnung',
      error: 'Fehler'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getLogLevelBadge = (level: string) => {
    const styles = {
      info: 'bg-primary/10 text-primary',
      warning: 'bg-warning/10 text-warning',
      error: 'bg-error/10 text-error'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${styles[level as keyof typeof styles]}`}>
        {level.toUpperCase()}
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
        <div>
          <h1 className="text-3xl font-bold text-text">Systemverwaltung</h1>
          <p className="text-text-secondary mt-1">
            Überwachen Sie Systemleistung und Gesundheit
          </p>
        </div>

        {/* System Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))
          ) : metrics ? (
            <>
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-text-muted text-sm">Aktive Konversationen</p>
                    <p className="text-2xl font-bold text-text mt-1">{metrics.active_connections}</p>
                  </div>
                  <div className="p-3 bg-bg-secondary rounded-lg">
                    <Activity className="h-5 w-5 text-text-secondary" />
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-text-muted text-sm">Nachrichten (insg.)</p>
                    <p className="text-2xl font-bold text-text mt-1">{metrics.requests_per_minute.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-bg-secondary rounded-lg">
                    <Activity className="h-5 w-5 text-text-secondary" />
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-text-muted text-sm">Fehlerrate</p>
                    <p className="text-2xl font-bold text-text mt-1">{(metrics.error_rate * 100).toFixed(2)}%</p>
                  </div>
                  <div className="p-3 bg-bg-secondary rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-text-secondary" />
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* System Status */}
        <div className="bg-card rounded-xl border border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-text">Systemstatus</h2>
          </div>
          
          {status && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(status).map(([component, componentStatus]) => (
                <div key={component} className="flex items-center justify-between p-4 bg-bg-secondary rounded-lg">
                  <div>
                    <p className="font-medium text-text capitalize">{component}</p>
                    <p className="text-sm text-text-secondary">{getStatusLabel(componentStatus)}</p>
                  </div>
                  {getStatusIcon(componentStatus)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Logs */}
        <div className="bg-card rounded-xl border border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-text">Systemprotokoll</h2>
          </div>
          
          <div className="divide-y divide-border">
            {logs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-bg-secondary/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      {getLogLevelBadge(log.level)}
                      <span className="text-sm font-medium text-text">{log.component}</span>
                      <span className="text-xs text-text-muted">{formatDate(log.timestamp)}</span>
                    </div>
                    <p className="text-text-secondary">{log.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}


