'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Palette, 
  Building2, 
  Globe, 
  Image, 
  Save, 
  Upload, 
  Eye,
  EyeOff,
  Download,
  RefreshCw
} from 'lucide-react';
import { BrandingConfig, defaultBranding } from '@/lib/branding';

export default function BrandingPage() {
  const [config, setConfig] = useState<BrandingConfig>(defaultBranding);
  const [activeTab, setActiveTab] = useState('company');
  const [isEditing, setIsEditing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Handler für Konfigurationsänderungen
  const handleConfigChange = (path: string, value: any) => {
    setConfig(prev => {
      const newConfig = { ...prev };
      const keys = path.split('.');
      let current: any = newConfig;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
  };

  // Konfiguration speichern
  const handleSave = async () => {
    try {
      // Hier würde die Konfiguration an die API gesendet werden
      console.log('Saving branding config:', config);
      
      // TODO: Implement real API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsEditing(false);
      // Erfolgsmeldung anzeigen
    } catch (error) {
      console.error('Failed to save branding config:', error);
      // Fehlermeldung anzeigen
    }
  };

  // Konfiguration zurücksetzen
  const handleReset = () => {
    setConfig(defaultBranding);
    setIsEditing(false);
  };

  // Logo-Upload simulieren
  const handleLogoUpload = (type: 'light' | 'dark' | 'favicon') => {
    // TODO: Implement real file upload
    const mockUrl = `/images/logo-${type}-${Date.now()}.png`;
    handleConfigChange(`visual.logo.${type}`, mockUrl);
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Branding & White-Labeling
          </h1>
          <p className="text-gray-600 mt-2">
            Konfigurieren Sie das Erscheinungsbild und die Firmenidentität Ihrer App
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2"
          >
            {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {previewMode ? 'Vorschau ausblenden' : 'Vorschau anzeigen'}
          </Button>
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleReset}>
                Zurücksetzen
              </Button>
              <Button onClick={handleSave} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Speichern
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Bearbeiten
            </Button>
          )}
        </div>
      </div>

      {/* Preview Mode */}
      {previewMode && (
        <Card className="border-2 border-dashed border-blue-300 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">Vorschau-Modus</CardTitle>
            <CardDescription className="text-blue-700">
              So wird Ihre App mit den aktuellen Branding-Einstellungen aussehen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Logo Preview */}
              <div className="flex items-center space-x-4">
                <img
                  src={config.visual.logo.light}
                  alt={config.visual.logo.alt}
                  className="h-12 w-auto"
                  onError={(e) => {
                    e.currentTarget.src = '/images/placeholder-logo.png';
                  }}
                />
                <div>
                  <h3 className="font-semibold text-blue-800">{config.company.name}</h3>
                  <p className="text-sm text-blue-600">{config.company.description}</p>
                </div>
              </div>
              
              {/* Color Preview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(config.visual.colors).map(([name, color]) => (
                  <div key={name} className="text-center">
                    <div
                      className="w-16 h-16 rounded-lg mx-auto mb-2 border"
                      style={{ backgroundColor: color }}
                    />
                    <p className="text-xs font-medium text-blue-800 capitalize">{name}</p>
                    <p className="text-xs text-blue-600">{color}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Configuration Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Unternehmen
          </TabsTrigger>
          <TabsTrigger value="visual" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Design
          </TabsTrigger>
          <TabsTrigger value="app" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            App
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Features
          </TabsTrigger>
        </TabsList>

        {/* Company Information Tab */}
        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Firmeninformationen</CardTitle>
              <CardDescription>
                Grundlegende Informationen über Ihr Unternehmen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Firmenname *</Label>
                  <Input
                    id="company-name"
                    value={config.company.name}
                    onChange={(e) => handleConfigChange('company.name', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Ihr Firmenname"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company-short">Kurzname</Label>
                  <Input
                    id="company-short"
                    value={config.company.shortName}
                    onChange={(e) => handleConfigChange('company.shortName', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Kurzform des Namens"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-description">Beschreibung</Label>
                <Textarea
                  id="company-description"
                  value={config.company.description}
                  onChange={(e) => handleConfigChange('company.description', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Kurze Beschreibung Ihres Unternehmens"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="company-email">E-Mail</Label>
                  <Input
                    id="company-email"
                    type="email"
                    value={config.company.email}
                    onChange={(e) => handleConfigChange('company.email', e.target.value)}
                    disabled={!isEditing}
                    placeholder="info@firma.de"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company-phone">Telefon</Label>
                  <Input
                    id="company-phone"
                    value={config.company.phone}
                    onChange={(e) => handleConfigChange('company.phone', e.target.value)}
                    disabled={!isEditing}
                    placeholder="+49 123 456789"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Adresse</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    value={config.company.address.street}
                    onChange={(e) => handleConfigChange('company.address.street', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Straße & Hausnummer"
                  />
                  <Input
                    value={config.company.address.zip}
                    onChange={(e) => handleConfigChange('company.address.zip', e.target.value)}
                    disabled={!isEditing}
                    placeholder="PLZ"
                  />
                  <Input
                    value={config.company.address.city}
                    onChange={(e) => handleConfigChange('company.address.city', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Stadt"
                  />
                </div>
                <Input
                  value={config.company.address.country}
                  onChange={(e) => handleConfigChange('company.address.country', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Land"
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Visual Identity Tab */}
        <TabsContent value="visual" className="space-y-6">
          {/* Logo Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Logo & Bilder</CardTitle>
              <CardDescription>
                Laden Sie Ihre Logos und Bilder hoch
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <Label>Logo (Hell)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <img
                      src={config.visual.logo.light}
                      alt="Light Logo"
                      className="h-16 w-auto mx-auto mb-2"
                      onError={(e) => {
                        e.currentTarget.src = '/images/placeholder-logo.png';
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLogoUpload('light')}
                      disabled={!isEditing}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Hochladen
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Logo (Dunkel)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <img
                      src={config.visual.logo.dark}
                      alt="Dark Logo"
                      className="h-16 w-auto mx-auto mb-2"
                      onError={(e) => {
                        e.currentTarget.src = '/images/placeholder-logo.png';
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLogoUpload('dark')}
                      disabled={!isEditing}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Hochladen
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Favicon</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <img
                      src={config.visual.logo.favicon}
                      alt="Favicon"
                      className="h-8 w-8 mx-auto mb-2"
                      onError={(e) => {
                        e.currentTarget.src = '/images/placeholder-favicon.png';
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLogoUpload('favicon')}
                      disabled={!isEditing}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Hochladen
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo-alt">Logo Alt-Text</Label>
                <Input
                  id="logo-alt"
                  value={config.visual.logo.alt}
                  onChange={(e) => handleConfigChange('visual.logo.alt', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Beschreibung des Logos für Barrierefreiheit"
                />
              </div>
            </CardContent>
          </Card>

          {/* Color Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Farben</CardTitle>
              <CardDescription>
                Definieren Sie Ihre Markenfarben
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(config.visual.colors).map(([name, color]) => (
                  <div key={name} className="space-y-2">
                    <Label htmlFor={`color-${name}`} className="capitalize">
                      {name.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                    <div className="flex space-x-2">
                      <Input
                        id={`color-${name}`}
                        value={color}
                        onChange={(e) => handleConfigChange(`visual.colors.${name}`, e.target.value)}
                        disabled={!isEditing}
                        placeholder="#000000"
                      />
                      <div
                        className="w-12 h-10 rounded border"
                        style={{ backgroundColor: color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Typography Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Typografie</CardTitle>
              <CardDescription>
                Wählen Sie Ihre Schriftarten
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="font-primary">Hauptschriftart</Label>
                  <Input
                    id="font-primary"
                    value={config.visual.fonts.primary}
                    onChange={(e) => handleConfigChange('visual.fonts.primary', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Inter, sans-serif"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="font-secondary">Sekundärschriftart</Label>
                  <Input
                    id="font-secondary"
                    value={config.visual.fonts.secondary}
                    onChange={(e) => handleConfigChange('visual.fonts.secondary', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Inter, sans-serif"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="font-mono">Monospace-Schriftart</Label>
                  <Input
                    id="font-mono"
                    value={config.visual.fonts.mono}
                    onChange={(e) => handleConfigChange('visual.fonts.mono', e.target.value)}
                    disabled={!isEditing}
                    placeholder="JetBrains Mono, monospace"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* App Configuration Tab */}
        <TabsContent value="app" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>App-Einstellungen</CardTitle>
              <CardDescription>
                Konfigurieren Sie die App-spezifischen Einstellungen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="app-name">App-Name</Label>
                  <Input
                    id="app-name"
                    value={config.app.name}
                    onChange={(e) => handleConfigChange('app.name', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Meine App"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="app-version">Version</Label>
                  <Input
                    id="app-version"
                    value={config.app.version}
                    onChange={(e) => handleConfigChange('app.version', e.target.value)}
                    disabled={!isEditing}
                    placeholder="1.0.0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="app-description">App-Beschreibung</Label>
                <Textarea
                  id="app-description"
                  value={config.app.description}
                  onChange={(e) => handleConfigChange('app.description', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Beschreibung Ihrer App"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="app-keywords">Schlüsselwörter</Label>
                <Input
                  id="app-keywords"
                  value={config.app.keywords.join(', ')}
                  onChange={(e) => handleConfigChange('app.keywords', e.target.value.split(',').map(k => k.trim()))}
                  disabled={!isEditing}
                  placeholder="AI, Machine Learning, Chatbot"
                />
                <p className="text-sm text-gray-500">
                  Trennen Sie Schlüsselwörter durch Kommas
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="app-author">Autor</Label>
                  <Input
                    id="app-author"
                    value={config.app.author}
                    onChange={(e) => handleConfigChange('app.author', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Ihr Name oder Team"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="app-copyright">Copyright</Label>
                  <Input
                    id="app-copyright"
                    value={config.app.copyright}
                    onChange={(e) => handleConfigChange('app.copyright', e.target.value)}
                    disabled={!isEditing}
                    placeholder="© 2024 Ihr Unternehmen"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Localization Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Lokalisierung</CardTitle>
              <CardDescription>
                Sprache und regionale Einstellungen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="default-language">Standardsprache</Label>
                  <select
                    id="default-language"
                    value={config.localization.defaultLanguage}
                    onChange={(e) => handleConfigChange('localization.defaultLanguage', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="de">Deutsch</option>
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                    <option value="es">Español</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">Zeitzone</Label>
                  <select
                    id="timezone"
                    value={config.localization.timezone}
                    onChange={(e) => handleConfigChange('localization.timezone', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Europe/Berlin">Europe/Berlin (CET/CEST)</option>
                    <option value="Europe/London">Europe/London (GMT/BST)</option>
                    <option value="America/New_York">America/New_York (EST/EDT)</option>
                    <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date-format">Datumsformat</Label>
                  <select
                    id="date-format"
                    value={config.localization.dateFormat}
                    onChange={(e) => handleConfigChange('localization.dateFormat', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="DD.MM.YYYY">DD.MM.YYYY (Deutsch)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currency">Währung</Label>
                  <select
                    id="currency"
                    value={config.localization.currency}
                    onChange={(e) => handleConfigChange('localization.currency', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CHF">CHF (CHF)</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Configuration Tab */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feature-Verwaltung</CardTitle>
              <CardDescription>
                Aktivieren oder deaktivieren Sie bestimmte App-Features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(config.features).map(([feature, enabled]) => (
                  <div key={feature} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900 capitalize">
                        {feature.replace(/([A-Z])/g, ' $1').trim()}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {enabled ? 'Feature ist aktiviert' : 'Feature ist deaktiviert'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={enabled ? 'default' : 'secondary'}>
                        {enabled ? 'Aktiv' : 'Inaktiv'}
                      </Badge>
                      {isEditing && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleConfigChange(`features.${feature}`, !enabled)}
                        >
                          {enabled ? 'Deaktivieren' : 'Aktivieren'}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Export/Import Section */}
      <Card>
        <CardHeader>
          <CardTitle>Konfiguration verwalten</CardTitle>
          <CardDescription>
            Exportieren oder importieren Sie Ihre Branding-Konfiguration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Konfiguration exportieren
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Konfiguration importieren
            </Button>
            <Button variant="outline" onClick={handleReset} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Zurücksetzen
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
