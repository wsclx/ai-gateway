-- Migration: Add missing fields to tickets table
-- Date: 2025-09-03

-- Add missing columns to tickets table
ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'IT',
ADD COLUMN IF NOT EXISTS title VARCHAR(255),
ADD COLUMN IF NOT EXISTS description TEXT;

-- Update existing tickets with default values
UPDATE tickets 
SET title = 'Ticket ' || id::text,
    description = 'Automatisch generierte Beschreibung'
WHERE title IS NULL;

-- Make title and description NOT NULL after setting defaults
ALTER TABLE tickets 
ALTER COLUMN title SET NOT NULL,
ALTER COLUMN description SET NOT NULL;

-- Update status values to match frontend expectations
UPDATE tickets 
SET status = CASE 
    WHEN status = 'Offen' THEN 'open'
    WHEN status = 'In Bearbeitung' THEN 'in_progress'
    WHEN status = 'Gelöst' THEN 'resolved'
    WHEN status = 'Geschlossen' THEN 'closed'
    ELSE status
END;

-- Update priority values to match frontend expectations
UPDATE tickets 
SET priority = CASE 
    WHEN priority = 'Niedrig' THEN 'low'
    WHEN priority = 'Mittel' THEN 'medium'
    WHEN priority = 'Hoch' THEN 'high'
    WHEN priority = 'Dringend' THEN 'urgent'
    ELSE priority
END;
