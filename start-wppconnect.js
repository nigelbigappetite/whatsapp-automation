#!/usr/bin/env node

// Simple startup script for WhatsApp Webhook Server on Railway
console.log('🚀 Starting WhatsApp Webhook Service...');

// Import and start the webhook server
import('./dist/whatsapp-webhook-server.js').then(() => {
    console.log('✅ WhatsApp Webhook server started successfully');
}).catch((error) => {
    console.error('❌ Failed to start WhatsApp Webhook server:', error);
    process.exit(1);
});
