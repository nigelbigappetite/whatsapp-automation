# WhatsApp Automation for Wefixico Waste Removal

A minimal, production-ready WhatsApp intake microservice that receives webhooks from WPPConnect and runs a JSON-defined flow for waste removal services.

## Features

- ✅ Receives WhatsApp webhooks from WPPConnect
- ✅ Runs a JSON-defined flow for Wefixico Waste Removal service
- ✅ Collects: waste type, photos, address, urgency, booking slot, phone confirmation, email
- ✅ Logs every message to `public.whatsapp_staging` (real-time)
- ✅ Aggregates completed conversations to `public.whatsapp_conversations`
- ✅ Sends replies via WPPConnect `/send-message`
- ✅ Brand-ready (session-based) and easily extendable
- ✅ Webhook security with shared secret

## Tech Stack

- Node.js + TypeScript + Express
- Supabase JS client
- Axios for WPPConnect calls
- Dotenv for configuration

## Quick Setup

Run the automated setup script:
```bash
./setup.sh
```

## Manual Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

3. **Set up Supabase:**
   - Run `supabase-schema.sql` in your Supabase dashboard
   - Run `setup-wefixico-brand.sql` to create the Wefixico brand
   - Get your Supabase URL and service role key

4. **Set up WPPConnect:**
   - Follow the detailed guide in `WPPCONNECT_SETUP.md`
   - Start a session named `wefixico`
   - Set webhook URL to `https://your-host/whatsapp/webhook`

5. **Start development server:**
   ```bash
   npm run dev
   ```

## Environment Variables

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
WPP_URL=https://your-wpp-server:8080
WPP_API_KEY=your_wpp_api_key
PORT=8080
WEBHOOK_SECRET=your_webhook_secret
BRAND_SESSION=wefixico
BRAND_NAME=Wefixico
```

## API Endpoints

- `GET /` - Health check
- `POST /whatsapp/webhook` - WPPConnect webhook endpoint

## Flow Configuration

The conversation flow is defined in `src/flows/wefixico_waste_removal.json` and includes:

1. Waste type collection
2. Photo upload (placeholder)
3. Pickup address
4. Urgency level selection
5. Quote confirmation
6. Booking slot selection
7. Phone number confirmation
8. Email collection
9. Final confirmation

## Database Schema

### `whatsapp_staging`
Real-time staging table for all incoming/outgoing messages.

### `whatsapp_conversations`
Completed conversation summaries with all collected data.

### `signals_sources`
Source registry for tracking different intake channels.

## Development

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Testing

Send a test message to your WhatsApp number and watch:
- Rows populate in `whatsapp_staging`
- Bot replies are sent via WPPConnect
- Conversation flows through all steps
- Final summary appears in `whatsapp_conversations`

## Security

- Webhook endpoint validates `x-webhook-secret` header
- All environment variables are required
- Supabase uses service role key for database access
