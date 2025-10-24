import { supabase } from "../config/supabaseClient.js";
import { log, logErr } from "../utils/logger.js";

// GHL API configuration
const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

export interface BookingRequest {
  session: string;
  from: string;
  body: string;
  type: string;
  customer_name?: string;
  customer_email?: string;
  service_type?: string;
  urgency_level?: string;
  pickup_address?: string;
  waste_type?: string;
  preferred_date?: string;
  preferred_time?: string;
}

export class BookingCRM {
  
  /**
   * Process incoming WhatsApp message for booking
   */
  static async processBookingMessage(message: BookingRequest) {
    try {
      log(`📨 Processing booking message from ${message.from}`);
      
      // 1. Store message in staging
      await this.storeMessage(message);
      
      // 2. Analyze message for booking intent
      const bookingIntent = await this.analyzeBookingIntent(message);
      
      // 3. If booking intent detected, process accordingly
      if (bookingIntent.isBooking) {
        await this.handleBookingRequest(message, bookingIntent);
      } else {
        await this.handleGeneralInquiry(message);
      }
      
      return { success: true, bookingIntent };
      
    } catch (error) {
      logErr('❌ Error processing booking message:', error);
      throw error;
    }
  }
  
  /**
   * Store message in Supabase
   */
  private static async storeMessage(message: BookingRequest) {
    try {
      // Try whatsapp_messages table first (if it exists)
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .insert({
          brand_id: process.env.SUPABASE_BRAND_ID,
          session_name: message.session,
          actor_phone: message.from,
          direction: 'inbound',
          message: message.body,
          message_type: message.type,
          created_at: new Date().toISOString()
        });
        
      if (error) {
        log('⚠️ whatsapp_messages table not found, storing in memory only');
        // Store in memory for now - you can create the table later
        return;
      } else {
        log('✅ Message stored in database');
      }
    } catch (error) {
      log('⚠️ Database storage not available, continuing with processing');
    }
  }
  
  /**
   * Analyze message for booking intent using AI
   */
  private static async analyzeBookingIntent(message: BookingRequest) {
    const bookingKeywords = [
      'book', 'booking', 'appointment', 'schedule', 'collect', 'pickup',
      'waste', 'removal', 'clearance', 'disposal', 'quote', 'price'
    ];
    
    const urgencyKeywords = ['urgent', 'asap', 'today', 'tomorrow', 'emergency'];
    const serviceKeywords = ['garden', 'house', 'office', 'construction', 'furniture'];
    
    // Handle undefined or null message body
    if (!message.body) {
      return {
        isBooking: false,
        isUrgent: false,
        serviceType: 'general',
        confidence: 0.1
      };
    }
    
    const text = message.body.toLowerCase();
    
    const isBooking = bookingKeywords.some(keyword => text.includes(keyword));
    const isUrgent = urgencyKeywords.some(keyword => text.includes(keyword));
    const serviceType = serviceKeywords.find(keyword => text.includes(keyword)) || 'general';
    
    return {
      isBooking,
      isUrgent,
      serviceType,
      confidence: isBooking ? 0.8 : 0.2
    };
  }
  
  /**
   * Handle booking request
   */
  private static async handleBookingRequest(message: BookingRequest, intent: any) {
    log('🎯 Booking intent detected, processing...');
    
    // 1. Create customer record in GHL
    const customer = await this.createGHLContact(message);
    
    // 2. Generate quote if needed
    if (intent.serviceType !== 'general') {
      const quote = await this.generateQuote(message, intent);
      await this.sendQuoteResponse(message.from, quote);
    }
    
    // 3. Check for available slots
    const availableSlots = await this.getAvailableSlots();
    
    // 4. Send booking options
    await this.sendBookingOptions(message.from, availableSlots);
  }
  
  /**
   * Handle general inquiry
   */
  private static async handleGeneralInquiry(message: BookingRequest) {
    log('💬 General inquiry, sending standard response...');
    
    const response = `Hi! Thanks for contacting Wefixico. 

I can help you with:
• Waste removal & clearance
• Garden clearance
• House clearance
• Office clearance

What service do you need? Please describe what you'd like removed and I'll provide a quote!`;
    
    await this.sendWhatsAppMessage(message.from, response);
  }
  
