'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { ChevronDown, Bot } from 'lucide-react';
import { assistantsApi, Assistant } from '@/lib/api-client';

interface AssistantItem {
  id: string;
  name: string;
  description: string;
  status: string;
}

interface AssistantPickerProps {
  onSelect: (assistant: AssistantItem) => void;
  selectedAssistant?: AssistantItem;
}

export function AssistantPicker({ onSelect, selectedAssistant }: AssistantPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [assistants, setAssistants] = useState<AssistantItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadAssistants = useCallback(async () => {
    try {
      setLoading(true);
      const data = await assistantsApi.getAssistants();
      // Map the data to match AssistantItem interface
      const mappedAssistants: AssistantItem[] = data.map(assistant => ({
        id: assistant.id,
        name: assistant.name,
        description: assistant.description || 'Keine Beschreibung verfügbar',
        status: assistant.status || 'active'
      }));
      setAssistants(mappedAssistants);
      setError(null);
    } catch (err) {
      console.error('Failed to load assistants:', err);
      setError('Fehler beim Laden der Assistenten');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssistants();
  }, [loadAssistants]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (assistant: AssistantItem) => {
    onSelect(assistant);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-bg-tertiary border border-border-default rounded-lg hover:bg-bg-elevated transition-colors"
      >
        <div className="flex items-center gap-3">
          {selectedAssistant ? (
            <>
              <Bot className="w-5 h-5 text-accent-primary" />
              <div className="text-left">
                <p className="text-sm font-medium text-text-primary">{selectedAssistant.name}</p>
                <p className="text-xs text-text-muted">{selectedAssistant.description}</p>
              </div>
            </>
          ) : (
            <>
              <Bot className="w-5 h-5 text-text-muted" />
              <span className="text-text-muted">Assistenten auswählen...</span>
            </>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-bg-tertiary border border-border-default rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-text-muted">
              Lade Assistenten...
            </div>
          ) : error ? (
            <div className="p-4 text-center text-accent-error text-sm">
              {error}
            </div>
          ) : assistants.length === 0 ? (
            <div className="p-4 text-center text-text-muted">
              Keine Assistenten verfügbar
            </div>
          ) : (
            <div className="py-2">
              {assistants.map((assistant) => (
                <button
                  key={assistant.id}
                  onClick={() => handleSelect(assistant)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-bg-elevated transition-colors text-left"
                >
                  <Bot className="w-5 h-5 text-accent-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">{assistant.name}</p>
                    <p className="text-xs text-text-muted">{assistant.description}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    assistant.status === 'active' ? 'bg-accent-success' : 'bg-accent-warning'
                  }`} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
