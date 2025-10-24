// quoteUtils.ts - Helper functions for the Wefixico Quote Agent

import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp';

/**
 * Format phone number to standard format
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Add country code if missing (assuming UK)
  if (!cleaned.startsWith('44')) {
    return '44' + cleaned;
  }
  
  return cleaned;
}

/**
 * Validate quote data structure
 */
export function validateQuote(quote: any): boolean {
  const required = [
    'total_volume',
    'rounded_volume',
    'base_price',
    'customer_pays'
  ];
  
  return required.every(field => quote.hasOwnProperty(field));
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: string | number): string {
  return `£${parseFloat(amount.toString()).toFixed(2)}`;
}

/**
 * Calculate time until quote expires
 */
export function getQuoteExpiry(createdAt: string | Date): string {
  const created = new Date(createdAt);
  const expires = new Date(created.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const now = new Date();
  
  const hoursLeft = Math.floor((expires.getTime() - now.getTime()) / (1000 * 60 * 60));
  
  if (hoursLeft < 0) return 'Expired';
  if (hoursLeft < 24) return `${hoursLeft} hours left`;
  
  const daysLeft = Math.floor(hoursLeft / 24);
  return `${daysLeft} days left`;
}

/**
 * Log conversation to file for debugging
 */
export async function logConversation(customerPhone: string, message: any, type: string): Promise<void> {
  const logDir = path.join(process.cwd(), 'logs');
  
  try {
    await fs.mkdir(logDir, { recursive: true });
    
    const logFile = path.join(logDir, `${customerPhone}.log`);
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${type}] ${JSON.stringify(message)}\n`;
    
    await fs.appendFile(logFile, logEntry);
  } catch (error) {
    console.error('Error logging conversation:', error);
  }
}

/**
 * Generate quote reference number
 */
export function generateQuoteRef(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `WFX-${dateStr}-${random}`;
}

/**
 * Check if customer is eligible for discount
 */
export function calculateDiscount(customer: any, baseAmount: number): number {
  if (!customer) return 0;
  
  // Pro members get automatic discount
  if (customer.is_pro) {
    return baseAmount * 0.1; // 10% discount
  }
  
  // Loyalty discount based on previous jobs
  if (customer.total_jobs >= 5) {
    return baseAmount * 0.05; // 5% discount
  }
  
  // Custom discount percentage
  if (customer.discount_percentage > 0) {
    return baseAmount * (customer.discount_percentage / 100);
  }
  
  return 0;
}

/**
 * Sanitize input to prevent injection
 */
export function sanitizeInput(input: any): string {
  if (typeof input !== 'string') return String(input);
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim()
    .slice(0, 1000); // Limit length
}

/**
 * Parse natural language quantity
 */
export function parseQuantity(text: string): number {
  const numberWords: Record<string, number> = {
    'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
    'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
    'a': 1, 'an': 1, 'couple': 2, 'few': 3
  };
  
  // Try to find numeric value first
  const numericMatch = text.match(/\d+/);
  if (numericMatch) {
    return parseInt(numericMatch[0]);
  }
  
  // Try word-based numbers
  for (const [word, num] of Object.entries(numberWords)) {
    if (text.toLowerCase().includes(word)) {
      return num;
    }
  }
  
  return 1; // Default to 1 if no quantity found
}

/**
 * Create formatted quote message for WhatsApp
 */
export function formatQuoteMessage(quote: any, items: any[], includeBreakdown: boolean = false): string {
  let message = `🎉 *your waste removal quote*\n\n`;
  
  if (includeBreakdown) {
    message += `*here's what i found:*\n`;
    items.forEach(item => {
      message += `• ${item.quantity}x ${item.type.replace(/_/g, ' ')}\n`;
    });
    message += `\n`;
  }
  
  message += `*estimated volume:* ${quote.rounded_volume} yd³\n`;
  
  if (parseFloat(quote.extras) > 0) {
    message += `*special items:* ${formatCurrency(quote.extras)}\n`;
  }
  
  message += `\n💰 *your total: ${formatCurrency(quote.customer_pays)}*\n\n`;
  message += `this includes everything - collection, disposal, and our service! 😊\n\n`;
  message += `would you like to book this collection? just reply "yes" to confirm! 🚛`;
  
  return message;
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>, 
  maxRetries: number = 3, 
  baseDelay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const delay = baseDelay * Math.pow(2, i);
      console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}

/**
 * Rate limiter for API calls
 */
