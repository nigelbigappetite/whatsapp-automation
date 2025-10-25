#!/usr/bin/env node

console.log('🚀 Starting Minimal WhatsApp Server...');

// Simple import and start
import('./dist/minimal-server.js').then(() => {
    console.log('✅ Minimal WhatsApp Server started successfully');
}).catch((error) => {
    console.error('❌ Failed to start Minimal WhatsApp Server:', error);
    process.exit(1);
});
