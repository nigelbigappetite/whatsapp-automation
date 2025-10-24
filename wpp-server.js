const { create, Whatsapp } = require('@wppconnect-team/wppconnect');

const wppconnect = require('@wppconnect-team/wppconnect');

wppconnect.create({
  session: 'wefixico',
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
.then((client) => {
  console.log('✅ WPPConnect session started successfully!');
  console.log('📱 Session: wefixico');
  console.log('🌐 Web interface: http://localhost:8080');
  console.log('📞 Ready to receive WhatsApp messages');
  
  // Keep the process running
  process.on('SIGINT', () => {
    console.log('🛑 Shutting down WPPConnect...');
    client.close();
    process.exit(0);
  });
})
.catch((error) => {
  console.error('❌ Error starting WPPConnect:', error);
  process.exit(1);
});
