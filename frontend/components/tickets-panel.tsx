"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Filter, 
  MessageSquare, 
  Clock, 
  User, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Calendar
} from "lucide-react";
import { ticketsApi } from "@/lib/api-client";

// Types for tickets
interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_by: string;
  created_at: string;
  updated_at: string;
  department: string;
  assigned_to?: string;
}

interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

export function TicketsPanel() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats>({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    department: 'IT'
  });

  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ticketsApi.getTickets();
      // Map the data to match local Ticket interface
      const mappedTickets: Ticket[] = data.map(ticket => ({
        id: ticket.id,
        title: ticket.title,
        description: ticket.description || '',
        status: ticket.status,
        priority: ticket.priority,
        created_by: ticket.created_by,
        created_at: ticket.created_at,
        updated_at: ticket.updated_at || ticket.created_at,
        department: 'IT', // Default department since it's not in API
        assigned_to: ticket.assigned_to
      }));
      setTickets(mappedTickets);
      setError(null);
    } catch (err) {
      console.error('Failed to load tickets:', err);
      setError('Fehler beim Laden der Tickets');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const data = await ticketsApi.getTickets();
      const stats: TicketStats = {
        total: data.length,
        open: data.filter(t => t.status === 'open').length,
        inProgress: data.filter(t => t.status === 'in_progress').length,
        resolved: data.filter(t => t.status === 'resolved').length,
        closed: data.filter(t => t.status === 'closed').length
      };
      setStats(stats);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  useEffect(() => {
    loadTickets();
    loadStats();
  }, [loadTickets, loadStats]);

  const applyFilters = useCallback(() => {
    // Filter logic would be implemented here
    console.log('Applying filters:', { searchTerm, statusFilter, priorityFilter });
  }, [searchTerm, statusFilter, priorityFilter]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleCreateTicket = async () => {
    try {
      await ticketsApi.createTicket({
        title: newTicket.title,
        description: newTicket.description,
        priority: newTicket.priority,
        category: newTicket.department // Use department as category
      });
      
      setNewTicket({
        title: '',
        description: '',
        priority: 'medium',
        department: 'IT'
      });
      setShowCreateForm(false);
      loadTickets();
      loadStats();
    } catch (err) {
      console.error('Failed to create ticket:', err);
      setError('Fehler beim Erstellen des Tickets');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-accent-warning text-white';
      case 'in_progress': return 'bg-accent-primary text-white';
      case 'resolved': return 'bg-accent-success text-white';
      case 'closed': return 'bg-text-muted text-white';
      default: return 'bg-text-muted text-white';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-accent-error text-white';
      case 'high': return 'bg-accent-warning text-white';
      case 'medium': return 'bg-accent-primary text-white';
      case 'low': return 'bg-accent-success text-white';
      default: return 'bg-text-muted text-white';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-primary"></div>
          <span>Lade Tickets...</span>
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
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Neues Ticket
        </Button>
      </div>

      {error && (
        <div className="bg-accent-error/10 border border-accent-error/20 rounded-xl p-4">
          <p className="text-accent-error text-sm">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Gesamt</p>
                <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-accent-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Offen</p>
                <p className="text-2xl font-bold text-accent-warning">{stats.open}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-accent-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">In Bearbeitung</p>
                <p className="text-2xl font-bold text-accent-primary">{stats.inProgress}</p>
              </div>
              <Clock className="w-8 h-8 text-accent-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Gelöst</p>
                <p className="text-2xl font-bold text-accent-success">{stats.resolved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-accent-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Geschlossen</p>
                <p className="text-2xl font-bold text-text-muted">{stats.closed}</p>
              </div>
              <XCircle className="w-8 h-8 text-text-muted" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Suche</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
                <Input
                  id="search"
                  placeholder="Tickets durchsuchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border border-border-default rounded-lg bg-bg-elevated text-text-primary"
              >
                <option value="all">Alle Status</option>
                <option value="open">Offen</option>
                <option value="in_progress">In Bearbeitung</option>
                <option value="resolved">Gelöst</option>
                <option value="closed">Geschlossen</option>
              </select>
            </div>
            <div>
              <Label htmlFor="priority">Priorität</Label>
              <select
                id="priority"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full p-2 border border-border-default rounded-lg bg-bg-elevated text-text-primary"
              >
                <option value="all">Alle Prioritäten</option>
                <option value="urgent">Dringend</option>
                <option value="high">Hoch</option>
                <option value="medium">Mittel</option>
                <option value="low">Niedrig</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle>Tickets</CardTitle>
          <CardDescription>Übersicht aller Support-Tickets</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTickets.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <p className="text-text-muted">Keine Tickets gefunden</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTickets.map((ticket) => (
                <div key={ticket.id} className="border border-border-default rounded-lg p-4 hover:bg-bg-elevated transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-text-primary">{ticket.title}</h3>
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status === 'in_progress' ? 'In Bearbeitung' : 
                           ticket.status === 'open' ? 'Offen' :
                           ticket.status === 'resolved' ? 'Gelöst' : 'Geschlossen'}
                        </Badge>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority === 'urgent' ? 'Dringend' :
                           ticket.priority === 'high' ? 'Hoch' :
                           ticket.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                        </Badge>
                      </div>
                      <p className="text-text-muted mb-3 line-clamp-2">{ticket.description}</p>
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
                          <MessageSquare className="w-4 h-4" />
                          {ticket.department}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Ticket Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-bg-tertiary rounded-xl p-6 w-full max-w-2xl mx-4">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Neues Ticket erstellen</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="ticketTitle">Titel</Label>
                <Input
                  id="ticketTitle"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Kurze Beschreibung des Problems"
                />
              </div>
              <div>
                <Label htmlFor="ticketDescription">Beschreibung</Label>
                <Textarea
                  id="ticketDescription"
                  value={newTicket.description}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detaillierte Beschreibung des Problems..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ticketPriority">Priorität</Label>
                  <select
                    id="ticketPriority"
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full p-2 border border-border-default rounded-lg bg-bg-elevated text-text-primary"
                  >
                    <option value="low">Niedrig</option>
                    <option value="medium">Mittel</option>
                    <option value="high">Hoch</option>
                    <option value="urgent">Dringend</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="ticketDepartment">Abteilung</Label>
                  <select
                    id="ticketDepartment"
                    value={newTicket.department}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full p-2 border border-border-default rounded-lg bg-bg-elevated text-text-primary"
                  >
                    <option value="IT">IT</option>
                    <option value="HR">HR</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleCreateTicket} disabled={!newTicket.title || !newTicket.description}>
                Ticket erstellen
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
