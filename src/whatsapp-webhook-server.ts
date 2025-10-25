import express from 'express';
import { log, logErr } from './utils/logger.js';

const app = express();
app.use(express.json());

// Add CORS headers
app.use((req: any, res: any, next: any) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check endpoint
app.get('/health', (req: any, res: any) => {
  res.json({ 
    status: 'healthy', 
    service: 'WhatsApp Webhook Server',
    timestamp: new Date().toISOString()
  });
});

// Webhook endpoint for receiving WhatsApp messages
app.post('/webhook/whatsapp', async (req: any, res: any) => {
  try {
    const { from, message, type = 'text' } = req.body;
    
    log(`📨 Received WhatsApp message from ${from}: ${message}`);
    
    // Forward to CRM server
    try {
      const response = await fetch('http://localhost:3000/whatsapp/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-secret': process.env.WEBHOOK_SECRET || 'wefixico_webhook_secret_2024'
        },
        body: JSON.stringify({
          session: 'wefixico',
          from: from,
          body: message,
          type: type
        })
      });

      if (response.ok) {
        log('✅ Message forwarded to CRM server');
      } else {
        logErr('❌ Failed to forward message to CRM server');
      }
    } catch (error) {
      logErr('❌ Error forwarding message to CRM server:', error);
    }
    
    res.json({ status: 'success', message: 'Message received' });
  } catch (error) {
    logErr('❌ Error processing WhatsApp webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoint for sending messages (simulation)
app.post('/api/send-message', async (req: any, res: any) => {
  try {
    const { phone, message } = req.body;
    
    log(`📤 [SIMULATION] Sending message to ${phone}: ${message}`);
    
    // In a real implementation, you would integrate with:
    // - WhatsApp Business API
    // - Twilio WhatsApp API
    // - Meta Graph API
    // - Or another WhatsApp service provider
    
    res.json({ 
      status: 'success', 
      message: 'Message sent (simulated)',
      to: phone,
      content: message
    });
  } catch (error) {
    logErr('❌ Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get connection status
app.get('/api/status', (req: any, res: any) => {
  res.json({
    status: 'connected',
    service: 'WhatsApp Webhook Server',
    mode: 'simulation',
    note: 'This is a webhook-based service for Railway deployment'
  });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  log(`🚀 WhatsApp Webhook Server running on port ${PORT}`);
  log(`📡 Webhook endpoint: http://localhost:${PORT}/webhook/whatsapp`);
  log(`📤 Send message API: http://localhost:${PORT}/api/send-message`);
  log(`🔍 Health check: http://localhost:${PORT}/health`);
  log(`📊 Status: http://localhost:${PORT}/api/status`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  log('🛑 Shutting down WhatsApp Webhook Server...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  log('🛑 Shutting down WhatsApp Webhook Server...');
  process.exit(0);
});
