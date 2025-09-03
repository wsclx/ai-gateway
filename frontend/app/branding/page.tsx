'use client';

import { useState, useEffect } from 'react';
import { Upload, Save, Palette, Image, FileText, Loader2 } from 'lucide-react';

interface BrandingConfig {
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  company_name: string;
  tagline: string;
  favicon_url: string;
}

export default function BrandingPage() {
  const [config, setConfig] = useState<BrandingConfig>({
    logo_url: '',
    primary_color: '#5B8DEE',
    secondary_color: '#8B7FD6',
    company_name: 'AI Gateway',
    tagline: 'Internes AI Gateway für Abteilungen',
    favicon_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (type === 'logo') {
        setConfig(prev => ({ ...prev, logo_url: result }));
      } else {
        setConfig(prev => ({ ...prev, favicon_url: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Branding-Einstellungen erfolgreich gespeichert');
    } catch (err) {
      setError('Fehler beim Speichern der Einstellungen');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary mb-2">Branding</h1>
        <p className="text-text-muted">Passen Sie das Erscheinungsbild Ihrer AI Gateway an</p>
      </div>

      {error && (
        <div className="bg-accent-error/10 border border-accent-error/20 rounded-xl p-4">
          <p className="text-accent-error text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-accent-success/10 border border-accent-success/20 rounded-xl p-4">
          <p className="text-accent-success text-sm">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logo Section */}
        <div className="bg-bg-tertiary rounded-xl border border-border-default p-6">
          <div className="flex items-center gap-3 mb-4">
            <Image className="w-5 h-5 text-accent-primary" />
            <h3 className="text-lg font-semibold text-text-primary">Logo</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-border-default border-dashed rounded-lg cursor-pointer bg-bg-elevated hover:bg-bg-hover transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-text-muted" />
                  <p className="mb-2 text-sm text-text-muted">
                    <span className="font-semibold">Klicken Sie zum Hochladen</span> oder Datei hierher ziehen
                  </p>
                  <p className="text-xs text-text-muted">PNG, JPG bis 10MB</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'logo')}
                />
              </label>
            </div>

            {config.logo_url && (
              <div className="flex items-center justify-center p-4 bg-bg-elevated rounded-lg">
                <img 
                  src={config.logo_url} 
                  alt="Logo Preview" 
                  className="max-h-16 max-w-full object-contain"
                />
              </div>
            )}
          </div>
        </div>

        {/* Favicon Section */}
        <div className="bg-bg-tertiary rounded-xl border border-border-default p-6">
          <div className="flex items-center gap-3 mb-4">
            <Image className="w-5 h-5 text-accent-primary" />
            <h3 className="text-lg font-semibold text-text-primary">Favicon</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-border-default border-dashed rounded-lg cursor-pointer bg-bg-elevated hover:bg-bg-hover transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-6 h-6 mb-2 text-text-muted" />
                  <p className="mb-2 text-sm text-text-muted">
                    <span className="font-semibold">Favicon hochladen</span>
                  </p>
                  <p className="text-xs text-text-muted">ICO, PNG bis 1MB</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'favicon')}
                />
              </label>
            </div>

            {config.favicon_url && (
              <div className="flex items-center justify-center p-4 bg-bg-elevated rounded-lg">
                <img 
                  src={config.favicon_url} 
                  alt="Favicon Preview" 
                  className="w-8 h-8 object-contain"
                />
              </div>
            )}
          </div>
        </div>

        {/* Colors Section */}
        <div className="bg-bg-tertiary rounded-xl border border-border-default p-6">
          <div className="flex items-center gap-3 mb-4">
            <Palette className="w-5 h-5 text-accent-primary" />
            <h3 className="text-lg font-semibold text-text-primary">Farben</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Primärfarbe
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.primary_color}
                  onChange={(e) => setConfig(prev => ({ ...prev, primary_color: e.target.value }))}
                  className="w-12 h-10 rounded-lg border border-border-default cursor-pointer"
                />
                <input
                  type="text"
                  value={config.primary_color}
                  onChange={(e) => setConfig(prev => ({ ...prev, primary_color: e.target.value }))}
                  className="flex-1 bg-bg-elevated border border-border-default rounded-lg px-3 py-2 text-text-primary"
                  placeholder="#5B8DEE"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Sekundärfarbe
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.secondary_color}
                  onChange={(e) => setConfig(prev => ({ ...prev, secondary_color: e.target.value }))}
                  className="w-12 h-10 rounded-lg border border-border-default cursor-pointer"
                />
                <input
                  type="text"
                  value={config.secondary_color}
                  onChange={(e) => setConfig(prev => ({ ...prev, secondary_color: e.target.value }))}
                  className="flex-1 bg-bg-elevated border border-border-default rounded-lg px-3 py-2 text-text-primary"
                  placeholder="#8B7FD6"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Company Info Section */}
        <div className="bg-bg-tertiary rounded-xl border border-border-default p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-5 h-5 text-accent-primary" />
            <h3 className="text-lg font-semibold text-text-primary">Unternehmensinformationen</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Unternehmensname
              </label>
              <input
                type="text"
                value={config.company_name}
                onChange={(e) => setConfig(prev => ({ ...prev, company_name: e.target.value }))}
                className="w-full bg-bg-elevated border border-border-default rounded-lg px-3 py-2 text-text-primary"
                placeholder="AI Gateway"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Tagline
              </label>
              <input
                type="text"
                value={config.tagline}
                onChange={(e) => setConfig(prev => ({ ...prev, tagline: e.target.value }))}
                className="w-full bg-bg-elevated border border-border-default rounded-lg px-3 py-2 text-text-primary"
                placeholder="Internes AI Gateway für Abteilungen"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-bg-tertiary rounded-xl border border-border-default p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Vorschau</h3>
        <div className="bg-bg-elevated rounded-lg p-6 border border-border-default">
          <div className="flex items-center gap-4 mb-4">
            {config.logo_url && (
              <img 
                src={config.logo_url} 
                alt="Logo" 
                className="h-8 object-contain"
              />
            )}
            <div>
              <h4 className="text-lg font-semibold text-text-primary">{config.company_name}</h4>
              <p className="text-sm text-text-muted">{config.tagline}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <div 
              className="w-6 h-6 rounded-full"
              style={{ backgroundColor: config.primary_color }}
            />
            <div 
              className="w-6 h-6 rounded-full"
              style={{ backgroundColor: config.secondary_color }}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Einstellungen speichern
        </button>
      </div>
    </div>
  );
}
