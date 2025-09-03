'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  MessageSquare
} from 'lucide-react';

interface TrainingMetrics {
  overall_accuracy: number;
  total_ratings: number;
  average_response_time: number;
  user_satisfaction: number;
  context_relevance: number;
  training_data_quality: number;
}

export function EvaluationDashboard() {
  const [metrics] = useState<TrainingMetrics>({
    overall_accuracy: 94.2,
    total_ratings: 156,
    average_response_time: 1.2,
    user_satisfaction: 4.6,
    context_relevance: 87.5,
    training_data_quality: 92.1
  });

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'text-success';
    if (accuracy >= 80) return 'text-warning';
    return 'text-error';
  };

  const getSatisfactionColor = (rating: number) => {
    if (rating >= 4.5) return 'text-success';
    if (rating >= 4.0) return 'text-warning';
    return 'text-error';
  };

  return (
    <div className="space-y-6">
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamtgenauigkeit</CardTitle>
            <Target className="h-4 w-4 text-text-muted" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getAccuracyColor(metrics.overall_accuracy)}`}>
              {metrics.overall_accuracy}%
            </div>
            <p className="text-xs text-text-muted">Basierend auf {metrics.total_ratings} Bewertungen</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Benutzerzufriedenheit</CardTitle>
            <Users className="h-4 w-4 text-text-muted" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getSatisfactionColor(metrics.user_satisfaction)}`}>
              {metrics.user_satisfaction}/5.0
            </div>
            <p className="text-xs text-text-muted">Durchschnittliche Bewertung</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Antwortzeit</CardTitle>
            <Clock className="h-4 w-4 text-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text">
              {metrics.average_response_time}s
            </div>
            <p className="text-xs text-text-muted">Durchschnittliche Antwortzeit</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kontext-Relevanz</CardTitle>
            <MessageSquare className="h-4 w-4 text-text-muted" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getAccuracyColor(metrics.context_relevance)}`}>
              {metrics.context_relevance}%
            </div>
            <p className="text-xs text-text-muted">Relevante Kontext-Snippets</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Accuracy Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Genauigkeit nach Kategorien</span>
            </CardTitle>
            <CardDescription>
              Detaillierte Genauigkeitsmetriken für verschiedene Aufgabentypen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text">Allgemeine Fragen</span>
                <div className="flex items-center space-x-2">
                  <Progress value={96.1} className="w-20" />
                  <span className="text-sm font-medium text-success">96.1%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-text">Technische Fragen</span>
                <div className="flex items-center space-x-2">
                  <Progress value={93.8} className="w-20" />
                  <span className="text-sm font-medium text-warning">93.8%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-text">Spezifische Dokumente</span>
                <div className="flex items-center space-x-2">
                  <Progress value={95.2} className="w-20" />
                  <span className="text-sm font-medium text-success">95.2%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-text">Komplexe Anfragen</span>
                <div className="flex items-center space-x-2">
                  <Progress value={92.5} className="w-20" />
                  <span className="text-sm font-medium text-warning">92.5%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Satisfaction Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Benutzerzufriedenheit</span>
            </CardTitle>
            <CardDescription>
              Verteilung der Benutzerbewertungen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">5 Sterne</span>
                  <CheckCircle className="h-4 w-4 text-success" />
                </div>
                <div className="flex items-center space-x-2">
                  <Progress value={57} className="w-20" />
                  <span className="text-sm font-medium">57% (89)</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">4 Sterne</span>
                  <CheckCircle className="h-4 w-4 text-success" />
                </div>
                <div className="flex items-center space-x-2">
                  <Progress value={29} className="w-20" />
                  <span className="text-sm font-medium">29% (45)</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">3 Sterne</span>
                  <AlertCircle className="h-4 w-4 text-warning" />
                </div>
                <div className="flex items-center space-x-2">
                  <Progress value={10} className="w-20" />
                  <span className="text-sm font-medium">10% (15)</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">2 Sterne</span>
                  <AlertCircle className="h-4 w-4 text-error" />
                </div>
                <div className="flex items-center space-x-2">
                  <Progress value={3} className="w-20" />
                  <span className="text-sm font-medium">3% (4)</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">1 Stern</span>
                  <AlertCircle className="h-4 w-4 text-error" />
                </div>
                <div className="flex items-center space-x-2">
                  <Progress value={2} className="w-20" />
                  <span className="text-sm font-medium">2% (3)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Training Data Quality */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Trainingsdaten-Qualität</span>
          </CardTitle>
          <CardDescription>
            Bewertung der Qualität und Relevanz der Trainingsdaten
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-success mb-2">
                {metrics.training_data_quality}%
              </div>
              <p className="text-sm text-text-muted">Gesamtqualität</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text">Dokumente verarbeitet</span>
                <Badge variant="secondary">12/12</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text">Chunks erstellt</span>
                <Badge variant="secondary">1,247</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text">Embeddings generiert</span>
                <Badge variant="secondary">1,247</Badge>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text">Durchschnittliche Chunk-Größe</span>
                <span className="text-sm font-medium">1,847 Tokens</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text">Überlappung</span>
                <span className="text-sm font-medium">200 Tokens</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text">Embedding-Dimension</span>
                <span className="text-sm font-medium">768</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Verbesserungsvorschläge</span>
          </CardTitle>
          <CardDescription>
            Empfehlungen zur Verbesserung der Training-Performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-success/10 border border-success/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-success mt-0.5" />
              <div>
                <p className="font-medium text-success">Starke Performance</p>
                <p className="text-sm text-text-secondary">
                  Die Gesamtgenauigkeit von 94.2% liegt über dem Zielwert von 90%.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-warning/10 border border-warning/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
              <div>
                <p className="font-medium text-warning">Verbesserungspotential</p>
                <p className="text-sm text-text-secondary">
                  Komplexe Anfragen (92.5%) könnten durch zusätzliche Trainingsdaten verbessert werden.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <Target className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-primary">Nächste Schritte</p>
                <p className="text-sm text-text-secondary">
                  Erwägen Sie das Hinzufügen von mehr Beispielen für komplexe Anfragen und technische Dokumentation.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
