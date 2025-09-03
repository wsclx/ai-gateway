'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Brain, 
  Play, 
  Pause, 
  Square, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Settings
} from 'lucide-react';

interface FineTuningJob {
  id: string;
  assistant_id: string;
  base_model: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at?: string;
  completed_at?: string;
  metrics?: {
    accuracy?: number;
    loss?: number;
    epochs_completed?: number;
  };
  error_message?: string;
  created_at: string;
}

export function FineTuningPanel() {
  const [jobs, setJobs] = useState<FineTuningJob[]>([]);
  const [selectedModel, setSelectedModel] = useState('llama2-7b');
  const [isStarting, setIsStarting] = useState(false);

  const startFineTuning = async () => {
    setIsStarting(true);
    try {
      const response = await fetch('/api/v1/training/fine-tune', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assistant_id: 'default-assistant-id',
          base_model: selectedModel,
          training_type: 'chat',
          hyperparameters: {
            epochs: 3,
            batch_size: 4,
            learning_rate: 5e-5,
            lora_r: 16,
            lora_alpha: 32
          }
        })
      });

      if (response.ok) {
        const newJob = await response.json();
        setJobs(prev => [newJob, ...prev]);
      }
    } catch (error) {
      console.error('Fine-tuning error:', error);
    } finally {
      setIsStarting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'running':
        return <Clock className="h-4 w-4 text-primary" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-error" />;
      default:
        return <Clock className="h-4 w-4 text-text-muted" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary' as const,
      running: 'secondary' as const,
      completed: 'secondary' as const,
      failed: 'destructive' as const
    };

    const getStatusText = (status: string) => {
      switch (status) {
        case 'pending':
          return 'Wartend';
        case 'running':
          return 'Läuft';
        case 'completed':
          return 'Abgeschlossen';
        case 'failed':
          return 'Fehler';
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

  const formatDuration = (startedAt?: string, completedAt?: string) => {
    if (!startedAt) return '-';
    
    const start = new Date(startedAt);
    const end = completedAt ? new Date(completedAt) : new Date();
    const duration = Math.floor((end.getTime() - start.getTime()) / 1000);
    
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Start Fine-Tuning */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>Fine-Tuning starten</span>
          </CardTitle>
          <CardDescription>
            Starten Sie ein neues Fine-Tuning mit lokalen Modellen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-text mb-2 block">
                Basis-Modell
              </label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="llama2-7b">Llama2 7B</SelectItem>
                  <SelectItem value="llama2-13b">Llama2 13B</SelectItem>
                  <SelectItem value="mistral-7b">Mistral 7B</SelectItem>
                  <SelectItem value="codellama-7b">CodeLlama 7B</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-text mb-2 block">
                Training-Typ
              </label>
              <Select defaultValue="chat">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chat">Chat</SelectItem>
                  <SelectItem value="completion">Completion</SelectItem>
                  <SelectItem value="instruction">Instruction</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button 
              onClick={startFineTuning} 
              disabled={isStarting}
              className="flex items-center space-x-2"
            >
              <Play className="h-4 w-4" />
              <span>{isStarting ? 'Startet...' : 'Fine-Tuning starten'}</span>
            </Button>
            
            <Button variant="outline" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Erweiterte Einstellungen</span>
            </Button>
          </div>

          <div className="bg-bg-secondary/50 p-4 rounded-lg">
            <h4 className="font-medium text-text mb-2">Fine-Tuning Konfiguration</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-text-muted">Epochs:</span>
                <span className="ml-2 font-medium">3</span>
              </div>
              <div>
                <span className="text-text-muted">Batch Size:</span>
                <span className="ml-2 font-medium">4</span>
              </div>
              <div>
                <span className="text-text-muted">Learning Rate:</span>
                <span className="ml-2 font-medium">5e-5</span>
              </div>
              <div>
                <span className="text-text-muted">LoRA R:</span>
                <span className="ml-2 font-medium">16</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Jobs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>Aktive Fine-Tuning Jobs</span>
            <Badge variant="secondary">{jobs.length}</Badge>
          </CardTitle>
          <CardDescription>
            Übersicht aller laufenden und abgeschlossenen Fine-Tuning Jobs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <div className="text-center py-8 text-text-muted">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keine Fine-Tuning Jobs vorhanden</p>
              <p className="text-sm">Starten Sie ein neues Fine-Tuning, um zu beginnen</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="border border-border rounded-lg p-4 hover:bg-bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(job.status)}
                      <div>
                        <p className="font-medium text-text">
                          Fine-Tuning {job.base_model}
                        </p>
                        <p className="text-sm text-text-muted">
                          Gestartet: {new Date(job.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(job.status)}
                      
                      {job.status === 'running' && (
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Pause className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-error">
                            <Square className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {job.status === 'running' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Fortschritt</span>
                        <span>{job.metrics?.epochs_completed || 0}/3 Epochs</span>
                      </div>
                      <Progress 
                        value={((job.metrics?.epochs_completed || 0) / 3) * 100} 
                        className="w-full" 
                      />
                    </div>
                  )}

                  {job.metrics && (
                    <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                      <div>
                        <span className="text-text-muted">Genauigkeit:</span>
                        <span className="ml-2 font-medium">
                          {job.metrics.accuracy ? `${(job.metrics.accuracy * 100).toFixed(1)}%` : '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-text-muted">Loss:</span>
                        <span className="ml-2 font-medium">
                          {job.metrics.loss ? job.metrics.loss.toFixed(4) : '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-text-muted">Dauer:</span>
                        <span className="ml-2 font-medium">
                          {formatDuration(job.started_at, job.completed_at)}
                        </span>
                      </div>
                    </div>
                  )}

                  {job.error_message && (
                    <div className="mt-3 p-3 bg-error/10 border border-error/20 rounded-lg">
                      <p className="text-sm text-error font-medium">Fehler:</p>
                      <p className="text-sm text-error">{job.error_message}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
