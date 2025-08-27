'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Settings, Users, Brain, BarChart3, Activity, Upload, Download, Play, Pause, RotateCcw } from 'lucide-react'

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground">
          Verwaltung und Konfiguration des AI Gateways
        </p>
      </header>
      
      <Tabs defaultValue="config" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Konfiguration
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Benutzer
          </TabsTrigger>
          <TabsTrigger value="training" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Training
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Monitoring
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gateway-Konfiguration</CardTitle>
              <CardDescription>Allgemeine Einstellungen des AI Gateways</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="openai-key">OpenAI API Key</Label>
                  <Input id="openai-key" type="password" placeholder="sk-..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="anthropic-key">Anthropic API Key</Label>
                  <Input id="anthropic-key" type="password" placeholder="sk-ant-..." />
                </div>
              </div>
              <Button className="w-full">Konfiguration speichern</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Benutzerverwaltung</CardTitle>
              <CardDescription>Verwaltung der Systembenutzer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">Max Mustermann</div>
                    <div className="text-sm text-muted-foreground">max@duh.ai</div>
                  </div>
                  <Badge variant="default">Admin</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">Anna Schmidt</div>
                    <div className="text-sm text-muted-foreground">anna@duh.ai</div>
                  </div>
                  <Badge variant="secondary">User</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Training Jobs</CardTitle>
                <CardDescription>Aktive und abgeschlossene Training-Aufgaben</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <div className="font-medium">HR Assistant Training</div>
                      <div className="text-sm text-muted-foreground">Status: Training</div>
                    </div>
                    <Badge variant="default">Aktiv</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <div className="font-medium">IT Support Training</div>
                      <div className="text-sm text-muted-foreground">Status: Abgeschlossen</div>
                    </div>
                    <Badge variant="secondary">Fertig</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Training Konfiguration</CardTitle>
                <CardDescription>Einstellungen für das Training</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="base-model">Basis-Modell</Label>
                  <Input id="base-model" defaultValue="gpt-4o-mini" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="learning-rate">Lernrate</Label>
                  <Input id="learning-rate" type="number" step="0.0001" defaultValue="0.0001" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="epochs">Epochen</Label>
                  <Input id="epochs" type="number" defaultValue="3" />
                </div>
                <Button className="w-full">Training starten</Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Training Daten</CardTitle>
              <CardDescription>Verwaltung der Trainingsdatensätze</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Datensatz hochladen
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Exportieren
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Training Metriken</CardTitle>
              <CardDescription>Performance und Qualitätsmetriken</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">95.2%</div>
                  <div className="text-sm text-muted-foreground">Genauigkeit</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">0.023</div>
                  <div className="text-sm text-muted-foreground">Verlust</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">1.2s</div>
                  <div className="text-sm text-muted-foreground">Antwortzeit</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">€0.15</div>
                  <div className="text-sm text-muted-foreground">Kosten/Request</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System-Analytics</CardTitle>
              <CardDescription>Übersicht über Systemnutzung und Performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground">
                Analytics-Dashboard wird geladen...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System-Monitoring</CardTitle>
              <CardDescription>Live-System-Status und Metriken</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground">
                Monitoring-Dashboard wird geladen...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
