import { create } from '@wppconnect-team/wppconnect';
import 'dotenv/config';

console.log('🚀 Starting WPPConnect for QR Code scanning...');
console.log('📱 A browser window will open - please scan the QR code with your WhatsApp');

create({
  session: 'wefixico',
  catchQR: (base64Qr) => {
    console.log('📱 QR Code received!');
    console.log('🔗 Scan this QR code with your WhatsApp:');
    console.log('QR Code:', base64Qr);
    console.log('');
    console.log('💡 You can also check the browser window that opened');
  },
  statusFind: (statusSession, session) => {
    console.log(`📊 Status: ${statusSession} for session: ${session}`);
  },
  headless: false, // Browser will be visible
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
  ]
})
.then((client) => {
  console.log('✅ WPPConnect client created successfully!');
  console.log('📱 Please scan the QR code in the browser window');
  console.log('⏳ Waiting for WhatsApp connection...');
  
  client.onStateChange((state) => {
    console.log(`📡 WhatsApp connection state: ${state}`);
    if (state === 'CONNECTED') {
      console.log('🎉 WhatsApp is now connected!');
      console.log('✅ You can now use the automation system');
    }
  });
  
  client.onMessage((message) => {
    console.log('📨 Received message:', {
      from: message.from,
      body: message.body?.substring(0, 50) + '...'
    });
  });
  
  // Keep the process running
  process.on('SIGINT', () => {
    console.log('🛑 Shutting down...');
    client.close();
    process.exit(0);
  });
})
.catch((error) => {
  console.error('❌ Error starting WPPConnect:', error);
  process.exit(1);
});
