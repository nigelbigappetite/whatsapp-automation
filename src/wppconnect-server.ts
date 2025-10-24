import { create, SocketState, Whatsapp } from '@wppconnect-team/wppconnect';
import { log, logErr } from './utils/logger.js';

export class WPPConnectServer {
  private client: Whatsapp | null = null;
  private isConnected = false;

  async start(): Promise<void> {
    try {
      log('🚀 Starting WPPConnect server...');
      
      this.client = await create({
        session: process.env.BRAND_SESSION || 'wefixico',
        catchQR: (base64Qr: string) => {
          log('📱 QR Code received. Please scan with WhatsApp:');
          console.log('QR Code:', base64Qr);
          // You can also save this to a file or display it in a web interface
        },
        statusFind: (statusSession: string, session: string) => {
          log(`📊 Status: ${statusSession} for session: ${session}`);
        },
        headless: false, // Set to true for production
        devtools: false,
        useChrome: true,
        debug: false,
        logQR: true,
        browserArgs: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ],
        puppeteerOptions: {
          executablePath: undefined, // Use system Chrome
        }
      });

      this.client.onStateChange((state: SocketState) => {
        log(`📡 WhatsApp connection state: ${state}`);
        this.isConnected = state === 'CONNECTED';
      });

      this.client.onMessage(async (message: any) => {
        log('📨 Received WhatsApp message:', {
          from: message.from,
          body: message.body,
          type: message.type
        });

        // Forward to your automation service
        try {
          const response = await fetch('http://localhost:3000/whatsapp/webhook', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-webhook-secret': process.env.WEBHOOK_SECRET || 'wefixico_webhook_secret_2024'
            },
            body: JSON.stringify({
              session: process.env.BRAND_SESSION || 'wefixico',
              from: message.from,
              body: message.body,
              type: message.type || 'text'
            })
          });

          if (response.ok) {
            log('✅ Message forwarded to automation service');
          } else {
            logErr('❌ Failed to forward message to automation service');
          }
        } catch (error) {
          logErr('❌ Error forwarding message:', error);
        }
      });

            // Store outgoing messages in database
            (this.client as any).onMessageSent = async (message: any) => {
        log('📤 Outgoing message sent:', {
          to: message.to,
          body: message.body,
          type: message.type
        });

        // Store outgoing message in database
        try {
          const response = await fetch('http://localhost:3000/api/store-outgoing-message', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              session: process.env.BRAND_SESSION || 'wefixico',
              to: message.to,
              body: message.body,
              type: message.type || 'text'
            })
          });

          if (response.ok) {
            log('✅ Outgoing message stored in database');
          } else {
            logErr('❌ Failed to store outgoing message');
          }
        } catch (error) {
          logErr('❌ Error storing outgoing message:', error);
        }
      };

      log('✅ WPPConnect server started successfully');
    } catch (error) {
      logErr('❌ Error starting WPPConnect server:', error);
      throw error;
    }
  }

  async sendMessage(phone: string, message: string): Promise<void> {
    if (!this.client || !this.isConnected) {
      throw new Error('WPPConnect client not connected');
    }

    try {
      await this.client.sendText(phone, message);
      log(`📤 Message sent to ${phone}: ${message.substring(0, 50)}...`);
    } catch (error) {
      logErr('❌ Error sending message:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.isConnected = false;
      log('🛑 WPPConnect server stopped');
    }
  }

  isReady(): boolean {
    return this.isConnected && this.client !== null;
  }
}

// Start the server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new WPPConnectServer();
  
  server.start().catch((error) => {
    logErr('❌ Failed to start WPPConnect server:', error);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    log('🛑 Shutting down WPPConnect server...');
    await server.stop();
    process.exit(0);
  });
}
