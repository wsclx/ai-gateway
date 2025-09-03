'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Brain, BarChart3 } from 'lucide-react';

import { DocumentManager } from '@/components/training/document-manager';
import { FineTuningPanel } from '@/components/training/fine-tuning-panel';
import { EvaluationDashboard } from '@/components/training/evaluation-dashboard';

export default function TrainingPage() {
  const [activeTab, setActiveTab] = useState('documents');

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text">Training & Fine-Tuning</h1>
          <p className="text-text-secondary mt-2">
            Trainen Sie Ihre Assistenten mit eigenen Daten - DSGVO-konform und sicher
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="bg-success/10 text-success px-3 py-1 rounded-full text-sm font-medium">
            Lokale Verarbeitung
          </div>
          <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
            DSGVO-konform
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dokumente</CardTitle>
            <FileText className="h-4 w-4 text-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-text-muted">Hochgeladen</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chunks</CardTitle>
            <Upload className="h-4 w-4 text-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-text-muted">Verarbeitet</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fine-Tuning</CardTitle>
            <Brain className="h-4 w-4 text-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-text-muted">Jobs aktiv</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Genauigkeit</CardTitle>
            <BarChart3 className="h-4 w-4 text-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-text-muted">Durchschnitt</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="documents" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Dokumente</span>
          </TabsTrigger>
          <TabsTrigger value="fine-tuning" className="flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <span>Fine-Tuning</span>
          </TabsTrigger>
          <TabsTrigger value="evaluation" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Evaluierung</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="documents" className="space-y-6">
          <DocumentManager />
        </TabsContent>
        
        <TabsContent value="fine-tuning" className="space-y-6">
          <FineTuningPanel />
        </TabsContent>
        
        <TabsContent value="evaluation" className="space-y-6">
          <EvaluationDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
