import express from 'express';
const app = express();

app.use(express.json());

// Mock webhook endpoint to test your automation service
app.post('/whatsapp/webhook', async (req, res) => {
  console.log('📨 Received webhook:', JSON.stringify(req.body, null, 2));
  
  // Forward to your automation service
  try {
    const response = await fetch('http://localhost:3000/whatsapp/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': 'wefixico_webhook_secret_2024'
      },
      body: JSON.stringify(req.body)
    });
    
    const result = await response.json();
    console.log('✅ Automation service response:', result);
    res.json(result);
  } catch (error) {
    console.error('❌ Error forwarding to automation service:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'running',
    message: 'Test webhook server is running',
    endpoints: {
      webhook: 'POST /whatsapp/webhook',
      health: 'GET /'
    }
  });
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`🧪 Test webhook server running on http://localhost:${PORT}`);
  console.log(`📡 Webhook endpoint: http://localhost:${PORT}/whatsapp/webhook`);
  console.log(`🔗 Forwarding to: http://localhost:3000/whatsapp/webhook`);
});
