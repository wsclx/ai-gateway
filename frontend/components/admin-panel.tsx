'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { apiClient, AdminConfig } from '@/lib/api-client'
import { RefreshCw, Save, Users, BarChart3, Activity, Shield, Database, Settings, Brain, Upload, Download, Play, Pause, RotateCcw } from 'lucide-react'

interface User {
  id: string
  displayName: string
  email: string
  role: string
  department: string
  lastLogin: string
  status: 'active' | 'inactive' | 'suspended'
}

interface SystemMetrics {
  activeUsers: number
  totalRequests: number
  avgResponseTime: number
  errorRate: number
  storageUsed: number
  uptime: number
}

export function AdminPanel() {
  const [cfg, setCfg] = useState<AdminConfig | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [openaiKey, setOpenaiKey] = useState('')
  const [anthropicKey, setAnthropicKey] = useState('')
  const [audit, setAudit] = useState<any[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [metrics, setMetrics] = useState<SystemMetrics>({
    activeUsers: 0,
    totalRequests: 0,
    avgResponseTime: 0,
    errorRate: 0,
    storageUsed: 0,
    uptime: 0
  })
  const [activeTab, setActiveTab] = useState('config')

  const load = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Load admin config
      const configRes = await apiClient.getAdminConfig()
      if (configRes.success && configRes.data) setCfg(configRes.data)
      else setError(configRes.error || 'Fehler beim Laden der Konfiguration')
      
      // Load audit logs
      const logsRes = await apiClient.getAuditLogs(50)
      if (logsRes.success && logsRes.data) setAudit(logsRes.data.items)
      
      // TODO: Implement real API calls for users and metrics
      // For now, using placeholder data
      
    } catch (err) {
      setError('Fehler beim Laden der Daten')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    load()
  }, [])

  const save = async () => {
    if (!cfg) return
    setLoading(true)
    setError(null)
    const payload: any = {
      retentionDays: cfg.retentionDays,
      redactionEnabled: cfg.redactionEnabled,
      budgetMonthlyCents: cfg.budgetMonthlyCents,
      costAlertThresholdCents: cfg.costAlertThresholdCents,
      featureDemoMode: cfg.featureDemoMode,
      enableAnalytics: cfg.enableAnalytics,
    }
    if (openaiKey.trim()) payload.openaiApiKey = openaiKey.trim()
    if (anthropicKey.trim()) payload.anthropicApiKey = anthropicKey.trim()
    const res = await apiClient.updateAdminConfig(payload)
    if (res.success && res.data) { setCfg(res.data); setOpenaiKey(''); setAnthropicKey('') }
    else setError(res.error || 'Fehler beim Speichern')
    setLoading(false)
  }

  const updateUserStatus = (userId: string, status: User['status']) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u))
  }

  if (!cfg) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Admin</CardTitle>
          <CardDescription>Gateway-Konfiguration</CardDescription>
        </CardHeader>
        <CardContent>{loading ? 'Lade...' : error || 'Keine Daten'}</CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Admin</h2>
          <p className="text-muted-foreground">Gateway-Konfiguration verwalten</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2"/>Neu laden
          </Button>
          <Button onClick={save} disabled={loading}>
            <Save className="h-4 w-4 mr-2"/>{loading ? 'Speichern...' : 'Speichern'}
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Konfiguration
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Benutzer
          </TabsTrigger>
          <TabsTrigger value="training" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Training
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Monitoring
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Provider</CardTitle>
              <CardDescription>API-Schlüssel (werden nicht angezeigt)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>OpenAI API Key {cfg.openaiApiKey ? '(gesetzt)' : '(nicht gesetzt)'}</Label>
                <Input value={openaiKey} onChange={e => setOpenaiKey(e.target.value)} placeholder="sk-..."/>
              </div>
              <div className="space-y-2">
                <Label>Anthropic API Key {cfg.anthropicApiKey ? '(gesetzt)' : '(nicht gesetzt)'}</Label>
                <Input value={anthropicKey} onChange={e => setAnthropicKey(e.target.value)} placeholder="anthropic-..."/>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compliance & Kosten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Retention (Tage)</Label>
                  <Input type="number" value={cfg.retentionDays} onChange={e => setCfg({...cfg, retentionDays: parseInt(e.target.value || '0')})}/>
                </div>
                <div>
                  <Label>Budget (Monat, Cent)</Label>
                  <Input type="number" value={cfg.budgetMonthlyCents} onChange={e => setCfg({...cfg, budgetMonthlyCents: parseInt(e.target.value || '0')})}/>
                </div>
                <div>
                  <Label>Kostenschwelle (Cent)</Label>
                  <Input type="number" value={cfg.costAlertThresholdCents} onChange={e => setCfg({...cfg, costAlertThresholdCents: parseInt(e.target.value || '0')})}/>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Redaction</Label>
                  <p className="text-sm text-muted-foreground">PII-Redaktion aktivieren</p>
                </div>
                <Switch checked={cfg.redactionEnabled} onCheckedChange={v => setCfg({...cfg, redactionEnabled: v})}/>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Demo-Mode</Label>
                  <p className="text-sm text-muted-foreground">Demo-Daten und -Flows</p>
                </div>
                <Switch checked={cfg.featureDemoMode} onCheckedChange={v => setCfg({...cfg, featureDemoMode: v})}/>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Analytics</Label>
                  <p className="text-sm text-muted-foreground">Analytics aktivieren</p>
                </div>
                <Switch checked={cfg.enableAnalytics} onCheckedChange={v => setCfg({...cfg, enableAnalytics: v})}/>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Benutzer-Verwaltung</CardTitle>
              <CardDescription>Benutzer und Rollen verwalten</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">{user.displayName}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{user.role}</Badge>
                            <Badge variant="outline">{user.department}</Badge>
                            <Badge variant={user.status === 'active' ? 'default' : user.status === 'inactive' ? 'secondary' : 'destructive'}>
                              {user.status === 'active' ? 'Aktiv' : user.status === 'inactive' ? 'Inaktiv' : 'Gesperrt'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Letzter Login: {user.lastLogin}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateUserStatus(user.id, user.status === 'active' ? 'inactive' : 'active')}
                      >
                        {user.status === 'active' ? 'Deaktivieren' : 'Aktivieren'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateUserStatus(user.id, 'suspended')}
                      >
                        Sperren
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Training Jobs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Training Jobs
                </CardTitle>
                <CardDescription>OpenAI Assistenten trainieren und finetunen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                    <div className="flex-1">
                      <p className="font-medium">HR Assistant v2</p>
                      <p className="text-sm text-muted-foreground">GPT-4o-mini • Finetuning</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="default">Training</Badge>
                        <span className="text-xs text-muted-foreground">75% • 2h 15m</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Pause className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">Marketing Expert</p>
                      <p className="text-sm text-muted-foreground">GPT-4o • Finetuning</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">Wartend</Badge>
                        <span className="text-xs text-muted-foreground">Queue: #3</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" variant="destructive">
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">Code Helper</p>
                      <p className="text-sm text-muted-foreground">GPT-4o-mini • Finetuning</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">Abgeschlossen</Badge>
                        <span className="text-xs text-muted-foreground">Vor 2h • 3h 42m</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full" variant="outline">
                  <Brain className="h-4 w-4 mr-2" />
                  Neuen Job erstellen
                </Button>
              </CardContent>
            </Card>

            {/* Training Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Training Konfiguration</CardTitle>
                <CardDescription>Einstellungen für das Training</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Base Model</Label>
                  <select className="w-full p-2 border rounded-md">
                    <option>gpt-4o-mini</option>
                    <option>gpt-4o</option>
                    <option>gpt-4-turbo</option>
                    <option>gpt-3.5-turbo</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label>Training Type</Label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Finetuning</option>
                    <option>RAG (Retrieval Augmented Generation)</option>
                    <option>Custom Instructions</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label>Learning Rate</Label>
                  <Input type="number" step="0.0001" placeholder="0.0001" />
                </div>
                
                <div className="space-y-2">
                  <Label>Epochs</Label>
                  <Input type="number" min="1" max="100" placeholder="3" />
                </div>
                
                <div className="space-y-2">
                  <Label>Batch Size</Label>
                  <Input type="number" min="1" max="128" placeholder="16" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Training Data Management */}
          <Card>
            <CardHeader>
              <CardTitle>Training Daten</CardTitle>
              <CardDescription>Datensätze für das Training verwalten</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">HR Conversations</h4>
                    <Badge variant="outline">1.2k</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">HR-spezifische Gespräche und Fragen</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-1" />
                      Hochladen
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Marketing Guidelines</h4>
                    <Badge variant="outline">450</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Marketing-Richtlinien und Best Practices</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-1" />
                      Hochladen
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Code Examples</h4>
                    <Badge variant="outline">2.8k</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Code-Beispiele und Erklärungen</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-1" />
                      Hochladen
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Neuen Datensatz hochladen
                </Button>
                <Button variant="outline">
                  <Brain className="h-4 w-4 mr-2" />
                  Daten analysieren
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Training Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Training Metriken</CardTitle>
              <CardDescription>Performance und Qualität der trainierten Modelle</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">94.2%</div>
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">87.5%</div>
                  <p className="text-sm text-muted-foreground">Relevanz</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">2.3s</div>
                  <p className="text-sm text-muted-foreground">Durchschn. Antwort</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">€0.023</div>
                  <p className="text-sm text-muted-foreground">Kosten pro Request</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aktive Benutzer</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.activeUsers}</div>
                <p className="text-xs text-muted-foreground">+2 seit gestern</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gesamt-Requests</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalRequests.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+12% seit letztem Monat</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Durchschn. Antwortzeit</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.avgResponseTime}ms</div>
                <p className="text-xs text-muted-foreground">-5% seit letzter Woche</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fehlerrate</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.errorRate}%</div>
                <p className="text-xs text-muted-foreground">-0.2% seit gestern</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>Letzte Requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-auto text-sm">
                {audit.length === 0 && <div className="text-muted-foreground">Keine Einträge</div>}
                {audit.map((a, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 border-b py-1">
                    <div className="col-span-2">{a.created_at?.slice(11,19) || ''}</div>
                    <div className="col-span-1">{a.method}</div>
                    <div className="col-span-6 truncate" title={a.path}>{a.path}</div>
                    <div className="col-span-1">{a.status}</div>
                    <div className="col-span-2 text-right">{a.duration_ms} ms</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>System-Status</CardTitle>
                <CardDescription>Live-System-Metriken</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Uptime</span>
                  <Badge variant="default">{metrics.uptime}%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Speicher</span>
                  <Badge variant="outline">{metrics.storageUsed} GB</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Datenbank</span>
                  <Badge variant="default">Online</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Redis Cache</span>
                  <Badge variant="default">Online</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
                <CardDescription>System-Performance-Metriken</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>CPU-Last</span>
                  <Badge variant="secondary">23%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>RAM-Verbrauch</span>
                  <Badge variant="secondary">1.2 GB</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Netzwerk</span>
                  <Badge variant="default">Normal</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Disk I/O</span>
                  <Badge variant="default">Normal</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Letzte Alerts</CardTitle>
              <CardDescription>System-Warnungen und Fehler</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 border rounded">
                  <Badge variant="destructive">Error</Badge>
                  <span className="text-sm">API Rate Limit erreicht - 15:42</span>
                </div>
                <div className="flex items-center gap-2 p-2 border rounded">
                  <Badge variant="secondary">Warning</Badge>
                  <span className="text-sm">Speicherverbrauch über 80% - 14:30</span>
                </div>
                <div className="flex items-center gap-2 p-2 border rounded">
                  <Badge variant="default">Info</Badge>
                  <span className="text-sm">Backup erfolgreich abgeschlossen - 12:00</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


