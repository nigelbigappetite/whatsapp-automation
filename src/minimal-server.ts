import express from 'express';
import { log } from './utils/logger.js';

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
    service: 'Minimal WhatsApp Server',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Simple root endpoint
app.get('/', (req: any, res: any) => {
  res.json({
    message: 'WhatsApp Automation Server',
    status: 'running',
    endpoints: {
      health: '/health',
      webhook: '/webhook/whatsapp',
      send: '/api/send-message'
    }
  });
});

// Webhook endpoint for receiving WhatsApp messages
app.post('/webhook/whatsapp', async (req: any, res: any) => {
  try {
    const { from, message, type = 'text' } = req.body;
    
    log(`📨 Received WhatsApp message from ${from}: ${message}`);
    
    res.json({ 
      status: 'success', 
      message: 'Message received',
      from: from,
      content: message
    });
  } catch (error) {
    log(`❌ Error processing webhook: ${error}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoint for sending messages (simulation)
app.post('/api/send-message', async (req: any, res: any) => {
  try {
    const { phone, message } = req.body;
    
    log(`📤 [SIMULATION] Sending message to ${phone}: ${message}`);
    
    res.json({ 
      status: 'success', 
      message: 'Message sent (simulated)',
      to: phone,
      content: message
    });
  } catch (error) {
    log(`❌ Error sending message: ${error}`);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get connection status
app.get('/api/status', (req: any, res: any) => {
  res.json({
    status: 'connected',
    service: 'Minimal WhatsApp Server',
    mode: 'simulation',
    uptime: process.uptime()
  });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  log(`🚀 Minimal WhatsApp Server running on port ${PORT}`);
  log(`📡 Webhook endpoint: http://localhost:${PORT}/webhook/whatsapp`);
  log(`📤 Send message API: http://localhost:${PORT}/api/send-message`);
  log(`🔍 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  log('🛑 Shutting down Minimal WhatsApp Server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('🛑 Shutting down Minimal WhatsApp Server...');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  log(`❌ Uncaught Exception: ${error}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log(`❌ Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});
