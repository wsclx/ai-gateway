-- Migration: Add description, instructions, status, and updated_at fields to assistants table

ALTER TABLE assistants 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS instructions TEXT,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;

-- Add constraint for status field
ALTER TABLE assistants 
ADD CONSTRAINT assistants_status_check 
CHECK (status IN ('active', 'inactive', 'maintenance'));

-- New provider/visibility fields and constraints, and unique name
ALTER TABLE assistants 
ADD COLUMN IF NOT EXISTS provider VARCHAR(20) NOT NULL DEFAULT 'openai',
ADD COLUMN IF NOT EXISTS system_prompt TEXT NOT NULL DEFAULT 'Du bist ein hilfreicher KI-Assistent.',
ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) NOT NULL DEFAULT 'internal',
ADD COLUMN IF NOT EXISTS dept_scope JSONB NOT NULL DEFAULT '[]',
ADD COLUMN IF NOT EXISTS tools JSONB NOT NULL DEFAULT '[]';

ALTER TABLE assistants 
ADD CONSTRAINT ck_assistants_provider CHECK (provider IN ('openai','anthropic')),
ADD CONSTRAINT ck_assistants_visibility CHECK (visibility IN ('internal','public','private'));

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'uq_assistants_name'
  ) THEN
    ALTER TABLE assistants ADD CONSTRAINT uq_assistants_name UNIQUE (name);
  END IF;
END$$;

-- Update existing records to have updated_at = created_at
UPDATE assistants 
SET updated_at = created_at 
WHERE updated_at IS NULL;
