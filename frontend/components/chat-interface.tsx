'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, Download, Trash2 } from 'lucide-react';
import { chatApi } from '@/lib/api-client';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

interface ChatInterfaceProps {
  assistantId: string;
  assistantName: string;
}

export default function ChatInterface({ assistantId, assistantName }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [threadId, setThreadId] = useState<string>('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      // Ensure a thread exists
      let currentThreadId = threadId;
      if (!currentThreadId) {
        const created = await chatApi.createThread(assistantId);
        currentThreadId = created.data.id;
        setThreadId(currentThreadId);
      }

      const response = await chatApi.sendMessage(currentThreadId, input, assistantId);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.data.content,
        role: 'assistant',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (e) {
      console.error('Failed to send message:', e);
      setError('Fehler beim Senden der Nachricht');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const exportChat = () => {
    const chatData = {
      assistantId,
      assistantName,
      messages,
      exportedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(chatData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(dataBlob);
    a.download = `chat-${assistantId}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h2 className="text-lg font-semibold text-text">{assistantName}</h2>
          <p className="text-sm text-text-muted">{messages.length} Nachrichten</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportChat}
            className="p-2 text-text-muted hover:text-text hover:bg-bg-secondary rounded-lg transition-colors"
            title="Chat exportieren"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={clearChat}
            className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors"
            title="Chat löschen"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <Bot className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-muted">Starten Sie eine Konversation mit {assistantName}</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-bg-secondary text-text'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {mounted ? new Date(message.timestamp).toLocaleTimeString('de-DE') : '—'}
                </p>
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-success" />
                </div>
              )}
            </div>
          ))
        )}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-bg-secondary rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-text-muted" />
                <span className="text-sm text-text-muted">Schreibt...</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-error/10 border border-error/20 rounded-lg p-3">
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-3">
          <div className="flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Schreiben Sie eine Nachricht..."
              className="w-full bg-bg-secondary border border-border rounded-lg p-3 resize-none text-text placeholder-text-muted focus:outline-none focus:border-primary/50"
              rows={3}
              disabled={loading}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Senden
          </button>
        </div>
      </div>
    </div>
  );
}
