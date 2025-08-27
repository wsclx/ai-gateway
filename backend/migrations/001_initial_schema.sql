-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector";
CREATE EXTENSION IF NOT EXISTS "timescaledb";

-- Create departments table
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create users table
CREATE TABLE app_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ext_subject TEXT NOT NULL UNIQUE,
    ext_subject_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    dept_id UUID REFERENCES departments(id),
    role TEXT NOT NULL CHECK (role IN ('user', 'lead', 'admin', 'dpo', 'steward')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create assistants table
CREATE TABLE assistants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic')),
    provider_assistant_id TEXT,
    model TEXT NOT NULL,
    system_prompt TEXT NOT NULL,
    dept_scope TEXT[] NOT NULL,
    tools JSONB NOT NULL DEFAULT '[]',
    visibility TEXT NOT NULL DEFAULT 'internal' CHECK (visibility IN ('internal', 'public', 'private')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create threads table
CREATE TABLE threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assistant_id UUID REFERENCES assistants(id),
    user_id UUID REFERENCES app_users(id),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID REFERENCES threads(id),
    role TEXT CHECK (role IN ('user', 'assistant', 'system')),
    content_ciphertext BYTEA NOT NULL,
    content_sha256 TEXT NOT NULL,
    tokens_in INTEGER DEFAULT 0,
    tokens_out INTEGER DEFAULT 0,
    cost_in_cents INTEGER DEFAULT 0,
    cost_out_cents INTEGER DEFAULT 0,
    latency_ms INTEGER,
    redaction_map JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create feedback table
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES messages(id),
    user_id UUID REFERENCES app_users(id),
    rating INTEGER NOT NULL CHECK (rating IN (1, 2, 3, 4, 5)),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tickets table
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID REFERENCES threads(id),
    user_id UUID REFERENCES app_users(id),
    external_id TEXT,
    external_system TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_ext_subject ON app_users(ext_subject);
CREATE INDEX idx_users_dept_id ON app_users(dept_id);
CREATE INDEX idx_assistants_dept_scope ON assistants USING GIN(dept_scope);
CREATE INDEX idx_threads_assistant_id ON threads(assistant_id);
CREATE INDEX idx_threads_user_id ON threads(user_id);
CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_feedback_message_id ON feedback(message_id);
CREATE INDEX idx_tickets_thread_id ON tickets(thread_id);

-- Insert sample departments
INSERT INTO departments (key, name) VALUES
    ('hr', 'Human Resources'),
    ('it', 'Information Technology'),
    ('sales', 'Sales & Marketing'),
    ('finance', 'Finance & Accounting'),
    ('operations', 'Operations');

-- Insert sample users (for development)
INSERT INTO app_users (ext_subject, ext_subject_hash, display_name, dept_id, role) VALUES
    ('user1@example.com', 'hash1', 'Max Mustermann', (SELECT id FROM departments WHERE key = 'hr'), 'user'),
    ('user2@example.com', 'hash2', 'Anna Schmidt', (SELECT id FROM departments WHERE key = 'it'), 'user'),
    ('admin@example.com', 'hash3', 'Admin User', (SELECT id FROM departments WHERE key = 'it'), 'admin');

-- Insert sample assistants
INSERT INTO assistants (name, provider, model, system_prompt, dept_scope, tools) VALUES
    ('HR Assistant', 'openai', 'gpt-4', 'Du bist ein hilfreicher HR-Assistent. Antworte auf Deutsch und sei professionell.', ARRAY['hr', 'management'], '[]'),
    ('IT Support', 'openai', 'gpt-4', 'Du bist ein IT-Support Assistent. Antworte auf Deutsch und sei technisch präzise.', ARRAY['it', 'support'], '[]'),
    ('Sales Helper', 'openai', 'gpt-4', 'Du bist ein Verkaufsassistent. Antworte auf Deutsch und sei überzeugend.', ARRAY['sales', 'marketing'], '[]');
