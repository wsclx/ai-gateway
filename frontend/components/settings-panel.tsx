"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  User, 
  Shield, 
  Database, 
  Bell, 
  Globe, 
  Key,
  Save,
  RefreshCw,
  Trash2
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

export function SettingsPanel() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    // User Settings
    display_name: "",
    email: "",
    department: "IT",
    role: "user",
    language: "de",
    timezone: "Europe/Berlin",
    
    // Security Settings
    two_factor_enabled: false,
    session_timeout: 30,
    password_expiry: 90,
    login_notifications: true,
    
    // AI Settings
    default_assistant: "",
    max_tokens: 4000,
    temperature: 0.7,
    autoSave: true,
    
    // Privacy Settings
    data_retention: 365,
    analytics_tracking: true,
    feedback_collection: true,
    prompt_history: true
  });

  // Load settings on mount
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      const res = await apiClient.getUserSettings();
      if (res.success && res.data) {
        setSettings(prev => ({
          ...prev,
          display_name: res.data?.display_name ?? prev.display_name,
          email: res.data?.email ?? prev.email,
          department: res.data?.department ?? prev.department,
          role: res.data?.role ?? prev.role,
          language: res.data?.language ?? prev.language,
          timezone: res.data?.timezone ?? prev.timezone,
          default_assistant: res.data?.default_assistant ?? prev.default_assistant,
          max_tokens: typeof res.data?.max_tokens === 'number' ? res.data.max_tokens : prev.max_tokens,
          temperature: typeof res.data?.temperature === 'number' ? res.data.temperature : prev.temperature,
          two_factor_enabled: res.data?.two_factor_enabled ?? prev.two_factor_enabled,
          session_timeout: res.data?.session_timeout ?? prev.session_timeout,
          password_expiry: res.data?.password_expiry ?? prev.password_expiry,
          login_notifications: res.data?.login_notifications ?? prev.login_notifications,
          data_retention: res.data?.data_retention ?? prev.data_retention,
          analytics_tracking: res.data?.analytics_tracking ?? prev.analytics_tracking,
          feedback_collection: res.data?.feedback_collection ?? prev.feedback_collection,
          prompt_history: res.data?.prompt_history ?? prev.prompt_history,
        }));
      } else {
        setLoadError(res.error || 'Fehler beim Laden der Einstellungen');
      }
      setIsLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const payload = {
        display_name: settings.display_name,
        role: settings.role,
        language: settings.language,
        timezone: settings.timezone,
        default_assistant: settings.default_assistant,
        max_tokens: settings.max_tokens,
        temperature: settings.temperature,
        two_factor_enabled: settings.two_factor_enabled,
        session_timeout: settings.session_timeout,
        password_expiry: settings.password_expiry,
        login_notifications: settings.login_notifications,
        data_retention: settings.data_retention,
        analytics_tracking: settings.analytics_tracking,
        feedback_collection: settings.feedback_collection,
        prompt_history: settings.prompt_history,
      };
      const res = await apiClient.updateUserSettings(payload);
      if (res.success && res.data) {
        setSettings(prev => ({ ...prev, ...res.data }));
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    // reload from server
    (async () => {
      setIsLoading(true);
      const res = await apiClient.getUserSettings();
      if (res.success && res.data) setSettings(prev => ({ ...prev, ...res.data } as any));
      setIsLoading(false);
    })();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Einstellungen</h2>
          <p className="text-muted-foreground">
            Konfiguriere deine DUH AI Gateway Einstellungen
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Zurücksetzen
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Speichern
          </Button>
        </div>
      </div>

      {loadError && (
        <div className="text-sm text-amber-600">{loadError}</div>
      )}

      <Tabs defaultValue="user" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="user">
            <User className="h-4 w-4 mr-2" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Sicherheit
          </TabsTrigger>
          <TabsTrigger value="ai">
            <Settings className="h-4 w-4 mr-2" />
            AI
          </TabsTrigger>
          <TabsTrigger value="privacy">
            <Database className="h-4 w-4 mr-2" />
            Datenschutz
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Benachrichtigungen
          </TabsTrigger>
        </TabsList>

        {/* User Profile Tab */}
        <TabsContent value="user" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profil-Einstellungen</CardTitle>
              <CardDescription>
                Persönliche Informationen und Präferenzen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Anzeigename</Label>
                  <Input
                    id="displayName"
                    value={settings.display_name}
                    onChange={(e) => setSettings({...settings, display_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail</Label>
                  <Input
                    id="email"
                    value={settings.email}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Abteilung</Label>
                  <Select value={settings.department} onValueChange={(value) => setSettings({...settings, department: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Rolle</Label>
                  <Select value={settings.role} onValueChange={(value) => setSettings({...settings, role: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Benutzer</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Sprache</Label>
                  <Select value={settings.language} onValueChange={(value) => setSettings({...settings, language: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Zeitzone</Label>
                  <Select value={settings.timezone} onValueChange={(value) => setSettings({...settings, timezone: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Berlin">Europe/Berlin</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sicherheitseinstellungen</CardTitle>
              <CardDescription>
                Konfiguriere Sicherheitsoptionen und Zugriffskontrollen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Zwei-Faktor-Authentifizierung</Label>
                  <p className="text-sm text-muted-foreground">
                    Erhöhe die Sicherheit deines Kontos
                  </p>
                </div>
                <Switch
                  checked={settings.two_factor_enabled}
                  onCheckedChange={(checked) => setSettings({...settings, two_factor_enabled: checked})}
                />
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session-Timeout (Minuten)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.session_timeout}
                    onChange={(e) => setSettings({...settings, session_timeout: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordExpiry">Passwort-Ablauf (Tage)</Label>
                  <Input
                    id="passwordExpiry"
                    type="number"
                    value={settings.password_expiry}
                    onChange={(e) => setSettings({...settings, password_expiry: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Login-Benachrichtigungen</Label>
                  <p className="text-sm text-muted-foreground">
                    Erhalte E-Mails bei neuen Anmeldungen
                  </p>
                </div>
                <Switch
                  checked={settings.login_notifications}
                  onCheckedChange={(checked) => setSettings({...settings, login_notifications: checked})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Tab */}
        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Einstellungen</CardTitle>
              <CardDescription>
                Konfiguriere deine AI-Assistenten und deren Verhalten
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="defaultAssistant">Standard-Assistent</Label>
                <Select value={settings.default_assistant} onValueChange={(value) => setSettings({...settings, default_assistant: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Allgemeiner Assistent</SelectItem>
                    <SelectItem value="hr">HR-Assistent</SelectItem>
                    <SelectItem value="it">IT-Support</SelectItem>
                    <SelectItem value="marketing">Marketing-Assistent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxTokens">Max. Token</Label>
                  <Input
                    id="maxTokens"
                    type="number"
                    value={settings.max_tokens}
                    onChange={(e) => setSettings({...settings, max_tokens: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temperature">Kreativität (0-1)</Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={settings.temperature}
                    onChange={(e) => setSettings({...settings, temperature: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Automatisches Speichern</Label>
                  <p className="text-sm text-muted-foreground">
                    Speichere Konversationen automatisch
                  </p>
                </div>
                <Switch
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => setSettings({...settings, autoSave: checked})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Datenschutz-Einstellungen</CardTitle>
              <CardDescription>
                Kontrolliere, wie deine Daten gespeichert und verwendet werden
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dataRetention">Datenaufbewahrung (Tage)</Label>
                <Input
                  id="dataRetention"
                  type="number"
                  value={settings.data_retention}
                  onChange={(e) => setSettings({...settings, data_retention: parseInt(e.target.value)})}
                />
                <p className="text-sm text-muted-foreground">
                  Nach diesem Zeitraum werden deine Daten automatisch gelöscht
                </p>
              </div>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify_between">
                  <div className="space-y-0.5">
                    <Label>Analytics-Tracking</Label>
                    <p className="text-sm text-muted-foreground">
                      Erlaube anonymisierte Nutzungsstatistiken
                    </p>
                  </div>
                  <Switch
                    checked={settings.analytics_tracking}
                    onCheckedChange={(checked) => setSettings({...settings, analytics_tracking: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Feedback-Sammlung</Label>
                    <p className="text-sm text-muted-foreground">
                      Erlaube Feedback für Verbesserungen
                    </p>
                  </div>
                  <Switch
                    checked={settings.feedback_collection}
                    onCheckedChange={(checked) => setSettings({...settings, feedback_collection: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Prompt-Verlauf</Label>
                    <p className="text-sm text-muted-foreground">
                      Speichere deine Konversationsverläufe
                    </p>
                  </div>
                  <Switch
                    checked={settings.prompt_history}
                    onCheckedChange={(checked) => setSettings({...settings, prompt_history: checked})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Benachrichtigungen</CardTitle>
              <CardDescription>
                Konfiguriere, wann und wie du benachrichtigt werden möchtest
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>E-Mail-Benachrichtigungen</Label>
                    <p className="text-sm text-muted-foreground">
                      Erhalte wichtige Updates per E-Mail
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push-Benachrichtigungen</Label>
                    <p className="text-sm text-muted-foreground">
                      Erhalte sofortige Browser-Benachrichtigungen
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Wöchentliche Zusammenfassung</Label>
                    <p className="text-sm text-muted-foreground">
                      Erhalte eine wöchentliche Übersicht deiner Aktivitäten
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
