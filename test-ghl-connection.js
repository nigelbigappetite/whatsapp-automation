#!/usr/bin/env node

// Test GHL API connection
const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

console.log('🔍 Testing GHL API Connection...');
console.log('📍 Location ID:', GHL_LOCATION_ID);
console.log('🔑 API Key:', GHL_API_KEY ? `${GHL_API_KEY.substring(0, 20)}...` : 'Not set');

async function testGHLConnection() {
  if (!GHL_API_KEY || !GHL_LOCATION_ID) {
    console.log('❌ GHL credentials not configured');
    return;
  }

  try {
    // Test 1: Get contacts
    console.log('\n📞 Testing contacts endpoint...');
    const contactsResponse = await fetch(`https://services.leadconnectorhq.com/contacts/?locationId=${GHL_LOCATION_ID}&limit=1`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Version': '2021-07-28'
      }
    });

    if (contactsResponse.ok) {
      const contacts = await contactsResponse.json();
      console.log('✅ Contacts endpoint working');
      console.log('📊 Total contacts:', contacts.meta?.total || 'Unknown');
    } else {
      const error = await contactsResponse.json();
      console.log('❌ Contacts endpoint failed:', error.message);
    }

    // Test 2: Get calendars
    console.log('\n📅 Testing calendars endpoint...');
    const calendarsResponse = await fetch(`https://services.leadconnectorhq.com/calendars/?locationId=${GHL_LOCATION_ID}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Version': '2021-07-28'
      }
    });

    if (calendarsResponse.ok) {
      const calendars = await calendarsResponse.json();
      console.log('✅ Calendars endpoint working');
      console.log('📊 Available calendars:', calendars.calendars?.length || 0);
    } else {
      const error = await calendarsResponse.json();
      console.log('❌ Calendars endpoint failed:', error.message);
    }

    // Test 3: Create a test contact
    console.log('\n👤 Testing contact creation...');
    const testContact = {
      name: 'Test WhatsApp Contact',
      phone: '447494415568',
      email: 'test@wefixico.com',
      source: 'WhatsApp Test',
      tags: ['test', 'whatsapp']
    };

    const createResponse = await fetch(`https://services.leadconnectorhq.com/contacts/?locationId=${GHL_LOCATION_ID}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      },
      body: JSON.stringify(testContact)
    });

    if (createResponse.ok) {
      const contact = await createResponse.json();
      console.log('✅ Contact creation working');
      console.log('🆔 Created contact ID:', contact.contact?.id || contact.id);
    } else {
      const error = await createResponse.json();
      console.log('❌ Contact creation failed:', error.message);
    }

  } catch (error) {
    console.log('❌ Connection error:', error.message);
  }
}

testGHLConnection();
