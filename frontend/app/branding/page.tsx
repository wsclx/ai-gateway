'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  Palette, 
  Building2, 
  Globe, 
  Image as ImageIcon, 
  Save, 
  Upload, 
  Eye,
  EyeOff,
  Download,
  RefreshCw,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { BrandingConfig, defaultBranding } from '@/lib/branding';
import Image from 'next/image';

export default function BrandingPage() {
  const [config, setConfig] = useState<BrandingConfig>(defaultBranding);
  const [activeTab, setActiveTab] = useState('company');
  const [isEditing, setIsEditing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const { toast } = useToast();
  
  // File input refs
  const lightLogoRef = useRef<HTMLInputElement>(null);
  const darkLogoRef = useRef<HTMLInputElement>(null);
  const faviconRef = useRef<HTMLInputElement>(null);

  // Load configuration from localStorage on component mount
  useEffect(() => {
    const loadSavedConfig = () => {
      try {
        const saved = localStorage.getItem('duh-ai-gateway-branding');
        if (saved) {
          const parsed = JSON.parse(saved);
          setConfig(parsed);
          toast({
            title: "Konfiguration geladen",
            description: "Branding-Einstellungen wurden aus dem lokalen Speicher geladen",
          });
        }
      } catch (error) {
        console.error('Failed to load branding config:', error);
        toast({
          title: "Fehler beim Laden",
          description: "Konfiguration konnte nicht geladen werden, verwende Standard-Einstellungen",
          variant: "destructive"
        });
      }
    };

    loadSavedConfig();
  }, [toast]);

  // Save configuration to localStorage whenever it changes
  useEffect(() => {
    const saveConfig = () => {
      try {
        localStorage.setItem('duh-ai-gateway-branding', JSON.stringify(config));
      } catch (error) {
        console.error('Failed to save branding config:', error);
      }
    };

    // Debounce save to avoid excessive localStorage writes
    const timeoutId = setTimeout(saveConfig, 1000);
    return () => clearTimeout(timeoutId);
  }, [config]);

  // Handler für Konfigurationsänderungen
  const handleConfigChange = useCallback((path: string, value: any) => {
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
  }, []);

  // Datei-Upload verarbeiten
  const handleFileUpload = useCallback(async (type: 'light' | 'dark' | 'favicon', file: File) => {
    if (!file) return;

    // Validierung
    const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Ungültiger Dateityp",
        description: "Bitte wählen Sie eine Bilddatei (JPEG, PNG, SVG oder WebP)",
        variant: "destructive"
      });
      return;
    }

    // Größenvalidierung
    const maxSize = type === 'favicon' ? 1024 * 1024 : 5 * 1024 * 1024; // 1MB für Favicon, 5MB für Logos
    if (file.size > maxSize) {
      toast({
        title: "Datei zu groß",
        description: `Maximale Größe: ${type === 'favicon' ? '1MB' : '5MB'}`,
        variant: "destructive"
      });
      return;
    }

    try {
      setUploadProgress(prev => ({ ...prev, [type]: 0 }));
      
      // Simuliere Upload-Fortschritt
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 50));
        setUploadProgress(prev => ({ ...prev, [type]: i }));
      }

      // Erstelle lokale URL für Vorschau
      const objectUrl = URL.createObjectURL(file);
      
      // Aktualisiere Konfiguration
      handleConfigChange(`visual.logo.${type}`, objectUrl);
      
      toast({
        title: "Upload erfolgreich",
        description: `${type === 'light' ? 'Hell' : type === 'dark' ? 'Dunkel' : 'Favicon'}-Logo wurde hochgeladen`,
        variant: "default"
      });

      // Cleanup nach 5 Sekunden
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[type];
          return newProgress;
        });
      }, 5000);

    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload fehlgeschlagen",
        description: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
        variant: "destructive"
      });
    }
  }, [handleConfigChange, toast]);

  // Datei-Input triggern
  const triggerFileInput = useCallback((type: 'light' | 'dark' | 'favicon') => {
    const ref = type === 'light' ? lightLogoRef : type === 'dark' ? darkLogoRef : faviconRef;
    ref.current?.click();
  }, []);

  // Datei-Input-Handler
  const handleFileInputChange = useCallback((type: 'light' | 'dark' | 'favicon', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(type, file);
    }
    // Reset input value
    event.target.value = '';
  }, [handleFileUpload]);

  // Logo entfernen
  const removeLogo = useCallback((type: 'light' | 'dark' | 'favicon') => {
    const defaultUrl = type === 'favicon' ? '/images/placeholder-favicon.png' : '/images/placeholder-logo.png';
    handleConfigChange(`visual.logo.${type}`, defaultUrl);
    
    toast({
      title: "Logo entfernt",
      description: `${type === 'light' ? 'Hell' : type === 'dark' ? 'Dunkel' : 'Favicon'}-Logo wurde zurückgesetzt`,
      variant: "default"
    });
  }, [handleConfigChange, toast]);

  // Konfiguration speichern
  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true);
      
      // Hier würde die Konfiguration an die API gesendet werden
      console.log('Saving branding config:', config);
      
      // Simuliere API-Aufruf
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsEditing(false);
      toast({
        title: "Gespeichert",
        description: "Ihre Branding-Einstellungen wurden erfolgreich gespeichert",
        variant: "default"
      });
    } catch (error) {
      console.error('Failed to save branding config:', error);
      toast({
        title: "Fehler beim Speichern",
        description: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }, [config, toast]);

  // Konfiguration zurücksetzen
  const handleReset = useCallback(() => {
    setConfig(defaultBranding);
    setIsEditing(false);
    
    // Clear localStorage
    try {
      localStorage.removeItem('duh-ai-gateway-branding');
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
    
    toast({
      title: "Zurückgesetzt",
      description: "Alle Änderungen wurden verworfen und lokaler Speicher gelöscht",
      variant: "default"
    });
  }, [toast]);

  // Konfiguration exportieren
  const handleExport = useCallback(() => {
    try {
      const dataStr = JSON.stringify(config, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `duh-ai-gateway-branding-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Exportiert",
        description: "Branding-Konfiguration wurde erfolgreich heruntergeladen",
        variant: "default"
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export fehlgeschlagen",
        description: "Ein Fehler ist beim Exportieren aufgetreten",
        variant: "destructive"
      });
    }
  }, [config, toast]);

  // Konfiguration importieren
  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedConfig = JSON.parse(e.target?.result as string);
        
        // Validate imported config structure
        if (importedConfig && typeof importedConfig === 'object') {
          setConfig(importedConfig);
          
          // Save to localStorage
          try {
            localStorage.setItem('duh-ai-gateway-branding', JSON.stringify(importedConfig));
          } catch (error) {
            console.error('Failed to save imported config to localStorage:', error);
          }
          
          toast({
            title: "Importiert",
            description: "Branding-Konfiguration wurde erfolgreich importiert und gespeichert",
            variant: "default"
          });
        } else {
          throw new Error('Invalid config structure');
        }
      } catch (error) {
        console.error('Import failed:', error);
        toast({
          title: "Import fehlgeschlagen",
          description: "Die Datei konnte nicht gelesen werden oder hat ein ungültiges Format",
          variant: "destructive"
        });
      }
    };
    
    reader.onerror = () => {
      toast({
        title: "Import fehlgeschlagen",
        description: "Fehler beim Lesen der Datei",
        variant: "destructive"
      });
    };
    
    reader.readAsText(file);
    
    // Reset input value
    event.target.value = '';
  }, [toast]);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Hidden file inputs */}
      <input
        ref={lightLogoRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileInputChange('light', e)}
        className="hidden"
      />
      <input
        ref={darkLogoRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileInputChange('dark', e)}
        className="hidden"
      />
      <input
        ref={faviconRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileInputChange('favicon', e)}
        className="hidden"
      />

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
              <Button variant="outline" onClick={handleReset} disabled={isSaving}>
                Zurücksetzen
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2">
                {isSaving ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Speichern...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Speichern
                  </>
                )}
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

      {/* Import/Export Section */}
      <div className="flex space-x-3">
        <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exportieren
        </Button>
        <div className="relative">
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Button variant="outline" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Importieren
          </Button>
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
                <Image
                  src={config.visual.logo.light}
                  alt={config.visual.logo.alt}
                  width={160}
                  height={48}
                  className="h-12 w-auto"
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
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center relative">
                    <Image
                      src={config.visual.logo.light}
                      alt="Light Logo"
                      width={200}
                      height={64}
                      className="h-16 w-auto mx-auto mb-2"
                    />
                    
                    {/* Upload Progress */}
                    {uploadProgress.light !== undefined && (
                      <div className="absolute inset-0 bg-white/90 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
                          <p className="text-sm text-gray-600">{uploadProgress.light}%</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => triggerFileInput('light')}
                        disabled={!isEditing}
                        className="flex-1"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Hochladen
                      </Button>
                      {config.visual.logo.light !== '/images/placeholder-logo.png' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeLogo('light')}
                          disabled={!isEditing}
                          className="px-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-2">
                      Empfohlen: 200x64px, PNG/SVG
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Logo (Dunkel)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center relative">
                    <Image
                      src={config.visual.logo.dark}
                      alt="Dark Logo"
                      width={200}
                      height={64}
                      className="h-16 w-auto mx-auto mb-2"
                    />
                    
                    {/* Upload Progress */}
                    {uploadProgress.dark !== undefined && (
                      <div className="absolute inset-0 bg-white/90 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
                          <p className="text-sm text-gray-600">{uploadProgress.dark}%</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => triggerFileInput('dark')}
                        disabled={!isEditing}
                        className="flex-1"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Hochladen
                      </Button>
                      {config.visual.logo.dark !== '/images/placeholder-logo.png' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeLogo('dark')}
                          disabled={!isEditing}
                          className="px-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-2">
                      Empfohlen: 200x64px, PNG/SVG
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Favicon</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center relative">
                    <Image
                      src={config.visual.logo.favicon}
                      alt="Favicon"
                      width={32}
                      height={32}
                      className="h-8 w-8 mx-auto mb-2"
                    />
                    
                    {/* Upload Progress */}
                    {uploadProgress.favicon !== undefined && (
                      <div className="absolute inset-0 bg-white/90 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
                          <p className="text-sm text-gray-600">{uploadProgress.favicon}%</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => triggerFileInput('favicon')}
                        disabled={!isEditing}
                        className="flex-1"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Hochladen
                      </Button>
                      {config.visual.logo.favicon !== '/images/placeholder-favicon.png' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeLogo('favicon')}
                          disabled={!isEditing}
                          className="px-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-2">
                      Empfohlen: 32x32px, ICO/PNG
                    </p>
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
                        className="flex-1"
                      />
                      <div
                        className="w-10 h-10 rounded border"
                        style={{ backgroundColor: color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Font Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Schriftarten</CardTitle>
              <CardDescription>
                Wählen Sie die Schriftarten für Ihre App
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="font-primary">Primäre Schriftart</Label>
                  <Input
                    id="font-primary"
                    value={config.visual.fonts.primary}
                    onChange={(e) => handleConfigChange('visual.fonts.primary', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Inter, sans-serif"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="font-secondary">Sekundäre Schriftart</Label>
                  <Input
                    id="font-secondary"
                    value={config.visual.fonts.secondary}
                    onChange={(e) => handleConfigChange('visual.fonts.secondary', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Inter, sans-serif"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="font-mono">Monospace Schriftart</Label>
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
                <Label htmlFor="app-description">Beschreibung</Label>
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
                  placeholder="AI, Gateway, Business"
                />
                <p className="text-xs text-gray-500">Trennen Sie Schlüsselwörter mit Kommas</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="app-author">Autor</Label>
                  <Input
                    id="app-author"
                    value={config.app.author}
                    onChange={(e) => handleConfigChange('app.author', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Ihr Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="app-copyright">Copyright</Label>
                  <Input
                    id="app-copyright"
                    value={config.app.copyright}
                    onChange={(e) => handleConfigChange('app.copyright', e.target.value)}
                    disabled={!isEditing}
                    placeholder="© 2025"
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
                Sprache, Zeitzone und Format-Einstellungen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="locale-language">Standardsprache</Label>
                  <select
                    id="locale-language"
                    value={config.localization.defaultLanguage}
                    onChange={(e) => handleConfigChange('localization.defaultLanguage', e.target.value)}
                    disabled={!isEditing}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="de">Deutsch</option>
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                    <option value="es">Español</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="locale-timezone">Zeitzone</Label>
                  <select
                    id="locale-timezone"
                    value={config.localization.timezone}
                    onChange={(e) => handleConfigChange('localization.timezone', e.target.value)}
                    disabled={!isEditing}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="Europe/Berlin">Europe/Berlin</option>
                    <option value="Europe/London">Europe/London</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="Asia/Tokyo">Asia/Tokyo</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="locale-dateformat">Datumsformat</Label>
                  <select
                    id="locale-dateformat"
                    value={config.localization.dateFormat}
                    onChange={(e) => handleConfigChange('localization.dateFormat', e.target.value)}
                    disabled={!isEditing}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="DD.MM.YYYY">DD.MM.YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="locale-currency">Währung</Label>
                  <select
                    id="locale-currency"
                    value={config.localization.currency}
                    onChange={(e) => handleConfigChange('localization.currency', e.target.value)}
                    disabled={!isEditing}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feature-Flags</CardTitle>
              <CardDescription>
                Aktivieren oder deaktivieren Sie bestimmte Features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(config.features).map(([name, enabled]) => (
                  <div key={name} className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="capitalize">
                        {name.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {name === 'branding' && 'Ermöglicht die Anpassung des App-Designs'}
                        {name === 'analytics' && 'Sammelt Nutzungsdaten für Verbesserungen'}
                        {name === 'training' && 'Ermöglicht das Training eigener AI-Modelle'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {enabled ? (
                        <Badge variant="default" className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Aktiviert
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Deaktiviert
                        </Badge>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConfigChange(`features.${name}`, !enabled)}
                        disabled={!isEditing}
                      >
                        {enabled ? 'Deaktivieren' : 'Aktivieren'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
