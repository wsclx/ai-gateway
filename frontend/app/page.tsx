'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  MessageSquare, Bot, Sparkles, Plus, Brain, FileText,
  TrendingUp, Users, Shield, Settings, Upload, Database,
  Activity, Clock, Zap, AlertCircle, BarChart3, History,
  Search, Filter, Download, RefreshCw, ChevronRight,
  Code, Layers, GitBranch, Terminal, Cpu, HardDrive,
  Globe, Lock, Unlock, Eye, EyeOff, Star, StarOff,
  CheckCircle, XCircle, AlertTriangle, Info, HelpCircle,
  FolderOpen, FileCode, FileJson, FilePlus, Trash2,
  Edit3, Copy, Share2, MoreVertical, ChevronDown
} from 'lucide-react';

// Types
interface Assistant {
  id: string;
  name: string;
  description?: string;
  instructions?: string;
  model: string;
  status: 'active' | 'inactive' | 'maintenance';
  created_at: string;
  updated_at?: string;
  usage_stats: {
    total_threads: number;
    active_users: number;
    total_messages?: number;
    avg_response_time?: number;
    success_rate?: number;
    last_used?: string;
  };
  capabilities?: string[];
  tags?: string[];
  version?: string;
  is_favorite?: boolean;
}

interface SystemStats {
  total_assistants: number;
  active_assistants: number;
  total_messages: number;
  total_users: number;
  total_threads: number;
  avg_response_time: number;
  system_health: 'operational' | 'degraded' | 'down';
  uptime_percentage: number;
  storage_used: number;
  storage_total: number;
  cpu_usage: number;
  memory_usage: number;
}

