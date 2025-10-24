# Utils Integration Guide

## 🛠️ **Utility Functions Added**

I've successfully created `src/utils/quoteUtils.ts` with comprehensive utility functions for your WhatsApp automation system.

### **Key Features:**

#### **1. Phone Number Handling**
```typescript
formatPhoneNumber(phone: string): string
formatWhatsAppPhone(phone: string): string  // Adds @c.us suffix
extractPhoneFromWhatsApp(whatsappPhone: string): string
```

#### **2. Quote Management**
```typescript
validateQuote(quote: any): boolean
formatCurrency(amount: string | number): string
formatQuoteMessage(quote: any, items: any[], includeBreakdown?: boolean): string
calculateDiscount(customer: any, baseAmount: number): number
```

#### **3. Business Logic**
```typescript
isBusinessHours(): boolean
getOutOfHoursMessage(): string
parseQuantity(text: string): number
sanitizeInput(input: any): string
```

#### **4. Image Processing**
```typescript
compressImage(buffer: Buffer, maxSizeMB?: number): Promise<Buffer>
```

#### **5. Location & Address**
```typescript
extractLocation(message: string): string | null
validateUKPostcode(postcode: string): boolean
formatAddress(address: string, postcode?: string): string
calculateDistance(postcode1: string, postcode2: string): number
```

#### **6. Logging & Debugging**
```typescript
logConversation(customerPhone: string, message: any, type: string): Promise<void>
```

#### **7. Rate Limiting**
```typescript
class RateLimiter {
  constructor(maxCalls: number, windowMs: number)
  async checkLimit(key: string): Promise<boolean>
}
```

#### **8. Retry Logic**
```typescript
retryWithBackoff<T>(fn: () => Promise<T>, maxRetries?: number, baseDelay?: number): Promise<T>
```

## 🔧 **Integration Complete**

### **Enhanced Webhook Features:**

#### **1. Input Sanitization**
- All user input is sanitized to prevent injection attacks
- Phone numbers are properly formatted
- Text is trimmed and length-limited

#### **2. Business Hours Check**
- Automatically detects if outside business hours
- Sends appropriate out-of-hours message
- Logs all interactions for debugging

#### **3. Enhanced Quote Generation**
- Validates quote data before saving
- Formats quotes with proper currency display
- Includes item breakdown when requested
- Calculates customer discounts

#### **4. Comprehensive Logging**
- All conversations logged to individual files
- Inbound/outbound message tracking
- Debug information for troubleshooting

#### **5. Error Handling**
- Retry logic with exponential backoff
- Rate limiting for API calls
- Graceful error recovery

## 📁 **File Structure**

```
src/
├── utils/
│   └── quoteUtils.ts          # All utility functions
├── routes/
│   └── enhancedWebhook.ts     # Updated with utils integration
├── services/
│   ├── quoteService.ts        # Quote generation
│   └── aiAnalysisService.ts   # AI analysis
└── index.ts                   # Main server
```

## 🚀 **How to Use**

### **1. Start the Enhanced System**
```bash
npm start
```

### **2. Test Features**
- **Business Hours**: Messages outside 8am-6pm get auto-reply
- **Quote Generation**: AI analyzes waste descriptions
- **Image Processing**: Compresses images for WhatsApp
- **Logging**: Check `logs/` directory for conversation files

### **3. Monitor Logs**
```bash
# View conversation logs
ls logs/
tail -f logs/[phone_number].log
```

## 🎯 **Key Benefits**

#### **1. Production Ready**
- Input sanitization prevents attacks
- Rate limiting prevents abuse
- Comprehensive error handling

#### **2. Business Logic**
- Business hours enforcement
- Customer discount calculation
- UK postcode validation

#### **3. Debugging**
- Detailed conversation logging
- Error tracking and recovery
- Performance monitoring

#### **4. Scalability**
- Rate limiting per customer
- Retry logic for reliability
- Image compression for efficiency

## 📊 **Example Usage**

### **Quote Generation with Utils**
```typescript
// Sanitize input
const cleanInput = sanitizeInput(userMessage);

// Check business hours
if (!isBusinessHours()) {
  return getOutOfHoursMessage();
}

// Generate quote
const quote = calculateQuote(items);
if (validateQuote(quote)) {
  const message = formatQuoteMessage(quote, items, true);
  await sendMessage(phone, message);
  await logConversation(phone, message, 'outbound');
}
```

### **Booking Flow with Utils**
```typescript
// Format phone numbers
const whatsappPhone = formatWhatsAppPhone(customerPhone);

// Validate postcode
if (postcode && !validateUKPostcode(postcode)) {
  return "Please provide a valid UK postcode";
}

// Generate references
const bookingRef = generateBookingReference();
const jobRef = generateJobReference();
```

The system is now fully integrated with comprehensive utility functions for production use! 🎉✨
