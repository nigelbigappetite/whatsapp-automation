#!/usr/bin/env node

// Simple start script for WhatsApp Webhook Server
console.log('🚀 Starting WhatsApp Webhook Server...');

// Import and start the webhook server
import('./dist/whatsapp-webhook-server.js').catch((error) => {
  console.error('❌ Failed to start WhatsApp Webhook Server:', error);
  process.exit(1);
});
