'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { systemApi } from '@/lib/api-client';
import { RefreshCw, Save, Users, BarChart3, Activity, Shield, Database, Settings, Brain, Upload, Download, Play, Pause, RotateCcw } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  lastActive: string;
  status: 'active' | 'inactive';
}

interface SystemService {
  name: string;
  status: 'running' | 'stopped' | 'error';
  uptime: string;
  memory: string;
  cpu: string;
}

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [systemOverview, setSystemOverview] = useState<any>(null);
  const [systemStatus, setSystemStatus] = useState<any>(null);

  const loadSystemData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadSystemData();
  }, [loadSystemData]);

  const handleRefresh = async () => {
    await loadSystemData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Lade Systemdaten...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600 mb-4">
              <Shield className="h-5 w-5" />
              <span className="font-medium">Fehler beim Laden der Daten</span>
            </div>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadSystemData} variant="outline" className="w-full">
              Erneut versuchen
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Systemverwaltung</h1>
          <p className="text-text-muted">Überwachung und Verwaltung des AI Gateway Systems</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Aktualisieren
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Aktive Benutzer</CardTitle>
            <Users className="h-4 w-4 text-accent-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">{systemOverview?.users?.active || 0}</div>
            <p className="text-xs text-text-muted mt-1">Online jetzt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Offene Tickets</CardTitle>
            <BarChart3 className="h-4 w-4 text-accent-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">{systemOverview?.tickets?.open || 0}</div>
            <p className="text-xs text-text-muted mt-1">Benötigen Aufmerksamkeit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Chat Nachrichten</CardTitle>
            <Activity className="h-4 w-4 text-accent-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">{systemOverview?.chat?.total_messages || 0}</div>
            <p className="text-xs text-text-muted mt-1">Heute gesendet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">CPU Auslastung</CardTitle>
            <Database className="h-4 w-4 text-accent-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">{systemOverview?.system?.cpu_usage || 0}%</div>
            <p className="text-xs text-text-muted mt-1">Aktuelle Last</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Übersicht
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Services
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Benutzer
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Logs
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Aktuelle Systemmetriken</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-text-secondary">Uptime:</span>
                    <span className="text-sm font-medium text-text-primary">{systemStatus?.uptime || '0d 0h 0m'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-text-secondary">Speicher:</span>
                    <span className="text-sm font-medium text-text-primary">{systemStatus?.memory || '0%'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-text-secondary">Festplatte:</span>
                    <span className="text-sm font-medium text-text-primary">{systemStatus?.disk || '0%'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Status</CardTitle>
                <CardDescription>Status aller Systemservices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {systemStatus?.services?.map((service: SystemService, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-text-secondary">{service.name}</span>
                      <Badge 
                        variant={service.status === 'running' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {service.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Verwaltung</CardTitle>
              <CardDescription>Verwalten Sie Systemservices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemStatus?.services?.map((service: SystemService, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        service.status === 'running' ? 'bg-green-500' : 
                        service.status === 'stopped' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                      <div>
                        <p className="font-medium text-text-primary">{service.name}</p>
                        <p className="text-sm text-text-muted">Uptime: {service.uptime}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Pause className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Benutzerverwaltung</CardTitle>
              <CardDescription>Verwalten Sie Systembenutzer</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-text-muted">Benutzerverwaltung wird implementiert...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>Überwachen Sie Systemlogs</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-text-muted">Log-Überwachung wird implementiert...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


