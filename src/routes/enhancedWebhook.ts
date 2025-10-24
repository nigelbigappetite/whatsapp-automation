import express from "express";
import { log, logErr } from "../utils/logger.js";
import { BookingCRM } from "../services/bookingCRM.js";
import { supabase } from "../config/supabaseClient.js";

const router = express.Router();

// Store incoming message in database
async function storeIncomingMessage(session: string, from: string, body: string, type: string) {
  try {
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .insert({
        brand_id: process.env.SUPABASE_BRAND_ID,
        session_name: session,
        actor_phone: from,
        direction: 'inbound',
        message: body,
        message_type: type,
        created_at: new Date().toISOString()
      });
      
    if (error) {
      logErr('❌ Error storing incoming message:', error);
    } else {
      log('✅ Incoming message stored in database');
    }
  } catch (error) {
    logErr('❌ Error storing incoming message:', error);
  }
}

// Enhanced webhook with booking CRM integration
router.post("/whatsapp/webhook", async (req: any, res: any) => {
  try {
    // Verify secret
    const hdr = req.headers["x-webhook-secret"];
    if (process.env.WEBHOOK_SECRET && hdr !== process.env.WEBHOOK_SECRET) {
      return res.status(401).json({ error: "unauthorized" });
    }

    const { session, from, body, type } = req.body;
    
          log('📨 Received WhatsApp message:', { from, body: body?.substring(0, 50), type });
          
          // Store incoming message in database (without automated responses for now)
          await storeIncomingMessage(session, from, body, type);
          
          log('✅ Message stored in database (automation disabled)');
          
          res.json({ 
            ok: true, 
            message: "Message stored in database",
            automation: "disabled"
          });
  } catch (e: any) {
    console.error("❌ Webhook error:", e);
    logErr("webhook error", e?.message);
    res.status(500).json({ error: e?.message || "Internal server error" });
  }
});

export default router;