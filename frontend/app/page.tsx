'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Bot, Sparkles, TrendingUp, Users, Shield, Settings } from 'lucide-react';
import { assistantsApi, Assistant } from '@/lib/api-client';

export default function HomePage() {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchAssistants = async () => {
      try {
        const data = await assistantsApi.getAssistants();
        setAssistants(data);
      } catch (err) {
        setError('Fehler beim Laden der Assistenten');
        console.error('Failed to load assistants:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssistants();
  }, []);

  const handleAssistantClick = (assistant: Assistant) => {
    router.push(`/chat?assistant=${assistant.id}`);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'secondary' as const,
      inactive: 'destructive' as const,
      maintenance: 'secondary' as const
    };

    const getStatusText = (status: string) => {
      switch (status) {
        case 'active':
          return 'Aktiv';
        case 'inactive':
          return 'Inaktiv';
        case 'maintenance':
          return 'Wartung';
        default:
          return status;
      }
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {getStatusText(status)}
      </Badge>
    );
  };

  const getModelIcon = (model: string) => {
    if (model.includes('gpt')) return <Sparkles className="h-4 w-4" />;
    if (model.includes('claude')) return <Bot className="h-4 w-4" />;
    return <MessageSquare className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-text-muted">Lade Assistenten...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-error mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Erneut versuchen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Willkommen bei AI Gateway
        </h1>
        <p className="text-text-secondary">
          Wählen Sie einen AI-Assistenten für Ihre Aufgaben
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assistants.map((assistant) => (
          <Card 
            key={assistant.id} 
            className="hover:shadow-lg transition-all duration-normal cursor-pointer"
            onClick={() => handleAssistantClick(assistant)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getModelIcon(assistant.model)}
                  <CardTitle className="text-lg">{assistant.name}</CardTitle>
                </div>
                {getStatusBadge(assistant.status)}
              </div>
              <CardDescription className="text-text-secondary">
                {assistant.description || 'Keine Beschreibung verfügbar'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Modell:</span>
                  <span className="text-text-secondary">{assistant.model}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Threads:</span>
                  <span className="text-text-secondary">{assistant.usage_stats.total_threads}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Aktive Nutzer:</span>
                  <span className="text-text-secondary">{assistant.usage_stats.active_users}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {assistants.length === 0 && (
        <div className="text-center py-12">
          <Bot className="h-12 w-12 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">
            Keine Assistenten verfügbar
          </h3>
          <p className="text-text-secondary">
            Es sind derzeit keine AI-Assistenten konfiguriert.
          </p>
        </div>
      )}
    </div>
  );
}
