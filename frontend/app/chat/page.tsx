'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Send, Loader2, Bot, User } from 'lucide-react';
import { chatApi, ChatMessage, assistantsApi } from '@/lib/api-client';

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assistantId, setAssistantId] = useState<string>('');
  const [threadId, setThreadId] = useState<string>('');
  const params = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fromUrl = params.get('assistant');
    (async () => {
      if (fromUrl && fromUrl.trim()) {
        setAssistantId(fromUrl.trim());
        return;
      }
      try {
        const list = await assistantsApi.getAssistants();
        if (list.length > 0) setAssistantId(list[0].id);
      } catch (e) {
        // ignore; chat input will be disabled until assistantId is set
      }
    })();
  }, [params]);

  const sendMessage = async () => {
    if (!input.trim() || loading || !assistantId) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date().toISOString(),
      assistant_id: assistantId
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

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.data.content,
        role: 'assistant',
        timestamp: new Date().toISOString(),
        assistant_id: assistantId
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Failed to send message:', err);
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

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary mb-2">Chat</h1>
        <p className="text-text-muted">Chatten Sie mit unseren AI-Assistenten</p>
      </div>

      {/* Messages */}
      <div className="flex-1 bg-bg-tertiary rounded-xl border border-border-default p-6 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <Bot className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-muted">Starten Sie eine Konversation</p>
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
                <div className="w-8 h-8 bg-accent-primary/10 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-accent-primary" />
                </div>
              )}
              
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-accent-primary text-white'
                    : 'bg-bg-elevated text-text-primary'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {mounted ? new Date(message.timestamp).toLocaleTimeString('de-DE') : '—'}
                </p>
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 bg-accent-success/10 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-accent-success" />
                </div>
              )}
            </div>
          ))
        )}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-accent-primary/10 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-accent-primary" />
            </div>
            <div className="bg-bg-elevated rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-text-muted" />
                <span className="text-sm text-text-muted">Schreibt...</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-accent-error/10 border border-accent-error/20 rounded-lg p-3">
            <p className="text-sm text-accent-error">{error}</p>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="mt-4 flex gap-3">
        <div className="flex-1 relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Schreiben Sie eine Nachricht..."
            className="w-full bg-bg-tertiary border border-border-default rounded-lg p-3 pr-12 resize-none text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary/50"
            rows={3}
            disabled={loading}
          />
        </div>
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim() || !assistantId}
          className="px-4 py-3 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
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
  );
}
