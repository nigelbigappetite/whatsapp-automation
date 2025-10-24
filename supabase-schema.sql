-- WhatsApp Automation Database Schema
-- Run this in your Supabase dashboard (public schema)

-- Real-time staging table for all messages
create table if not exists public.whatsapp_staging (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid,
  session_name text,
  actor_phone text,
  direction text check (direction in ('inbound','outbound')),
  message text,
  media_url text,
  flow_state jsonb,
  created_at timestamptz default now()
);

-- Completed conversation summaries (Signal Intake)
create table if not exists public.whatsapp_conversations (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid,
  session_name text,
  actor_phone text,
  alternate_phone text,
  phone_confirmed boolean default false,
  customer_email text,
  service text,
  waste_type text,
  pickup_address text,
  urgency_level text,
  quote_min numeric,
  quote_max numeric,
  booking_slot text,
  photos jsonb,
  messages jsonb,     -- ordered array of {direction, text, ts}
  summary text,
  sentiment text,
  closed_at timestamptz default now()
);

-- Source registry for tracking different intake channels
create table if not exists public.signals_sources (
  name text primary key,
  channel text,
  brand_id uuid
);

-- Insert WhatsApp source
insert into public.signals_sources (name, channel, brand_id)
values ('whatsapp_wefixico', 'whatsapp', null)
on conflict (name) do nothing;

-- Create indexes for better performance
create index if not exists idx_whatsapp_staging_actor_phone on public.whatsapp_staging(actor_phone);
create index if not exists idx_whatsapp_staging_session on public.whatsapp_staging(session_name);
create index if not exists idx_whatsapp_staging_created_at on public.whatsapp_staging(created_at);

create index if not exists idx_whatsapp_conversations_actor_phone on public.whatsapp_conversations(actor_phone);
create index if not exists idx_whatsapp_conversations_session on public.whatsapp_conversations(session_name);
create index if not exists idx_whatsapp_conversations_closed_at on public.whatsapp_conversations(closed_at);
