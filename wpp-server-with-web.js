import express from 'express';
import { create } from '@wppconnect-team/wppconnect';

const app = express();
app.use(express.json());

// Store active sessions
const sessions = new Map();

// Serve static files (simple HTML interface)
app.use(express.static('public'));

// Create a simple web interface
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>WPPConnect - WhatsApp Automation</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #25D366; }
            .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
            .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
            .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
            .info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
            button { background: #25D366; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 5px; }
            button:hover { background: #1ea952; }
            input { padding: 8px; margin: 5px; border: 1px solid #ddd; border-radius: 3px; }
            .log { background: #f8f9fa; padding: 15px; border-radius: 5px; font-family: monospace; white-space: pre-wrap; max-height: 300px; overflow-y: auto; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 WPPConnect WhatsApp Automation</h1>
            
            <div class="status info">
                <strong>Status:</strong> Server is running on port 8080
            </div>
            
            <h2>📱 WhatsApp Session Management</h2>
            
            <div>
                <h3>Start Session</h3>
                <input type="text" id="sessionName" placeholder="Session name (e.g., wefixico)" value="wefixico">
                <input type="text" id="webhookUrl" placeholder="Webhook URL" value="http://localhost:3000/whatsapp/webhook">
                <input type="text" id="webhookSecret" placeholder="Webhook Secret" value="wefixico_webhook_secret_2024">
                <br><br>
                <button onclick="startSession()">Start Session</button>
                <button onclick="getQRCode()">Get QR Code</button>
            </div>
            
            <div>
                <h3>Send Test Message</h3>
                <input type="text" id="phoneNumber" placeholder="Phone number (e.g., +1234567890)">
                <input type="text" id="message" placeholder="Message" value="Hello from WPPConnect!">
                <br><br>
                <button onclick="sendMessage()">Send Message</button>
            </div>
            
            <div>
                <h3>Session Status</h3>
                <button onclick="getStatus()">Check Status</button>
                <button onclick="getSessions()">List Sessions</button>
            </div>
            
            <div>
                <h3>📋 Logs</h3>
                <div id="logs" class="log">Ready... Click "Start Session" to begin.</div>
            </div>
        </div>

        <script>
            function log(message) {
                const logs = document.getElementById('logs');
                const timestamp = new Date().toLocaleTimeString();
                logs.textContent += \`[\${timestamp}] \${message}\\n\`;
                logs.scrollTop = logs.scrollHeight;
            }

            async function startSession() {
                const sessionName = document.getElementById('sessionName').value;
                const webhookUrl = document.getElementById('webhookUrl').value;
                const webhookSecret = document.getElementById('webhookSecret').value;
                
                log(\`Starting session: \${sessionName}\`);
                
                try {
                    const response = await fetch('/api/session/start', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            session: sessionName,
                            webhook: webhookUrl,
                            webhookHeaders: { 'x-webhook-secret': webhookSecret }
                        })
                    });
                    
                    const result = await response.json();
                    log(\`Session started: \${JSON.stringify(result)}\`);
                } catch (error) {
                    log(\`Error starting session: \${error.message}\`);
                }
            }

            async function getQRCode() {
                log('Getting QR code...');
                try {
                    const response = await fetch('/api/qr/wefixico');
                    const result = await response.json();
                    log(\`QR Code: \${result.qrCode || 'Not available'}\`);
                } catch (error) {
                    log(\`Error getting QR code: \${error.message}\`);
                }
            }

            async function sendMessage() {
                const phone = document.getElementById('phoneNumber').value;
                const message = document.getElementById('message').value;
                
                log(\`Sending message to \${phone}: \${message}\`);
                
                try {
                    const response = await fetch('/api/wefixico/send-message', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ phone, message })
                    });
                    
                    const result = await response.json();
                    log(\`Message sent: \${JSON.stringify(result)}\`);
                } catch (error) {
                    log(\`Error sending message: \${error.message}\`);
                }
            }

            async function getStatus() {
                log('Checking status...');
                try {
                    const response = await fetch('/api/status');
                    const result = await response.json();
                    log(\`Status: \${JSON.stringify(result)}\`);
                } catch (error) {
                    log(\`Error checking status: \${error.message}\`);
                }
            }

            async function getSessions() {
                log('Getting sessions...');
                try {
                    const response = await fetch('/api/sessions');
                    const result = await response.json();
                    log(\`Sessions: \${JSON.stringify(result)}\`);
                } catch (error) {
                    log(\`Error getting sessions: \${error.message}\`);
                }
            }

            // Auto-refresh logs every 2 seconds
            setInterval(async () => {
                try {
                    const response = await fetch('/api/logs');
                    const logs = await response.text();
                    if (logs) {
                        document.getElementById('logs').textContent = logs;
                    }
                } catch (error) {
                    // Ignore errors for auto-refresh
                }
            }, 2000);
        </script>
    </body>
    </html>
  `);
});

// API endpoints
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
          console.log('📨 Received WhatsApp message:', message);
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
          console.log('✅ Webhook response:', await response.text());
        } catch (error) {
          console.error('❌ Webhook error:', error);
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

// Get QR code
app.get('/api/qr/:session', async (req, res) => {
  try {
    const { session } = req.params;
    const client = sessions.get(session);
    if (!client) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // This would need to be implemented based on WPPConnect API
    res.json({ qrCode: 'QR code functionality needs to be implemented' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Status endpoint
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'running',
    sessions: Array.from(sessions.keys()),
    message: 'WPPConnect server is running'
  });
});

// Sessions endpoint
app.get('/api/sessions', (req, res) => {
  res.json({ sessions: Array.from(sessions.keys()) });
});

// Logs endpoint
app.get('/api/logs', (req, res) => {
  res.send('WPPConnect server logs would go here...');
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`🌐 WPPConnect server with web interface running on http://localhost:${PORT}`);
  console.log(`📱 Open http://localhost:${PORT} in your browser to configure WhatsApp`);
});
