# Quote and Booking System Setup

## 1. Database Setup

Run the SQL schema in your Supabase SQL editor:

```sql
-- Copy and paste the contents of quote-booking-schema.sql
```

## 2. Environment Variables

Add these to your `.env` file:

```env
# OpenAI API Key for AI analysis
OPENAI_API_KEY=your_openai_api_key_here

# Existing variables (keep these)
SUPABASE_URL=https://phjawqphehkzfaezhzzf.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
WPP_URL=http://localhost:8080
WPP_API_KEY=wefixico_secret_2024
PORT=3000
WEBHOOK_SECRET=wefixico_webhook_secret_2024
BRAND_SESSION=wefixico
BRAND_NAME=Wefixico
```

## 3. Install Dependencies

```bash
npm install
```

## 4. Build and Start

```bash
npm run build
npm start
```

## 5. Test the System

1. **Start WPPConnect**: Make sure your WPPConnect server is running on port 8080
2. **Send a message** to your WhatsApp Business number with something like:
   - "I need to get rid of an old sofa and some bags of household waste"
   - Or send a photo of waste items

## Features

### AI-Powered Quote Generation
- **Text Analysis**: Uses GPT-4 to understand waste descriptions
- **Image Analysis**: Uses GPT-4 Vision to identify items in photos
- **Smart Pricing**: Calculates quotes based on volume and item types
- **Clarification Questions**: Asks for specific details when needed

### Booking System
- **Step-by-step collection**: Name, address, postcode, preferred date
- **Automatic booking creation**: Generates booking and job references
- **Partner notification**: Posts jobs to partner tender board
- **Confirmation messages**: Sends booking confirmation with reference

### Pricing Structure
- **Volume-based pricing**: £83.33 - £280.00 based on cubic yards
- **Extra charges**: Special handling for mattresses, fridges, TVs, etc.
- **Two-tier fees**: 12.5% customer fee + 6.5% partner platform fee
- **Transparent breakdown**: Shows all costs to customer

## Conversation Flow

1. **Welcome**: Customer describes waste or sends photos
2. **AI Analysis**: System analyzes and identifies items
3. **Quote Generation**: Calculates price based on volume and extras
4. **Booking Flow**: Collects customer details if they want to book
5. **Confirmation**: Sends booking reference and confirmation

## Database Tables

- `conversations`: Stores customer conversation state
- `quotes`: Stores generated quotes
- `jobs`: Stores booked jobs for partners
- `partners`: Partner information
- `job_assignments`: Partner job assignments

## API Endpoints

- `POST /whatsapp/webhook`: Enhanced webhook with AI analysis
- `GET /health`: Health check endpoint

## Next Steps

1. **Set up OpenAI API key** in your environment
2. **Run the database schema** in Supabase
3. **Test with real messages** to your WhatsApp Business number
4. **Monitor the logs** to see AI analysis in action
5. **Customize pricing** in `quoteService.ts` if needed
