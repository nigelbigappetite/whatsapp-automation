#!/usr/bin/env node

// Simple startup script for WPPConnect on Railway
console.log('🚀 Starting WPPConnect Service...');
console.log('📊 Node.js version:', process.version);
console.log('🌐 Environment:', process.env.NODE_ENV || 'development');

// Start the WPPConnect server
import('./dist/wppconnect-api-server.js')
  .then(() => {
    console.log('✅ WPPConnect server started successfully');
  })
  .catch((error) => {
    console.error('❌ Failed to start WPPConnect server:', error);
    process.exit(1);
  });
