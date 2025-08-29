'use client'

import { useState, useCallback } from 'react'
import { ChatInterface } from '@/components/chat-interface'
import { AssistantPicker } from '@/components/assistant-picker'
import { AnalyticsPanel } from '@/components/analytics-panel'
import { AdminPanel } from '@/components/admin-panel'
import { SettingsPanel } from '@/components/settings-panel'
import { Bot, BarChart3, Settings, SlidersHorizontal, LogIn, Palette } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const [selectedAssistant, setSelectedAssistant] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("chat")

  const handleTabChange = useCallback((tab: string) => {
    // Tab changed
    setActiveTab(tab)
  }, [])

  const handleAssistantSelect = useCallback((assistantId: string) => {
    // Assistant selected
    setSelectedAssistant(assistantId)
  }, [])

  const handleButtonClick = useCallback((action: string) => {
    // Button clicked
    switch (action) {
      case 'chat':
        setActiveTab('chat')
        break
      case 'analytics':
        setActiveTab('analytics')
        break
      case 'settings':
        setActiveTab('settings')
        break
      case 'admin':
        setActiveTab('admin')
        break
      case 'branding':
        // Navigate to branding page
        window.location.href = '/branding'
        break
      default:
        // Unknown action
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1 hidden lg:block">
            <nav className="panel p-2 space-y-2">
              <button
                onClick={() => handleButtonClick('chat')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                  activeTab === 'chat' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
                type="button"
              >
                <Bot className="h-4 w-4" /> Chat
              </button>
              <button
                onClick={() => handleButtonClick('analytics')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                  activeTab === 'analytics' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
                type="button"
              >
                <BarChart3 className="h-4 w-4" /> Analytics
              </button>
              <button
                onClick={() => handleButtonClick('settings')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                  activeTab === 'settings' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
                type="button"
              >
                <Settings className="h-4 w-4" /> Einstellungen
              </button>
              <button
                onClick={() => handleButtonClick('admin')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                  activeTab === 'admin' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
                type="button"
              >
                <SlidersHorizontal className="h-4 w-4" /> Admin
              </button>
              <button
                onClick={() => handleButtonClick('branding')}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors hover:bg-muted"
                type="button"
              >
                <Palette className="h-4 w-4" /> Branding
              </button>
            </nav>
          </aside>

          {/* Content */}
          <section className="lg:col-span-5 space-y-6">
            {/* Mobile / Small-screen top navigation */}
            <nav className="panel p-2 flex lg:hidden gap-2 flex-wrap">
              <button
                onClick={() => handleButtonClick('chat')}
                className={`flex-1 min-w-0 px-3 py-2 rounded-md text-sm transition-colors ${
                  activeTab === 'chat' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => handleButtonClick('analytics')}
                className={`flex-1 min-w-0 px-3 py-2 rounded-md text-sm transition-colors ${
                  activeTab === 'analytics' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => handleButtonClick('settings')}
                className={`flex-1 min-w-0 px-3 py-2 rounded-md text-sm transition-colors ${
                  activeTab === 'settings' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                Einstellungen
              </button>
              <button
                onClick={() => handleButtonClick('admin')}
                className={`flex-1 min-w-0 px-3 py-2 rounded-md text-sm transition-colors ${
                  activeTab === 'admin' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => handleButtonClick('branding')}
                className="flex-1 min-w-0 px-3 py-2 rounded-md text-sm transition-colors hover:bg-muted"
              >
                Branding
              </button>
            </nav>
            
            <header className="flex items-center justify-between">
              <div>
                <h1>DUH AI Gateway</h1>
                <p className="text-sm text-muted-foreground">Professionelles Intranet-AI-Gateway</p>
              </div>
              <div>
                <a href="/api/v1/auth/ms/login" className="px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm inline-flex items-center gap-2">
                  <LogIn className="h-4 w-4"/> Microsoft Login
                </a>
              </div>
            </header>

            {activeTab === 'chat' && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                  <AssistantPicker
                    selectedAssistant={selectedAssistant}
                    onSelectAssistant={handleAssistantSelect}
                  />
                </div>
                <div className="lg:col-span-3 panel p-4">
                  <ChatInterface selectedAssistant={selectedAssistant} />
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="panel p-4">
                <AnalyticsPanel />
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="panel p-4">
                <SettingsPanel />
              </div>
            )}

            {activeTab === 'admin' && (
              <div className="panel p-4">
                <AdminPanel />
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
