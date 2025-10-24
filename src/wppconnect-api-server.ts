import express from 'express';
import { WPPConnectServer } from './wppconnect-server.js';
import { log, logErr } from './utils/logger.js';

const app = express();
app.use(express.json());

// Add CORS headers to allow dashboard to call WPPConnect API
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

// Initialize WPPConnect server
const wppServer = new WPPConnectServer();

// Start WPPConnect server
wppServer.start().catch((error) => {
  logErr('❌ Failed to start WPPConnect server:', error);
  process.exit(1);
});

// API endpoint for sending messages
app.post('/api/:session/send-message', async (req: any, res: any) => {
  try {
    const { session } = req.params;
    const { phone, message } = req.body;

    if (!phone || !message) {
      return res.status(400).json({ error: 'Phone and message are required' });
    }

    // Check if WPPConnect is ready
    if (!wppServer.isReady()) {
      return res.status(503).json({ error: 'WPPConnect server not ready' });
    }

    // Send message via WPPConnect
    await wppServer.sendMessage(phone, message);

    res.json({ 
      success: true, 
      message: 'Message sent successfully',
      session,
      phone,
      content: message.substring(0, 50) + '...'
    });
  } catch (error) {
    logErr('❌ Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Health check endpoint
app.get('/health', (req: any, res: any) => {
  res.json({
    status: 'running',
    wppconnect_ready: wppServer.isReady(),
    message: 'WPPConnect API server is running'
  });
});

// Start the API server
const PORT = process.env.WPP_PORT || 8080;
app.listen(PORT, () => {
  log(`🚀 WPPConnect API server running on port ${PORT}`);
  log(`📡 API endpoint: http://localhost:${PORT}/api/:session/send-message`);
  log(`🔍 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  log('🛑 Shutting down WPPConnect API server...');
  await wppServer.stop();
  process.exit(0);
});