export default function HomePage() {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [filteredAssistants, setFilteredAssistants] = useState<Assistant[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'maintenance'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'usage' | 'updated'>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('grid');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const router = useRouter();

  // Fetch assistants
  const fetchAssistants = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/proxy/assistants');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const cleanData = (data || []).map((assistant: any) => ({
        ...assistant,
        usage_stats: {
          total_threads: assistant.usage_stats?.total_threads || 0,
          active_users: assistant.usage_stats?.active_users || 0,
          total_messages: assistant.usage_stats?.total_messages || 0,
          avg_response_time: assistant.usage_stats?.avg_response_time || 0,
          success_rate: assistant.usage_stats?.success_rate || 0,
          last_used: assistant.usage_stats?.last_used || null
        },
        capabilities: assistant.capabilities || [],
        tags: assistant.tags || [],
        version: assistant.version || '',
        is_favorite: Boolean(assistant.is_favorite)
      }));

      setAssistants(cleanData);
      setFilteredAssistants(cleanData);
     
    } catch (err: any) {
      console.error('Failed to fetch assistants:', err);
      setError(err.message || 'Fehler beim Laden der Assistenten');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAssistants();
  }, [fetchAssistants]);

  // Filter and sort assistants
  useEffect(() => {
    let filtered = [...assistants];
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(a => 
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(a => a.status === filterStatus);
    }
    
    // Favorites filter
    if (showOnlyFavorites) {
      filtered = filtered.filter(a => a.is_favorite);
    }
    
    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'usage':
          return (b.usage_stats?.total_messages || 0) - (a.usage_stats?.total_messages || 0);
        case 'updated':
          return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
        default:
          return 0;
      }
    });
    
    setFilteredAssistants(filtered);
  }, [assistants, searchQuery, filterStatus, sortBy, showOnlyFavorites]);

  // Handlers
  const handleAssistantClick = (assistant: Assistant) => {
    router.push(`/chat?assistant=${assistant.id}`);
  };

  const handleCreateAssistant = () => {
    router.push('/admin/assistants/new');
  };

  const toggleFavorite = (e: React.MouseEvent, assistantId: string) => {
    e.stopPropagation();
    setAssistants(prev => prev.map(a => 
      a.id === assistantId ? { ...a, is_favorite: !a.is_favorite } : a
    ));
  };

  const handleTraining = (e: React.MouseEvent, assistantId: string) => {
    e.stopPropagation();
    router.push(`/training?assistant=${assistantId}`);
  };

  const handleAnalytics = (e: React.MouseEvent, assistantId: string) => {
    e.stopPropagation();
    router.push(`/analytics?assistant=${assistantId}`);
  };

  const handleEdit = (e: React.MouseEvent, assistantId: string) => {
    e.stopPropagation();
    router.push(`/admin/assistants/${assistantId}/edit`);
  };

  // UI Components
  const getStatusBadge = (status: string) => {
    const config = {
      active: { 
        variant: 'default' as const, 
        text: 'Aktiv',
        icon: <CheckCircle className="h-3 w-3" />,
        color: 'bg-green-500/10 text-green-700 border-green-200'
      },
      inactive: { 
        variant: 'secondary' as const, 
        text: 'Inaktiv',
        icon: <XCircle className="h-3 w-3" />,
        color: 'bg-gray-500/10 text-gray-700 border-gray-200'
      },
      maintenance: { 
        variant: 'outline' as const, 
        text: 'Wartung',
        icon: <AlertTriangle className="h-3 w-3" />,
        color: 'bg-yellow-500/10 text-yellow-700 border-yellow-200'
      }
    };

    const cfg = config[status as keyof typeof config] || config.inactive;
    
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
        {cfg.icon}
        <span>{cfg.text}</span>
      </div>
    );
  };

  const getModelIcon = (model: string) => {
    if (model.includes('gpt-4o')) return <Zap className="h-5 w-5 text-purple-500" />;
    if (model.includes('gpt')) return <Sparkles className="h-5 w-5 text-blue-500" />;
    if (model.includes('claude')) return <Bot className="h-5 w-5 text-orange-500" />;
    if (model.includes('llama')) return <Brain className="h-5 w-5 text-green-500" />;
    return <MessageSquare className="h-5 w-5 text-gray-500" />;
  };

  const getHealthColor = (health: string) => {
    switch(health) {
      case 'operational': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'down': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (loading && !refreshing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">System wird initialisiert...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header with Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              AI Gateway Control Center
            </h1>
            <p className="text-muted-foreground mt-2">
              Zentrale Verwaltung aller KI-Assistenten und Systeme
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => fetchAssistants()}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Aktualisieren
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/training')}
            >
              <Brain className="h-4 w-4 mr-2" />
              Training
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/analytics')}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
            
            <Button 
              onClick={handleCreateAssistant}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Neuer Assistent
            </Button>
          </div>
        </div>

        {/* System Overview Cards */}
        {systemStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className={`text-2xl font-bold ${getHealthColor(systemStats.system_health)}`}>
                    {systemStats.system_health === 'operational' ? 'Online' : 
                     systemStats.system_health === 'degraded' ? 'Degraded' : 'Offline'}
                  </span>
                  <Activity className={`h-5 w-5 ${getHealthColor(systemStats.system_health)}`} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {systemStats.uptime_percentage}% Uptime
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Assistenten</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold">{systemStats.active_assistants}</span>
                    <span className="text-sm text-muted-foreground">/{systemStats.total_assistants}</span>
                  </div>
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <Progress value={(systemStats.active_assistants / systemStats.total_assistants) * 100} className="mt-2 h-1" />
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Nachrichten</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {systemStats.total_messages.toLocaleString('de-DE')}
                  </span>
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  ⌀ {systemStats.avg_response_time.toFixed(1)}s Response
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Aktive Nutzer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{systemStats.total_users}</span>
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {systemStats.total_threads} Threads
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">CPU / RAM</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">CPU</span>
                    <span className="text-xs font-medium">{systemStats.cpu_usage.toFixed(1)}%</span>
                  </div>
                  <Progress value={systemStats.cpu_usage} className="h-1" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">RAM</span>
                    <span className="text-xs font-medium">{systemStats.memory_usage.toFixed(1)}%</span>
                  </div>
                  <Progress value={systemStats.memory_usage} className="h-1" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Speicher</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold">{systemStats.storage_used.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">GB</span>
                  </div>
                  <HardDrive className="h-5 w-5 text-primary" />
                </div>
                <Progress value={(systemStats.storage_used / systemStats.storage_total) * 100} className="mt-2 h-1" />
                <p className="text-xs text-muted-foreground mt-1">
                  von {systemStats.storage_total}GB
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Filter Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Suche nach Name, Modell, Tags..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                >
                  <option value="all">Alle Status</option>
                  <option value="active">Aktiv</option>
                  <option value="inactive">Inaktiv</option>
                  <option value="maintenance">Wartung</option>
                </select>
                
                <select
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                >
                  <option value="name">Name</option>
                  <option value="usage">Nutzung</option>
                  <option value="updated">Aktualisiert</option>
                </select>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                  className={showOnlyFavorites ? 'bg-yellow-50 border-yellow-300' : ''}
                >
                  {showOnlyFavorites ? <Star className="h-4 w-4 text-yellow-500" /> : <StarOff className="h-4 w-4" />}
                </Button>
                
                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Layers className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                    className="rounded-none border-x"
                  >
                    <Database className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'compact' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('compact')}
                    className="rounded-l-none"
                  >
                    <Code className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {filteredAssistants.length} von {assistants.length} Assistenten
            {searchQuery && ` für "${searchQuery}"`}
          </span>
          {error && (
            <span className="text-yellow-600 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Demo-Modus: Backend nicht erreichbar
            </span>
          )}
        </div>

        {/* Assistants Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Create New Assistant Card */}
            <Card 
              className="border-dashed border-2 hover:border-primary/50 transition-all cursor-pointer group bg-gradient-to-br from-primary/5 to-primary/10"
              onClick={handleCreateAssistant}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all group-hover:scale-110">
                  <Plus className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-lg">Neuen Assistenten erstellen</CardTitle>
                <CardDescription>
                  Konfigurieren Sie einen neuen KI-Assistenten mit benutzerdefinierten Einstellungen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Jetzt erstellen
                </Button>
              </CardContent>
            </Card>

            {/* Assistant Cards */}
            {filteredAssistants.map((assistant) => (
              <Card 
                key={assistant.id} 
                className="hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
                onClick={() => handleAssistantClick(assistant)}
              >
                {/* Favorite Badge */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 z-10 h-8 w-8"
                  onClick={(e) => toggleFavorite(e, assistant.id)}
                >
                  {assistant.is_favorite ? 
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" /> : 
                    <Star className="h-4 w-4 text-muted-foreground" />
                  }
                </Button>

                {/* Gradient Background Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardHeader className="relative pb-3">
                  <div className="flex items-start gap-3">
                    <div className="p-3 rounded-lg bg-background shadow-sm group-hover:shadow-md transition-all group-hover:scale-110">
                      {getModelIcon(assistant.model)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold truncate">{assistant.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{assistant.model}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{assistant.version}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    {getStatusBadge(assistant.status)}
                  </div>
                  
                  <CardDescription className="text-sm text-muted-foreground line-clamp-2 mt-3">
                    {assistant.description || 'Keine Beschreibung verfügbar'}
                  </CardDescription>
                  
                  {/* Tags */}
                  {assistant.tags && assistant.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {assistant.tags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 bg-secondary rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </CardHeader>
                
                <CardContent className="relative space-y-3">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center justify-between p-2 bg-secondary/50 rounded">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Nachrichten</span>
                      </div>
                      <span className="font-medium whitespace-nowrap">{assistant.usage_stats?.total_messages?.toLocaleString('de-DE') || 0}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 bg-secondary/50 rounded">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Nutzer</span>
                      </div>
                      <span className="font-medium whitespace-nowrap">{assistant.usage_stats?.active_users || 0}</span>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Response Zeit</span>
                      <span className="font-medium">{assistant.usage_stats?.avg_response_time?.toFixed(1)}s</span>
                    </div>
                    <Progress value={100 - (assistant.usage_stats?.avg_response_time || 0) * 20} className="h-1" />
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Erfolgsrate</span>
                      <span className="font-medium">{assistant.usage_stats?.success_rate?.toFixed(1)}%</span>
                    </div>
                    <Progress value={assistant.usage_stats?.success_rate || 0} className="h-1" />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="flex-1"
                      onClick={(e) => handleTraining(e, assistant.id)}
                    >
                      <Brain className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="flex-1"
                      onClick={(e) => handleAnalytics(e, assistant.id)}
                    >
                      <BarChart3 className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="flex-1"
                      onClick={(e) => handleEdit(e, assistant.id)}
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : viewMode === 'list' ? (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredAssistants.map((assistant) => (
                  <div 
                    key={assistant.id}
                    className="p-4 hover:bg-secondary/50 cursor-pointer transition-colors flex items-center gap-4"
                    onClick={() => handleAssistantClick(assistant)}
                  >
                    <div className="p-2 rounded-lg bg-background shadow-sm">
                      {getModelIcon(assistant.model)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{assistant.name}</h3>
                        {getStatusBadge(assistant.status)}
                        {assistant.is_favorite && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{assistant.description}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>{assistant.model}</span>
                        <span>•</span>
                        <span>{assistant.usage_stats?.total_messages?.toLocaleString('de-DE') || 0} Nachrichten</span>
                        <span>•</span>
                        <span>{assistant.usage_stats?.active_users || 0} Nutzer</span>
                        <span>•</span>
                        <span>{assistant.usage_stats?.success_rate?.toFixed(1)}% Erfolg</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={(e) => handleTraining(e, assistant.id)}>
                        <Brain className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={(e) => handleAnalytics(e, assistant.id)}>
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={(e) => handleEdit(e, assistant.id)}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button size="icon">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          // Compact View
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {filteredAssistants.map((assistant) => (
              <div 
                key={assistant.id}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors"
                onClick={() => handleAssistantClick(assistant)}
              >
                {getModelIcon(assistant.model)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{assistant.name}</span>
                    {assistant.is_favorite && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{assistant.model}</span>
                    <span>•</span>
                    <span>{assistant.usage_stats?.total_messages?.toLocaleString('de-DE') || 0} msgs</span>
                  </div>
                </div>
                {getStatusBadge(assistant.status)}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredAssistants.length === 0 && (
          <Card className="p-12">
            <div className="text-center">
              <Bot className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery ? 'Keine Assistenten gefunden' : 'Keine Assistenten vorhanden'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery ? 
                  `Keine Assistenten entsprechen Ihrer Suche "${searchQuery}"` : 
                  'Erstellen Sie Ihren ersten KI-Assistenten'}
              </p>
              {!searchQuery && (
                <Button onClick={handleCreateAssistant} size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Ersten Assistenten erstellen
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
