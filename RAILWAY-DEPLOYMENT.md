# 🚂 Railway Deployment Guide

## Prerequisites
- GitHub account
- Railway account (free at railway.app)
- Your existing environment variables

## Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Connect your GitHub account

## Step 2: Deploy Your Project
1. Click "New Project" in Railway dashboard
2. Select "Deploy from GitHub repo"
3. Choose your `whatsapp-automation` repository
4. Railway will automatically detect it's a Node.js project

## Step 3: Add PostgreSQL Database
1. In your Railway project dashboard
2. Click "New" → "Database" → "PostgreSQL"
3. Railway will create a PostgreSQL database
4. Copy the `DATABASE_URL` from the database service

## Step 4: Configure Environment Variables
In your Railway project settings, add these environment variables:

### Required Variables:
```
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_key_here
SUPABASE_BRAND_ID=your_brand_id_here
OPENAI_API_KEY=your_openai_key_here
GHL_API_KEY=your_ghl_api_key_here
GHL_LOCATION_ID=your_ghl_location_id_here
```

### Railway Auto Variables:
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/railway
NODE_ENV=production
PORT=3000
```

### WhatsApp Variables:
```
WPP_API_KEY=wefixico_secret_2024
WEBHOOK_SECRET=wefixico_webhook_secret_2024
BRAND_SESSION=wefixico
BRAND_NAME=Wefixico
```

## Step 5: Deploy Both Services

### Service 1: CRM Server
- **Name**: `wefixico-crm`
- **Start Command**: `npm run start:production`
- **Port**: 3000

### Service 2: WPPConnect Server
- **Name**: `wefixico-wppconnect`
- **Start Command**: `npm run start:wppconnect`
- **Port**: 8080

## Step 6: Configure Custom Domain (Optional)
1. In Railway dashboard, go to your service
2. Click "Settings" → "Domains"
3. Add your custom domain (e.g., `wefixico-crm.railway.app`)

## Step 7: Set Up Database Tables
Run this SQL in your Railway PostgreSQL database:

```sql
-- Create WhatsApp messages table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_phone ON public.whatsapp_messages(actor_phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_session ON public.whatsapp_messages(session_name);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created ON public.whatsapp_messages(created_at);
```

## Step 8: Test Your Deployment
1. Visit your Railway domain
2. Check the health endpoints:
   - `https://your-domain.railway.app/health`
   - `https://your-domain.railway.app:8080/health`

## Step 9: WhatsApp Setup
1. Your WPPConnect server will start automatically
2. Check the Railway logs for QR code
3. Scan QR code with your WhatsApp
4. Your WhatsApp automation is now live 24/7!

## Monitoring
- **Logs**: View real-time logs in Railway dashboard
- **Metrics**: Monitor CPU, memory, and network usage
- **Alerts**: Set up alerts for downtime or errors

## Scaling
- **Auto-scaling**: Railway automatically scales based on traffic
- **Manual scaling**: Adjust resources in Railway dashboard
- **Database**: Railway PostgreSQL scales automatically

## Cost
- **Free tier**: $5/month credit (enough for development)
- **Pro plan**: $20/month for production use
- **Database**: Included in Railway plans

## Support
- Railway Discord: https://discord.gg/railway
- Documentation: https://docs.railway.app
- Status: https://status.railway.app
