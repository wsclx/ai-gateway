'use client';

import { useState, useEffect } from 'react';
import { 
  Ticket, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  MessageSquare,
  Clock,
  AlertTriangle,
  CheckCircle,
  X,
  User,
  Calendar,
  Tag,
  Loader2
} from 'lucide-react';
import { ticketsApi, Ticket as TicketType, TicketCreate } from '@/lib/api-client';

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium' as const
  });

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await ticketsApi.getTickets();
      setTickets(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load tickets:', err);
      setError('Fehler beim Laden der Tickets');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-accent-warning';
      case 'in_progress': return 'text-accent-primary';
      case 'resolved': return 'text-accent-success';
      case 'closed': return 'text-text-muted';
      default: return 'text-text-muted';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'open': return 'bg-accent-warning/10';
      case 'in_progress': return 'bg-accent-primary/10';
      case 'resolved': return 'bg-accent-success/10';
      case 'closed': return 'bg-text-muted/10';
      default: return 'bg-text-muted/10';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-accent-error';
      case 'high': return 'text-accent-warning';
      case 'medium': return 'text-accent-primary';
      case 'low': return 'text-accent-success';
      default: return 'text-text-muted';
    }
  };

  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-accent-error/10';
      case 'high': return 'bg-accent-warning/10';
      case 'medium': return 'bg-accent-primary/10';
      case 'low': return 'bg-accent-success/10';
      default: return 'bg-text-muted/10';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesFilter = filter === 'all' || ticket.status === filter;
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCreateTicket = async () => {
    if (newTicket.title && newTicket.description) {
      try {
        const ticketData: TicketCreate = {
          title: newTicket.title,
          description: newTicket.description,
          category: newTicket.category,
          priority: newTicket.priority
        };
        
        const createdTicket = await ticketsApi.createTicket(ticketData);
        setTickets(prev => [createdTicket, ...prev]);
        setNewTicket({ title: '', description: '', category: '', priority: 'medium' });
        setShowNewTicket(false);
      } catch (err) {
        console.error('Failed to create ticket:', err);
        setError('Fehler beim Erstellen des Tickets');
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">Support & Tickets</h1>
            <p className="text-text-muted">Verwalten Sie Support-Anfragen und Tickets</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-accent-primary animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Support & Tickets</h1>
          <p className="text-text-muted">Verwalten Sie Support-Anfragen und Tickets</p>
        </div>
        <button
          onClick={() => setShowNewTicket(true)}
          className="px-4 py-2 bg-gradient-to-r from-accent-primary to-accent-purple 
                     text-white font-medium rounded-lg
                     hover:shadow-lg hover:shadow-accent-primary/25
                     transition-all duration-slow hover:-translate-y-0.5
                     flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Neues Ticket
        </button>
      </div>

      {error && (
        <div className="bg-accent-error/10 border border-accent-error/20 rounded-xl p-4">
          <p className="text-accent-error text-sm">{error}</p>
          <button 
            onClick={loadTickets}
            className="mt-2 text-accent-error hover:text-accent-error/80 text-sm underline"
          >
            Erneut versuchen
          </button>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-bg-tertiary rounded-xl border border-border-default p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Tickets durchsuchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-bg-elevated border border-border-default rounded-lg text-text-primary placeholder:text-text-muted"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'Alle' },
              { value: 'open', label: 'Offen' },
              { value: 'in_progress', label: 'In Bearbeitung' },
              { value: 'resolved', label: 'Gelöst' },
              { value: 'closed', label: 'Geschlossen' }
            ].map(status => (
              <button
                key={status.value}
                onClick={() => setFilter(status.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === status.value
                    ? 'bg-accent-primary text-white'
                    : 'bg-bg-elevated text-text-secondary hover:text-text-primary'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.map(ticket => (
          <div key={ticket.id} className="bg-bg-tertiary rounded-xl border border-border-default p-6 hover:bg-bg-elevated transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-text-primary">{ticket.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBg(ticket.status)} ${getStatusColor(ticket.status)}`}>
                    {ticket.status === 'open' && 'Offen'}
                    {ticket.status === 'in_progress' && 'In Bearbeitung'}
                    {ticket.status === 'resolved' && 'Gelöst'}
                    {ticket.status === 'closed' && 'Geschlossen'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBg(ticket.priority)} ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority === 'urgent' && 'Dringend'}
                    {ticket.priority === 'high' && 'Hoch'}
                    {ticket.priority === 'medium' && 'Mittel'}
                    {ticket.priority === 'low' && 'Niedrig'}
                  </span>
                </div>
                <p className="text-text-secondary mb-3">{ticket.description}</p>
                <div className="flex items-center gap-4 text-sm text-text-muted">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {ticket.created_by}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(ticket.created_at).toLocaleDateString('de-DE')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    {ticket.category}
                  </div>
                  {ticket.assigned_to && (
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      Zugewiesen: {ticket.assigned_to}
                    </div>
                  )}
                </div>
              </div>
              <button className="p-2 hover:bg-white/[0.03] rounded-lg transition-colors">
                <MoreHorizontal className="w-4 h-4 text-text-muted" />
              </button>
            </div>
          </div>
        ))}
        
        {filteredTickets.length === 0 && !loading && (
          <div className="bg-bg-tertiary rounded-xl border border-border-default p-12 text-center">
            <Ticket className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">Keine Tickets gefunden</h3>
            <p className="text-text-muted">Erstellen Sie ein neues Ticket oder passen Sie Ihre Filter an.</p>
          </div>
        )}
      </div>

      {/* New Ticket Modal */}
      {showNewTicket && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-bg-tertiary rounded-xl border border-border-default p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">Neues Ticket erstellen</h3>
              <button
                onClick={() => setShowNewTicket(false)}
                className="p-2 hover:bg-white/[0.03] rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-text-muted" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Titel</label>
                <input
                  type="text"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-bg-elevated border border-border-default rounded-lg px-3 py-2 text-text-primary"
                  placeholder="Ticket-Titel"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Beschreibung</label>
                <textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-bg-elevated border border-border-default rounded-lg px-3 py-2 text-text-primary h-24 resize-none"
                  placeholder="Detaillierte Beschreibung des Problems..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Kategorie</label>
                  <select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-bg-elevated border border-border-default rounded-lg px-3 py-2 text-text-primary"
                  >
                    <option value="">Kategorie wählen</option>
                    <option value="Technisch">Technisch</option>
                    <option value="Funktionalität">Funktionalität</option>
                    <option value="Design">Design</option>
                    <option value="Support">Support</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Priorität</label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full bg-bg-elevated border border-border-default rounded-lg px-3 py-2 text-text-primary"
                  >
                    <option value="low">Niedrig</option>
                    <option value="medium">Mittel</option>
                    <option value="high">Hoch</option>
                    <option value="urgent">Dringend</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCreateTicket}
                  className="flex-1 px-4 py-2 bg-accent-primary text-white font-medium rounded-lg hover:bg-accent-primary/90 transition-colors"
                >
                  Ticket erstellen
                </button>
                <button
                  onClick={() => setShowNewTicket(false)}
                  className="flex-1 px-4 py-2 bg-bg-elevated text-text-primary font-medium rounded-lg border border-border-default hover:bg-bg-hover transition-colors"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
