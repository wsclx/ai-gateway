'use client'

import { useState, useCallback, useEffect } from 'react'
import { Send, Edit3, Download, Trash2, MessageSquare, Clock } from 'lucide-react'
import { apiClient } from '@/lib/api-client'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatInterfaceProps {
  selectedAssistant: string | null
}

export function ChatInterface({ selectedAssistant }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [threadId, setThreadId] = useState<string | null>(null)
  const [threadTitle, setThreadTitle] = useState('Neue Konversation')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [threads, setThreads] = useState<any[]>([])
  const [showThreads, setShowThreads] = useState(false)

  // Load threads on mount
  useEffect(() => {
    const loadThreads = async () => {
      const res = await apiClient.getThreads()
      if (res.success && res.data) {
        setThreads(res.data)
      }
    }
    loadThreads()
  }, [])

  // Create a thread when assistant changes
  useEffect(() => {
    const create = async () => {
      setMessages([])
      setThreadId(null)
      setThreadTitle('Neue Konversation')
      if (!selectedAssistant) return
      const res = await apiClient.createThread(selectedAssistant)
      if (res.success && res.data) {
        setThreadId(res.data.id)
        setThreadTitle(res.data.title || 'Neue Konversation')
      }
    }
    create()
  }, [selectedAssistant])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || !selectedAssistant) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsStreaming(true)

    try {
      let currentThreadId = threadId
      // Create thread lazily if missing
      if (!currentThreadId) {
        const thr = await apiClient.createThread(selectedAssistant)
        if (thr.success && thr.data) currentThreadId = thr.data.id
        setThreadId(currentThreadId || null)
      }
      if (!currentThreadId) throw new Error('Kein Thread verfügbar')

      const resp = await apiClient.sendMessage(currentThreadId, userMessage.content, selectedAssistant)
      if (resp.success && resp.data) {
        const assistantMessage: Message = {
          id: resp.data.id,
          role: resp.data.role as 'assistant',
          content: resp.data.content,
          timestamp: new Date(resp.data.timestamp)
        }
        setMessages(prev => [...prev, assistantMessage])
        
        // Update thread title if it's still default
        if (threadTitle === 'Neue Konversation' && messages.length === 0) {
          const newTitle = userMessage.content.slice(0, 50) + (userMessage.content.length > 50 ? '...' : '')
          setThreadTitle(newTitle)
        }
      } else {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: resp.error || 'Fehler beim Abrufen der Antwort.',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
      }
      setIsStreaming(false)
      setStreamingContent('')
    } catch (error: any) {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: error?.message || 'Unbekannter Fehler beim Senden.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsStreaming(false)
    }
  }, [inputValue, selectedAssistant, threadId, threadTitle, messages.length])

  const handleThreadSelect = async (thread: any) => {
    setThreadId(thread.id)
    setThreadTitle(thread.title || 'Unbenannte Konversation')
    setShowThreads(false)
    
    // Load thread messages
    const res = await apiClient.getThreadMessages(thread.id)
    if (res.success && res.data) {
      setMessages(res.data.map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp)
      })))
    }
  }

  const handleExportConversation = () => {
    const conversationData = {
      title: threadTitle,
      assistant: selectedAssistant,
      messages: messages,
      timestamp: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(conversationData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${threadTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDeleteThread = async () => {
    if (!threadId) return
    if (confirm('Möchtest du diese Konversation wirklich löschen?')) {
      setMessages([])
      setThreadId(null)
      setThreadTitle('Neue Konversation')
      // Note: Backend delete endpoint would be called here
    }
  }

  if (!selectedAssistant) {
    return (
      <div className="bg-card border rounded-lg p-8 text-center">
        <div className="text-muted-foreground">
          Bitte wähle einen Assistenten aus, um zu beginnen.
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card border rounded-lg flex flex-col h-96">
      {/* Header with thread management */}
      <div className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowThreads(!showThreads)}
            className="p-2 hover:bg-muted rounded-md"
            title="Konversationen anzeigen"
          >
            <MessageSquare className="h-4 w-4" />
          </button>
          
          {isEditingTitle ? (
            <input
              type="text"
              value={threadTitle}
              onChange={(e) => setThreadTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
              className="px-2 py-1 border rounded text-sm"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="flex items-center gap-1 hover:bg-muted px-2 py-1 rounded text-sm font-medium"
            >
              {threadTitle}
              <Edit3 className="h-3 w-3" />
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportConversation}
            className="p-2 hover:bg-muted rounded-md"
            title="Konversation exportieren"
            disabled={messages.length === 0}
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={handleDeleteThread}
            className="p-2 hover:bg-muted rounded-md text-destructive"
            title="Konversation löschen"
            disabled={!threadId}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Threads sidebar */}
      {showThreads && (
        <div className="border-b p-4 bg-muted/50">
          <div className="text-sm font-medium mb-2">Konversationen</div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => handleThreadSelect(thread)}
                className={`w-full text-left p-2 rounded text-sm hover:bg-background ${
                  thread.id === threadId ? 'bg-background border' : ''
                }`}
              >
                <div className="font-medium truncate">{thread.title || 'Unbenannte Konversation'}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(thread.updated_at).toLocaleDateString('de-DE')}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground">
            Starte eine Konversation.
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                <div className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString('de-DE')}
                </div>
              </div>
            </div>
          ))
        )}
        
        {isStreaming && (
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-muted">
              <div className="text-sm">{streamingContent}...</div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Schreibe eine Nachricht..."
            className="flex-1 px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isStreaming}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isStreaming}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
