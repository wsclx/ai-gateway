'use client'

import { 
  Activity, 
  Users, 
  MessageSquare, 
  AlertCircle,
  TrendingUp,
  Server,
  Database,
  Cpu,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { systemApi, SystemOverview } from '@/lib/api-client'

export default function DashboardPage() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [overview, setOverview] = useState<SystemOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setCurrentTime(new Date())
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const o = await systemApi.getSystemOverview()
      setOverview(o)
      setError(null)
    } catch (e) {
      setError('Fehler beim Laden der Kennzahlen')
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        const o = await systemApi.getSystemOverview()
        setOverview(o)
        setError(null)
      } catch (e) {
        setError('Fehler beim Laden der Kennzahlen')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const stats = [
    {
      label: 'Active Users',
      value: overview?.users.active?.toLocaleString() ?? '—',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      description: 'vs. last 30 days'
    },
    {
      label: 'Total Messages',
      value: overview?.chat.total_messages?.toLocaleString() ?? '—',
      change: '+8.1%',
      trend: 'up',
      icon: MessageSquare,
      description: 'Total interactions'
    },
    {
      label: 'Threads',
      value: overview?.chat.total_threads?.toLocaleString() ?? '—',
      change: '-15%',
      trend: 'up',
      icon: Activity,
      description: 'Total threads'
    },
    {
      label: 'Avg Msg/Thread',
      value: overview?.chat.avg_messages_per_thread?.toString() ?? '—',
      change: '-0.03%',
      trend: 'down',
      icon: AlertCircle,
      description: 'Conversation depth'
    }
  ]

  const systemStatus = [
    { name: 'API Gateway', status: 'operational', latency: '—', uptime: overview?.system.uptime ?? '—' },
    { name: 'Database Cluster', status: 'operational', latency: '—', uptime: '—' },
    { name: 'AI Services', status: 'operational', latency: '—', uptime: '—' },
    { name: 'Cache Layer', status: 'maintenance', latency: '—', uptime: '—' }
  ]

  const recentActivity = [
    { id: 1, user: 'Mario L.', action: 'Deployed new model version', time: '2 min ago', type: 'deployment' },
    { id: 2, user: 'System', action: 'Auto-scaled workers to 12 instances', time: '15 min ago', type: 'system' },
    { id: 3, user: 'Sarah K.', action: 'Updated rate limiting rules', time: '1 hour ago', type: 'config' },
    { id: 4, user: 'API Bot', action: 'Completed daily backup', time: '3 hours ago', type: 'backup' }
  ]

  return (
    <div className="min-h-screen bg-bg">
      <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text">
              Operations Dashboard
            </h1>
            <p className="text-text-secondary mt-1">
              Real-time system monitoring and analytics
            </p>
          </div>
          
          <div className="flex items-center gap-3 mt-4 lg:mt-0">
            <span className="text-sm text-text-muted">
              Last updated: {mounted && currentTime ? currentTime.toLocaleTimeString() : '—'}
            </span>
            <button
              onClick={handleRefresh}
              className={`p-2 rounded-lg bg-bg-secondary border border-border 
                         hover:bg-bg-muted transition-all duration-fast
                         ${isRefreshing ? 'animate-spin' : ''}`}
            >
              <RefreshCw className="h-4 w-4 text-text-secondary" />
            </button>
            <Link
              href="/admin"
              className="px-4 py-2 bg-primary text-white rounded-lg
                       hover:bg-primary-hover transition-all duration-fast
                       font-medium text-sm"
            >
              Admin Panel
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        {error && (
          <div className="bg-error/10 text-error border border-error/20 rounded-xl p-4 text-sm mb-4">{error}</div>
        )}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {[0,1,2,3].map((i) => (
              <div key={`skeleton-${i}`} className="group bg-card rounded-xl border border-border p-6 animate-pulse">
                <div className="h-4 w-24 bg-bg-secondary rounded" />
                <div className="h-8 w-32 bg-bg-secondary rounded mt-4" />
              </div>
            ))}
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const trendClass = stat.trend === 'up' ? 'text-success' : 'text-error'
            return (
            <div
              key={`${stat.label}-${index}`}
              className="group bg-card rounded-xl border border-border p-6
                       hover:shadow-lg hover:border-primary/20 
                       transition-all duration-normal cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-text-muted text-sm font-medium">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-text mt-2">
                    {stat.value}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className={`flex items-center text-sm font-medium ${trendClass}`}>
                      {stat.trend === 'up' ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                      {stat.change}
                    </span>
                    <span className="text-text-muted text-xs">
                      {stat.description}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-bg-secondary rounded-lg 
                              group-hover:bg-primary/10 transition-colors duration-normal">
                  <stat.icon className="h-5 w-5 text-text-secondary 
                                      group-hover:text-primary transition-colors" />
                </div>
              </div>
            </div>
          )})}
        </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* System Status */}
          <div className="xl:col-span-2 bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-text">
                System Status
              </h2>
              <button className="p-1 hover:bg-bg-secondary rounded-lg transition-colors">
                <MoreVertical className="h-4 w-4 text-text-muted" />
              </button>
            </div>
            
            <div className="space-y-4">
              {systemStatus.map((system) => {
                let pulseClass = 'bg-error'
                let statusClass = 'text-error'
                if (system.status === 'operational') {
                  pulseClass = 'bg-success'
                  statusClass = 'text-success'
                } else if (system.status === 'maintenance') {
                  pulseClass = 'bg-warning'
                  statusClass = 'text-warning'
                }
                return (
                <div
                  key={system.name}
                  className="flex items-center justify-between p-4 
                           bg-bg-secondary/50 rounded-lg hover:bg-bg-secondary 
                           transition-all duration-fast"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${pulseClass}`} />
                    <div>
                      <p className="font-medium text-text">
                        {system.name}
                      </p>
                      <p className="text-sm text-text-muted mt-0.5">
                        Latency: {system.latency}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-sm font-medium ${statusClass}`}>
                      {system.status.charAt(0).toUpperCase() + system.status.slice(1)}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {system.uptime} uptime
                    </p>
                  </div>
                </div>
              )})}
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-text-muted" />
                    <span className="text-sm text-text-secondary">
                      12 Active Nodes
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-text-muted" />
                    <span className="text-sm text-text-secondary">
                      3.2TB Storage Used
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-text-muted" />
                    <span className="text-sm text-text-secondary">
                      42% CPU Usage
                    </span>
                  </div>
                </div>
                <Link
                  href="/analytics"
                  className="text-sm text-primary hover:text-primary-hover 
                           font-medium transition-colors"
                >
                  View Details →
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-text">
                Recent Activity
              </h2>
              <Link
                href="/logs"
                className="text-sm text-primary hover:text-primary-hover 
                         font-medium transition-colors"
              >
                View All
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                let bgClass = 'bg-success/10'
                let iconEl: JSX.Element | null = null
                if (activity.type === 'deployment') {
                  bgClass = 'bg-primary/10'
                  iconEl = <TrendingUp className="h-4 w-4 text-primary" />
                } else if (activity.type === 'system') {
                  bgClass = 'bg-accent/10'
                  iconEl = <Server className="h-4 w-4 text-accent" />
                } else if (activity.type === 'config') {
                  bgClass = 'bg-warning/10'
                  iconEl = <AlertCircle className="h-4 w-4 text-warning" />
                } else {
                  iconEl = <Database className="h-4 w-4 text-success" />
                }
                return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 group cursor-pointer"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bgClass}`}>
                    {iconEl}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text group-hover:text-primary 
                                 transition-colors">
                      <span className="font-medium">{activity.user}</span>
                      {' '}
                      <span className="text-text-secondary">
                        {activity.action}
                      </span>
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          {[
            { label: 'Chat Interface', href: '/', icon: MessageSquare, color: 'primary' },
            { label: 'Tickets', href: '/tickets', icon: AlertCircle, color: 'accent' },
            { label: 'Analytics', href: '/analytics', icon: Activity, color: 'success' },
            { label: 'Settings', href: '/admin', icon: Server, color: 'warning' }
          ].map((action, index) => (
            <Link
              key={`${action.label}-${index}`}
              href={action.href}
              className="group p-4 bg-card rounded-xl border border-border
                       hover:shadow-md hover:border-primary/20
                       transition-all duration-normal"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-${action.color}/10
                              group-hover:bg-${action.color}/20 transition-colors`}>
                  <action.icon className={`h-5 w-5 text-${action.color}`} />
                </div>
                <div>
                  <p className="font-medium text-text group-hover:text-primary 
                               transition-colors">
                    {action.label}
                  </p>
                  <p className="text-xs text-text-muted">
                    Click to navigate
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}