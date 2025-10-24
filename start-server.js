#!/usr/bin/env node

// Simple startup script for Railway
console.log('🚀 Starting WhatsApp Automation Server...');
console.log('📊 Node.js version:', process.version);
console.log('🌐 Environment:', process.env.NODE_ENV || 'development');
console.log('🔧 Platform:', process.platform);
console.log('📁 Working directory:', process.cwd());

// Start the server
import('./dist/railway-server.js')
  .then(() => {
    console.log('✅ Server started successfully');
  })
  .catch((error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });
