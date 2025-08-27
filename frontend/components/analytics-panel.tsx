"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  MessageSquare, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Users, 
  Bot, 
  Download,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  FileText,
  Settings,
  Loader2
} from "lucide-react";
import { apiClient, AnalyticsData } from "@/lib/api-client";

export function AnalyticsPanel() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load analytics data on component mount
  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Loading analytics...');
      const response = await apiClient.getAnalytics();
      console.log('Analytics response:', response);
      
      if (response.success && response.data) {
        setAnalyticsData(response.data);
        console.log('Analytics data set:', response.data);
      } else {
        console.error('Analytics failed:', response.error);
        // Use fallback data if API fails
        const fallbackData: AnalyticsData = {
          overview: {
            totalMessages: 1250,
            totalTokens: 45600,
            totalCost: 12.50,
            avgLatency: 1250,
            activeUsers: 23,
            totalAssistants: 6
          },
          usage: {
            daily: [
              { date: "2025-08-19", messages: 45, tokens: 1800, cost: 0.50 },
              { date: "2025-08-20", messages: 52, tokens: 2100, cost: 0.58 },
              { date: "2025-08-21", messages: 38, tokens: 1500, cost: 0.42 },
              { date: "2025-08-22", messages: 67, tokens: 2800, cost: 0.78 },
              { date: "2025-08-23", messages: 89, tokens: 3600, cost: 1.00 },
              { date: "2025-08-24", messages: 76, tokens: 3100, cost: 0.86 },
              { date: "2025-08-25", messages: 34, tokens: 1400, cost: 0.39 }
            ],
            byDepartment: [
              { name: "IT", messages: 450, percentage: 36 },
              { name: "HR", messages: 320, percentage: 26 },
              { name: "Marketing", messages: 280, percentage: 22 },
              { name: "Sales", messages: 200, percentage: 16 },
              { name: "Finance", messages: 150, percentage: 12 },
              { name: "General", messages: 100, percentage: 8 }
            ],
            byAssistant: [
              { name: "DUH General Assistant", messages: 500, percentage: 40 },
              { name: "DUH HR Assistant", messages: 300, percentage: 24 },
              { name: "DUH IT Support", messages: 250, percentage: 20 },
              { name: "DUH Marketing Assistant", messages: 200, percentage: 16 },
              { name: "DUH Sales Assistant", messages: 150, percentage: 12 },
              { name: "DUH Finance Assistant", messages: 100, percentage: 8 }
            ]
          },
          performance: {
            responseTime: {
              avg: 1250,
              p95: 2100,
              p99: 3500
            },
            accuracy: {
              overall: 94.2,
              byAssistant: [
                { name: "General", accuracy: 96.1 },
                { name: "HR", accuracy: 93.8 },
                { name: "IT", accuracy: 95.2 },
                { name: "Marketing", accuracy: 92.5 }
              ]
            },
            userSatisfaction: {
              overall: 4.6,
              totalRatings: 156,
              distribution: [
                { rating: 5, count: 89, percentage: 57 },
                { rating: 4, count: 45, percentage: 29 },
                { rating: 3, count: 15, percentage: 10 },
                { rating: 2, count: 4, percentage: 3 },
                { rating: 1, count: 3, percentage: 2 }
              ]
            }
          },
          costs: {
            monthly: [
              { month: "Feb", cost: 8.50 },
              { month: "Mar", cost: 9.20 },
              { month: "Apr", cost: 10.10 },
              { month: "May", cost: 11.30 },
              { month: "Jun", cost: 12.80 },
              { month: "Jul", cost: 13.20 },
              { month: "Aug", cost: 12.50 }
            ],
            byModel: [
              { model: "GPT-4o-mini", cost: 8.75, percentage: 70 },
              { model: "GPT-3.5", cost: 2.50, percentage: 20 },
              { model: "Claude", cost: 1.25, percentage: 10 }
            ]
          }
        };
        
        setAnalyticsData(fallbackData);
        setError('Backend nicht verfügbar - Verwende Demo-Daten');
      }
    } catch (err) {
      console.error('Analytics loading error:', err);
      // Use fallback data on error
      const fallbackData: AnalyticsData = {
        overview: {
          totalMessages: 1250,
          totalTokens: 45600,
          totalCost: 12.50,
          avgLatency: 1250,
          activeUsers: 23,
          totalAssistants: 6
        },
        usage: {
          daily: [
            { date: "2025-08-19", messages: 45, tokens: 1800, cost: 0.50 },
            { date: "2025-08-20", messages: 52, tokens: 2100, cost: 0.58 },
            { date: "2025-08-21", messages: 38, tokens: 1500, cost: 0.42 },
            { date: "2025-08-22", messages: 67, tokens: 2800, cost: 0.78 },
            { date: "2025-08-23", messages: 89, tokens: 3600, cost: 1.00 },
            { date: "2025-08-24", messages: 76, tokens: 3100, cost: 0.86 },
            { date: "2025-08-25", messages: 34, tokens: 1400, cost: 0.39 }
          ],
          byDepartment: [
            { name: "IT", messages: 450, percentage: 36 },
            { name: "HR", messages: 320, percentage: 26 },
            { name: "Marketing", messages: 280, percentage: 22 },
            { name: "Sales", messages: 200, percentage: 16 },
            { name: "Finance", messages: 150, percentage: 12 },
            { name: "General", messages: 100, percentage: 8 }
          ],
          byAssistant: [
            { name: "DUH General Assistant", messages: 500, percentage: 40 },
            { name: "DUH HR Assistant", messages: 300, percentage: 24 },
            { name: "DUH IT Support", messages: 250, percentage: 20 },
            { name: "DUH Marketing Assistant", messages: 200, percentage: 16 },
            { name: "DUH Sales Assistant", messages: 150, percentage: 12 },
            { name: "DUH Finance Assistant", messages: 100, percentage: 8 }
          ]
        },
        performance: {
          responseTime: {
            avg: 1250,
            p95: 2100,
            p99: 3500
          },
          accuracy: {
            overall: 94.2,
            byAssistant: [
              { name: "General", accuracy: 96.1 },
              { name: "HR", accuracy: 93.8 },
              { name: "IT", accuracy: 95.2 },
              { name: "Marketing", accuracy: 92.5 }
            ]
          },
          userSatisfaction: {
            overall: 4.6,
            totalRatings: 156,
            distribution: [
              { rating: 5, count: 89, percentage: 57 },
              { rating: 4, count: 45, percentage: 29 },
              { rating: 3, count: 15, percentage: 10 },
              { rating: 2, count: 4, percentage: 3 },
              { rating: 1, count: 3, percentage: 2 }
            ]
          }
        },
        costs: {
          monthly: [
            { month: "Feb", cost: 8.50 },
            { month: "Mar", cost: 9.20 },
            { month: "Apr", cost: 10.10 },
            { month: "May", cost: 11.30 },
            { month: "Jun", cost: 12.80 },
            { month: "Jul", cost: 13.20 },
            { month: "Aug", cost: 12.50 }
          ],
          byModel: [
            { model: "GPT-4o-mini", cost: 8.75, percentage: 70 },
            { model: "GPT-3.5", cost: 2.50, percentage: 20 },
            { model: "Claude", cost: 1.25, percentage: 10 }
          ]
        }
      };
      
      setAnalyticsData(fallbackData);
      setError('Fehler beim Laden - Verwende Demo-Daten');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleExport = useCallback(async (format: string) => {
    setIsExporting(true);
    try {
      const response = await apiClient.exportAnalytics(
        format as 'csv' | 'json'
      );
      
      if (response.success && response.data) {
        if (format === 'csv') {
          // Create and download CSV file
          const blob = new Blob([response.data], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
          a.click();
          window.URL.revokeObjectURL(url);
        } else {
          // Download JSON file
          const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
          a.click();
          window.URL.revokeObjectURL(url);
        }
        
        console.log(`${format.toUpperCase()} Export erfolgreich!`);
      } else {
        throw new Error(response.error || 'Export failed');
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Export fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    } finally {
      setIsExporting(false);
    }
  }, []);

  const handleTabChange = useCallback((value: string) => {
    console.log('Analytics tab changed to:', value);
    setActiveTab(value);
  }, []);

  const handleQuickAction = useCallback((action: string) => {
    console.log('Quick action clicked:', action);
    switch (action) {
      case 'analytics':
        setActiveTab('usage');
        break;
      case 'export':
        handleExport('csv');
        break;
      case 'settings':
        setActiveTab('costs');
        break;
    }
  }, [handleExport]);

  const handleButtonClick = useCallback((action: string, ...args: any[]) => {
    console.log('Button clicked:', action, args);
    switch (action) {
      case 'export-csv':
        handleExport('csv');
        break;
      case 'export-json':
        handleExport('json');
        break;
      case 'tab-change':
        handleTabChange(args[0]);
        break;
      case 'quick-action':
        handleQuickAction(args[0]);
        break;
      default:
        console.log('Unknown action:', action);
    }
  }, [handleExport, handleTabChange, handleQuickAction]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Lade Analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="text-amber-800 font-medium">Hinweis</div>
          <div className="text-sm text-amber-700 mt-1">{error}</div>
          <Button 
            onClick={loadAnalytics} 
            variant="outline" 
            size="sm" 
            className="mt-2"
          >
            Erneut versuchen
          </Button>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="space-y-4">
        <div className="text-center text-muted-foreground p-8">
          Keine Analytics-Daten verfügbar
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Analytics</h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleButtonClick('export-csv')}
            disabled={isExporting}
            type="button"
            className="cursor-pointer"
          >
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleButtonClick('export-json')}
            disabled={isExporting}
            type="button"
            className="cursor-pointer"
          >
            <FileText className="h-4 w-4 mr-2" />
            JSON
          </Button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center justify-between p-3 bg-accent rounded-md">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Nachrichten</span>
          </div>
          <span className="text-lg font-bold">
            {analyticsData.overview.totalMessages.toLocaleString('de-DE')}
          </span>
        </div>
        <div className="flex items-center justify-between p-3 bg-accent rounded-md">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Tokens</span>
          </div>
          <span className="text-lg font-bold">
            {analyticsData.overview.totalTokens.toLocaleString('de-DE')}
          </span>
        </div>
        <div className="flex items-center justify-between p-3 bg-accent rounded-md">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Kosten</span>
          </div>
          <span className="text-lg font-bold">
            €{analyticsData.overview.totalCost.toFixed(2).replace('.', ',')}
          </span>
        </div>
        <div className="flex items-center justify-between p-3 bg-accent rounded-md">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Latenz</span>
          </div>
          <span className="text-lg font-bold">{analyticsData.overview.avgLatency}ms</span>
        </div>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger 
            value="overview" 
            onClick={() => handleButtonClick('tab-change', 'overview')}
            className="cursor-pointer"
          >
            Übersicht
          </TabsTrigger>
          <TabsTrigger 
            value="usage" 
            onClick={() => handleButtonClick('tab-change', 'usage')}
            className="cursor-pointer"
          >
            Nutzung
          </TabsTrigger>
          <TabsTrigger 
            value="performance" 
            onClick={() => handleButtonClick('tab-change', 'performance')}
            className="cursor-pointer"
          >
            Leistung
          </TabsTrigger>
          <TabsTrigger 
            value="costs" 
            onClick={() => handleButtonClick('tab-change', 'costs')}
            className="cursor-pointer"
          >
            Kosten
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System-Übersicht</CardTitle>
              <CardDescription>Aktuelle System-Metriken</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {analyticsData.overview.activeUsers}
                  </div>
                  <div className="text-sm text-muted-foreground">Aktive Benutzer</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {analyticsData.overview.totalAssistants}
                  </div>
                  <div className="text-sm text-muted-foreground">Assistenten</div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium">Aktuelle Aktivitäten</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">14:32</span>
                    <span className="text-foreground">HR Assistant verwendet</span>
                    <span className="text-muted-foreground">• Max M.</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">14:28</span>
                    <span className="text-foreground">IT Support verwendet</span>
                    <span className="text-muted-foreground">• Anna K.</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">14:15</span>
                    <span className="text-foreground">Feedback gesendet</span>
                    <span className="text-muted-foreground">• Tom B.</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Nutzung nach Abteilung</CardTitle>
              <CardDescription>Verteilung der Nachrichten nach Abteilungen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.usage.byDepartment.map((dept) => (
                  <div key={dept.name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{dept.name}</span>
                      <span>{dept.messages} Nachrichten</span>
                    </div>
                    <Progress value={dept.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Antwortzeiten</CardTitle>
              <CardDescription>Performance-Metriken</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {analyticsData.performance.responseTime.avg}ms
                  </div>
                  <div className="text-sm text-muted-foreground">Durchschnitt</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {analyticsData.performance.responseTime.p95}ms
                  </div>
                  <div className="text-sm text-muted-foreground">P95</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {analyticsData.performance.responseTime.p99}ms
                  </div>
                  <div className="text-sm text-muted-foreground">P99</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Kosten nach Modell</CardTitle>
              <CardDescription>Verteilung der Kosten nach AI-Modellen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.costs.byModel.map((model) => (
                  <div key={model.model} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{model.model}</span>
                      <span>€{model.cost.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <Progress value={model.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="pt-4 border-t">
        <h3 className="text-sm font-medium mb-3">Schnellaktionen</h3>
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start cursor-pointer"
            onClick={() => handleButtonClick('quick-action', 'analytics')}
            type="button"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Detaillierte Analytics
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start cursor-pointer"
            onClick={() => handleButtonClick('quick-action', 'export')}
            type="button"
          >
            <Download className="h-4 w-4 mr-2" />
            Feedback exportieren
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start cursor-pointer"
            onClick={() => handleButtonClick('quick-action', 'settings')}
            type="button"
          >
            <Settings className="h-4 w-4 mr-2" />
            Einstellungen
          </Button>
        </div>
      </div>
    </div>
  );
}
