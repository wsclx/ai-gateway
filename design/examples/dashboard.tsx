'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  MessageSquare, 
  BarChart3, 
  TrendingUp, 
  Activity,
  Plus,
  Search,
  Filter,
  Download
} from 'lucide-react';

// Mock-Daten für das Dashboard
const mockStats = [
  { title: 'Aktive Benutzer', value: '1,234', change: '+12%', icon: Users, color: 'text-blue-600' },
  { title: 'Chat-Nachrichten', value: '45,678', change: '+8%', icon: MessageSquare, color: 'text-green-600' },
  { title: 'API-Aufrufe', value: '89,123', change: '+15%', icon: BarChart3, color: 'text-purple-600' },
  { title: 'Durchschnittszeit', value: '2.3s', change: '-5%', icon: TrendingUp, color: 'text-orange-600' }
];

const mockRecentActivity = [
  { id: 1, user: 'Max Mustermann', action: 'hat eine neue Nachricht gesendet', time: 'vor 2 Minuten', type: 'message' },
  { id: 2, user: 'Anna Schmidt', action: 'hat sich angemeldet', time: 'vor 5 Minuten', type: 'login' },
  { id: 3, user: 'Tom Weber', action: 'hat Einstellungen geändert', time: 'vor 10 Minuten', type: 'settings' },
  { id: 4, user: 'Lisa Müller', action: 'hat einen neuen Assistenten erstellt', time: 'vor 15 Minuten', type: 'assistant' }
];

export default function DashboardExample() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Willkommen zurück! Hier ist eine Übersicht über Ihre Aktivitäten.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Neuer Assistent
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">
                <span className={stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                  {stat.change}
                </span>{' '}
                seit letztem Monat
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Übersicht
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Benutzer
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Aktivität
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Schnellaktionen</CardTitle>
              <CardDescription>
                Häufig verwendete Funktionen für einen schnellen Zugriff
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Users className="h-6 w-6" />
                  <span className="text-sm">Benutzer verwalten</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <MessageSquare className="h-6 w-6" />
                  <span className="text-sm">Chat starten</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <BarChart3 className="h-6 w-6" />
                  <span className="text-sm">Berichte anzeigen</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Activity className="h-6 w-6" />
                  <span className="text-sm">System-Status</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Letzte Aktivitäten</CardTitle>
              <CardDescription>
                Übersicht über die neuesten Benutzeraktivitäten
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg border">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-gray-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.user}
                      </p>
                      <p className="text-sm text-gray-500">
                        {activity.action}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <Badge variant="secondary" className="text-xs">
                        {activity.time}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          {/* User Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Benutzerverwaltung</CardTitle>
                  <CardDescription>
                    Verwalten Sie alle Systembenutzer und deren Berechtigungen
                  </CardDescription>
                </div>
                <Button>Neuen Benutzer hinzufügen</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Benutzer suchen..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">MM</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Max Mustermann</p>
                      <p className="text-sm text-gray-500">max@firma.de</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="default">Admin</Badge>
                    <Button variant="outline" size="sm">Bearbeiten</Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-green-600">AS</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Anna Schmidt</p>
                      <p className="text-sm text-gray-500">anna@firma.de</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary">User</Badge>
                    <Button variant="outline" size="sm">Bearbeiten</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Analytics-Übersicht</CardTitle>
              <CardDescription>
                Detaillierte Einblicke in die Systemnutzung und Performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Analytics-Dashboard
                </h3>
                <p className="text-gray-500 mb-4">
                  ***[Platzhalter: Detaillierte Analytics-Daten werden hier angezeigt]***
                </p>
                <Button>Vollständige Analytics anzeigen</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          {/* Activity Log */}
          <Card>
            <CardHeader>
              <CardTitle>Aktivitätsprotokoll</CardTitle>
              <CardDescription>
                Vollständiges Protokoll aller Systemaktivitäten
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aktivitätsprotokoll
                </h3>
                <p className="text-gray-500 mb-4">
                  ***[Platzhalter: Detaillierte Aktivitätsprotokolle werden hier angezeigt]***
                </p>
                <Button>Vollständiges Protokoll anzeigen</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