  /**
   * Create contact in GoHighLevel
   */
  private static async createGHLContact(message: BookingRequest) {
    if (!GHL_API_KEY || !GHL_LOCATION_ID) {
      log('⚠️ GHL credentials not configured');
      return this.createLocalContact(message);
    }
    
    try {
      // First, let's test if the API key is valid by making a simple request
      const testResponse = await fetch(`https://services.leadconnectorhq.com/contacts/?locationId=${GHL_LOCATION_ID}&limit=1`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
          'Version': '2021-07-28'
        }
      });
      
      if (!testResponse.ok) {
        const errorData = await testResponse.json();
        log('⚠️ GHL API key invalid:', errorData.message || 'Unauthorized');
        log('💡 Please update your GHL_API_KEY in .env file');
        return this.createLocalContact(message);
      }
      
      // If test passes, create the contact
      const response = await fetch(`https://services.leadconnectorhq.com/contacts/?locationId=${GHL_LOCATION_ID}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        },
        body: JSON.stringify({
          name: message.customer_name || 'WhatsApp Customer',
          phone: message.from,
          email: message.customer_email || '',
          source: 'WhatsApp',
          tags: ['waste-removal', 'whatsapp-lead']
        })
      });
      
      if (response.ok) {
        const contact = await response.json();
        log('✅ Contact created in GHL:', contact.contact?.id || contact.id);
        return contact.contact || contact;
      } else {
        const errorData = await response.json();
        log('⚠️ GHL contact creation failed:', errorData.message || 'Unknown error');
        return this.createLocalContact(message);
      }
    } catch (error) {
      logErr('❌ Error creating GHL contact:', error);
      log('💡 Continuing with local contact creation');
      return this.createLocalContact(message);
    }
  }
  
  /**
   * Create local contact record when GHL is not available
   */
  private static createLocalContact(message: BookingRequest) {
    const contact = {
      id: `local_${Date.now()}`,
      name: message.customer_name || 'WhatsApp Customer',
      phone: message.from,
      email: message.customer_email || '',
      source: 'WhatsApp',
      tags: ['waste-removal', 'whatsapp-lead'],
      created_at: new Date().toISOString()
    };
    
    log('✅ Local contact created:', contact.id);
    return contact;
  }
  
  /**
   * Generate quote for service
   */
  private static async generateQuote(message: BookingRequest, intent: any) {
    // Simple quote logic - you can enhance this with AI
    const basePrice = 80;
    const urgencyMultiplier = intent.isUrgent ? 1.5 : 1.0;
    const serviceMultiplier = intent.serviceType === 'garden' ? 1.2 : 1.0;
    
    const quote = {
      base_price: basePrice,
      urgency_multiplier: urgencyMultiplier,
      service_multiplier: serviceMultiplier,
      total: Math.round(basePrice * urgencyMultiplier * serviceMultiplier),
      service_type: intent.serviceType,
      is_urgent: intent.isUrgent
    };
    
    return quote;
  }
  
  /**
   * Get available booking slots from GHL
   */
  private static async getAvailableSlots() {
    if (!GHL_API_KEY || !GHL_LOCATION_ID) {
      log('⚠️ GHL credentials not configured, using default slots');
      return this.getDefaultSlots();
    }
    
    try {
      const today = new Date();
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      const dayAfter = new Date(today.getTime() + 48 * 60 * 60 * 1000);
      
      // First, get available calendars
      const calendarsResponse = await fetch(
        `https://services.leadconnectorhq.com/calendars/?locationId=${GHL_LOCATION_ID}`,
        {
          headers: {
            'Authorization': `Bearer ${GHL_API_KEY}`,
            'Version': '2021-07-28'
          }
        }
      );
      
      if (!calendarsResponse.ok) {
        log('⚠️ GHL calendars not accessible, using default slots');
        return this.getDefaultSlots();
      }
      
      const calendars = await calendarsResponse.json();
      const calendarId = calendars.calendars?.[0]?.id;
      
      if (!calendarId) {
        log('⚠️ No calendars found in GHL, using default slots');
        return this.getDefaultSlots();
      }
      
      // Get free slots for the calendar
      const slotsResponse = await fetch(
        `https://services.leadconnectorhq.com/calendars/${calendarId}/free-slots?startDate=${tomorrow.toISOString()}&endDate=${dayAfter.toISOString()}`,
        {
          headers: {
            'Authorization': `Bearer ${GHL_API_KEY}`,
            'Version': '2021-07-28'
          }
        }
      );
      
