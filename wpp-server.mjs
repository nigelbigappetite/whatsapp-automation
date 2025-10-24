import pkg from '@wppconnect-team/wppconnect';
const { create, createServer } = pkg;
import 'dotenv/config';

console.log('🚀 Starting WPPConnect server...');

// Create WPPConnect server with HTTP interface
createServer({
  webhook: 'http://localhost:8080/whatsapp/webhook',
  webhookHeaders: {
    'x-webhook-secret': process.env.WEBHOOK_SECRET || 'wefixico_webhook_secret_2024'
  },
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
})
.then((server) => {
  console.log('✅ WPPConnect server started successfully!');
  console.log('📱 Session: wefixico');
  console.log('🌐 Web interface: http://localhost:8080');
  console.log('📞 Ready to receive WhatsApp messages');
  console.log('');
  console.log('🔗 Next steps:');
  console.log('1. Open http://localhost:8080 in your browser');
  console.log('2. Create a session named "wefixico"');
  console.log('3. Set webhook URL to: http://localhost:8080/whatsapp/webhook');
  console.log('4. Scan QR code with your WhatsApp');
  console.log('');
  
  // Keep the process running
  process.on('SIGINT', () => {
    console.log('🛑 Shutting down WPPConnect...');
    server.close();
    process.exit(0);
  });
})
.catch((error) => {
  console.error('❌ Error starting WPPConnect:', error);
  process.exit(1);
});
