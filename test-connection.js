// Test script to check environment and database connection
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

console.log('🔍 Testing environment and database connection...\n');

// Test 1: Check environment variables
console.log('📋 Environment Variables:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing');
console.log('WPP_URL:', process.env.WPP_URL || 'http://localhost:8080');
console.log('PORT:', process.env.PORT || '3000');
console.log('');

// Test 2: Test Supabase connection
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('🔗 Testing Supabase connection...');
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  try {
    // Test connection by checking if brands table exists
    const { data: brands, error: brandsError } = await supabase
      .from('brands')
      .select('*')
      .limit(1);
    
    if (brandsError) {
      console.log('❌ Brands table error:', brandsError.message);
    } else {
      console.log('✅ Brands table accessible');
    }
    
    // Test live_conversations table
    const { data: conversations, error: conversationsError } = await supabase
      .from('live_conversations')
      .select('*')
      .limit(1);
    
    if (conversationsError) {
      console.log('❌ Live conversations table error:', conversationsError.message);
      console.log('💡 You may need to run the database schema');
    } else {
      console.log('✅ Live conversations table accessible');
    }
    
    // Test whatsapp_quotes table
    const { data: quotes, error: quotesError } = await supabase
      .from('whatsapp_quotes')
      .select('*')
      .limit(1);
    
    if (quotesError) {
      console.log('❌ WhatsApp quotes table error:', quotesError.message);
      console.log('💡 You may need to run the database schema');
    } else {
      console.log('✅ WhatsApp quotes table accessible');
    }
    
  } catch (error) {
    console.log('❌ Supabase connection failed:', error.message);
  }
} else {
  console.log('❌ Cannot test Supabase - missing credentials');
}

console.log('\n🎯 Test complete!');
