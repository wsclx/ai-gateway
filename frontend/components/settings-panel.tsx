'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  User, 
  Shield, 
  Bell, 
  Palette, 
  Database, 
  Key, 
  Save,
  Loader2,
  Trash2
} from 'lucide-react';

export function SettingsPanel() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    profile: {
      name: 'Max Mustermann',
      email: 'max@example.com',
      department: 'IT',
      language: 'de'
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: 30,
      passwordExpiry: 90
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      ticketUpdates: true,
      systemAlerts: true
    },
    appearance: {
      theme: 'dark',
      compactMode: false,
      showAvatars: true
    }
  });

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Einstellungen</h1>
          <p className="text-text-muted">Verwalten Sie Ihre persönlichen Einstellungen</p>
        </div>
        <Button onClick={handleSave} disabled={isLoading} className="flex items-center gap-2">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Speichern
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Sicherheit
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Benachrichtigungen
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Erscheinungsbild
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Persönliche Informationen</CardTitle>
              <CardDescription>Ihre grundlegenden Profilinformationen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={settings.profile.name}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      profile: { ...prev.profile, name: e.target.value }
                    }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-Mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      profile: { ...prev.profile, email: e.target.value }
                    }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="department">Abteilung</Label>
                  <Input
                    id="department"
                    value={settings.profile.department}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      profile: { ...prev.profile, department: e.target.value }
                    }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="language">Sprache</Label>
                  <select
                    id="language"
                    value={settings.profile.language}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      profile: { ...prev.profile, language: e.target.value }
                    }))}
                    className="w-full mt-1 p-2 border border-border-default rounded-lg bg-bg-elevated text-text-primary"
                  >
                    <option value="de">Deutsch</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sicherheitseinstellungen</CardTitle>
              <CardDescription>Verwalten Sie Ihre Sicherheitsoptionen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Zwei-Faktor-Authentifizierung</Label>
                  <p className="text-sm text-text-muted">Erhöhte Sicherheit für Ihr Konto</p>
                </div>
                <Switch
                  checked={settings.security.twoFactorEnabled}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, twoFactorEnabled: checked }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="sessionTimeout">Session-Timeout (Minuten)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, sessionTimeout: parseInt(e.target.value) }
                  }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="passwordExpiry">Passwort-Ablauf (Tage)</Label>
                <Input
                  id="passwordExpiry"
                  type="number"
                  value={settings.security.passwordExpiry}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, passwordExpiry: parseInt(e.target.value) }
                  }))}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Benachrichtigungseinstellungen</CardTitle>
              <CardDescription>Konfigurieren Sie Ihre Benachrichtigungen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>E-Mail-Benachrichtigungen</Label>
                  <p className="text-sm text-text-muted">Wichtige Updates per E-Mail</p>
                </div>
                <Switch
                  checked={settings.notifications.emailNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, emailNotifications: checked }
                  }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Push-Benachrichtigungen</Label>
                  <p className="text-sm text-text-muted">Sofortige Benachrichtigungen</p>
                </div>
                <Switch
                  checked={settings.notifications.pushNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, pushNotifications: checked }
                  }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Ticket-Updates</Label>
                  <p className="text-sm text-text-muted">Updates zu Ihren Tickets</p>
                </div>
                <Switch
                  checked={settings.notifications.ticketUpdates}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, ticketUpdates: checked }
                  }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>System-Alerts</Label>
                  <p className="text-sm text-text-muted">Wichtige Systemmeldungen</p>
                </div>
                <Switch
                  checked={settings.notifications.systemAlerts}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, systemAlerts: checked }
                  }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Erscheinungsbild</CardTitle>
              <CardDescription>Passen Sie das Aussehen der Anwendung an</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="theme">Theme</Label>
                <select
                  id="theme"
                  value={settings.appearance.theme}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    appearance: { ...prev.appearance, theme: e.target.value }
                  }))}
                  className="w-full mt-1 p-2 border border-border-default rounded-lg bg-bg-elevated text-text-primary"
                >
                  <option value="dark">Dunkel</option>
                  <option value="light">Hell</option>
                  <option value="auto">Automatisch</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Kompakter Modus</Label>
                  <p className="text-sm text-text-muted">Reduzierte Abstände für mehr Inhalt</p>
                </div>
                <Switch
                  checked={settings.appearance.compactMode}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    appearance: { ...prev.appearance, compactMode: checked }
                  }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Avatare anzeigen</Label>
                  <p className="text-sm text-text-muted">Benutzerbilder in der Anwendung</p>
                </div>
                <Switch
                  checked={settings.appearance.showAvatars}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    appearance: { ...prev.appearance, showAvatars: checked }
                  }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
