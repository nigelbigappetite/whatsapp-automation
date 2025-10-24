import "dotenv/config";
import express from "express";
import { log, logErr } from "./utils/logger";
import enhancedWebhook from "./routes/enhancedWebhook";
import { supabase } from "./config/supabaseClient";

const app = express();
app.use(express.json({ limit: "5mb" }));

// Serve static files from public directory
app.use(express.static("public"));

// CORS for Railway deployment
app.use((req: any, res: any, next: any) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.get("/", (_req: any, res: any) => res.sendFile("index.html", { root: "public" }));
app.get("/health", (_req: any, res: any) => res.json({ 
  status: "ok", 
  environment: process.env.NODE_ENV,
  railway: true,
  timestamp: new Date().toISOString()
}));

// API endpoint to fetch conversations for dashboard
app.get("/api/conversations", async (_req: any, res: any) => {
  try {
    const { data: messages, error } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      logErr('Error fetching messages:', error);
      return res.status(500).json({ error: 'Failed to fetch conversations' });
    }

    // Group messages by phone number to create conversations
    const conversationsMap = new Map();
    
    messages?.forEach((msg: any) => {
      const phone = msg.actor_phone;
      if (!phone) return; // Skip messages without phone number
      
      if (!conversationsMap.has(phone)) {
        // Clean phone number for display
        const cleanPhone = phone.replace('@c.us', '').replace('@g.us', '');
        const displayName = cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`;
        
        conversationsMap.set(phone, {
          id: phone,
          name: displayName,
          phone: phone,
          lastMessage: msg.message || 'No message',
          time: new Date(msg.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          status: 'offline',
          unread: 0,
          online: false,
          messages: []
        });
      }
      
      const conversation = conversationsMap.get(phone);
      conversation.messages.push({
        type: msg.direction === 'inbound' ? 'incoming' : 'outgoing',
        content: msg.message,
        time: new Date(msg.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        created_at: msg.created_at
      });
      
      // Update last message and time
      if (new Date(msg.created_at) > new Date(conversation.messages[0]?.created_at || 0)) {
        conversation.lastMessage = msg.message;
        conversation.time = new Date(msg.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      }
    });

    const conversations = Array.from(conversationsMap.values());
    res.json({ conversations });
  } catch (error) {
    logErr('Error in conversations API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoint to store outgoing messages
app.post("/api/store-outgoing-message", async (req: any, res: any) => {
  try {
    const { session, to, body, type } = req.body;
    
    if (!to || !body) {
      return res.status(400).json({ error: 'Phone number and message body are required' });
    }

    // Store outgoing message in database
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .insert({
        brand_id: process.env.SUPABASE_BRAND_ID,
        session_name: session,
        actor_phone: to,
        direction: 'outbound',
        message: body,
        message_type: type || 'text',
        created_at: new Date().toISOString()
      });

    if (error) {
      logErr('Error storing outgoing message:', error);
      return res.status(500).json({ error: 'Failed to store outgoing message' });
    }

    log('✅ Outgoing message stored in database');
    res.json({ success: true, message: 'Outgoing message stored' });
  } catch (error) {
    logErr('Error in store-outgoing-message API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Use enhanced webhook with booking CRM integration
app.use("/", enhancedWebhook);

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  log(`🚀 Railway CRM Server running on port ${PORT}`);
  log(`🌐 Environment: ${process.env.NODE_ENV}`);
  log(`📡 Health check: http://localhost:${PORT}/health`);
});