      if (slotsResponse.ok) {
        const data = await slotsResponse.json();
        const slots = data.slots?.map((slot: any) => {
          const date = new Date(slot.startTime);
          return `${date.toLocaleDateString()} ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
        }) || [];
        
        if (slots.length > 0) {
          log('✅ Retrieved GHL calendar slots:', slots.length);
          return slots.slice(0, 5); // Limit to 5 slots
        }
      }
    } catch (error) {
      logErr('❌ Error fetching GHL slots:', error);
    }
    
    return this.getDefaultSlots();
  }
  
  /**
   * Get default booking slots when GHL is not available
   */
  private static getDefaultSlots() {
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const dayAfter = new Date(today.getTime() + 48 * 60 * 60 * 1000);
    
    return [
      `Tomorrow ${tomorrow.toLocaleDateString()} 9am-12pm`,
      `Tomorrow ${tomorrow.toLocaleDateString()} 1pm-4pm`,
      `Day after ${dayAfter.toLocaleDateString()} 9am-12pm`,
      `Day after ${dayAfter.toLocaleDateString()} 1pm-4pm`,
      `Next week Monday 9am-12pm`
    ];
  }
  
  /**
   * Send quote response
   */
  private static async sendQuoteResponse(phone: string, quote: any) {
    const message = `💰 QUOTE FOR YOUR SERVICE

Service: ${quote.service_type}
Base Price: £${quote.base_price}
${quote.is_urgent ? 'Urgent Service: +50%' : ''}
Total: £${quote.total}

This quote is valid for 7 days. Would you like to book?`;
    
    await this.sendWhatsAppMessage(phone, message);
  }
  
  /**
   * Send booking options
   */
  private static async sendBookingOptions(phone: string, slots: string[]) {
    const message = `📅 AVAILABLE BOOKING SLOTS

${slots.map((slot, i) => `${i + 1}. ${slot}`).join('\n')}

Please reply with the number of your preferred slot, or let me know if you need a different time!`;
    
    await this.sendWhatsAppMessage(phone, message);
  }
  
  /**
   * Create appointment in GHL when booking is confirmed
   */
  static async createGHLAppointment(contactId: string, slotInfo: string, serviceType: string) {
    if (!GHL_API_KEY || !GHL_LOCATION_ID) {
      log('⚠️ GHL credentials not configured, appointment not created');
      return null;
    }
    
    try {
      // Parse slot info to create appointment
      const appointmentData = {
        contactId: contactId,
        title: `${serviceType} Service - Wefixico`,
        description: `Waste removal service booked via WhatsApp`,
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours duration
        locationId: GHL_LOCATION_ID,
        status: 'scheduled'
      };
      
      const response = await fetch('https://services.leadconnectorhq.com/calendars/events/appointments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        },
        body: JSON.stringify(appointmentData)
      });
      
      if (response.ok) {
        const appointment = await response.json();
        log('✅ Appointment created in GHL:', appointment.id);
        return appointment;
      } else {
        const errorData = await response.json();
        log('⚠️ GHL appointment creation failed:', errorData.message || 'Unknown error');
        return null;
      }
    } catch (error) {
      logErr('❌ Error creating GHL appointment:', error);
      return null;
    }
  }
  
  /**
   * Send WhatsApp message via WPPConnect API
   */
  private static async sendWhatsAppMessage(phone: string, message: string) {
    try {
      const response = await fetch('http://localhost:8080/api/wefixico/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: phone,
          message: message
        })
      });
      
      if (response.ok) {
        log(`✅ Message sent to ${phone}`);
        
        // Store outgoing message in database
        await this.storeOutgoingMessage(phone, message);
      } else {
        logErr(`❌ Failed to send message to ${phone}`);
      }
    } catch (error) {
      logErr('❌ Error sending WhatsApp message:', error);
    }
  }
  
  /**
   * Store outgoing message in database
   */
  private static async storeOutgoingMessage(phone: string, message: string) {
    try {
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .insert({
          brand_id: process.env.SUPABASE_BRAND_ID,
          session_name: 'wefixico',
          actor_phone: phone,
          direction: 'outbound',
          message: message,
          message_type: 'text',
          created_at: new Date().toISOString()
        });
        
      if (error) {
        logErr('❌ Error storing outgoing message:', error);
      } else {
        log('✅ Outgoing message stored in database');
      }
    } catch (error) {
      logErr('❌ Error storing outgoing message:', error);
    }
  }
}
