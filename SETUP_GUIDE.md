# 🚀 WhatsApp Automation Setup Guide

## Current Status: ✅ Project Built, ⏳ Need Configuration

Your WhatsApp automation microservice is ready! Here's what you need to do to complete the setup:

## 1. 📊 Set up Supabase Database

**Go to your Supabase dashboard and run these SQL scripts:**

### First, run the main schema:
```sql
-- Copy and paste this entire script into your Supabase SQL editor
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
```

### Then, create the Wefixico brand:
```sql
-- Add Wefixico brand to your Supabase brands table
INSERT INTO public.brands (
  brand_id,
  brand_name,
  brand_slug,
  description,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Wefixico',
  'wefixico',
  'Waste removal and disposal services',
  true,
  now(),
  now()
) RETURNING brand_id, brand_name, brand_slug;
```

## 2. 🔧 Configure Environment Variables

**Edit your `.env` file with these values:**

```env
# Get these from your Supabase dashboard > Settings > API
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# WPPConnect Configuration
WPP_URL=http://localhost:8080
WPP_API_KEY=wefixico_secret_2024

# Webhook Security
WEBHOOK_SECRET=wefixico_webhook_secret_2024

# Brand Configuration
BRAND_SESSION=wefixico
BRAND_NAME=Wefixico

# Server Configuration
PORT=8080
```

## 3. 📱 Set up WPPConnect

**Option A: Simple NPM Method (Recommended)**
```bash
# Install WPPConnect globally
npm install -g @wppconnect-team/wppconnect

# Start WPPConnect server
npx @wppconnect-team/wppconnect start --port 8080 --secret wefixico_secret_2024
```

**Option B: Docker Method (if you have Docker)**
```bash
# Run WPPConnect with Docker
docker run -d \
  --name wppconnect \
  -p 8080:8080 \
  -e SECRET=wefixico_secret_2024 \
  -e DEBUG=wppconnect:* \
  --restart unless-stopped \
  wppconnectteam/wppconnect:latest
```

## 4. 🔗 Connect WhatsApp

1. **Open WPPConnect interface:** Go to `http://localhost:8080`
2. **Create session:** Click "Create Session" → Name: `wefixico`
3. **Set webhook:** 
   - Webhook URL: `http://localhost:8080/whatsapp/webhook` (for local testing)
   - Webhook Header: `x-webhook-secret: wefixico_webhook_secret_2024`
4. **Scan QR code:** Use WhatsApp on your phone to scan the QR code
5. **Test connection:** Send a test message to your WhatsApp number

## 5. 🚀 Start Your Automation

```bash
# Start the WhatsApp automation server
npm run dev
```

## 6. 🧪 Test the Complete Flow

1. **Send a WhatsApp message** to your connected number
2. **Watch the logs** - you should see incoming messages
3. **Check Supabase** - new rows should appear in `whatsapp_staging`
4. **Follow the flow** - the bot will guide you through the waste removal process

## 🔍 Troubleshooting

**WPPConnect not starting?**
- Try: `npx @wppconnect-team/wppconnect start --port 8080`
- Check if port 8080 is already in use: `lsof -i :8080`

**Webhook not receiving messages?**
- Make sure your webhook URL is accessible
- For local testing, use ngrok: `ngrok http 8080`
- Check that the webhook secret matches in both places

**Database errors?**
- Verify your Supabase URL and service role key
- Make sure you ran both SQL scripts
- Check that the Wefixico brand was created

## 📞 Support

If you run into issues:
1. Check the logs in your terminal
2. Verify all environment variables are set
3. Make sure WPPConnect is running on port 8080
4. Test the webhook endpoint manually

Your WhatsApp automation is ready to handle waste removal inquiries! 🎉