export class RateLimiter {
  private maxCalls: number;
  private windowMs: number;
  private calls: Map<string, number[]>;

  constructor(maxCalls: number, windowMs: number) {
    this.maxCalls = maxCalls;
    this.windowMs = windowMs;
    this.calls = new Map();
  }
  
  async checkLimit(key: string): Promise<boolean> {
    const now = Date.now();
    const userCalls = this.calls.get(key) || [];
    
    // Remove old calls outside the window
    const recentCalls = userCalls.filter(time => now - time < this.windowMs);
    
    if (recentCalls.length >= this.maxCalls) {
      const oldestCall = Math.min(...recentCalls);
      const waitTime = this.windowMs - (now - oldestCall);
      throw new Error(`Rate limit exceeded. Try again in ${Math.ceil(waitTime / 1000)} seconds`);
    }
    
    recentCalls.push(now);
    this.calls.set(key, recentCalls);
    
    return true;
  }
}

/**
 * Image compression for WhatsApp
 */
export async function compressImage(buffer: Buffer, maxSizeMB: number = 5): Promise<Buffer> {
  let compressed = buffer;
  let quality = 90;
  
  while (compressed.length > maxSizeMB * 1024 * 1024 && quality > 10) {
    compressed = await sharp(buffer)
      .jpeg({ quality })
      .toBuffer();
    
    quality -= 10;
  }
  
  return compressed;
}

/**
 * Extract location from message if provided
 */
export function extractLocation(message: string): string | null {
  // UK postcode regex
  const postcodeRegex = /\b[A-Z]{1,2}\d{1,2}\s?\d[A-Z]{2}\b/gi;
  const match = message.match(postcodeRegex);
  
  if (match) {
    return match[0].toUpperCase();
  }
  
  return null;
}

/**
 * Business hours check
 */
export function isBusinessHours(): boolean {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();
  
  // Monday-Friday 8am-6pm, Saturday 9am-4pm
  if (day === 0) return false; // Sunday
  if (day === 6) return hour >= 9 && hour < 16; // Saturday
  return hour >= 8 && hour < 18; // Weekdays
}

/**
 * Generate auto-reply for outside business hours
 */
export function getOutOfHoursMessage(): string {
  return `Thanks for contacting Wefixico! 🕐\n\n` +
         `We're currently outside business hours. Our team operates:\n` +
         `• Monday-Friday: 8am-6pm\n` +
         `• Saturday: 9am-4pm\n` +
         `• Sunday: Closed\n\n` +
         `Your message has been received and we'll respond as soon as possible. ` +
         `Feel free to send photos or describe your items, and we'll quote when we're back!`;
}

/**
 * Generate booking reference
 */
export function generateBookingReference(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `BK${date}${random}`;
}

/**
 * Generate job reference
 */
export function generateJobReference(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `JOB${date}${random}`;
}

/**
 * Format phone number for WhatsApp (with @c.us suffix)
 */
export function formatWhatsAppPhone(phone: string): string {
  const cleaned = formatPhoneNumber(phone);
  return `${cleaned}@c.us`;
}

/**
 * Extract phone number from WhatsApp format
 */
export function extractPhoneFromWhatsApp(whatsappPhone: string): string {
  return whatsappPhone.replace('@c.us', '');
}

/**
 * Validate UK postcode
 */
export function validateUKPostcode(postcode: string): boolean {
  const postcodeRegex = /^[A-Z]{1,2}\d{1,2}\s?\d[A-Z]{2}$/i;
  return postcodeRegex.test(postcode);
}

/**
 * Format address for display
 */
export function formatAddress(address: string, postcode?: string): string {
  let formatted = address.trim();
  if (postcode) {
    formatted += `, ${postcode.toUpperCase()}`;
  }
  return formatted;
}

/**
 * Calculate distance between postcodes (simplified)
 */
export function calculateDistance(postcode1: string, postcode2: string): number {
  // This is a simplified calculation
  // In production, you'd use a proper postcode API
  const p1 = postcode1.replace(/\s/g, '').toUpperCase();
  const p2 = postcode2.replace(/\s/g, '').toUpperCase();
  
  // Simple distance calculation based on postcode similarity
  if (p1 === p2) return 0;
  if (p1.substring(0, 2) === p2.substring(0, 2)) return 5; // Same area
  if (p1.substring(0, 1) === p2.substring(0, 1)) return 15; // Same region
  return 50; // Different region
}
