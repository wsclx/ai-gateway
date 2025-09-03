-- Migration: Add tickets system
-- Date: 2025-01-27

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'Offen' CHECK (status IN ('Offen', 'In Bearbeitung', 'Geschlossen', 'Gelöst')),
    priority VARCHAR(20) DEFAULT 'Mittel' CHECK (priority IN ('Niedrig', 'Mittel', 'Hoch', 'Kritisch')),
    category VARCHAR(100) DEFAULT 'Allgemein',
    user_id INTEGER NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    assigned_to INTEGER REFERENCES app_users(id) ON DELETE SET NULL,
    conversation_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    tags TEXT[] DEFAULT '{}',
    internal_notes TEXT,
    response_time_hours INTEGER,
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5)
);

-- Create ticket_comments table for communication
CREATE TABLE IF NOT EXISTS ticket_comments (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ticket_attachments table
CREATE TABLE IF NOT EXISTS ticket_attachments (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_by INTEGER NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ticket_audit_log table
CREATE TABLE IF NOT EXISTS ticket_audit_log (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_attachments_ticket_id ON ticket_attachments(ticket_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ticket_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for tickets table
CREATE TRIGGER trigger_update_ticket_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_ticket_updated_at();

-- Create trigger for ticket_comments table
CREATE TRIGGER trigger_update_ticket_comment_updated_at
    BEFORE UPDATE ON ticket_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_ticket_updated_at();

-- Insert default categories
INSERT INTO tickets (title, description, status, priority, category, user_id) VALUES
('System Setup', 'Initial system configuration and setup', 'Geschlossen', 'Hoch', 'System', 1),
('User Training', 'Training materials and documentation', 'Offen', 'Mittel', 'Training', 1),
('API Integration', 'External API integration support', 'In Bearbeitung', 'Hoch', 'Technical', 1)
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT ALL PRIVILEGES ON TABLE tickets TO audiencly;
GRANT ALL PRIVILEGES ON TABLE ticket_comments TO audiencly;
GRANT ALL PRIVILEGES ON TABLE ticket_attachments TO audiencly;
GRANT ALL PRIVILEGES ON TABLE ticket_audit_log TO audiencly;
GRANT USAGE, SELECT ON SEQUENCE tickets_id_seq TO audiencly;
GRANT USAGE, SELECT ON SEQUENCE ticket_comments_id_seq TO audiencly;
GRANT USAGE, SELECT ON SEQUENCE ticket_attachments_id_seq TO audiencly;
GRANT USAGE, SELECT ON SEQUENCE ticket_audit_log_id_seq TO audiencly;
