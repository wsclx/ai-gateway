"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  DollarSign, 
  Clock,
  Download,
  RefreshCw,
  Activity,
  Zap,
  Target,
  Award
} from 'lucide-react';
import { analyticsApi, AnalyticsResponse } from '@/lib/api-client';

export function AnalyticsPanel() {
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('7d');

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const data = await analyticsApi.getAnalytics();
      setAnalytics(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError('Fehler beim Laden der Analytics-Daten');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const data = await analyticsApi.exportAnalytics(format);
      // Create download link
      const blob = new Blob([format === 'json' ? JSON.stringify(data.data, null, 2) : data.data], {
        type: format === 'json' ? 'application/json' : 'text/csv'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      setError('Export fehlgeschlagen');
    }
  };

  const updateDashboardStats = useCallback(() => {
    // This would update dashboard stats in real-time
    console.log('Updating dashboard stats...');
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">Analytics</h1>
            <p className="text-text-muted">Detaillierte Einblicke in die Nutzung</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">Analytics</h1>
            <p className="text-text-muted">Detaillierte Einblicke in die Nutzung</p>
          </div>
        </div>
        
        <div className="bg-accent-error/10 border border-accent-error/20 rounded-xl p-4">
          <p className="text-accent-error text-sm">{error}</p>
          <button 
            onClick={loadAnalytics}
            className="mt-2 text-accent-error hover:text-accent-error/80 text-sm underline"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">Analytics</h1>
            <p className="text-text-muted">Detaillierte Einblicke in die Nutzung</p>
          </div>
        </div>
        
        <div className="text-center py-12">
          <p className="text-text-muted">Keine Analytics-Daten verfügbar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Analytics</h1>
          <p className="text-text-muted">Detaillierte Einblicke in die Nutzung</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-bg-tertiary border border-border-default rounded-lg px-3 py-2 text-text-primary"
          >
            <option value="7d">Letzte 7 Tage</option>
            <option value="30d">Letzte 30 Tage</option>
            <option value="90d">Letzte 90 Tage</option>
          </select>
          
          <button
            onClick={loadAnalytics}
            className="p-2 bg-bg-tertiary border border-border-default rounded-lg hover:bg-bg-elevated transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-text-secondary" />
          </button>
          
          <button
            onClick={() => handleExport('csv')}
            className="px-3 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-bg-tertiary rounded-xl p-6 border border-border-default">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm">Nachrichten</p>
              <p className="text-2xl font-bold text-text-primary">{analytics.overview.totalMessages}</p>
              <p className="text-sm text-text-secondary mt-1">
                {analytics.overview.totalTokens} Tokens
              </p>
            </div>
            <div className="w-12 h-12 bg-accent-primary/10 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-accent-primary" />
            </div>
          </div>
        </div>

        <div className="bg-bg-tertiary rounded-xl p-6 border border-border-default">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm">Aktive Benutzer</p>
              <p className="text-2xl font-bold text-text-primary">{analytics.overview.activeUsers}</p>
              <p className="text-sm text-text-secondary mt-1">
                {analytics.overview.totalAssistants} Assistenten
              </p>
            </div>
            <div className="w-12 h-12 bg-accent-success/10 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-accent-success" />
            </div>
          </div>
        </div>

        <div className="bg-bg-tertiary rounded-xl p-6 border border-border-default">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm">Kosten</p>
              <p className="text-2xl font-bold text-text-primary">€{analytics.overview.totalCost}</p>
              <p className="text-sm text-text-secondary mt-1">
                {analytics.overview.avgLatency}ms Latenz
              </p>
            </div>
            <div className="w-12 h-12 bg-accent-warning/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-accent-warning" />
            </div>
          </div>
        </div>

        <div className="bg-bg-tertiary rounded-xl p-6 border border-border-default">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm">Performance</p>
              <p className="text-2xl font-bold text-text-primary">{analytics.performance.accuracy.overall}%</p>
              <p className="text-sm text-text-secondary mt-1">
                Genauigkeit
              </p>
            </div>
            <div className="w-12 h-12 bg-accent-purple/10 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-accent-purple" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Usage Chart */}
        <div className="bg-bg-tertiary rounded-xl border border-border-default p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Tägliche Nutzung</h3>
          <div className="space-y-3">
            {analytics.usage.daily.slice(-7).map((day, index) => (
              <div key={day.date} className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">{day.date}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-text-primary">{day.messages} Nachrichten</span>
                  <div className="w-20 h-2 bg-bg-elevated rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent-primary rounded-full"
                      style={{ width: `${(day.messages / Math.max(...analytics.usage.daily.map(d => d.messages))) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Usage */}
        <div className="bg-bg-tertiary rounded-xl border border-border-default p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Nutzung nach Abteilung</h3>
          <div className="space-y-3">
            {analytics.usage.byDepartment.map((dept, index) => (
              <div key={dept.name} className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">{dept.name}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-text-primary">{dept.messages} Nachrichten</span>
                  <span className="text-sm text-text-muted">{dept.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-bg-tertiary rounded-xl border border-border-default p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Performance Metriken</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-accent-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Activity className="w-8 h-8 text-accent-primary" />
            </div>
            <p className="text-sm text-text-muted">Durchschnittliche Latenz</p>
            <p className="text-2xl font-bold text-text-primary">{analytics.performance.responseTime.avg}ms</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-accent-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Award className="w-8 h-8 text-accent-success" />
            </div>
            <p className="text-sm text-text-muted">Benutzerzufriedenheit</p>
            <p className="text-2xl font-bold text-text-primary">{analytics.performance.userSatisfaction.overall}/5</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-accent-warning/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Zap className="w-8 h-8 text-accent-warning" />
            </div>
            <p className="text-sm text-text-muted">P95 Latenz</p>
            <p className="text-2xl font-bold text-text-primary">{analytics.performance.responseTime.p95}ms</p>
          </div>
        </div>
      </div>
    </div>
  );
}
