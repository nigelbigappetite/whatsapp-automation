-- Simple fix for WhatsApp tables
-- Run this in your Supabase SQL Editor

-- Add missing columns to existing whatsapp_messages table
ALTER TABLE public.whatsapp_messages 
ADD COLUMN IF NOT EXISTS actor_phone TEXT;

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

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_phone ON public.whatsapp_messages(actor_phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_session ON public.whatsapp_messages(session_name);
