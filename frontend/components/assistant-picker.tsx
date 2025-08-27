'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { ChevronDown, Bot } from 'lucide-react'
import { apiClient } from '@/lib/api-client'

interface AssistantItem {
  id: string
  name: string
  model: string
}

interface AssistantPickerProps {
  selectedAssistant: string | null
  onSelectAssistant: (assistantId: string) => void
}

export function AssistantPicker({ selectedAssistant, onSelectAssistant }: AssistantPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [assistants, setAssistants] = useState<AssistantItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      const res = await apiClient.getAssistants()
      if (res.success && res.data) {
        const mapped = res.data.map((a: any) => ({
          id: a.id,
          name: a.name,
          model: a.model || 'gpt-4o-mini',
        }))
        setAssistants(mapped)
      } else {
        setError(res.error || 'Fehler beim Laden der Assistenten')
      }
      setLoading(false)
    }
    load()
  }, [])

  const current = assistants.find(a => a.id === selectedAssistant) || null

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(prev => !prev)
  }, [])

  const handleSelect = useCallback((e: React.MouseEvent, assistantId: string) => {
    e.preventDefault()
    e.stopPropagation()
    onSelectAssistant(assistantId)
    setIsOpen(false)
  }, [onSelectAssistant])

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setIsOpen(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, handleClickOutside])

  return (
    <div className="bg-card border rounded-lg p-4" ref={dropdownRef}>
      <h2 className="text-lg font-semibold mb-4">Assistenten</h2>

      <div className="relative">
        <button
          onClick={handleToggle}
          className="w-full flex items-center justify-between p-3 border rounded-md bg-background hover:bg-accent cursor-pointer transition-colors"
          type="button"
        >
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            <span className="text-sm">
              {current ? current.name : loading ? 'Lade...' : error ? 'Fehler beim Laden' : 'Assistent wählen'}
            </span>
          </div>
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border rounded-md shadow-lg z-10">
            {loading && (
              <div className="p-3 text-sm text-muted-foreground">Lade...</div>
            )}
            {error && (
              <div className="p-3 text-sm text-destructive">{error}</div>
            )}
            {!loading && !error && assistants.map((assistant) => (
              <button
                key={assistant.id}
                onClick={(e) => handleSelect(e, assistant.id)}
                className="w-full p-3 text-left hover:bg-accent border-b last:border-b-0 cursor-pointer transition-colors"
                type="button"
              >
                <div className="font-medium">{assistant.name}</div>
                <div className="text-xs text-muted-foreground">{assistant.model}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {current && (
        <div className="mt-4 p-3 bg-accent rounded-md">
          <div className="text-sm font-medium">Aktueller Assistent</div>
          <div className="text-sm text-muted-foreground">{current.name}</div>
          <div className="text-xs text-muted-foreground mt-1">{current.model}</div>
        </div>
      )}
    </div>
  )
}
