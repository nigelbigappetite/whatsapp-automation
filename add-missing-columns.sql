-- Add missing columns to existing whatsapp_messages table
-- Run this in your Supabase SQL Editor

-- Add the missing actor_phone column
ALTER TABLE public.whatsapp_messages 
ADD COLUMN IF NOT EXISTS actor_phone TEXT;

-- Add other missing columns if they don't exist
ALTER TABLE public.whatsapp_messages 
ADD COLUMN IF NOT EXISTS session_name TEXT;

ALTER TABLE public.whatsapp_messages 
ADD COLUMN IF NOT EXISTS direction TEXT;

ALTER TABLE public.whatsapp_messages 
ADD COLUMN IF NOT EXISTS message TEXT;

ALTER TABLE public.whatsapp_messages 
ADD COLUMN IF NOT EXISTS message_type TEXT;

ALTER TABLE public.whatsapp_messages 
ADD COLUMN IF NOT EXISTS media_urls JSONB DEFAULT '[]';

-- Add constraints (drop first if exists, then add)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'check_direction' 
               AND table_name = 'whatsapp_messages') THEN
        ALTER TABLE public.whatsapp_messages DROP CONSTRAINT check_direction;
    END IF;
END $$;

ALTER TABLE public.whatsapp_messages 
ADD CONSTRAINT check_direction 
CHECK (direction IN ('inbound','outbound'));

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_phone ON public.whatsapp_messages(actor_phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_session ON public.whatsapp_messages(session_name);
