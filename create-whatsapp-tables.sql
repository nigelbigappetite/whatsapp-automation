-- Create missing WhatsApp tables for the booking CRM
-- Run this in your Supabase SQL Editor

-- WhatsApp messages table (what the booking CRM expects)
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID,
  session_name TEXT,
  actor_phone TEXT,
  direction TEXT CHECK (direction IN ('inbound','outbound')),
  message TEXT,
  message_type TEXT,
  media_urls JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- WhatsApp quotes table
CREATE TABLE IF NOT EXISTS public.whatsapp_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID,
  session_name TEXT,
  actor_phone TEXT,
  quote_details JSONB,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_phone ON public.whatsapp_messages(actor_phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_session ON public.whatsapp_messages(session_name);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created ON public.whatsapp_messages(created_at);

CREATE INDEX IF NOT EXISTS idx_whatsapp_quotes_phone ON public.whatsapp_quotes(actor_phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_quotes_session ON public.whatsapp_quotes(session_name);
CREATE INDEX IF NOT EXISTS idx_whatsapp_quotes_status ON public.whatsapp_quotes(status);

-- Enable RLS
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_quotes ENABLE ROW LEVEL SECURITY;

-- Create policies for service role access
CREATE POLICY "Service role has full access to whatsapp_messages"
  ON public.whatsapp_messages FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role has full access to whatsapp_quotes"
  ON public.whatsapp_quotes FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');
