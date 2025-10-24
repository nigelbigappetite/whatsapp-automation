const express = require('express');
const { create, createServer } = require('@wppconnect-team/wppconnect');

const app = express();
app.use(express.json());

// Store active sessions
const sessions = new Map();

// Create WPPConnect server
createServer({
  webhook: 'http://localhost:8080/whatsapp/webhook',
  webhookHeaders: {
    'x-webhook-secret': 'wefixico_webhook_secret_2024'
  }
}).then((server) => {
  console.log('🚀 WPPConnect server started!');
  console.log('🌐 Web interface: http://localhost:8080');
  console.log('📱 Ready to create WhatsApp sessions');
  
  // Start session endpoint
  app.post('/api/session/start', async (req, res) => {
    try {
      const { session, webhook, webhookHeaders } = req.body;
      
      if (sessions.has(session)) {
        return res.json({ success: true, message: 'Session already exists' });
      }
      
      // Create new session
      const client = await create({
        session: session,
        puppeteerOptions: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
          ]
        }
      });
      
      sessions.set(session, client);
      
      // Set up webhook
      if (webhook) {
        client.onMessage(async (message) => {
          try {
            const response = await fetch(webhook, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...webhookHeaders
              },
              body: JSON.stringify({
                session: session,
                from: message.from,
                body: message.body,
                type: message.type
              })
            });
          } catch (error) {
            console.error('Webhook error:', error);
          }
        });
      }
      
      res.json({ 
        success: true, 
        message: 'Session created successfully',
        qrCode: 'Check console for QR code'
      });
      
    } catch (error) {
      console.error('Session creation error:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Send message endpoint
  app.post('/api/:session/send-message', async (req, res) => {
    try {
      const { session } = req.params;
      const { phone, message } = req.body;
      
      const client = sessions.get(session);
      if (!client) {
        return res.status(404).json({ error: 'Session not found' });
      }
      
      await client.sendText(phone, message);
      res.json({ success: true });
      
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Health check
  app.get('/', (req, res) => {
    res.json({ 
      status: 'running',
      sessions: Array.from(sessions.keys()),
      message: 'WPPConnect server is running'
    });
  });
  
  const PORT = 8080;
  app.listen(PORT, () => {
    console.log(`🌐 Server running on http://localhost:${PORT}`);
  });
  
}).catch((error) => {
  console.error('❌ Error starting server:', error);
  process.exit(1);
});
